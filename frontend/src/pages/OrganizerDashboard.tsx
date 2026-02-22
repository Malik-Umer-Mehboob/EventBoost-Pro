import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Calendar, Users, BarChart3, Edit3, Trash2, Loader2, Sparkles, X, TrendingUp, RefreshCw } from 'lucide-react';
import { deleteEvent } from '../api/eventApi';

import { toast } from 'sonner';
import api from '../api/axios';
import StatsCard from '../components/analytics/StatsCard';
import RevenueChart from '../components/analytics/RevenueChart';
import AttendeeTable from '../components/analytics/AttendeeTable';

interface EventData {
  _id: string;
  title: string;
  date: string;
  location: string;
  category: string;
  ticketPrice: number;
  ticketQuantity: number;
  soldTickets: number;
  isFeatured: boolean;
  bannerImage?: { url: string };
}

interface OrgStats {
  totalEvents: number;
  totalSold: number;
  totalRevenue: number;
  upcomingEvents: number;
}

const OrganizerDashboard: React.FC = () => {
  const [events, setEvents] = useState<EventData[]>([]);
  const [stats, setStats] = useState<OrgStats | null>(null);
  const [monthlySales, setMonthlySales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Attendee modal state
  const [attendeeEvent, setAttendeeEvent] = useState<EventData | null>(null);
  const [attendees, setAttendees] = useState<any[]>([]);
  const [attendeeLoading, setAttendeeLoading] = useState(false);


  const navigate = useNavigate();

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/organizers/analytics');
      setEvents(data.events || []);
      setStats(data.stats || null);
      setMonthlySales(data.monthlySales || []);
    } catch {
      toast.error('Failed to load organizer analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
    const interval = setInterval(fetchDashboard, 30000);
    return () => clearInterval(interval);
  }, [fetchDashboard]);

  const openAttendees = async (event: EventData) => {
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
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await deleteEvent(id);
      toast.success('Event deleted successfully');
      fetchDashboard();
    } catch {
      toast.error('Failed to delete event');
    }
  };

  const kpiCards = [
    { label: 'Total Events', value: stats?.totalEvents ?? '–', icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50', delay: 0 },
    { label: 'Tickets Sold', value: stats?.totalSold ?? '–', icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50', delay: 0.05 },
    { label: 'Total Revenue', value: stats ? `$${stats.totalRevenue.toLocaleString()}` : '–', icon: BarChart3, color: 'text-rose-600', bg: 'bg-rose-50', delay: 0.1 },
    { label: 'Upcoming', value: stats?.upcomingEvents ?? '–', icon: Sparkles, color: 'text-amber-500', bg: 'bg-amber-50', delay: 0.15 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-2 text-indigo-600 font-bold text-sm mb-2"
            >
              <Sparkles className="w-4 h-4" /> Organizer Hub
            </motion.div>
            <h1 className="text-4xl font-black text-gray-900 tracking-tight">Event Controls</h1>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchDashboard}
              className="p-3 bg-white border border-gray-100 rounded-2xl text-gray-400 hover:text-indigo-600 hover:border-indigo-100 transition-all shadow-sm"
              title="Refresh"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <Link
              to="/create-event"
              className="gradient-primary text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl shadow-indigo-100 hover:scale-105 active:scale-95 transition-all"
            >
              <Plus className="w-6 h-6" />
              Create New Event
            </Link>
          </div>
        </div>

        {/* KPI Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          {kpiCards.map(card => <StatsCard key={card.label} {...card} />)}
        </div>

        {/* Registration Trend Chart */}
        {monthlySales.length > 0 && (
          <div className="glass p-8 rounded-3xl mb-10">
            <h2 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              Registration Trends (Last 6 Months)
            </h2>
            <RevenueChart
              data={monthlySales}
              lines={[
                { key: 'registrations', label: 'Tickets Registered', color: '#6366f1' },
                { key: 'revenue', label: 'Revenue ($)', color: '#10b981' },
              ]}
            />
          </div>
        )}

        {/* Event List Table */}
        <div className="glass rounded-3xl overflow-hidden shadow-xl border border-white/20">
          <div className="p-8 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-xl font-black text-gray-900">My Events</h2>
            <span className="bg-slate-50 border border-slate-100 px-4 py-1.5 rounded-full text-xs font-bold text-gray-500 uppercase tracking-widest">
              {events.length} listing{events.length !== 1 ? 's' : ''}
            </span>
          </div>

          {loading ? (
            <div className="py-24 flex flex-col items-center justify-center gap-4">
              <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
              <p className="text-gray-500 font-medium">Loading your event library...</p>
            </div>
          ) : events.length === 0 ? (
            <div className="py-24 text-center">
              <div className="bg-slate-50 inline-flex p-6 rounded-full mb-4">
                <Calendar className="w-12 h-12 text-gray-300" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Your library is empty</h3>
              <p className="text-gray-500 mb-6">Create your first event to get started.</p>
              <Link to="/create-event" className="text-indigo-600 font-bold hover:underline">Create Event →</Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50">
                  <tr className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">
                    <th className="px-8 py-4">Event</th>
                    <th className="px-8 py-4">Status</th>
                    <th className="px-8 py-4">Sales</th>
                    <th className="px-8 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <AnimatePresence>
                    {events.map(event => (
                      <motion.tr
                        key={event._id}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="group hover:bg-slate-50/50 transition-colors"
                      >
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 shadow-sm">
                              <img
                                src={event.bannerImage?.url || 'https://images.unsplash.com/photo-1540575861501-7cf05a4b125a?q=80&w=200'}
                                className="w-full h-full object-cover"
                                alt=""
                              />
                            </div>
                            <div>
                              <p className="font-extrabold text-gray-900 text-lg leading-tight uppercase">{event.title}</p>
                              <p className="text-xs text-gray-400 font-medium mt-1 uppercase">
                                {event.date ? new Date(event.date).toLocaleDateString() : '–'} • {event.location}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex flex-col gap-1">
                            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-full w-fit">{event.category}</span>
                            {event.isFeatured && <span className="px-3 py-1 bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest rounded-full w-fit">Featured</span>}
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs font-bold text-gray-600 mb-1">
                              <span>{event.soldTickets || 0} / {event.ticketQuantity || 0}</span>
                              <span>{event.ticketQuantity ? Math.round(((event.soldTickets || 0) / event.ticketQuantity) * 100) : 0}%</span>
                            </div>
                            <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full gradient-primary"
                                style={{ width: `${Math.min(100, event.ticketQuantity ? ((event.soldTickets || 0) / event.ticketQuantity) * 100 : 0)}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openAttendees(event)}
                              className="p-2 bg-white border border-gray-100 text-gray-400 hover:text-emerald-600 hover:border-emerald-100 hover:bg-emerald-50 transition-all rounded-xl shadow-sm"
                              title="View Attendees"
                            >
                              <Users className="w-5 h-5" />
                            </button>
                            <button onClick={() => navigate(`/edit-event/${event._id}`)}
                              className="p-2 bg-white border border-gray-100 text-gray-400 hover:text-blue-600 hover:border-blue-100 hover:bg-blue-50 transition-all rounded-xl shadow-sm">
                              <Edit3 className="w-5 h-5" />
                            </button>
                            <button onClick={() => handleDelete(event._id)}
                              className="p-2 bg-white border border-gray-100 text-gray-400 hover:text-rose-600 hover:border-rose-100 hover:bg-rose-50 transition-all rounded-xl shadow-sm">
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Attendee Modal */}
      <AnimatePresence>
        {attendeeEvent && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setAttendeeEvent(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-y-auto"
            >
              <div className="p-8 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white rounded-t-3xl">
                <div>
                  <h2 className="text-xl font-black text-gray-900">Attendees</h2>
                  <p className="text-sm text-gray-400 font-medium mt-1">{attendeeEvent.title}</p>
                </div>
                <button onClick={() => setAttendeeEvent(null)} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="p-8">
                <AttendeeTable attendees={attendees} loading={attendeeLoading} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrganizerDashboard;
