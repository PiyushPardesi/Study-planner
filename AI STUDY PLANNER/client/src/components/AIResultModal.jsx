import { motion, AnimatePresence } from 'framer-motion';
import { X, Lightbulb, AlertTriangle, ListChecks } from 'lucide-react';

export default function AIResultModal({ isOpen, onClose, data }) {
  if (!data) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-white dark:bg-gray-900 w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden border border-gray-100"
          >
            <div className="p-8 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                   Smart Study Plan
                </h2>
                <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X size={20} />
                </button>
              </div>

              {/* Priority Order Section */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-blue-600 uppercase tracking-widest flex items-center gap-2">
                  <ListChecks size={16} /> Suggested Priority
                </h3>
                <div className="bg-blue-50 rounded-2xl p-4 text-blue-900 text-sm leading-relaxed">
                  {data.priorityOrder}
                </div>
              </div>

              {/* Deadline Warnings */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-orange-600 uppercase tracking-widest flex items-center gap-2">
                  <AlertTriangle size={16} /> Deadline Insights
                </h3>
                <div className="bg-orange-50 rounded-2xl p-4 text-orange-900 text-sm leading-relaxed">
                  {data.deadlineWarnings}
                </div>
              </div>

              {/* Study Tips */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-2">
                  <Lightbulb size={16} /> Pro Tips
                </h3>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {data.studyTips.map((tip, i) => (
                    <li key={i} className="bg-emerald-50 p-3 rounded-xl text-emerald-900 text-xs font-medium">
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 flex justify-end">
              <button onClick={onClose} className="bg-gray-900 text-white px-6 py-2 rounded-xl font-bold hover:bg-black transition-colors">
                Got it!
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}