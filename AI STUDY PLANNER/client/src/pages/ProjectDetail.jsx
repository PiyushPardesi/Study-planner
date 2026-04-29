import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useParams, useOutletContext } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Circle, Loader2, Plus, Trash2, Edit3, Clock, Target, Sparkles } from 'lucide-react';
import API from '../services/api';
import EditProjectModal from '../components/EditProjectModal';
import PomodoroTimer from '../components/PomodoroTimer';

export default function ProjectDetail() {
  const navigate = useNavigate();
  const { id } = useParams(); 

  // Get global tools from MainLayout context
  const { triggerNotification } = useOutletContext();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [loading, setLoading] = useState(true);
  const [focusSeconds, setFocusSeconds] = useState(0); 
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      const [projectRes, tasksRes] = await Promise.all([
        API.get(`/projects/${id}`),
        API.get(`/tasks/${id}`)
      ]);
      
      setProject(projectRes.data);

      // CRITICAL SAFETY CHECK: Prevent blank page by ensuring data is an array
      const rawTasks = Array.isArray(tasksRes.data) ? tasksRes.data : [];
      
      const sortedTasks = rawTasks.sort((a, b) => {
        const order = { 'High': 1, 'Medium': 2, 'Low': 3 };
        return (order[a.priority] || 2) - (order[b.priority] || 2);
      });
      
      setTasks(sortedTasks);
    } catch (error) {
      console.error("Error fetching project details:", error);
      triggerNotification("Sync Error", "Could not load tasks. Check your connection.", "info");
      setTasks([]); // Fallback to prevent map() errors
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  // --- REACTIVE HANDLERS ---

  const handleAddTask = async (e) => {
    if (e.key === 'Enter' && newTaskTitle.trim()) {
      try {
        await API.post('/tasks', { 
          project: id, 
          title: newTaskTitle, 
          priority: priority, 
          dueDate: new Date() 
        });
        setNewTaskTitle(""); 
        setPriority("Medium"); 
        fetchData();
        triggerNotification("Task Logged", "New research step added.", "info");
      } catch (error) { 
        triggerNotification("Error", "Failed to add task", "info"); 
      }
    }
  };

  const toggleTask = async (taskId, title, currentlyCompleted) => {
    try { 
      await API.put(`/tasks/${taskId}`); 
      
      if (!currentlyCompleted) {
        // TRIGGER GLOBAL CELEBRATION (Emerald Toast + Confetti)
        triggerNotification(
          "Hurray! Progress Made!", 
          `Congratulations on finishing '${title}'!`, 
          "congrats"
        );
      }
      fetchData(); 
    } catch (error) { 
      console.error("Toggle error"); 
    }
  };

  const deleteTask = async (taskId, title) => {
    if (window.confirm("Delete this research task?")) {
      try { 
        await API.delete(`/tasks/${taskId}`); 
        triggerNotification("Task Removed", `'${title}' deleted.`, "info");
        fetchData(); 
      } catch (error) { 
        console.error("Delete error"); 
      }
    }
  };

  const handleDeleteProject = async () => {
    if (window.confirm(`Are you sure you want to delete "${project?.title}"?`)) {
      try {
        await API.delete(`/projects/${id}`);
        triggerNotification("Project Deleted", "All associated data has been wiped.", "info");
        navigate('/projects'); 
      } catch (error) {
        triggerNotification("Error", "Failed to delete project", "info");
      }
    }
  };

  // --- Calculations ---
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.isCompleted).length;
  const tasksLeft = totalTasks - completedTasks;
  const progressPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const hoursSpent = (focusSeconds / 3600).toFixed(1);

  const getPriorityStyle = (p) => {
    switch(p) {
      case 'High': return 'bg-red-50 text-red-700 border-red-100';
      case 'Medium': return 'bg-orange-50 text-orange-700 border-orange-100';
      case 'Low': return 'bg-blue-50 text-blue-700 border-blue-100';
      default: return 'bg-slate-50 text-slate-700';
    }
  };

  if (loading) return (
    <div className="h-full flex flex-col justify-center items-center gap-4">
      <Loader2 className="animate-spin text-orange-500" size={48} />
      <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest animate-pulse">Syncing Project State...</p>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header Section */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/projects')} className="p-2 hover:bg-slate-100 rounded-full transition-all text-slate-400 hover:text-slate-900"><ArrowLeft size={24} /></button>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{project?.title || 'Untitled Project'}</h1>
            <p className="text-slate-500 font-medium text-sm mt-1">{project?.description || 'Tracking academic progress.'}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setIsEditModalOpen(true)} className="flex items-center gap-2 text-slate-600 hover:bg-slate-100 px-4 py-2 rounded-xl font-bold transition-all text-sm"><Edit3 size={16} /> Edit</button>
          <button onClick={handleDeleteProject} className="flex items-center gap-2 text-rose-500 hover:bg-rose-50 px-4 py-2 rounded-xl font-bold transition-all text-sm"><Trash2 size={16} /> Delete</button>
        </div>
      </div>

      <EditProjectModal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} project={project} onProjectUpdated={() => { fetchData(); triggerNotification("Project Updated", "Changes saved.", "info"); }} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          
          {/* STATS ROW */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm flex flex-col items-center justify-center relative overflow-hidden">
              <h3 className="text-slate-400 text-[9px] font-black uppercase tracking-widest w-full text-left mb-2">Productivity</h3>
              <div className="relative w-full mt-2">
                <svg viewBox="0 0 100 55" className="w-full">
                  <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#f1f5f9" strokeWidth="12" strokeDasharray="5 3" />
                  <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#f97316" strokeWidth="12" strokeDasharray="125.6" strokeDashoffset={125.6 - (125.6 * progressPercentage) / 100} className="transition-all duration-1000 ease-out" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center pt-4">
                  <span className="text-2xl font-black text-slate-900">{progressPercentage}%</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm flex flex-col justify-center">
               <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-4"><Target size={20}/></div>
               <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest">Tasks Left</p>
               <h3 className="text-2xl font-black text-slate-900 mt-1">{tasksLeft} <span className="text-xs text-slate-400">/ {totalTasks}</span></h3>
            </div>

            <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm flex flex-col justify-center">
               <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-4"><Clock size={20}/></div>
               <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest">Time Focused</p>
               <h3 className="text-2xl font-black text-slate-900 mt-1">{hoursSpent} <span className="text-xs text-slate-400">hrs</span></h3>
            </div>
          </div>

          {/* Task Input */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex items-center px-6 py-3 bg-slate-50/50 border-b border-slate-100 gap-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Priority:</span>
              {['High', 'Medium', 'Low'].map((p) => (
                <button key={p} onClick={() => setPriority(p)} className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase border transition-all ${ priority === p ? 'bg-orange-500 text-white border-orange-500 shadow-md' : 'bg-white text-slate-400 border-slate-200 hover:border-slate-300' }`}>{p}</button>
              ))}
            </div>
            <div className="relative">
              <Plus className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
              <input 
                type="text" 
                value={newTaskTitle} 
                placeholder="What research step is next? (Press Enter)" 
                className="w-full py-6 pl-14 pr-6 outline-none font-bold text-lg text-slate-700" 
                onChange={(e) => setNewTaskTitle(e.target.value)} 
                onKeyDown={handleAddTask} 
              />
            </div>
          </div>

          {/* Task List */}
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden min-h-[400px]">
            <AnimatePresence>
              {tasks.length === 0 ? (
                <div className="p-20 text-center text-slate-300 font-bold italic flex flex-col items-center gap-2">
                  <Sparkles size={32} className="opacity-20" />
                  Your task list is ready for research.
                </div>
              ) : (
                tasks.map((task) => (
                  <motion.div 
                    key={task._id} 
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-between p-5 hover:bg-slate-50 border-b border-slate-50 last:border-0 transition-all group"
                  >
                    <div className="flex items-center gap-4 flex-1 cursor-pointer" onClick={() => toggleTask(task._id, task.title, task.isCompleted)}>
                      <div className="text-2xl transition-transform active:scale-90">
                        {task.isCompleted ? <CheckCircle className="text-emerald-500" fill="#10b981" color="white" /> : <Circle className="text-slate-200 group-hover:text-orange-500" />}
                      </div>
                      <div className="flex flex-col">
                        <p className={`text-lg font-bold transition-all ${task.isCompleted ? 'text-slate-300 line-through' : 'text-slate-900'}`}>{task.title}</p>
                        <span className={`w-fit mt-1 text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${getPriorityStyle(task.priority)}`}>{task.priority || 'Medium'}</span>
                      </div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); deleteTask(task._id, task.title); }} className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"><Trash2 size={18} /></button>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <PomodoroTimer onTick={() => setFocusSeconds(prev => prev + 1)} />
        </div>
      </div>
    </div>
  );
}