import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus } from 'lucide-react';
import API from '../services/api';

export default function AddEventModal({ isOpen, onClose, onEventAdded, projects }) {
  const [formData, setFormData] = useState({ 
    title: '', 
    project: '', 
    dueDate: new Date().toISOString().split('T')[0], 
    priority: 'Medium' 
  });
  const [loading, setLoading] = useState(false);

  // Set the first project as default if none is selected
  useEffect(() => {
    if (projects.length > 0 && !formData.project) {
      setFormData(prev => ({ ...prev, project: projects[0]._id }));
    }
  }, [projects]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.project) {
      alert("Please create a Project first before adding an event!");
      return;
    }

    setLoading(true);
    try {
      await API.post('/tasks', formData);
      onEventAdded(); // Refresh the calendar
      onClose();      // Close the modal
      setFormData({ title: '', project: projects[0]?._id || '', dueDate: new Date().toISOString().split('T')[0], priority: 'Medium' });
    } catch (error) {
      alert("Failed to add event.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
          <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 border border-gray-100">
            
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-gray-900">New Event</h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Task / Event Name</label>
                <input type="text" required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-600 outline-none" placeholder="e.g., Final Presentation" />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Assign to Project</label>
                <select required value={formData.project} onChange={(e) => setFormData({...formData, project: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none bg-white">
                  {projects.length === 0 ? <option value="">No projects found...</option> : null}
                  {projects.map(p => (
                    <option key={p._id} value={p._id}>{p.title}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Date</label>
                  <input type="date" required value={formData.dueDate} onChange={(e) => setFormData({...formData, dueDate: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Priority</label>
                  <select value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value})} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none bg-white">
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <button type="submit" disabled={loading || projects.length === 0} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-4 rounded-2xl transition-all shadow-xl mt-4 flex items-center justify-center gap-2">
                {loading ? 'Saving...' : <><Plus size={20}/> Add to Calendar</>}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}