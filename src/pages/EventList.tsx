import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Search } from 'lucide-react';
import { getPublicEvents, EventData } from '../api/eventApi';
import { useRealTime } from '../hooks/useRealTime';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import EventCard from '../components/EventCard';
import FilterBar from '../components/FilterBar';
import BookingModal from '../components/bookings/BookingModal';
import Skeleton from '../components/common/Skeleton';
import { cancelEventAdmin, deleteEventAdmin } from '../api/adminApi';
import { deleteEvent } from '../api/eventApi';
import { useSearchParams } from 'react-router-dom';

const EventList: React.FC = () => {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedEvent, setSelectedEvent] = useState<EventData | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  const { socket } = useRealTime();

  const handleBuyTicket = (event: EventData) => {
    if (!user) {
      toast.error('Please login to purchase tickets');
      navigate('/login');
      return;
    }
    setSelectedEvent(event);
    setIsBookingModalOpen(true);
  };

  const handleCancelEvent = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this event? This will refund ALL tickets automatically and cannot be undone.')) {
        return;
    }

    try {
        const response = await cancelEventAdmin(id);
        toast.success(response.message || 'Event cancelled successfully');
        setEvents(prev => prev.map(e => e._id === id ? { ...e, status: 'cancelled' } : e));
    } catch (error) {
        console.error('Failed to cancel event:', error);
        toast.error('Failed to cancel event and process refunds');
    }
  };

  const handleEdit = (event: EventData) => {
    navigate(`/edit-event/${event._id}`);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this event?')) return;
    
    try {
      if (user?.role === 'admin') {
        await deleteEventAdmin(id);
      } else {
        await deleteEvent(id);
      }
      toast.success('Event removed successfully');
      setEvents(prev => prev.filter(e => e._id !== id));
    } catch (error) {
        console.error('Failed to remove event:', error);
        toast.error('Failed to remove event');
    }
  };

  const fetchEvents = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const data = await getPublicEvents(params);
      setEvents(data);
    } catch (error) {
      console.error('Failed to fetch events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  }, []);

  // Handle filter changes from FilterBar
  const handleFilterChange = useCallback((filters: any) => {
    // Sync with URL
    const newParams: any = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value) newParams[key] = value as string;
    });
    setSearchParams(newParams);
    
    // Fetch with new filters
    fetchEvents(newParams);
  }, [setSearchParams, fetchEvents]);

  // Initial fetch from URL params
  useEffect(() => {
    const params = Object.fromEntries(searchParams);
    fetchEvents(params);
  }, []); // Only on mount

  // Listen for real-time updates
  useEffect(() => {
    if (!socket) return;

    socket.on('event:updated', ({ event, action }: { event: EventData, action: string }) => {
      setEvents((prev) => {
        if (action === 'deleted') {
          return prev.filter((e) => e._id !== event._id);
        }
        if (action === 'created') {
          // Check if already exists to avoid duplicates
          if (prev.find((e) => e._id === event._id)) return prev;
          return [event, ...prev];
        }
        if (action === 'updated') {
          return prev.map((e) => (e._id === event._id ? { ...e, ...event } : e));
        }
        return prev;
      });
    });

    return () => {
      socket.off('event:updated');
    };
  }, [socket]);

  // Removed local filtering effect since we now use server-side filtering

  return (
    <div className="min-h-screen bg-navy-900 pt-24 pb-12 px-4 sm:px-6 lg:px-8 text-navy-200">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-navy-800 border border-navy-600 text-gold font-black text-[10px] uppercase tracking-widest mb-4"
            >
                <Sparkles className="w-4 h-4" />
                Discover Incredible Events
            </motion.div>
            <h1 className="text-5xl md:text-6xl font-black text-navy-100 mb-4 tracking-tight">
                Experience <span className="text-gold">The Magic</span>
            </h1>
            <p className="text-navy-400 text-lg max-w-2xl mx-auto font-medium">
                Discover and book tickets for the best events in your city. From music festivals to workshops, we've got it all.
            </p>
        </div>

        {/* Filters */}
        <FilterBar 
          onFilterChange={handleFilterChange} 
          totalResults={events.length}
          initialFilters={Object.fromEntries(searchParams)}
        />

        {/* List */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-2">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="bg-navy-700 rounded-[32px] overflow-hidden shadow-sm border border-navy-600">
                <Skeleton width="100%" height={240} className="rounded-none" />
                <div className="p-7 space-y-4">
                  <div className="flex justify-between">
                    <Skeleton width="70%" height={24} />
                    <Skeleton width="20%" height={24} />
                  </div>
                  <Skeleton width="100%" height={40} />
                  <div className="space-y-2">
                    <Skeleton width="60%" height={12} />
                    <Skeleton width="50%" height={12} />
                  </div>
                  <Skeleton width="100%" height={56} className="mt-4" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <AnimatePresence mode='popLayout'>
            <motion.div 
               layout
               className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {events.map((event: EventData) => (
                <motion.div
                  key={event._id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <EventCard 
                    event={event} 
                    onBuy={handleBuyTicket}
                    onCancel={handleCancelEvent}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    isOwner={user?._id === (event.organizer?._id || event.createdBy?._id)}
                    isAdmin={user?.role === 'admin'}
                  />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {!loading && events.length === 0 && (
          <div className="text-center py-24 bg-navy-700 rounded-[32px] border border-dashed border-navy-600 shadow-xl shadow-black/20">
            <div className="bg-navy-800 inline-flex p-6 rounded-full mb-4">
                <Search className="w-12 h-12 text-navy-500" />
            </div>
            <h3 className="text-xl font-black text-navy-100">No events found</h3>
            <p className="text-navy-400 font-medium">Try adjusting your filters or search term.</p>
            <button 
                onClick={() => handleFilterChange({})}
                className="mt-6 px-8 py-3 bg-gold text-navy-900 rounded-2xl font-bold hover:bg-[#b8963e] transition-all shadow-lg shadow-gold/10"
            >
                Clear All Filters
            </button>
          </div>
        )}

        <BookingModal 
          event={selectedEvent} 
          isOpen={isBookingModalOpen} 
          onClose={() => setIsBookingModalOpen(false)} 
        />
      </div>
    </div>
  );
};

export default EventList;
