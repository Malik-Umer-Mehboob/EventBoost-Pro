import React, { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { format } from 'date-fns';

interface Attendee {
  bookingId: string;
  name: string;
  email: string;
  tickets: number;
  totalPaid: number;
  bookedAt: string;
}

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
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search attendees by name or email..."
          className="w-full pl-10 pr-4 py-3 rounded-2xl border-2 border-gray-100 focus:border-indigo-400 outline-none text-sm font-medium transition-all"
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      {loading ? (
        <div className="py-16 text-center text-gray-400 font-bold text-sm uppercase tracking-widest">Loading...</div>
      ) : paged.length === 0 ? (
        <div className="py-16 text-center">
          <Users className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 font-bold text-sm">No attendees found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">
                <th className="py-3 pr-4">Attendee</th>
                <th className="py-3 pr-4">Tickets</th>
                <th className="py-3 pr-4">Paid</th>
                <th className="py-3">Booked</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {paged.map(a => (
                <tr key={a.bookingId} className="hover:bg-slate-50 transition-colors group">
                  <td className="py-4 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-black text-sm shrink-0">
                        {a.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 leading-tight">{a.name}</p>
                        <p className="text-xs text-gray-400">{a.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 pr-4">
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-black">
                      {a.tickets} {a.tickets === 1 ? 'ticket' : 'tickets'}
                    </span>
                  </td>
                  <td className="py-4 pr-4 font-black text-gray-900">${a.totalPaid}</td>
                  <td className="py-4 text-xs text-gray-400 font-bold">
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
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-400 font-bold">
            {filtered.length} attendee{filtered.length !== 1 ? 's' : ''}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-xl border border-gray-100 text-gray-400 hover:text-indigo-600 hover:border-indigo-100 disabled:opacity-30 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-black text-gray-600 px-2">
              {page} / {pages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(pages, p + 1))}
              disabled={page === pages}
              className="p-2 rounded-xl border border-gray-100 text-gray-400 hover:text-indigo-600 hover:border-indigo-100 disabled:opacity-30 transition-all"
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
