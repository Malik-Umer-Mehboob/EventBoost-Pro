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
      classes: 'bg-[#1D9E75]/10 text-[#1D9E75] border-[#1D9E75]/20'
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
      className={`group relative w-full bg-[#162333] rounded-[32px] overflow-hidden flex flex-col md:flex-row shadow-[0_8px_30px_rgb(0,0,0,0.06)] border-[0.5px] border-[#2E4A63] ${isRefunded ? 'opacity-90' : ''}`}
    >
      {/* Top Gradient Strip */}
      <div className="absolute top-0 left-0 right-0 h-2 bg-[#0F1C2E]" />

      {/* Left Section: Event Details */}
      <div className="flex-[1.5] bg-[#0F1C2E] p-6 md:p-10 flex flex-col justify-between relative">
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
            <div className="flex items-center gap-2 text-[#5A7A94] font-medium text-xs">
              <Calendar className="w-3.5 h-3.5" />
              {new Date(createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2 text-[#C9A84C] font-bold text-xs uppercase tracking-[0.2em]">
              <Ticket className="w-4 h-4" />
              Event Ticket
            </div>
            <h3 className="text-3xl md:text-4xl font-black text-[#EDF2F7] tracking-tight leading-tight">
              {event?.title || 'Unknown Event'}
            </h3>
          </div>

          <div className="flex flex-wrap gap-6 pt-2">
            <div className="flex items-center gap-3 text-[#B8C5D3] bg-[#1A2B3D] px-4 py-2 rounded-2xl border border-[#2E4A63]">
              <Calendar className="w-5 h-5 text-[#C9A84C]" />
              <div>
                <p className="text-[10px] text-[#5A7A94] font-bold uppercase tracking-wider leading-none mb-0.5">Date & Time</p>
                <p className="text-sm font-bold text-[#B8C5D3]">{new Date(event?.date).toLocaleDateString(undefined, { weekday: 'short', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-[#B8C5D3] bg-[#1A2B3D] px-4 py-2 rounded-2xl border border-[#2E4A63]">
              <MapPin className="w-5 h-5 text-[#C9A84C]" />
              <div>
                <p className="text-[10px] text-[#5A7A94] font-bold uppercase tracking-wider leading-none mb-0.5">Location</p>
                <p className="text-sm font-bold text-[#B8C5D3] truncate max-w-[150px]">{event?.location}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 flex items-center justify-between border-t border-dashed border-[rgba(201,168,76,0.25)] bg-[rgba(201,168,76,0.06)] p-6 rounded-2xl">
          <div className="space-y-4">
            <div>
              <p className="text-[10px] text-[#5A7A94] font-black uppercase tracking-[0.2em] leading-none mb-1.5">Booking ID</p>
              <p className="text-base font-black text-[#3D5A73] font-mono tracking-wider">{_id.substring(0, 10).toUpperCase()}</p>
            </div>
            <div className="flex gap-10">
              <div>
                <p className="text-[10px] text-[#5A7A94] font-black uppercase tracking-[0.2em] leading-none mb-1.5">Quantity</p>
                <p className="text-xl font-black text-[#B8C5D3]">{quantity || 0}x</p>
              </div>
              <div>
                <p className="text-[10px] text-[#5A7A94] font-black uppercase tracking-[0.2em] leading-none mb-1.5">Total Paid</p>
                <p className="text-xl font-black text-[#C9A84C]">${totalAmount?.toLocaleString() || '0.00'}</p>
              </div>
            </div>
          </div>

          <div className="hidden md:flex flex-col gap-3">
             <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleDownload}
                disabled={downloading || paymentStatus !== 'paid' || isRefunded}
                className="group relative px-6 py-3 bg-[#0F1C2E] border border-[#C9A84C] text-[#C9A84C] font-bold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-[#0F1C2E] transition-all disabled:opacity-50 disabled:grayscale disabled:cursor-not-allowed overflow-hidden hover:bg-[#C9A84C] hover:text-[#0F1C2E]"
            >
                {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                <span className="relative z-10">{isRefunded ? 'Ticket Invalid' : 'Download PDF'}</span>
            </motion.button>
            <button className="flex items-center justify-center gap-2 text-[#5A7A94] hover:text-[#C9A84C] font-bold text-xs transition-colors">
              <ExternalLink className="w-3.5 h-3.5" />
              View Event Page
            </button>
          </div>
        </div>
      </div>

      {/* Ticket Perforation Area */}
      <div className="relative flex flex-col md:flex-row items-center justify-center">
        {/* Horizontal line for mobile, vertical for desktop */}
        <div className="absolute inset-x-0 top-1/2 md:inset-y-0 md:left-1/2 md:top-0 border-t-[0.5px] md:border-l-[0.5px] border-dashed border-[#2E4A63] h-0 md:h-full w-full md:w-0" />
        
        {/* Perforation holes */}
        <div className="absolute -top-4 md:left-0 md:-translate-x-1/2 w-8 h-8 bg-transparent rounded-full shadow-inner border-[0.5px] border-[#2E4A63] z-10 hidden md:block" />
        <div className="absolute -bottom-4 md:left-0 md:-translate-x-1/2 w-8 h-8 bg-transparent rounded-full shadow-inner border-[0.5px] border-[#2E4A63] z-10 hidden md:block" />
        
        {/* Mobile perforation holes */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-8 h-8 bg-transparent rounded-full shadow-inner border-[0.5px] border-[#2E4A63] z-10 md:hidden" />
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-8 h-8 bg-transparent rounded-full shadow-inner border-[0.5px] border-[#2E4A63] z-10 md:hidden" />
      </div>

      {/* Right Section: QR Code & Mobile Actions */}
      <div className="w-full md:w-80 bg-[#162333] p-8 md:p-10 flex flex-col items-center justify-center space-y-6 relative overflow-hidden backdrop-blur-sm">
        <div className="relative group/qr">
          <div className="absolute -inset-4 bg-[rgba(201,168,76,0.1)] rounded-[2.5rem] blur-2xl opacity-0 group-hover/qr:opacity-100 transition-opacity duration-500" />
          <div className="relative p-5 bg-[#0F1C2E] rounded-[2rem] shadow-2xl border border-[#2E4A63] flex flex-col items-center gap-3">
              {isRefunded ? (
                  <div className="w-40 h-40 flex items-center justify-center bg-rose-500/10 rounded-2xl border-2 border-dashed border-rose-500/20">
                      <X className="w-16 h-16 text-rose-500" />
                  </div>
              ) : qrCode ? (
                  <div className="relative group/img bg-white rounded-xl p-2">
                    <img src={qrCode} alt="Ticket QR" className="w-36 h-36 object-contain transition-transform duration-500 group-hover/img:scale-105" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover/img:opacity-100 rounded-xl transition-opacity">
                        <Maximize2 className="text-white w-8 h-8" />
                    </div>
                  </div>
              ) : (
                  <div className="w-40 h-40 flex items-center justify-center bg-[#1A2B3D] rounded-2xl">
                    <QrCode className="w-16 h-16 text-[#5A7A94] animate-pulse" />
                  </div>
              )}
              <div className="text-[10px] font-bold text-[#5A7A94] uppercase tracking-[0.2em] text-center">
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
                className="w-full py-4 bg-[#0F1C2E] border border-[#C9A84C] text-[#C9A84C] font-bold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-[#0F1C2E] hover:bg-[#C9A84C] hover:text-[#0F1C2E]"
            >
                {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                {isRefunded ? 'Ticket Invalid' : 'Download PDF Ticket'}
            </motion.button>
            <button className="w-full py-4 bg-[#1A2B3D] border border-[#2E4A63] text-[#B8C5D3] font-bold text-sm rounded-2xl flex items-center justify-center gap-2 hover:border-[#C9A84C] hover:text-[#C9A84C]">
                <ExternalLink className="w-4 h-4" />
                Event Details
            </button>
        </div>

        <div className="text-center md:absolute md:bottom-8 w-full px-8">
            <p className="text-[9px] text-[#5A7A94] font-medium leading-relaxed">
              This is a digital pass. Please present this QR code at the event entrance for validation.
            </p>
        </div>
      </div>
    </motion.div>
  );
};

export default TicketCard;
