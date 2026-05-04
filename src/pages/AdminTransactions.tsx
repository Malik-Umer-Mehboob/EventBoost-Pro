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
      case 'succeeded': return 'bg-[rgba(29,158,117,0.12)] text-[#1D9E75] border-transparent';
      case 'refunded': return 'bg-[rgba(55,138,221,0.12)] text-[#378ADD] border-transparent';
      case 'failed': return 'bg-[rgba(226,75,74,0.12)] text-[#E24B4A] border-transparent';
      default: return 'bg-[rgba(184,197,211,0.1)] text-[#B8C5D3] border-[#2E4A63]';
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1C2E] pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-[#162333] p-8 sm:p-10 rounded-[32px] mb-8 border border-[#2E4A63] shadow-[0_8px_30px_rgb(0,0,0,0.3)]">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#C9A84C]/10 rounded-2xl text-[#C9A84C] border border-[#C9A84C]/20">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-[#EDF2F7]">Transaction Registry</h1>
                <p className="text-[#7A94AA] font-medium">Monitor all financial movements across the platform.</p>
              </div>
            </div>

            <button
              onClick={fetchAllTransactionsData}
              className="flex items-center gap-2 bg-[#C9A84C] text-[#0F1C2E] px-6 py-3 rounded-2xl font-bold hover:bg-[#b8963e] transition-all active:scale-95"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              Refresh Data
            </button>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5A7A94] w-5 h-5" />
              <input
                type="text"
                placeholder="Search by user, email, event or ID..."
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-[#2E4A63] bg-[#0F1C2E] text-[#EDF2F7] placeholder-[#3D5A73] focus:border-[#C9A84C] outline-none transition-all font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-4">
              <button className="bg-[#1A2B3D] border border-[#2E4A63] px-6 py-4 rounded-2xl font-bold text-[#B8C5D3] flex items-center gap-2 hover:border-[#C9A84C]/40">
                <Filter className="w-5 h-5" />
                Filters
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
              <Loader2 className="w-12 h-12 text-[#C9A84C] animate-spin" />
              <p className="text-[#7A94AA] font-medium">Synchronizing transaction logs...</p>
            </div>
          ) : error ? (
            <div className="py-20 text-center space-y-4">
                 <AlertCircle className="w-16 h-16 text-rose-400 mx-auto" />
                 <h2 className="text-2xl font-black text-[#EDF2F7]">Security Access Issue</h2>
                 <p className="text-[#7A94AA] max-w-md mx-auto">{error}</p>
                 <button onClick={fetchAllTransactionsData} className="bg-[#C9A84C] text-[#0F1C2E] px-8 py-3 rounded-xl font-bold hover:bg-[#b8963e]">Try Re-auth</button>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-20 bg-[#1A2B3D] rounded-3xl border border-dashed border-[#2E4A63]">
                <p className="text-[#5A7A94] font-bold text-xl uppercase tracking-widest">No matching transactions</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-8 px-8">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#08111C]">
                  <tr className="text-[10px] text-[#5A7A94] font-black uppercase tracking-widest leading-none border-b-[0.5px] border-[#1A2B3D]">
                    <th className="px-6 py-4 rounded-tl-xl">User Details</th>
                    <th className="px-6 py-4">Event</th>
                    <th className="px-6 py-4 text-right">Amount</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 rounded-tr-xl">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y-[0.5px] divide-[#1A2B3D]">
                  {filteredTransactions.map((tx: Transaction) => {
                    const user = tx.user as User;
                    return (
                      <tr key={tx._id} className="hover:bg-[rgba(255,255,255,0.02)] transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/20 flex items-center justify-center text-[#C9A84C] font-bold">
                                  {user?.name?.charAt(0)}
                              </div>
                              <div>
                                  <p className="font-black text-[#EDF2F7] leading-none mb-1">{user?.name || 'Deleted User'}</p>
                                  <p className="text-xs text-[#5A7A94]">{user?.email}</p>
                              </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                              <Tag className="w-4 h-4 text-[#C9A84C]" />
                              <p className="font-bold text-[#B8C5D3] whitespace-nowrap overflow-hidden max-w-[200px] text-ellipsis">
                                  {tx.event?.title || 'Unknown Event'}
                              </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <p className={`font-black text-lg ${tx.type === 'refund' ? 'text-rose-400' : 'text-[#C9A84C]'}`}>
                              {tx.type === 'refund' ? '-' : ''}${tx.amount}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`inline-flex px-[10px] py-[3px] rounded-[5px] text-[12px] font-black uppercase tracking-widest border ${getStatusColor(tx.status)}`}>
                              {tx.status}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-xs font-bold text-[#5A7A94]">{format(new Date(tx.createdAt), 'MMM dd, HH:mm')}</p>
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
