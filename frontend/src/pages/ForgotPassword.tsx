import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { toast } from 'sonner';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import ThreeBackground from '../components/ThreeBackground';

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
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to send OTP');
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
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Invalid OTP');
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
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to reset password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
        <ThreeBackground />
        <div className="flex justify-center items-center min-h-screen bg-transparent p-4">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 p-8 rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300">
                <button onClick={() => navigate('/login')} className="flex items-center text-gray-400 hover:text-white mb-6 transition-colors">
                    <ArrowLeft size={18} className="mr-2" /> Back to Login
                </button>
                
                <h2 className="text-3xl font-extrabold mb-8 text-center text-white tracking-tight">
                    {step === 1 && 'Reset Password'}
                    {step === 2 && 'Verification'}
                    {step === 3 && 'New Password'}
                </h2>

                {step === 1 && (
                    <form onSubmit={handleEmailSubmit} className="space-y-6">
                        <p className="text-gray-400 text-center text-sm mb-2">Enter your email and we'll send you an OTP.</p>
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            required
                        />
                        <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white p-3 rounded-xl font-semibold hover:bg-blue-700 active:scale-[0.98] transition-all shadow-lg shadow-blue-600/20 disabled:bg-blue-800/50">
                            {loading ? 'Sending...' : 'Send OTP'}
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleOtpSubmit} className="space-y-6">
                        <div className="text-sm text-center text-gray-400 mb-4 bg-white/5 p-3 rounded-lg border border-white/5">
                            OTP sent to <span className="text-white font-medium">{email}</span>
                        </div>
                        <input
                            type="text"
                            placeholder="000000"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all text-center tracking-[1em] text-2xl font-bold"
                            maxLength={6}
                            required
                        />
                        <button type="submit" disabled={loading} className="w-full bg-green-600 text-white p-3 rounded-xl font-semibold hover:bg-green-700 active:scale-[0.98] transition-all shadow-lg shadow-green-600/20 disabled:bg-green-800/50">
                            {loading ? 'Verifying...' : 'Verify OTP'}
                        </button>
                        <button type="button" onClick={() => setStep(1)} className="w-full text-blue-400 text-sm font-medium hover:text-blue-300 transition-colors">
                            Resend OTP / Change Email
                        </button>
                    </form>
                )}

                {step === 3 && (
                    <form onSubmit={handlePasswordSubmit} className="space-y-6">
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="New Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all pr-12"
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
                        <input
                            type="password"
                            placeholder="Confirm New Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                            required
                        />
                        <button type="submit" disabled={loading} className="w-full bg-purple-600 text-white p-3 rounded-xl font-semibold hover:bg-purple-700 active:scale-[0.98] transition-all shadow-lg shadow-purple-600/20 disabled:bg-purple-800/50">
                            {loading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                )}
            </div>
        </div>
        </>
    );
};

export default ForgotPassword;
