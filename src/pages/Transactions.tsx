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
      case 'succeeded': return 'bg-emerald-950/30 text-emerald-400 border-emerald-900/50';
      case 'refunded': return 'bg-amber-950/30 text-amber-400 border-amber-900/50';
      case 'failed': return 'bg-rose-950/30 text-rose-400 border-rose-900/50';
      default: return 'bg-navy-800 text-navy-400 border-navy-600';
    }
  };

  return (
    <div className="min-h-screen bg-navy-900 pt-24 pb-12 px-4 sm:px-6 lg:px-8 text-navy-200">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link to="/user/dashboard" className="flex items-center gap-2 text-navy-400 hover:text-gold transition-colors font-black uppercase text-xs tracking-widest">
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </Link>
          <button 
            onClick={fetchTransactions}
            className="p-2 hover:bg-navy-800 rounded-full transition-colors group"
            title="Refresh"
          >
            <RefreshCw className={`w-5 h-5 text-navy-500 group-hover:text-gold ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="bg-navy-800/50 backdrop-blur-md p-8 sm:p-12 rounded-[40px] mb-8 border border-navy-600 shadow-2xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
            <div className="flex items-center gap-5">
              <div className="p-4 bg-navy-950 rounded-2xl text-gold border border-navy-700 shadow-xl">
                <Receipt className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center gap-2 text-gold mb-1">
                  <CreditCard className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em]">Ledger Registry</span>
                </div>
                <h1 className="text-4xl font-black text-navy-100 tracking-tight">Payment History</h1>
                <p className="text-navy-400 mt-1 font-medium">Archived logs of your secure transactional activity.</p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-6">
              <Loader2 className="w-12 h-12 text-gold animate-spin" />
              <p className="text-navy-500 font-black tracking-[0.4em] uppercase text-[10px]">Retrieving Secure Logs...</p>
            </div>
          ) : error ? (
            <div className="bg-rose-950/20 border border-rose-900/30 p-10 rounded-3xl text-center space-y-6">
              <div className="w-20 h-20 bg-rose-950/40 rounded-full flex items-center justify-center mx-auto border border-rose-900/50">
                <AlertCircle className="w-10 h-10 text-rose-500" />
              </div>
              <p className="text-rose-400 font-bold tracking-tight text-lg">{error}</p>
              <button 
                onClick={fetchTransactions} 
                className="bg-rose-500 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-rose-600 transition-all shadow-xl shadow-rose-500/20"
              >
                Retry Protocol
              </button>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-24 bg-navy-950/50 rounded-[2.5rem] border border-dashed border-navy-700">
              <div className="bg-navy-900 inline-flex p-8 rounded-[2rem] mb-6 border border-navy-700 shadow-inner">
                <CreditCard className="w-12 h-12 text-navy-700" />
              </div>
              <p className="text-navy-500 font-black uppercase tracking-widest text-[10px]">No historical data found</p>
            </div>
          ) : (
            <div className="space-y-5">
              {transactions.map((tx) => (
                <div key={tx._id} className="bg-navy-950/50 p-6 rounded-[2rem] border border-navy-700/50 hover:bg-white/[0.02] hover:border-navy-600 transition-all group flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-5">
                    <div className="w-14 h-14 rounded-2xl bg-navy-950 border border-navy-700 flex items-center justify-center text-navy-400 shadow-xl group-hover:text-gold group-hover:border-gold/20 transition-all">
                      <Receipt className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="font-black text-navy-100 tracking-tight text-lg group-hover:text-gold transition-colors">{tx.event?.title || 'System Transaction'}</h3>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${tx.type === 'refund' ? 'bg-rose-950 text-rose-400' : 'bg-navy-900 text-gold border border-gold/10'}`}>
                          {tx.type === 'payment' ? 'Purchase' : 'Refund'}
                        </span>
                        <span className="text-[10px] text-navy-500 font-bold uppercase tracking-widest">
                          {format(new Date(tx.createdAt), 'MMM dd, yyyy • HH:mm')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-8 justify-between md:justify-end border-t border-navy-700/50 pt-4 md:border-none md:pt-0">
                    <div className="text-right">
                      <p className={`text-2xl font-black tracking-tighter ${tx.type === 'refund' ? 'text-rose-500' : 'text-navy-100'}`}>
                        {tx.type === 'refund' ? '-' : ''}${tx.amount.toLocaleString()}
                      </p>
                      <p className="text-[10px] text-navy-600 font-black uppercase tracking-widest leading-none mt-1">{tx.currency}</p>
                    </div>
                    <div className="flex flex-col items-end gap-3">
                      <div className={`px-4 py-1.5 rounded-[5px] text-[10px] font-black uppercase tracking-widest border ${getStatusColor(tx.status)}`}>
                        {tx.status}
                      </div>
                      {tx.type === 'payment' && tx.status === 'succeeded' && (
                        <button 
                          onClick={() => handleRefund(typeof tx.booking === 'string' ? tx.booking : tx.booking._id)}
                          className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-400/60 hover:text-rose-400 underline underline-offset-4 decoration-rose-500/10 transition-all"
                        >
                          Request Refund
                        </button>
                      )}
                    </div>
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
