import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import ThreeBackground from '../components/ThreeBackground';
import GoogleButton from '../components/GoogleButton';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    // Check for token in URL (from Google Auth redirect)
    const token = searchParams.get('token');
    if (token) {
        // Fetch user data with token
        api.get('/auth/me', { headers: { Authorization: `Bearer ${token}` } })
            .then(res => {
                login({ ...res.data, token });
                navigate('/dashboard');
            })
            .catch(err => console.error(err));
    }
  }, [searchParams, login, navigate]);

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/auth/login', { email, password });
      login(data);
      toast.success('Login Successful 🔥', {
        description: 'Welcome back!',
      });

      if (data.role === 'admin') {
          navigate('/admin/dashboard');
      } else if (data.role === 'organizer') { // Check logic if organizer needs separate dashboard
          navigate('/organizer/dashboard');
      } else {
          navigate('/dashboard');
      }
    } catch (error: any) {
      // Handled by global interceptor
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5000/api/auth/google';
  };

  return (
    <>
    <ThreeBackground />
    <div className="flex justify-center items-center min-h-screen bg-transparent p-4">
      <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300">
        <h2 className="text-3xl font-extrabold mb-8 text-center text-white tracking-tight">Welcome Back</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              required
            />
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all pr-12"
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
          <div className="text-right">
            <a href="/forgot-password" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">Forgot Password?</a>
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-xl font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all shadow-lg shadow-blue-600/20">
            Sign In
          </button>
        </form>
        <div className="mt-8">
            <div className="relative flex items-center mb-6">
                <div className="flex-grow border-t border-white/10"></div>
                <span className="flex-shrink mx-4 text-gray-400 text-sm">Or continue with</span>
                <div className="flex-grow border-t border-white/10"></div>
            </div>
            <GoogleButton onClick={handleGoogleLogin} text="Google" />
        </div>
        <div className="mt-8 text-center">
            <p className="text-gray-400">
                Don't have an account?{' '}
                <a href="/register" className="text-blue-400 font-semibold hover:text-blue-300 transition-colors underline-offset-4 hover:underline">Register</a>
            </p>
        </div>
        </div>
    </div>
    </>
  );
};

export default Login;
