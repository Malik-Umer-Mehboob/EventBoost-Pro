import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import axios from 'axios';
import { toast } from 'sonner';
import { Eye, EyeOff } from 'lucide-react';

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error('Passwords do not match');
            return;
        }

        try {
            await api.post(`/auth/reset-password/${token}`, { password });
            toast.success('Password Reset Successful 🎉', {
                description: 'You can now login with your new password.',
                duration: 4000,
            });
            navigate('/login');
        } catch (error) {
            console.error('Password reset error:', error);
            let errorMessage = 'Failed to reset password';
            if (axios.isAxiosError(error)) {
                errorMessage = error.response?.data?.message || errorMessage;
            }
            toast.error('Error', {
                description: errorMessage,
            });
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-[#0F1C2E] p-4">
            <div className="bg-[#162333] p-8 sm:p-10 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.4)] border border-[#2E4A63] w-full max-w-md transform transition-all duration-300 relative z-10">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-[#EDF2F7] tracking-tight mb-2">Reset Password</h2>
                  <p className="text-[#7A94AA] text-sm">Create a new password for your account</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="New Password (min 8 chars)"
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
                        minLength={8}
                        required
                    />
                    <button type="submit" className="w-full bg-[#C9A84C] text-[#0F1C2E] p-3.5 rounded-xl font-semibold text-sm hover:bg-[#b8963e] active:scale-[0.98] transition-all mt-4">
                        Reset Password
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
