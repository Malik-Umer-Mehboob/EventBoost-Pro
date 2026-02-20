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
        <div className="flex justify-center items-center h-screen bg-transparent">
            <div className="bg-white p-8 rounded shadow-md w-96">
                <button onClick={() => navigate('/login')} className="flex items-center text-gray-500 hover:text-gray-700 mb-4">
                    <ArrowLeft size={16} className="mr-1" /> Back to Login
                </button>
                
                <h2 className="text-2xl font-bold mb-6 text-center">
                    {step === 1 && 'Forgot Password'}
                    {step === 2 && 'Enter OTP'}
                    {step === 3 && 'Reset Password'}
                </h2>

                {step === 1 && (
                    <form onSubmit={handleEmailSubmit} className="space-y-4">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-2 border rounded"
                            required
                        />
                        <button type="submit" disabled={loading} className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-blue-300">
                            {loading ? 'Sending...' : 'Send OTP'}
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={handleOtpSubmit} className="space-y-4">
                        <div className="text-sm text-center text-gray-600 mb-2">
                            OTP sent to {email}
                        </div>
                        <input
                            type="text"
                            placeholder="Enter 6-digit OTP"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            className="w-full p-2 border rounded text-center tracking-widest text-lg"
                            maxLength={6}
                            required
                        />
                        <button type="submit" disabled={loading} className="w-full bg-green-500 text-white p-2 rounded hover:bg-green-600 disabled:bg-green-300">
                            {loading ? 'Verifying...' : 'Verify OTP'}
                        </button>
                        <button type="button" onClick={() => setStep(1)} className="w-full text-blue-500 text-sm hover:underline">
                            Resend OTP / Change Email
                        </button>
                    </form>
                )}

                {step === 3 && (
                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="New Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-2 border rounded pr-10"
                                minLength={8}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        <input
                            type="password"
                            placeholder="Confirm New Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full p-2 border rounded"
                            required
                        />
                        <button type="submit" disabled={loading} className="w-full bg-purple-500 text-white p-2 rounded hover:bg-purple-600 disabled:bg-purple-300">
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
