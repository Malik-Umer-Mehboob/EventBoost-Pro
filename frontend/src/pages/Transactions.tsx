import React, { useState, useEffect } from 'react';
import { CreditCard, ArrowLeft, Loader2, Receipt, AlertCircle, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getMyTransactions, requestRefund } from '../api/bookingApi';
import { format } from 'date-fns';
import { toast } from 'sonner';

const Transactions: React.FC = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const data = await getMyTransactions();
      setTransactions(data);
      setError('');
    } catch (error) {
      console.error('Failed to fetch transactions');
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
    } catch (error: any) {
      toast.error('Refund Failed', {
        description: error.response?.data?.message || 'Could not initiate refund at this time.'
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'succeeded': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'refunded': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'failed': return 'bg-rose-100 text-rose-700 border-rose-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link to="/user/dashboard" className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 transition-colors font-bold">
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </Link>
          <button 
            onClick={fetchTransactions}
            className="p-2 hover:bg-white rounded-full transition-colors group"
            title="Refresh"
          >
            <RefreshCw className={`w-5 h-5 text-gray-400 group-hover:text-indigo-600 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="glass p-8 rounded-3xl mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-indigo-600/10 rounded-2xl text-indigo-600">
              <Receipt className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900">Payment History</h1>
              <p className="text-gray-500 font-medium">View and manage your recent transactions.</p>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
              <p className="text-gray-500 font-medium">Loading history...</p>
            </div>
          ) : error ? (
            <div className="bg-rose-50 border border-rose-100 p-8 rounded-2xl text-center space-y-4">
              <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
              <p className="text-rose-600 font-bold">{error}</p>
              <button onClick={fetchTransactions} className="bg-rose-600 text-white px-6 py-2 rounded-xl font-bold">Retry</button>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-sm">
              <div className="bg-gray-100 inline-flex p-6 rounded-full mb-4">
                <CreditCard className="w-10 h-10 text-gray-300" />
              </div>
              <p className="text-gray-500 font-medium">No transactions yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((tx: any) => (
                <div key={tx._id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-black text-gray-900">{tx.event?.title || 'Unknown Event'}</h3>
                      <p className="text-sm text-gray-400 font-bold uppercase tracking-wider">
                        {tx.type === 'payment' ? 'Purchase' : 'Refund'} • {format(new Date(tx.createdAt), 'MMM dd, yyyy HH:mm')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6 justify-between md:justify-end">
                    <div className="text-right">
                      <p className={`text-xl font-black ${tx.type === 'refund' ? 'text-rose-600' : 'text-gray-900'}`}>
                        {tx.type === 'refund' ? '-' : ''}${tx.amount}
                      </p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{tx.currency}</p>
                    </div>
                    <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border ${getStatusColor(tx.status)}`}>
                      {tx.status}
                    </div>
                    {tx.type === 'payment' && tx.status === 'succeeded' && (
                      <button 
                        onClick={() => handleRefund(tx.booking)}
                        className="text-[10px] font-black uppercase tracking-tighter text-rose-500 hover:text-rose-700 underline underline-offset-4 decoration-rose-200 transition-colors"
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
