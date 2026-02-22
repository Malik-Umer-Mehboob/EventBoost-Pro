import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Loader2, LogIn, ShieldAlert, UserCheck } from 'lucide-react';
import axios from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';



interface CheckoutButtonProps {
  eventId: string;
  quantity: number;
  price: number;
  isOwner?: boolean;
  isAdmin?: boolean;
}

const CheckoutButton: React.FC<CheckoutButtonProps> = ({ eventId, quantity, price, isOwner, isAdmin }) => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = async () => {
    if (!user) {
      toast.error('Please login to purchase tickets');
      navigate('/login');
      return;
    }
    
    setLoading(true);
    try {
      const { data } = await axios.post(`/bookings/checkout/${eventId}`, { quantity });
      
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Checkout failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: isOwner || isAdmin ? 1 : 1.02 }}
      whileTap={{ scale: isOwner || isAdmin ? 1 : 0.98 }}
      onClick={handleCheckout}
      disabled={loading || isOwner || isAdmin}
      className={`w-full mt-6 py-4 px-8 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all ${
        isOwner || isAdmin 
          ? 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed shadow-none' 
          : 'gradient-primary text-white shadow-xl shadow-indigo-100 hover:shadow-indigo-200'
      } disabled:opacity-70`}
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : isOwner ? (
        <>
          <UserCheck className="w-5 h-5" />
          You are the Organizer
        </>
      ) : isAdmin ? (
        <>
          <ShieldAlert className="w-5 h-5" />
          Admins Cannot Purchase
        </>
      ) : !user ? (
        <>
          <LogIn className="w-5 h-5" />
          Login to Purchase
        </>
      ) : (
        <>
          <CreditCard className="w-5 h-5" />
          Pay ${price * quantity} Securely
        </>
      )}
    </motion.button>
  );
};

export default CheckoutButton;
