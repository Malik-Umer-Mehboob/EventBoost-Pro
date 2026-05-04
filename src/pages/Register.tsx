import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import ThreeBackground from '../components/ThreeBackground';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', { name, email, password });
      toast.success('Registration Successful 🎉', {
        description: 'Your account has been created. Please login to continue.',
      });
      navigate('/login');
    } catch {
        // Handled by global interceptor
    }
  };

  return (
    <>
    <ThreeBackground />
    <div className="flex justify-center items-center min-h-screen bg-transparent p-4">
      <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 w-full max-w-md transform transition-all duration-300 relative z-10">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Create Account</h2>
          <p className="text-gray-500 text-sm">Join us and start discovering events</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all text-sm"
              required
            />
          </div>
          <div>
            <input
              type="email"
              placeholder="Email (Gmail preferred)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all text-sm"
              required
            />
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password (min 8 chars)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all text-sm pr-12"
              minLength={8}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-indigo-600 transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <button type="submit" className="w-full bg-indigo-600 text-white p-3.5 rounded-xl font-semibold text-sm hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-[0_2px_10px_rgba(79,70,229,0.2)] hover:shadow-[0_4px_14px_rgba(79,70,229,0.3)] mt-4">
            Create Account
          </button>
        </form>
        <div className="mt-8 text-center bg-gray-50 -mx-8 sm:-mx-10 -mb-8 sm:-mb-10 p-6 rounded-b-3xl border-t border-gray-100">
            <p className="text-gray-500 text-sm">
                Already have an account?{' '}
                <a href="/login" className="text-indigo-600 font-semibold hover:text-indigo-700 transition-colors">Sign In</a>
            </p>
        </div>
        </div>
    </div>
    </>
  );
};

export default Register;
