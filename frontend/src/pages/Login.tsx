import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import ThreeBackground from '../components/ThreeBackground';

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
    <div className="flex justify-center items-center h-screen bg-transparent">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Login</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          <div className="text-right">
            <a href="/forgot-password" className="text-sm text-blue-500 hover:underline">Forgot Password?</a>
          </div>
          <button type="submit" className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600">
            Login
          </button>
        </form>
        <div className="mt-4 text-center">
            <p>Or</p>
            <button 
                onClick={handleGoogleLogin}
                className="w-full bg-red-500 text-white p-2 rounded hover:bg-red-600 mt-2"
            >
                Login with Google
            </button>
        </div>
        <div className="mt-4 text-center">
            <a href="/register" className="text-blue-500 hover:underline">Don't have an account? Register</a>
        </div>
        </div>
    </div>
    </>
  );
};

export default Login;
