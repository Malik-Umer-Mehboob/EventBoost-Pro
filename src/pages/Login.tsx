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
    } catch {
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
      <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 w-full max-w-md transform transition-all duration-300 relative z-10">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight mb-2">Welcome Back</h2>
          <p className="text-gray-500 text-sm">Sign in to your account to continue</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all text-sm"
              required
            />
          </div>
          <div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all text-sm pr-12"
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
            <div className="text-right mt-2">
              <a href="/forgot-password" className="text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors">Forgot Password?</a>
            </div>
          </div>
          <button type="submit" className="w-full bg-indigo-600 text-white p-3.5 rounded-xl font-semibold text-sm hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-[0_2px_10px_rgba(79,70,229,0.2)] hover:shadow-[0_4px_14px_rgba(79,70,229,0.3)] mt-2">
            Sign In
          </button>
        </form>
        <div className="mt-8">
            <div className="relative flex items-center mb-6">
                <div className="flex-grow border-t border-gray-100"></div>
                <span className="flex-shrink mx-4 text-gray-400 text-xs font-medium uppercase tracking-wider">Or continue with</span>
                <div className="flex-grow border-t border-gray-100"></div>
            </div>
            <div className="w-full [&>button]:w-full [&>button]:justify-center [&>button]:py-3.5 [&>button]:bg-white [&>button]:border [&>button]:border-gray-200 [&>button]:text-gray-700 [&>button]:font-medium [&>button]:text-sm [&>button]:shadow-sm hover:[&>button]:bg-gray-50 [&>button]:transition-all [&>button]:rounded-xl">
               <GoogleButton onClick={handleGoogleLogin} text="Google" />
            </div>
        </div>
        <div className="mt-8 text-center bg-gray-50 -mx-8 sm:-mx-10 -mb-8 sm:-mb-10 p-6 rounded-b-3xl border-t border-gray-100">
            <p className="text-gray-500 text-sm">
                Don't have an account?{' '}
                <a href="/register" className="text-indigo-600 font-semibold hover:text-indigo-700 transition-colors">Register for free</a>
            </p>
        </div>
        </div>
    </div>
    </>
  );
};

export default Login;
