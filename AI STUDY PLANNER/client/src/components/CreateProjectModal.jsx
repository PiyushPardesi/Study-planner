import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Sparkles } from 'lucide-react';
import { createProject, getAiTaskBreakdown } from '../services/api';

export default function CreateProjectModal({ isOpen, onClose, onProjectCreated }) {
  const [suggestedTasks, setSuggestedTasks] = useState([]); // Holds AI results
  const [formData, setFormData] = useState({ title: '', description: '', deadline: '', tags: '' });
  const [loading, setLoading] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);

  const handleAiSuggest = async () => {
    if (!formData.title) {
      return alert("Please enter a project title first so the AI knows what to plan!");
    }

    setIsAiLoading(true);
    try {
      const { data } = await getAiTaskBreakdown({
        title: formData.title,
        description: formData.description,
        tags: (formData.tags || '').split(',').map(tag => tag.trim()).filter(t => t !== '')
      });

      setSuggestedTasks(data.tasks); 
    } catch (err) {
      console.error("AI Generation failed", err);
      alert("The AI is a bit busy right now. Please try again.");
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const projectData = {
        ...formData,
        tags: (formData.tags || '').split(',').map(tag => tag.trim()).filter(t => t !== ''),
        tasks: suggestedTasks // Including the AI tasks in the final project
      };
      await createProject(projectData);
      onProjectCreated(); 
      onClose();
      setFormData({ title: '', description: '', deadline: '', tags: '' });
      setSuggestedTasks([]); // Reset tasks for next time
    } catch (error) {
      alert("Error: " + error.message); 
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="absolute inset-0 bg-black/30 backdrop-blur-sm" />
          <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }} className="relative bg-white w-full max-w-md rounded-3xl shadow-2xl p-8 border border-gray-100 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-gray-900">New Project</h2>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Project Title</label>
                <input type="text" required className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-blue-50 focus:border-blue-600 outline-none transition-all" placeholder="e.g., Database Systems Final" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Description</label>
                <textarea className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-blue-50 focus:border-blue-600 outline-none transition-all" rows="2" placeholder="Briefly describe your goal..." value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Deadline</label>
                  <input type="date" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-blue-50 focus:border-blue-600 outline-none transition-all" value={formData.deadline} onChange={(e) => setFormData({...formData, deadline: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">Tags</label>
                  <input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-blue-50 focus:border-blue-600 outline-none transition-all" placeholder="Exam, SQL" value={formData.tags} onChange={(e) => setFormData({...formData, tags: e.target.value})} />
                </div>
              </div>

              {/* AI SUGGESTED TASKS PREVIEW SECTION */}
              {suggestedTasks.length > 0 && (
                <div className="bg-indigo-50/50 rounded-2xl p-4 border border-indigo-100 animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-xs font-black text-indigo-400 uppercase tracking-wider">AI Suggested Roadmap</h3>
                    <button 
                      type="button" 
                      onClick={() => setSuggestedTasks([])} 
                      className="text-xs text-red-500 font-bold hover:underline"
                    >
                      Clear All
                    </button>
                  </div>
                  <ul className="space-y-2">
                    {suggestedTasks.map((task, index) => (
                      <li key={index} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-indigo-50 shadow-sm group">
                        <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                        <span className="text-sm text-gray-700 font-medium flex-1">{task}</span>
                        <button 
                          type="button"
                          onClick={() => setSuggestedTasks(suggestedTasks.filter((_, i) => i !== index))}
                          className="text-gray-300 hover:text-red-500 transition-colors"
                        >
                          <X size={14} />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                type="button"
                onClick={handleAiSuggest}
                disabled={isAiLoading || loading}
                className="w-full bg-indigo-50 text-indigo-700 border border-indigo-100 font-bold py-3 rounded-2xl flex items-center justify-center gap-2 hover:bg-indigo-100 transition-all disabled:opacity-50 mt-2"
              >
                {isAiLoading ? (
                  <span className="flex items-center gap-2 animate-pulse">🤖 Thinking...</span>
                ) : (
                  <><Sparkles size={18} /> Generate AI Study Plan</>
                )}
              </button>

              <button type="submit" disabled={loading || isAiLoading} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-blue-100 flex items-center justify-center gap-2">
                {loading ? 'Creating...' : <><Plus size={20}/> Start Project</>}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}