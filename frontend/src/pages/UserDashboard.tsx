import React, { useState, useEffect } from 'react';
import { Ticket, Calendar, Search, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';
import TicketCard from '../components/dashboard/TicketCard';

const UserDashboard: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTickets = async (showLoading = true) => {
    if (showLoading) setLoading(true);
    try {
      const { data } = await axios.get('/bookings/my-tickets');
      setBookings(data);
    } catch (error) {
      console.error('Failed to fetch tickets');
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // Polling for pending payments
  useEffect(() => {
    const hasPending = bookings.some((b: any) => b.paymentStatus === 'pending');
    
    if (hasPending) {
        const interval = setInterval(() => {
            console.log('Refreshing bookings to check for payment confirmation...');
            fetchTickets(false); // Fetch silently
        }, 3000);
        
        return () => clearInterval(interval);
    }
  }, [bookings]);

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Profile Header */}
        <div className="glass p-8 rounded-3xl mb-8 flex flex-col md:flex-row items-center gap-6 justify-between">
            <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-rose-500 flex items-center justify-center text-white text-3xl font-black shadow-lg">
                    {user?.name?.charAt(0)}
                </div>
                <div>
                    <h1 className="text-3xl font-black text-gray-900 leading-tight">Welcome back, {user?.name}!</h1>
                    <p className="text-gray-500 font-medium">Manage your tickets and explore upcoming events.</p>
                </div>
            </div>
            <div className="flex gap-4">
                <div className="text-center bg-white px-6 py-3 rounded-2xl shadow-sm border border-gray-100">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none mb-1">My Tickets</p>
                    <p className="text-xl font-black text-indigo-600">{bookings.length}</p>
                </div>
            </div>
        </div>

        {/* Tickets Section */}
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                    <Ticket className="text-indigo-600 w-6 h-6" />
                    My Purchased Tickets
                </h2>
                <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500 font-medium">
                    <Calendar className="w-4 h-4" />
                    Showing latest bookings
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-4">
                    <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                    <p className="text-gray-500 font-medium">Retrieving your tickets...</p>
                </div>
            ) : bookings.length === 0 ? (
                <div className="text-center py-24 glass rounded-3xl border-2 border-dashed border-gray-200">
                    <div className="bg-gray-100 inline-flex p-6 rounded-full mb-4">
                        <Search className="w-12 h-12 text-gray-300" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-800">No tickets found</h3>
                    <p className="text-gray-500 mb-6 font-medium">You haven't purchased any tickets yet.</p>
                    <button className="gradient-primary text-white px-8 py-3 rounded-xl font-bold hover:scale-105 transition-all">
                        Browse Events
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {bookings.map((booking: any) => (
                        <TicketCard key={booking._id} booking={booking} />
                    ))}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
