import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Loader2, CreditCard, Clock, History } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from '../api/axios';
import TicketCard from '../components/dashboard/TicketCard';

const TABS = [
  { id: 'upcoming', label: 'Upcoming Events', icon: Clock },
  { id: 'past', label: 'Past Events', icon: History },
];

const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const [tab, setTab] = useState<'upcoming' | 'past'>('upcoming');
  const [upcoming, setUpcoming] = useState([]);
  const [past, setPast] = useState([]);
  const [totalSpend, setTotalSpend] = useState(0);
  const [totalBookings, setTotalBookings] = useState(0);
  const [loading, setLoading] = useState(true);

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

  const displayed = tab === 'upcoming' ? upcoming : past;

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">

        {/* Profile Header */}
        <div className="glass p-8 rounded-3xl mb-8">
          <div className="flex flex-col md:flex-row items-center gap-6 justify-between">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-rose-500 flex items-center justify-center text-white text-3xl font-black shadow-lg">
                {user?.name?.charAt(0)}
              </div>
              <div>
                <h1 className="text-3xl font-black text-gray-900 leading-tight">Welcome back, {user?.name}!</h1>
                <p className="text-gray-500 font-medium">Manage your tickets and explore upcoming events.</p>
              </div>
            </div>

            {/* Stats row */}
            <div className="flex gap-3 flex-wrap justify-center md:justify-end">
              <div className="text-center bg-white px-5 py-3 rounded-2xl shadow-sm border border-gray-100">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mb-1">Bookings</p>
                <p className="text-xl font-black text-indigo-600">{totalBookings}</p>
              </div>
              <div className="text-center bg-white px-5 py-3 rounded-2xl shadow-sm border border-emerald-100">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mb-1">Total Spent</p>
                <p className="text-xl font-black text-emerald-600">${totalSpend.toLocaleString()}</p>
              </div>
              <Link
                to="/profile/transactions"
                className="flex flex-col items-center justify-center bg-white border border-gray-100 px-5 py-3 rounded-2xl shadow-sm hover:border-indigo-200 transition-colors"
              >
                <CreditCard className="w-5 h-5 text-indigo-600 mb-1" />
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Pay History</p>
              </Link>
            </div>
          </div>
        </div>

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
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
              <p className="text-gray-500 font-medium">Retrieving your tickets...</p>
            </div>
          ) : displayed.length === 0 ? (
            <div className="text-center py-24 glass rounded-3xl border-2 border-dashed border-gray-200">
              <div className="bg-gray-100 inline-flex p-6 rounded-full mb-4">
                {tab === 'upcoming'
                  ? <Calendar className="w-12 h-12 text-gray-300" />
                  : <History className="w-12 h-12 text-gray-300" />
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
