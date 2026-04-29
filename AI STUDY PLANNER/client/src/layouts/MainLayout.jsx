import { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellDot, X, LayoutDashboard, Calendar as CalendarIcon, FolderLock, Users, PartyPopper } from 'lucide-react';
import API from '../services/api';

// --- ULTRA HIGH-DENSITY CELEBRATION OVERLAY ---
const CelebrationOverlay = ({ isVisible }) => {
  const pieces = Array.from({ length: 1000 }); 
  const colors = ['#f97316', '#3b82f6', '#10b981', '#f43f5e', '#eab308', '#a855f7', '#ff7eb3', '#00f2fe'];
  const shapes = ['square', 'circle', 'triangle', 'bar'];

  return (
    <AnimatePresence>
      {isVisible && (
        <div className="fixed inset-0 pointer-events-none z-[2000] overflow-hidden">
          {pieces.map((_, i) => {
            const size = Math.random() * 10 + 4;
            const color = colors[i % colors.length];
            const shape = shapes[i % shapes.length];
            const startX = Math.random() * 100;
            const delay = Math.random() * 3;
            
            return (
              <motion.div
                key={i}
                initial={{ y: -100, x: `${startX}vw`, opacity: 1, rotate: 0 }}
                animate={{ 
                  y: '110vh', 
                  rotate: Math.random() * 2000,
                  x: `${startX + (Math.random() * 40 - 20)}vw`, 
                }}
                transition={{ duration: Math.random() * 3 + 2, delay: delay, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="absolute"
                style={{ 
                  width: shape === 'bar' ? size * 0.4 : size, 
                  height: size, 
                  backgroundColor: shape !== 'triangle' ? color : 'transparent',
                  borderRadius: shape === 'circle' ? '50%' : '1px',
                  clipPath: shape === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : 'none',
                  background: shape === 'triangle' ? color : undefined,
                  boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                }}
              />
            );
          })}
        </div>
      )}
    </AnimatePresence>
  );
};

// --- NOTIFICATION SIDEBAR ---
const NotificationSidebar = ({ isOpen, onClose, notifications, setNotifications }) => (
  <AnimatePresence>
    {isOpen && (
      <>
        <div className="fixed inset-0 bg-slate-900/5 backdrop-blur-[2px] z-[110]" onClick={onClose} />
        <motion.div 
          initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
          className="fixed top-0 right-0 h-full w-80 bg-white/95 backdrop-blur-2xl border-l border-slate-100 z-[120] shadow-2xl p-6 flex flex-col"
        >
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Recent Activity</h2>
            <button onClick={() => setNotifications([])} className="text-[10px] font-black text-orange-500 uppercase tracking-widest hover:text-orange-600 transition-colors">Clear</button>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar space-y-4">
            {notifications.map(n => (
              <div key={n.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm border-l-4 border-l-orange-500">
                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest block mb-1">{n.time}</span>
                <h5 className="font-bold text-slate-800 text-sm mb-1">{n.title}</h5>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">{n.message}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </>
    )}
  </AnimatePresence>
);

export default function MainLayout() {
  const [notifications, setNotifications] = useState([]);
  const [activeToast, setActiveToast] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [schedules, setSchedules] = useState([]);
  const [notifiedIds, setNotifiedIds] = useState(new Set());
  const location = useLocation();

  const triggerNotification = (title, message, type = 'info') => {
    const newNotif = { 
      id: Date.now(), 
      title, 
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), 
      message, 
      type 
    };
    
    setNotifications(prev => [newNotif, ...prev]);
    setActiveToast(newNotif);

    if (type === 'congrats') {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 6000); 
    }

    setTimeout(() => setActiveToast(null), 8000);
  };

  const fetchGlobalSchedules = async () => {
    try {
      const res = await API.get('/schedules');
      setSchedules(res.data);
    } catch (err) { console.error("Global Sync Error", err); }
  };

  useEffect(() => {
    fetchGlobalSchedules();
    const interval = setInterval(fetchGlobalSchedules, 60000); 
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <CelebrationOverlay isVisible={showCelebration} />
      
      <aside className="w-20 md:w-64 bg-white border-r border-slate-100 flex flex-col p-4 shrink-0">
        <div className="mb-10 px-4 py-2 font-black text-2xl tracking-tighter text-slate-900  italic">PlanIT</div>
        <nav className="space-y-2 flex-1">
          {[
            { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20}/> },
            { name: 'Calendar', path: '/calendar', icon: <CalendarIcon size={20}/> },
            { name: 'Projects', path: '/projects', icon: <FolderLock size={20}/> },
            { name: 'Friends', path: '/friends', icon: <Users size={20}/> },
          ].map((item) => (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`flex items-center gap-3 p-3 rounded-2xl font-bold transition-all ${
                location.pathname === item.path ? 'bg-orange-500 text-white shadow-lg shadow-orange-200' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              {item.icon}
              <span className="hidden md:block">{item.name}</span>
            </Link>
          ))}
        </nav>
      </aside>

      <div className="flex-1 flex flex-col relative overflow-hidden">
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-100 flex items-center justify-between px-8 shrink-0">
          <h2 className="font-black text-slate-800 text-xl tracking-tight">PlanIT</h2>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className={`p-3 rounded-2xl border border-slate-200/50 transition-all ${notifications.length > 0 ? 'bg-orange-50 text-orange-500' : 'bg-white text-slate-400 hover:bg-slate-50'}`}
          >
            {notifications.length > 0 ? <BellDot size={20} /> : <Bell size={20} />}
          </button>
        </header>

        <main className="flex-1 overflow-auto p-6 no-scrollbar">
          <Outlet context={{ fetchGlobalSchedules, triggerNotification }} />
        </main>
      </div>

      {/* --- ENLARGED REACTIVE TOAST POPUP --- */}
      <AnimatePresence>
        {activeToast && (
          <motion.div 
            initial={{ opacity: 0, y: 100, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            className={`fixed bottom-10 right-10 z-[1100] w-[28rem] backdrop-blur-2xl border border-white/20 rounded-[2.5rem] p-8 shadow-2xl flex flex-col gap-2 ${
              activeToast.type === 'congrats' ? 'bg-emerald-500/95 text-white' : 'bg-white/95 text-slate-900'
            }`}
          >
             <div className="flex justify-between items-center mb-1">
                <span className={`text-[11px] font-black uppercase tracking-widest ${activeToast.type === 'congrats' ? 'opacity-80' : 'opacity-40'}`}>
                  {activeToast.type === 'congrats' ? 'Success Milestone' : 'System Notification'}
                </span>
                <X size={20} className="cursor-pointer opacity-50 hover:opacity-100 transition-opacity" onClick={() => setActiveToast(null)} />
             </div>
             <div className="flex items-start gap-5">
               {activeToast.type === 'congrats' && (
                 <div className="bg-white/20 p-3 rounded-2xl shrink-0">
                   <PartyPopper size={32} />
                 </div>
               )}
               <div className="flex-1">
                 <h4 className="font-black text-lg leading-tight mb-1">{activeToast.title}</h4>
                 <p className={`text-sm font-bold leading-relaxed ${activeToast.type === 'congrats' ? 'opacity-90' : 'text-slate-500'}`}>
                   {activeToast.message}
                 </p>
               </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <NotificationSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} notifications={notifications} setNotifications={setNotifications} />
    </div>
  );
}