import React, { useState, useEffect } from 'react';
import type { Product } from '../types';
import { CloseIcon, TrashIcon, SparklesIcon } from './Icons';
import { SUBCATEGORIES } from '../constants';
import { GoogleGenAI, Type } from '@google/genai';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Omit<Product, 'id'> | Product) => void;
  product: Product | null;
}

const resizeImage = (file: File, maxWidth: number, maxHeight: number, quality: number): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            if (!event.target?.result) {
                return reject(new Error("FileReader did not load the file correctly."));
            }
            const img = new Image();
            img.src = event.target.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let { width, height } = img;

                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    return reject(new Error('Could not get canvas context'));
                }
                ctx.drawImage(img, 0, 0, width, height);
                
                const dataUrl = canvas.toDataURL(file.type === 'image/png' ? 'image/png' : 'image/jpeg', quality);
                resolve(dataUrl);
            };
            img.onerror = (error) => reject(error);
        };
        reader.onerror = (error) => reject(error);
    });
};

const ProductFormModal: React.FC<ProductFormModalProps> = ({ isOpen, onClose, onSave, product }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    imageUrls: [] as string[],
    category: 'Feminino' as 'Feminino' | 'Masculino',
    subcategory: '',
    description: '',
  });
  const [priceError, setPriceError] = useState('');
  const [imageError, setImageError] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        price: product.price,
        imageUrls: product.imageUrls,
        category: product.category,
        subcategory: product.subcategory,
        description: product.description || '',
      });
    } else {
      const defaultCategory = 'Feminino';
      const defaultSubcategory = SUBCATEGORIES[defaultCategory][0] || '';
      setFormData({
        name: '',
        price: '',
        imageUrls: [],
        category: defaultCategory,
        subcategory: defaultSubcategory,
        description: '',
      });
    }
    setPriceError('');
    setImageError('');
    setIsAnalyzing(false);
  }, [product, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'category') {
      const newCategory = value as 'Feminino' | 'Masculino';
      const firstSubcategory = SUBCATEGORIES[newCategory][0] || '';
      setFormData(prev => ({ 
        ...prev, 
        category: newCategory, 
        subcategory: firstSubcategory 
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }

    if (name === 'price') {
      setPriceError('');
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setImageError('');
    setIsAnalyzing(true);
    
    const shouldRunAi = !formData.name && !formData.price && !formData.description;

    try {
        const fileArray = Array.from(files);

        // 1. Redimensiona todas as imagens selecionadas
        const resizePromises = fileArray.map(file => 
            resizeImage(file, 1024, 1024, 0.8)
        );
        const resizedImages = await Promise.all(resizePromises);
        
        // 2. Adiciona as imagens redimensionadas ao estado do formulário
        setFormData(prev => ({
            ...prev,
            imageUrls: [...prev.imageUrls, ...resizedImages]
        }));

        // 3. Executa a análise de IA na primeira imagem redimensionada, se for um novo produto
        if (shouldRunAi && resizedImages.length > 0) {
            const firstResizedImageDataUrl = resizedImages[0];
            const firstFile = fileArray[0]; // Usado para obter o MIME type original

            // Extrai os dados base64 da imagem já redimensionada
            const base64Data = firstResizedImageDataUrl.split(',')[1];

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const subcategoriesForPrompt = SUBCATEGORIES[formData.category].join(', ');

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: {
                    parts: [
                        { inlineData: { mimeType: firstFile.type, data: base64Data } },
                        { text: `Você é um assistente de e-commerce especialista. Analise a imagem do produto. Forneça detalhes em JSON, incluindo "name" (nome atrativo), "price" (preço em "R$ XXX,XX"), "description" (2-3 frases), e "subcategory" da lista: [${subcategoriesForPrompt}].` }
                    ]
                },
                config: {
                  responseMimeType: "application/json",
                  responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                      name: { type: Type.STRING, description: "Nome do produto." },
                      price: { type: Type.STRING, description: "Preço formatado como R$ XX,XX." },
                      description: { type: Type.STRING, description: "Descrição do produto." },
                      subcategory: { type: Type.STRING, description: "Subcategoria da lista fornecida." }
                    },
                    required: ['name', 'price', 'description', 'subcategory']
                  }
                }
            });

            const parsedData = JSON.parse(response.text);

            // 4. Atualiza o formulário com os dados da IA
            setFormData(prev => ({
                ...prev,
                name: parsedData.name || '',
                price: parsedData.price || '',
                description: parsedData.description || '',
                subcategory: SUBCATEGORIES[prev.category].includes(parsedData.subcategory) ? parsedData.subcategory : prev.subcategory,
            }));
        }

    } catch (error) {
        console.error("Error processing images:", error);
        setImageError('Não foi possível processar uma das imagens. Tente novamente.');
    } finally {
       setIsAnalyzing(false);
       if (e.target) {
         e.target.value = ''; // Reseta o input para poder selecionar os mesmos arquivos novamente
       }
    }
  };
  
  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
        ...prev,
        imageUrls: prev.imageUrls.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const priceRegex = /^R\$\s\d{1,3}(\.\d{3})*,\d{2}$/;
    if (!priceRegex.test(formData.price)) {
      setPriceError('Formato inválido. Use "R$ 99,90" ou "R$ 1.234,56".');
      return;
    }
    setPriceError('');
    
    if (formData.imageUrls.length === 0) {
      setImageError('Por favor, adicione pelo menos uma imagem para o produto.');
      return;
    }
    setImageError('');

    if (product) {
        onSave({ ...product, ...formData });
    } else {
        onSave(formData);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg relative max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
         {isAnalyzing && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col justify-center items-center z-20 rounded-lg">
                <SparklesIcon className="w-8 h-8 text-pink-500 animate-pulse" />
                <p className="mt-2 font-bold text-slate-700">Processando imagem...</p>
                <p className="text-sm text-slate-500">Aguarde, otimizando e preenchendo detalhes.</p>
            </div>
        )}
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 z-10" aria-label="Fechar modal">
          <CloseIcon />
        </button>
        <h2 className="text-xl font-bold mb-4">{product ? 'Editar Produto' : 'Adicionar Produto'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nome do Produto</label>
            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500" />
          </div>
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">Preço</label>
            <input 
                type="text" 
                name="price" 
                id="price" 
                value={formData.price} 
                onChange={handleChange} 
                required 
                placeholder="Ex: R$ 99,90"
                className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500 ${priceError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                aria-invalid={!!priceError}
                aria-describedby="price-error"
            />
            {priceError && <p id="price-error" className="mt-1 text-sm text-red-600">{priceError}</p>}
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Descrição</label>
            <textarea
                name="description"
                id="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Imagens do Produto</label>
             <div className="mt-2 grid grid-cols-3 sm:grid-cols-4 gap-4">
                {formData.imageUrls.map((url, index) => (
                    <div key={index} className="relative group">
                        <img src={url} alt={`Preview ${index + 1}`} className="w-full h-24 object-cover rounded-md border" />
                        <button 
                            type="button" 
                            onClick={() => handleRemoveImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label={`Remover imagem ${index + 1}`}
                        >
                            <TrashIcon />
                        </button>
                    </div>
                ))}
            </div>
            <div className="mt-4">
              <input
                type="file"
                name="imageUpload"
                id="imageUpload"
                className="hidden"
                accept="image/png, image/jpeg, image/webp, image/gif"
                onChange={handleImageChange}
                multiple
              />
              <label
                htmlFor="imageUpload"
                className="cursor-pointer bg-pink-50 text-pink-700 py-2 px-3 border border-pink-200 rounded-md shadow-sm text-sm leading-4 font-medium hover:bg-pink-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 inline-flex items-center gap-2"
              >
                 <SparklesIcon className="w-5 h-5"/>
                Adicionar Imagens (com IA)
              </label>
            </div>
            {imageError && <p id="image-error" className="mt-1 text-sm text-red-600">{imageError}</p>}
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">Categoria</label>
            <select name="category" id="category" value={formData.category} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500">
              <option value="Feminino">Feminino</option>
              <option value="Masculino">Masculino</option>
            </select>
          </div>
           <div>
            <label htmlFor="subcategory" className="block text-sm font-medium text-gray-700">Subcategoria</label>
            <select 
              name="subcategory" 
              id="subcategory" 
              value={formData.subcategory} 
              onChange={handleChange} 
              required 
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500"
            >
              {SUBCATEGORIES[formData.category].map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300">Cancelar</button>
            <button type="submit" className="bg-pink-600 text-white px-4 py-2 rounded-md hover:bg-pink-700">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductFormModal;