import React, { useState } from 'react';
import { UploadView } from './components/UploadView';
import { OrderingView } from './components/OrderingView';
import { KitchenView } from './components/KitchenView';
import { SettingsView } from './components/SettingsView';
import { LoginView } from './components/LoginView';
import { CashierView } from './components/CashierView';
import { MenuCategory, CartItem, Order, OrderStatus, StoreSettings } from './types';
import { Utensils, Smartphone, CheckCheck, Settings, ChefHat, Store, User, ArrowLeft, RefreshCw, LogOut, ArrowRight, CreditCard } from 'lucide-react';

// App Modes
type AppMode = 'PORTAL' | 'CUSTOMER_APP' | 'BUSINESS_APP' | 'LOGIN';
type BusinessView = 'UPLOAD' | 'DASHBOARD_CASHIER' | 'DASHBOARD_KITCHEN' | 'DASHBOARD_SETTINGS';

function App() {
  // Global State
  const [appMode, setAppMode] = useState<AppMode>('PORTAL');
  const [businessView, setBusinessView] = useState<BusinessView>('UPLOAD');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const [menu, setMenu] = useState<MenuCategory[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [settings, setSettings] = useState<StoreSettings>({
    storeName: 'NoodleGenius 麵館',
    ownerEmail: '',
    googleSheetUrl: '',
    googleScriptUrl: '',
    lineToken: '',
    enableEmailNotify: false,
    enableSheetSync: false,
    enableLineNotify: false,
    username: 'Store',
    password: '12345678'
  });

  const [notification, setNotification] = useState<{message: string, type: 'success' | 'info'} | null>(null);
  const [isSimulatingSync, setIsSimulatingSync] = useState(false);

  const showNotification = (message: string, type: 'success' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // --- Handlers ---

  const handleMenuGenerated = (generatedMenu: MenuCategory[]) => {
    setMenu(generatedMenu);
    setBusinessView('DASHBOARD_SETTINGS'); // Go to settings first to check details or go to cashier
    showNotification("菜單生成成功！請前往設定頁面完善商店資訊。");
  };

  const handleUpdateMenu = (newMenu: MenuCategory[]) => {
    setMenu(newMenu);
    showNotification("菜單資料已更新！");
  };

  const handleReset = () => {
    setMenu([]);
    setOrders([]);
    setIsAuthenticated(false);
    setAppMode('PORTAL');
    setBusinessView('UPLOAD');
    showNotification("系統已重置", "info");
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAppMode('PORTAL');
    showNotification("已登出後台系統", "info");
  };

  const handlePlaceOrder = async (items: CartItem[], tableNumber: string) => {
    setIsSimulatingSync(true);
    
    // Create Order - Status is PENDING (Unpaid)
    const newOrder: Order = {
      id: Date.now().toString(),
      customerName: `Table ${tableNumber}`, 
      tableNumber,
      items,
      totalAmount: items.reduce((sum, item) => sum + item.price * item.quantity, 0),
      status: OrderStatus.PENDING,
      timestamp: Date.now(),
      syncedToSheet: false,
      sentEmail: false,
      sentLine: false
    };

    // Note: We don't sync to external services yet? 
    // Usually sync happens after payment, but here we sync order creation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // For now, let's sync creation so owner knows there is a pending order
    if (settings.enableSheetSync && settings.googleScriptUrl) {
      newOrder.syncedToSheet = true;
      console.log(`[Simulation] Posting order ${newOrder.id} to Google Script: ${settings.googleScriptUrl}`);
    }

    if (settings.enableEmailNotify && settings.ownerEmail) {
      newOrder.sentEmail = true;
      console.log(`[Simulation] Sending notification email to owner: ${settings.ownerEmail}`);
    }

    if (settings.enableLineNotify && settings.lineToken) {
      newOrder.sentLine = true;
      console.log(`[Simulation] Sending Line Notify with token: ${settings.lineToken}`);
    }

    setOrders(prev => [...prev, newOrder]);
    setIsSimulatingSync(false);

    // Notification Logic
    let msg = `訂單已送出！請至櫃檯結帳。總金額 $${newOrder.totalAmount}。`;
    
    showNotification(msg, 'success');
  };

  const handleUpdateStatus = (orderId: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status } : o));
    if (status === OrderStatus.COMPLETED) {
      const order = orders.find(o => o.id === orderId);
      if (order && (order.contactLineId || order.contactEmail)) {
         showNotification(`桌號 ${order.tableNumber} 餐點已完成，系統已自動通知顧客！`, 'info');
      }
    }
  };

  const handleConfirmPayment = (orderId: string) => {
    handleUpdateStatus(orderId, OrderStatus.PAID);
    showNotification("結帳完成！訂單已傳送至廚房。", "success");
  };

  // --- Views ---

  if (appMode === 'PORTAL') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 animate-fade-in">
        <div className="text-center mb-10">
          <div className="bg-orange-500 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg rotate-3">
            <Utensils className="text-white h-10 w-10" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{settings.storeName}</h1>
          <p className="text-gray-500">智慧點餐解決方案</p>
        </div>

        <div className="flex flex-col md:flex-row gap-6 w-full max-w-6xl h-auto md:h-96">
          {/* Start Ordering (80%) */}
          <button 
            onClick={() => {
              if (menu.length === 0) {
                showNotification("店家尚未設定菜單，請先進入後台設定。", "info");
              } else {
                setAppMode('CUSTOMER_APP');
              }
            }}
            className="md:flex-[4] bg-white p-8 md:p-12 rounded-3xl shadow-lg border-2 border-transparent hover:border-orange-500 transition-all group text-left flex flex-col justify-between relative overflow-hidden hover:shadow-xl min-h-[300px]"
          >
            {/* Background Decoration */}
            <div className="absolute right-[-40px] top-[-40px] bg-orange-50 w-80 h-80 rounded-full opacity-50 group-hover:scale-110 transition-transform duration-500 pointer-events-none"></div>
            
            <div className="relative z-10 w-20 h-20 bg-orange-100 rounded-2xl flex items-center justify-center group-hover:bg-orange-500 transition-colors shadow-sm mb-6">
              <Utensils className="text-orange-600 group-hover:text-white transition-colors" size={40} />
            </div>
            
            <div className="relative z-10">
              <h2 className="text-5xl font-bold text-gray-800 mb-4 group-hover:text-orange-600 transition-colors">開始點餐</h2>
              <p className="text-gray-500 text-xl">內用請直接點選此處，瀏覽菜單並下單。</p>
            </div>
            
            <div className="absolute bottom-10 right-10 bg-orange-100 text-orange-600 p-4 rounded-full group-hover:bg-orange-600 group-hover:text-white transition-all shadow-md">
               <ArrowRight size={32} />
            </div>
          </button>

          {/* Store Maintenance (20%) */}
          <button 
            onClick={() => {
              if (isAuthenticated) {
                setAppMode('BUSINESS_APP');
              } else {
                setAppMode('LOGIN');
              }
            }}
            className="md:flex-[1] bg-slate-50 p-6 rounded-3xl shadow-inner border-2 border-transparent hover:border-slate-300 hover:bg-white transition-all group text-center flex flex-col justify-center items-center gap-4 min-h-[150px]"
          >
            <div className="w-14 h-14 bg-slate-200 rounded-full flex items-center justify-center group-hover:bg-slate-800 transition-colors">
              <Settings className="text-slate-600 group-hover:text-white transition-colors" size={28} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-700 group-hover:text-slate-900">店家維護</h2>
              <p className="text-sm text-gray-400 mt-1">後台管理登入</p>
            </div>
          </button>
        </div>
        <div className="mt-12 text-gray-400 text-xs">System v2.5 • Secure Access</div>
      </div>
    );
  }

  // --- Login View ---
  if (appMode === 'LOGIN') {
    return (
      <LoginView 
        settings={settings}
        onLoginSuccess={() => {
          setIsAuthenticated(true);
          setAppMode('BUSINESS_APP');
          // If menu exists, default to Cashier view for operations
          if (menu.length > 0 && businessView === 'UPLOAD') {
             setBusinessView('DASHBOARD_CASHIER');
          }
          showNotification("登入成功！", "success");
        }}
        onBack={() => setAppMode('PORTAL')}
      />
    );
  }

  // --- Customer App View ---
  if (appMode === 'CUSTOMER_APP') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {isSimulatingSync && (
          <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center backdrop-blur-sm">
            <div className="bg-white p-6 rounded-2xl flex flex-col items-center">
              <RefreshCw className="animate-spin text-orange-500 mb-4" size={40} />
              <p className="font-bold text-gray-700">正在傳送訂單...</p>
              {settings.enableSheetSync && <p className="text-xs text-gray-400 mt-2">Syncing to Google Sheets</p>}
              {settings.enableEmailNotify && <p className="text-xs text-gray-400">Sending Email to Store</p>}
              {settings.enableLineNotify && <p className="text-xs text-gray-400">Sending Line Notify to Store</p>}
            </div>
          </div>
        )}

        <header className="bg-white shadow-sm sticky top-0 z-40">
          <div className="max-w-2xl mx-auto px-4 h-16 flex items-center justify-between">
            <button onClick={() => setAppMode('PORTAL')} className="p-2 -ml-2 text-gray-500 hover:bg-gray-100 rounded-full">
              <ArrowLeft size={24} />
            </button>
            <h1 className="font-bold text-lg text-gray-800">{settings.storeName}</h1>
            <div className="w-8"></div> {/* Spacer */}
          </div>
        </header>
        <main className="flex-1 max-w-2xl mx-auto w-full">
          <OrderingView menu={menu} onPlaceOrder={handlePlaceOrder} />
        </main>
      </div>
    );
  }

  // --- Business App View ---
  return (
    <div className="min-h-screen bg-gray-100 font-sans flex flex-col">
      {/* Business Navbar */}
      <nav className="bg-slate-800 text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-4">
               <button onClick={() => setAppMode('PORTAL')} className="p-2 text-slate-400 hover:text-white" title="返回首頁 (不會登出)">
                <ArrowLeft size={20} />
              </button>
              <div className="flex items-center">
                <ChefHat className="mr-2 h-6 w-6 text-orange-400" />
                <span className="font-bold text-xl tracking-tight hidden sm:inline">後台管理系統</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {menu.length > 0 && (
                <>
                  <button
                    onClick={() => setBusinessView('DASHBOARD_CASHIER')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                      businessView === 'DASHBOARD_CASHIER' 
                        ? 'bg-slate-700 text-white shadow-inner' 
                        : 'text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <CreditCard size={18} />
                    <span className="hidden sm:inline">結帳櫃檯</span>
                    {orders.filter(o => o.status === OrderStatus.PENDING).length > 0 && (
                      <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {orders.filter(o => o.status === OrderStatus.PENDING).length}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setBusinessView('DASHBOARD_KITCHEN')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                      businessView === 'DASHBOARD_KITCHEN' 
                        ? 'bg-slate-700 text-white shadow-inner' 
                        : 'text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <Utensils size={18} />
                    <span className="hidden sm:inline">廚房 KDS</span>
                    {orders.filter(o => o.status === OrderStatus.PAID).length > 0 && (
                      <span className="bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {orders.filter(o => o.status === OrderStatus.PAID).length}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setBusinessView('DASHBOARD_SETTINGS')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors ${
                      businessView === 'DASHBOARD_SETTINGS' 
                        ? 'bg-slate-700 text-white shadow-inner' 
                        : 'text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <Settings size={18} />
                    <span className="hidden sm:inline">設定</span>
                  </button>
                </>
              )}
              
              <div className="w-px h-6 bg-slate-600 mx-1"></div>
              
              <button 
                onClick={handleLogout}
                className="p-2 text-red-300 hover:text-red-100 hover:bg-red-900/30 rounded-lg transition-colors"
                title="登出"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full">
        {businessView === 'UPLOAD' && <UploadView onMenuGenerated={handleMenuGenerated} />}
        {businessView === 'DASHBOARD_CASHIER' && <CashierView orders={orders} onConfirmPayment={handleConfirmPayment} />}
        {businessView === 'DASHBOARD_KITCHEN' && <KitchenView orders={orders} onUpdateStatus={handleUpdateStatus} />}
        {businessView === 'DASHBOARD_SETTINGS' && (
          <SettingsView 
            menu={menu} 
            settings={settings}
            onUpdateMenu={handleUpdateMenu} 
            onUpdateSettings={setSettings}
            onReset={handleReset} 
          />
        )}
      </main>

      {/* Global Notification */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce-in">
          <div className={`flex items-center p-4 rounded-lg shadow-lg border ${
            notification.type === 'success' ? 'bg-green-50 border-green-200 text-green-800' : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}>
            <CheckCheck className="w-5 h-5 mr-3" />
            <span className="font-medium text-sm">{notification.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;