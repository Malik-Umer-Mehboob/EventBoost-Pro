import React, { useState, useEffect } from 'react';
import { CreditCard, ArrowLeft, Loader2, Receipt, AlertCircle, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getMyTransactions, requestRefund } from '../api/bookingApi';
import { format } from 'date-fns';
import axios from 'axios';
import { toast } from 'sonner';
import { Transaction } from '../types';

const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const data = await getMyTransactions();
      setTransactions(data);
      setError('');
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      setError('Could not load transaction history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleRefund = async (bookingId: string) => {
    if (!window.confirm('Are you sure you want to request a refund for this ticket?')) return;

    try {
      await requestRefund(bookingId);
      toast.success('Refund Request Sent', {
        description: 'Stripe is processing your refund. It may take a few minutes to reflect.'
      });
      fetchTransactions();
    } catch (error) {
      console.error('Refund error:', error);
      let errorMessage = 'Could not initiate refund at this time.';
      if (axios.isAxiosError(error)) {
        errorMessage = error.response?.data?.message || errorMessage;
      }
      toast.error('Refund Failed', {
        description: errorMessage
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'succeeded': return 'bg-emerald-900/30 text-emerald-400 border-emerald-700/40';
      case 'refunded': return 'bg-amber-900/30 text-amber-400 border-amber-700/40';
      case 'failed': return 'bg-rose-900/30 text-rose-400 border-rose-700/40';
      default: return 'bg-[#1A2B3D] text-[#7A94AA] border-[#2E4A63]';
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1C2E] pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link to="/user/dashboard" className="flex items-center gap-2 text-[#7A94AA] hover:text-[#C9A84C] transition-colors font-bold">
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </Link>
          <button
            onClick={fetchTransactions}
            className="p-2 hover:bg-[#162333] rounded-full transition-colors group border border-[#2E4A63]"
            title="Refresh"
          >
            <RefreshCw className={`w-5 h-5 text-[#5A7A94] group-hover:text-[#C9A84C] ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="bg-[#162333] p-8 sm:p-10 rounded-[32px] mb-8 border border-[#2E4A63] shadow-[0_8px_30px_rgb(0,0,0,0.3)]">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-[#C9A84C]/10 rounded-2xl text-[#C9A84C] border border-[#C9A84C]/20">
              <Receipt className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-[#EDF2F7]">Payment History</h1>
              <p className="text-[#7A94AA] font-medium">View and manage your recent transactions.</p>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-10 h-10 text-[#C9A84C] animate-spin" />
              <p className="text-[#7A94AA] font-medium">Loading history...</p>
            </div>
          ) : error ? (
            <div className="bg-rose-900/20 border border-rose-700/40 p-8 rounded-2xl text-center space-y-4">
              <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
              <p className="text-rose-400 font-bold">{error}</p>
              <button onClick={fetchTransactions} className="bg-rose-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-rose-700">Retry</button>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-20 bg-[#1A2B3D] rounded-3xl border border-[#2E4A63]">
              <div className="bg-[#0F1C2E] inline-flex p-6 rounded-full mb-4">
                <CreditCard className="w-10 h-10 text-[#3D5A73]" />
              </div>
              <p className="text-[#7A94AA] font-medium">No transactions yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((tx) => (
                <div key={tx._id} className="bg-[#1A2B3D] p-6 rounded-2xl border border-[#2E4A63] hover:border-[#C9A84C]/30 hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-[#0F1C2E] flex items-center justify-center text-[#5A7A94] border border-[#2E4A63]">
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-black text-[#EDF2F7]">{tx.event?.title || 'Unknown Event'}</h3>
                      <p className="text-sm text-[#5A7A94] font-bold uppercase tracking-wider">
                        {tx.type === 'payment' ? 'Purchase' : 'Refund'} • {format(new Date(tx.createdAt), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 justify-between md:justify-end">
                    <div className="text-right">
                      <p className={`text-xl font-black ${tx.type === 'refund' ? 'text-rose-400' : 'text-[#EDF2F7]'}`}>
                        {tx.type === 'refund' ? '-' : ''}${tx.amount}
                      </p>
                      <p className="text-[10px] text-[#5A7A94] font-bold uppercase tracking-widest">{tx.currency}</p>
                    </div>
                    <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border ${getStatusColor(tx.status)}`}>
                      {tx.status}
                    </div>
                    {tx.type === 'payment' && tx.status === 'succeeded' && (
                      <button
                        onClick={() => handleRefund(typeof tx.booking === 'string' ? tx.booking : tx.booking._id)}
                        className="text-[10px] font-black uppercase tracking-tighter text-rose-400 hover:text-rose-300 underline underline-offset-4 decoration-rose-700/40 transition-colors"
                      >
                        Request Refund
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Transactions;
