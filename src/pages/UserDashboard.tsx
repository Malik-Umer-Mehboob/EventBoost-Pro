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
import { useRealTime } from '../hooks/useRealTime';
import { Booking, AxiosErrorResponse, AxiosErrorData } from '../types';
import { getMyWaitlist, leaveWaitlist } from '../api/waitlistApi';
import { AlertCircle, ArrowRight, Tag } from 'lucide-react';

const TABS = [
  { id: 'upcoming', label: 'Upcoming Events', icon: Clock },
  { id: 'past', label: 'Past Events', icon: HistoryIcon },
  { id: 'waitlist', label: 'Waitlist', icon: Calendar },
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
      
      // Update local storage and context state
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
      
      // Fetch Waitlist
      const wl = await getMyWaitlist();
      setWaitlist(wl || []);
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

  // Polling for pending payments
  useEffect(() => {
    if (!hasPending) return;
    const interval = setInterval(() => fetchTickets(), 3000);
    return () => clearInterval(interval);
  }, [hasPending, fetchTickets]);

  // Real-time socket updates
  useEffect(() => {
    if (!socket) return;

    const handleUpdate = () => {
      fetchDashboard(false); // Refresh dashboard stats/lists silently
      fetchTickets(); // Refresh ticket status
    };

    socket.on('event:updated', handleUpdate);
    socket.on('booking:updated', handleUpdate); // Assuming we might add this later

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
      
      // Update local storage and context state
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

  const displayed = tab === 'upcoming' ? upcoming : past;

  return (
    <div className="min-h-screen bg-navy-900 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">

        {/* Profile Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-navy-700 p-8 sm:p-10 rounded-[40px] mb-12 shadow-[0_8px_30px_rgb(0,0,0,0.2)] border border-navy-600"
        >
          <div className="flex flex-col md:flex-row items-center gap-10">
            {/* Circular Profile Picture */}
            <div className="relative group">
              <div className="w-40 h-40 rounded-full border-4 border-navy-800 shadow-2xl overflow-hidden bg-gradient-to-br from-navy-600 to-navy-800 flex items-center justify-center text-navy-100 text-6xl font-black relative">
                {user?.profilePicture?.url ? (
                  <img src={user.profilePicture.url} className="w-full h-full object-cover" alt="" />
                ) : user?.name?.charAt(0)}
                
                {/* Upload Overlay */}
                <div className="absolute inset-0 bg-navy-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center cursor-pointer">
                  <div className="relative w-full h-full">
                    <ImageUploader 
                      onImageSelect={handleProfileUpload}
                      currentImage={user?.profilePicture?.url}
                      aspectRatio="square"
                      label=""
                    />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex flex-col items-center gap-1">
                      <Camera className="w-8 h-8 text-gold" />
                      <span className="text-[10px] font-black text-gold uppercase tracking-widest">Change</span>
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
                    <label className="text-[10px] font-black text-gold uppercase tracking-widest pl-1 block">Full Name</label>
                    <input 
                      type="text" 
                      value={editData.name} 
                      onChange={(e) => setEditData({...editData, name: e.target.value})}
                      className="w-full px-5 py-3 rounded-2xl bg-navy-900/50 backdrop-blur-sm border border-navy-600 focus:border-gold outline-none transition-all font-bold text-navy-100"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gold uppercase tracking-widest pl-1 block">Email Address</label>
                    <input 
                      type="email" 
                      value={editData.email} 
                      disabled
                      className="w-full px-5 py-3 rounded-2xl bg-navy-800/50 backdrop-blur-sm border border-navy-600 outline-none transition-all font-bold cursor-not-allowed text-navy-400"
                    />
                  </div>
                  <div className="flex justify-center md:justify-start gap-3 pt-2">
                    <button 
                      onClick={handleSaveProfile}
                      className="flex items-center gap-2 px-6 py-3 bg-gold text-navy-900 rounded-2xl font-bold hover:bg-[#b8963e] transition-all shadow-lg active:scale-95"
                    >
                      <Save className="w-4 h-4" /> Save
                    </button>
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="flex items-center gap-2 px-6 py-3 bg-navy-800 text-navy-200 border border-navy-600 rounded-2xl font-bold hover:bg-navy-600 transition-all active:scale-95"
                    >
                      <CloseIcon className="w-4 h-4" /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-center md:justify-start gap-4 flex-wrap">
                    <h1 className="text-4xl md:text-5xl font-black text-navy-100 tracking-tight leading-none">{user?.name}</h1>
                    <button 
                      onClick={() => setIsEditing(true)}
                      className="p-2.5 hover:bg-navy-800 text-gold rounded-xl transition-all bg-navy-900 border border-navy-600 shadow-sm"
                      title="Edit Profile"
                    >
                      <EditIcon className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-lg md:text-xl text-navy-400 font-medium">{user?.email}</p>
                  
                  <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-6 pt-6 border-t border-dashed border-navy-600">
                    <div className="text-center px-6 py-3 bg-navy-800 rounded-2xl border border-navy-600 shadow-sm">
                      <p className="text-[10px] text-navy-400 font-bold uppercase tracking-widest mb-1 leading-none">Bookings</p>
                      <p className="text-xl font-black text-gold leading-tight">{totalBookings}</p>
                    </div>
                    <div className="text-center px-6 py-3 bg-navy-800 rounded-2xl border border-emerald-900/50 shadow-sm">
                      <p className="text-[10px] text-navy-400 font-bold uppercase tracking-widest mb-1 leading-none">Investment</p>
                      <p className="text-xl font-black text-emerald-400 leading-tight">${totalSpend.toLocaleString()}</p>
                    </div>
                    <Link
                      to="/profile/transactions"
                      className="group flex flex-col items-center justify-center bg-navy-800 border border-navy-600 px-6 py-3 rounded-2xl shadow-sm hover:border-gold hover:bg-navy-600 transition-all"
                    >
                      <CreditCard className="w-5 h-5 text-gold mb-1 group-hover:scale-110 transition-transform" />
                      <p className="text-[10px] text-navy-400 font-bold uppercase tracking-widest group-hover:text-gold transition-colors">History</p>
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
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all ${
                tab === t.id
                  ? 'bg-gold text-navy-900 shadow-lg shadow-gold/10'
                  : 'bg-navy-800 text-navy-400 border border-navy-600 hover:border-gold hover:text-gold'
              }`}
            >
              <t.icon className="w-4 h-4" />
              {t.label}
              <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] font-black ${
                tab === t.id ? 'bg-navy-900/30 text-navy-900' : 'bg-navy-700 text-navy-400'
              }`}>
                {t.id === 'upcoming' ? upcoming.length : t.id === 'past' ? past.length : waitlist.length}
              </span>
            </button>
          ))}
        </div>

        {/* Ticket List */}
        <div className="space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 gap-6">
              {Array(3).fill(0).map((_, i) => (
                <div key={i} className="bg-navy-700 p-8 rounded-3xl border border-navy-600 shadow-sm flex items-center gap-6">
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
              <div className="text-center py-24 bg-navy-700 rounded-[32px] border-2 border-dashed border-navy-600 shadow-sm">
                <div className="bg-navy-800 inline-flex p-6 rounded-full mb-4">
                    <Calendar className="w-12 h-12 text-navy-500" />
                </div>
                <h3 className="text-xl font-bold text-navy-100">Your waitlist is empty</h3>
                <p className="text-navy-400 mb-6 font-medium">You haven't joined any event waitlists yet.</p>
                <Link to="/events" className="bg-gold text-navy-900 px-8 py-3 rounded-xl font-bold hover:scale-105 transition-all inline-block">
                  Browse Events
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {waitlist.map((entry, i) => (
                  <motion.div 
                    key={entry._id} 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    transition={{ delay: i * 0.04 }}
                    className="bg-navy-700 p-6 sm:p-8 rounded-[32px] border border-navy-600 shadow-sm flex flex-col md:flex-row items-center gap-6"
                  >
                    <div className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 border border-navy-600 bg-navy-800">
                      <img 
                        src={entry.event.bannerImage?.url || 'https://images.unsplash.com/photo-1540575861501-7cf05a4b125a?q=80&w=200'} 
                        alt="" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-1 text-center md:text-left space-y-2">
                      <div className="flex flex-wrap justify-center md:justify-start gap-2">
                        <span className="px-3 py-0.5 bg-navy-800 text-gold text-[9px] font-black uppercase tracking-widest rounded-full border border-navy-600">
                          {entry.event.category || 'Event'}
                        </span>
                        {entry.status === 'notified' ? (
                          <span className="px-3 py-0.5 bg-emerald-950/30 text-emerald-400 text-[9px] font-black uppercase tracking-widest rounded-full border border-emerald-900/50 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Spot Available
                          </span>
                        ) : entry.status === 'expired' ? (
                          <span className="px-3 py-0.5 bg-rose-950/30 text-rose-400 text-[9px] font-black uppercase tracking-widest rounded-full border border-rose-900/50 flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" /> Expired
                          </span>
                        ) : (
                          <span className="px-3 py-0.5 bg-navy-800 text-navy-400 text-[9px] font-black uppercase tracking-widest rounded-full border border-navy-600 flex items-center gap-1">
                            <Tag className="w-3 h-3 text-gold" /> Waiting
                          </span>
                        )}
                      </div>
                      <h3 className="text-xl font-black text-navy-100 tracking-tight">{entry.event.title}</h3>
                      <p className="text-sm text-navy-400 font-medium">{new Date(entry.event.date).toLocaleDateString(undefined, { dateStyle: 'full' })}</p>
                    </div>

                    <div className="flex flex-col items-center md:items-end gap-4 min-w-[140px]">
                      <div className="text-center md:text-right">
                         <p className="text-[10px] text-navy-500 font-black uppercase tracking-widest mb-0.5">Position</p>
                         <p className="text-2xl font-black text-gold">#{entry.position}</p>
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={async () => {
                            try {
                              await leaveWaitlist(entry.event._id);
                              toast.success('Left waitlist');
                              fetchDashboard(false);
                            } catch (error) {
                              toast.error('Failed to leave waitlist');
                            }
                          }}
                          className="p-3 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all border border-rose-500/20 text-[10px] font-black uppercase tracking-widest"
                        >
                          Leave
                        </button>
                        <Link 
                          to={`/events/${entry.event._id}`}
                          className="p-3 bg-navy-800 text-gold hover:bg-navy-600 rounded-xl transition-all border border-navy-600 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest"
                        >
                          View <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )
          ) : displayed.length === 0 ? (
            <div className="text-center py-24 bg-navy-700 rounded-[32px] border-2 border-dashed border-navy-600 shadow-sm">
              <div className="bg-navy-800 inline-flex p-6 rounded-full mb-4">
                  {tab === 'upcoming'
                    ? <Calendar className="w-12 h-12 text-navy-500" />
                    : <HistoryIcon className="w-12 h-12 text-navy-500" />
                  }
              </div>
              <h3 className="text-xl font-bold text-navy-100">
                {tab === 'upcoming' ? 'No upcoming events' : 'No past events'}
              </h3>
              <p className="text-navy-400 mb-6 font-medium">
                {tab === 'upcoming' ? "You don't have any upcoming events." : "Your event history will appear here."}
              </p>
              {tab === 'upcoming' && (
                <Link to="/events" className="bg-gold text-navy-900 px-8 py-3 rounded-xl font-bold hover:scale-105 transition-all inline-block">
                  Browse Events
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {displayed.map((booking, i) => (
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
