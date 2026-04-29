import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2 } from 'lucide-react';
import API from '../services/api';

export default function ScheduleDetailModal({ isOpen, onClose, schedule, onUpdate }) {
  const [formData, setFormData] = useState({ title: '', startTime: '', endTime: '', category: 'Work', description: '' });

  useEffect(() => {
    if (schedule) {
      setFormData({
        title: schedule.title,
        startTime: new Date(schedule.startTime).toISOString().slice(0, 16),
        endTime: new Date(schedule.endTime).toISOString().slice(0, 16),
        category: schedule.category,
        description: schedule.description || ''
      });
    }
  }, [schedule]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await API.put(`/schedules/${schedule._id}`, formData);
      onUpdate();
      onClose();
    } catch (err) { alert("Failed to update"); }
  };

  const handleDelete = async () => {
    if (window.confirm("Delete this event?")) {
      try {
        await API.delete(`/schedules/${schedule._id}`);
        onUpdate();
        onClose();
      } catch (err) { alert("Delete failed"); }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-slate-900">Edit Schedule</h2>
              <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full"><X size={20}/></button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <input type="text" className="w-full p-4 rounded-2xl border border-slate-100 font-bold" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              <textarea className="w-full p-4 rounded-2xl border border-slate-100 text-sm h-32" placeholder="Write description here..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              
              <div className="grid grid-cols-2 gap-4">
                <input type="datetime-local" className="p-3 rounded-xl border border-slate-100 text-xs" value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} />
                <input type="datetime-local" className="p-3 rounded-xl border border-slate-100 text-xs" value={formData.endTime} onChange={e => setFormData({...formData, endTime: e.target.value})} />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={handleDelete} className="flex-1 bg-rose-50 text-rose-600 font-bold py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-rose-100"><Trash2 size={18}/> Delete</button>
                <button type="submit" className="flex-[2] bg-orange-500 text-white font-bold py-4 rounded-2xl hover:bg-orange-600 shadow-lg shadow-orange-100">Save Changes</button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}