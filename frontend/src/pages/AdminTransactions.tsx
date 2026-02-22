import React, { useState, useEffect } from 'react';
import { Loader2, ShieldCheck, RefreshCw, AlertCircle, Search, Filter, Tag } from 'lucide-react';
import { getAllTransactions } from '../api/bookingApi';
import { format } from 'date-fns';

const AdminTransactions: React.FC = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchAllTransactionsData = async () => {
    setLoading(true);
    try {
      const data = await getAllTransactions();
      setTransactions(data);
      setFilteredTransactions(data);
      setError('');
    } catch (error) {
      console.error('Failed to fetch all transactions');
      setError('Failed to retrieve platform transaction logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllTransactionsData();
  }, []);

  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const filtered = transactions.filter((tx: any) => 
      tx.user?.name?.toLowerCase().includes(term) ||
      tx.user?.email?.toLowerCase().includes(term) ||
      tx.event?.title?.toLowerCase().includes(term) ||
      tx.stripePaymentIntentId?.toLowerCase().includes(term)
    );
    setFilteredTransactions(filtered);
  }, [searchTerm, transactions]);

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
      <div className="max-w-7xl mx-auto">
        <div className="glass p-8 rounded-3xl mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-600/10 rounded-2xl text-indigo-600">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-gray-900">Transaction Registry</h1>
                <p className="text-gray-500 font-medium">Monitor all financial movements across the platform.</p>
              </div>
            </div>
            
            <button 
              onClick={fetchAllTransactionsData}
              className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-2xl font-bold hover:scale-105 transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              Refresh Data
            </button>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="text" 
                placeholder="Search by user, email, event or ID..."
                className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-100 focus:border-indigo-500 outline-none transition-all font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-4">
              <button className="bg-white border-2 border-gray-100 px-6 py-4 rounded-2xl font-bold text-gray-600 flex items-center gap-2 hover:bg-gray-50">
                <Filter className="w-5 h-5" />
                Filters
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
              <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
              <p className="text-gray-500 font-medium">Synchronizing transaction logs...</p>
            </div>
          ) : error ? (
            <div className="py-20 text-center space-y-4">
                 <AlertCircle className="w-16 h-16 text-rose-500 mx-auto" />
                 <h2 className="text-2xl font-black text-gray-900">Security Access Issue</h2>
                 <p className="text-gray-500 max-w-md mx-auto">{error}</p>
                 <button onClick={fetchAllTransactionsData} className="gradient-primary text-white px-8 py-3 rounded-xl font-bold">Try Re-auth</button>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
                <p className="text-gray-400 font-bold text-xl uppercase tracking-widest">No matching transactions</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-8 px-8">
              <table className="w-full text-left border-separate border-spacing-y-4">
                <thead>
                  <tr className="text-[10px] text-gray-400 font-black uppercase tracking-widest leading-none">
                    <th className="px-6 pb-2">User Details</th>
                    <th className="px-6 pb-2">Event</th>
                    <th className="px-6 pb-2 text-right">Amount</th>
                    <th className="px-6 pb-2">Status</th>
                    <th className="px-6 pb-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((tx: any) => (
                    <tr key={tx._id} className="bg-white group hover:shadow-xl transition-all shadow-sm rounded-2xl ring-1 ring-gray-100">
                      <td className="px-6 py-4 rounded-l-2xl">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                {tx.user?.name?.charAt(0)}
                            </div>
                            <div>
                                <p className="font-black text-gray-900 leading-none mb-1">{tx.user?.name || 'Deleted User'}</p>
                                <p className="text-xs text-gray-400">{tx.user?.email}</p>
                            </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                            <Tag className="w-4 h-4 text-indigo-400" />
                            <p className="font-bold text-gray-700 whitespace-nowrap overflow-hidden max-w-[200px] text-ellipsis">
                                {tx.event?.title || 'Unknown Event'}
                            </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <p className={`font-black text-lg ${tx.type === 'refund' ? 'text-rose-600' : 'text-indigo-600'}`}>
                            {tx.type === 'refund' ? '-' : ''}${tx.amount}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className={`inline-flex px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(tx.status)}`}>
                            {tx.status}
                        </div>
                      </td>
                      <td className="px-6 py-4 rounded-r-2xl">
                        <p className="text-xs font-bold text-gray-500">{format(new Date(tx.createdAt), 'MMM dd, HH:mm')}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminTransactions;
