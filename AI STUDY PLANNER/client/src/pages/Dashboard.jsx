import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { 
  BookOpen, CheckCircle, TrendingUp, Calendar as CalendarIcon, 
  AlertCircle, Download, Search, ChevronRight, Loader2 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer 
} from 'recharts';
import API from '../services/api';

const mockWeeklyActivity = [
  { day: 'Mon', completed: 3, pending: 2 },
  { day: 'Tue', completed: 5, pending: 1 },
  { day: 'Wed', completed: 2, pending: 4 },
  { day: 'Thu', completed: 6, pending: 0 },
  { day: 'Fri', completed: 4, pending: 2 },
  { day: 'Sat', completed: 1, pending: 5 },
  { day: 'Sun', completed: 0, pending: 0 },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { triggerNotification } = useOutletContext();

  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/projects');
      setProjects(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Dashboard sync error:", error);
      triggerNotification("Sync Error", "Could not refresh PlanIT data.", "info");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboardData(); }, []);

  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalProjects = projects.length;
  // Fallback stats until backend integration is complete
  const tasksDone = totalProjects > 0 ? 10 : 0; 
  const tasksTotal = totalProjects > 0 ? 25 : 0;
  const efficiency = totalProjects > 0 ? 40 : 0;

  const handleExportData = () => {
    const dataToExport = JSON.stringify(projects, null, 2);
    const blob = new Blob([dataToExport], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `PlanIT_Backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    triggerNotification("Backup Ready", "PlanIT data has been exported successfully.", "info");
  };

  if (loading) return (
    <div className="h-full flex flex-col justify-center items-center gap-4 bg-gray-50">
      <Loader2 className="animate-spin text-indigo-600" size={48} />
      <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">Loading PlanIT Overview...</p>
    </div>
  );

  return (
    <div className="p-8 bg-gray-50 min-h-screen space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-gray-500 mt-1 font-medium">Welcome back to PlanIT. Here is your academic progress.</p>
        </div>
        
        <div className="flex gap-4">
          <div className="relative w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search workstreams..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-bold text-sm"
            />
          </div>
          <button onClick={handleExportData} className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-md active:scale-95">
            <Download size={18} /> Export Data
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Active Projects</p>
            <h2 className="text-4xl font-black text-gray-900">{totalProjects}</h2>
          </div>
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl"><BookOpen size={32} /></div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tasks Done</p>
              <h2 className="text-4xl font-black text-gray-900 mt-1">{tasksDone} <span className="text-sm text-gray-400">/ {tasksTotal}</span></h2>
            </div>
            <div className="p-3 bg-green-50 text-green-600 rounded-xl"><CheckCircle size={24} /></div>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${efficiency}%` }}></div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
             <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Scholar Efficiency</p>
             <h2 className="text-4xl font-black text-gray-900">{efficiency}%</h2>
             <p className="text-sm text-green-600 font-bold mt-1 flex items-center gap-1"><TrendingUp size={16} /> +5% this week</p>
          </div>
          <div className="h-16 w-16 rounded-full border-[6px] border-indigo-100 border-t-indigo-600"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-indigo-600 rounded-2xl p-8 text-white shadow-lg flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-6 opacity-80"><AlertCircle size={20} /><span className="font-bold uppercase tracking-widest text-xs">PlanIT Insights</span></div>
            <h3 className="text-2xl font-bold mb-3">Excellent!</h3>
            <p className="text-indigo-100 font-medium leading-relaxed">You've finished {efficiency}% of your total workload. Keep using PlanIT to stay ahead of your deadlines.</p>
          </div>
          <div className="mt-8">
            <div className="flex justify-between text-xs font-bold uppercase mb-3 opacity-60"><span>Semester Progress</span><span>Week 6/15</span></div>
            <div className="w-full bg-white/20 rounded-full h-2"><div className="bg-white h-2 rounded-full" style={{ width: '40%' }}></div></div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm lg:col-span-2">
           <h3 className="text-lg font-bold text-gray-900 mb-6 tracking-tight">Weekly Activity Statistics</h3>
           <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mockWeeklyActivity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} />
                  <RechartsTooltip cursor={{fill: '#f9fafb'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}/>
                  <Bar dataKey="completed" name="Completed Tasks" stackId="a" fill="#6366f1" radius={[0, 0, 4, 4]} barSize={30} />
                  <Bar dataKey="pending" name="Pending Tasks" stackId="a" fill="#e0e7ff" radius={[4, 4, 0, 0]} />
                </BarChart>
             </ResponsiveContainer>
           </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-lg font-bold text-gray-900">Workstream Overview</h3>
          <button onClick={() => navigate('/projects')} className="text-indigo-600 font-bold text-sm flex items-center hover:underline transition-all">View All <ChevronRight size={16} className="ml-1" /></button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-400 text-xs font-bold uppercase tracking-wider">
                <th className="p-4">Research Project</th>
                <th className="p-4">Tags</th>
                <th className="p-4">Deadline</th>
                <th className="p-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="text-gray-700">
              {filteredProjects.length === 0 ? (
                <tr><td colSpan="4" className="p-8 text-center text-gray-500 font-medium italic">No projects found in PlanIT.</td></tr>
              ) : (
                filteredProjects.map((project) => (
                  <tr key={project._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => navigate(`/projects/${project._id}`)}>
                    <td className="p-4 font-bold text-gray-900">{project.title}</td>
                    <td className="p-4 flex gap-2">
                        {project.tags?.map((tag, i) => (
                          <span key={i} className="px-2 py-1 bg-indigo-50 text-indigo-600 text-[10px] rounded-md font-bold uppercase">{tag}</span>
                        ))}
                    </td>
                    <td className="p-4 text-sm font-medium text-gray-500">{project.deadline ? new Date(project.deadline).toLocaleDateString() : 'TBD'}</td>
                    <td className="p-4 text-center">
                      <span className="px-3 py-1 bg-amber-50 text-amber-600 border border-amber-200 text-[10px] rounded-full font-bold uppercase">Active</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}