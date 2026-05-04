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
      <div className="relative mb-4">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5A7A94] w-4 h-4" />
        <input
          type="text"
          placeholder="Search attendees by name or email..."
          className="w-full pl-10 pr-4 py-3 rounded-2xl bg-[#1A2B3D] border-[0.5px] border-[#2E4A63] focus:border-[#C9A84C] outline-none text-sm font-medium transition-all text-[#EDF2F7] placeholder-[#3D5A73]"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      {loading ? (
        <div className="py-16 text-center text-[#5A7A94] font-bold text-sm uppercase tracking-widest">Loading...</div>
      ) : paged.length === 0 ? (
        <div className="py-16 text-center">
          <Users className="w-10 h-10 text-[#2E4A63] mx-auto mb-3" />
          <p className="text-[#5A7A94] font-bold text-sm">No attendees found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-[10px] font-black uppercase tracking-widest text-[#5A7A94] border-b-[0.5px] border-[#1A2B3D] bg-[#08111C]">
                <th className="py-3 pl-4 pr-4 rounded-tl-xl">Attendee</th>
                <th className="py-3 pr-4">Tickets</th>
                <th className="py-3 pr-4">Paid</th>
                <th className="py-3 rounded-tr-xl">Booked</th>
              </tr>
            </thead>
            <tbody className="divide-y-[0.5px] divide-[#1A2B3D]">
              {paged.map(a => (
                <tr key={a.bookingId} className="hover:bg-[rgba(255,255,255,0.02)] transition-colors group">
                  <td className="py-4 pl-4 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[rgba(201,168,76,0.1)] border-[0.5px] border-[#C9A84C]/20 flex items-center justify-center text-[#C9A84C] font-black text-sm shrink-0">
                        {a.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-[#EDF2F7] leading-tight">{a.name}</p>
                        <p className="text-xs text-[#5A7A94]">{a.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 pr-4">
                    <span className="px-3 py-1 bg-[rgba(201,168,76,0.12)] text-[#C9A84C] rounded-full text-xs font-black">
                      {a.tickets} {a.tickets === 1 ? 'ticket' : 'tickets'}
                    </span>
                  </td>
                  <td className="py-4 pr-4 font-black text-[#C9A84C]">${a.totalPaid}</td>
                  <td className="py-4 text-xs text-[#B8C5D3] font-bold">
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
        <div className="flex items-center justify-between mt-4 pt-4 border-t-[0.5px] border-[#1A2B3D]">
          <p className="text-xs text-[#5A7A94] font-bold">
            {filtered.length} attendee{filtered.length !== 1 ? 's' : ''}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-xl border border-[#2E4A63] text-[#5A7A94] hover:text-[#C9A84C] hover:border-[#C9A84C]/50 disabled:opacity-30 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-black text-[#EDF2F7] px-2">
              {page} / {pages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(pages, p + 1))}
              disabled={page === pages}
              className="p-2 rounded-xl border border-[#2E4A63] text-[#5A7A94] hover:text-[#C9A84C] hover:border-[#C9A84C]/50 disabled:opacity-30 transition-all"
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
