import React from 'react';
import { INSTAGRAM_LINK, LOCATION_LINK, WHATSAPP_LINK, LOGO_BASE64 } from '../constants';
import { InstagramIcon, LocationIcon, WhatsAppIcon, CartIcon, BellIcon } from './Icons';

interface HeaderProps {
    cartItemCount: number;
    onCartClick: () => void;
    newProductCount: number;
    onNotificationClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ cartItemCount, onCartClick, newProductCount, onNotificationClick }) => {
  return (
    <header className="bg-white/80 backdrop-blur-lg shadow-sm sticky top-0 z-50 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex-shrink-0">
            <a href="/" aria-label="Página Inicial da JS Store">
              <img className="h-16 w-auto" src={LOGO_BASE64} alt="JS Store Logo" />
            </a>
          </div>

          <div className="flex items-center space-x-5">
            <a 
              href={WHATSAPP_LINK} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-gray-500 hover:text-green-500 transition-colors duration-300"
              aria-label="WhatsApp"
            >
              <WhatsAppIcon />
            </a>
            <a 
              href={INSTAGRAM_LINK} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-gray-500 hover:text-pink-600 transition-colors duration-300"
              aria-label="Instagram"
            >
              <InstagramIcon />
            </a>
            <a 
              href={LOCATION_LINK} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-gray-500 hover:text-blue-500 transition-colors duration-300"
              aria-label="Localização"
            >
              <LocationIcon />
            </a>
            {newProductCount > 0 && (
              <button
                onClick={onNotificationClick}
                className="relative text-gray-500 hover:text-pink-500 transition-colors duration-300"
                aria-label={`Ver ${newProductCount} novos produtos`}
              >
                <BellIcon />
                <span className="absolute -top-1 -right-1 flex items-center justify-center h-4 w-4 bg-red-500 text-white text-[10px] font-bold rounded-full">
                  {newProductCount}
                </span>
              </button>
            )}
             <button
              onClick={onCartClick}
              className="relative text-gray-500 hover:text-pink-500 transition-colors duration-300"
              aria-label={`Ver carrinho com ${cartItemCount} itens`}
            >
              <CartIcon />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 flex items-center justify-center h-5 w-5 bg-pink-500 text-white text-xs font-bold rounded-full">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};