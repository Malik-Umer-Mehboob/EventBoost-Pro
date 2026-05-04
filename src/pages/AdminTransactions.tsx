import React, { useState, useEffect } from 'react';
import { Loader2, ShieldCheck, RefreshCw, AlertCircle, Search, Filter, Tag } from 'lucide-react';
import { getAllTransactions } from '../api/bookingApi';
import { format } from 'date-fns';
import { Transaction, User } from '../types';

const AdminTransactions: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
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
      console.error('Failed to fetch all transactions:', error);
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
    const filtered = transactions.filter((tx: Transaction) => {
      const user = tx.user as User;
      return (
        user?.name?.toLowerCase().includes(term) ||
        user?.email?.toLowerCase().includes(term) ||
        tx.event?.title?.toLowerCase().includes(term) ||
        tx.stripePaymentIntentId?.toLowerCase().includes(term)
      );
    });
    setFilteredTransactions(filtered);
  }, [searchTerm, transactions]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'succeeded': return 'bg-[#1D9E75]/12 text-[#1D9E75] border-[#1D9E75]/20';
      case 'refunded': return 'bg-[#378ADD]/12 text-[#378ADD] border-[#378ADD]/20';
      case 'failed': return 'bg-[#E24B4A]/12 text-[#E24B4A] border-[#E24B4A]/20';
      default: return 'bg-navy-700 text-navy-400 border-navy-600';
    }
  };

  return (
    <div className="min-h-screen bg-navy-900 pt-24 pb-12 px-4 sm:px-6 lg:px-8 text-navy-200">
      <div className="max-w-7xl mx-auto">
        <div className="bg-navy-800/50 p-8 sm:p-10 rounded-[40px] mb-8 border border-navy-600 shadow-2xl shadow-black/40">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div className="flex items-center gap-6">
              <div className="p-4 bg-navy-950 rounded-[24px] text-gold border border-navy-700 shadow-xl">
                <ShieldCheck className="w-10 h-10" />
              </div>
              <div>
                <h1 className="text-4xl font-black text-navy-100 tracking-tight">Transaction Registry</h1>
                <p className="text-navy-400 font-medium">Monitor financial health across the platform ecosystem.</p>
              </div>
            </div>
            
            <button 
              onClick={fetchAllTransactionsData}
              className="flex items-center gap-2 bg-gold text-navy-900 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#b8963e] transition-all shadow-xl shadow-gold/10 active:scale-95"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              Sync Ledger
            </button>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col md:flex-row gap-4 mb-10">
            <div className="relative flex-1 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-navy-500 group-focus-within:text-gold transition-colors w-5 h-5" />
              <input 
                type="text" 
                placeholder="Search ledger by user, event, or intent ID..."
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-navy-950 border border-navy-700 focus:border-gold/30 outline-none transition-all font-bold text-navy-100 placeholder-navy-500 shadow-inner"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-4">
              <button className="bg-navy-900 border border-navy-700 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest text-navy-400 flex items-center gap-2 hover:bg-white/5 shadow-sm transition-all">
                <Filter className="w-4 h-4 text-gold" />
                Advanced Filters
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-6 text-center">
              <Loader2 className="w-12 h-12 text-gold animate-spin" />
              <p className="text-navy-500 font-black text-[10px] uppercase tracking-widest">Processing cryptographic logs...</p>
            </div>
          ) : error ? (
            <div className="py-20 text-center space-y-6">
                 <AlertCircle className="w-20 h-20 text-rose-500 mx-auto opacity-50" />
                 <h2 className="text-3xl font-black text-navy-100 tracking-tight">Security Protocol Violation</h2>
                 <p className="text-navy-400 max-w-md mx-auto font-medium">{error}</p>
                 <button onClick={fetchAllTransactionsData} className="bg-gold text-navy-900 px-10 py-3 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-gold/20">Re-verify Identity</button>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-24 bg-navy-950 rounded-[32px] border-2 border-dashed border-navy-700">
                <p className="text-navy-500 font-black text-[10px] uppercase tracking-widest">Zero matching entries in ledger</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-[24px] border border-navy-700">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-navy-950 text-[10px] text-navy-400 font-black uppercase tracking-widest leading-none">
                    <th className="px-8 py-6 border-b border-navy-700">Account</th>
                    <th className="px-8 py-6 border-b border-navy-700">Market</th>
                    <th className="px-8 py-6 border-b border-navy-700 text-right">Value</th>
                    <th className="px-8 py-6 border-b border-navy-700 text-center">Verification</th>
                    <th className="px-8 py-6 border-b border-navy-700 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-navy-700/50">
                  {filteredTransactions.map((tx: Transaction) => {
                    const user = tx.user as User;
                    return (
                      <tr key={tx._id} className="bg-navy-700/30 hover:bg-white/[0.02] transition-all group">
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-navy-900 border border-navy-600 flex items-center justify-center text-gold font-black shadow-lg">
                                  {user?.name?.charAt(0)}
                              </div>
                              <div>
                                  <p className="font-bold text-navy-100 leading-none mb-1.5 tracking-tight">{user?.name || 'Authorized Proxy'}</p>
                                  <p className="text-[10px] text-navy-500 font-bold">{user?.email}</p>
                              </div>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-3">
                              <div className="p-2 bg-navy-950 rounded-lg">
                                <Tag className="w-4 h-4 text-gold" />
                              </div>
                              <p className="font-bold text-navy-200 whitespace-nowrap overflow-hidden max-w-[200px] text-ellipsis">
                                  {tx.event?.title || 'System Level Event'}
                              </p>
                          </div>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <p className={`font-black text-lg tracking-tight ${tx.type === 'refund' ? 'text-amber-400' : 'text-gold'}`}>
                              {tx.type === 'refund' ? '-' : ''}${tx.amount}
                          </p>
                        </td>
                        <td className="px-8 py-5 text-center">
                          <div className={`inline-flex px-[10px] py-[3px] rounded-[5px] text-[12px] font-black uppercase tracking-widest border ${getStatusColor(tx.status)}`}>
                              {tx.status}
                          </div>
                        </td>
                        <td className="px-8 py-5 text-right">
                          <p className="text-[10px] font-black text-navy-500 uppercase tracking-widest">{format(new Date(tx.createdAt), 'MMM dd, HH:mm')}</p>
                        </td>
                      </tr>
                    );
                  })}
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
