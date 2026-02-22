import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Edit3, ArrowLeft, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import EventForm from '../components/events/EventForm';
import { getEventById, updateEvent, EventData } from '../api/eventApi';

const EditEvent: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
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
        await updateEvent(id, data);
        toast.success('Event updated successfully!', {
            description: 'Your changes have been saved.',
        });
        navigate(-1);
      }
    } catch (error: any) {
      toast.error('Failed to update event', {
          description: error.response?.data?.message || 'Something went wrong',
      });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center pt-24">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 pt-24">
      <div className="max-w-4xl mx-auto mb-8">
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
        >
            <button 
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors font-medium mb-2"
            >
                <ArrowLeft className="w-5 h-5" />
                Back
            </button>
            <h1 className="text-4xl font-black text-gray-900 flex items-center gap-3">
                <Edit3 className="text-indigo-600 w-8 h-8" />
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
