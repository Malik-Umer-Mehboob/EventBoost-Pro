import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import Logo from '../components/Logo';
import GoogleButton from '../components/GoogleButton';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
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
      } else if (data.role === 'organizer') {
          navigate('/organizer/dashboard');
      } else {
          navigate('/dashboard');
      }
    } catch {
       // Handled by global interceptor
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/google`;
  };

  return (
    <div className="min-h-screen flex" style={{ background: '#0F1C2E' }}>
      {/* LEFT SIDE — Decorative Panel (hidden on mobile) */}
      <div
        className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: '#08111C' }}
      >
        {/* Decorative grid lines */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(201,168,76,0.3) 1px, transparent 1px),
              linear-gradient(90deg, rgba(201,168,76,0.3) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Glowing circle */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: '400px',
            height: '400px',
            background: 'radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%)',
          }}
        />

        {/* Top — Logo */}
        <div className="relative z-10">
          <Logo size="lg" />
        </div>

        {/* Heading */}
        <div className="relative z-10 space-y-8">
          <div>
            {/* Logo name */}
            <div style={{
              fontFamily: "'Bebas Neue', sans-serif",
              letterSpacing: '0.1em',
              marginBottom: '16px',
            }}>
              <span style={{ color: '#EDF2F7', fontSize: '38px', fontWeight: '400' }}>
                EVENT
              </span>
              <span style={{ color: '#C9A84C', fontSize: '38px', fontWeight: '400' }}>
                BOOST
              </span>
              <span style={{
                display: 'block',
                color: '#5A7A94',
                fontSize: '12px',
                letterSpacing: '0.4em',
                marginTop: '-4px'
              }}>
                PRO
              </span>
            </div>

            {/* Tagline */}
            <div style={{ marginBottom: '8px' }}>
              <h2 style={{
                color: '#EDF2F7',
                fontSize: '20px',
                fontWeight: '500',
                lineHeight: '1.4',
                marginBottom: '10px'
              }}>
                Where Great Events
                <span style={{ color: '#C9A84C' }}> Come to Life</span>
              </h2>
              <p style={{
                color: '#5A7A94',
                fontSize: '13px',
                lineHeight: '1.7'
              }}>
                Discover, book, and experience unforgettable events 
                across Pakistan — all in one place.
              </p>
            </div>
          </div>

          {/* Feature list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              {
                icon: '🎟️',
                title: 'Instant Ticket Booking',
                desc: 'Secure payments powered by Stripe'
              },
              {
                icon: '🔔',
                title: 'Real-Time Alerts',
                desc: 'Live event updates via Socket.io'
              },
              {
                icon: '📊',
                title: 'Organizer Dashboard',
                desc: 'Analytics, sales tracking & management'
              },
              {
                icon: '🔒',
                title: 'Safe & Secure',
                desc: 'Auto refunds & encrypted transactions'
              },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                {/* Icon box */}
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  background: 'rgba(201,168,76,0.1)',
                  border: '1px solid rgba(201,168,76,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  flexShrink: 0,
                }}>
                  {item.icon}
                </div>
                {/* Text */}
                <div>
                  <div style={{ color: '#EDF2F7', fontSize: '14px', fontWeight: '500', marginBottom: '2px' }}>
                    {item.title}
                  </div>
                  <div style={{ color: '#5A7A94', fontSize: '12px', lineHeight: '1.5' }}>
                    {item.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom stat bar */}
          <div style={{
            display: 'flex',
            gap: '24px',
            paddingTop: '24px',
            borderTop: '1px solid #1A2B3D'
          }}>
            
          </div>
        </div>
      </div>

      {/* RIGHT SIDE — Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div
          className="w-full max-w-md rounded-2xl p-8"
          style={{
            background: '#162333',
            border: '0.5px solid #2E4A63',
          }}
        >
          {/* Mobile logo (only visible on small screens) */}
          <div className="flex justify-center mb-8 lg:hidden">
            <Logo size="lg" />
          </div>

          {/* Form heading */}
          <h1 style={{ color: '#EDF2F7', fontSize: '24px', fontWeight: '500', marginBottom: '8px' }}>
            Welcome Back
          </h1>
          <p style={{ color: '#5A7A94', fontSize: '14px', marginBottom: '32px' }}>
            Sign in to your account to continue
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3.5 bg-[#0F1C2E] border border-[#2E4A63] rounded-xl text-[#EDF2F7] placeholder-[#3D5A73] focus:outline-none focus:border-[#C9A84C] transition-all text-sm"
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
                  className="w-full p-3.5 bg-[#0F1C2E] border border-[#2E4A63] rounded-xl text-[#EDF2F7] placeholder-[#3D5A73] focus:outline-none focus:border-[#C9A84C] transition-all text-sm pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#5A7A94] hover:text-[#C9A84C] transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="text-right mt-2">
                <a href="/forgot-password" className="text-xs font-medium text-[#C9A84C] hover:text-[#b8963e] transition-colors">Forgot Password?</a>
              </div>
            </div>
            <button type="submit" className="w-full bg-[#C9A84C] text-[#0F1C2E] p-3.5 rounded-xl font-semibold text-sm hover:bg-[#b8963e] active:scale-[0.98] transition-all shadow-[0_2px_10px_rgba(201,168,76,0.2)] mt-2">
              Sign In
            </button>
          </form>
          <div className="mt-8">
              <div className="relative flex items-center mb-6">
                  <div className="flex-grow border-t border-[#2E4A63]"></div>
                  <span className="flex-shrink mx-4 text-[#5A7A94] text-xs font-medium uppercase tracking-wider">Or continue with</span>
                  <div className="flex-grow border-t border-[#2E4A63]"></div>
              </div>
              <div className="w-full [&>button]:w-full [&>button]:justify-center [&>button]:py-3.5 [&>button]:bg-[#1A2B3D] [&>button]:border [&>button]:border-[#2E4A63] [&>button]:text-[#B8C5D3] [&>button]:font-medium [&>button]:text-sm hover:[&>button]:border-[#C9A84C] hover:[&>button]:text-[#C9A84C] [&>button]:transition-all [&>button]:rounded-xl">
                 <GoogleButton onClick={handleGoogleLogin} text="Google" />
              </div>
          </div>
          <div className="mt-8 text-center pt-6 border-t border-[#2E4A63]">
              <p className="text-[#7A94AA] text-sm">
                  Don't have an account?{' '}
                  <a href="/register" className="text-[#C9A84C] font-semibold hover:text-[#b8963e] transition-colors">Register for free</a>
              </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
