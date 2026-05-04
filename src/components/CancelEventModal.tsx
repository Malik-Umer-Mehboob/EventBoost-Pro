import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Loader2, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import { cancelEvent } from '../api/eventApi';
import { toast } from 'sonner';

interface CancelEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  event: {
    _id: string;
    title: string;
  };
}

const CancelEventModal: React.FC<CancelEventModalProps> = ({ isOpen, onClose, onSuccess, event }) => {
  const [loading, setLoading] = useState(false);

  const handleCancel = async () => {
    setLoading(true);
    try {
      await cancelEvent(event._id);
      toast.success('Event cancelled successfully');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Cancellation error:', error);
      let errorMessage = 'Failed to cancel event';
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || errorMessage;
      }
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-[rgba(0,0,0,0.7)] backdrop-blur-md z-[100] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#1A2B3D] rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden border border-[#2E4A63]"
          >
            {/* Header decor */}
            <div className="border-b-[0.5px] border-[#2E4A63] w-full" />
            
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div className="p-4 bg-rose-500/10 rounded-2xl border border-rose-500/20">
                  <AlertTriangle className="w-8 h-8 text-rose-500" />
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-[#2E4A63] rounded-xl transition-colors group"
                >
                  <X className="w-6 h-6 text-[#5A7A94] group-hover:text-[#EDF2F7]" />
                </button>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-black text-[#EDF2F7] tracking-tight">
                  Cancel Event?
                </h2>
                <p className="text-[#B8C5D3] font-medium leading-relaxed">
                  Are you sure you want to cancel <span className="font-bold text-[#EDF2F7]">"{event.title}"</span>? 
                  This action is permanent and will trigger:
                </p>

                <div className="space-y-3 bg-[#0F1C2E] p-5 rounded-2xl border border-[#2E4A63]">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-rose-500 mt-0.5" />
                    <p className="text-sm font-bold text-[#B8C5D3]">Immediate full refunds to all attendees via Stripe.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-rose-500 mt-0.5" />
                    <p className="text-sm font-bold text-[#B8C5D3]">Automatic cancellation emails and app notifications.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-rose-500 mt-0.5" />
                    <p className="text-sm font-bold text-[#B8C5D3]">The event will be marked as "Cancelled" across the platform.</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-8">
                <button
                  onClick={handleCancel}
                  disabled={loading}
                  className="flex-1 bg-rose-500 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-rose-600 transition-all shadow-lg shadow-rose-100 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Confirm Cancellation'
                  )}
                </button>
                <button
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 bg-[#1A2B3D] text-[#B8C5D3] py-4 rounded-2xl font-bold border border-[#2E4A63] hover:border-[#C9A84C] hover:text-[#C9A84C] transition-all active:scale-95 disabled:opacity-50 shadow-sm"
                >
                  Keep Event
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CancelEventModal;
