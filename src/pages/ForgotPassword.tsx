import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import axios from 'axios';
import { toast } from 'sonner';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import Logo from '../components/Logo';

const ForgotPassword = () => {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/auth/forgot-password', { email });
            toast.success('OTP sent to your email 📧');
            setStep(2);
        } catch (error) {
            console.error('Failed to send OTP:', error);
            let errorMessage = 'Failed to send OTP';
            if (axios.isAxiosError(error)) {
                errorMessage = error.response?.data?.message || errorMessage;
            }
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/auth/verify-otp', { email, otp });
            toast.success('OTP Verified ✅');
            setStep(3);
        } catch (error) {
            console.error('OTP Verification error:', error);
            let errorMessage = 'Invalid OTP';
            if (axios.isAxiosError(error)) {
                errorMessage = error.response?.data?.message || errorMessage;
            }
            toast.error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }
        setLoading(true);
        try {
            await api.post('/auth/reset-password', { email, otp, password });
            toast.success('Password Reset Successful 🎉');
            navigate('/login');
        } catch (error) {
            console.error('Password reset error:', error);
            let errorMessage = 'Failed to reset password';
            if (axios.isAxiosError(error)) {
                errorMessage = error.response?.data?.message || errorMessage;
            }
            toast.error(errorMessage);
        } finally {
            setLoading(false);
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

          <button onClick={() => navigate('/login')} className="flex items-center text-[#7A94AA] hover:text-[#C9A84C] mb-6 transition-colors font-medium text-sm">
              <ArrowLeft size={16} className="mr-2" /> Back to Login
          </button>

          {/* Form heading */}
          <h1 style={{ color: '#EDF2F7', fontSize: '24px', fontWeight: '500', marginBottom: '8px' }}>
            Reset Password
          </h1>
          <p style={{ color: '#5A7A94', fontSize: '14px', marginBottom: '32px' }}>
            We'll send you a reset link
          </p>

          {step === 1 && (
              <form onSubmit={handleEmailSubmit} className="space-y-5">
                  <p className="text-[#7A94AA] text-center text-sm mb-4">Enter your email and we'll send you an OTP.</p>
                  <input
                      type="email"
                      placeholder="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full p-3.5 bg-[#0F1C2E] border border-[#2E4A63] rounded-xl text-[#EDF2F7] placeholder-[#3D5A73] focus:outline-none focus:border-[#C9A84C] transition-all text-sm"
                      required
                  />
                  <button type="submit" disabled={loading} className="w-full bg-[#C9A84C] text-[#0F1C2E] p-3.5 rounded-xl font-semibold text-sm hover:bg-[#b8963e] active:scale-[0.98] transition-all disabled:opacity-70 mt-2">
                      {loading ? 'Sending...' : 'Send OTP'}
                  </button>
              </form>
          )}

          {step === 2 && (
              <form onSubmit={handleOtpSubmit} className="space-y-5">
                  <div className="text-sm text-center text-[#7A94AA] mb-6 bg-[#1A2B3D] p-4 rounded-xl border border-[#2E4A63]">
                      OTP sent to <span className="text-[#C9A84C] font-semibold">{email}</span>
                  </div>
                  <input
                      type="text"
                      placeholder="000000"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="w-full p-4 bg-[#0F1C2E] border border-[#2E4A63] rounded-xl text-[#EDF2F7] placeholder-[#3D5A73] focus:outline-none focus:border-[#C9A84C] transition-all text-center tracking-[1em] text-2xl font-bold"
                      maxLength={6}
                      required
                  />
                  <button type="submit" disabled={loading} className="w-full bg-[#C9A84C] text-[#0F1C2E] p-3.5 rounded-xl font-semibold text-sm hover:bg-[#b8963e] active:scale-[0.98] transition-all disabled:opacity-70 mt-2">
                      {loading ? 'Verifying...' : 'Verify OTP'}
                  </button>
                  <button type="button" onClick={() => setStep(1)} className="w-full text-[#C9A84C] text-sm font-semibold hover:text-[#b8963e] transition-colors mt-2">
                      Resend OTP / Change Email
                  </button>
              </form>
          )}

          {step === 3 && (
              <form onSubmit={handlePasswordSubmit} className="space-y-5">
                  <div className="relative">
                      <input
                          type={showPassword ? "text" : "password"}
                          placeholder="New Password"
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
                  <input
                      type="password"
                      placeholder="Confirm New Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full p-3.5 bg-[#0F1C2E] border border-[#2E4A63] rounded-xl text-[#EDF2F7] placeholder-[#3D5A73] focus:outline-none focus:border-[#C9A84C] transition-all text-sm"
                      required
                  />
                  <button type="submit" disabled={loading} className="w-full bg-[#C9A84C] text-[#0F1C2E] p-3.5 rounded-xl font-semibold text-sm hover:bg-[#b8963e] active:scale-[0.98] transition-all disabled:opacity-70 mt-2">
                      {loading ? 'Resetting...' : 'Reset Password'}
                  </button>
              </form>
          )}
        </div>
      </div>
    </div>
    );
};

export default ForgotPassword;
