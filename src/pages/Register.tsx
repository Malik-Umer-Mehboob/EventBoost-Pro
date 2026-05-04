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
      {/* LEFT SIDE — Decorative Panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden" style={{ background: '#08111C' }}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `linear-gradient(rgba(201,168,76,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(201,168,76,0.3) 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full" style={{ width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 70%)' }} />
        <div className="relative z-10">
          <Logo size="lg" />
        </div>
        <div className="relative z-10 space-y-6">
          <h2 style={{ color: '#EDF2F7', fontSize: '28px', fontWeight: '500', lineHeight: '1.3' }}>
            Pakistan's Premier<br />
            <span style={{ color: '#C9A84C' }}>Event Platform</span>
          </h2>
          {[
            { icon: '🎟️', text: 'Book tickets instantly with Stripe' },
            { icon: '🔔', text: 'Real-time event alerts & notifications' },
            { icon: '📊', text: 'Organizer dashboard with analytics' },
            { icon: '🔒', text: 'Secure payments & auto refunds' },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-xl">{item.icon}</span>
              <span style={{ color: '#B8C5D3', fontSize: '14px' }}>{item.text}</span>
            </div>
          ))}
        </div>
        <div className="relative z-10">
          <p style={{ color: '#3D5A73', fontSize: '12px' }}>
            Trusted by organizers across Pakistan
          </p>
        </div>
      </div>

      {/* RIGHT SIDE — Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl p-8" style={{ background: '#162333', border: '0.5px solid #2E4A63' }}>
          <div className="flex justify-center mb-8 lg:hidden">
            <Logo size="lg" />
          </div>
          <h1 style={{ color: '#EDF2F7', fontSize: '24px', fontWeight: '500', marginBottom: '8px' }}>
            Create Account
          </h1>
          <p style={{ color: '#5A7A94', fontSize: '14px', marginBottom: '32px' }}>
            Join thousands of event lovers
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label style={{ color: '#7A94AA', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Full Name</label>
              <input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ background: '#0F1C2E', border: '1px solid #2E4A63', color: '#EDF2F7' }}
                className="w-full p-3.5 rounded-xl placeholder-[#3D5A73] focus:outline-none focus:border-[#C9A84C] transition-all text-sm"
                required
              />
            </div>
            <div>
              <label style={{ color: '#7A94AA', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Email Address</label>
              <input
                type="email"
                placeholder="Email (Gmail preferred)"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ background: '#0F1C2E', border: '1px solid #2E4A63', color: '#EDF2F7' }}
                className="w-full p-3.5 rounded-xl placeholder-[#3D5A73] focus:outline-none focus:border-[#C9A84C] transition-all text-sm"
                required
              />
            </div>
            <div>
              <label style={{ color: '#7A94AA', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password (min 8 chars)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ background: '#0F1C2E', border: '1px solid #2E4A63', color: '#EDF2F7' }}
                  className="w-full p-3.5 rounded-xl placeholder-[#3D5A73] focus:outline-none focus:border-[#C9A84C] transition-all text-sm pr-12"
                  minLength={8}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#7A94AA] hover:text-[#C9A84C] transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <button type="submit" style={{ background: '#C9A84C', color: '#0F1C2E', fontWeight: 500, width: '100%' }} className="p-3.5 rounded-xl text-sm hover:opacity-90 active:scale-[0.98] transition-all mt-4">
              Create Account
            </button>
          </form>

          <div className="mt-8 text-center border-t pt-6" style={{ borderColor: '#2E4A63' }}>
              <p style={{ color: '#5A7A94', fontSize: '14px' }}>
                  Already have an account?{' '}
                  <a href="/login" style={{ color: '#C9A84C', fontWeight: 500 }} className="hover:opacity-80 transition-opacity">Sign In</a>
              </p>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Register;
