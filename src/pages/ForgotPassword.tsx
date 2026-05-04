import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import axios from 'axios';
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
        <>
        <ThreeBackground />
        <div className="flex justify-center items-center min-h-screen bg-transparent p-4">
            <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border border-gray-100 w-full max-w-md transform transition-all duration-300 relative z-10">
                <button onClick={() => navigate('/login')} className="flex items-center text-gray-500 hover:text-indigo-600 mb-6 transition-colors font-medium text-sm">
                    <ArrowLeft size={16} className="mr-2" /> Back to Login
                </button>
                
                <h2 className="text-3xl font-bold mb-8 text-center text-gray-900 tracking-tight">
                    {step === 1 && 'Reset Password'}
                    {step === 2 && 'Verification'}
                    {step === 3 && 'New Password'}
                </h2>

                {step === 1 && (
                    <form onSubmit={handleEmailSubmit} className="space-y-5">
                        <p className="text-gray-500 text-center text-sm mb-4">Enter your email and we'll send you an OTP.</p>
                        <input
                            type="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all text-sm"
                            required
                        />
                        <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white p-3.5 rounded-xl font-semibold text-sm hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-[0_2px_10px_rgba(79,70,229,0.2)] hover:shadow-[0_4px_14px_rgba(79,70,229,0.3)] disabled:opacity-70 mt-2">
                            {loading ? 'Sending...' : 'Send OTP'}
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleOtpSubmit} className="space-y-5">
                        <div className="text-sm text-center text-gray-500 mb-6 bg-indigo-50/50 p-4 rounded-xl border border-indigo-100/50">
                            OTP sent to <span className="text-indigo-700 font-semibold">{email}</span>
                        </div>
                        <input
                            type="text"
                            placeholder="000000"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all text-center tracking-[1em] text-2xl font-bold"
                            maxLength={6}
                            required
                        />
                        <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white p-3.5 rounded-xl font-semibold text-sm hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-[0_2px_10px_rgba(79,70,229,0.2)] hover:shadow-[0_4px_14px_rgba(79,70,229,0.3)] disabled:opacity-70 mt-2">
                            {loading ? 'Verifying...' : 'Verify OTP'}
                        </button>
                        <button type="button" onClick={() => setStep(1)} className="w-full text-indigo-600 text-sm font-semibold hover:text-indigo-700 transition-colors mt-2">
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
                                className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all text-sm pr-12"
                                minLength={8}
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
                        <input
                            type="password"
                            placeholder="Confirm New Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full p-3.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all text-sm"
                            required
                        />
                        <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white p-3.5 rounded-xl font-semibold text-sm hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-[0_2px_10px_rgba(79,70,229,0.2)] hover:shadow-[0_4px_14px_rgba(79,70,229,0.3)] disabled:opacity-70 mt-2">
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
