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

  // Emergency Broadcast Form
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
      
      // Fetch events for broadcast targeting
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

  // Real-time updates
  useEffect(() => {
    if (!socket) return;

    const handleUpdate = () => {
      fetchDashboard(true); // Silent refresh
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
    { label: 'Total Users', value: stats?.users ?? '–', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50', delay: 0 },
    { label: 'Organizers', value: stats?.organizers ?? '–', icon: ShieldCheck, color: 'text-purple-600', bg: 'bg-purple-50', delay: 0.05 },
    { label: 'Events', value: stats?.events ?? '–', icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50', delay: 0.1 },
    { label: 'Total Revenue', value: stats ? `$${stats.revenue.toLocaleString()}` : '–', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50', delay: 0.15 },
    { label: 'Tickets Sold', value: stats?.ticketsSold ?? '–', icon: Ticket, color: 'text-amber-600', bg: 'bg-amber-50', delay: 0.2 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <p className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-1">Platform Control</p>
            <h1 className="text-4xl font-black text-gray-900">Admin Dashboard</h1>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => fetchDashboard(false)}
              className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm"
              title="Refresh Analytics"
            >
              <RefreshCw className={`w-5 h-5 ${loadingStats ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => navigate('/admin/manage-organizers')}
              className="flex items-center gap-2 px-5 py-3 bg-white border border-gray-100 text-gray-700 rounded-2xl font-bold hover:border-indigo-100 hover:text-indigo-600 transition-all shadow-sm"
            >
              <Users className="w-4 h-4" />
              Manage Organizers
            </button>
            <button
              onClick={() => navigate('/admin/transactions')}
              className="flex items-center gap-2 px-5 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
            >
              <ShieldCheck className="w-4 h-4" />
              Transactions
            </button>
          </div>
        </div>

        {/* Emergency Broadcast Section */}
        <div className="glass p-8 rounded-3xl mb-10 border-l-4 border-rose-500">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-4 bg-rose-50 rounded-2xl">
              <Megaphone className="w-8 h-8 text-rose-500" />
            </div>
            <div>
              <h2 className="text-xl font-black text-gray-900">Emergency Broadcast</h2>
              <p className="text-gray-500 text-sm">Send a platform-wide alert to all connected users instantly.</p>
            </div>
          </div>
          
          <form onSubmit={handleBroadcast} className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-1">
              <input
                type="text"
                placeholder="Alert Title"
                value={broadcastTitle}
                onChange={(e) => setBroadcastTitle(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl border border-gray-100 focus:border-rose-300 outline-none transition-all shadow-sm"
                required
              />
            </div>
            <div className="md:col-span-1">
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="w-full px-5 py-4 rounded-2xl border border-gray-100 focus:border-rose-300 outline-none transition-all shadow-sm bg-white"
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
                className="w-full px-5 py-4 rounded-2xl border border-gray-100 focus:border-rose-300 outline-none transition-all shadow-sm"
                required
              />
            </div>
            <div className="md:col-span-1">
              <button
                type="submit"
                disabled={isBroadcasting}
                className="w-full flex items-center justify-center gap-2 px-5 py-4 bg-rose-500 text-white rounded-2xl font-bold hover:bg-rose-600 transition-all shadow-lg shadow-rose-100 disabled:opacity-50 disabled:cursor-not-allowed"
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
                <div key={i} className="glass p-6 rounded-3xl space-y-4">
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
          <div className="lg:col-span-2 glass p-8 rounded-3xl">
            <h2 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              Monthly Revenue Trend
            </h2>
            {loadingStats ? (
              <Skeleton width="100%" height={280} />
            ) : (
              <RevenueChart
                data={monthlySales}
                lines={[
                  { key: 'revenue', label: 'Revenue ($)', color: '#6366f1' },
                  { key: 'bookings', label: 'Bookings', color: '#10b981' },
                ]}
              />
            )}
          </div>

          {/* Recent Activity */}
          <div className="glass p-8 rounded-3xl flex flex-col">
            <h2 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-indigo-600" />
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
              <div className="flex-1 flex items-center justify-center text-gray-400 text-sm font-bold">No recent activity</div>
            ) : (
              <div className="space-y-3 overflow-y-auto flex-1" style={{ maxHeight: 280 }}>
                {recentBookings.map((b, i) => (
                  <motion.div
                    key={b._id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-start gap-3 p-3 rounded-2xl bg-slate-50 border border-gray-100"
                  >
                    <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-black text-sm shrink-0">
                      {b.user?.name?.charAt(0) || '?'}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-gray-900 text-xs truncate">{b.user?.name}</p>
                      <p className="text-[10px] text-gray-400 truncate">
                        {b.event?.title} • {b.quantity} ticket{b.quantity > 1 ? 's' : ''} • ${b.totalAmount}
                      </p>
                      <p className="text-[10px] text-gray-400">
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
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold mb-4 text-purple-600">Create Organizer</h2>
              <form onSubmit={handleCreateOrganizer} className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="Organizer Name"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-400 outline-none transition-colors"
                    required
                  />
                </div>
                <div>
                  <input
                    type="email"
                    placeholder="Yahoo email (@yahoo.com)"
                    value={orgEmail}
                    onChange={(e) => setOrgEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-400 outline-none transition-colors"
                    required
                  />
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={orgPassword}
                    onChange={(e) => setOrgPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-200 focus:border-purple-400 outline-none transition-colors"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <button
                  type="submit"
                  className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 transition-colors"
                >
                  Create Organizer
                </button>
              </form>
            </div>
          </div>

          {/* Event Mgmt hint */}
          <div className="lg:col-span-2 glass p-8 rounded-3xl flex flex-col items-center justify-center text-center gap-4">
            <div className="w-16 h-16 bg-indigo-50 rounded-3xl flex items-center justify-center">
              <Calendar className="w-8 h-8 text-indigo-400" />
            </div>
            <h3 className="text-xl font-black text-gray-900">Event Management</h3>
            <p className="text-gray-500 text-sm max-w-xs">Browse, edit, or delete any event on the platform directly from the events listing page.</p>
            <button
              onClick={() => navigate('/events')}
              className="mt-2 px-6 py-3 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
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
