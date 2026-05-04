import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ShieldCheck, Users, Calendar, TrendingUp, DollarSign, Ticket, RefreshCw, Activity, Megaphone, Send } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api/axios';
import { toast } from 'sonner';
import StatsCard from '../components/analytics/StatsCard';
import RevenueChart from '../components/analytics/RevenueChart';
import { format } from 'date-fns';
import { useRealTime } from '../hooks/useRealTime';
import Skeleton from '../components/common/Skeleton';
import { AdminStats, RecentBooking, ChartData, Event } from '../types';

const AdminDashboard = () => {
  const [orgName, setOrgName] = useState('');
  const [orgEmail, setOrgEmail] = useState('');
  const [orgPassword, setOrgPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [monthlySales, setMonthlySales] = useState<ChartData[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [selectedEventId, setSelectedEventId] = useState('');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [allEvents, setAllEvents] = useState<Event[]>([]);

  const navigate = useNavigate();
  const { socket } = useRealTime();

  const fetchDashboard = useCallback(async (isSilent = false) => {
    if (typeof isSilent !== 'boolean') isSilent = false;
    if (!isSilent) setLoadingStats(true);
    try {
      const { data } = await api.get('/admin/dashboard');
      setStats(data.stats);
      setRecentBookings(data.recentBookings || []);
      setMonthlySales(data.monthlySales || []);

      const { data: eventsData } = await api.get('/events');
      setAllEvents(eventsData || []);
    } catch (error) {
      console.error('Dashboard analytics error:', error);
      toast.error('Failed to load dashboard analytics');
    } finally {
      if (!isSilent) setLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  useEffect(() => {
    if (!socket) return;

    const handleUpdate = () => {
      fetchDashboard(true);
    };

    socket.on('event:updated', handleUpdate);
    socket.on('event:attendee_count', handleUpdate);

    return () => {
      socket.off('event:updated', handleUpdate);
      socket.off('event:attendee_count', handleUpdate);
    };
  }, [socket, fetchDashboard]);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMessage) return;

    setIsBroadcasting(true);
    try {
      await api.post('/admin/broadcast', {
        title: broadcastTitle,
        content: broadcastMessage,
        eventId: selectedEventId || null
      });
      toast.success('Broadcast Sent!', { description: selectedEventId ? 'Targeted event alert has been sent.' : 'Platform-wide emergency alert has been sent.' });
      setBroadcastTitle('');
      setBroadcastMessage('');
      setSelectedEventId('');
    } catch (error) {
      console.error('Broadcast error:', error);
      toast.error('Failed to send broadcast');
    } finally {
      setIsBroadcasting(false);
    }
  };

  const handleCreateOrganizer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/create-organizer', { name: orgName, email: orgEmail, password: orgPassword });
      toast.success('Organizer Created 🔥', { description: `${orgName} can now log in.` });
      setOrgName(''); setOrgEmail(''); setOrgPassword('');
    } catch (error) {
      console.error('Organizer creation error:', error);
    }
  };

  const kpiCards = [
    { label: 'Total Users', value: stats?.users ?? '–', icon: Users, color: 'text-[#C9A84C]', bg: 'bg-[#C9A84C]/10', delay: 0 },
    { label: 'Organizers', value: stats?.organizers ?? '–', icon: ShieldCheck, color: 'text-[#7A94AA]', bg: 'bg-[#7A94AA]/10', delay: 0.05 },
    { label: 'Events', value: stats?.events ?? '–', icon: Calendar, color: 'text-[#5A7A94]', bg: 'bg-[#5A7A94]/10', delay: 0.1 },
    { label: 'Total Revenue', value: stats ? `$${stats.revenue.toLocaleString()}` : '–', icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-900/20', delay: 0.15 },
    { label: 'Tickets Sold', value: stats?.ticketsSold ?? '–', icon: Ticket, color: 'text-amber-400', bg: 'bg-amber-900/20', delay: 0.2 },
  ];

  return (
    <div className="min-h-screen bg-[#0F1C2E] pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-xs font-black text-[#C9A84C] uppercase tracking-widest mb-1">Platform Control</p>
            <h1 className="text-4xl font-black text-[#EDF2F7]">Admin Dashboard</h1>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => fetchDashboard(false)}
              className="p-3 bg-[#162333] border border-[#2E4A63] rounded-2xl text-[#5A7A94] hover:text-[#C9A84C] hover:border-[#C9A84C]/40 transition-all"
              title="Refresh Analytics"
            >
              <RefreshCw className={`w-5 h-5 ${loadingStats ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => navigate('/admin/manage-organizers')}
              className="flex items-center gap-2 px-5 py-3 bg-[#162333] border border-[#2E4A63] text-[#B8C5D3] rounded-2xl font-bold hover:border-[#C9A84C]/40 hover:text-[#C9A84C] transition-all"
            >
              <Users className="w-4 h-4" />
              Manage Organizers
            </button>
            <button
              onClick={() => navigate('/admin/transactions')}
              className="flex items-center gap-2 px-5 py-3 bg-[#C9A84C] text-[#0F1C2E] rounded-2xl font-bold hover:bg-[#b8963e] transition-all"
            >
              <ShieldCheck className="w-4 h-4" />
              Transactions
            </button>
          </div>
        </div>

        {/* Emergency Broadcast Section */}
        <div className="bg-[#162333] p-8 sm:p-10 rounded-[32px] mb-10 border border-[#2E4A63] shadow-[0_8px_30px_rgb(0,0,0,0.3)] relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-rose-500 rounded-l-[32px]" />
          <div className="flex items-start gap-4 mb-6">
            <div className="p-4 bg-rose-900/20 rounded-2xl border border-rose-700/30">
              <Megaphone className="w-8 h-8 text-rose-400" />
            </div>
            <div>
              <h2 className="text-xl font-black text-[#EDF2F7]">Emergency Broadcast</h2>
              <p className="text-[#7A94AA] text-sm">Send a platform-wide alert to all connected users instantly.</p>
            </div>
          </div>

          <form onSubmit={handleBroadcast} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-1">
              <input
                type="text"
                placeholder="Alert Title"
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl border border-[#2E4A63] bg-[#0F1C2E] text-[#EDF2F7] placeholder-[#3D5A73] focus:border-rose-500 outline-none transition-all"
                required
              />
            </div>
            <div className="md:col-span-1">
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl border border-[#2E4A63] bg-[#0F1C2E] text-[#B8C5D3] focus:border-rose-500 outline-none transition-all"
              >
                <option value="">All Users (Platform-wide)</option>
                <optgroup label="Target Specific Event">
                  {allEvents.map((event) => (
                    <option key={event._id} value={event._id}>
                      {event.title}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
            <div className="md:col-span-1">
              <input
                type="text"
                placeholder="Message Content..."
                value={broadcastMessage}
                onChange={(e) => setBroadcastMessage(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl border border-[#2E4A63] bg-[#0F1C2E] text-[#EDF2F7] placeholder-[#3D5A73] focus:border-rose-500 outline-none transition-all"
                required
              />
            </div>
            <div className="md:col-span-1">
              <button
                type="submit"
                disabled={isBroadcasting}
                className="w-full flex items-center justify-center gap-2 px-5 py-4 bg-rose-600 text-white rounded-2xl font-bold hover:bg-rose-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isBroadcasting ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                Send Broadcast
              </button>
            </div>
          </form>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-10">
          {loadingStats
            ? Array(5).fill(0).map((_, i) => (
                <div key={i} className="bg-[#162333] p-6 rounded-[24px] border border-[#2E4A63] space-y-4">
                  <Skeleton width={48} height={48} />
                  <div className="space-y-2">
                    <Skeleton width="60%" height={12} />
                    <Skeleton width="80%" height={24} />
                  </div>
                </div>
              ))
            : kpiCards.map(card => (
                <StatsCard key={card.label} {...card} />
              ))
          }
        </div>

        {/* Charts + Activity Feed */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-[#162333] p-8 rounded-[32px] border border-[#2E4A63] shadow-[0_8px_30px_rgb(0,0,0,0.3)]">
            <h2 className="text-lg font-black text-[#EDF2F7] mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#C9A84C]" />
              Monthly Revenue Trend
            </h2>
            {loadingStats ? (
              <Skeleton width="100%" height={280} />
            ) : (
              <RevenueChart
                data={monthlySales}
                lines={[
                  { key: 'revenue', label: 'Revenue ($)', color: '#C9A84C' },
                  { key: 'bookings', label: 'Bookings', color: '#5A7A94' },
                ]}
              />
            )}
          </div>

          {/* Recent Activity */}
          <div className="bg-[#162333] p-8 rounded-[32px] border border-[#2E4A63] shadow-[0_8px_30px_rgb(0,0,0,0.3)] flex flex-col">
            <h2 className="text-lg font-black text-[#EDF2F7] mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#C9A84C]" />
              Recent Bookings
            </h2>
            {loadingStats ? (
              <div className="space-y-4 flex-1">
                {Array(4).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton width={32} height={32} circle />
                    <div className="flex-1 space-y-1">
                      <Skeleton width="40%" height={10} />
                      <Skeleton width="70%" height={8} />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentBookings.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-[#5A7A94] text-sm font-bold">No recent activity</div>
            ) : (
              <div className="space-y-3 overflow-y-auto flex-1 custom-scrollbar" style={{ maxHeight: 280 }}>
                {recentBookings.map((b, i) => (
                  <motion.div
                    key={b._id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-start gap-3 p-3 rounded-2xl bg-[#1A2B3D] border border-[#2E4A63]"
                  >
                    <div className="w-8 h-8 rounded-xl bg-[#C9A84C]/10 flex items-center justify-center text-[#C9A84C] font-black text-sm shrink-0 border border-[#C9A84C]/20">
                      {b.user?.name?.charAt(0) || '?'}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-[#EDF2F7] text-xs truncate">{b.user?.name}</p>
                      <p className="text-[10px] text-[#5A7A94] truncate">
                        {b.event?.title} • {b.quantity} ticket{b.quantity > 1 ? 's' : ''} • ${b.totalAmount}
                      </p>
                      <p className="text-[10px] text-[#5A7A94]">
                        {b.createdAt ? format(new Date(b.createdAt), 'MMM dd, HH:mm') : ''}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Management Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create Organizer */}
          <div className="lg:col-span-1">
            <div className="bg-[#162333] p-6 rounded-xl border border-[#2E4A63]">
              <h2 className="text-xl font-bold mb-4 text-[#C9A84C]">Create Organizer</h2>
              <form onSubmit={handleCreateOrganizer} className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="Organizer Name"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[#2E4A63] bg-[#0F1C2E] text-[#EDF2F7] placeholder-[#3D5A73] focus:border-[#C9A84C] outline-none transition-colors"
                    required
                  />
                </div>
                <div>
                  <input
                    type="email"
                    placeholder="Yahoo email (@yahoo.com)"
                    value={orgEmail}
                    onChange={(e) => setOrgEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[#2E4A63] bg-[#0F1C2E] text-[#EDF2F7] placeholder-[#3D5A73] focus:border-[#C9A84C] outline-none transition-colors"
                    required
                  />
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={orgPassword}
                    onChange={(e) => setOrgPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-[#2E4A63] bg-[#0F1C2E] text-[#EDF2F7] placeholder-[#3D5A73] focus:border-[#C9A84C] outline-none transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5A7A94] hover:text-[#B8C5D3]"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <button
                  type="submit"
                  className="w-full bg-[#C9A84C] text-[#0F1C2E] py-3 rounded-xl font-bold hover:bg-[#b8963e] transition-colors"
                >
                  Create Organizer
                </button>
              </form>
            </div>
          </div>

          {/* Event Mgmt hint */}
          <div className="lg:col-span-2 bg-[#162333] p-8 rounded-[32px] border border-[#2E4A63] shadow-[0_8px_30px_rgb(0,0,0,0.3)] flex flex-col items-center justify-center text-center gap-4">
            <div className="w-16 h-16 bg-[#C9A84C]/10 rounded-3xl flex items-center justify-center border border-[#C9A84C]/20">
              <Calendar className="w-8 h-8 text-[#C9A84C]" />
            </div>
            <h3 className="text-xl font-black text-[#EDF2F7]">Event Management</h3>
            <p className="text-[#7A94AA] text-sm max-w-xs">Browse, edit, or delete any event on the platform directly from the events listing page.</p>
            <button
              onClick={() => navigate('/events')}
              className="mt-2 px-6 py-3 bg-[#C9A84C] text-[#0F1C2E] font-bold rounded-2xl hover:bg-[#b8963e] transition-all"
            >
              View All Events
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
