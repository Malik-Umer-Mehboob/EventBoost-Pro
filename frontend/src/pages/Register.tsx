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
    } catch (error: any) {
        // Handled by global interceptor
    }
  };

  return (
    <>
    <ThreeBackground />
    <div className="flex justify-center items-center min-h-screen bg-transparent p-4">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300">
        <h2 className="text-3xl font-extrabold mb-8 text-center text-white tracking-tight">Create Account</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
              required
            />
          </div>
          <div>
            <input
              type="email"
              placeholder="Email (Gmail only)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all"
              required
            />
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password (min 8 chars)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all pr-12"
              minLength={8}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <button type="submit" className="w-full bg-green-600 text-white p-3 rounded-xl font-semibold hover:bg-green-700 active:scale-[0.98] transition-all shadow-lg shadow-green-600/20">
            Create Account
          </button>
        </form>
        <div className="mt-8 text-center border-t border-white/10 pt-6">
            <p className="text-gray-400">
                Already have an account?{' '}
                <a href="/login" className="text-green-400 font-semibold hover:text-green-300 transition-colors underline-offset-4 hover:underline">Login</a>
            </p>
        </div>
        </div>
    </div>
    </>
  );
};

export default Register;
