import { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion } from 'framer-motion'; 
import { ChevronLeft, ChevronRight, Plus, Loader2, Trash2, Clock, Calendar as CalendarIcon } from 'lucide-react';
import API from '../services/api';
import AddScheduleModal from '../components/AddScheduleModal';
import ScheduleDetailModal from '../components/ScheduleDetailModal';

export default function Calendar() {
  const scrollContainerRef = useRef(null);
  const { fetchGlobalSchedules, triggerNotification } = useOutletContext();
  
  const [schedules, setSchedules] = useState([]); 
  const [currentDate, setCurrentDate] = useState(new Date());
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      const { data } = await API.get('/schedules');
      setSchedules(Array.isArray(data) ? data : []);
    } catch (error) { 
      console.error("Fetch error:", error); 
      triggerNotification("Sync Error", "Could not load PlanIT schedules.", "info");
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => {
    fetchData();
    if (scrollContainerRef.current) scrollContainerRef.current.scrollTop = 8 * 80;
  }, []);

  const handleScheduleAdded = async (newSchedule) => {
    await fetchData();
    if (fetchGlobalSchedules) await fetchGlobalSchedules();
    triggerNotification("Schedule Created", `'${newSchedule.title}' added to PlanIT.`, "info");
  };

  const handleDeleteSchedule = async (id, title) => {
    if (window.confirm(`Remove '${title}'?`)) {
      try {
        await API.delete(`/schedules/${id}`);
        triggerNotification("Deleted", `'${title}' removed.`, "info");
        fetchData();
        if (fetchGlobalSchedules) fetchGlobalSchedules();
      } catch (error) { console.error("Delete error:", error); }
    }
  };

  const handleCompleteSchedule = async (id, title) => {
    try {
      await API.delete(`/schedules/${id}`); 
      // TRIGGER FULL-SCREEN CELEBRATION
      triggerNotification("Hurray! Congratulations!", `Completed '${title}'.`, "congrats");
      fetchData();
      if (fetchGlobalSchedules) fetchGlobalSchedules();
    } catch (error) { console.error("Completion error:", error); }
  };

  const handlePrevWeek = () => { const d = new Date(currentDate); d.setDate(d.getDate() - 7); setCurrentDate(d); };
  const handleNextWeek = () => { const d = new Date(currentDate); d.setDate(d.getDate() + 7); setCurrentDate(d); };
  
  const getDaysInWeek = (date) => {
    const start = new Date(date);
    start.setDate(start.getDate() - start.getDay());
    return Array.from({ length: 7 }).map((_, i) => {
      const d = new Date(start); d.setDate(start.getDate() + i); return d;
    });
  };

  const weekDays = getDaysInWeek(currentDate);
  const hours = Array.from({ length: 24 }, (_, i) => i);

  if (loading) return (
    <div className="h-full flex flex-col justify-center items-center gap-4">
      <Loader2 className="animate-spin text-indigo-600" size={48} />
      <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest">Organizing PlanIT...</p>
    </div>
  );

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Header */}
      <div className="flex justify-between items-center px-2">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Calendar</h1>
          <div className="flex items-center gap-2 text-slate-400 font-bold text-sm">
             <CalendarIcon size={14} /> 
             {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </div>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-black py-3 px-8 rounded-2xl shadow-lg transition-all flex items-center gap-2 text-sm">
          <Plus size={18} /> Add New Schedule
        </button>
      </div>

      <div className="flex flex-1 gap-8 overflow-hidden">
        {/* SIDEBAR */}
        <div className="w-72 flex flex-col gap-6 overflow-y-auto no-scrollbar pb-6 shrink-0">
          
          {/* Mini Monthly Picker */}
          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
               <h3 className="font-black text-slate-900 text-sm uppercase tracking-tight">{currentDate.toLocaleString('default', { month: 'long' })}</h3>
               <div className="flex gap-1">
                 <button onClick={handlePrevWeek} className="p-1 hover:bg-slate-50 rounded-lg text-slate-400"><ChevronLeft size={18}/></button>
                 <button onClick={handleNextWeek} className="p-1 hover:bg-slate-50 rounded-lg text-slate-400"><ChevronRight size={18}/></button>
               </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-[10px] text-slate-300 font-black uppercase text-center mb-4">
              {['S','M','T','W','T','F','S'].map(d => <span key={d}>{d}</span>)}
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-600">
              {Array.from({length: 31}).map((_, i) => (
                <div key={i} className={`p-1.5 rounded-xl ${i+1 === new Date().getDate() ? 'bg-indigo-600 text-white' : 'hover:bg-slate-50'}`}>
                  {i + 1}
                </div>
              ))}
            </div>
          </div>

          {/* Today's Focus */}
          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Today's Focus</h3>
            <div className="space-y-4">
              {schedules.filter(s => new Date(s.startTime).toDateString() === new Date().toDateString()).slice(0, 5).map(s => (
                <div key={s._id} className="flex items-center justify-between group">
                  <label className="flex items-center gap-3 text-sm font-bold text-slate-600 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-indigo-600" onChange={() => handleCompleteSchedule(s._id, s.title)} />
                    <span className="group-hover:text-indigo-600 truncate w-36">{s.title}</span>
                  </label>
                  <button onClick={() => handleDeleteSchedule(s._id, s.title)} className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-rose-500 transition-all"><Trash2 size={14} /></button>
                </div>
              ))}
            </div>
          </div>

          {/* CATEGORIES SECTION (RESTORED) */}
          <div className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Categories</h3>
            <div className="space-y-4">
              {[
                { name: 'Work', color: 'bg-indigo-600', val: 'Work' }, 
                { name: 'Studies', color: 'bg-emerald-500', val: 'Study' }
              ].map(cat => (
                <div key={cat.name} className="flex justify-between items-center text-xs font-bold text-slate-700">
                  <div className="flex items-center gap-3">
                    <div className={`w-2.5 h-2.5 rounded-full ${cat.color}`}></div>
                    {cat.name}
                  </div>
                  <span className="text-slate-300 font-black">
                    {schedules.filter(s => s.category === cat.val).length}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* MAIN GRID */}
        <div className="flex-1 bg-white rounded-[3rem] border border-slate-100 shadow-sm flex flex-col overflow-hidden">
          {/* Header Info */}
          <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/30">
            <span className="font-black text-slate-900 uppercase text-xs tracking-widest">Time Grid</span>
            <div className="flex items-center gap-2 text-slate-400 font-bold text-[10px] uppercase"><Clock size={12} /> Week Overview</div>
          </div>

          {/* GRID HEADER: DAYS & DATES */}
          <div className="grid grid-cols-8 border-b border-slate-100 bg-white z-20">
            <div className="border-r border-slate-50"></div> 
            {weekDays.map(day => (
              <div key={day.toISOString()} className="py-4 text-center border-r border-slate-50 last:border-r-0">
                <div className="text-[10px] font-black text-slate-300 uppercase">{day.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                <div className={`text-sm font-black mt-0.5 ${day.toDateString() === new Date().toDateString() ? 'text-indigo-600' : 'text-slate-700'}`}>{day.getDate()}</div>
              </div>
            ))}
          </div>
          
          <div ref={scrollContainerRef} className="flex-1 overflow-y-auto no-scrollbar relative">
            <div className="grid grid-cols-8 min-h-[1920px] relative"> 
              <div className="border-r border-slate-50 sticky left-0 bg-white z-10">
                {hours.map(hour => (
                  <div key={hour} className="h-20 border-b border-slate-50 text-[10px] font-black text-slate-300 uppercase p-4 text-right">
                    {hour === 0 ? '12 AM' : hour > 12 ? `${hour-12} PM` : hour === 12 ? '12 PM' : `${hour} AM`}
                  </div>
                ))}
              </div>
              
              {weekDays.map(day => (
                <div key={day.toISOString()} className="border-r border-slate-50 relative h-full">
                  {hours.map(h => <div key={h} className="h-20 border-b border-slate-50/50"></div>)}
                  
                  {schedules.filter(s => new Date(s.startTime).toDateString() === day.toDateString()).map(event => {
                    const start = new Date(event.startTime);
                    const duration = (new Date(event.endTime) - start) / 60000;
                    const top = (start.getHours() * 80) + (start.getMinutes() * (80/60));
                    const finalHeight = Math.max(duration * (80/60), 35);

                    return (
                      <motion.div 
                        key={event._id}
                        onClick={() => { setSelectedSchedule(event); setIsDetailModalOpen(true); }}
                        style={{ top: `${top}px`, height: `${finalHeight}px` }}
                        className={`absolute left-1 right-1 rounded-2xl border-l-[4px] p-3 shadow-sm z-10 cursor-pointer overflow-hidden ${
                          event.category === 'Study' ? 'bg-emerald-50 border-l-emerald-500 text-emerald-900' : 'bg-indigo-50 border-l-indigo-600 text-indigo-900'
                        }`}
                      >
                        <div className="text-[11px] font-black leading-tight mb-0.5">{event.title}</div>
                        <div className="text-[9px] font-bold opacity-60">{start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                      </motion.div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <AddScheduleModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onScheduleAdded={handleScheduleAdded} />
      <ScheduleDetailModal isOpen={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} schedule={selectedSchedule} onUpdate={fetchData} />
    </div>
  );
}