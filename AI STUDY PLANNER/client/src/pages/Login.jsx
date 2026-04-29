import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser } from '../services/api';
import { LogIn, Mail, Lock, Loader2 } from 'lucide-react';

export default function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Start the spinner
    setError('');     // Clear old errors
    
    try {
      const response = await loginUser(formData);
      const { token } = response.data;

      if (token) {
        localStorage.setItem('token', token);
        navigate('/dashboard');
      }
    } catch (err) {
      // Show the actual error from the backend (e.g., "Invalid password")
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false); // Stop the spinner regardless of success/fail
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full bg-white rounded-3xl shadow-2xl shadow-blue-100/50 p-10 border border-gray-100"
      >
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-blue-600 mb-2 tracking-tight">AI Planner.</h1>
          <p className="text-gray-500 font-medium">Welcome back! Access your smart schedule.</p>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="mb-6 p-4 bg-red-50 text-red-600 text-sm font-semibold rounded-xl border border-red-100">
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="email" required
                className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-blue-50 focus:border-blue-600 outline-none transition-all font-medium"
                placeholder="piyush@example.com"
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-bold text-gray-700">Password</label>
              <a href="#" className="text-xs text-blue-600 font-bold hover:underline">Forgot?</a>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="password" required
                className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-gray-200 focus:ring-4 focus:ring-blue-50 focus:border-blue-600 outline-none transition-all font-medium"
                placeholder="••••••••"
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
          </div>
          
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-gray-900 hover:bg-black text-white font-bold py-4 rounded-xl transition-all shadow-xl flex items-center justify-center gap-2 disabled:opacity-70"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <LogIn size={20} />}
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
        
        <p className="mt-10 text-center text-sm text-gray-500 font-medium">
          Don't have an account? <Link to="/signup" className="text-blue-600 font-bold hover:underline">Create one for free</Link>
        </p>
      </motion.div>
    </div>
  );
}