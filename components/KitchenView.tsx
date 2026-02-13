import React from 'react';
import { Order, OrderStatus } from '../types';
import { Clock, CheckCircle2, ChefHat, Timer } from 'lucide-react';

interface KitchenViewProps {
  orders: Order[];
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
}

export const KitchenView: React.FC<KitchenViewProps> = ({ orders, onUpdateStatus }) => {
  // Only show orders that are Paid (Ready to cook), Cooking, or Completed. Hide Served or Pending (Unpaid).
  const activeOrders = orders.filter(o => 
    o.status !== OrderStatus.PENDING && o.status !== OrderStatus.SERVED
  ).sort((a, b) => a.timestamp - b.timestamp);
  
  const getStatusColor = (status: OrderStatus) => {
    switch(status) {
      case OrderStatus.PAID: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case OrderStatus.COOKING: return 'bg-orange-100 text-orange-800 border-orange-200';
      case OrderStatus.COMPLETED: return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100';
    }
  };

  const getNextStatus = (current: OrderStatus): OrderStatus | null => {
    if (current === OrderStatus.PAID) return OrderStatus.COOKING;
    if (current === OrderStatus.COOKING) return OrderStatus.COMPLETED;
    if (current === OrderStatus.COMPLETED) return OrderStatus.SERVED;
    return null;
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <ChefHat className="text-orange-600" size={36} />
          廚房顯示系統 (KDS)
        </h1>
        <div className="bg-white px-4 py-2 rounded-lg shadow-sm font-medium text-gray-600">
          待製作/製作中: <span className="text-orange-600 font-bold text-xl ml-2">{activeOrders.length}</span>
        </div>
      </div>

      {activeOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-96 text-gray-400">
          <CheckCircle2 size={64} className="mb-4 opacity-50" />
          <p className="text-xl">目前沒有待製作的訂單</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {activeOrders.map(order => (
            <div key={order.id} className={`bg-white rounded-xl shadow-md border-t-8 flex flex-col ${
              order.status === OrderStatus.PAID ? 'border-yellow-400' : 
              order.status === OrderStatus.COOKING ? 'border-orange-500' : 'border-green-500'
            }`}>
              <div className="p-4 border-b border-gray-100 flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-xl text-gray-900">桌號: {order.tableNumber}</h3>
                  <p className="text-sm text-gray-500">單號: #{order.id.slice(-4)}</p>
                </div>
                <div className="flex flex-col items-end">
                  <div className="flex items-center text-gray-500 text-sm font-mono mb-1">
                    <Clock size={14} className="mr-1" />
                    {formatTime(order.timestamp)}
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-bold border ${getStatusColor(order.status)}`}>
                    {order.status === OrderStatus.PAID ? '已結帳/待製作' : 
                     order.status === OrderStatus.COOKING ? '製作中' : '已完成'}
                  </span>
                </div>
              </div>

              <div className="p-4 flex-1">
                <ul className="space-y-3">
                  {order.items.map((item, idx) => (
                    <li key={idx} className="flex justify-between items-center text-gray-800">
                      <span className="font-medium text-lg">{item.name}</span>
                      <span className="font-bold bg-gray-100 px-2 py-1 rounded-md text-gray-700">x{item.quantity}</span>
                    </li>
                  ))}
                </ul>
                {(order.contactLineId || order.contactEmail) && (
                   <div className="mt-4 pt-3 border-t border-dashed border-gray-200 text-xs text-gray-400">
                     <p>通知: {order.contactLineId ? `Line` : ''} {order.contactEmail ? `Email` : ''}</p>
                   </div>
                )}
              </div>

              <div className="p-4 bg-gray-50 rounded-b-xl border-t border-gray-100">
                {order.status !== OrderStatus.SERVED && (
                  <button 
                    onClick={() => {
                      const next = getNextStatus(order.status);
                      if (next) onUpdateStatus(order.id, next);
                    }}
                    className={`w-full py-3 rounded-lg font-bold text-white shadow transition-all active:scale-95 flex items-center justify-center gap-2 ${
                      order.status === OrderStatus.PAID ? 'bg-orange-500 hover:bg-orange-600' :
                      order.status === OrderStatus.COOKING ? 'bg-green-600 hover:bg-green-700' :
                      'bg-gray-700 hover:bg-gray-800'
                    }`}
                  >
                    {order.status === OrderStatus.PAID && <><ChefHat size={18}/> 開始製作</>}
                    {order.status === OrderStatus.COOKING && <><CheckCircle2 size={18}/> 製作完成</>}
                    {order.status === OrderStatus.COMPLETED && '已出餐'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};