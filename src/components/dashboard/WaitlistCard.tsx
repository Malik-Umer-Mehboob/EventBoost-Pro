import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, XCircle, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface WaitlistCardProps {
  entry: {
    _id: string;
    event: {
      _id: string;
      title: string;
      date: string;
      location: string;
      bannerImage?: { url: string };
      ticketPrice: number;
    };
    position: number;
    status: 'waiting' | 'notified' | 'expired' | 'converted';
    expiresAt?: string;
  };
  onLeave: (eventId: string) => void;
}

const WaitlistCard: React.FC<WaitlistCardProps> = ({ entry, onLeave }) => {
  const isNotified = entry.status === 'notified';
  const isExpired = entry.status === 'expired';
  const isWaiting = entry.status === 'waiting';

  const getStatusConfig = () => {
    switch (entry.status) {
      case 'notified':
        return {
          icon: AlertCircle,
          text: 'Spot Available!',
          bg: 'bg-emerald-900/20',
          border: 'border-emerald-500/30',
          color: 'text-emerald-400'
        };
      case 'expired':
        return {
          icon: XCircle,
          text: 'Expired',
          bg: 'bg-rose-900/20',
          border: 'border-rose-500/30',
          color: 'text-rose-400'
        };
      case 'converted':
        return {
          icon: CheckCircle,
          text: 'Purchased',
          bg: 'bg-blue-900/20',
          border: 'border-blue-500/30',
          color: 'text-blue-400'
        };
      default:
        return {
          icon: Clock,
          text: `Position #${entry.position}`,
          bg: 'bg-amber-900/20',
          border: 'border-amber-500/30',
          color: 'text-[#C9A84C]'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className="bg-[#162333] border border-[#2E4A63] rounded-[24px] overflow-hidden hover:border-[#3D5A73] transition-all group">
      <div className="flex flex-col md:flex-row">
        {/* Event Image */}
        <div className="w-full md:w-48 h-48 md:h-auto relative overflow-hidden">
          <img 
            src={entry.event.bannerImage?.url || 'https://images.unsplash.com/photo-1540575861501-7cf05a4b125a?q=80&w=1000'} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            alt=""
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F1C2E] to-transparent opacity-60" />
        </div>

        <div className="flex-1 p-6 flex flex-col justify-between">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="space-y-2">
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${config.bg} ${config.color} border ${config.border}`}>
                <config.icon className="w-3 h-3" />
                {config.text}
              </div>
              <h3 className="text-xl font-black text-[#EDF2F7] group-hover:text-[#C9A84C] transition-colors">
                {entry.event.title}
              </h3>
              <div className="flex flex-wrap gap-4 text-[#7A94AA] text-sm">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {new Date(entry.event.date).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" />
                  {entry.event.location}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              {isNotified ? (
                <Link 
                  to={`/events/${entry.event._id}`}
                  className="px-6 py-2.5 bg-emerald-500 text-[#0F1C2E] rounded-xl font-black text-sm hover:bg-emerald-400 transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] flex items-center justify-center gap-2"
                >
                  Buy Now <ArrowRight className="w-4 h-4" />
                </Link>
              ) : isWaiting ? (
                <button 
                  onClick={() => onLeave(entry.event._id)}
                  className="px-6 py-2.5 bg-[#1A2B3D] text-rose-400 border border-rose-900/30 rounded-xl font-black text-sm hover:bg-rose-900/10 transition-all"
                >
                  Leave Waitlist
                </button>
              ) : (
                <Link 
                  to={`/events/${entry.event._id}`}
                  className="px-6 py-2.5 bg-[#1A2B3D] text-[#7A94AA] border border-[#2E4A63] rounded-xl font-black text-sm hover:text-[#C9A84C] transition-all"
                >
                  View Event
                </Link>
              )}
            </div>
          </div>

          {isNotified && entry.expiresAt && (
            <div className="mt-4 pt-4 border-t border-dashed border-[#2E4A63] flex items-center gap-2 text-emerald-500/80 text-xs font-bold">
              <Clock className="w-4 h-4" />
              Expires in {new Date(entry.expiresAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (24h window)
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WaitlistCard;
