import React, { useMemo } from 'react';
import type { CartItem } from '../types';
import { WHATSAPP_LINK } from '../constants';
import { CloseIcon, PlusIcon, MinusIcon, TrashIcon } from './Icons';

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (productId: number, newQuantity: number) => void;
  onRemoveItem: (productId: number) => void;
}

const parsePrice = (priceStr: string): number => {
  if (typeof priceStr !== 'string') return 0;
  const numberStr = priceStr
    .replace('R$', '')
    .trim()
    .replace(/\./g, '')
    .replace(',', '.');
  const price = parseFloat(numberStr);
  return isNaN(price) ? 0 : price;
};

export const Cart: React.FC<CartProps> = ({ isOpen, onClose, cartItems, onUpdateQuantity, onRemoveItem }) => {
  const totalPrice = useMemo(() => {
    return cartItems.reduce((total, item) => total + parsePrice(item.price) * item.quantity, 0);
  }, [cartItems]);

  const formattedTotalPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(totalPrice);

  const checkoutMessage = useMemo(() => {
    const header = "Olá! Gostaria de fazer um pedido:\n\n";
    const items = cartItems.map(item => {
        const itemSubtotal = parsePrice(item.price) * item.quantity;
        const formattedItemSubtotal = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(itemSubtotal);
        return `- ${item.quantity}x ${item.name} (${item.price} cada) - Subtotal: ${formattedItemSubtotal}`;
    }).join('\n');
    const footer = `\n\n*Total: ${formattedTotalPrice}*`;
    return encodeURIComponent(header + items + footer);
  }, [cartItems, formattedTotalPrice]);

  const whatsappCheckoutLink = `${WHATSAPP_LINK}?text=${checkoutMessage}`;

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-[99] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      ></div>
      <aside 
        className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl z-[100] transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="cart-heading"
      >
        <div className="flex flex-col h-full">
          <div className="flex justify-between items-center p-5 border-b border-slate-200">
            <h2 id="cart-heading" className="text-xl font-bold text-slate-800">Seu Carrinho</h2>
            <button onClick={onClose} className="text-slate-500 hover:text-slate-800" aria-label="Fechar carrinho">
              <CloseIcon />
            </button>
          </div>
          
          {cartItems.length === 0 ? (
            <div className="flex-grow flex flex-col justify-center items-center text-center p-4">
              <p className="text-lg text-slate-600">Seu carrinho está vazio.</p>
              <p className="text-sm text-slate-400 mt-2">Adicione produtos para vê-los aqui.</p>
              <button onClick={onClose} className="mt-6 bg-pink-500 text-white py-2 px-6 rounded-lg font-semibold hover:bg-pink-600 transition-colors">
                Continuar Comprando
              </button>
            </div>
          ) : (
            <div className="flex-grow overflow-y-auto p-5 space-y-5">
              {cartItems.map(item => {
                const itemSubtotal = parsePrice(item.price) * item.quantity;
                const formattedItemSubtotal = new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(itemSubtotal);

                return (
                  <div key={item.id} className="flex items-start gap-4">
                    <img src={item.imageUrl} alt={item.name} loading="lazy" className="w-24 h-28 object-cover rounded-md" />
                    <div className="flex-grow">
                      <h3 className="font-semibold text-slate-800">{item.name}</h3>
                      <p className="text-pink-500 font-bold mt-1 text-lg">{formattedItemSubtotal}</p>
                      {item.quantity > 1 && (
                        <p className="text-sm text-slate-500 -mt-1">{item.price} cada</p>
                      )}
                      <div className="flex items-center mt-3">
                        <button onClick={() => onUpdateQuantity(item.id, item.quantity - 1)} className="p-1 border rounded-l-md text-slate-500 hover:bg-slate-100" aria-label="Diminuir quantidade"><MinusIcon /></button>
                        <span className="px-4 py-1 border-t border-b font-semibold">{item.quantity}</span>
                        <button onClick={() => onUpdateQuantity(item.id, item.quantity + 1)} className="p-1 border rounded-r-md text-slate-500 hover:bg-slate-100" aria-label="Aumentar quantidade"><PlusIcon /></button>
                      </div>
                    </div>
                    <button onClick={() => onRemoveItem(item.id)} className="text-slate-400 hover:text-red-500" aria-label={`Remover ${item.name} do carrinho`}>
                      <TrashIcon />
                    </button>
                  </div>
                )
              })}
            </div>
          )}

          {cartItems.length > 0 && (
            <div className="p-5 border-t border-slate-200 bg-slate-50">
                <div className="flex justify-between items-center mb-4">
                    <span className="text-lg font-semibold text-slate-700">Total:</span>
                    <span className="text-2xl font-bold text-pink-500">{formattedTotalPrice}</span>
                </div>
                <a 
                  href={whatsappCheckoutLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full text-center bg-green-500 text-white py-3 rounded-lg font-semibold hover:bg-green-600 transition-colors block"
                >
                  Finalizar Compra via WhatsApp
                </a>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
