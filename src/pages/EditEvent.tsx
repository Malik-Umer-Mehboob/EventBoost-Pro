import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Edit3, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';
import EventForm from '../components/events/EventForm';
import { getEventById, updateEvent, EventData } from '../api/eventApi';
import { updateEventAdmin } from '../api/adminApi';
import { useAuth } from '../context/AuthContext';

const EditEvent: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [event, setEvent] = useState<EventData | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        if (id) {
          const data = await getEventById(id);
          setEvent(data);
        }
      } catch (error) {
        console.error('Failed to fetch event details:', error);
        toast.error('Failed to fetch event details');
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id, navigate]);

  const handleSubmit = async (data: FormData) => {
    setUpdating(true);
    try {
      if (id) {
        if (user?.role === 'admin') {
          await updateEventAdmin(id, data);
        } else {
          await updateEvent(id, data);
        }
        toast.success('Event updated successfully!', {
            description: 'Your changes have been saved.',
        });
        navigate(-1);
      }
    } catch (error) {
      console.error('Failed to update event:', error);
      let errorMessage = 'Something went wrong';
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || errorMessage;
      }
      toast.error('Failed to update event', {
          description: errorMessage,
      });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-900 flex flex-col items-center justify-center pt-24 gap-6">
        <Loader2 className="w-12 h-12 text-gold animate-spin" />
        <p className="text-navy-500 font-black text-[10px] uppercase tracking-[0.3em]">Retrieving Operational Data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-navy-900 py-12 px-4 sm:px-6 lg:px-8 pt-32 text-navy-200">
      <div className="max-w-4xl mx-auto mb-10">
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
        >
            <button 
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-navy-500 hover:text-gold transition-colors font-black uppercase tracking-widest text-[10px] mb-3"
            >
                <ArrowLeft className="w-4 h-4" />
                Back to Dashboard
            </button>
            <h1 className="text-5xl font-black text-navy-100 flex items-center gap-4 tracking-tight">
                <Edit3 className="text-gold w-10 h-10" />
                Edit Event
            </h1>
        </motion.div>
      </div>

      {event && (
        <EventForm 
          initialData={event} 
          onSubmit={handleSubmit} 
          isLoading={updating} 
        />
      )}
    </div>
  );
};

export default EditEvent;
