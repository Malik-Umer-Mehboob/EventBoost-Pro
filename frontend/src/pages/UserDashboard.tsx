import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, CreditCard, Clock, History as HistoryIcon, Edit3 as EditIcon, Save, X as CloseIcon, Camera } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from '../api/axios';
import TicketCard from '../components/dashboard/TicketCard';
import ImageUploader from '../components/common/ImageUploader';
import Skeleton from '../components/common/Skeleton';
import { updateProfilePicture } from '../api/userApi';
import { toast } from 'sonner';

const TABS = [
  { id: 'upcoming', label: 'Upcoming Events', icon: Clock },
  { id: 'past', label: 'Past Events', icon: HistoryIcon },
];

const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const [upcoming, setUpcoming] = useState([]);
  const [past, setPast] = useState([]);
  const [totalSpend, setTotalSpend] = useState(0);
  const [totalBookings, setTotalBookings] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ name: user?.name || '', email: user?.email || '' });

  useEffect(() => {
    if (user) setEditData({ name: user.name, email: user.email });
  }, [user]);

  const handleSaveProfile = async () => {
    try {
      // Logic for updating name/email API call would go here
      // For now, simulating success as the backend endpoint needs to be verified/implemented for name/email updates
      await axios.put('/users/profile', editData);
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch {
      toast.error('Failed to update profile');
    }
  };

  // Also fetch raw tickets for the polling logic
  const [hasPending, setHasPending] = useState(false);

  const fetchDashboard = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const { data } = await axios.get('/bookings/my-dashboard');
      setUpcoming(data.upcoming || []);
      setPast(data.past || []);
      setTotalSpend(data.totalSpend || 0);
      setTotalBookings(data.totalBookings || 0);
    } catch {
      console.error('Failed to fetch user dashboard');
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  const fetchTickets = useCallback(async () => {
    try {
      const { data } = await axios.get('/bookings/my-tickets');
      const pending = data.some((b: any) => b.paymentStatus === 'pending');
      setHasPending(pending);
      if (pending) fetchDashboard(false);
    } catch {}
  }, [fetchDashboard]);

  useEffect(() => { fetchDashboard(); fetchTickets(); }, [fetchDashboard, fetchTickets]);

  // Polling for pending payments
  useEffect(() => {
    if (!hasPending) return;
    const interval = setInterval(() => fetchTickets(), 3000);
    return () => clearInterval(interval);
  }, [hasPending, fetchTickets]);

  const handleProfileUpload = async (file: File | null) => {
    if (!file) return;
    
    const formData = new FormData();
    formData.append('profilePicture', file);

    try {
      await updateProfilePicture(formData);
      toast.success('Profile picture updated!');
      // Refresh logic or reload
      window.location.reload(); 
    } catch (error: any) {
      toast.error('Failed to update profile picture');
    }
  };

  const displayed = tab === 'upcoming' ? upcoming : past;

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">

        {/* Profile Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-8 rounded-[40px] mb-12 shadow-2xl shadow-indigo-100 border border-white/40"
        >
          <div className="flex flex-col md:flex-row items-center gap-10">
            {/* Circular Profile Picture */}
            <div className="relative group">
              <div className="w-40 h-40 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-6xl font-black relative">
                {user?.profilePicture?.url ? (
                  <img src={user.profilePicture.url} className="w-full h-full object-cover" alt="" />
                ) : user?.name?.charAt(0)}
                
                {/* Upload Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer">
                  <div className="relative w-full h-full">
                    <ImageUploader 
                      onImageSelect={handleProfileUpload}
                      currentImage={user?.profilePicture?.url}
                      aspectRatio="square"
                      label=""
                    />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex flex-col items-center gap-1">
                      <Camera className="w-8 h-8 text-white" />
                      <span className="text-[10px] font-black text-white uppercase tracking-widest">Change</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Editable Info */}
            <div className="flex-1 text-center md:text-left space-y-6">
              {isEditing ? (
                <div className="space-y-4 max-w-md mx-auto md:mx-0">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest pl-1 block">Full Name</label>
                    <input 
                      type="text" 
                      value={editData.name} 
                      onChange={(e) => setEditData({...editData, name: e.target.value})}
                      className="w-full px-5 py-3 rounded-2xl bg-white/50 backdrop-blur-sm border border-indigo-100 focus:border-indigo-500 outline-none transition-all font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-indigo-600 uppercase tracking-widest pl-1 block">Email Address</label>
                    <input 
                      type="email" 
                      value={editData.email} 
                      onChange={(e) => setEditData({...editData, email: e.target.value})}
                      className="w-full px-5 py-3 rounded-2xl bg-white/50 backdrop-blur-sm border border-indigo-100 focus:border-indigo-500 outline-none transition-all font-bold"
                    />
                  </div>
                  <div className="flex justify-center md:justify-start gap-3 pt-2">
                    <button 
                      onClick={handleSaveProfile}
                      className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg active:scale-95"
                    >
                      <Save className="w-4 h-4" /> Save
                    </button>
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="flex items-center gap-2 px-6 py-3 bg-white text-gray-600 border border-gray-100 rounded-2xl font-bold hover:bg-gray-50 transition-all active:scale-95"
                    >
                      <CloseIcon className="w-4 h-4" /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-center md:justify-start gap-4 flex-wrap">
                    <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-none">{user?.name}</h1>
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="p-2.5 hover:bg-indigo-50 text-indigo-500 rounded-xl transition-all bg-white border border-gray-100 shadow-sm"
                      title="Edit Profile"
                    >
                      <EditIcon className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-lg md:text-xl text-gray-400 font-medium">{user?.email}</p>
                  
                  <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-6 pt-6 border-t border-dashed border-gray-100">
                    <div className="text-center px-6 py-3 bg-white rounded-2xl border border-gray-100 shadow-sm">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1 leading-none">Bookings</p>
                      <p className="text-xl font-black text-indigo-600 leading-tight">{totalBookings}</p>
                    </div>
                    <div className="text-center px-6 py-3 bg-white rounded-2xl border border-emerald-100 shadow-sm">
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1 leading-none">Investment</p>
                      <p className="text-xl font-black text-emerald-600 leading-tight">${totalSpend.toLocaleString()}</p>
                    </div>
                    <Link
                      to="/profile/transactions"
                      className="group flex flex-col items-center justify-center bg-white border border-gray-100 px-6 py-3 rounded-2xl shadow-sm hover:border-indigo-200 hover:bg-indigo-50/30 transition-all"
                    >
                      <CreditCard className="w-5 h-5 text-indigo-600 mb-1 group-hover:scale-110 transition-transform" />
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest group-hover:text-indigo-600 transition-colors">History</p>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as 'upcoming' | 'past')}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all ${
                tab === t.id
                  ? 'gradient-primary text-white shadow-lg shadow-indigo-100'
                  : 'bg-white text-gray-500 border border-gray-100 hover:border-indigo-200 hover:text-indigo-600'
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
              <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-black ${
                tab === t.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'
              }`}>
                {t.id === 'upcoming' ? upcoming.length : past.length}
              </span>
            </button>
          ))}
        </div>

        {/* Ticket List */}
        <div className="space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 gap-6">
              {Array(3).fill(0).map((_, i) => (
                <div key={i} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-6">
                  <Skeleton width={80} height={80} className="rounded-2xl" />
                  <div className="flex-1 space-y-3">
                    <Skeleton width="40%" height={24} />
                    <Skeleton width="60%" height={16} />
                  </div>
                  <Skeleton width={120} height={48} className="rounded-2xl" />
                </div>
              ))}
            </div>
          ) : displayed.length === 0 ? (
            <div className="text-center py-24 glass rounded-3xl border-2 border-dashed border-gray-200">
              <div className="bg-gray-100 inline-flex p-6 rounded-full mb-4">
                  {tab === 'upcoming'
                    ? <Calendar className="w-12 h-12 text-gray-300" />
                    : <HistoryIcon className="w-12 h-12 text-gray-300" />
                  }
              </div>
              <h3 className="text-xl font-bold text-gray-800">
                {tab === 'upcoming' ? 'No upcoming events' : 'No past events'}
              </h3>
              <p className="text-gray-500 mb-6 font-medium">
                {tab === 'upcoming' ? "You don't have any upcoming events." : "Your event history will appear here."}
              </p>
              {tab === 'upcoming' && (
                <Link to="/events" className="gradient-primary text-white px-8 py-3 rounded-xl font-bold hover:scale-105 transition-all inline-block">
                  Browse Events
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {displayed.map((booking: any, i) => (
                <motion.div key={booking._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <TicketCard booking={booking} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
