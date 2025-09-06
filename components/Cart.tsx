import React, { useMemo, useState, useEffect } from 'react';
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
  const [cep, setCep] = useState('');
  const [shippingCost, setShippingCost] = useState<number | null>(null);
  const [cepError, setCepError] = useState('');

  const isDropshippingOnly = useMemo(() => 
    cartItems.length > 0 && cartItems.every(item => item.subcategory === 'Calçados'),
    [cartItems]
  );
  
  useEffect(() => {
    if (cartItems.length === 0) {
      setShippingCost(null);
      setCep('');
      setCepError('');
      return;
    }

    if (isDropshippingOnly) {
      setShippingCost(35.00);
      setCep('');
      setCepError('');
    } else {
      // Se a composição do carrinho muda, reseta o frete para ser recalculado
      setShippingCost(null);
    }
  }, [isDropshippingOnly, cartItems]);

  const subtotal = useMemo(() => {
    return cartItems.reduce((total, item) => total + parsePrice(item.price) * item.quantity, 0);
  }, [cartItems]);

  const totalPrice = useMemo(() => {
    return subtotal + (shippingCost || 0);
  }, [subtotal, shippingCost]);

  const formattedSubtotal = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(subtotal);
  const formattedTotalPrice = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalPrice);
  const formattedShippingCost = shippingCost !== null ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(shippingCost) : '';

  const handleCalculateShipping = () => {
    const cleanedCep = cep.replace(/\D/g, '');
    if (cleanedCep.length !== 8) {
      setCepError('CEP inválido. Digite 8 números.');
      setShippingCost(null);
      return;
    }
    setCepError('');
    // SIMULAÇÃO DE CÁLCULO DE FRETE
    // Lê o valor do frete padrão definido pelo admin.
    const savedShippingCost = localStorage.getItem('standardShippingCost');
    const standardShippingCost = savedShippingCost ? parseFloat(savedShippingCost) : 40.00; // Fallback para 40.00
    setShippingCost(standardShippingCost);
  };
  
  const checkoutMessage = useMemo(() => {
    const header = "Olá! Gostaria de fazer um pedido:\n\n";
    const items = cartItems.map(item => {
        const itemSubtotal = parsePrice(item.price) * item.quantity;
        const formattedItemSubtotal = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(itemSubtotal);
        return `- ${item.quantity}x ${item.name} (${item.price} cada) - Subtotal: ${formattedItemSubtotal}`;
    }).join('\n');
    
    const footer = `\n\nSubtotal: ${formattedSubtotal}`;
    const shippingLine = shippingCost !== null ? `\nFrete: ${formattedShippingCost}` : '';
    const totalLine = `\n\n*Total (com frete): ${formattedTotalPrice}*`;

    return encodeURIComponent(header + items + footer + shippingLine + totalLine);
  }, [cartItems, formattedSubtotal, formattedShippingCost, formattedTotalPrice, shippingCost]);

  const whatsappCheckoutLink = `${WHATSAPP_LINK.split('?')[0]}?text=${checkoutMessage}`;

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
                    <img src={item.imageurls[0]} alt={item.name} loading="lazy" className="w-24 h-28 object-cover rounded-md" />
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
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-center">
                      <span className="text-md text-slate-600">Subtotal:</span>
                      <span className="text-md font-semibold text-slate-800">{formattedSubtotal}</span>
                  </div>
                  
                  <div className="pt-2 border-t">
                    {isDropshippingOnly ? (
                       <div className="flex justify-between items-center">
                         <span className="text-md text-slate-600">Frete Fixo (Dropshipping):</span>
                         <span className="text-md font-semibold text-slate-800">{formattedShippingCost}</span>
                       </div>
                    ) : (
                      <>
                        <div className="flex gap-2 items-start">
                           <input 
                            type="text" 
                            placeholder="Digite seu CEP" 
                            value={cep}
                            onChange={(e) => setCep(e.target.value)}
                            maxLength={9}
                            className="w-full p-2 bg-white border border-gray-300 rounded-md text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-pink-400"
                          />
                          <button onClick={handleCalculateShipping} className="bg-slate-200 text-slate-700 px-4 py-2 rounded-md hover:bg-slate-300 text-sm font-semibold whitespace-nowrap">Calcular</button>
                        </div>
                         {cepError && <p className="text-sm text-red-600 mt-1">{cepError}</p>}
                         {shippingCost !== null && !isDropshippingOnly && (
                           <div className="flex justify-between items-center mt-2">
                            <span className="text-md text-slate-600">Frete:</span>
                            <span className="text-md font-semibold text-slate-800">{formattedShippingCost}</span>
                          </div>
                         )}
                      </>
                    )}
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t">
                      <span className="text-lg font-bold text-slate-700">Total:</span>
                      <span className="text-2xl font-bold text-pink-500">{formattedTotalPrice}</span>
                  </div>
                </div>

                <a 
                  href={whatsappCheckoutLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`w-full text-center py-3 rounded-lg font-semibold transition-colors block ${shippingCost === null ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-green-500 text-white hover:bg-green-600'}`}
                  onClick={(e) => { if (shippingCost === null) e.preventDefault(); }}
                  aria-disabled={shippingCost === null}
                >
                  {shippingCost === null ? 'Calcule o frete para continuar' : 'Finalizar Compra via WhatsApp'}
                </a>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};