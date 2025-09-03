import React, { useState, useEffect } from 'react';
import type { Product } from '../types';
import { CloseIcon } from './Icons';
import { SUBCATEGORIES } from '../constants';

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Omit<Product, 'id'> | Product) => void;
  product: Product | null;
}

const ProductFormModal: React.FC<ProductFormModalProps> = ({ isOpen, onClose, onSave, product }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    imageUrl: '',
    category: 'Mulher' as 'Mulher' | 'Homem',
    subcategory: '',
  });
  const [priceError, setPriceError] = useState('');
  const [imageError, setImageError] = useState('');

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        price: product.price,
        imageUrl: product.imageUrl,
        category: product.category,
        subcategory: product.subcategory,
      });
    } else {
      const defaultCategory = 'Mulher';
      const defaultSubcategory = SUBCATEGORIES[defaultCategory][0] || '';
      setFormData({
        name: '',
        price: '',
        imageUrl: '',
        category: defaultCategory,
        subcategory: defaultSubcategory,
      });
    }
    setPriceError('');
    setImageError('');
  }, [product, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'category') {
      const newCategory = value as 'Mulher' | 'Homem';
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
        setImageError('');
      };
      reader.onerror = () => {
        setImageError('Não foi possível ler o arquivo de imagem.');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const priceRegex = /^R\$\s\d{1,3}(\.\d{3})*,\d{2}$/;
    if (!priceRegex.test(formData.price)) {
      setPriceError('Formato inválido. Use "R$ 99,90" ou "R$ 1.234,56".');
      return;
    }
    setPriceError('');
    
    if (!formData.imageUrl) {
      setImageError('Por favor, selecione uma imagem para o produto.');
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
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800" aria-label="Fechar modal">
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
            <label className="block text-sm font-medium text-gray-700">Imagem do Produto</label>
            <div className="mt-1 flex items-center gap-4">
              <div className="w-24 h-24 rounded-md bg-gray-100 flex items-center justify-center overflow-hidden border">
                {formData.imageUrl ? (
                  <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs text-gray-500 text-center">Sem Imagem</span>
                )}
              </div>
              <input
                type="file"
                name="imageUpload"
                id="imageUpload"
                className="hidden"
                accept="image/png, image/jpeg, image/webp, image/gif"
                onChange={handleImageChange}
              />
              <label
                htmlFor="imageUpload"
                className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500"
              >
                {formData.imageUrl ? 'Trocar Imagem' : 'Selecionar Imagem'}
              </label>
            </div>
            {imageError && <p id="image-error" className="mt-1 text-sm text-red-600">{imageError}</p>}
          </div>
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">Categoria</label>
            <select name="category" id="category" value={formData.category} onChange={handleChange} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500">
              <option value="Mulher">Mulher</option>
              <option value="Homem">Homem</option>
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