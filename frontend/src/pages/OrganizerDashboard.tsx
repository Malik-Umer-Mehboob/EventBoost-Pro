import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { createEvent, getMyEvents, deleteEvent, updateEvent, EventData } from '../api/eventApi';
import EventCard from '../components/EventCard';
import { toast } from 'sonner';

const OrganizerDashboard = () => {
  const [events, setEvents] = useState<EventData[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [editingEvent, setEditingEvent] = useState<EventData | null>(null);

  const fetchEvents = async () => {
    try {
      const data = await getMyEvents();
      setEvents(data);
    } catch (error) {
      // Handled by global interceptor
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingEvent) {
        await updateEvent(editingEvent._id!, { title, description, date, location });
        toast.success('Event Updated ✅');
      } else {
        await createEvent({ title, description, date, location });
        toast.success('Event Created 🚀');
      }
      resetForm();
      fetchEvents();
    } catch (error: any) {
      // Handled by global interceptor
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await deleteEvent(id);
        toast.success('Event Deleted');
        fetchEvents();
      } catch (error) {
        // Handled by global interceptor
      }
    }
  };

  const handleEdit = (event: EventData) => {
    setEditingEvent(event);
    setTitle(event.title);
    setDescription(event.description);
    setDate(new Date(event.date).toISOString().split('T')[0]);
    setLocation(event.location);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditingEvent(null);
    setTitle('');
    setDescription('');
    setDate('');
    setLocation('');
  };

  return (
    <>
      <Navbar />
      <div className="p-8 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Organizer Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Create/Edit Form */}
          <div className="md:col-span-1">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-8">
              <h2 className="text-xl font-bold mb-4">
                {editingEvent ? 'Edit Event' : 'Create New Event'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    placeholder="Event Title"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none min-h-[100px]"
                    placeholder="Describe your event..."
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    placeholder="Address or Venue"
                    required
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 bg-purple-600 text-white p-2 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
                  >
                    {editingEvent ? 'Update Event' : 'Create Event'}
                  </button>
                  {editingEvent && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="bg-gray-200 text-gray-700 p-2 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          {/* My Events List */}
          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold mb-6">My Events</h2>
            {events.length === 0 ? (
              <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-12 text-center">
                <p className="text-gray-500">You haven't created any events yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {events.map((event) => (
                  <EventCard
                    key={event._id}
                    event={event}
                    onDelete={handleDelete}
                    onEdit={handleEdit}
                    isOwner={true}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default OrganizerDashboard;
