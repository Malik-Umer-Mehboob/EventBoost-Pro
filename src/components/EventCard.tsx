import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Edit3, Trash2, ShieldCheck, Ticket, RefreshCw, Star } from 'lucide-react';
import { EventData } from '../api/eventApi';

interface EventCardProps {
  event: EventData;
  onDelete?: (id: string) => void;
  onEdit?: (event: EventData) => void;
  isOwner?: boolean;
  isAdmin?: boolean;
  isRegistered?: boolean;
  onBuy?: (event: EventData) => void;
  onCancel?: (id: string) => void;
}

const EventCard: React.FC<EventCardProps> = ({ 
  event, 
  onDelete, 
  onEdit, 
  isOwner, 
  isAdmin,
  isRegistered,
  onBuy,
  onCancel
}) => {
  const isSoldOut = (event.soldTickets || 0) >= event.ticketQuantity;
  const isCancelled = event.status === 'cancelled';

  return (
    <motion.div
      whileHover={!isCancelled ? { 
        y: -4,
        transition: { type: "spring", stiffness: 400, damping: 25 }
      } : {}}
      className={`group relative bg-navy-700 rounded-3xl overflow-hidden shadow-xl shadow-black/20 hover:shadow-black/40 transition-all duration-300 border border-navy-600 ${isCancelled ? 'opacity-75 grayscale-[0.5]' : ''}`}
    >
      {/* Cancelled Badge */}
      {isCancelled && (
        <div className="absolute top-4 left-4 z-20 bg-navy-950/90 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5 border border-navy-600">
          <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
          Cancelled
        </div>
      )}

      {/* Featured Badge */}
      {event.isFeatured && !isCancelled && (
        <div className="absolute top-4 left-4 z-10 bg-gold text-navy-900 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5 border border-navy-900/10">
          <ShieldCheck className="w-3.5 h-3.5" />
          Featured
        </div>
      )}

      {/* Category Badge */}
      <div className="absolute top-4 right-4 z-10 bg-navy-800/90 backdrop-blur-md text-gold text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm border border-navy-600">
        {event.category}
      </div>

      {/* Banner Image */}
      <div className="relative h-56 overflow-hidden bg-navy-900">
        <img 
          src={event.bannerImage?.url || 'https://images.unsplash.com/photo-1540575861501-7cf05a4b125a?q=80&w=1000'} 
          alt={event.title}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 to-transparent opacity-60 transition-opacity" />
        
        {/* Live Attendee Pulse */}
        <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
          <div className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
          </div>
          <span className="text-[10px] font-black text-white tracking-widest uppercase">
            {event.soldTickets || 0} Attending
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 sm:p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-black text-navy-100 group-hover:text-gold transition-colors leading-tight truncate tracking-tight">
            {event.title}
          </h3>
        </div>
        
        <p className="text-navy-400 text-sm leading-relaxed mb-5 h-10 line-clamp-2 font-medium">
          {event.description}
        </p>

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-navy-800 text-navy-400 rounded-xl flex items-center justify-center shrink-0 border border-navy-600">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-navy-500 font-black uppercase tracking-widest leading-none mb-0.5">Date</p>
              <p className="text-sm font-bold text-navy-200">{new Date(event.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-navy-800 text-navy-400 rounded-xl flex items-center justify-center shrink-0 border border-navy-600">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-navy-500 font-black uppercase tracking-widest leading-none mb-0.5">Location</p>
              <p className="text-sm font-bold text-navy-200 truncate">{event.location}</p>
            </div>
          </div>
        </div>

        {/* Pricing & Actions */}
        <div className="flex items-center justify-between mb-5 pb-5 border-b border-navy-600">
           <div>
              <p className="text-[10px] text-navy-500 font-black uppercase tracking-widest leading-none mb-0.5">Price</p>
              <p className="text-xl font-black text-navy-100">
                {event.ticketPrice === 0 ? 'Free' : `$${event.ticketPrice}`}
              </p>
           </div>
           <div className="text-right">
              <p className="text-[10px] text-navy-500 font-black uppercase tracking-widest leading-none mb-0.5">Availability</p>
              <p className={`text-sm font-black uppercase tracking-widest ${isSoldOut ? 'text-rose-500' : 'text-emerald-400'}`}>
                {isSoldOut ? 'Sold Out' : `${event.ticketQuantity - (event.soldTickets || 0)} Left`}
              </p>
           </div>
        </div>

        {/* Star Rating */}
        {(event.totalReviews ?? 0) > 0 && (
          <div className="flex items-center gap-2 mb-4">
            <Star className="w-3.5 h-3.5" style={{ fill: '#C9A84C', color: '#C9A84C' }} />
            <span className="text-sm font-black" style={{ color: '#C9A84C' }}>
              {(event.averageRating ?? 0).toFixed(1)}
            </span>
            <span className="text-xs font-medium" style={{ color: '#5A7A94' }}>
              ({event.totalReviews} {event.totalReviews === 1 ? 'review' : 'reviews'})
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 gap-3">
          {onBuy && !isRegistered && (
            <button 
              onClick={() => onBuy(event)}
              disabled={isSoldOut || isOwner || isAdmin}
              className={`w-full py-3 rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                isSoldOut || isOwner || isAdmin
                  ? 'bg-navy-800 text-navy-500 cursor-not-allowed border border-navy-600' 
                  : 'bg-gold text-navy-900 hover:bg-[#b8963e] shadow-lg shadow-gold/10'
              }`}
            >
              {isSoldOut ? (
                <>No Tickets Left</>
              ) : isOwner ? (
                <>Your Event</>
              ) : isAdmin ? (
                <>Admin View</>
              ) : (
                <>
                  <Ticket className="w-4 h-4" />
                  Get Tickets
                </>
              )}
            </button>
          )}

          {isRegistered && (
            <div className="w-full bg-emerald-950/30 text-emerald-400 py-3 rounded-xl font-black text-xs uppercase tracking-widest text-center border border-emerald-900/50 flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              Registered
            </div>
          )}

          {(isOwner || isAdmin) && (
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={() => onEdit && onEdit(event)}
                  className="flex-1 bg-navy-800 border border-navy-600 text-navy-200 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-navy-600 transition-all shadow-sm"
                >
                  <Edit3 className="w-4 h-4 text-gold" />
                  Edit
                </button>
                <button 
                  onClick={() => onDelete && onDelete(event._id!)}
                  className="flex-1 bg-navy-800 border border-navy-600 text-navy-200 py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-rose-950/30 hover:text-rose-400 hover:border-rose-900/50 transition-all shadow-sm group/del"
                >
                  <Trash2 className="w-4 h-4 text-rose-500 group-hover/del:scale-110 transition-transform" />
                  Remove
                </button>
              </div>
              
              {isAdmin && !isCancelled && (
                <button 
                  onClick={() => onCancel && onCancel(event._id!)}
                  className="w-full bg-rose-600 text-white py-3.5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-rose-700 transition-all shadow-lg shadow-rose-950/20"
                >
                  <RefreshCw className="w-4 h-4" />
                  Cancel Event & Refund
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default EventCard;
