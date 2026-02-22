import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Megaphone, X, Loader2 } from 'lucide-react';
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
      toast.error('Failed to send announcement');
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
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg glass rounded-3xl shadow-2xl overflow-hidden border border-white/20"
          >
            <div className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-purple-100 text-purple-600 rounded-2xl shadow-inner">
                    <Megaphone className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-gray-900 leading-tight">Send Announcement</h2>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">To all attendees of: {eventTitle}</p>
                  </div>
                </div>
                <button 
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100/50 rounded-full transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-900 uppercase tracking-widest ml-1">
                    Announcement Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-5 py-3 rounded-2xl bg-white/50 border border-white/30 focus:border-purple-300 focus:ring-4 focus:ring-purple-100 outline-none transition-all font-medium text-gray-800"
                    placeholder="e.g. Schedule Change, Important Update"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-900 uppercase tracking-widest ml-1">
                    Your Message
                  </label>
                  <textarea
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-5 py-3 rounded-2xl bg-white/50 border border-white/30 focus:border-purple-300 focus:ring-4 focus:ring-purple-100 outline-none transition-all font-medium text-gray-800 resize-none"
                    placeholder="Provide details for your attendees..."
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSending}
                    className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black shadow-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3"
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
            
            <div className="p-4 bg-purple-50/50 text-center border-t border-purple-100">
               <p className="text-[10px] font-bold text-purple-700 uppercase tracking-widest">
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
