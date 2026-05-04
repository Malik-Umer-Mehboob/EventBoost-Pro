import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, CreditCard, Clock, History as HistoryIcon, Edit3 as EditIcon, Save, X as CloseIcon, Camera, List } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from '../api/axios';
import TicketCard from '../components/dashboard/TicketCard';
import WaitlistCard from '../components/dashboard/WaitlistCard';
import ImageUploader from '../components/common/ImageUploader';
import Skeleton from '../components/common/Skeleton';
import { updateProfilePicture } from '../api/userApi';
import { getMyWaitlist, leaveWaitlist } from '../api/waitlistApi';
import { toast } from 'sonner';
import { useRealTime } from '../hooks/useRealTime';
import { Booking, AxiosErrorResponse, AxiosErrorData } from '../types';

const TABS = [
  { id: 'upcoming', label: 'Upcoming Events', icon: Clock },
  { id: 'past', label: 'Past Events', icon: HistoryIcon },
  { id: 'waitlist', label: 'Waitlist', icon: List },
] as const;

type TabType = typeof TABS[number]['id'];

const UserDashboard: React.FC = () => {
  const { user, login } = useAuth();
  const [tab, setTab] = useState<TabType>('upcoming');
  const [upcoming, setUpcoming] = useState<Booking[]>([]);
  const [past, setPast] = useState<Booking[]>([]);
  const [waitlist, setWaitlist] = useState<any[]>([]);
  const [totalSpend, setTotalSpend] = useState(0);
  const [totalBookings, setTotalBookings] = useState(0);
  const [loading, setLoading] = useState(true);
  const { socket } = useRealTime();

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ name: user?.name || '', email: user?.email || '' });

  useEffect(() => {
    if (user) setEditData({ name: user.name, email: user.email });
  }, [user]);

  const handleSaveProfile = async () => {
    try {
      const { data } = await axios.patch('/users/profile', { name: editData.name });
      if (user) {
        login({ ...user, ...data });
      }
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile');
    }
  };

  const [hasPending, setHasPending] = useState(false);

  const fetchDashboard = useCallback(async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const { data } = await axios.get('/bookings/my-dashboard');
      setUpcoming(data.upcoming || []);
      setPast(data.past || []);
      setTotalSpend(data.totalSpend || 0);
      setTotalBookings(data.totalBookings || 0);
      
      const waitlistData = await getMyWaitlist();
      setWaitlist(waitlistData || []);
    } catch (error) {
      console.error('Failed to fetch user dashboard:', error);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, []);

  const fetchTickets = useCallback(async () => {
    try {
      const { data } = await axios.get<Booking[]>('/bookings/my-tickets');
      const pending = data.some((b) => b.paymentStatus === 'pending');
      setHasPending(pending);
      if (pending) fetchDashboard(false);
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
    }
  }, [fetchDashboard]);

  useEffect(() => { fetchDashboard(); fetchTickets(); }, [fetchDashboard, fetchTickets]);

  const handleLeaveWaitlist = async (eventId: string) => {
    try {
      await leaveWaitlist(eventId);
      toast.success('Removed from waitlist');
      setWaitlist(prev => prev.filter(entry => entry.event._id !== eventId));
    } catch (error) {
      toast.error('Failed to leave waitlist');
    }
  };

  useEffect(() => {
    if (!hasPending) return;
    const interval = setInterval(() => fetchTickets(), 3000);
    return () => clearInterval(interval);
  }, [hasPending, fetchTickets]);

  useEffect(() => {
    if (!socket) return;

    const handleUpdate = () => {
      fetchDashboard(false);
      fetchTickets();
    };

    socket.on('event:updated', handleUpdate);
    socket.on('booking:updated', handleUpdate);

    return () => {
      socket.off('event:updated', handleUpdate);
      socket.off('booking:updated', handleUpdate);
    };
  }, [socket, fetchDashboard, fetchTickets]);

  const handleProfileUpload = async (file: File | null) => {
    if (!file) return;

    const formData = new FormData();
    formData.append('profilePicture', file);

    try {
      const data = await updateProfilePicture(formData);
      if (user) {
        login({ ...user, ...data });
      }
      toast.success('Profile picture updated!');
    } catch (error: unknown) {
      const err = error as AxiosErrorResponse;
      const message = (err.response?.data as AxiosErrorData)?.message || 'Failed to update profile picture';
      toast.error(message);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1C2E] pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#162333] p-8 sm:p-10 rounded-[40px] mb-12 shadow-[0_8px_30px_rgb(0,0,0,0.3)] border border-[#2E4A63]"
        >
          <div className="flex flex-col md:flex-row items-center gap-10">
            {/* Circular Profile Picture */}
            <div className="relative group">
              <div className="w-40 h-40 rounded-full border-4 border-[#2E4A63] shadow-2xl overflow-hidden bg-gradient-to-br from-[#C9A84C] to-[#b8963e] flex items-center justify-center text-[#0F1C2E] text-6xl font-black relative">
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
                    <label className="text-[10px] font-black text-[#C9A84C] uppercase tracking-widest pl-1 block">Full Name</label>
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) => setEditData({...editData, name: e.target.value})}
                      className="w-full px-5 py-3 rounded-2xl bg-[#0F1C2E] border border-[#2E4A63] focus:border-[#C9A84C] outline-none transition-all font-bold text-[#EDF2F7]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-[#C9A84C] uppercase tracking-widest pl-1 block">Email Address</label>
                    <input
                      type="email"
                      value={editData.email}
                      disabled
                      className="w-full px-5 py-3 rounded-2xl bg-[#1A2B3D] border border-[#2E4A63] outline-none transition-all font-bold cursor-not-allowed text-[#5A7A94]"
                    />
                  </div>
                  <div className="flex justify-center md:justify-start gap-3 pt-2">
                    <button
                      onClick={handleSaveProfile}
                      className="flex items-center gap-2 px-6 py-3 bg-[#C9A84C] text-[#0F1C2E] rounded-2xl font-bold hover:bg-[#b8963e] transition-all shadow-lg active:scale-95"
                    >
                      <Save className="w-4 h-4" /> Save
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex items-center gap-2 px-6 py-3 bg-[#1A2B3D] text-[#B8C5D3] border border-[#2E4A63] rounded-2xl font-bold hover:bg-[#2E4A63] transition-all active:scale-95"
                    >
                      <CloseIcon className="w-4 h-4" /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-center md:justify-start gap-4 flex-wrap">
                    <h1 className="text-4xl md:text-5xl font-black text-[#EDF2F7] tracking-tight leading-none">{user?.name}</h1>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="p-2.5 hover:bg-[#C9A84C]/10 text-[#C9A84C] rounded-xl transition-all bg-[#1A2B3D] border border-[#2E4A63]"
                      title="Edit Profile"
                    >
                      <EditIcon className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-lg md:text-xl text-[#5A7A94] font-medium">{user?.email}</p>

                  <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-6 pt-6 border-t border-dashed border-[#2E4A63]">
                    <div className="text-center px-6 py-3 bg-[#1A2B3D] rounded-2xl border border-[#2E4A63]">
                      <p className="text-[10px] text-[#5A7A94] font-bold uppercase tracking-widest mb-1 leading-none">Bookings</p>
                      <p className="text-xl font-black text-[#C9A84C] leading-tight">{totalBookings}</p>
                    </div>
                    <div className="text-center px-6 py-3 bg-[#1A2B3D] rounded-2xl border border-emerald-700/30">
                      <p className="text-[10px] text-[#5A7A94] font-bold uppercase tracking-widest mb-1 leading-none">Investment</p>
                      <p className="text-xl font-black text-emerald-400 leading-tight">${totalSpend.toLocaleString()}</p>
                    </div>
                    <Link
                      to="/profile/transactions"
                      className="group flex flex-col items-center justify-center bg-[#1A2B3D] border border-[#2E4A63] px-6 py-3 rounded-2xl hover:border-[#C9A84C]/40 hover:bg-[#C9A84C]/10 transition-all"
                    >
                      <CreditCard className="w-5 h-5 text-[#C9A84C] mb-1 group-hover:scale-110 transition-transform" />
                      <p className="text-[10px] text-[#5A7A94] font-bold uppercase tracking-widest group-hover:text-[#C9A84C] transition-colors">History</p>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as TabType)}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all ${
                tab === t.id
                  ? 'bg-[#C9A84C] text-[#0F1C2E] shadow-lg'
                  : 'bg-[#162333] text-[#7A94AA] border border-[#2E4A63] hover:border-[#C9A84C]/40 hover:text-[#C9A84C]'
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
              <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-black ${
                tab === t.id ? 'bg-[#0F1C2E]/20 text-[#0F1C2E]' : 'bg-[#1A2B3D] text-[#5A7A94]'
              }`}>
                {t.id === 'upcoming' ? upcoming.length : t.id === 'past' ? past.length : waitlist.length}
              </span>
            </button>
          ))}
        </div>

        {/* List Content */}
        <div className="space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 gap-6">
              {Array(3).fill(0).map((_, i) => (
                <div key={i} className="bg-[#162333] p-8 rounded-3xl border border-[#2E4A63] flex items-center gap-6">
                  <Skeleton width={80} height={80} className="rounded-2xl" />
                  <div className="flex-1 space-y-3">
                    <Skeleton width="40%" height={24} />
                    <Skeleton width="60%" height={16} />
                  </div>
                  <Skeleton width={120} height={48} className="rounded-2xl" />
                </div>
              ))}
            </div>
          ) : tab === 'waitlist' ? (
            waitlist.length === 0 ? (
              <div className="text-center py-24 bg-[#162333] rounded-[32px] border-2 border-dashed border-[#2E4A63]">
                <div className="bg-[#1A2B3D] inline-flex p-6 rounded-full mb-4">
                  <List className="w-12 h-12 text-[#3D5A73]" />
                </div>
                <h3 className="text-xl font-bold text-[#EDF2F7]">Your waitlist is empty</h3>
                <p className="text-[#7A94AA] mb-6 font-medium">Join waitlists for sold-out events to get notified when spots open up.</p>
                <Link to="/events" className="bg-[#C9A84C] text-[#0F1C2E] px-8 py-3 rounded-xl font-bold hover:bg-[#b8963e] transition-all inline-block">
                  Find Events
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {waitlist.map((entry, i) => (
                  <motion.div key={entry._id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}>
                    <WaitlistCard entry={entry} onLeave={handleLeaveWaitlist} />
                  </motion.div>
                ))}
              </div>
            )
          ) : (tab === 'upcoming' ? upcoming : past).length === 0 ? (
            <div className="text-center py-24 bg-[#162333] rounded-[32px] border-2 border-dashed border-[#2E4A63]">
              <div className="bg-[#1A2B3D] inline-flex p-6 rounded-full mb-4">
                  {tab === 'upcoming'
                    ? <Calendar className="w-12 h-12 text-[#3D5A73]" />
                    : <HistoryIcon className="w-12 h-12 text-[#3D5A73]" />
                  }
              </div>
              <h3 className="text-xl font-bold text-[#EDF2F7]">
                {tab === 'upcoming' ? 'No upcoming events' : 'No past events'}
              </h3>
              <p className="text-[#7A94AA] mb-6 font-medium">
                {tab === 'upcoming' ? "You don't have any upcoming events." : "Your event history will appear here."}
              </p>
              {tab === 'upcoming' && (
                <Link to="/events" className="bg-[#C9A84C] text-[#0F1C2E] px-8 py-3 rounded-xl font-bold hover:bg-[#b8963e] hover:scale-105 transition-all inline-block">
                  Browse Events
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {(tab === 'upcoming' ? upcoming : past).map((booking, i) => (
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
