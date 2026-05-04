import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Search, X } from 'lucide-react';
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

const EventList: React.FC = () => {
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<any>(null);
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
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

  const handleFilterChange = useCallback((newFilters: any) => {
    setFilters(newFilters);
    
    // URL Sync
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value !== 'All') {
        params.append(key, value as string);
      }
    });
    const newSearch = params.toString();
    if (location.search !== `?${newSearch}`) {
        navigate({ search: newSearch }, { replace: true });
    }
  }, [navigate, location.search]);

  useEffect(() => {
    if (!filters) return;

    const fetchEvents = async () => {
      setLoading(true);
      try {
        // Prepare params for API (convert 'All' to empty string for category)
        const apiParams = { ...filters };
        if (apiParams.category === 'All') apiParams.category = '';
        
        const data = await getPublicEvents(apiParams);
        setEvents(data);
      } catch (error) {
        console.error('Failed to fetch events:', error);
        toast.error('Failed to load events');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [filters]);

  useEffect(() => {
    if (!socket) return;

    socket.on('event:updated', ({ event, action }: { event: EventData, action: string }) => {
      setEvents((prev) => {
        if (action === 'deleted') {
          return prev.filter((e) => e._id !== event._id);
        }
        if (action === 'created') {
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

  return (
    <div className="min-h-screen bg-[#0F1C2E] pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1A2B3D] text-[#C9A84C] font-bold text-sm mb-4 border border-[#2E4A63]"
            >
                <Sparkles className="w-4 h-4" />
                Discover Incredible Events
            </motion.div>
            <h1 className="text-5xl font-black text-[#EDF2F7] mb-4 tracking-tight">
                Experience <span className="text-gradient">The Magic</span>
            </h1>
            <p className="text-[#7A94AA] text-lg max-w-2xl mx-auto">
                Discover and book tickets for the best events in your city. From music festivals to workshops, we've got it all.
            </p>
        </div>

        {/* Filters */}
        <FilterBar 
          onFilterChange={handleFilterChange} 
          totalResults={events.length}
        />

        {/* List */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-2">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="bg-[#162333] rounded-[32px] overflow-hidden border border-[#2E4A63]">
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
          <>
            <AnimatePresence mode="wait">
              {events.length > 0 ? (
                <motion.div
                  key="event-grid"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
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
              ) : (
                <motion.div 
                  key="no-events"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  className="text-center py-24 bg-[#162333] rounded-[32px] border border-[#2E4A63]"
                >
                  <div className="bg-[#1A2B3D] inline-flex p-6 rounded-full mb-4">
                      <Search className="w-12 h-12 text-[#3D5A73]" />
                  </div>
                  <h3 className="text-xl font-bold text-[#EDF2F7]">No events found</h3>
                  <p className="text-[#7A94AA] mb-8">Try adjusting your filters or search term to find what you're looking for.</p>
                  <button
                    onClick={() => window.location.href = '/events'}
                    className="inline-flex items-center gap-2 px-8 py-3 bg-transparent border border-[#2E4A63] rounded-xl text-[#B8C5D3] hover:text-[#C9A84C] hover:border-[#C9A84C] transition-all font-bold"
                  >
                    <X className="w-5 h-5" />
                    Reset All Filters
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </>
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
