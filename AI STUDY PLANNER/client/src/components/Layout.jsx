import { useState, useEffect } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellDot, X, Plus } from 'lucide-react';
import API from '../services/api';

// --- SUB-COMPONENTS (Toasts & Sidebar) ---
const NotificationToast = ({ toast, onClose }) => (
  <AnimatePresence>
    {toast && (
      <motion.div 
        initial={{ opacity: 0, y: 50, scale: 0.9, x: 20 }}
        animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
        exit={{ opacity: 0, scale: 0.9, x: 20 }}
        className="fixed bottom-6 right-6 z-[999] w-80 bg-white/80 backdrop-blur-xl border border-slate-200/50 rounded-3xl p-5 shadow-2xl"
      >
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <div className="bg-orange-500 p-1.5 rounded-lg text-white"><Bell size={14} /></div>
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Smart Planner</span>
          </div>
          <button onClick={onClose} className="text-slate-300 hover:text-slate-600"><X size={16}/></button>
        </div>
        <h4 className="font-black text-slate-900 text-sm mb-1">{toast.title}</h4>
        <p className="text-xs text-slate-500 font-medium mb-4">{toast.message}</p>
      </motion.div>
    )}
  </AnimatePresence>
);

const NotificationSidebar = ({ isOpen, onClose, notifications, setNotifications }) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <div className="fixed inset-0 bg-slate-900/5 backdrop-blur-[2px] z-[110]" onClick={onClose} />
        <motion.div 
          initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
          className="fixed top-0 right-0 h-full w-80 bg-white/90 backdrop-blur-2xl border-l border-slate-100 z-[120] shadow-2xl p-6 flex flex-col"
        >
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-black text-slate-900">Notifications</h2>
            <button onClick={() => setNotifications([])} className="text-[10px] font-black text-orange-500">CLEAR ALL</button>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-4">
            {notifications.map(n => (
              <div key={n.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                <div className="flex gap-3 mb-2 items-center">
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{n.time}</span>
                </div>
                <h5 className="font-bold text-slate-800 text-sm mb-1">{n.title}</h5>
                <p className="text-xs text-slate-500 font-medium">{n.message}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

export default function Layout() {
  const [notifications, setNotifications] = useState([]);
  const [activeToast, setActiveToast] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notifiedIds, setNotifiedIds] = useState(new Set());
  const [schedules, setSchedules] = useState([]);

  const fetchGlobalData = async () => {
    try {
      const res = await API.get('/schedules');
      setSchedules(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchGlobalData();
    const interval = setInterval(fetchGlobalData, 60000); // Sync data every minute
    return () => clearInterval(interval);
  }, []);

  // GLOBAL NOTIFICATION ENGINE
  useEffect(() => {
    const checkSchedules = () => {
      const now = new Date();
      schedules.forEach(s => {
        const startTime = new Date(s.startTime);
        const timeDiff = (startTime - now) / 60000;

        if (timeDiff > 0 && timeDiff <= 1.1 && !notifiedIds.has(s._id)) {
          const newNotif = {
            id: Date.now(),
            title: s.title,
            time: startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            message: `Final Reminder: '${s.title}' starts in 1 minute!`
          };
          setNotifications(prev => [newNotif, ...prev]);
          setActiveToast(newNotif);
          setNotifiedIds(prev => new Set(prev).add(s._id));
          setTimeout(() => setActiveToast(null), 10000);
        }
      });
    };
    const timer = setInterval(checkSchedules, 30000);
    return () => clearInterval(timer);
  }, [schedules, notifiedIds]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* GLOBAL HEADER */}
      <header className="h-20 bg-white/50 backdrop-blur-md border-b border-slate-200/50 sticky top-0 z-50 flex items-center justify-between px-8">
        <Link to="/" className="text-2xl font-black text-slate-900 tracking-tighter">Smart Planner</Link>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className={`p-3 rounded-2xl border border-slate-200/50 transition-all ${notifications.length > 0 ? 'bg-orange-50 text-orange-500' : 'bg-white text-slate-400'}`}
          >
            {notifications.length > 0 ? <BellDot size={20} /> : <Bell size={20} />}
          </button>
          <div className="w-10 h-10 rounded-2xl bg-slate-200 overflow-hidden border-2 border-white shadow-sm">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Piyush" alt="User" />
          </div>
        </div>
      </header>

      <main className="p-6">
        {/* Child components (Calendar, Dashboard, etc.) render here */}
        <Outlet context={{ fetchGlobalData }} /> 
      </main>

      <NotificationToast toast={activeToast} onClose={() => setActiveToast(null)} />
      <NotificationSidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        notifications={notifications} 
        setNotifications={setNotifications} 
      />
    </div>
  );
}