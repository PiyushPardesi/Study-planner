import { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Tag, Plus, ArrowRight, Loader2, Trash2, CheckCircle2, FolderLock } from 'lucide-react';
import API from '../services/api';
import CreateProjectModal from '../components/CreateProjectModal';

export default function Projects() {
  const navigate = useNavigate();
  
  // 1. Destructure tools from MainLayout context
  // fetchGlobalSchedules ensures the background reminder engine stays synced
  const { triggerNotification, fetchGlobalSchedules } = useOutletContext();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchProjects = async () => {
    try {
      const { data } = await API.get('/projects');
      setProjects(data);
    } catch (error) {
      console.error("Error fetching projects:", error);
      triggerNotification("Sync Error", "Failed to retrieve project list.", "info");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // --- REACTIVE HANDLERS ---

  const handleProjectCreated = async () => {
    await fetchProjects();
    await fetchGlobalSchedules(); // Sync deadlines with the global timer
    
    triggerNotification(
      "Project Initialized", 
      "Your new research workspace has been successfully created.", 
      "info"
    );
  };

  const handleDeleteProject = async (e, id, title) => {
    e.stopPropagation(); // Stops navigation to details page
    if (window.confirm(`Delete '${title}' and all its research data?`)) {
      try {
        await API.delete(`/projects/${id}`);
        triggerNotification("Project Purged", `'${title}' was removed from your portfolio.`, "info");
        fetchProjects();
        fetchGlobalSchedules();
      } catch (error) {
        console.error("Delete error", error);
      }
    }
  };

  const handleCompleteProject = async (e, id, title) => {
    e.stopPropagation(); 
    try {
      await API.patch(`/projects/${id}`, { status: 'Completed' });
      
      // TRIGGER GLOBAL CELEBRATION & CONFETTI
      triggerNotification(
        "Hurray! Project Completed!", 
        `Outstanding achievement! You've finished '${title}'. Keep that academic momentum going!`, 
        "congrats"
      );
      
      fetchProjects();
    } catch (error) {
      console.error("Completion error", error);
    }
  };

  if (loading) return (
    <div className="h-full flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-orange-500" size={48} />
      <p className="text-slate-400 font-black uppercase text-[10px] tracking-widest animate-pulse">Loading Academic Portfolio...</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <CreateProjectModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onProjectCreated={handleProjectCreated} 
      />

      <div className="flex justify-between items-center px-2">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Your Projects</h1>
          <p className="text-slate-500 font-medium mt-1">Real-time tracking of your study and research goals.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-orange-100 active:scale-95"
        >
          <Plus size={20} /> New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 flex flex-col items-center">
          <FolderLock className="text-slate-200 mb-4" size={64} />
          <p className="text-slate-400 font-bold">No active projects. Click "New Project" to start tracking your M.Tech goals!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project, index) => (
            <motion.div
              key={project._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col cursor-pointer group relative overflow-hidden"
              onClick={() => navigate(`/projects/${project._id}`)}
            >
              {/* ACTION BUTTONS (Hover visible) */}
              <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <button 
                  onClick={(e) => handleCompleteProject(e, project._id, project.title)}
                  className="p-2 bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-100 transition-colors shadow-sm"
                  title="Mark Complete"
                >
                  <CheckCircle2 size={16} />
                </button>
                <button 
                  onClick={(e) => handleDeleteProject(e, project._id, project.title)}
                  className="p-2 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-colors shadow-sm"
                  title="Delete Project"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="flex gap-2 mb-4 overflow-hidden">
                {project.tags?.map(tag => (
                  <span key={tag} className="text-[10px] font-black px-3 py-1 rounded-full bg-slate-50 text-slate-500 flex items-center gap-1 uppercase tracking-widest border border-slate-100">
                    <Tag size={10} /> {tag}
                  </span>
                ))}
              </div>

              <h2 className="text-xl font-black text-slate-900 mb-2 group-hover:text-orange-500 transition-colors">{project.title}</h2>
              
              <div className="flex items-center gap-2 text-sm text-slate-400 font-bold mb-6">
                <Calendar size={16} className="text-orange-500" />
                <span>Due: {project.deadline ? new Date(project.deadline).toLocaleDateString() : 'No Deadline'}</span>
              </div>

              <div className="mt-auto pt-5 border-t border-slate-50 flex items-center justify-between text-sm">
                <span className={`text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                  project.status === 'Completed' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-blue-50 text-blue-600 border border-blue-100'
                }`}>
                  {project.status || 'In Progress'}
                </span>
                <div className="text-orange-500 font-black flex items-center group-hover:gap-2 transition-all">
                  View Tasks <ArrowRight size={16} className="ml-1" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}