import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Megaphone, X, Loader2 } from 'lucide-react';
import axios from 'axios';
import api from '../api/axios';
import { toast } from 'sonner';

interface AnnouncementModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  eventTitle: string;
}

const AnnouncementModal: React.FC<AnnouncementModalProps> = ({
  isOpen,
  onClose,
  eventId,
  eventTitle
}) => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSending(true);
    try {
      await api.post(`/organizers/events/${eventId}/announce`, { title, message });
      toast.success('Announcement sent successfully!');
      setTitle('');
      setMessage('');
      onClose();
    } catch (error) {
      console.error('Failed to send announcement:', error);
      let errorMessage = 'Failed to send announcement. Please check your connection.';

      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || errorMessage;
      }

      toast.error(errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-[rgba(0,0,0,0.7)] backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-[#1A2B3D] rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.5)] overflow-hidden border border-[#2E4A63]"
          >
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-[#C9A84C]/10 text-[#C9A84C] rounded-2xl border border-[#C9A84C]/20">
                    <Megaphone className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-[#EDF2F7] leading-tight">Send Announcement</h2>
                    <p className="text-xs text-[#5A7A94] font-bold uppercase tracking-widest mt-1">To all attendees of: {eventTitle}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-[#5A7A94] hover:text-[#EDF2F7] hover:bg-[#0F1C2E] rounded-full transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-[#B8C5D3] uppercase tracking-widest ml-1">
                    Announcement Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-5 py-3 rounded-2xl bg-[#0F1C2E] border border-[#2E4A63] focus:border-[#C9A84C] outline-none transition-all font-medium text-[#EDF2F7] placeholder-[#3D5A73]"
                    placeholder="e.g. Schedule Change, Important Update"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-[#B8C5D3] uppercase tracking-widest ml-1">
                    Your Message
                  </label>
                  <textarea
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-5 py-3 rounded-2xl bg-[#0F1C2E] border border-[#2E4A63] focus:border-[#C9A84C] outline-none transition-all font-medium text-[#EDF2F7] placeholder-[#3D5A73] resize-none"
                    placeholder="Provide details for your attendees..."
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSending}
                    className="w-full py-4 bg-[#C9A84C] text-[#0F1C2E] rounded-2xl font-black shadow-xl hover:bg-[#b8963e] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3"
                  >
                    {isSending ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        SENDING...
                      </>
                    ) : (
                      <>
                        <Megaphone className="w-5 h-5" />
                        SEND ANNOUNCEMENT
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            <div className="p-4 bg-[#C9A84C]/5 text-center border-t border-[#C9A84C]/20">
               <p className="text-[10px] font-bold text-[#C9A84C] uppercase tracking-widest">
                 Email & in-app notifications will be sent instantly
               </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AnnouncementModal;
