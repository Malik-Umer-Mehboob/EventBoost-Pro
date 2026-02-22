import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Edit3, Trash2, ShieldCheck, Ticket } from 'lucide-react';
import { EventData } from '../api/eventApi';

interface EventCardProps {
  event: EventData;
  onDelete?: (id: string) => void;
  onEdit?: (event: EventData) => void;
  isOwner?: boolean;
  isAdmin?: boolean;
  isRegistered?: boolean;
  onBuy?: (event: EventData) => void;
}

const EventCard: React.FC<EventCardProps> = ({ 
  event, 
  onDelete, 
  onEdit, 
  isOwner, 
  isAdmin,
  isRegistered,
  onBuy
}) => {
  const isSoldOut = (event.soldTickets || 0) >= event.ticketQuantity;
  return (
    <motion.div
      whileHover={{ 
        y: -12,
        scale: 1.01,
        transition: { type: "spring", stiffness: 400, damping: 20 }
      }}
      className="group relative bg-white rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(99,102,241,0.1)] transition-all duration-500 border border-gray-100/50"
    >
      {/* Featured Badge */}
      {event.isFeatured && (
        <div className="absolute top-4 left-4 z-10 bg-rose-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-lg shadow-rose-200 border border-rose-400 flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5" />
          Featured
        </div>
      )}

      {/* Category Badge */}
      <div className="absolute top-4 right-4 z-10 bg-white/90 backdrop-blur-md text-indigo-600 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm border border-indigo-50">
        {event.category}
      </div>

      {/* Banner Image */}
      <div className="relative h-60 overflow-hidden">
        <img 
          src={event.bannerImage?.url || 'https://images.unsplash.com/photo-1540575861501-7cf05a4b125a?q=80&w=1000'} 
          alt={event.title}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
        
        {/* Live Attendee Pulse */}
        <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </div>
          <span className="text-[10px] font-black text-white uppercase tracking-tighter">
            {event.soldTickets || 0} Attending
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-7">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-black text-gray-900 group-hover:text-indigo-600 transition-colors leading-tight truncate">
            {event.title}
          </h3>
        </div>
        
        <p className="text-gray-500 text-sm leading-relaxed mb-6 h-10 line-clamp-2">
          {event.description}
        </p>

        <div className="space-y-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0 border border-indigo-100/50">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">When</p>
              <p className="text-sm font-bold text-gray-700">{new Date(event.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center shrink-0 border border-rose-100/50">
              <MapPin className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">Where</p>
              <p className="text-sm font-bold text-gray-700 truncate">{event.location}</p>
            </div>
          </div>
        </div>

        {/* Pricing & Actions */}
        <div className="flex items-center justify-between mb-6 pb-6 border-b border-dashed border-gray-100">
           <div>
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">Price</p>
              <p className="text-2xl font-black text-indigo-600">
                {event.ticketPrice === 0 ? 'FREE' : `$${event.ticketPrice}`}
              </p>
           </div>
           <div className="text-right">
              <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none mb-1">Availability</p>
              <p className={`text-sm font-black ${isSoldOut ? 'text-rose-500' : 'text-emerald-600'}`}>
                {isSoldOut ? 'Sold Out' : `${event.ticketQuantity - (event.soldTickets || 0)} Left`}
              </p>
           </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {onBuy && !isRegistered && (
            <motion.button 
              onClick={() => onBuy(event)}
              disabled={isSoldOut || isOwner || isAdmin}
              whileHover={!isSoldOut && !isOwner && !isAdmin ? { scale: 1.02 } : {}}
              whileTap={!isSoldOut && !isOwner && !isAdmin ? { scale: 0.98 } : {}}
              className={`w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all uppercase tracking-widest ${
                isSoldOut || isOwner || isAdmin
                  ? 'bg-gray-50 text-gray-300 cursor-not-allowed border border-gray-100' 
                  : 'gradient-primary text-white shadow-xl shadow-indigo-100 hover:shadow-indigo-200'
              }`}
            >
              {isSoldOut ? (
                <>No Tickets Left</>
              ) : isOwner ? (
                <>Your Ownership</>
              ) : isAdmin ? (
                <>Admin Dashboard</>
              ) : (
                <>
                  <Ticket className="w-5 h-5" />
                  Secure Ticket Now
                </>
              )}
            </motion.button>
          )}

          {isRegistered && (
            <div className="w-full bg-emerald-50/50 text-emerald-600 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-center border border-emerald-100 flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Seat Secured
            </div>
          )}

          {(isOwner || isAdmin) && (
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => onEdit && onEdit(event)}
                className="flex-1 bg-white border border-gray-200 text-gray-800 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-50 transition-all shadow-sm"
              >
                <Edit3 className="w-4 h-4 text-blue-500" />
                Edit
              </button>
              <button 
                onClick={() => onDelete && onDelete(event._id!)}
                className="flex-1 bg-white border border-gray-200 text-gray-800 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all shadow-sm group/del"
              >
                <Trash2 className="w-4 h-4 text-rose-500 group-hover/del:scale-110 transition-transform" />
                Remove
              </button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default EventCard;
