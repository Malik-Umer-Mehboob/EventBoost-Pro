import React, { useState, useEffect } from 'react';
import { ShieldCheck, Calendar, Trash2, Edit3, Search, User, Mail, Info, X, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../api/axios';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Organizer {
  _id: string;
  name: string;
  email: string;
  status: 'active' | 'blocked';
  createdAt: string;
  eventCount: number;
}

const ManageOrganizers = () => {
  const [organizers, setOrganizers] = useState<Organizer[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Edit Modal State
  const [editingOrg, setEditingOrg] = useState<Organizer | null>(null);
  const [editName, setEditName] = useState('');
  const [editStatus, setEditStatus] = useState<'active' | 'blocked'>('active');
  const [isUpdating, setIsUpdating] = useState(false);

  // Delete Modal State
  const [deletingOrg, setDeletingOrg] = useState<Organizer | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchOrganizers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/organizers');
      setOrganizers(data.organizers);
      setTotalCount(data.total);
    } catch (err) {
      console.error('Failed to load organizers:', err);
      toast.error('Failed to load organizers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizers();
  }, []);

  const handleEdit = (org: Organizer) => {
    setEditingOrg(org);
    setEditName(org.name);
    setEditStatus(org.status);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingOrg) return;
    
    setIsUpdating(true);
    try {
      await api.put(`/admin/organizers/${editingOrg._id}`, {
        name: editName,
        status: editStatus
      });
      toast.success('Organizer updated successfully');
      setEditingOrg(null);
      fetchOrganizers();
    } catch (err) {
      console.error('Failed to update organizer:', err);
      toast.error('Failed to update organizer');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingOrg) return;
    
    setIsDeleting(true);
    try {
      await api.delete(`/admin/organizers/${deletingOrg._id}`);
      toast.success('Organizer and related data deleted');
      setDeletingOrg(null);
      fetchOrganizers();
    } catch (err) {
      console.error('Failed to delete organizer:', err);
      toast.error('Failed to delete organizer');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredOrganizers = organizers.filter(org => 
    org.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    org.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 mb-1">
              <ShieldCheck className="w-5 h-5" />
              <span className="text-xs font-black uppercase tracking-widest">Admin Control</span>
            </div>
            <h1 className="text-4xl font-black text-gray-900">Manage Organizers</h1>
            <p className="text-gray-500 mt-1">Total Organizers: <span className="font-bold text-indigo-600">{totalCount}</span></p>
          </div>

          <div className="relative max-w-sm w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border border-gray-100 rounded-2xl outline-none focus:ring-2 focus:ring-indigo-100 transition-all shadow-sm"
            />
          </div>
        </div>

        {/* Organizers Table */}
        <div className="glass rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50 border border-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-gray-100">
                  <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-wider">Organizer</th>
                  <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-wider">Events</th>
                  <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-wider">Joined Date</th>
                  <th className="px-6 py-5 text-xs font-black text-gray-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                   Array(5).fill(0).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={5} className="px-6 py-8">
                        <div className="flex items-center gap-3 animate-pulse">
                          <div className="w-10 h-10 bg-gray-200 rounded-xl"></div>
                          <div className="space-y-2">
                            <div className="h-4 w-32 bg-gray-200 rounded"></div>
                            <div className="h-3 w-48 bg-gray-100 rounded"></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : filteredOrganizers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center">
                          <User className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="font-bold text-gray-400">No organizers found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredOrganizers.map((org) => (
                    <motion.tr 
                      key={org._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-indigo-50/30 transition-colors group"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black shadow-lg shadow-indigo-100">
                            {org.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{org.name}</p>
                            <p className="text-xs text-gray-500 flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {org.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                          org.status === 'active' 
                            ? 'bg-emerald-50 text-emerald-600' 
                            : 'bg-rose-50 text-rose-600'
                        }`}>
                          {org.status}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-indigo-400" />
                          <span className="font-bold text-gray-700">{org.eventCount}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-sm text-gray-500">
                        {format(new Date(org.createdAt), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleEdit(org)}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl transition-all"
                            title="Edit Organizer"
                          >
                            <Edit3 className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => setDeletingOrg(org)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-white rounded-xl transition-all"
                            title="Delete Organizer"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit Modal */}
        <AnimatePresence>
          {editingOrg && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setEditingOrg(null)}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-white rounded-[2rem] w-full max-w-md p-8 shadow-2xl relative z-10"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-50 rounded-2xl">
                      <Edit3 className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-gray-900">Edit Organizer</h3>
                      <p className="text-sm text-gray-500">{editingOrg.email}</p>
                    </div>
                  </div>
                  <button onClick={() => setEditingOrg(null)} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                    <X className="w-6 h-6 text-gray-400" />
                  </button>
                </div>

                <form onSubmit={handleUpdate} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Full Name</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-5 py-4 rounded-2xl bg-slate-50 border border-gray-100 focus:border-indigo-300 outline-none transition-all font-bold"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">Status</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setEditStatus('active')}
                        className={`py-4 rounded-2xl font-black transition-all border-2 ${
                          editStatus === 'active' 
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-600' 
                          : 'bg-slate-50 border-transparent text-gray-400 hover:bg-slate-100'
                        }`}
                      >
                        ACTIVE
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditStatus('blocked')}
                        className={`py-4 rounded-2xl font-black transition-all border-2 ${
                          editStatus === 'blocked' 
                          ? 'bg-rose-50 border-rose-500 text-rose-600' 
                          : 'bg-slate-50 border-transparent text-gray-400 hover:bg-slate-100'
                        }`}
                      >
                        BLOCKED
                      </button>
                    </div>
                  </div>

                  <div className="p-4 bg-amber-50 rounded-2xl flex gap-3 border border-amber-100">
                    <Info className="w-5 h-5 text-amber-500 shrink-0" />
                    <p className="text-xs text-amber-700 leading-relaxed font-medium">
                      Updating the status will immediately affect the organizer's ability to login and manage events. Email cannot be changed.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="w-full py-5 bg-indigo-600 text-white rounded-2xl font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 disabled:opacity-50"
                  >
                    {isUpdating ? 'Updating...' : 'Save Changes'}
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {deletingOrg && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setDeletingOrg(null)}
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-white rounded-[2rem] w-full max-w-md p-8 shadow-2xl relative z-10"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-rose-50 rounded-[2rem] flex items-center justify-center mb-6">
                    <AlertTriangle className="w-10 h-10 text-rose-500" />
                  </div>
                  
                  <h3 className="text-2xl font-black text-gray-900 mb-2">Delete Organizer?</h3>
                  <p className="text-gray-500 mb-8 px-4">
                    Are you sure you want to delete <span className="font-bold text-gray-900">"{deletingOrg.name}"</span>? 
                    This will permanently remove their account and all <span className="font-bold text-rose-500">{deletingOrg.eventCount} events</span>.
                  </p>

                  <div className="grid grid-cols-2 gap-4 w-full">
                    <button
                      onClick={() => setDeletingOrg(null)}
                      className="py-4 bg-slate-100 text-gray-600 rounded-2xl font-black hover:bg-slate-200 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="py-4 bg-rose-500 text-white rounded-2xl font-black hover:bg-rose-600 transition-all shadow-xl shadow-rose-100 disabled:opacity-50"
                    >
                      {isDeleting ? 'Deleting...' : 'Confirm'}
                    </button>
                  </div>
                  
                  <p className="text-[10px] text-gray-400 mt-6 uppercase tracking-widest font-bold">This action cannot be undone</p>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default ManageOrganizers;
