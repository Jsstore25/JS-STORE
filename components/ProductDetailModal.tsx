import React, { useState, useEffect } from 'react';
import type { Product } from '../types';
import { CloseIcon, PlusIcon, MinusIcon, ShoppingBagIcon } from './Icons';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose, onAddToCart }) => {
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (product) {
      setQuantity(1);
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
          className="absolute top-3 right-3 text-slate-500 hover:text-slate-900 z-10 bg-white/50 rounded-full p-1"
          aria-label="Fechar modal"
        >
          <CloseIcon />
        </button>
        
        <div className="w-full md:w-1/2 bg-slate-100">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-full h-64 md:h-full object-cover"
            loading="lazy"
          />
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
