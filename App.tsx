import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Package, BarChart3, Bell, User, CheckCircle2, Settings } from 'lucide-react';
import { Order, OrderStatus, Product, StockStatus, Tab } from './types';
import { INITIAL_INVENTORY, INITIAL_ORDERS } from './services/mockData';
import { getVendorInsights } from './services/geminiService';
import { OrderCard } from './components/OrderCard';
import { InventoryItem } from './components/InventoryItem';
import { StatsPanel } from './components/StatsPanel';
import { SettingsPanel } from './components/SettingsPanel';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.ORDERS);
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [inventory, setInventory] = useState<Product[]>(INITIAL_INVENTORY);
  const [insight, setInsight] = useState<string>('');
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  
  // Settings State
  const [storeName, setStoreName] = useState("Green Grocer");
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Apply Dark Mode Class
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Auto-refresh AI insights when specific things change
  useEffect(() => {
    if (activeTab === Tab.INSIGHTS) {
      setIsLoadingInsight(true);
      getVendorInsights(orders, inventory)
        .then(setInsight)
        .finally(() => setIsLoadingInsight(false));
    }
  }, [activeTab, orders, inventory]);

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleUpdateOrderStatus = (id: string, status: OrderStatus) => {
    setOrders(prev => prev.map(o => {
      if (o.id === id) {
        if (status === OrderStatus.COMPLETED) {
            showNotification(`Order #${id.split('-')[1]} Completed!`);
            return { ...o, status }; // In real app, might move to separate list
        }
        return { ...o, status };
      }
      return o;
    }));
  };

  const handleSendSignal = (id: string, message: string) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, riderMessage: message } : o));
    showNotification(`Signal sent to Rider: "${message}"`);
  };

  const handleUpdateStock = (id: string, status: StockStatus) => {
    setInventory(prev => prev.map(p => p.id === id ? { ...p, status } : p));
    if (status === StockStatus.OUT_OF_STOCK) {
      showNotification("Item blocked for new orders.");
    }
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const activeOrders = orders.filter(o => o.status !== OrderStatus.COMPLETED && o.status !== OrderStatus.CANCELLED);
  const completedCount = orders.filter(o => o.status === OrderStatus.COMPLETED).length + 8; // +8 base mock

  const NavButton = ({ tab, icon: Icon, label, badgeCount }: { tab: Tab, icon: any, label: string, badgeCount?: number }) => (
     <button 
        onClick={() => setActiveTab(tab)}
        className={`w-full flex items-center p-3 rounded-lg font-medium transition-colors ${
            activeTab === tab 
            ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400' 
            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
        }`}
      >
        <Icon size={20} className="mr-3" /> {label}
        {badgeCount !== undefined && badgeCount > 0 && (
            <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{badgeCount}</span>
        )}
      </button>
  );

  return (
    <div className="min-h-screen flex flex-col pb-16 md:pb-0 md:pl-64 transition-colors duration-300">
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-slate-800 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-full shadow-lg flex items-center animate-bounce-in">
          <CheckCircle2 size={18} className="mr-2 text-green-400 dark:text-green-600" />
          <span className="text-sm font-medium">{notification}</span>
        </div>
      )}

      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 fixed inset-y-0 left-0 z-20 transition-colors duration-300">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800">
          <h1 className="text-2xl font-black text-indigo-600 dark:text-indigo-400 tracking-tight">Van<span className="text-slate-400 dark:text-slate-500 font-light">Hub</span></h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">ONDC Vendor Node</p>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <NavButton tab={Tab.ORDERS} icon={LayoutDashboard} label="Orders" badgeCount={activeOrders.length} />
          <NavButton tab={Tab.INVENTORY} icon={Package} label="Inventory" />
          <NavButton tab={Tab.INSIGHTS} icon={BarChart3} label="Performance" />
          <NavButton tab={Tab.SETTINGS} icon={Settings} label="Settings" />
        </nav>
        <div className="p-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center text-sm text-slate-500 dark:text-slate-400">
                <User size={16} className="mr-2" />
                <span className="truncate">Store: <strong className="text-slate-700 dark:text-slate-200">{storeName}</strong></span>
            </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 max-w-4xl mx-auto w-full">
        {/* Mobile Header */}
        <div className="md:hidden flex justify-between items-center mb-6">
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">VanHub</h1>
            <div className="relative">
                <Bell className="text-slate-600 dark:text-slate-300" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
            </div>
        </div>

        {activeTab === Tab.ORDERS && (
          <div className="space-y-4">
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Live Orders</h2>
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full">
                    {activeOrders.length} Active
                </span>
             </div>
             {activeOrders.length === 0 ? (
                 <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-700">
                     <p className="text-slate-400 dark:text-slate-500">No active orders right now.</p>
                     <p className="text-slate-500 dark:text-slate-600 text-sm mt-1">Wait for ONDC network requests.</p>
                 </div>
             ) : (
                activeOrders.map(order => (
                    <OrderCard 
                        key={order.id} 
                        order={order} 
                        onUpdateStatus={handleUpdateOrderStatus}
                        onSendSignal={handleSendSignal}
                    />
                ))
             )}
          </div>
        )}

        {activeTab === Tab.INVENTORY && (
           <div className="space-y-4">
               <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded-r-lg mb-6">
                   <h3 className="text-blue-900 dark:text-blue-200 font-bold text-sm mb-1">Stock Signaling</h3>
                   <p className="text-blue-800 dark:text-blue-300 text-xs">Marking items "Out of Stock" instantly stops incoming orders for that item network-wide.</p>
               </div>

               <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-4">Pantry Control</h2>
               {inventory.map(prod => (
                   <InventoryItem 
                       key={prod.id} 
                       product={prod} 
                       onUpdateStatus={handleUpdateStock}
                   />
               ))}
           </div>
        )}

        {activeTab === Tab.INSIGHTS && (
            <div className="space-y-6">
                 <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Insights & Stats</h2>
                 <StatsPanel completedOrders={completedCount} avgTime={14} />
                 
                 <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-lg p-6 text-white shadow-lg">
                    <div className="flex items-start justify-between mb-4">
                        <h3 className="font-bold text-lg">AI Operations Assistant</h3>
                        <div className="px-2 py-1 bg-white/20 rounded text-xs uppercase tracking-wider font-semibold">Gemini 3 Powered</div>
                    </div>
                    
                    {isLoadingInsight ? (
                        <div className="flex items-center space-x-2 animate-pulse">
                            <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-75"></div>
                            <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-150"></div>
                            <span className="text-sm font-medium ml-2">Analyzing store patterns...</span>
                        </div>
                    ) : (
                        <div className="prose prose-invert prose-sm">
                            <div className="whitespace-pre-line leading-relaxed">
                                {insight}
                            </div>
                        </div>
                    )}
                 </div>
            </div>
        )}

        {activeTab === Tab.SETTINGS && (
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Store Settings</h2>
                <SettingsPanel 
                  storeName={storeName}
                  setStoreName={setStoreName}
                  isDarkMode={isDarkMode}
                  toggleTheme={toggleTheme}
                />
            </div>
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-around p-2 z-30 shadow-lg pb-safe transition-colors duration-300">
        <button 
            onClick={() => setActiveTab(Tab.ORDERS)}
            className={`flex flex-col items-center p-2 rounded-lg ${activeTab === Tab.ORDERS ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`}
        >
            <LayoutDashboard size={24} />
            <span className="text-[10px] font-bold mt-1">Orders</span>
        </button>
        <button 
            onClick={() => setActiveTab(Tab.INVENTORY)}
            className={`flex flex-col items-center p-2 rounded-lg ${activeTab === Tab.INVENTORY ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`}
        >
            <Package size={24} />
            <span className="text-[10px] font-bold mt-1">Stock</span>
        </button>
        <button 
            onClick={() => setActiveTab(Tab.INSIGHTS)}
            className={`flex flex-col items-center p-2 rounded-lg ${activeTab === Tab.INSIGHTS ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`}
        >
            <BarChart3 size={24} />
            <span className="text-[10px] font-bold mt-1">Stats</span>
        </button>
        <button 
            onClick={() => setActiveTab(Tab.SETTINGS)}
            className={`flex flex-col items-center p-2 rounded-lg ${activeTab === Tab.SETTINGS ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`}
        >
            <Settings size={24} />
            <span className="text-[10px] font-bold mt-1">Settings</span>
        </button>
      </nav>
    </div>
  );
};

export default App;