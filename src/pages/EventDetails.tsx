import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Users, ShieldCheck, ArrowLeft, Loader2, Share2, Facebook, Twitter, Linkedin, Slash, Check, Clock, AlertCircle } from 'lucide-react';
import CancelEventModal from '../components/CancelEventModal';
import { getEventById, EventData, approveEvent } from '../api/eventApi';
import { joinWaitlist, leaveWaitlist, getWaitlistPosition } from '../api/waitlistApi';
import CheckoutButton from '../components/bookings/CheckoutButton';
import AnnouncementModal from '../components/AnnouncementModal';
import { useRealTime } from '../hooks/useRealTime';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

import EventReviews from '../components/reviews/EventReviews';
import axios from '../api/axios';

const EventDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [waitlistInfo, setWaitlistInfo] = useState<{ position: number | null, status: string | null, expiresAt: string | null } | null>(null);
  const [joiningWaitlist, setJoiningWaitlist] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [hasTicket, setHasTicket] = useState(false);
  const [isAnnouncementOpen, setIsAnnouncementOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  const { socket, joinEvent, leaveEvent } = useRealTime();

  const isOwner = user?._id === (event?.organizer?._id || event?.createdBy?._id);
  const isAdmin = user?.role === 'admin';

  const checkTicketStatus = useCallback(async () => {
    if (!id || !user) return;
    try {
      const { data } = await axios.get(`/bookings/my-tickets`);
      const ticket = data.find((b: any) => (b.event?._id || b.event) === id && b.paymentStatus === 'paid');
      setHasTicket(!!ticket);
    } catch (error) {
      console.error('Failed to check ticket status:', error);
    }
  }, [id, user]);

  const fetchWaitlistStatus = useCallback(async () => {
    if (!id || !user) return;
    try {
      const data = await getWaitlistPosition(id);
      setWaitlistInfo(data);
    } catch (error) {
      console.error('Failed to fetch waitlist status:', error);
    }
  }, [id, user]);

  const fetchEvent = useCallback(async () => {
    try {
      if (id) {
        setLoading(true);
        const data = await getEventById(id);
        setEvent(data);
        await fetchWaitlistStatus();
        await checkTicketStatus();
      }
    } catch (error) {
      console.error('Failed to load event details:', error);
      toast.error('Failed to load event details');
    } finally {
      setLoading(false);
    }
  }, [id, fetchWaitlistStatus]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  useEffect(() => {
    if (!id || !socket) return;

    joinEvent(id);

    socket.on('event:attendee_count', ({ eventId, soldTickets }: { eventId: string, soldTickets: number }) => {
      if (eventId === id) {
        setEvent((prev: EventData | null) => prev ? { ...prev, soldTickets } : null);
        // Re-fetch waitlist status when tickets open up
        fetchWaitlistStatus();
      }
    });

    return () => {
      leaveEvent(id);
      socket.off('event:attendee_count');
    };
  }, [id, socket, joinEvent, leaveEvent, fetchWaitlistStatus]);

  const handleJoinWaitlist = async () => {
    if (!user) {
      toast.error('Please login to join the waitlist');
      navigate('/login');
      return;
    }
    setJoiningWaitlist(true);
    try {
      const data = await joinWaitlist(id!);
      setWaitlistInfo(data);
      toast.success(`Joined waitlist at position #${data.position}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to join waitlist');
    } finally {
      setJoiningWaitlist(false);
    }
  };

  const handleLeaveWaitlist = async () => {
    try {
      await leaveWaitlist(id!);
      setWaitlistInfo(null);
      toast.success('Removed from waitlist');
    } catch (error) {
      toast.error('Failed to leave waitlist');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F1C2E] flex items-center justify-center pt-24">
        <Loader2 className="w-12 h-12 text-[#C9A84C] animate-spin" />
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

  const getTimeRemaining = (expiryStr: string) => {
    const expiry = new Date(expiryStr);
    const now = new Date();
    const diff = expiry.getTime() - now.getTime();
    if (diff <= 0) return 'Expired';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${mins}m`;
  };

  const isSoldOut = (event.ticketQuantity - (event.soldTickets || 0)) <= 0;
  const isNotified = waitlistInfo?.status === 'notified';

  return (
    <div className="min-h-screen bg-[#0F1C2E] pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#7A94AA] hover:text-[#C9A84C] transition-colors font-medium mb-6"
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
              className="relative aspect-video rounded-3xl overflow-hidden shadow-2xl"
            >
              <img
                src={event.bannerImage?.url || 'https://images.unsplash.com/photo-1540575861501-7cf05a4b125a?q=80&w=1000'}
                alt={event.title}
                className="w-full h-full object-cover"
              />
              {event.isFeatured && (
                <div className="absolute top-6 left-6 z-10 bg-[#C9A84C] text-[#0F1C2E] text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  Featured Event
                </div>
              )}
            </motion.div>

            <div className="bg-[#162333] p-8 sm:p-10 rounded-[32px] border border-[#2E4A63] shadow-[0_8px_30px_rgb(0,0,0,0.3)] space-y-6">
              <div className="flex flex-wrap gap-2">
                <span className="px-4 py-1 bg-[#1A2B3D] text-[#C9A84C] text-xs font-black uppercase tracking-widest rounded-full border border-[#2E4A63]">
                  {event.category}
                </span>
                {event.status === 'cancelled' && (
                  <span className="px-4 py-1 bg-[#1A2B3D] text-[#7A94AA] text-xs font-black uppercase tracking-widest rounded-full border border-[#2E4A63]">
                    Event Cancelled
                  </span>
                )}
                {event.status === 'resubmitted' && (
                  <span className="px-4 py-1 bg-amber-900/30 text-amber-400 text-xs font-black uppercase tracking-widest rounded-full border border-amber-700/40">
                    Awaiting Approval
                  </span>
                )}
                {event.ticketPrice === 0 && (
                   <span className="px-4 py-1 bg-emerald-900/30 text-emerald-400 text-xs font-black uppercase tracking-widest rounded-full border border-emerald-700/40">
                     Free Access
                   </span>
                )}
                {isSoldOut && (
                  <span className="px-4 py-1 bg-amber-900/20 text-[#EF9F27] text-xs font-black uppercase tracking-widest rounded-full border border-amber-700/40">
                    Sold Out
                  </span>
                )}
              </div>

              {/* Waitlist Notification Banner */}
              <AnimatePresence>
                {isNotified && waitlistInfo?.expiresAt && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-4 bg-emerald-900/10 border border-emerald-500/30 rounded-2xl flex items-center gap-4 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.1)]"
                  >
                    <div className="p-2 bg-emerald-500/20 rounded-xl">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-sm">A spot is available! 🎉</p>
                      <p className="text-xs opacity-80">Since you were on the waitlist, we've reserved a spot for you. Purchase within <strong>{getTimeRemaining(waitlistInfo.expiresAt)}</strong>.</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex justify-between items-start gap-4">
                <h1 className="text-4xl font-black text-[#EDF2F7] flex-1">{event.title}</h1>
                {(isOwner || isAdmin) && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsAnnouncementOpen(true)}
                    className="p-3 bg-[#C9A84C] text-[#0F1C2E] rounded-2xl shadow-xl hover:bg-[#b8963e] transition-all flex items-center gap-2 font-bold text-sm whitespace-nowrap"
                  >
                    Send Announcement
                  </motion.button>
                )}
                {(isOwner || isAdmin) && event.status !== 'cancelled' && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsCancelModalOpen(true)}
                    className="p-3 bg-[#1A2B3D] text-rose-400 border border-[#2E4A63] rounded-2xl shadow-xl hover:bg-rose-900/20 transition-all flex items-center gap-2 font-bold text-sm whitespace-nowrap"
                  >
                    <Slash className="w-5 h-5" />
                    <span className="hidden sm:inline">Cancel Event</span>
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
                    className="p-3 bg-emerald-600 text-white rounded-2xl shadow-xl hover:bg-emerald-700 transition-all flex items-center gap-2 font-bold text-sm whitespace-nowrap"
                  >
                    <Check className="w-5 h-5" />
                    <span className="hidden sm:inline">Approve Event</span>
                  </motion.button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#1A2B3D] border border-[#2E4A63]">
                  <div className="p-3 bg-[#C9A84C]/10 text-[#C9A84C] rounded-xl">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-[#5A7A94] font-bold uppercase tracking-widest">Date & Time</p>
                    <p className="font-bold text-[#EDF2F7]">{new Date(event.date).toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'short' })}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#1A2B3D] border border-[#2E4A63]">
                  <div className="p-3 bg-rose-900/30 text-rose-400 rounded-xl">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-[#5A7A94] font-bold uppercase tracking-widest">Venue Location</p>
                    <p className="font-bold text-[#EDF2F7]">{event.location}</p>
                  </div>
                </div>
              </div>

              <div className="text-[#B8C5D3] pb-8 border-b border-[#2E4A63]">
                <h3 className="text-xl font-bold text-[#EDF2F7] mb-4">About the Event</h3>
                <p className="whitespace-pre-wrap leading-relaxed">{event.description}</p>
              </div>

              {/* Reviews Section */}
              <EventReviews
                eventId={event._id!}
                eventDate={event.date}
                averageRating={event.averageRating || 0}
                totalReviews={event.totalReviews || 0}
                hasVerifiedTicket={hasTicket}
                onRatingUpdate={(avg, total) => {
                  setEvent(prev => prev ? { ...prev, averageRating: avg, totalReviews: total } : null);
                }}
              />

              {/* Social Share */}
              <div className="pt-6 border-t border-[#2E4A63] flex items-center justify-between">
                <span className="flex items-center gap-2 font-bold text-[#B8C5D3] uppercase text-xs tracking-widest">
                   <Share2 className="w-4 h-4 text-[#C9A84C]" />
                   Share Event
                </span>
                <div className="flex gap-4">
                  {[
                    { id: 'facebook', icon: Facebook, color: 'text-blue-400 hover:bg-blue-900/20' },
                    { id: 'twitter', icon: Twitter, color: 'text-sky-400 hover:bg-sky-900/20' },
                    { id: 'linkedin', icon: Linkedin, color: 'text-blue-400 hover:bg-blue-900/20' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleShare(p.id)}
                      className={`p-3 rounded-xl transition-all border border-[#2E4A63] ${p.color}`}
                    >
                      <p.icon className="w-5 h-5" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar: Booking */}
          <div className="space-y-6">
            <div className="bg-[#162333] p-8 sm:p-10 rounded-[32px] border border-[#2E4A63] shadow-[0_8px_30px_rgb(0,0,0,0.3)] sticky top-24">
              <div className="text-center mb-8">
                <p className="text-[#5A7A94] font-bold uppercase text-[10px] tracking-widest mb-1">Total Price</p>
                <h2 className="text-5xl font-black text-[#C9A84C]">
                  {event.ticketPrice === 0 ? 'FREE' : `$${event.ticketPrice * quantity}`}
                </h2>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between p-4 bg-[#1A2B3D] rounded-2xl border border-[#2E4A63]">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-emerald-400" />
                    <span className="font-bold text-[#B8C5D3]">Tickets</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={isSoldOut && !isNotified}
                      className="w-8 h-8 rounded-full border border-[#2E4A63] flex items-center justify-center font-bold text-[#B8C5D3] hover:border-[#C9A84C] hover:text-[#C9A84C] transition-all disabled:opacity-50"
                    >
                      -
                    </button>
                    <span className="font-black text-lg w-4 text-center text-[#EDF2F7]">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(event.ticketQuantity - (event.soldTickets || 0), quantity + 1))}
                      disabled={isSoldOut && !isNotified}
                      className="w-8 h-8 rounded-full border border-[#2E4A63] flex items-center justify-center font-bold text-[#B8C5D3] hover:border-[#C9A84C] hover:text-[#C9A84C] transition-all disabled:opacity-50"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex justify-between text-sm px-2">
                  <span className="text-[#7A94AA] font-medium">Available</span>
                  <span className={`font-bold ${isSoldOut ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {isSoldOut ? 'Sold Out' : `${event.ticketQuantity - (event.soldTickets || 0)} Tickets Left`}
                  </span>
                </div>
              </div>

              {/* Action Button: Buy / Join Waitlist / Position */}
              {!isSoldOut || isNotified ? (
                <CheckoutButton
                  eventId={event._id!}
                  quantity={quantity}
                  price={event.ticketPrice}
                  isOwner={isOwner}
                  isAdmin={isAdmin}
                />
              ) : (
                <div className="space-y-4">
                  {waitlistInfo?.position ? (
                    <div className="bg-[#1A2B3D] border border-[#2E4A63] rounded-2xl p-6 text-center space-y-4 shadow-xl relative overflow-hidden group">
                      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#C9A84C]/0 via-[#C9A84C] to-[#C9A84C]/0 opacity-50" />
                      <div>
                        <p className="text-[#7A94AA] text-xs font-bold uppercase tracking-widest mb-1">Your Position</p>
                        <p className="text-4xl font-black text-[#C9A84C]">#{waitlistInfo.position}</p>
                      </div>
                      <p className="text-xs text-[#5A7A94] leading-relaxed">
                        We'll notify you if a spot opens up. You'll have 24 hours to buy.
                      </p>
                      <button
                        onClick={handleLeaveWaitlist}
                        className="w-full py-3 px-4 text-xs font-bold text-rose-400 border border-rose-900/30 rounded-xl hover:bg-rose-900/10 transition-all"
                      >
                        Leave Waitlist
                      </button>
                    </div>
                  ) : (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleJoinWaitlist}
                      disabled={joiningWaitlist}
                      className="w-full py-4 px-8 rounded-2xl font-bold bg-transparent border-2 border-[#C9A84C] text-[#C9A84C] hover:bg-[#C9A84C]/5 transition-all flex items-center justify-center gap-3 shadow-lg"
                    >
                      {joiningWaitlist ? <Loader2 className="w-5 h-5 animate-spin" /> : <Clock className="w-5 h-5" />}
                      Join Waitlist
                    </motion.button>
                  )}
                </div>
              )}

              <p className="text-[10px] text-[#5A7A94] text-center mt-6 font-medium leading-relaxed">
                By purchasing, you agree to the event host's terms and conditions. Secure payment powered by Stripe.
              </p>
            </div>

            {/* Organizer Info */}
            <div className="bg-[#162333] p-6 rounded-[24px] border border-[#2E4A63] shadow-[0_8px_30px_rgb(0,0,0,0.3)] flex items-center gap-4">
               <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#C9A84C] to-[#b8963e] flex items-center justify-center text-[#0F1C2E] font-black text-xl shadow-lg">
                 {event.organizer?.name?.charAt(0) || 'O'}
               </div>
               <div>
                 <p className="text-[10px] text-[#5A7A94] font-bold uppercase tracking-widest leading-none mb-1">Event Hosted By</p>
                 <p className="font-black text-[#EDF2F7] leading-tight">{event.organizer?.name || 'Authorized Organizer'}</p>
               </div>
            </div>
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
