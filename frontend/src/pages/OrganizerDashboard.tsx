import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, LayoutDashboard, Calendar, Users, BarChart3, Edit3, Trash2, Loader2, Sparkles } from 'lucide-react';
import { getMyEvents, deleteEvent, EventData } from '../api/eventApi';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const OrganizerDashboard: React.FC = () => {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const fetchEvents = async () => {
    try {
      const data = await getMyEvents();
      setEvents(data);
    } catch (error) {
      console.error('Failed to fetch events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
        try {
            await deleteEvent(id);
            toast.success('Event deleted successfully');
            fetchEvents();
        } catch (error) {
            toast.error('Failed to delete event');
        }
    }
  };

  const totalTicketsSold = (events || []).reduce((acc, curr) => acc + (curr.soldTickets || 0), 0);
  const totalRevenue = (events || []).reduce((acc, curr) => acc + ((curr.soldTickets || 0) * (curr.ticketPrice || 0)), 0);

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 text-indigo-600 font-bold text-sm mb-2"
                >
                    <Sparkles className="w-4 h-4" />
                    Organizer Hub
                </motion.div>
                <h1 className="text-4xl font-black text-gray-900 tracking-tight">Event Controls</h1>
            </div>
            <Link 
                to="/create-event"
                className="gradient-primary text-white px-8 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl shadow-indigo-100 hover:scale-105 active:scale-95 transition-all"
            >
                <Plus className="w-6 h-6" />
                Create New Event
            </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[
                { label: 'Total Events', value: (events || []).length, icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: 'Tickets Sold', value: totalTicketsSold, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { label: 'Total Revenue', value: `$${totalRevenue}`, icon: BarChart3, color: 'text-rose-600', bg: 'bg-rose-50' },
                { label: 'Featured', value: (events || []).filter(e => e?.isFeatured).length, icon: Sparkles, color: 'text-amber-500', bg: 'bg-amber-50' },
            ].map((stat, i) => (
                <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="glass p-6 rounded-3xl"
                >
                    <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center mb-4`}>
                        <stat.icon className="w-6 h-6" />
                    </div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">{stat.label}</p>
                    <p className="text-2xl font-black text-gray-900">{stat.value}</p>
                </motion.div>
            ))}
        </div>

        {/* Event List Table */}
        <div className="glass rounded-3xl overflow-hidden shadow-xl border border-white/20">
            <div className="p-8 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                    <LayoutDashboard className="w-5 h-5 text-indigo-600" />
                    My Events
                </h2>
                <span className="bg-slate-50 border border-slate-100 px-4 py-1.5 rounded-full text-xs font-bold text-gray-500 uppercase tracking-widest">
                    Manage {(events || []).length} listings
                </span>
            </div>

            {loading ? (
                <div className="py-24 flex flex-col items-center justify-center gap-4">
                    <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                    <p className="text-gray-500 font-medium font-medium">Loading your event library...</p>
                </div>
            ) : !events || events.length === 0 ? (
                <div className="py-24 text-center">
                    <div className="bg-slate-50 inline-flex p-6 rounded-full mb-4">
                        <Calendar className="w-12 h-12 text-gray-300" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">Your library is empty</h3>
                    <p className="text-gray-500 mb-6">Start by creating your first amazing event.</p>
                    <Link to="/create-event" className="text-indigo-600 font-bold hover:underline">
                        Create Event Now →
                    </Link>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50">
                            <tr className="text-gray-400 font-bold text-[10px] uppercase tracking-widest">
                                <th className="px-8 py-4">Event Details</th>
                                <th className="px-8 py-4">Status</th>
                                <th className="px-8 py-4">Performance</th>
                                <th className="px-8 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            <AnimatePresence>
                                {events?.map((event) => (
                                    <motion.tr
                                        key={event._id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="group hover:bg-slate-50/50 transition-colors"
                                    >
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 shadow-sm border border-white">
                                                    <img 
                                                       src={event.bannerImage?.url || 'https://images.unsplash.com/photo-1540575861501-7cf05a4b125a?q=80&w=1000'} 
                                                       className="w-full h-full object-cover"
                                                       alt=""
                                                    />
                                                </div>
                                                <div>
                                                    <p className="font-extrabold text-gray-900 text-lg leading-tight group-hover:text-indigo-600 transition-colors uppercase">{event?.title || 'Untitled Event'}</p>
                                                    <p className="text-xs text-gray-400 font-medium mt-1 uppercase">
                                                       {event?.date ? new Date(event.date).toLocaleDateString() : 'No Date Set'} • {event?.location || 'No Location Set'}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col gap-1">
                                                <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-full w-fit">
                                                    {event.category}
                                                </span>
                                                {event.isFeatured && (
                                                    <span className="px-3 py-1 bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest rounded-full w-fit">
                                                        Featured
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-xs font-bold text-gray-600 mb-1">
                                                    <span>{event?.soldTickets || 0} / {event?.ticketQuantity || 0} sold</span>
                                                    <span>{event?.ticketQuantity ? Math.round(((event.soldTickets || 0) / event.ticketQuantity) * 100) : 0}%</span>
                                                </div>
                                                <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                                                    <div 
                                                       className="h-full gradient-primary" 
                                                       style={{ width: `${Math.min(100, event?.ticketQuantity ? ((event.soldTickets || 0) / event.ticketQuantity) * 100 : 0)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => navigate(`/edit-event/${event._id}`)}
                                                    className="p-2 bg-white border border-gray-100 text-gray-400 hover:text-blue-600 hover:border-blue-100 hover:bg-blue-50 transition-all rounded-xl shadow-sm"
                                                >
                                                    <Edit3 className="w-5 h-5" />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(event._id!)}
                                                    className="p-2 bg-white border border-gray-100 text-gray-400 hover:text-rose-600 hover:border-rose-100 hover:bg-rose-50 transition-all rounded-xl shadow-sm"
                                                >
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
    </div>
  );
};

export default OrganizerDashboard;
