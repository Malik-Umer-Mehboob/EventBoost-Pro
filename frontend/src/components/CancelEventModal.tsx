import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Loader2, CheckCircle2 } from 'lucide-react';
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
    } catch (error: any) {
      console.error('Cancellation error:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel event');
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
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden border border-white/20"
          >
            {/* Header decor */}
            <div className="h-2 bg-rose-500 w-full" />
            
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div className="p-4 bg-rose-50 rounded-2xl">
                  <AlertTriangle className="w-8 h-8 text-rose-500" />
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  <X className="w-6 h-6 text-slate-400" />
                </button>
              </div>

              <div className="space-y-4">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  Cancel Event?
                </h2>
                <p className="text-slate-500 font-medium leading-relaxed">
                  Are you sure you want to cancel <span className="font-bold text-slate-900">"{event.title}"</span>? 
                  This action is permanent and will trigger:
                </p>

                <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-rose-500 mt-0.5" />
                    <p className="text-sm font-bold text-slate-700">Immediate full refunds to all attendees via Stripe.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-rose-500 mt-0.5" />
                    <p className="text-sm font-bold text-slate-700">Automatic cancellation emails and app notifications.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-rose-500 mt-0.5" />
                    <p className="text-sm font-bold text-slate-700">The event will be marked as "Cancelled" across the platform.</p>
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
                  className="flex-1 bg-white text-slate-600 py-4 rounded-2xl font-bold border border-slate-200 hover:bg-slate-50 transition-all active:scale-95 disabled:opacity-50 shadow-sm"
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
