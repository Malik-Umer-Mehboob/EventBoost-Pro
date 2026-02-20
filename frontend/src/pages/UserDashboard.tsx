import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { getPublicEvents, registerForEvent, EventData } from '../api/eventApi';
import EventCard from '../components/EventCard';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const UserDashboard = () => {
  const [events, setEvents] = useState<EventData[]>([]);
  const { user } = useAuth();

  const fetchEvents = async () => {
    try {
      const data = await getPublicEvents();
      setEvents(data);
    } catch (error) {
       // Handled by global interceptor
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleRegister = async (id: string) => {
    try {
      await registerForEvent(id);
      toast.success('Registration Successful! 🔥', {
          description: 'You are now on the attendee list.',
      });
      fetchEvents();
    } catch (error: any) {
      // Handled by global interceptor
    }
  };

  return (
    <>
      <Navbar />
      <div className="p-8 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-10">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Discover Events</h1>
                <p className="text-gray-500 mt-2">Find and register for upcoming events around you.</p>
            </div>
            <div className="bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
                <span className="text-blue-700 font-medium">Hello, {user?.name}!</span>
            </div>
        </div>

        {events.length === 0 ? (
          <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-20 text-center">
            <p className="text-gray-400 text-lg">No public events available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                onRegister={handleRegister}
                isRegistered={event.attendees?.includes(user?._id || '')}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default UserDashboard;
