import React from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  MapPin, 
  QrCode, 
  Download, 
  ExternalLink, 
  Loader2, 
  X, 
  CheckCircle2, 
  AlertCircle,
  Ticket,
  Maximize2
} from 'lucide-react';
import axios from '../../api/axios';
import { toast } from 'sonner';
import { Booking, AxiosErrorResponse, AxiosErrorData } from '../../types';

interface TicketCardProps {
  booking: Booking;
}

const TicketCard: React.FC<TicketCardProps> = ({ booking }) => {
  const [downloading, setDownloading] = React.useState(false);
  const { _id, event, quantity, totalAmount, paymentStatus, refundStatus, qrCode, createdAt } = booking;
  
  const isCancelled = event?.status === 'cancelled';
  const isRefunded = refundStatus === 'completed' || refundStatus === 'refunded' || paymentStatus === 'refunded' || isCancelled;

  const handleDownload = async () => {
    if (isRefunded) {
      toast.error('This booking has been refunded. Tickets are no longer valid.');
      return;
    }
    if (paymentStatus !== 'paid') {
      toast.error('Payment is pending. Tickets are only available after successful payment.');
      return;
    }
    setDownloading(true);
    try {
      const response = await axios.get(`/bookings/${_id}/download`, {
        responseType: 'blob',
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `tickets-${_id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Tickets downloaded successfully');
    } catch (error: unknown) {
      console.error('Download failed:', error);
      
      const err = error as AxiosErrorResponse;
      if (err.response) {
        if (err.response.data instanceof Blob) {
          const reader = new FileReader();
          reader.onload = () => {
            try {
              const errorMessage = JSON.parse(reader.result as string).message;
              toast.error(errorMessage || 'Failed to download tickets');
            } catch {
              toast.error('Failed to download tickets');
            }
          };
          reader.readAsText(err.response.data);
          return;
        }
        
        const message = (err.response.data as AxiosErrorData).message || 'Failed to download tickets';
        toast.error(message);
      } else {
        toast.error('Failed to download tickets');
      }
    } finally {
      setDownloading(false);
    }
  };

  const statusConfig = {
    paid: {
      label: 'Confirmed Booking',
      icon: CheckCircle2,
      classes: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
    },
    refunded: {
      label: 'Refunded',
      icon: X,
      classes: 'bg-rose-500/10 text-rose-500 border-rose-500/20'
    },
    pending: {
      label: 'Pending Payment',
      icon: AlertCircle,
      classes: 'bg-amber-500/10 text-amber-500 border-amber-500/20'
    }
  };

  const status = isRefunded ? 'refunded' : (paymentStatus || 'pending');
  const currentStatus = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01, translateY: -4 }}
      transition={{ duration: 0.3 }}
      className={`group relative w-full bg-navy-800 rounded-[32px] overflow-hidden flex flex-col md:flex-row shadow-2xl shadow-black/40 border border-navy-600 ${isRefunded ? 'opacity-90' : ''}`}
    >
      {/* Top Gradient Strip */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-gold via-[#e5c77e] to-gold" />

      {/* Left Section: Event Details */}
      <div className="flex-[1.5] p-6 md:p-10 flex flex-col justify-between relative bg-navy-900/40">
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className={`flex items-center gap-1.5 px-[10px] py-[3px] text-[12px] font-black uppercase tracking-widest rounded-[5px] border ${currentStatus.classes.replace('emerald-500/10', 'bg-[#1D9E75]/12').replace('emerald-400', 'text-[#1D9E75]').replace('emerald-900/50', 'border-[#1D9E75]/20').replace('rose-950/30', 'bg-[#E24B4A]/12').replace('rose-400', 'text-[#E24B4A]').replace('rose-900/50', 'border-[#E24B4A]/20').replace('amber-950/30', 'bg-[#EF9F27]/12').replace('amber-400', 'text-[#EF9F27]').replace('amber-900/50', 'border-[#EF9F27]/20')}`}>
                <currentStatus.icon className="w-3.5 h-3.5" />
                {currentStatus.label}
              </span>
            </div>
            <div className="flex items-center gap-2 text-navy-500 font-black uppercase tracking-widest text-[10px]">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gold font-black text-[10px] uppercase tracking-widest">
              <Ticket className="w-4 h-4" />
              Official Entry Pass
            </div>
            <h3 className="text-3xl md:text-4xl font-black text-navy-100 tracking-tight leading-tight">
              {event?.title || 'Unknown Event'}
            </h3>
          </div>

          <div className="flex flex-wrap gap-6 pt-2">
            <div className="flex items-center gap-3 text-navy-200 bg-navy-900 px-4 py-2 rounded-2xl border border-navy-600">
              <Calendar className="w-5 h-5 text-gold" />
              <div>
                <p className="text-[10px] text-navy-400 font-black uppercase tracking-widest leading-none mb-1">Date & Time</p>
                <p className="text-sm font-bold text-navy-200">{new Date(event?.date).toLocaleDateString(undefined, { weekday: 'short', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-navy-200 bg-navy-900 px-4 py-2 rounded-2xl border border-navy-600">
              <MapPin className="w-5 h-5 text-gold" />
              <div>
                <p className="text-[10px] text-navy-400 font-black uppercase tracking-widest leading-none mb-1">Location</p>
                <p className="text-sm font-bold text-navy-200 truncate max-w-[150px]">{event?.location}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 flex items-center justify-between border-t border-navy-600">
          <div className="space-y-4">
            <div>
              <p className="text-[10px] text-navy-400 font-black uppercase tracking-widest leading-none mb-2">Booking ID</p>
              <p className="text-base font-black text-navy-500 font-mono tracking-widest">{_id.substring(0, 12).toUpperCase()}</p>
            </div>
            <div className="flex gap-10">
              <div>
                <p className="text-[10px] text-navy-400 font-black uppercase tracking-widest leading-none mb-2">Quantity</p>
                <p className="text-xl font-black text-navy-100">{quantity || 0}x</p>
              </div>
              <div>
                <p className="text-[10px] text-navy-400 font-black uppercase tracking-widest leading-none mb-2">Total Value</p>
                <p className="text-xl font-black text-gold">${totalAmount?.toLocaleString() || '0.00'}</p>
              </div>
            </div>
          </div>

          <div className="hidden md:flex flex-col gap-3">
             <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDownload}
                disabled={downloading || paymentStatus !== 'paid' || isRefunded}
                className="group relative px-8 py-3 bg-gold text-navy-900 font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-gold/10 transition-all disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed overflow-hidden"
            >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                <span className="relative z-10 font-black">{isRefunded ? 'Invalid' : 'Download PDF'}</span>
            </motion.button>
            <button className="flex items-center justify-center gap-2 text-navy-400 hover:text-gold font-black text-[10px] uppercase tracking-widest transition-colors">
              <ExternalLink className="w-3.5 h-3.5" />
              Access Event
            </button>
          </div>
        </div>
      </div>

      {/* Ticket Perforation Area */}
      <div className="relative flex flex-col md:flex-row items-center justify-center bg-navy-900/20">
        <div className="absolute inset-x-0 top-1/2 md:inset-y-0 md:left-1/2 md:top-0 border-t-2 md:border-l-2 border-dashed border-navy-600 h-0 md:h-full w-full md:w-0" />
        
        <div className="absolute -top-4 md:left-0 md:-translate-x-1/2 w-8 h-8 bg-navy-900 rounded-full shadow-inner border border-navy-600 z-10 hidden md:block" />
        <div className="absolute -bottom-4 md:left-0 md:-translate-x-1/2 w-8 h-8 bg-navy-900 rounded-full shadow-inner border border-navy-600 z-10 hidden md:block" />
        
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-8 h-8 bg-navy-900 rounded-full shadow-inner border border-navy-600 z-10 md:hidden" />
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-8 h-8 bg-navy-900 rounded-full shadow-inner border border-navy-600 z-10 md:hidden" />
      </div>

      {/* Right Section: QR Code & Mobile Actions */}
      <div className="w-full md:w-80 bg-navy-900/60 p-8 md:p-10 flex flex-col items-center justify-center space-y-6 relative overflow-hidden backdrop-blur-md">
        <div className="relative group/qr">
          <div className="absolute -inset-4 bg-gold/10 rounded-[2.5rem] blur-2xl opacity-0 group-hover/qr:opacity-100 transition-opacity duration-500" />
          <div className="relative p-5 bg-navy-900 rounded-[2rem] shadow-2xl border border-navy-600 flex flex-col items-center gap-3">
              {isRefunded ? (
                  <div className="w-40 h-40 flex items-center justify-center bg-rose-950/30 rounded-2xl border-2 border-dashed border-rose-900/50">
                      <X className="w-16 h-16 text-rose-400/30" />
                  </div>
              ) : qrCode ? (
                  <div className="relative group/img">
                    <img src={qrCode} alt="Ticket QR" className="w-40 h-40 object-contain transition-transform duration-500 group-hover/img:scale-105 rounded-xl" />
                    <div className="absolute inset-0 flex items-center justify-center bg-navy-950/60 opacity-0 group-hover/img:opacity-100 rounded-xl transition-opacity">
                        <Maximize2 className="text-gold w-8 h-8" />
                    </div>
                  </div>
              ) : (
                  <div className="w-40 h-40 flex items-center justify-center bg-navy-800 rounded-2xl border border-navy-600">
                    <QrCode className="w-16 h-16 text-navy-600 animate-pulse" />
                  </div>
              )}
              <div className="text-[10px] font-black text-navy-500 uppercase tracking-widest text-center">
                Cryptographic Key
              </div>
          </div>
        </div>

        {/* Mobile Only Actions */}
        <div className="flex md:hidden flex-col gap-3 w-full">
             <motion.button 
                whileTap={{ scale: 0.98 }}
                onClick={handleDownload}
                disabled={downloading || paymentStatus !== 'paid' || isRefunded}
                className="w-full py-4 bg-gold text-navy-900 font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-gold/10"
            >
                {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                {isRefunded ? 'Invalid' : 'Download Pass'}
            </motion.button>
            <button className="w-full py-4 bg-navy-700 border border-navy-600 text-navy-200 font-black text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2">
                <ExternalLink className="w-4 h-4" />
                Event Detail
            </button>
        </div>

        <div className="text-center md:absolute md:bottom-8 w-full px-8">
            <p className="text-[9px] text-navy-500 font-black leading-relaxed uppercase tracking-[0.2em] opacity-60">
              Official Digital Pass
            </p>
        </div>
      </div>
    </motion.div>
  );
};

export default TicketCard;
