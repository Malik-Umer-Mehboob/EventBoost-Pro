import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import EventForm from '../components/events/EventForm';
import { createEvent } from '../api/eventApi';

const CreateEvent: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      await createEvent(data);
      toast.success('Event created successfully!', {
          description: 'Your event is now live and ready for bookings.',
      });
      navigate('/organizer/dashboard');
    } catch (error) {
      console.error('Failed to create event:', error);
      let errorMessage = 'Something went wrong';
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || errorMessage;
      }
      toast.error('Failed to create event', {
          description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-900 py-12 px-4 sm:px-6 lg:px-8 pt-32 text-navy-200">
      <div className="max-w-4xl mx-auto mb-10 flex items-center justify-between">
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
        >
            <button 
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-navy-500 hover:text-gold transition-colors font-black uppercase tracking-widest text-[10px]"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
            </button>
            <h1 className="text-5xl font-black text-navy-100 mt-3 flex items-center gap-4 tracking-tight">
                <Sparkles className="text-gold w-10 h-10" />
                Host New Event
            </h1>
        </motion.div>
      </div>

      <EventForm onSubmit={handleSubmit} isLoading={loading} />
    </div>
  );
};

export default CreateEvent;
