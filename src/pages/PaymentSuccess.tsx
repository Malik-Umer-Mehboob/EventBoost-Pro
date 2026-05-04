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
    <div className="min-h-screen bg-[#0F1C2E] flex items-center justify-center pt-24 pb-12 px-4">
      <div className="max-w-md w-full">
        {loading ? (
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 text-[#C9A84C] animate-spin mx-auto" />
            <p className="text-[#5A7A94] font-bold uppercase text-xs tracking-widest">Processing Payment...</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#162333] p-8 sm:p-10 rounded-[32px] text-center shadow-[0_8px_30px_rgb(0,0,0,0.3)] border border-[#2E4A63]"
          >
            <div className="bg-emerald-900/20 border border-emerald-700/30 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-emerald-400" />
            </div>

            <h1 className="text-3xl font-black text-[#EDF2F7] mb-2">Payment Successful!</h1>
            <p className="text-[#7A94AA] font-medium mb-8">
              Your transaction was completed successfully. Your electronic ticket has been sent to your email.
            </p>

            <div className="space-y-3">
              <Link
                to="/user/dashboard"
                className="w-full bg-[#C9A84C] text-[#0F1C2E] py-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl hover:bg-[#b8963e] hover:scale-105 transition-all"
              >
                <Ticket className="w-5 h-5" />
                View My Tickets
              </Link>

              <Link
                to="/events"
                className="w-full bg-[#1A2B3D] text-[#B8C5D3] py-4 rounded-2xl font-bold flex items-center justify-center gap-3 border border-[#2E4A63] hover:border-[#C9A84C]/40 hover:text-[#C9A84C] transition-all"
              >
                Browse More Events
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>

            {sessionId && (
              <p className="mt-8 text-[10px] text-[#3D5A73] font-mono uppercase tracking-widest">
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
