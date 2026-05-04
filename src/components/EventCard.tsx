import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Edit3, Trash2, ShieldCheck, Ticket, RefreshCw } from 'lucide-react';
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
      className={`group relative bg-white rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300 border border-gray-100 ${isCancelled ? 'opacity-75 grayscale-[0.5]' : ''}`}
    >
      {/* Cancelled Badge */}
      {isCancelled && (
        <div className="absolute top-4 left-4 z-20 bg-gray-900/90 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
          Cancelled
        </div>
      )}

      {/* Featured Badge */}
      {event.isFeatured && !isCancelled && (
        <div className="absolute top-4 left-4 z-10 bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5" />
          Featured
        </div>
      )}

      {/* Category Badge */}
      <div className="absolute top-4 right-4 z-10 bg-white/95 backdrop-blur-md text-gray-700 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full shadow-sm border border-gray-100">
        {event.category}
      </div>

      {/* Banner Image */}
      <div className="relative h-56 overflow-hidden bg-gray-100">
        <img 
          src={event.bannerImage?.url || 'https://images.unsplash.com/photo-1540575861501-7cf05a4b125a?q=80&w=1000'} 
          alt={event.title}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent opacity-60 transition-opacity" />
        
        {/* Live Attendee Pulse */}
        <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/30 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10">
          <div className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
          </div>
          <span className="text-[10px] font-semibold text-white tracking-wide">
            {event.soldTickets || 0} Attending
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 sm:p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors leading-tight truncate">
            {event.title}
          </h3>
        </div>
        
        <p className="text-gray-500 text-sm leading-relaxed mb-5 h-10 line-clamp-2">
          {event.description}
        </p>

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-50 text-gray-500 rounded-lg flex items-center justify-center shrink-0 border border-gray-100">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider leading-none mb-0.5">Date</p>
              <p className="text-sm font-medium text-gray-800">{new Date(event.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-50 text-gray-500 rounded-lg flex items-center justify-center shrink-0 border border-gray-100">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider leading-none mb-0.5">Location</p>
              <p className="text-sm font-medium text-gray-800 truncate">{event.location}</p>
            </div>
          </div>
        </div>

        {/* Pricing & Actions */}
        <div className="flex items-center justify-between mb-5 pb-5 border-b border-gray-100">
           <div>
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider leading-none mb-0.5">Price</p>
              <p className="text-xl font-bold text-gray-900">
                {event.ticketPrice === 0 ? 'Free' : `$${event.ticketPrice}`}
              </p>
           </div>
           <div className="text-right">
              <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider leading-none mb-0.5">Availability</p>
              <p className={`text-sm font-semibold ${isSoldOut ? 'text-rose-500' : 'text-emerald-600'}`}>
                {isSoldOut ? 'Sold Out' : `${event.ticketQuantity - (event.soldTickets || 0)} Left`}
              </p>
           </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {onBuy && !isRegistered && (
            <button 
              onClick={() => onBuy(event)}
              disabled={isSoldOut || isOwner || isAdmin}
              className={`w-full py-3 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all ${
                isSoldOut || isOwner || isAdmin
                  ? 'bg-gray-50 text-gray-400 cursor-not-allowed border border-gray-200' 
                  : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-[0_2px_10px_rgba(79,70,229,0.2)] hover:shadow-[0_4px_14px_rgba(79,70,229,0.3)]'
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
            <div className="w-full bg-emerald-50 text-emerald-700 py-3 rounded-xl font-semibold text-sm text-center border border-emerald-100 flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              Registered
            </div>
          )}

          {(isOwner || isAdmin) && (
            <div className="flex flex-col gap-3">
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
              
              {isAdmin && !isCancelled && (
                <button 
                  onClick={() => onCancel && onCancel(event._id!)}
                  className="w-full bg-rose-500 text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-rose-600 transition-all shadow-lg shadow-rose-100"
                >
                  <RefreshCw className="w-4 h-4" />
                  Cancel Event & Refund Users
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
