import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { createSchedule } from '../services/api';

export default function AddScheduleModal({ isOpen, onClose, onScheduleAdded }) {
  const [formData, setFormData] = useState({
    title: '',
    startTime: '',
    endTime: '',
    category: 'Work',
    description: ''
  });

  // PREVENTATIVE LOGIC: Automatically sets end time to +1 hour if it's currently empty
  const handleStartTimeChange = (e) => {
    const start = e.target.value;
    let end = formData.endTime;

    if (start && !end) {
      const startDate = new Date(start);
      startDate.setHours(startDate.getHours() + 1);
      
      // Formats the date back to YYYY-MM-DDTHH:mm for the input field
      const year = startDate.getFullYear();
      const month = String(startDate.getMonth() + 1).padStart(2, '0');
      const day = String(startDate.getDate()).padStart(2, '0');
      const hours = String(startDate.getHours()).padStart(2, '0');
      const minutes = String(startDate.getMinutes()).padStart(2, '0');
      
      end = `${year}-${month}-${day}T${hours}:${minutes}`;
    }

    setFormData({ ...formData, startTime: start, endTime: end });
  };

  // Inside AddScheduleModal.jsx
const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (new Date(formData.endTime) <= new Date(formData.startTime)) {
    alert("End time must be after the start time.");
    return;
  }

  try {
    const res = await createSchedule(formData);
    
    // Calculate minutes until the "deadline" (start time)
    const now = new Date();
    const start = new Date(formData.startTime);
    const diffInMs = start - now;
    const minutesLeft = Math.max(0, Math.floor(diffInMs / 60000));

    // Create the immediate "Creation Alert"
    const immediateAlert = {
      title: formData.title,
      message: `Deadline of '${formData.title}' is in ${minutesLeft} minutes.`
    };

    // Pass the new schedule and the alert back to the parent
    onScheduleAdded(res.data, immediateAlert); 
    
    onClose();
    setFormData({ title: '', startTime: '', endTime: '', category: 'Work', description: '' });
  } catch (error) {
    alert("Failed to save schedule");
  }
};
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/20 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl border border-gray-100"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-gray-900">New Schedule</h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X size={20}/></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Event Title</label>
                <input 
                  type="text" required
                  className="w-full px-4 py-3 rounded-xl border border-gray-100 focus:border-blue-500 outline-none transition-all"
                  placeholder="e.g., Technical Review"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Start</label>
                  <input 
                    type="datetime-local" required
                    className="w-full px-4 py-3 rounded-xl border border-gray-100 text-sm"
                    value={formData.startTime}
                    onChange={handleStartTimeChange} 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase mb-1">End</label>
                  <input 
                    type="datetime-local" required
                    className="w-full px-4 py-3 rounded-xl border border-gray-100 text-sm"
                    value={formData.endTime}
                    onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Category</label>
                <select 
                  className="w-full px-4 py-3 rounded-xl border border-gray-100 outline-none"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                  <option value="Work">Work</option>
                  <option value="Study">Study</option>
                  <option value="Personal">Personal</option>
                  <option value="Health">Health</option>
                </select>
              </div>

              <button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-orange-100 transition-all">
                Save Schedule
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}