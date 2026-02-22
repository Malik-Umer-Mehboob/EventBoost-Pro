import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import api from '../api/axios';
import { getAllEvents, deleteEvent, EventData } from '../api/eventApi';
import EventCard from '../components/EventCard';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const [orgName, setOrgName] = useState('');
  const [orgEmail, setOrgEmail] = useState('');
  const [orgPassword, setOrgPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [events, setEvents] = useState<EventData[]>([]);
  const navigate = useNavigate();

  const fetchEvents = async () => {
    try {
      const data = await getAllEvents();
      setEvents(data);
    } catch (error) {
      toast.error('Failed to fetch all events');
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCreateOrganizer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/create-organizer', {
        name: orgName,
        email: orgEmail,
        password: orgPassword,
      });
      toast.success('Organizer Created 🔥', {
        description: `${orgName} can now log in.`,
      });
      setOrgName('');
      setOrgEmail('');
      setOrgPassword('');
    } catch (error: any) {
      // Handled by global interceptor
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      await deleteEvent(id);
      toast.success('Event Deleted', {
        description: 'The event has been permanently removed from the system.',
      });
      fetchEvents();
    } catch (error) {
      // Handled by global interceptor
    }
  };

  const handleEditEvent = (event: EventData) => {
    navigate(`/edit-event/${event._id}`);
  };

  return (
      <div className="p-8 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Organizer Creation */}
            <div className="lg:col-span-1">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold mb-4 text-purple-600">Create Organizer</h2>
                    <form onSubmit={handleCreateOrganizer} className="space-y-4">
                        <div>
                            <input
                                type="text"
                                placeholder="Organizer Name"
                                value={orgName}
                                onChange={(e) => setOrgName(e.target.value)}
                                className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
                                required
                            />
                        </div>
                        <div>
                            <input
                                type="email"
                                placeholder="Email (@yahoo.com only)"
                                value={orgEmail}
                                onChange={(e) => setOrgEmail(e.target.value)}
                                className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500"
                                required
                            />
                        </div>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                value={orgPassword}
                                onChange={(e) => setOrgPassword(e.target.value)}
                                className="w-full p-2 border rounded-lg outline-none focus:ring-2 focus:ring-purple-500 pr-10"
                                required
                                minLength={8}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        <button type="submit" className="w-full bg-purple-600 text-white p-2 rounded-lg font-bold hover:bg-purple-700 transition">
                            Create Organizer
                        </button>
                    </form>
                </div>
            </div>

            {/* Global Events Management */}
            <div className="lg:col-span-2">
                <h2 className="text-2xl font-bold mb-6 text-gray-800">Global Events Management</h2>
                {events.length === 0 ? (
                    <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl p-12 text-center text-gray-400">
                        No events in the system yet.
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {events.map((event) => (
                            <EventCard
                                key={event._id}
                                event={event}
                                onDelete={handleDeleteEvent}
                                onEdit={handleEditEvent}
                                isAdmin={true}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
      </div>
  );
};

export default AdminDashboard;
