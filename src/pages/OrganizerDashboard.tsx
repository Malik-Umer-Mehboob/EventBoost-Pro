import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Calendar, 
  Users, 
  BarChart3, 
  Edit3, 
  Trash2, 
  Sparkles, 
  RefreshCw, 
  Slash,
  Layers,
  Activity,
  DollarSign,
  MapPin,
  Camera,
  X,
  ArrowUpRight
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';
import CancelEventModal from '../components/CancelEventModal';
import { deleteEvent } from '../api/eventApi';
import { useRealTime } from '../hooks/useRealTime';
import { toast } from 'sonner';
import api from '../api/axios';
import { getOrganizerProfile, updateOrganizerProfile } from '../api/organizerApi';
import { updateProfilePicture } from '../api/userApi';
import { useAuth } from '../context/AuthContext';
import RevenueChart from '../components/analytics/RevenueChart';
import AttendeeTable from '../components/analytics/AttendeeTable';
import Skeleton from '../components/common/Skeleton';
import { Event, OrgStats, ChartData, Attendee, User, AxiosErrorResponse, AxiosErrorData } from '../types';

const StatCard: React.FC<{ label: string; value: string | number; icon: LucideIcon; trend?: string; color: string; delay: number }> = ({ label, value, icon: Icon, trend, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -5, transition: { duration: 0.2 } }}
    transition={{ delay }}
    className="relative overflow-hidden bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all group"
  >
    <div className={`absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity ${color}`} />
    
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-2xl ${color.replace('bg-', 'bg-opacity-10 bg-').replace('from-', '').replace('to-', '')} ${color.includes('indigo') ? 'text-indigo-600' : color.includes('emerald') ? 'text-emerald-600' : color.includes('rose') ? 'text-rose-600' : 'text-amber-600'} border border-white/50`}>
        <Icon className="w-6 h-6" />
      </div>
      {trend && (
        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-bold">
          <ArrowUpRight className="w-3 h-3" />
          {trend}
        </div>
      )}
    </div>
    
    <div>
      <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest mb-1">{label}</p>
      <h3 className="text-3xl font-black text-slate-900 tracking-tight">{value}</h3>
    </div>
  </motion.div>
);

const OrganizerDashboard: React.FC = () => {
  const { user, login } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState<OrgStats | null>(null);
  const [monthlySales, setMonthlySales] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const { socket } = useRealTime();

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [eventToCancel, setEventToCancel] = useState<Event | null>(null);

  const [attendeeEvent, setAttendeeEvent] = useState<Event | null>(null);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [attendeeLoading, setAttendeeLoading] = useState(false);

  const navigate = useNavigate();

  const fetchDashboard = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const { data } = await api.get('/organizers/analytics');
      setEvents(data.events || []);
      setStats(data.stats || null);
      setMonthlySales(data.monthlySales || []);
      
      const profileData = await getOrganizerProfile();
      setProfile(profileData);
      setEditName(profileData.name);
    } catch {
      toast.error('Failed to load organizer data');
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  useEffect(() => {
    if (!socket) return;
    const handleUpdate = () => fetchDashboard(true);
    socket.on('event:updated', handleUpdate);
    socket.on('event:attendee_count', handleUpdate);
    return () => {
      socket.off('event:updated', handleUpdate);
      socket.off('event:attendee_count', handleUpdate);
    };
  }, [socket, fetchDashboard]);

  const handleSaveProfile = async () => {
    try {
      const updated = await updateOrganizerProfile(editName);
      setProfile(updated);
      if (user) login({ ...user, name: updated.name });
      toast.success('Profile updated!');
      setIsEditing(false);
    } catch {
      toast.error('Failed to update profile');
    }
  };

  const handleProfileUpload = async (file: File | null) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('profilePicture', file);
    try {
      const data = await updateProfilePicture(formData);
      if (user) login({ ...user, ...data });
      setProfile((prev) => prev ? ({ ...prev, ...data }) : null);
      toast.success('Profile picture updated!');
    } catch (error: unknown) {
      const err = error as AxiosErrorResponse;
      const message = (err.response?.data as AxiosErrorData)?.message || 'Failed to update profile picture';
      toast.error(message);
    }
  };

  const openAttendees = async (event: Event) => {
    setAttendeeEvent(event);
    setAttendeeLoading(true);
    try {
      const { data } = await api.get(`/organizers/events/${event._id}/attendees?limit=200`);
      setAttendees(data.attendees || []);
    } catch {
      toast.error('Could not load attendees');
    } finally {
      setAttendeeLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) return;
    try {
      await deleteEvent(id);
      toast.success('Event deleted successfully');
      fetchDashboard();
    } catch {
      toast.error('Failed to delete event');
    }
  };

  const handleCancelSuccess = () => {
    fetchDashboard(true);
    setCancelModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pt-24 pb-12 px-4 sm:px-6 lg:px-8 font-sans selection:bg-indigo-100 selection:text-indigo-900 relative overflow-hidden">
      {/* Premium Background Pattern */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] [background-size:24px_24px]" />
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-gradient-to-bl from-indigo-100/50 via-purple-100/30 to-transparent blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-gradient-to-tr from-rose-100/40 via-pink-100/20 to-transparent blur-[100px]" />
      </div>

      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
        
        {/* Top Navigation & Welcome */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
             <motion.div 
               initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
               className="flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 rounded-full w-fit shadow-sm backdrop-blur-md"
             >
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Organizer Hub v2.0</span>
             </motion.div>
             <div className="space-y-1">
                <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                  Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-500">{profile?.name?.split(' ')[0] || 'Organizer'}</span>
                </h1>
                <p className="text-slate-400 font-medium">Manage your event ecosystem with precision and style.</p>
             </div>
          </div>
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ rotate: 180, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              transition={{ duration: 0.4 }}
              onClick={() => fetchDashboard()}
              className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-indigo-600 hover:border-indigo-100 shadow-sm transition-all"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </motion.button>
            <Link
              to="/create-event"
              className="px-8 py-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-rose-500 bg-[length:200%_auto] hover:bg-[100%_center] text-white rounded-[1.5rem] font-bold text-sm flex items-center justify-center gap-3 shadow-2xl shadow-purple-200 transition-all duration-500 active:scale-95 group"
            >
              <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
              CREATE EVENT
            </Link>
          </div>
        </div>

        {/* Stat Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {loading ? Array(4).fill(0).map((_, i) => (
            <div key={i} className="bg-white/80 backdrop-blur-sm p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
              <Skeleton width={48} height={48} borderRadius={16} />
              <div className="space-y-2">
                <Skeleton width="40%" height={12} />
                <Skeleton width="80%" height={28} />
              </div>
            </div>
          )) : (
            <>
              <StatCard label="Total Events" value={stats?.totalEvents ?? 0} icon={Layers} trend="+2 new" color="bg-indigo-500" delay={0} />
              <StatCard label="Tickets Sold" value={stats?.totalSold ?? 0} icon={Users} trend="12.5%" color="bg-emerald-500" delay={0.1} />
              <StatCard label="Net Revenue" value={stats ? `$${stats.totalRevenue.toLocaleString()}` : '$0'} icon={DollarSign} trend="8.4%" color="bg-rose-500" delay={0.2} />
              <StatCard label="Upcoming" value={stats?.upcomingEvents ?? 0} icon={Activity} color="bg-amber-500" delay={0.3} />
            </>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-10">
            {/* Chart Section */}
            {(loading || monthlySales.length > 0) && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                className="bg-white/90 backdrop-blur-lg p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden"
              >
                <div className="flex items-center justify-between mb-8 relative z-10">
                  <div>
                    <h2 className="text-[14px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                       <BarChart3 className="w-5 h-5 text-indigo-500" />
                       Performance Data
                    </h2>
                    <p className="text-sm text-slate-400 font-medium">Visualized growth over the last 6 months</p>
                  </div>
                </div>
                {loading ? <Skeleton width="100%" height={300} /> : (
                  <RevenueChart
                    data={monthlySales}
                    lines={[
                      { key: 'registrations', label: 'Tickets', color: '#6366f1' },
                      { key: 'revenue', label: 'Revenue', color: '#10b981' },
                    ]}
                  />
                )}
              </motion.div>
            )}

            {/* My Events Cards List */}
            <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">Active Library</h2>
                  <p className="text-sm text-slate-400 font-medium">Monitor your high-impact events</p>
                </div>
                <div className="px-5 py-2 bg-indigo-50 border border-indigo-100 rounded-2xl text-[11px] font-black text-indigo-600 uppercase tracking-widest shadow-sm">
                  {events.length} TOTAL EVENTS
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 gap-6">
                  {Array(3).fill(0).map((_, i) => (
                    <div key={i} className="bg-white p-5 rounded-[2.5rem] border border-slate-100 flex gap-6">
                      <Skeleton width={120} height={120} borderRadius={24} />
                      <div className="flex-1 space-y-4 pt-2">
                        <Skeleton width="60%" height={24} />
                        <Skeleton width="40%" height={14} />
                        <Skeleton width="100%" height={10} borderRadius={10} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : events.length === 0 ? (
                <div className="bg-white/80 backdrop-blur-md py-24 rounded-[3rem] border border-dashed border-slate-200 flex flex-col items-center text-center shadow-inner">
                  <div className="w-24 h-24 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner">
                    <Calendar className="w-12 h-12 text-slate-200" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-800 tracking-tight">Your event list is clean.</h3>
                  <p className="text-slate-400 mb-8 max-w-xs font-medium">Ready to start your next big community gather?</p>
                  <Link to="/create-event" className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm hover:shadow-2xl hover:shadow-indigo-200 transition-all active:scale-95 uppercase tracking-widest">Launch Event</Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6">
                  <AnimatePresence mode='popLayout'>
                    {events.map((event, idx) => {
                      const progress = event.ticketQuantity ? Math.round(((event.soldTickets || 0) / event.ticketQuantity) * 100) : 0;
                      return (
                        <motion.div
                          key={event._id}
                          layout
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          transition={{ delay: idx * 0.05, type: "spring", stiffness: 100 }}
                          className="group bg-white p-6 rounded-[2.5rem] border border-slate-100 hover:border-indigo-100 shadow-sm hover:shadow-2xl hover:shadow-indigo-100/30 transition-all flex flex-col md:flex-row items-center gap-8 relative overflow-hidden"
                        >
                          <div className="w-full md:w-36 h-36 rounded-[2rem] overflow-hidden bg-slate-100 relative shadow-2xl shrink-0">
                            <img 
                              src={event.bannerImage?.url || 'https://images.unsplash.com/photo-1540575861501-7cf05a4b125a?q=80&w=400'} 
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" 
                              alt="" 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute top-3 left-3 px-3 py-1 bg-white/95 backdrop-blur-md rounded-xl text-[9px] font-black text-slate-900 uppercase tracking-[0.1em] shadow-xl">
                              {event.category}
                            </div>
                          </div>

                          <div className="flex-1 w-full space-y-5">
                            <div className="flex flex-wrap items-start justify-between gap-4">
                              <div className="space-y-1">
                                <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-indigo-600 group-hover:to-pink-500 transition-all duration-300">
                                  {event.title}
                                </h3>
                                <div className="flex items-center gap-5 text-slate-400 text-xs font-semibold">
                                  <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-indigo-50 rounded-lg text-indigo-500">
                                      <Calendar className="w-3.5 h-3.5" />
                                    </div>
                                    {new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <div className="p-1.5 bg-rose-50 rounded-lg text-rose-500">
                                      <MapPin className="w-3.5 h-3.5" />
                                    </div>
                                    {event.location}
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {event.isFeatured && (
                                  <span className="px-4 py-1.5 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 text-purple-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-purple-500/20 shadow-sm">Featured</span>
                                )}
                                {event.category === 'Concert' && (
                                  <span className="px-4 py-1.5 bg-blue-500/10 text-blue-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-blue-500/20">Concert</span>
                                )}
                                {event.status === 'active' ? (
                                  <span className="px-4 py-1.5 bg-emerald-500/10 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-500/20">Live</span>
                                ) : (
                                  <span className="px-4 py-1.5 bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-full">Draft</span>
                                )}
                              </div>
                            </div>

                            <div className="space-y-3">
                              <div className="flex justify-between items-end">
                                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Attendance Load</span>
                                <span className="text-sm font-black text-slate-900">{progress}% <span className="text-slate-300 font-medium ml-1">({event.soldTickets || 0}/{event.ticketQuantity || 0})</span></span>
                              </div>
                              <div className="h-3 w-full bg-slate-100/50 rounded-full overflow-hidden p-0.5 border border-slate-100 shadow-inner">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${progress}%` }}
                                  transition={{ delay: 0.2, duration: 1 }}
                                  className="h-full bg-gradient-to-r from-purple-600 via-indigo-600 to-rose-500 rounded-full shadow-lg" 
                                />
                              </div>
                            </div>
                          </div>

                          <div className="flex md:flex-col gap-3 shrink-0 border-t md:border-t-0 md:border-l border-slate-100 pt-6 md:pt-0 md:pl-8 w-full md:w-auto">
                             <motion.button
                               whileHover={{ scale: 1.05, backgroundColor: '#f0fdf4' }}
                               whileTap={{ scale: 0.95 }}
                               onClick={() => openAttendees(event)}
                               className="flex-1 p-4 bg-slate-50 text-slate-400 hover:text-emerald-600 rounded-[1.5rem] transition-all group/btn"
                               title="Guest List"
                             >
                                <Users className="w-6 h-6 mx-auto" />
                             </motion.button>
                             <motion.button
                               whileHover={{ scale: 1.05, backgroundColor: '#eff6ff' }}
                               whileTap={{ scale: 0.95 }}
                               onClick={() => navigate(`/edit-event/${event._id}`)}
                               className="flex-1 p-4 bg-slate-50 text-slate-400 hover:text-blue-600 rounded-[1.5rem] transition-all group/btn"
                               title="Refine Listing"
                             >
                                <Edit3 className="w-6 h-6 mx-auto" />
                             </motion.button>
                             <motion.button
                               whileHover={{ scale: 1.05, backgroundColor: '#fff7ed' }}
                               whileTap={{ scale: 0.95 }}
                               disabled={event.status === 'cancelled'}
                               onClick={() => { setEventToCancel(event); setCancelModalOpen(true); }}
                               className={`flex-1 p-4 rounded-[1.5rem] transition-all group/btn ${event.status === 'cancelled' ? 'bg-slate-50 opacity-50 cursor-not-allowed' : 'bg-slate-50 text-slate-400 hover:text-amber-600'}`}
                               title={event.status === 'cancelled' ? 'Already Cancelled' : 'Hold Event'}
                             >
                                <Slash className="w-6 h-6 mx-auto" />
                             </motion.button>
                             <motion.button
                               whileHover={{ scale: 1.05, backgroundColor: '#fef2f2' }}
                               whileTap={{ scale: 0.95 }}
                               onClick={() => handleDelete(event._id)}
                               className="flex-1 p-4 bg-slate-50 text-slate-400 hover:text-rose-600 rounded-[1.5rem] transition-all group/btn"
                               title="Purge"
                             >
                                <Trash2 className="w-6 h-6 mx-auto" />
                             </motion.button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-10 lg:sticky lg:top-28 h-fit">
            {/* Minimalist Profile SaaS Card */}
            <motion.div 
               initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
               className="bg-white/90 backdrop-blur-md p-10 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/50 relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-purple-50 rounded-full -mr-24 -mt-24 blur-3xl opacity-60" />
              
              <div className="relative flex flex-col items-center text-center space-y-6">
                <div className="relative">
                  <div className="w-28 h-28 rounded-[2.5rem] bg-gradient-to-br from-purple-600 to-rose-500 p-1.5 shadow-2xl relative z-10 transition-transform duration-500 hover:rotate-6">
                    <div className="w-full h-full rounded-[2.2rem] bg-white overflow-hidden flex items-center justify-center border-4 border-white shadow-inner">
                       {profile?.profilePicture?.url ? (
                         <img src={profile.profilePicture.url} className="w-full h-full object-cover" alt="" />
                       ) : <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-br from-purple-600 to-rose-500">{profile?.name?.charAt(0)}</span>}
                    </div>
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.1 }}
                    className="absolute -bottom-2 -right-2 p-3 bg-white rounded-2xl shadow-xl border border-slate-100 text-indigo-600 transition-all z-20 overflow-hidden"
                  >
                    <Camera className="w-5 h-5" />
                    <input 
                      type="file" 
                      onChange={(e) => handleProfileUpload(e.target.files ? e.target.files[0] : null)}
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                    />
                  </motion.button>
                </div>

                <div className="space-y-4 w-full">
                  {isEditing ? (
                    <div className="space-y-3">
                      <input 
                        type="text" 
                        value={editName} 
                        onChange={(e) => setEditName(e.target.value)}
                        className="w-full px-5 py-4 rounded-[1.5rem] bg-slate-50 border border-slate-200 outline-none focus:border-purple-500 font-bold text-center tracking-tight"
                      />
                      <div className="flex gap-2">
                        <button onClick={handleSaveProfile} className="flex-1 py-3 bg-slate-900 text-white rounded-2xl font-black text-[10px] tracking-widest">SAVE</button>
                        <button onClick={() => setIsEditing(false)} className="flex-1 py-3 bg-slate-100 text-slate-500 rounded-2xl font-black text-[10px] tracking-widest">CANCEL</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight">{profile?.name || 'Organizer'}</h3>
                        <p className="text-[11px] text-slate-400 font-bold uppercase tracking-[0.2em]">{profile?.email}</p>
                      </div>
                      <button 
                        onClick={() => setIsEditing(true)}
                        className="w-full py-4 border border-slate-100 rounded-[1.5rem] font-black text-[10px] text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-all flex items-center justify-center gap-3 tracking-[0.2em]"
                      >
                        <Edit3 className="w-4 h-4" />
                        EDIT PROFILE
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="mt-10 pt-10 border-t border-slate-100 grid grid-cols-2 gap-6 relative z-10">
                  <div className="text-center group-hover:translate-y-[-2px] transition-transform">
                    <p className="text-3xl font-black text-slate-900 leading-none mb-1">{events.length}</p>
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Owned</p>
                  </div>
                  <div className="text-center group-hover:translate-y-[-2px] transition-transform">
                    <p className="text-3xl font-black text-slate-900 leading-none mb-1">{stats?.totalSold || 0}</p>
                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Impact</p>
                  </div>
              </div>
            </motion.div>

            {/* Newsletter / Action Card */}
            <motion.div 
               initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
               className="bg-slate-900 p-10 rounded-[3rem] text-white relative overflow-hidden group shadow-2xl shadow-indigo-900/20"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500 rounded-full blur-[80px] opacity-20" />
              <Sparkles className="absolute top-6 right-6 text-indigo-400 w-14 h-14 opacity-20 group-hover:scale-125 transition-transform duration-700" />
              <div className="relative z-10 space-y-6">
                <div className="space-y-2">
                  <h3 className="text-2xl font-black tracking-tight leading-tight">Scale your audience.</h3>
                  <p className="text-slate-400 text-sm font-medium leading-relaxed">Early access to personalized marketing campaigns starts next week.</p>
                </div>
                <button className="w-full py-4 bg-white text-slate-900 rounded-2xl font-black text-[10px] tracking-widest hover:bg-slate-50 transition-all uppercase">
                  JOIN WAITLIST
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Modals & Overlays */}
      <AnimatePresence>
        {attendeeEvent && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setAttendeeEvent(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col"
            >
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 text-indigo-600 font-bold text-[10px] uppercase tracking-widest mb-1">
                    <Users className="w-3.5 h-3.5" /> Guest List
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">{attendeeEvent.title}</h2>
                </div>
                <button onClick={() => setAttendeeEvent(null)} className="p-3 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all">
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>
              <div className="p-8 overflow-y-auto">
                <AttendeeTable attendees={attendees} loading={attendeeLoading} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {eventToCancel && (
        <CancelEventModal
          isOpen={cancelModalOpen}
          onClose={() => setCancelModalOpen(false)}
          onSuccess={handleCancelSuccess}
          event={eventToCancel}
        />
      )}
    </div>
  );
};

export default OrganizerDashboard;
