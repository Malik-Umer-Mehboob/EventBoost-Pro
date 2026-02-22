import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Search } from 'lucide-react';
import { getPublicEvents, EventData } from '../api/eventApi';
import { useRealTime } from '../hooks/useRealTime';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import EventCard from '../components/EventCard';
import EventFilters from '../components/events/EventFilters';
import BookingModal from '../components/bookings/BookingModal';
import Skeleton from '../components/common/Skeleton';

const EventList: React.FC = () => {
  const [events, setEvents] = useState<EventData[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();
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

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const data = await getPublicEvents();
        setEvents(data);
        setFilteredEvents(data);
      } catch (error) {
        console.error('Failed to fetch events');
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Listen for real-time updates
  useEffect(() => {
    if (!socket) return;

    socket.on('event:updated', ({ event, action }: { event: any, action: string }) => {
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

  useEffect(() => {
    let result = events;
    if (searchTerm) {
      result = result.filter((e: EventData) => e.title.toLowerCase().includes(searchTerm.toLowerCase()));
    }
    if (activeCategory) {
      result = result.filter((e: EventData) => e.category === activeCategory);
    }
    setFilteredEvents(result);
  }, [searchTerm, activeCategory, events]);

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 text-indigo-600 font-bold text-sm mb-4"
            >
                <Sparkles className="w-4 h-4" />
                Discover Incredible Events
            </motion.div>
            <h1 className="text-5xl font-black text-gray-900 mb-4 tracking-tight">
                Experience <span className="text-gradient">The Magic</span>
            </h1>
            <p className="text-gray-500 text-lg max-w-2xl mx-auto">
                Discover and book tickets for the best events in your city. From music festivals to workshops, we've got it all.
            </p>
        </div>

        {/* Filters */}
        <EventFilters 
          onSearch={setSearchTerm} 
          onFilterChange={setActiveCategory} 
        />

        {/* List */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 px-2">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-gray-100">
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
          <AnimatePresence>
            <motion.div 
               layout
               className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredEvents.map((event: EventData) => (
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
                    isOwner={user?._id === (event.organizer?._id || event.createdBy?._id)}
                    isAdmin={user?.role === 'admin'}
                  />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {!loading && filteredEvents.length === 0 && (
          <div className="text-center py-24 glass rounded-3xl">
            <div className="bg-gray-50 inline-flex p-6 rounded-full mb-4">
                <Search className="w-12 h-12 text-gray-300" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">No events found</h3>
            <p className="text-gray-500">Try adjusting your filters or search term.</p>
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
