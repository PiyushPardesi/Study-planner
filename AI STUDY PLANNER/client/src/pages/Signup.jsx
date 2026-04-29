import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { signupUser } from '../services/api';
import { User, BookOpen, Briefcase, Mail, Lock, UserCircle, Loader2 } from 'lucide-react';

export default function Signup() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'Student' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const roles = [
    { id: 'Student', icon: <BookOpen size={20} /> },
    { id: 'Teacher', icon: <User size={20} /> },
    { id: 'Professional', icon: <Briefcase size={20} /> }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await signupUser(formData);
      const { token } = response.data;

      if (token) {
        localStorage.setItem('token', token);
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || "Account creation failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-10 border border-gray-100"
      >
        <h2 className="text-3xl font-black text-gray-900 mb-2 text-center tracking-tight">Join AI Planner</h2>
        <p className="text-gray-500 text-center mb-8 font-medium">Personalize your AI study experience.</p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 text-sm font-bold rounded-xl border border-red-100 italic">
            ⚠️ {error}
          </div>
        )}

        {/* Interactive Role Selection */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          {roles.map((r) => (
            <button 
              key={r.id}
              type="button"
              onClick={() => setFormData({ ...formData, role: r.id })}
              className={`p-4 rounded-2xl flex flex-col items-center gap-2 transition-all border-2 ${
                formData.role === r.id 
                  ? 'border-blue-600 bg-blue-50 text-blue-700' 
                  : 'border-gray-50 bg-gray-50 text-gray-400 hover:border-gray-200'
              }`}
            >
              {r.icon}
              <span className="text-[10px] font-black uppercase tracking-tighter">{r.id}</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" required
              className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-blue-50 focus:border-blue-600 outline-none transition-all font-medium"
              placeholder="Full Name"
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="email" required
              className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-blue-50 focus:border-blue-600 outline-none transition-all font-medium"
              placeholder="Email Address"
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="password" required
              className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-blue-50 focus:border-blue-600 outline-none transition-all font-medium"
              placeholder="Password"
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-xl shadow-blue-100 mt-4 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : null}
            {loading ? 'Creating Account...' : 'Get Started'}
          </button>
        </form>
        
        <p className="mt-8 text-center text-sm text-gray-500 font-medium">
          Already have an account? <Link to="/login" className="text-blue-600 font-bold hover:underline">Log in</Link>
        </p>
      </motion.div>
    </div>
  );
}