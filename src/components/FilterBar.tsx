import React, { useState, useEffect, useCallback } from 'react';
import { Search, Filter, X, Calendar, MapPin, Tag, ChevronDown, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FilterBarProps {
  onFilterChange: (filters: any) => void;
  totalResults: number;
  initialFilters?: any;
}

const CATEGORIES = ['All', 'Music', 'Tech', 'Food', 'Sports', 'Art', 'Education', 'Business', 'Health', 'Other'];

const FilterBar: React.FC<FilterBarProps> = ({ onFilterChange, totalResults, initialFilters = {} }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [filters, setFilters] = useState({
    search: initialFilters.search || '',
    category: initialFilters.category || 'All',
    city: initialFilters.city || '',
    minPrice: initialFilters.minPrice || '',
    maxPrice: initialFilters.maxPrice || '',
    startDate: initialFilters.startDate || '',
    endDate: initialFilters.endDate || '',
    sort: initialFilters.sort || 'newest',
  });

  const [debouncedSearch, setDebouncedSearch] = useState(filters.search);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({ ...prev, search: debouncedSearch }));
    }, 500);
    return () => clearTimeout(timer);
  }, [debouncedSearch]);

  // Sync state when initialFilters change (e.g. from URL)
  const initialFiltersString = JSON.stringify(initialFilters);
  useEffect(() => {
    const parsedFilters = JSON.parse(initialFiltersString);
    if (Object.keys(parsedFilters).length > 0) {
        setFilters(prev => {
            const next = { ...prev, ...parsedFilters };
            if (JSON.stringify(prev) === JSON.stringify(next)) return prev;
            return next;
        });
        setDebouncedSearch(prev => prev !== (parsedFilters.search || '') ? (parsedFilters.search || '') : prev);
    }
  }, [initialFiltersString]);

  // Trigger onFilterChange when filters change
  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    const defaultFilters = {
      search: '',
      category: 'All',
      city: '',
      minPrice: '',
      maxPrice: '',
      startDate: '',
      endDate: '',
      sort: 'newest',
    };
    setFilters(defaultFilters);
    setDebouncedSearch('');
  };

  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === 'sort') return false;
    if (key === 'category' && value === 'All') return false;
    return value !== '';
  }).length;

  return (
    <div className="w-full mb-10 relative z-20">
      {/* Main Bar */}
      <div className="bg-[#162333] border border-[#2E4A63] rounded-[24px] p-2 md:p-3 shadow-2xl transition-all duration-300">
        <div className="flex flex-col lg:flex-row items-center gap-3">
          
          {/* Search Input */}
          <div className="relative flex-grow w-full">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#3D5A73] w-5 h-5" />
            <input
              type="text"
              placeholder="Search events..."
              value={debouncedSearch}
              onChange={(e) => setDebouncedSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-[#0F1C2E] border border-[#2E4A63] rounded-2xl text-[#EDF2F7] placeholder-[#3D5A73] focus:outline-none focus:border-[#C9A84C] transition-all text-sm font-medium"
            />
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 w-full lg:w-auto">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl font-bold text-sm transition-all flex-grow lg:flex-grow-0 whitespace-nowrap ${
                isExpanded || activeFiltersCount > 0 
                  ? 'bg-[#C9A84C] text-[#162333]' 
                  : 'bg-[#1A2B3D] text-[#EDF2F7] border border-[#2E4A63]'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {activeFiltersCount > 0 && (
                <span className="ml-1 bg-[#162333] text-[#C9A84C] px-2 py-0.5 rounded-full text-[10px]">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            <div className="relative w-full lg:w-48">
              <ArrowUpDown className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#3D5A73] w-4 h-4" />
              <select
                name="sort"
                value={filters.sort}
                onChange={handleInputChange}
                className="w-full pl-11 pr-4 py-3.5 bg-[#1A2B3D] border border-[#2E4A63] rounded-2xl text-[#EDF2F7] focus:outline-none focus:border-[#C9A84C] transition-all text-sm font-bold appearance-none cursor-pointer"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
                <option value="date_soon">Date: Soonest First</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#3D5A73] w-4 h-4 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Expanded Filters */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-6 pb-2 px-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 border-t border-[#2E4A63] mt-4">
                
                {/* Category */}
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-[#7A94AA] ml-1">Category</label>
                  <div className="relative">
                    <Tag className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#3D5A73] w-4 h-4" />
                    <select
                      name="category"
                      value={filters.category}
                      onChange={handleInputChange}
                      className="w-full pl-11 pr-4 py-3 bg-[#0F1C2E] border border-[#2E4A63] rounded-xl text-[#EDF2F7] focus:outline-none focus:border-[#C9A84C] transition-all text-sm appearance-none"
                    >
                      {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 text-[#3D5A73] w-4 h-4 pointer-events-none" />
                  </div>
                </div>

                {/* City */}
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-[#7A94AA] ml-1">Location</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#3D5A73] w-4 h-4" />
                    <input
                      type="text"
                      name="city"
                      placeholder="Filter by city..."
                      value={filters.city}
                      onChange={handleInputChange}
                      className="w-full pl-11 pr-4 py-3 bg-[#0F1C2E] border border-[#2E4A63] rounded-xl text-[#EDF2F7] placeholder-[#3D5A73] focus:outline-none focus:border-[#C9A84C] transition-all text-sm"
                    />
                  </div>
                </div>

                {/* Price Range */}
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-[#7A94AA] ml-1">Price Range</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      name="minPrice"
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-[#0F1C2E] border border-[#2E4A63] rounded-xl text-[#EDF2F7] placeholder-[#3D5A73] focus:outline-none focus:border-[#C9A84C] transition-all text-sm"
                    />
                    <span className="text-[#3D5A73]">—</span>
                    <input
                      type="number"
                      name="maxPrice"
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-[#0F1C2E] border border-[#2E4A63] rounded-xl text-[#EDF2F7] placeholder-[#3D5A73] focus:outline-none focus:border-[#C9A84C] transition-all text-sm"
                    />
                  </div>
                </div>

                {/* Date Range */}
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase tracking-widest text-[#7A94AA] ml-1">Date Range</label>
                  <div className="flex items-center gap-2">
                    <div className="relative w-full">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#3D5A73] w-3.5 h-3.5" />
                      <input
                        type="date"
                        name="startDate"
                        value={filters.startDate}
                        onChange={handleInputChange}
                        className="w-full pl-9 pr-2 py-3 bg-[#0F1C2E] border border-[#2E4A63] rounded-xl text-[#EDF2F7] focus:outline-none focus:border-[#C9A84C] transition-all text-[11px]"
                      />
                    </div>
                    <span className="text-[#3D5A73]">to</span>
                    <div className="relative w-full">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#3D5A73] w-3.5 h-3.5" />
                      <input
                        type="date"
                        name="endDate"
                        value={filters.endDate}
                        onChange={handleInputChange}
                        className="w-full pl-9 pr-2 py-3 bg-[#0F1C2E] border border-[#2E4A63] rounded-xl text-[#EDF2F7] focus:outline-none focus:border-[#C9A84C] transition-all text-[11px]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Clear Filters Button */}
              <div className="mt-4 flex justify-end">
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-4 py-2 text-[#B8C5D3] hover:text-white border border-[#2E4A63] rounded-xl text-xs font-bold transition-all hover:bg-[#1A2B3D]"
                >
                  <X className="w-3.5 h-3.5" />
                  Clear All Filters
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Results Count */}
      <div className="mt-4 flex items-center justify-between px-2">
        <p className="text-[#5A7A94] text-sm font-medium">
          {totalResults} {totalResults === 1 ? 'event' : 'events'} found
        </p>
        {activeFiltersCount > 0 && !isExpanded && (
            <button 
                onClick={clearFilters}
                className="text-[10px] text-[#C9A84C] font-black uppercase tracking-widest hover:opacity-80 transition-all"
            >
                Reset Filters
            </button>
        )}
      </div>
    </div>
  );
};

export default FilterBar;
