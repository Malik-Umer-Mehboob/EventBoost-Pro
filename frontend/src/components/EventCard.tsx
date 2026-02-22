import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Users, Edit3, Trash2, ShieldCheck, Ticket } from 'lucide-react';
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
      whileHover={{ y: -8 }}
      className="group relative glass rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300"
    >
      {/* Featured Badge */}
      {event.isFeatured && (
        <div className="absolute top-4 left-4 z-10 bg-rose-500 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-lg border border-rose-400 flex items-center gap-1">
          <ShieldCheck className="w-3 h-3" />
          Featured
        </div>
      )}

      {/* Category Badge */}
      <div className="absolute top-4 right-4 z-10 bg-white/80 backdrop-blur-md text-indigo-600 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
        {event.category}
      </div>

      {/* Banner Image */}
      <div className="relative h-56 overflow-hidden">
        <img 
          src={event.bannerImage?.url || 'https://images.unsplash.com/photo-1540575861501-7cf05a4b125a?q=80&w=1000'} 
          alt={event.title}
          className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-800 mb-2 truncate group-hover:text-indigo-600 transition-colors">
          {event.title}
        </h3>
        
        <p className="text-gray-500 text-sm line-clamp-2 mb-4 h-10">
          {event.description}
        </p>

        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Calendar className="w-4 h-4" />
            </div>
            <span>{new Date(event.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
          </div>

          <div className="flex items-center gap-3 text-sm text-gray-600">
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg">
              <MapPin className="w-4 h-4" />
            </div>
            <span className="truncate">{event.location}</span>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Users className="w-4 h-4 text-emerald-500" />
              <span>{event.soldTickets || 0} / {event.ticketQuantity} booked</span>
            </div>
            <div className="text-xl font-black text-indigo-600">
              {event.ticketPrice === 0 ? 'FREE' : `$${event.ticketPrice}`}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 gap-3">
          {onBuy && !isRegistered && (
            <button 
              onClick={() => onBuy(event)}
              disabled={isSoldOut || isOwner || isAdmin}
              className={`w-full py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all group/btn ${
                isSoldOut || isOwner || isAdmin
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200' 
                  : 'gradient-primary text-white shadow-lg shadow-indigo-200 hover:scale-[1.02]'
              }`}
            >
              {isSoldOut ? (
                <>Sold Out</>
              ) : isOwner ? (
                <>Your Event</>
              ) : isAdmin ? (
                <>Admin Access Only</>
              ) : (
                <>
                  <Ticket className="w-4 h-4" />
                  Buy Ticket
                </>
              )}
            </button>
          )}

          {isRegistered && (
            <div className="w-full bg-emerald-50 text-emerald-600 py-3 rounded-2xl font-bold text-center border border-emerald-100">
              Already Registered
            </div>
          )}

          <div className="flex gap-2">
            {(isOwner || isAdmin) && onEdit && (
              <button 
                onClick={() => onEdit(event)}
                className="flex-1 bg-white border border-gray-100 text-gray-700 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors shadow-sm"
              >
                <Edit3 className="w-4 h-4 text-blue-500" />
                Edit
              </button>
            )}
            {(isOwner || isAdmin) && onDelete && (
              <button 
                onClick={() => onDelete(event._id!)}
                className="flex-1 bg-white border border-gray-100 text-gray-700 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-all shadow-sm group/del"
              >
                <Trash2 className="w-4 h-4 text-rose-500 group-hover/del:scale-110 transition-transform" />
                Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default EventCard;
