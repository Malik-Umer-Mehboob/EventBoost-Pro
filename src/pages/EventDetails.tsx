import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, ShieldCheck, ArrowLeft, Loader2, Share2, Facebook, Twitter, Linkedin, Slash, Check, Star } from 'lucide-react';
import CancelEventModal from '../components/CancelEventModal';
import { getEventById, EventData, approveEvent } from '../api/eventApi';
import CheckoutButton from '../components/bookings/CheckoutButton';
import AnnouncementModal from '../components/AnnouncementModal';
import { useRealTime } from '../hooks/useRealTime';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';
import { joinWaitlist, leaveWaitlist, getWaitlistPosition } from '../api/waitlistApi';
import { Clock, AlertCircle } from 'lucide-react';
import EventReviews from '../components/reviews/EventReviews';
import api from '../api/axios';

const EventDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isAnnouncementOpen, setIsAnnouncementOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [waitlistInfo, setWaitlistInfo] = useState<{ position: number | null, status: string | null, expiresAt?: string } | null>(null);
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [hasVerifiedTicket, setHasVerifiedTicket] = useState(false);
  const [liveRating, setLiveRating] = useState<{ avg: number; total: number } | null>(null);
  
  const { socket, joinEvent, leaveEvent } = useRealTime();

  const isOwner = user?._id === (event?.organizer?._id || event?.createdBy?._id);
  const isAdmin = user?.role === 'admin';
  const fetchEvent = useCallback(async () => {
    try {
      if (id) {
        setLoading(true);
        const data = await getEventById(id);
        setEvent(data);
        
        // Only fetch waitlist for regular users
        if (user && user.role !== 'admin' && user._id !== (data.organizer?._id || data.createdBy?._id)) {
          const wl = await getWaitlistPosition(id);
          setWaitlistInfo(wl);
        }

        // Check if current user has a verified paid ticket for this event
        if (user) {
          try {
            const { data: bookings } = await api.get('/bookings/my-tickets');
            const hasPaid = bookings.some(
              (b: any) => b.event?._id === id && b.paymentStatus === 'paid'
            );
            setHasVerifiedTicket(hasPaid);
          } catch { /* ignore */ }
        }
      }
    } catch (error) {
      console.error('Failed to load event details:', error);
      toast.error('Failed to load event details');
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  // Real-time listeners
  useEffect(() => {
    if (!id || !socket) return;

    joinEvent(id);

    socket.on('event:attendee_count', ({ eventId, soldTickets }: { eventId: string, soldTickets: number }) => {
      if (eventId === id) {
        setEvent((prev: EventData | null) => prev ? { ...prev, soldTickets } : null);
      }
    });

    return () => {
      leaveEvent(id);
      socket.off('event:attendee_count');
    };
  }, [id, socket, joinEvent, leaveEvent]);

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center pt-24">
        <Loader2 className="w-12 h-12 text-gold animate-spin" />
      </div>
    );
  }

  if (!event) return null;

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const text = `Check out this amazing event: ${event.title}`;
    let shareUrl = '';

    switch (platform) {
      case 'facebook': shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`; break;
      case 'twitter': shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`; break;
      case 'linkedin': shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`; break;
    }
    window.open(shareUrl, '_blank');
  };

  const handleJoinWaitlist = async () => {
    try {
      const data = await joinWaitlist(id!);
      setWaitlistInfo(data);
      toast.success(`Joined waitlist at position #${data.position}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to join waitlist');
    }
  };

  const handleLeaveWaitlist = async () => {
    try {
      await leaveWaitlist(id!);
      setWaitlistInfo(null);
      toast.success('Removed from waitlist');
    } catch (error: any) {
      toast.error('Failed to leave waitlist');
    }
  };

  // Timer for notified spot expiration
  useEffect(() => {
    if (waitlistInfo?.status !== 'notified' || !waitlistInfo?.expiresAt) return;

    const timer = setInterval(() => {
      const expiresAt = new Date(waitlistInfo.expiresAt!).getTime();
      const now = new Date().getTime();
      const diff = expiresAt - now;

      if (diff <= 0) {
        setTimeLeft('EXPIRED');
        setWaitlistInfo(prev => prev ? { ...prev, status: 'expired' } : null);
        clearInterval(timer);
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [waitlistInfo]);

  return (
    <div className="min-h-screen bg-navy-900 pt-24 pb-12 px-4 sm:px-6 lg:px-8 text-navy-200">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-navy-400 hover:text-gold transition-colors font-black uppercase text-xs tracking-widest mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Events
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-8">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl border border-navy-600"
            >
              <img 
                src={event.bannerImage?.url || 'https://images.unsplash.com/photo-1540575861501-7cf05a4b125a?q=80&w=1000'}
                alt={event.title}
                className="w-full h-full object-cover"
              />
              {event.isFeatured && (
                <div className="absolute top-6 left-6 z-10 bg-rose-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg border border-rose-500 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  Featured
                </div>
              )}
            </motion.div>

            <div className="bg-navy-700 p-8 sm:p-10 rounded-[32px] border border-navy-600 shadow-xl shadow-black/20 space-y-6">
              <div className="flex flex-wrap gap-2">
                <span className="px-4 py-1 bg-navy-800 text-gold text-[10px] font-black uppercase tracking-widest rounded-full border border-navy-600">
                  {event.category}
                </span>
                {event.status === 'cancelled' && (
                  <span className="px-4 py-1 bg-navy-900 text-rose-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-navy-600">
                    Cancelled
                  </span>
                )}
                {event.status === 'resubmitted' && (
                  <span className="px-4 py-1 bg-navy-900 text-amber-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-navy-600">
                    Pending Approval
                  </span>
                )}
                {event.ticketPrice === 0 && (
                   <span className="px-4 py-1 bg-emerald-950/30 text-emerald-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-emerald-900/50">
                     Free
                   </span>
                )}
              </div>

              <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <h1 className="text-4xl font-black text-navy-100 flex-1 tracking-tight">{event.title}</h1>
                <div className="flex flex-wrap gap-3">
                  {(isOwner || isAdmin) && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsAnnouncementOpen(true)}
                      className="p-3 bg-gold text-navy-900 rounded-2xl shadow-xl hover:bg-[#b8963e] transition-all flex items-center gap-2 font-black text-xs uppercase tracking-widest whitespace-nowrap"
                    >
                      Broadcast
                    </motion.button>
                  )}
                  {(isOwner || isAdmin) && event.status !== 'cancelled' && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsCancelModalOpen(true)}
                      className="p-3 bg-navy-800 text-rose-500 border border-navy-600 rounded-2xl shadow-xl hover:bg-navy-600 transition-all flex items-center gap-2 font-black text-xs uppercase tracking-widest whitespace-nowrap"
                    >
                      <Slash className="w-5 h-5" />
                      Cancel
                    </motion.button>
                  )}
                  {isAdmin && event.status === 'resubmitted' && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={async () => {
                        try {
                          await approveEvent(event._id!);
                          toast.success('Event approved!');
                          fetchEvent();
                        } catch (error) {
                          console.error('Failed to approve event:', error);
                          toast.error('Failed to approve event');
                        }
                      }}
                      className="p-3 bg-emerald-600 text-white rounded-2xl shadow-xl hover:bg-emerald-700 transition-all flex items-center gap-2 font-black text-xs uppercase tracking-widest whitespace-nowrap"
                    >
                      <Check className="w-5 h-5" />
                      Approve
                    </motion.button>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-navy-900 border border-navy-600">
                  <div className="p-3 bg-navy-800 text-gold rounded-xl border border-navy-600">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] text-navy-500 font-black uppercase tracking-widest">Date & Time</p>
                    <p className="font-bold text-navy-200">{new Date(event.date).toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'short' })}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-2xl bg-navy-900 border border-navy-600">
                  <div className="p-3 bg-navy-800 text-rose-400 rounded-xl border border-navy-600">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] text-navy-500 font-black uppercase tracking-widest">Venue Location</p>
                    <p className="font-bold text-navy-200">{event.location}</p>
                  </div>
                </div>
              </div>

              {/* Waitlist Notification Banner */}
              {waitlistInfo?.status === 'notified' && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-emerald-950/20 border border-emerald-500/30 p-6 rounded-3xl space-y-4 shadow-lg shadow-emerald-900/10"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
                       <Clock className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-emerald-400 font-black uppercase text-sm tracking-widest mb-1">Spot Available!</h3>
                      <p className="text-navy-300 text-sm leading-relaxed font-medium">
                        Great news! A spot opened up and we've reserved it for you. You have until the timer expires to complete your purchase.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-navy-900/50 rounded-2xl border border-emerald-500/20">
                     <span className="text-[10px] text-navy-500 font-black uppercase tracking-widest">Time Remaining</span>
                     <span className="text-xl font-black text-emerald-400 font-mono tracking-wider">{timeLeft}</span>
                  </div>
                </motion.div>
              )}

              {waitlistInfo?.status === 'expired' && (
                <div className="bg-rose-950/20 border border-rose-500/30 p-6 rounded-3xl flex items-start gap-4">
                  <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl">
                     <AlertCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-rose-400 font-black uppercase text-sm tracking-widest mb-1">Spot Expired</h3>
                    <p className="text-navy-300 text-sm leading-relaxed font-medium">
                      Unfortunately, you didn't purchase in time and your spot was offered to the next person. You can join the waitlist again to queue up for another spot.
                    </p>
                  </div>
                </div>
              )}

              <div className="prose prose-invert max-w-none text-navy-300">
                <h3 className="text-xl font-black text-navy-100 mb-4 uppercase tracking-tight">About the Event</h3>
                <p className="whitespace-pre-wrap leading-relaxed">{event.description}</p>
              </div>

              {/* Social Share */}
              <div className="pt-6 border-t border-navy-600 flex items-center justify-between">
                <span className="flex items-center gap-2 font-black text-navy-400 uppercase text-[10px] tracking-widest">
                   <Share2 className="w-4 h-4 text-gold" />
                   Share Event
                </span>
                <div className="flex gap-3">
                  {[
                    { id: 'facebook', icon: Facebook, color: 'text-blue-400 hover:bg-blue-400/10' },
                    { id: 'twitter', icon: Twitter, color: 'text-sky-400 hover:bg-sky-400/10' },
                    { id: 'linkedin', icon: Linkedin, color: 'text-blue-500 hover:bg-blue-500/10' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleShare(p.id)}
                      className={`p-3 rounded-xl transition-all border border-navy-600 bg-navy-800 ${p.color}`}
                    >
                      <p.icon className="w-5 h-5" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Reviews Section */}
            <div className="bg-navy-700 p-8 sm:p-10 rounded-[32px] border border-navy-600 shadow-xl shadow-black/20">
              <EventReviews
                eventId={event._id!}
                eventDate={event.date}
                averageRating={liveRating?.avg ?? (event as any).averageRating ?? 0}
                totalReviews={liveRating?.total ?? (event as any).totalReviews ?? 0}
                hasVerifiedTicket={hasVerifiedTicket}
                onRatingUpdate={(avg, total) => setLiveRating({ avg, total })}
              />
            </div>
          </div>

          {/* Sidebar: Booking */}
          <div className="space-y-6">
            <div className="bg-navy-700 p-8 sm:p-10 rounded-[32px] border border-navy-600 shadow-xl shadow-black/20 sticky top-24">
              <div className="text-center mb-8">
                <p className="text-navy-500 font-black uppercase text-[10px] tracking-widest mb-1">Total Investment</p>
                <h2 className="text-5xl font-black text-gold tracking-tight">
                  {event.ticketPrice === 0 ? 'FREE' : `$${(event.ticketPrice * quantity).toLocaleString()}`}
                </h2>
                {(liveRating?.total ?? event.totalReviews ?? 0) > 0 && (
                  <div className="flex items-center justify-center gap-2 mt-3">
                    <Star className="w-4 h-4" style={{ fill: '#C9A84C', color: '#C9A84C' }} />
                    <span className="font-black text-sm" style={{ color: '#C9A84C' }}>
                      {(liveRating?.avg ?? event.averageRating ?? 0).toFixed(1)}
                    </span>
                    <span className="text-xs font-medium" style={{ color: '#5A7A94' }}>
                      ({liveRating?.total ?? event.totalReviews} reviews)
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between p-4 bg-navy-900 rounded-2xl border border-navy-600">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-gold" />
                    <span className="font-bold text-navy-200">Tickets</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 rounded-xl border border-navy-600 bg-navy-800 flex items-center justify-center font-bold text-navy-100 hover:border-gold hover:text-gold transition-all"
                    >
                      -
                    </button>
                    <span className="font-black text-lg w-4 text-center text-navy-100">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(Math.min(event.ticketQuantity - (event.soldTickets || 0), quantity + 1))}
                      className="w-8 h-8 rounded-xl border border-navy-600 bg-navy-800 flex items-center justify-center font-bold text-navy-100 hover:border-gold hover:text-gold transition-all"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex justify-between text-[10px] px-2 font-black uppercase tracking-widest">
                  <span className="text-navy-500">Status</span>
                  <span className="text-emerald-400">{event.ticketQuantity - (event.soldTickets || 0)} Remaining</span>
                </div>
              </div>

              {event.ticketQuantity - (event.soldTickets || 0) > 0 || waitlistInfo?.status === 'notified' ? (
                <CheckoutButton 
                  eventId={event._id!} 
                  quantity={quantity} 
                  price={event.ticketPrice} 
                  isOwner={isOwner}
                  isAdmin={isAdmin}
                />
              ) : (
                <div className="space-y-4">
                  <div className="w-full bg-navy-800 text-navy-400 py-4 px-8 rounded-2xl font-black text-center border border-navy-600 uppercase tracking-widest opacity-60">
                    SOLD OUT
                  </div>
                  
                  {!isOwner && !isAdmin && user && (
                    <div className="pt-2">
                      {waitlistInfo ? (
                        <div className="space-y-4">
                          <div className="bg-navy-800/50 border border-gold/20 p-4 rounded-2xl text-center">
                            <p className="text-[10px] text-navy-500 font-black uppercase tracking-widest mb-1">Waitlist Position</p>
                            <p className="text-2xl font-black text-gold">#{waitlistInfo.position}</p>
                          </div>
                          <button 
                            onClick={handleLeaveWaitlist}
                            className="w-full py-3 px-6 rounded-2xl font-black text-xs uppercase tracking-widest transition-all border border-rose-500/30 text-rose-500 hover:bg-rose-500/10"
                          >
                            Leave Waitlist
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={handleJoinWaitlist}
                          className="w-full py-4 px-8 bg-transparent border-2 border-gold text-gold rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-gold hover:text-navy-900 transition-all shadow-xl shadow-gold/10 flex items-center justify-center gap-2"
                        >
                          Join Waitlist
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              <p className="text-[10px] text-navy-500 text-center mt-6 font-medium leading-relaxed">
                By purchasing, you agree to the event host's terms and conditions. Secure payment powered by Stripe.
              </p>
            </div>

            {/* Organizer Info */}
            <Link
              to={`/organizer/${event.organizer?._id || ''}`}
              className="block bg-navy-700 p-6 rounded-[24px] border border-navy-600 shadow-xl shadow-black/20 hover:border-gold/40 transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-gold flex items-center justify-center text-navy-900 font-black text-xl shadow-lg border-2 border-navy-900 group-hover:scale-105 transition-transform">
                  {event.organizer?.name?.charAt(0) || 'O'}
                </div>
                <div className="flex-1">
                  <p className="text-[10px] text-navy-500 font-black uppercase tracking-widest leading-none mb-1">Event Hosted By</p>
                  <p className="font-black text-navy-100 leading-tight tracking-tight group-hover:text-gold transition-colors">
                    {event.organizer?.name || 'Authorized Organizer'}
                  </p>
                  {((event as any).organizerRating ?? 0) > 0 && (
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <Star className="w-3 h-3" style={{ fill: '#C9A84C', color: '#C9A84C' }} />
                      <span className="text-xs font-black" style={{ color: '#C9A84C' }}>
                        {(event as any).organizerRating}
                      </span>
                    </div>
                  )}
                </div>
                <ArrowLeft className="w-4 h-4 text-navy-500 rotate-180 group-hover:text-gold group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          </div>
        </div>
      </div>

      <AnnouncementModal
        isOpen={isAnnouncementOpen}
        onClose={() => setIsAnnouncementOpen(false)}
        eventId={event._id!}
        eventTitle={event.title}
      />

      <CancelEventModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onSuccess={fetchEvent}
        event={{ _id: event._id!, title: event.title }}
      />
    </div>
  );
};

export default EventDetails;
