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
      className={`group relative w-full glass-card rounded-[2rem] overflow-hidden flex flex-col md:flex-row shadow-2xl border border-white/20 
        ${isRefunded ? 'opacity-90' : ''} bg-gradient-to-br from-white/95 to-slate-50/90 backdrop-blur-xl`}
    >
      {/* Top Gradient Strip */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600" />

      {/* Left Section: Event Details */}
      <div className="flex-[1.5] p-6 md:p-10 flex flex-col justify-between relative">
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className={`flex items-center gap-1.5 px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-full border ${currentStatus.classes}`}>
                <currentStatus.icon className="w-3.5 h-3.5" />
                {currentStatus.label}
              </span>
              {isCancelled && !isRefunded && (
                <span className="flex items-center gap-1.5 px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider rounded-full border bg-red-500/10 text-red-500 border-red-500/20">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Event Cancelled
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-slate-400 font-medium text-xs">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs uppercase tracking-[0.2em]">
              <Ticket className="w-4 h-4" />
              Event Ticket
            </div>
            <h3 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight leading-tight">
              {event?.title || 'Unknown Event'}
            </h3>
          </div>

          <div className="flex flex-wrap gap-6 pt-2">
            <div className="flex items-center gap-3 text-slate-600 bg-slate-100/50 px-4 py-2 rounded-2xl border border-slate-200/50">
              <Calendar className="w-5 h-5 text-indigo-500" />
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none mb-0.5">Date & Time</p>
                <p className="text-sm font-bold text-slate-700">{new Date(event?.date).toLocaleDateString(undefined, { weekday: 'short', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-slate-600 bg-slate-100/50 px-4 py-2 rounded-2xl border border-slate-200/50">
              <MapPin className="w-5 h-5 text-rose-500" />
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider leading-none mb-0.5">Location</p>
                <p className="text-sm font-bold text-slate-700 truncate max-w-[150px]">{event?.location}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 flex items-center justify-between border-t border-slate-200/60">
          <div className="space-y-4">
            <div>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] leading-none mb-1.5">Booking ID</p>
              <p className="text-base font-black text-slate-800 font-mono tracking-wider">{_id.substring(0, 10).toUpperCase()}</p>
            </div>
            <div className="flex gap-10">
              <div>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] leading-none mb-1.5">Quantity</p>
                <p className="text-xl font-black text-slate-800">{quantity || 0}x</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] leading-none mb-1.5">Total Paid</p>
                <p className="text-xl font-black text-indigo-600">${totalAmount?.toLocaleString() || '0.00'}</p>
              </div>
            </div>
          </div>

          <div className="hidden md:flex flex-col gap-3">
             <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDownload}
                disabled={downloading || paymentStatus !== 'paid' || isRefunded}
                className="group relative px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed overflow-hidden"
            >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                <span className="relative z-10">{isRefunded ? 'Ticket Invalid' : 'Download PDF'}</span>
            </motion.button>
            <button className="flex items-center justify-center gap-2 text-slate-400 hover:text-indigo-600 font-bold text-xs transition-colors">
              <ExternalLink className="w-3.5 h-3.5" />
              View Event Page
            </button>
          </div>
        </div>
      </div>

      {/* Ticket Perforation Area */}
      <div className="relative flex flex-col md:flex-row items-center justify-center">
        {/* Horizontal line for mobile, vertical for desktop */}
        <div className="absolute inset-x-0 top-1/2 md:inset-y-0 md:left-1/2 md:top-0 border-t-2 md:border-l-2 border-dashed border-slate-200/80 h-0 md:h-full w-full md:w-0" />
        
        {/* Perforation holes */}
        <div className="absolute -top-4 md:left-0 md:-translate-x-1/2 w-8 h-8 bg-slate-100 rounded-full shadow-inner border border-slate-200/40 z-10 hidden md:block" />
        <div className="absolute -bottom-4 md:left-0 md:-translate-x-1/2 w-8 h-8 bg-slate-100 rounded-full shadow-inner border border-slate-200/40 z-10 hidden md:block" />
        
        {/* Mobile perforation holes */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-8 h-8 bg-slate-100 rounded-full shadow-inner border border-slate-200/40 z-10 md:hidden" />
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-8 h-8 bg-slate-100 rounded-full shadow-inner border border-slate-200/40 z-10 md:hidden" />
      </div>

      {/* Right Section: QR Code & Mobile Actions */}
      <div className="w-full md:w-80 bg-slate-50/50 p-8 md:p-10 flex flex-col items-center justify-center space-y-6 relative overflow-hidden backdrop-blur-sm">
        <div className="relative group/qr">
          <div className="absolute -inset-4 bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 rounded-[2.5rem] blur-2xl opacity-0 group-hover/qr:opacity-100 transition-opacity duration-500" />
          <div className="relative p-5 bg-white rounded-[2rem] shadow-2xl border border-slate-100 flex flex-col items-center gap-3">
              {isRefunded ? (
                  <div className="w-40 h-40 flex items-center justify-center bg-rose-50 rounded-2xl border-2 border-dashed border-rose-100">
                      <X className="w-16 h-16 text-rose-200" />
                  </div>
              ) : qrCode ? (
                  <div className="relative group/img">
                    <img src={qrCode} alt="Ticket QR" className="w-40 h-40 object-contain transition-transform duration-500 group-hover/img:scale-105" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover/img:opacity-100 rounded-xl transition-opacity">
                        <Maximize2 className="text-white w-8 h-8" />
                    </div>
                  </div>
              ) : (
                  <div className="w-40 h-40 flex items-center justify-center bg-slate-50 rounded-2xl">
                    <QrCode className="w-16 h-16 text-slate-200 animate-pulse" />
                  </div>
              )}
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] text-center">
                Scan for entry
              </div>
          </div>
        </div>

        {/* Mobile Only Actions */}
        <div className="flex md:hidden flex-col gap-3 w-full">
             <motion.button 
                whileTap={{ scale: 0.98 }}
                onClick={handleDownload}
                disabled={downloading || paymentStatus !== 'paid' || isRefunded}
                className="w-full py-4 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-indigo-100"
            >
                {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                {isRefunded ? 'Ticket Invalid' : 'Download PDF Ticket'}
            </motion.button>
            <button className="w-full py-4 bg-white/50 border border-slate-200 text-slate-600 font-bold text-sm rounded-2xl flex items-center justify-center gap-2">
                <ExternalLink className="w-4 h-4" />
                Event Details
            </button>
        </div>

        <div className="text-center md:absolute md:bottom-8 w-full px-8">
            <p className="text-[9px] text-slate-400 font-medium leading-relaxed">
              This is a digital pass. Please present this QR code at the event entrance for validation.
            </p>
        </div>
      </div>
    </motion.div>
  );
};

export default TicketCard;
