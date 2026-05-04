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
    <div className="min-h-screen bg-navy-900 pt-24 pb-16 px-4 sm:px-6 lg:px-8 text-navy-200">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div>
            <div className="flex items-center gap-3 text-gold mb-2">
              <ShieldCheck className="w-6 h-6" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em]">Administrative Nexus</span>
            </div>
            <h1 className="text-5xl font-black text-navy-100 tracking-tight">Manage Organizers</h1>
            <p className="text-navy-400 mt-2 font-medium">Verified platform entities: <span className="font-black text-gold">{totalCount}</span></p>
          </div>

          <div className="relative max-w-sm w-full group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-navy-500 group-focus-within:text-gold transition-colors" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-navy-950 border border-navy-700 rounded-2xl outline-none focus:border-gold/30 transition-all shadow-inner font-bold text-navy-100 placeholder-navy-500"
            />
          </div>
        </div>

        {/* Organizers Table */}
        <div className="bg-navy-800/50 rounded-[40px] overflow-hidden shadow-2xl border border-navy-600">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-navy-950 text-[10px] font-black text-navy-400 uppercase tracking-widest leading-none">
                  <th className="px-8 py-6 border-b border-navy-700">Organizer Entity</th>
                  <th className="px-8 py-6 border-b border-navy-700">Verification</th>
                  <th className="px-8 py-6 border-b border-navy-700">Event Load</th>
                  <th className="px-8 py-6 border-b border-navy-700">Registry Date</th>
                  <th className="px-8 py-6 border-b border-navy-700 text-right">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-navy-700/50">
                {loading ? (
                   Array(5).fill(0).map((_, i) => (
                    <tr key={i}>
                      <td colSpan={5} className="px-8 py-10">
                        <div className="flex items-center gap-4 animate-pulse">
                          <div className="w-12 h-12 bg-navy-700 rounded-xl"></div>
                          <div className="space-y-3">
                            <div className="h-4 w-32 bg-navy-700 rounded"></div>
                            <div className="h-3 w-48 bg-navy-800 rounded"></div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : filteredOrganizers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-8 py-24 text-center">
                      <div className="flex flex-col items-center gap-4">
                        <div className="w-20 h-20 bg-navy-900 rounded-[2rem] flex items-center justify-center border-2 border-dashed border-navy-700">
                          <User className="w-8 h-8 text-navy-600" />
                        </div>
                        <p className="font-black text-navy-500 uppercase tracking-widest text-[10px]">Registry is empty</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredOrganizers.map((org) => (
                    <motion.tr 
                      key={org._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-navy-900 border border-navy-700 flex items-center justify-center text-gold font-black shadow-xl">
                            {org.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-navy-100 group-hover:text-gold transition-colors tracking-tight">{org.name}</p>
                            <p className="text-[10px] text-navy-500 font-bold flex items-center gap-1.5 mt-1">
                              <Mail className="w-3.5 h-3.5" />
                              {org.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className={`px-[10px] py-[3px] rounded-[5px] text-[12px] font-black uppercase tracking-widest border ${
                          org.status === 'active' 
                            ? 'bg-emerald-950/30 text-emerald-400 border-emerald-900/50' 
                            : 'bg-rose-950/30 text-rose-400 border-rose-900/50'
                        }`}>
                          {org.status}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-navy-950 rounded-lg">
                            <Calendar className="w-4 h-4 text-gold" />
                          </div>
                          <span className="font-black text-navy-100">{org.eventCount}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-[10px] font-black text-navy-500 uppercase tracking-widest">
                        {format(new Date(org.createdAt), 'MMM dd, yyyy')}
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-3">
                           <button 
                             onClick={() => handleEdit(org)}
                             className="p-3 text-navy-400 hover:text-gold hover:bg-navy-900 rounded-xl transition-all border border-transparent hover:border-navy-700 shadow-sm"
                             title="Modify Entity"
                           >
                             <Edit3 className="w-5 h-5" />
                           </button>
                           <button 
                             onClick={() => setDeletingOrg(org)}
                             className="p-3 text-navy-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-xl transition-all border border-transparent hover:border-rose-900/50 shadow-sm"
                             title="Purge Record"
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
                className="absolute inset-0 bg-navy-950/80 backdrop-blur-md"
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-navy-800 rounded-[3rem] w-full max-w-md p-10 shadow-2xl relative z-10 border border-navy-600"
              >
                <div className="flex items-center justify-between mb-10">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-navy-950 rounded-2xl border border-navy-700 text-gold shadow-xl">
                      <Edit3 className="w-7 h-7" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-navy-100 tracking-tight">Edit Entity</h3>
                      <p className="text-[10px] font-black text-navy-500 uppercase tracking-widest mt-1">{editingOrg.email}</p>
                    </div>
                  </div>
                  <button onClick={() => setEditingOrg(null)} className="p-2 hover:bg-navy-700 rounded-xl transition-colors">
                    <X className="w-7 h-7 text-navy-400" />
                  </button>
                </div>

                <form onSubmit={handleUpdate} className="space-y-8">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-navy-500 uppercase tracking-widest pl-1">Legal Designation</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-6 py-5 rounded-[20px] bg-navy-950 border border-navy-700 focus:border-gold/30 outline-none transition-all font-black text-navy-100"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-navy-500 uppercase tracking-widest pl-1">Authorization Status</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setEditStatus('active')}
                        className={`py-5 rounded-[20px] font-black tracking-widest transition-all border-2 ${
                          editStatus === 'active' 
                          ? 'bg-emerald-950/20 border-emerald-500 text-emerald-400 shadow-lg shadow-emerald-500/10' 
                          : 'bg-navy-950 border-navy-700 text-navy-500 hover:bg-navy-900'
                        }`}
                      >
                        ACTIVE
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditStatus('blocked')}
                        className={`py-5 rounded-[20px] font-black tracking-widest transition-all border-2 ${
                          editStatus === 'blocked' 
                          ? 'bg-rose-950/20 border-rose-500 text-rose-400 shadow-lg shadow-rose-500/10' 
                          : 'bg-navy-950 border-navy-700 text-navy-500 hover:bg-navy-900'
                        }`}
                      >
                        BLOCKED
                      </button>
                    </div>
                  </div>

                  <div className="p-5 bg-navy-950 rounded-2xl flex gap-4 border border-navy-700">
                    <Info className="w-6 h-6 text-gold shrink-0" />
                    <p className="text-xs text-navy-400 leading-relaxed font-medium">
                      Updating authorization status will immediately synchronize across the cryptographic layer. Email identifier remains immutable.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="w-full py-5 bg-gold text-navy-900 rounded-[20px] font-black hover:bg-[#b8963e] transition-all shadow-xl shadow-gold/20 disabled:opacity-50 active:scale-95 uppercase tracking-widest text-sm"
                  >
                    {isUpdating ? 'Synchronizing...' : 'Commit Changes'}
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
                className="absolute inset-0 bg-navy-950/80 backdrop-blur-md"
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="bg-navy-800 rounded-[3rem] w-full max-w-md p-10 shadow-2xl relative z-10 border border-navy-600"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-24 h-24 bg-rose-950/30 rounded-[2.5rem] flex items-center justify-center mb-8 border border-rose-900/50">
                    <AlertTriangle className="w-12 h-12 text-rose-500" />
                  </div>
                  
                  <h3 className="text-3xl font-black text-navy-100 mb-3 tracking-tight">Purge Entity?</h3>
                  <p className="text-navy-400 mb-10 px-4 font-medium leading-relaxed">
                    Initiating permanent deletion of <span className="text-navy-100 font-black">"{deletingOrg.name}"</span>. 
                    This will terminate <span className="text-rose-400 font-black tracking-widest uppercase text-xs">{deletingOrg.eventCount} active events</span>.
                  </p>

                  <div className="grid grid-cols-2 gap-5 w-full">
                    <button
                      onClick={() => setDeletingOrg(null)}
                      className="py-5 bg-navy-900 text-navy-400 rounded-[20px] font-black hover:bg-navy-700 transition-all uppercase tracking-widest text-xs"
                    >
                      Abeyance
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="py-5 bg-rose-500 text-white rounded-[20px] font-black hover:bg-rose-600 transition-all shadow-xl shadow-rose-500/20 disabled:opacity-50 uppercase tracking-widest text-xs"
                    >
                      {isDeleting ? 'Purging...' : 'Execute'}
                    </button>
                  </div>
                  
                  <p className="text-[10px] text-rose-400/50 mt-8 uppercase tracking-[0.3em] font-black">Final Irreversible Protocol</p>
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
