import React from 'react';
import { Order, OrderStatus } from '../types';
import { DollarSign, Clock, CreditCard, CheckCircle2 } from 'lucide-react';

interface CashierViewProps {
  orders: Order[];
  onConfirmPayment: (orderId: string) => void;
}

export const CashierView: React.FC<CashierViewProps> = ({ orders, onConfirmPayment }) => {
  // Only show PENDING orders
  const pendingOrders = orders.filter(o => o.status === OrderStatus.PENDING).sort((a, b) => a.timestamp - b.timestamp);

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <CreditCard className="text-blue-600" size={36} />
          結帳櫃檯
        </h1>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm font-medium text-gray-600">
          待結帳訂單: <span className="text-blue-600 font-bold text-xl ml-2">{pendingOrders.length}</span>
        </div>
      </div>

      {pendingOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-96 text-gray-400">
          <CheckCircle2 size={64} className="mb-4 opacity-50" />
          <p className="text-xl">目前沒有待結帳的訂單</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pendingOrders.map(order => (
            <div key={order.id} className="bg-white rounded-xl shadow-md border-t-8 border-blue-500 flex flex-col">
              <div className="p-4 border-b border-gray-100 flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-2xl text-gray-900">桌號: {order.tableNumber}</h3>
                  <p className="text-sm text-gray-500">單號: #{order.id.slice(-4)}</p>
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-center text-gray-500 text-sm font-mono mb-1">
                    <Clock size={14} className="mr-1" />
                    {formatTime(order.timestamp)}
                  </div>
                  <span className="px-2 py-1 rounded text-xs font-bold border bg-blue-50 text-blue-800 border-blue-200">
                    等待結帳
                  </span>
                </div>
              </div>

              <div className="p-4 flex-1">
                <ul className="space-y-2 mb-4">
                  {order.items.map((item, idx) => (
                    <li key={idx} className="flex justify-between items-center text-gray-800">
                      <span className="font-medium">{item.name}</span>
                      <div className="flex items-center gap-2">
                         <span className="text-sm text-gray-400">x{item.quantity}</span>
                         <span className="font-medium">${item.price * item.quantity}</span>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                  <span className="text-gray-500 font-bold">總金額</span>
                  <span className="text-2xl font-bold text-orange-600">${order.totalAmount}</span>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-b-xl border-t border-gray-100">
                <button 
                  onClick={() => onConfirmPayment(order.id)}
                  className="w-full py-3 rounded-lg font-bold text-white shadow bg-blue-600 hover:bg-blue-700 transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <DollarSign size={20} />
                  確認收款 (送至廚房)
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};