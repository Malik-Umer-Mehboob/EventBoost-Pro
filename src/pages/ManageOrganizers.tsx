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
    <div className="min-h-screen bg-[#0F1C2E] pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#C9A84C] mb-1">
              <ShieldCheck className="w-5 h-5" />
              <span className="text-xs font-black uppercase tracking-widest">Admin Control</span>
            </div>
            <h1 className="text-4xl font-black text-[#EDF2F7]">Manage Organizers</h1>
            <p className="text-[#5A7A94] mt-1">Total Organizers: <span className="font-bold text-[#C9A84C]">{totalCount}</span></p>
          </div>

          <div className="relative max-w-sm w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#5A7A94]" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-[#0F1C2E] border border-[#2E4A63] rounded-2xl outline-none focus:border-[#C9A84C] transition-all font-medium text-[#EDF2F7] placeholder-[#3D5A73]"
            />
          </div>
        </div>

        {/* Organizers Table */}
        <div className="bg-[#162333] rounded-[32px] overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.3)] border border-[#2E4A63]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#08111C]">
                <tr className="border-b-[0.5px] border-[#1A2B3D]">
                  <th className="px-6 py-5 text-xs font-black text-[#5A7A94] uppercase tracking-wider">Organizer</th>
                  <th className="px-6 py-5 text-xs font-black text-[#5A7A94] uppercase tracking-wider">Status</th>
                  <th className="px-6 py-5 text-xs font-black text-[#5A7A94] uppercase tracking-wider">Events</th>
                  <th className="px-6 py-5 text-xs font-black text-[#5A7A94] uppercase tracking-wider">Joined Date</th>
                  <th className="px-6 py-5 text-xs font-black text-[#5A7A94] uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-[0.5px] divide-[#1A2B3D]">
                {loading ? (
                   Array(5).fill(0).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={5} className="px-6 py-8">
                        <div className="flex items-center gap-3 animate-pulse">
                          <div className="w-10 h-10 bg-[#2E4A63] rounded-xl"></div>
                          <div className="space-y-2">
                            <div className="h-4 w-32 bg-[#2E4A63] rounded"></div>
                            <div className="h-3 w-48 bg-[#1A2B3D] rounded"></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : filteredOrganizers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 bg-[#1A2B3D] rounded-3xl flex items-center justify-center">
                          <User className="w-8 h-8 text-[#3D5A73]" />
                        </div>
                        <p className="font-bold text-[#5A7A94]">No organizers found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredOrganizers.map((org) => (
                    <motion.tr
                      key={org._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-[rgba(255,255,255,0.02)] transition-colors group"
                    >
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C9A84C] to-[#b8963e] flex items-center justify-center text-[#0F1C2E] font-black shadow-lg">
                            {org.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-[#EDF2F7] group-hover:text-[#C9A84C] transition-colors">{org.name}</p>
                            <p className="text-xs text-[#5A7A94] flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {org.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-[10px] py-[3px] rounded-[5px] text-[12px] font-black uppercase tracking-wider border-transparent ${
                          org.status === 'active'
                            ? 'bg-[rgba(201,168,76,0.15)] text-[#C9A84C]'
                            : 'bg-[rgba(226,75,74,0.12)] text-[#E24B4A]'
                        }`}>
                          {org.status}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-[#C9A84C]" />
                          <span className="font-bold text-[#B8C5D3]">{org.eventCount}</span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-sm text-[#5A7A94]">
                        {format(new Date(org.createdAt), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(org)}
                            className="p-2 text-[#5A7A94] hover:text-[#C9A84C] hover:bg-[#0F1C2E] rounded-xl transition-all"
                            title="Edit Organizer"
                          >
                            <Edit3 className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => setDeletingOrg(org)}
                            className="p-2 text-[#5A7A94] hover:text-rose-400 hover:bg-[#0F1C2E] rounded-xl transition-all"
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
                className="absolute inset-0 bg-[rgba(0,0,0,0.7)] backdrop-blur-sm"
              />
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-[#162333] rounded-[2rem] w-full max-w-md p-8 shadow-[0_8px_30px_rgb(0,0,0,0.5)] relative z-10 border border-[#2E4A63]"
              >
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-[#C9A84C]/10 rounded-2xl border border-[#C9A84C]/20">
                      <Edit3 className="w-6 h-6 text-[#C9A84C]" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-[#EDF2F7]">Edit Organizer</h3>
                      <p className="text-sm text-[#5A7A94]">{editingOrg.email}</p>
                    </div>
                  </div>
                  <button onClick={() => setEditingOrg(null)} className="p-2 hover:bg-[#1A2B3D] rounded-xl transition-colors">
                    <X className="w-6 h-6 text-[#5A7A94]" />
                  </button>
                </div>

                <form onSubmit={handleUpdate} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-[#B8C5D3] uppercase tracking-widest ml-1">Full Name</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-5 py-4 rounded-2xl bg-[#0F1C2E] border border-[#2E4A63] focus:border-[#C9A84C] outline-none transition-all font-bold text-[#EDF2F7]"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-[#B8C5D3] uppercase tracking-widest ml-1">Status</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setEditStatus('active')}
                        className={`py-4 rounded-2xl font-black transition-all border-2 ${
                          editStatus === 'active'
                          ? 'bg-emerald-900/30 border-emerald-500 text-emerald-400'
                          : 'bg-[#1A2B3D] border-[#2E4A63] text-[#5A7A94] hover:border-[#3D5A73]'
                        }`}
                      >
                        ACTIVE
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditStatus('blocked')}
                        className={`py-4 rounded-2xl font-black transition-all border-2 ${
                          editStatus === 'blocked'
                          ? 'bg-rose-900/30 border-rose-500 text-rose-400'
                          : 'bg-[#1A2B3D] border-[#2E4A63] text-[#5A7A94] hover:border-[#3D5A73]'
                        }`}
                      >
                        BLOCKED
                      </button>
                    </div>
                  </div>

                  <div className="p-4 bg-[#C9A84C]/5 rounded-2xl flex gap-3 border border-[#C9A84C]/20">
                    <Info className="w-5 h-5 text-[#C9A84C] shrink-0" />
                    <p className="text-xs text-[#B8C5D3] leading-relaxed font-medium">
                      Updating the status will immediately affect the organizer's ability to login and manage events. Email cannot be changed.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="w-full py-5 bg-[#C9A84C] text-[#0F1C2E] rounded-2xl font-black hover:bg-[#b8963e] transition-all shadow-xl disabled:opacity-50"
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
                className="absolute inset-0 bg-[rgba(0,0,0,0.7)] backdrop-blur-sm"
              />
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-[#162333] rounded-[2rem] w-full max-w-md p-8 shadow-[0_8px_30px_rgb(0,0,0,0.5)] relative z-10 border border-[#2E4A63]"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-20 h-20 bg-rose-900/20 rounded-[2rem] flex items-center justify-center mb-6 border border-rose-700/30">
                    <AlertTriangle className="w-10 h-10 text-rose-400" />
                  </div>

                  <h3 className="text-2xl font-black text-[#EDF2F7] mb-2">Delete Organizer?</h3>
                  <p className="text-[#7A94AA] mb-8 px-4">
                    Are you sure you want to delete <span className="font-bold text-[#EDF2F7]">"{deletingOrg.name}"</span>?
                    This will permanently remove their account and all <span className="font-bold text-rose-400">{deletingOrg.eventCount} events</span>.
                  </p>

                  <div className="grid grid-cols-2 gap-4 w-full">
                    <button
                      onClick={() => setDeletingOrg(null)}
                      className="py-4 bg-[#1A2B3D] text-[#B8C5D3] border border-[#2E4A63] rounded-2xl font-black hover:bg-[#2E4A63] transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="py-4 bg-rose-600 text-white rounded-2xl font-black hover:bg-rose-700 transition-all shadow-xl disabled:opacity-50"
                    >
                      {isDeleting ? 'Deleting...' : 'Confirm'}
                    </button>
                  </div>

                  <p className="text-[10px] text-[#3D5A73] mt-6 uppercase tracking-widest font-bold">This action cannot be undone</p>
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
