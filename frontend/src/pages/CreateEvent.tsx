import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
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
    } catch (error: any) {
      toast.error('Failed to create event', {
          description: error.response?.data?.message || 'Something went wrong',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 pt-24">
      <div className="max-w-4xl mx-auto mb-8 flex items-center justify-between">
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
        >
            <button 
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors font-medium"
            >
                <ArrowLeft className="w-5 h-5" />
                Back to Dashboard
            </button>
            <h1 className="text-4xl font-black text-gray-900 mt-2 flex items-center gap-3">
                <Sparkles className="text-indigo-600 w-8 h-8" />
                Host New Event
            </h1>
        </motion.div>
      </div>

      <EventForm onSubmit={handleSubmit} isLoading={loading} />
    </div>
  );
};

export default CreateEvent;
