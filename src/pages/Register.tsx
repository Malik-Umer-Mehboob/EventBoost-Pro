import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import Logo from '../components/Logo';

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
            Create Account
          </h1>
          <p style={{ color: '#5A7A94', fontSize: '14px', marginBottom: '32px' }}>
            Join thousands of event lovers
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3.5 bg-[#0F1C2E] border border-[#2E4A63] rounded-xl text-[#EDF2F7] placeholder-[#3D5A73] focus:outline-none focus:border-[#C9A84C] transition-all text-sm"
                required
              />
            </div>
            <div>
              <input
                type="email"
                placeholder="Email (Gmail preferred)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3.5 bg-[#0F1C2E] border border-[#2E4A63] rounded-xl text-[#EDF2F7] placeholder-[#3D5A73] focus:outline-none focus:border-[#C9A84C] transition-all text-sm"
                required
              />
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password (min 8 chars)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3.5 bg-[#0F1C2E] border border-[#2E4A63] rounded-xl text-[#EDF2F7] placeholder-[#3D5A73] focus:outline-none focus:border-[#C9A84C] transition-all text-sm pr-12"
                minLength={8}
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
            <button type="submit" className="w-full bg-[#C9A84C] text-[#0F1C2E] p-3.5 rounded-xl font-semibold text-sm hover:bg-[#b8963e] active:scale-[0.98] transition-all shadow-[0_2px_10px_rgba(201,168,76,0.2)] mt-4">
              Create Account
            </button>
          </form>
          <div className="mt-8 text-center pt-6 border-t border-[#2E4A63]">
              <p className="text-[#7A94AA] text-sm">
                  Already have an account?{' '}
                  <a href="/login" className="text-[#C9A84C] font-semibold hover:text-[#b8963e] transition-colors">Sign In</a>
              </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
