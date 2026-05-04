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
      className={`group relative bg-[#1A2B3D] rounded-2xl overflow-hidden shadow-[0_2px_12px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.4)] transition-all duration-300 border-[0.5px] border-[#2E4A63] hover:border-[#C9A84C] ${isCancelled ? 'opacity-75 grayscale-[0.5]' : ''}`}
    >
      {/* Cancelled Badge */}
      {isCancelled && (
        <div className="absolute top-4 left-4 z-20 bg-[#08111C]/90 backdrop-blur-md text-[#B8C5D3] text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
          Cancelled
        </div>
      )}

      {/* Featured Badge */}
      {event.isFeatured && !isCancelled && (
        <div className="absolute top-4 left-4 z-10 bg-[#C9A84C] text-[#0F1C2E] text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5" />
          Featured
        </div>
      )}

      {/* Category Badge */}
      <div className="absolute top-4 right-4 z-10 bg-[rgba(201,168,76,0.12)] backdrop-blur-md text-[#C9A84C] text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full shadow-sm">
        {event.category}
      </div>

      {/* Banner Image */}
      <div className="relative h-56 overflow-hidden bg-[#1A2B3D]">
        <img
          src={event.bannerImage?.url || 'https://images.unsplash.com/photo-1540575861501-7cf05a4b125a?q=80&w=1000'}
          alt={event.title}
          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#08111C]/70 to-transparent opacity-60 transition-opacity" />

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
          <h3 className="text-lg font-bold text-[#EDF2F7] group-hover:text-[#C9A84C] transition-colors leading-tight truncate">
            {event.title}
          </h3>
          {event.totalReviews! > 0 && (
            <div className="flex items-center gap-1.5 shrink-0 ml-2">
              <span className="text-[#C9A84C] font-black text-xs">⭐</span>
              <span className="text-[#C9A84C] font-black text-xs">{event.averageRating}</span>
              <span className="text-[#5A7A94] text-[10px] font-bold">({event.totalReviews})</span>
            </div>
          )}
        </div>

        <p className="text-[#7A94AA] text-sm leading-relaxed mb-5 h-10 line-clamp-2">
          {event.description}
        </p>

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#1A2B3D] text-[#5A7A94] rounded-lg flex items-center justify-center shrink-0 border border-[#2E4A63]">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-[#5A7A94] font-semibold uppercase tracking-wider leading-none mb-0.5">Date</p>
              <p className="text-sm font-medium text-[#B8C5D3]">{new Date(event.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#1A2B3D] text-[#5A7A94] rounded-lg flex items-center justify-center shrink-0 border border-[#2E4A63]">
              <MapPin className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] text-[#5A7A94] font-semibold uppercase tracking-wider leading-none mb-0.5">Location</p>
              <p className="text-sm font-medium text-[#B8C5D3] truncate">{event.location}</p>
            </div>
          </div>
        </div>

        {/* Pricing & Actions */}
        <div className="flex items-center justify-between mb-5 pb-5 border-b border-[#2E4A63]">
          <div>
            <p className="text-[10px] text-[#5A7A94] font-semibold uppercase tracking-wider leading-none mb-0.5">Price</p>
            <p className="text-xl font-bold text-[#C9A84C]">
              {event.ticketPrice === 0 ? 'Free' : `$${event.ticketPrice}`}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-[#5A7A94] font-semibold uppercase tracking-wider leading-none mb-0.5">Availability</p>
            <p className={`text-sm font-semibold ${isSoldOut ? 'text-rose-400' : 'text-emerald-400'}`}>
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
                  ? 'bg-[#2E4A63] text-[#5A7A94] cursor-not-allowed border border-[#2E4A63]'
                  : 'bg-[#0F1C2E] border border-[#C9A84C] text-[#C9A84C] hover:bg-[#C9A84C] hover:text-[#0F1C2E] shadow-[0_2px_10px_rgba(201,168,76,0.2)]'
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
            <div className="w-full bg-emerald-900/30 text-emerald-400 py-3 rounded-xl font-semibold text-sm text-center border border-emerald-700/40 flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" />
              Registered
            </div>
          )}

          {(isOwner || isAdmin) && (
            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => onEdit && onEdit(event)}
                  className="flex-1 bg-[#1A2B3D] border border-[#2E4A63] text-[#B8C5D3] py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:border-[#C9A84C] hover:text-[#C9A84C] transition-all"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => onDelete && onDelete(event._id!)}
                  className="flex-1 bg-[#1A2B3D] border border-[#2E4A63] text-[#B8C5D3] py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-rose-900/20 hover:text-rose-400 hover:border-rose-700/40 transition-all"
                >
                  <Trash2 className="w-4 h-4 text-rose-400" />
                  Remove
                </button>
              </div>

              {isAdmin && !isCancelled && (
                <button
                  onClick={() => onCancel && onCancel(event._id!)}
                  className="w-full bg-rose-600 text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-rose-700 transition-all"
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
