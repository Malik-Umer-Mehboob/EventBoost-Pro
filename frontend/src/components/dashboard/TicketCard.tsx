import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, QrCode, Download, ExternalLink, Loader2 } from 'lucide-react';
import axios from '../../api/axios';
import { toast } from 'sonner';

interface TicketCardProps {
  booking: any;
}

const TicketCard: React.FC<TicketCardProps> = ({ booking }) => {
  const [downloading, setDownloading] = React.useState(false);
  const { _id, event, quantity, totalAmount, paymentStatus, qrCode, createdAt } = booking;

  const handleDownload = async () => {
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
    } catch (error: any) {
       console.error('Download failed:', error);
       
       // Handle Blob error response
       if (error.response && error.response.data instanceof Blob) {
         const reader = new FileReader();
         reader.onload = () => {
           const errorMessage = JSON.parse(reader.result as string).message;
           toast.error(errorMessage || 'Failed to download tickets');
         };
         reader.readAsText(error.response.data);
       } else {
         toast.error(error.response?.data?.message || 'Failed to download tickets');
       }
    } finally {
      setDownloading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-xl border border-white/20"
    >
      {/* Left: Event Info */}
      <div className="flex-1 p-8 space-y-4">
        <div className="flex items-center justify-between">
            <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full border ${
                paymentStatus === 'paid' 
                ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                : 'bg-amber-50 text-amber-600 border-amber-100'
            }`}>
                {paymentStatus === 'paid' ? 'Confirmed Booking' : 'Pending Payment'}
            </span>
            <span className="text-gray-400 text-xs font-medium">
                Booked on {new Date(createdAt).toLocaleDateString()}
            </span>
        </div>
        
        <h3 className="text-2xl font-black text-gray-900 leading-tight">
          {event?.title || 'Unknown Event'}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="flex items-center gap-3 text-sm text-gray-600">
                <Calendar className="w-4 h-4 text-indigo-500" />
                <span>{new Date(event?.date).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-rose-500" />
                <span className="truncate">{event?.location}</span>
            </div>
        </div>

        <div className="pt-4 flex items-center justify-between border-t border-gray-100">
            <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mb-1">Booking ID</p>
                <p className="text-sm font-black text-gray-800">{_id.substring(0, 8).toUpperCase()}</p>
            </div>
            <div className="flex gap-8">
                <div className="text-right">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mb-1">Qty</p>
                    <p className="text-lg font-black text-gray-800">{quantity}</p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mb-1">Total Paid</p>
                    <p className="text-lg font-black text-indigo-600">${totalAmount}</p>
                </div>
            </div>
        </div>
      </div>

      {/* Right: QR Code (Visual "Stub") */}
      <div className="w-full md:w-64 bg-slate-50 border-l border-dashed border-gray-200 p-8 flex flex-col items-center justify-center space-y-4 relative overflow-hidden">
        {/* "Hole" punches for the stub effect */}
        <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full border border-gray-200" />
        <div className="absolute bottom-0 left-0 -translate-x-1/2 translate-y-1/2 w-6 h-6 bg-white rounded-full border border-gray-200" />

        <div className="p-3 bg-white rounded-2xl shadow-inner border border-gray-100">
            {qrCode ? (
                <img src={qrCode} alt="Ticket QR" className="w-32 h-32" />
            ) : (
                <QrCode className="w-32 h-32 text-gray-200" />
            )}
        </div>
        
        <div className="flex flex-col gap-2 w-full">
            <button 
                onClick={handleDownload}
                disabled={downloading || paymentStatus !== 'paid'}
                className="w-full py-2 px-4 glass text-indigo-600 font-bold text-xs rounded-xl flex items-center justify-center gap-2 hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {downloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                PDF Ticket
            </button>
            <button className="w-full py-2 px-4 text-gray-500 font-bold text-xs rounded-xl flex items-center justify-center gap-2 hover:text-indigo-600 transition-all">
                <ExternalLink className="w-4 h-4" />
                View Event
            </button>
        </div>
      </div>
    </motion.div>
  );
};

export default TicketCard;
