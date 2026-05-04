import React, { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { format } from 'date-fns';

import { Attendee } from '../../types';

interface AttendeeTableProps {
  attendees: Attendee[];
  loading?: boolean;
}

const AttendeeTable: React.FC<AttendeeTableProps> = ({ attendees, loading }) => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const PER_PAGE = 10;

  const filtered = attendees.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.email.toLowerCase().includes(search.toLowerCase())
  );
  const pages = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div>
      {/* Search */}
      <div className="relative mb-4 group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-navy-500 group-focus-within:text-gold transition-colors w-4 h-4" />
        <input
          type="text"
          placeholder="Search attendees by name or email..."
          className="w-full pl-10 pr-4 py-3 rounded-2xl bg-navy-900 border border-navy-600 focus:border-gold/30 outline-none text-sm font-medium transition-all text-navy-100 placeholder-navy-500"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      {loading ? (
        <div className="py-16 text-center text-navy-500 font-black text-[10px] uppercase tracking-widest">Loading...</div>
      ) : paged.length === 0 ? (
        <div className="py-16 text-center">
          <Users className="w-10 h-10 text-navy-600 mx-auto mb-3" />
          <p className="text-navy-500 font-black text-[10px] uppercase tracking-widest">No attendees found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-[10px] font-black uppercase tracking-widest text-navy-500 border-b border-navy-600">
                <th className="py-4 pr-4">Attendee</th>
                <th className="py-4 pr-4 text-center">Tickets</th>
                <th className="py-4 pr-4 text-right">Investment</th>
                <th className="py-4 text-right">Booked On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-600/50">
              {paged.map(a => (
                <tr key={a.bookingId} className="hover:bg-navy-800/50 transition-colors group">
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-navy-800 border border-navy-600 flex items-center justify-center text-gold font-black text-sm shrink-0 shadow-lg">
                        {a.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-black text-navy-100 leading-tight tracking-tight">{a.name}</p>
                        <p className="text-[10px] text-navy-500 font-bold">{a.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 pr-4 text-center">
                    <span className="px-3 py-1 bg-navy-950 text-gold rounded-full text-[10px] font-black uppercase tracking-widest border border-navy-600">
                      {a.tickets} {a.tickets === 1 ? 'ticket' : 'tickets'}
                    </span>
                  </td>
                  <td className="py-4 pr-4 font-black text-navy-100 text-right tracking-tight">${a.totalPaid}</td>
                  <td className="py-4 text-[10px] text-navy-500 font-black uppercase tracking-widest text-right">
                    {format(new Date(a.bookedAt), 'MMM dd, yyyy')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-between mt-6 pt-6 border-t border-navy-600">
          <p className="text-[10px] text-navy-500 font-black uppercase tracking-widest">
            {filtered.length} attendee{filtered.length !== 1 ? 's' : ''} Found
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-xl border border-navy-600 text-navy-400 hover:text-gold hover:border-gold/30 disabled:opacity-20 transition-all bg-navy-800"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-[10px] font-black text-navy-200 px-4 uppercase tracking-widest">
              {page} / {pages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(pages, p + 1))}
              disabled={page === pages}
              className="p-2 rounded-xl border border-navy-600 text-navy-400 hover:text-gold hover:border-gold/30 disabled:opacity-20 transition-all bg-navy-800"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendeeTable;
