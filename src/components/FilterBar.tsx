import React, { useState, useEffect, useCallback } from 'react';
import { Search, X, Calendar, MapPin, DollarSign, SortAsc, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FilterBarProps {
  onFilterChange: (filters: any) => void;
  totalResults: number;
}

const CATEGORIES = [
  'All',
  'Music',
  'Tech',
  'Food',
  'Sports',
  'Art',
  'Education',
  'Business',
  'Health',
  'Other',
];

const FilterBar: React.FC<FilterBarProps> = ({ onFilterChange, totalResults }) => {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  // Get initial state from URL
  const getInitialFilters = () => {
    const params = new URLSearchParams(window.location.search);
    return {
      search: params.get('search') || '',
      category: params.get('category') || 'All',
      city: params.get('city') || '',
      minPrice: params.get('minPrice') || '',
      maxPrice: params.get('maxPrice') || '',
      startDate: params.get('startDate') || '',
      endDate: params.get('endDate') || '',
      sort: params.get('sort') || 'newest',
    };
  };

  const [filters, setFilters] = useState(getInitialFilters());
  const [debouncedSearch, setDebouncedSearch] = useState(filters.search);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search);
    }, 500);
    return () => clearTimeout(timer);
  }, [filters.search]);

  // Trigger filter change when filters or debounced search changes
  useEffect(() => {
    const activeFilters = { ...filters, search: debouncedSearch };
    onFilterChange(activeFilters);
  }, [
    debouncedSearch,
    filters.category,
    filters.city,
    filters.minPrice,
    filters.maxPrice,
    filters.startDate,
    filters.endDate,
    filters.sort,
  ]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleClearFilters = () => {
    setFilters({
      search: '',
      category: 'All',
      city: '',
      minPrice: '',
      maxPrice: '',
      startDate: '',
      endDate: '',
      sort: 'newest',
    });
  };

  const FilterInputs = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Category Dropdown */}
      <div className="space-y-1.5">
        <label className="text-[13px] font-medium text-[#7A94AA] ml-1">Category</label>
        <div className="relative group">
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#5A7A94] w-4 h-4 pointer-events-none group-focus-within:text-[#C9A84C] transition-colors" />
          <select
            name="category"
            value={filters.category}
            onChange={handleInputChange}
            className="w-full pl-4 pr-10 py-3 bg-[#0F1C2E] border border-[#2E4A63] rounded-xl text-[#EDF2F7] focus:border-[#C9A84C] outline-none transition-all appearance-none cursor-pointer text-sm"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* City Filter */}
      <div className="space-y-1.5">
        <label className="text-[13px] font-medium text-[#7A94AA] ml-1">Location</label>
        <div className="relative group">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5A7A94] group-focus-within:text-[#C9A84C] transition-colors w-4 h-4" />
          <input
            type="text"
            name="city"
            placeholder="Filter by city..."
            value={filters.city}
            onChange={handleInputChange}
            className="w-full pl-11 pr-4 py-3 bg-[#0F1C2E] border border-[#2E4A63] rounded-xl text-[#EDF2F7] placeholder-[#3D5A73] focus:border-[#C9A84C] outline-none transition-all text-sm"
          />
        </div>
      </div>

      {/* Price Range */}
      <div className="space-y-1.5">
        <label className="text-[13px] font-medium text-[#7A94AA] ml-1">Price Range</label>
        <div className="flex gap-2">
          <div className="relative group flex-1">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5A7A94] group-focus-within:text-[#C9A84C] transition-colors w-3.5 h-3.5" />
            <input
              type="number"
              name="minPrice"
              placeholder="Min"
              value={filters.minPrice}
              onChange={handleInputChange}
              className="w-full pl-8 pr-3 py-3 bg-[#0F1C2E] border border-[#2E4A63] rounded-xl text-[#EDF2F7] placeholder-[#3D5A73] focus:border-[#C9A84C] outline-none transition-all text-sm"
            />
          </div>
          <div className="relative group flex-1">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5A7A94] group-focus-within:text-[#C9A84C] transition-colors w-3.5 h-3.5" />
            <input
              type="number"
              name="maxPrice"
              placeholder="Max"
              value={filters.maxPrice}
              onChange={handleInputChange}
              className="w-full pl-8 pr-3 py-3 bg-[#0F1C2E] border border-[#2E4A63] rounded-xl text-[#EDF2F7] placeholder-[#3D5A73] focus:border-[#C9A84C] outline-none transition-all text-sm"
            />
          </div>
        </div>
      </div>

      {/* Sort By */}
      <div className="space-y-1.5">
        <label className="text-[13px] font-medium text-[#7A94AA] ml-1">Sort By</label>
        <div className="relative group">
          <SortAsc className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5A7A94] group-focus-within:text-[#C9A84C] transition-colors w-4 h-4 pointer-events-none" />
          <select
            name="sort"
            value={filters.sort}
            onChange={handleInputChange}
            className="w-full pl-11 pr-10 py-3 bg-[#0F1C2E] border border-[#2E4A63] rounded-xl text-[#EDF2F7] focus:border-[#C9A84C] outline-none transition-all appearance-none cursor-pointer text-sm"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="price_low">Price: Low to High</option>
            <option value="price_high">Price: High to Low</option>
            <option value="date_soon">Date: Soonest First</option>
          </select>
          <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#5A7A94] w-4 h-4 pointer-events-none" />
        </div>
      </div>

      {/* Date Range */}
      <div className="lg:col-span-2 grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-[#7A94AA] ml-1">Start Date</label>
          <div className="relative group">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5A7A94] group-focus-within:text-[#C9A84C] transition-colors w-4 h-4" />
            <input
              type="date"
              name="startDate"
              value={filters.startDate}
              onChange={handleInputChange}
              className="w-full pl-11 pr-4 py-3 bg-[#0F1C2E] border border-[#2E4A63] rounded-xl text-[#EDF2F7] focus:border-[#C9A84C] outline-none transition-all text-sm [color-scheme:dark]"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-[#7A94AA] ml-1">End Date</label>
          <div className="relative group">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5A7A94] group-focus-within:text-[#C9A84C] transition-colors w-4 h-4" />
            <input
              type="date"
              name="endDate"
              value={filters.endDate}
              onChange={handleInputChange}
              className="w-full pl-11 pr-4 py-3 bg-[#0F1C2E] border border-[#2E4A63] rounded-xl text-[#EDF2F7] focus:border-[#C9A84C] outline-none transition-all text-sm [color-scheme:dark]"
            />
          </div>
        </div>
      </div>

      {/* Results Count & Clear */}
      <div className="lg:col-span-2 flex items-end justify-between gap-4">
        <div className="flex flex-col justify-end pb-1 px-1">
          <span className="text-[#5A7A94] text-sm font-medium">
            {totalResults} {totalResults === 1 ? 'event' : 'events'} found
          </span>
        </div>
        <button
          onClick={handleClearFilters}
          className="flex items-center gap-2 px-6 py-3 bg-transparent border border-[#2E4A63] rounded-xl text-[#B8C5D3] hover:text-[#C9A84C] hover:border-[#C9A84C] transition-all text-sm font-semibold whitespace-nowrap"
        >
          <X className="w-4 h-4" />
          Clear All Filters
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-[#162333] border border-[#2E4A63] rounded-[32px] p-6 mb-10 shadow-xl overflow-hidden">
      <div className="space-y-6">
        {/* Search & Toggle Row */}
        <div className="flex gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#5A7A94] group-focus-within:text-[#C9A84C] transition-colors w-5 h-5" />
            <input
              type="text"
              name="search"
              placeholder="Search events by title or description..."
              value={filters.search}
              onChange={handleInputChange}
              className="w-full pl-14 pr-6 py-4 bg-[#0F1C2E] border border-[#2E4A63] rounded-2xl text-[#EDF2F7] placeholder-[#3D5A73] focus:border-[#C9A84C] outline-none transition-all text-lg"
            />
          </div>

          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="lg:hidden flex items-center gap-2 px-6 bg-[#0F1C2E] border border-[#2E4A63] rounded-2xl text-[#B8C5D3] hover:text-[#C9A84C] transition-all"
          >
            <SlidersHorizontal className="w-5 h-5" />
            <span className="font-semibold">Filters</span>
          </button>
        </div>

        {/* Desktop Filters */}
        <div className="hidden lg:block">
          <FilterInputs />
        </div>

        {/* Mobile Filters */}
        <AnimatePresence>
          {isMobileOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden border-t border-[#2E4A63] pt-6 overflow-hidden"
            >
              <FilterInputs />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default FilterBar;
