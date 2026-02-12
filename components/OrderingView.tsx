import React, { useState } from 'react';
import { MenuCategory, MenuItem, CartItem, Order } from '../types';
import { Plus, Minus, ShoppingBag, X, Check, Star, MessageCircle, Mail } from 'lucide-react';

interface OrderingViewProps {
  menu: MenuCategory[];
  onPlaceOrder: (items: CartItem[], customerName: string, tableNumber: string, contactLineId: string, contactEmail: string) => void;
}

export const OrderingView: React.FC<OrderingViewProps> = ({ menu, onPlaceOrder }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>(menu[0]?.name || '');
  
  // Checkout Form State
  const [showCheckout, setShowCheckout] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [lineId, setLineId] = useState('');
  const [email, setEmail] = useState('');

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prev => prev.reduce((acc, item) => {
      if (item.id === itemId) {
        if (item.quantity > 1) {
          acc.push({ ...item, quantity: item.quantity - 1 });
        }
      } else {
        acc.push(item);
      }
      return acc;
    }, [] as CartItem[]));
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    
    onPlaceOrder(cart, customerName, tableNumber, lineId, email);
    setCart([]);
    setShowCheckout(false);
    setIsCartOpen(false);
  };

  if (showCheckout) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col h-full overflow-y-auto">
        <div className="p-4 border-b flex items-center bg-orange-500 text-white sticky top-0">
          <button onClick={() => setShowCheckout(false)} className="p-2 mr-2">
            <X size={24} />
          </button>
          <h2 className="text-xl font-bold">結帳確認</h2>
        </div>
        
        <form onSubmit={handleSubmitOrder} className="p-6 space-y-6 flex-1">
          <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 mb-6">
            <h3 className="font-bold text-lg mb-2 text-orange-800">訂單摘要</h3>
            <ul className="space-y-2 mb-4">
              {cart.map(item => (
                <li key={item.id} className="flex justify-between text-sm text-gray-700">
                  <span>{item.name} x {item.quantity}</span>
                  <span className="font-medium">${item.price * item.quantity}</span>
                </li>
              ))}
            </ul>
            <div className="border-t border-orange-200 pt-2 flex justify-between font-bold text-lg text-orange-900">
              <span>總金額</span>
              <span>${totalAmount}</span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">桌號 / Table No.</label>
              <input 
                required
                type="text" 
                value={tableNumber}
                onChange={e => setTableNumber(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                placeholder="例如: A1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">您的稱呼</label>
              <input 
                required
                type="text" 
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                placeholder="王小明"
              />
            </div>
            
            <div className="pt-4 border-t border-gray-100">
              <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
                接收訂單通知
              </h4>
              
              <div className="space-y-3">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MessageCircle size={18} className="text-green-500" />
                  </div>
                  <input 
                    type="text" 
                    value={lineId}
                    onChange={e => setLineId(e.target.value)}
                    className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                    placeholder="Line ID (選填)"
                  />
                </div>
                
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={18} className="text-blue-500" />
                  </div>
                  <input 
                    type="email" 
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Email (選填)"
                  />
                </div>
                <p className="text-xs text-gray-500">
                  * 我們會將訂單明細與結帳資訊發送至您的 Line 或 Email。
                </p>
              </div>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-orange-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:bg-orange-700 active:scale-95 transition-all mt-8"
          >
            確認下單 (${totalAmount})
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] overflow-hidden bg-gray-50">
      {/* Category Tabs */}
      <div className="bg-white shadow-sm z-10 overflow-x-auto whitespace-nowrap p-2 no-scrollbar">
        <div className="flex space-x-2">
          {menu.map(category => (
            <button
              key={category.name}
              onClick={() => setActiveCategory(category.name)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === category.name 
                  ? 'bg-orange-500 text-white shadow-md' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Menu List */}
      <div className="flex-1 overflow-y-auto p-4 pb-24">
        {menu.map(category => (
          <div 
            key={category.name} 
            className={`mb-8 ${activeCategory === category.name ? 'block' : 'hidden'}`}
          >
            <h2 className="text-xl font-bold text-gray-800 mb-4 pl-2 border-l-4 border-orange-500">
              {category.name}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {category.items.map(item => {
                const cartQty = cart.find(c => c.id === item.id)?.quantity || 0;
                return (
                  <div key={item.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between h-full">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg text-gray-800 line-clamp-2">{item.name}</h3>
                        <span className="font-bold text-orange-600">${item.price}</span>
                      </div>
                      {item.description && (
                        <p className="text-gray-500 text-sm mb-3 line-clamp-2">{item.description}</p>
                      )}
                      {item.recommended && (
                        <div className="inline-flex items-center text-xs font-medium text-yellow-600 bg-yellow-50 px-2 py-1 rounded-md mb-3">
                          <Star size={12} className="mr-1 fill-yellow-500" />
                          店長推薦
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-end mt-2">
                      {cartQty > 0 ? (
                        <div className="flex items-center bg-gray-100 rounded-lg p-1">
                          <button 
                            onClick={() => removeFromCart(item.id)}
                            className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm text-gray-600 active:scale-90 transition-transform"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="w-8 text-center font-bold text-gray-800">{cartQty}</span>
                          <button 
                            onClick={() => addToCart(item)}
                            className="w-8 h-8 flex items-center justify-center bg-orange-500 rounded-md shadow-sm text-white active:scale-90 transition-transform"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => addToCart(item)}
                          className="w-full py-2 bg-orange-50 text-orange-600 font-bold rounded-lg hover:bg-orange-100 transition-colors flex items-center justify-center gap-2"
                        >
                          <Plus size={18} />
                          加入
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Floating Cart Button */}
      {cart.length > 0 && (
        <div className="fixed bottom-6 left-0 right-0 px-6 z-40 max-w-4xl mx-auto">
          <button 
            onClick={() => setIsCartOpen(true)}
            className="w-full bg-gray-900 text-white p-4 rounded-2xl shadow-xl flex items-center justify-between hover:bg-black transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="bg-orange-500 w-10 h-10 rounded-full flex items-center justify-center font-bold">
                {totalItems}
              </div>
              <span className="font-bold text-lg">查看購物車</span>
            </div>
            <span className="font-bold text-xl">${totalAmount}</span>
          </button>
        </div>
      )}

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center pointer-events-none">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm pointer-events-auto" onClick={() => setIsCartOpen(false)}></div>
          <div className="bg-white w-full sm:max-w-md h-[85vh] sm:h-auto sm:rounded-2xl rounded-t-2xl shadow-2xl flex flex-col pointer-events-auto transition-transform transform translate-y-0">
            <div className="p-4 border-b flex items-center justify-between bg-gray-50 rounded-t-2xl">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <ShoppingBag className="text-orange-500" />
                購物車
              </h3>
              <button onClick={() => setIsCartOpen(false)} className="p-2 hover:bg-gray-200 rounded-full">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between items-center bg-white border-b border-gray-100 pb-4">
                  <div>
                    <h4 className="font-bold text-gray-800">{item.name}</h4>
                    <p className="text-orange-600 font-medium">${item.price}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => removeFromCart(item.id)} className="w-8 h-8 rounded-full border flex items-center justify-center text-gray-600 hover:bg-gray-50">
                      <Minus size={14} />
                    </button>
                    <span className="font-bold w-4 text-center">{item.quantity}</span>
                    <button onClick={() => addToCart(item)} className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600">
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-gray-50 border-t rounded-b-2xl">
              <div className="flex justify-between mb-4 text-xl font-bold text-gray-900">
                <span>總計</span>
                <span>${totalAmount}</span>
              </div>
              <button 
                onClick={() => setShowCheckout(true)}
                className="w-full bg-orange-600 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-orange-700 transition-colors flex items-center justify-center gap-2"
              >
                前往結帳 <Check size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};