import React, { useState, useEffect, useRef } from 'react';
import type { Product } from '../types';
import { CloseIcon, PlusIcon, MinusIcon, ShoppingBagIcon } from './Icons';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

const ChevronLeftIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
);

const ChevronRightIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
);

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    if (product) {
      setQuantity(1);
      setCurrentImageIndex(0);
    }
  }, [product]);

  if (!product) {
    return null;
  }

  const handleQuantityChange = (amount: number) => {
    setQuantity(prev => Math.max(1, prev + amount));
  };

  const handleAddToCartClick = () => {
    onAddToCart(product, quantity);
    onClose();
  };
  
  const handleScroll = () => {
    if (scrollContainerRef.current) {
        const { scrollLeft, clientWidth } = scrollContainerRef.current;
        const newIndex = Math.round(scrollLeft / clientWidth);
        if (newIndex !== currentImageIndex) {
            setCurrentImageIndex(newIndex);
        }
    }
  };

  const scrollToImage = (index: number) => {
      if (scrollContainerRef.current) {
          const { clientWidth } = scrollContainerRef.current;
          scrollContainerRef.current.scrollTo({
              left: clientWidth * index,
              behavior: 'smooth'
          });
          setCurrentImageIndex(index);
      }
  };

  const goToPrev = () => {
    const newIndex = currentImageIndex > 0 ? currentImageIndex - 1 : product.imageUrls.length - 1;
    scrollToImage(newIndex);
  };
  
  const goToNext = () => {
    const newIndex = currentImageIndex < product.imageUrls.length - 1 ? currentImageIndex + 1 : 0;
    scrollToImage(newIndex);
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 z-[99] flex justify-center items-center p-4 transition-opacity duration-300"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="product-detail-heading"
    >
      <div
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col md:flex-row overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-slate-500 hover:text-slate-900 z-30 bg-white/50 rounded-full p-1"
          aria-label="Fechar modal"
        >
          <CloseIcon />
        </button>
        
        <div className="w-full md:w-1/2 bg-slate-100 relative group">
          <div 
            ref={scrollContainerRef}
            onScroll={handleScroll}
            className="w-full h-64 md:h-full flex overflow-x-auto snap-x snap-mandatory scroll-smooth"
          >
            {product.imageUrls.map((url, index) => (
                <img
                    key={index}
                    src={url}
                    alt={`${product.name} - imagem ${index + 1}`}
                    className="w-full h-full object-cover flex-shrink-0 snap-center"
                    loading={index === 0 ? 'eager' : 'lazy'}
                />
            ))}
          </div>

          {product.imageUrls.length > 1 && (
            <>
                <button
                    onClick={goToPrev}
                    className="absolute top-1/2 left-2 -translate-y-1/2 bg-white/60 text-slate-800 rounded-full p-2 hover:bg-white transition opacity-0 group-hover:opacity-100 focus:opacity-100"
                    aria-label="Imagem anterior"
                >
                    <ChevronLeftIcon/>
                </button>
                <button
                    onClick={goToNext}
                    className="absolute top-1/2 right-2 -translate-y-1/2 bg-white/60 text-slate-800 rounded-full p-2 hover:bg-white transition opacity-0 group-hover:opacity-100 focus:opacity-100"
                    aria-label="Próxima imagem"
                >
                    <ChevronRightIcon/>
                </button>
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                    {product.imageUrls.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => scrollToImage(index)}
                            className={`w-2 h-2 rounded-full transition-colors ${currentImageIndex === index ? 'bg-white' : 'bg-white/50 hover:bg-white/75'}`}
                            aria-label={`Ir para imagem ${index + 1}`}
                        />
                    ))}
                </div>
            </>
          )}

        </div>
        
        <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col overflow-y-auto">
          <div>
            <span className="text-sm font-semibold text-pink-500 uppercase tracking-wider">{product.subcategory}</span>
            <h2 id="product-detail-heading" className="text-3xl md:text-4xl font-serif font-bold text-slate-900 mt-2">{product.name}</h2>
            <p className="text-3xl font-bold text-slate-800 mt-4">{product.price}</p>
          </div>
          
          <div className="mt-6 text-slate-600 space-y-4 flex-grow border-t pt-6">
            <p>{product.description || 'Nenhuma descrição disponível para este produto.'}</p>
          </div>
          
          <div className="mt-8 pt-6 border-t">
            <div className="flex items-center gap-6 mb-6">
              <label htmlFor="quantity" className="font-semibold text-slate-700">Quantidade:</label>
              <div className="flex items-center border border-gray-300 rounded-md">
                <button onClick={() => handleQuantityChange(-1)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-l-md" aria-label="Diminuir quantidade"><MinusIcon /></button>
                <span id="quantity" className="px-5 py-1 text-lg font-semibold w-16 text-center">{quantity}</span>
                <button onClick={() => handleQuantityChange(1)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-r-md" aria-label="Aumentar quantidade"><PlusIcon /></button>
              </div>
            </div>
            
            <button
              onClick={handleAddToCartClick}
              className="w-full bg-pink-500 text-white py-3 rounded-lg font-semibold hover:bg-pink-600 transition-colors flex items-center justify-center gap-2 text-lg"
            >
              <ShoppingBagIcon />
              Adicionar ao Carrinho
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailModal;
