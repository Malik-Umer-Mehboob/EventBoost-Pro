import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import axios from 'axios';
import { toast } from 'sonner';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import Logo from '../components/Logo';

const ForgotPassword = () => {
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
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
            Reset Password
          </h1>
          <p style={{ color: '#5A7A94', fontSize: '14px', marginBottom: '32px' }}>
            We'll send you a reset link
          </p>

                {step === 1 && (
                    <form onSubmit={handleEmailSubmit} className="space-y-5">
                        <p style={{ color: '#5A7A94', fontSize: '13px', marginBottom: '16px' }}>Provide your email to receive a secure OTP.</p>
                        <div>
                          <label style={{ color: '#7A94AA', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Email Address</label>
                          <input
                              type="email"
                              placeholder="Email address"
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              style={{ background: '#0F1C2E', border: '1px solid #2E4A63', color: '#EDF2F7' }}
                              className="w-full p-3.5 rounded-xl placeholder-[#3D5A73] focus:outline-none focus:border-[#C9A84C] transition-all text-sm"
                              required
                          />
                        </div>
                        <button type="submit" disabled={loading} style={{ background: '#C9A84C', color: '#0F1C2E', fontWeight: 500, width: '100%' }} className="p-3.5 rounded-xl text-sm hover:opacity-90 active:scale-[0.98] transition-all mt-4 disabled:opacity-50">
                            {loading ? 'Sending...' : 'Send OTP'}
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleOtpSubmit} className="space-y-5">
                        <div style={{ background: '#08111C', border: '1px solid #2E4A63' }} className="p-4 rounded-xl text-center mb-6">
                            <span style={{ color: '#7A94AA', fontSize: '12px' }}>Verification code dispatched to:</span><br/>
                            <span style={{ color: '#C9A84C', fontSize: '14px', fontWeight: 500 }}>{email}</span>
                        </div>
                        <div>
                            <label style={{ color: '#7A94AA', fontSize: '13px', display: 'block', marginBottom: '4px' }}>6-Digit OTP</label>
                            <input
                                type="text"
                                placeholder="000000"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                style={{ background: '#0F1C2E', border: '1px solid #2E4A63', color: '#C9A84C', letterSpacing: '0.8em' }}
                                className="w-full p-4 rounded-xl placeholder-[#3D5A73] focus:outline-none focus:border-[#C9A84C] transition-all text-center text-2xl font-bold"
                                maxLength={6}
                                required
                            />
                        </div>
                        <button type="submit" disabled={loading} style={{ background: '#C9A84C', color: '#0F1C2E', fontWeight: 500, width: '100%' }} className="p-3.5 rounded-xl text-sm hover:opacity-90 active:scale-[0.98] transition-all mt-4 disabled:opacity-50">
                            {loading ? 'Authenticating...' : 'Validate OTP'}
                        </button>
                        <button type="button" onClick={() => setStep(1)} style={{ color: '#7A94AA' }} className="w-full text-xs font-medium hover:text-[#C9A84C] transition-colors mt-4">
                            Use a different email
                        </button>
                    </form>
                )}

                {step === 3 && (
                    <form onSubmit={handlePasswordSubmit} className="space-y-5">
                        <div>
                            <label style={{ color: '#7A94AA', fontSize: '13px', display: 'block', marginBottom: '4px' }}>New Password</label>
                            <div className="relative group">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="New Password"
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
                        <div>
                            <label style={{ color: '#7A94AA', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Confirm Password</label>
                            <input
                                type="password"
                                placeholder="Confirm Password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                style={{ background: '#0F1C2E', border: '1px solid #2E4A63', color: '#EDF2F7' }}
                                className="w-full p-3.5 rounded-xl placeholder-[#3D5A73] focus:outline-none focus:border-[#C9A84C] transition-all text-sm"
                                required
                            />
                        </div>
                        <button type="submit" disabled={loading} style={{ background: '#C9A84C', color: '#0F1C2E', fontWeight: 500, width: '100%' }} className="p-3.5 rounded-xl text-sm hover:opacity-90 active:scale-[0.98] transition-all mt-4 disabled:opacity-50">
                            {loading ? 'Updating...' : 'Reset Password'}
                        </button>
                    </form>
                )}

          <div className="mt-8 text-center border-t pt-6" style={{ borderColor: '#2E4A63' }}>
              <button onClick={() => navigate('/login')} style={{ color: '#5A7A94', fontSize: '14px' }} className="flex justify-center items-center w-full hover:opacity-80 transition-opacity">
                  <ArrowLeft size={16} className="mr-2" /> Back to Login
              </button>
          </div>

        </div>
      </div>
    </div>
    );
};

export default ForgotPassword;
