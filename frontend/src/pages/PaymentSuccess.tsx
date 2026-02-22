import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, Ticket, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const PaymentSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // We could verify the session here if needed, but the webhook usually handles it
    const timer = setTimeout(() => {
      setLoading(false);
      toast.success('Payment confirmed! Your tickets are being prepared.');
    }, 2000);
    
    return () => clearTimeout(timer);
  }, [sessionId]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center pt-24 pb-12 px-4">
      <div className="max-w-md w-full">
        {loading ? (
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mx-auto" />
            <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">Processing Payment...</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass p-8 rounded-3xl text-center shadow-2xl border border-white/20"
          >
            <div className="bg-emerald-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-emerald-600" />
            </div>
            
            <h1 className="text-3xl font-black text-gray-900 mb-2">Payment Successful!</h1>
            <p className="text-gray-500 font-medium mb-8">
              Your transaction was completed successfully. Your electronic ticket has been sent to your email.
            </p>

            <div className="space-y-3">
              <Link 
                to="/user/dashboard"
                className="w-full gradient-primary text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl shadow-indigo-100 hover:scale-105 transition-all"
              >
                <Ticket className="w-5 h-5" />
                View My Tickets
              </Link>
              
              <Link 
                to="/events"
                className="w-full bg-white text-gray-700 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 border border-gray-100 hover:bg-gray-50 transition-all"
              >
                Browse More Events
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            {sessionId && (
              <p className="mt-8 text-[10px] text-gray-400 font-mono uppercase tracking-widest">
                Session ID: {sessionId}
              </p>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;
