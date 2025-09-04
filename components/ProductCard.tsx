import React from 'react';
import type { Product } from '../types';
import { ShoppingBagIcon } from './Icons';

interface ProductCardProps {
  product: Product;
  onViewDetails: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onViewDetails, onAddToCart }) => {
  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Impede que o modal de detalhes seja aberto
    onAddToCart(product);
  };
  
  return (
    <div
      className="bg-white rounded-lg shadow-md group flex flex-col justify-between transition-transform duration-300 ease-in-out hover:shadow-xl hover:-translate-y-1 text-left w-full cursor-pointer"
      onClick={() => onViewDetails(product)}
      aria-label={`Ver detalhes de ${product.name}`}
    >
      <div className="relative rounded-t-lg overflow-hidden bg-slate-100">
        <img
          src={product.imageUrls[0]}
          alt={product.name}
          loading="lazy"
          className="w-full h-72 object-contain transition-transform duration-500 ease-in-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-70 group-hover:opacity-100 transition-opacity duration-300"></div>
         <div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-in-out">
            <button
              onClick={handleAddToCartClick}
              className="w-full bg-white/90 text-slate-800 text-sm font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 backdrop-blur-sm hover:bg-white transition-colors"
              aria-label={`Adicionar ${product.name} ao carrinho`}
            >
              <ShoppingBagIcon />
              Adicionar ao Carrinho
            </button>
        </div>
      </div>
      <div className="p-4 flex-grow flex flex-col justify-between min-h-[110px]">
        <h3 className="text-md font-semibold text-slate-800">{product.name}</h3>
        <div className="flex justify-between items-center mt-2">
            <p className="text-lg font-bold text-pink-500">{product.price}</p>
        </div>
      </div>
    </div>
  );
};