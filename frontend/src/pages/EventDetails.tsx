import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, ShieldCheck, ArrowLeft, Loader2, Share2, Facebook, Twitter, Linkedin } from 'lucide-react';
import { getEventById, EventData } from '../api/eventApi';
import CheckoutButton from '../components/bookings/CheckoutButton';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const EventDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  
  const isOwner = user?._id === (event?.organizer?._id || event?.createdBy?._id);
  const isAdmin = user?.role === 'admin';

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        if (id) {
          const data = await getEventById(id);
          setEvent(data);
        }
      } catch (error) {
        toast.error('Failed to load event details');
        navigate('/events');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center pt-24">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
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

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors font-medium mb-6"
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
                <div className="absolute top-6 left-6 z-10 bg-rose-500 text-white text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg border border-rose-400 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" />
                  Featured Event
                </div>
              )}
            </motion.div>

            <div className="glass p-8 rounded-3xl space-y-6">
              <div className="flex flex-wrap gap-2">
                <span className="px-4 py-1 bg-indigo-50 text-indigo-600 text-xs font-black uppercase tracking-widest rounded-full">
                  {event.category}
                </span>
                {event.ticketPrice === 0 && (
                   <span className="px-4 py-1 bg-emerald-50 text-emerald-600 text-xs font-black uppercase tracking-widest rounded-full">
                     Free Access
                   </span>
                )}
              </div>

              <h1 className="text-4xl font-black text-gray-900">{event.title}</h1>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Date & Time</p>
                    <p className="font-bold text-gray-800">{new Date(event.date).toLocaleString(undefined, { dateStyle: 'full', timeStyle: 'short' })}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="p-3 bg-rose-100 text-rose-600 rounded-xl">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">Venue Location</p>
                    <p className="font-bold text-gray-800">{event.location}</p>
                  </div>
                </div>
              </div>

              <div className="prose prose-indigo max-w-none text-gray-600 line-height-relaxed">
                <h3 className="text-xl font-bold text-gray-900 mb-4">About the Event</h3>
                <p className="whitespace-pre-wrap">{event.description}</p>
              </div>

              {/* Social Share */}
              <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                <span className="flex items-center gap-2 font-bold text-gray-800 uppercase text-xs tracking-widest">
                   <Share2 className="w-4 h-4 text-indigo-600" />
                   Share Event
                </span>
                <div className="flex gap-4">
                  {[
                    { id: 'facebook', icon: Facebook, color: 'text-blue-600 hover:bg-blue-50' },
                    { id: 'twitter', icon: Twitter, color: 'text-sky-500 hover:bg-sky-50' },
                    { id: 'linkedin', icon: Linkedin, color: 'text-blue-700 hover:bg-blue-50' },
                  ].map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleShare(p.id)}
                      className={`p-3 rounded-xl transition-all border border-gray-100 ${p.color}`}
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
            <div className="glass p-8 rounded-3xl sticky top-24 shadow-2xl">
              <div className="text-center mb-8">
                <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest mb-1">Total Price</p>
                <h2 className="text-5xl font-black text-indigo-600">
                  {event.ticketPrice === 0 ? 'FREE' : `$${event.ticketPrice * quantity}`}
                </h2>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-emerald-600" />
                    <span className="font-bold text-gray-700">Tickets</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center font-bold hover:bg-white hover:border-indigo-300 transition-all"
                    >
                      -
                    </button>
                    <span className="font-black text-lg w-4 text-center">{quantity}</span>
                    <button 
                      onClick={() => setQuantity(Math.min(event.ticketQuantity - (event.soldTickets || 0), quantity + 1))}
                      className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center font-bold hover:bg-white hover:border-indigo-300 transition-all"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex justify-between text-sm px-2">
                  <span className="text-gray-500 font-medium">Available</span>
                  <span className="font-bold text-emerald-600">{event.ticketQuantity - (event.soldTickets || 0)} Tickets Left</span>
                </div>
              </div>

              {event.ticketQuantity - (event.soldTickets || 0) > 0 ? (
                <CheckoutButton 
                  eventId={event._id!} 
                  quantity={quantity} 
                  price={event.ticketPrice} 
                  isOwner={isOwner}
                  isAdmin={isAdmin}
                />
              ) : (
                <div className="w-full bg-rose-50 text-rose-600 py-4 px-8 rounded-2xl font-bold text-center border border-rose-100 cursor-not-allowed">
                  SOLD OUT
                </div>
              )}

              <p className="text-[10px] text-gray-400 text-center mt-6 font-medium leading-relaxed">
                By purchasing, you agree to the event host's terms and conditions. Secure payment powered by Stripe.
              </p>
            </div>

            {/* Organizer Info */}
            <div className="glass p-6 rounded-3xl flex items-center gap-4">
               <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-xl shadow-lg">
                 {event.organizer?.name?.charAt(0) || 'O'}
               </div>
               <div>
                 <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mb-1">Event Hosted By</p>
                 <p className="font-black text-gray-800 leading-tight">{event.organizer?.name || 'Authorized Organizer'}</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
