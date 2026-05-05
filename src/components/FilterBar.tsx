import React, { useState, useEffect } from 'react';
import { Search, X, Calendar, SortAsc, SlidersHorizontal, ChevronDown } from 'lucide-react';
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

// Pakistan cities list
const PAKISTAN_CITIES = [
  'Karachi', 'Lahore', 'Islamabad', 'Rawalpindi', 'Faisalabad',
  'Multan', 'Peshawar', 'Quetta', 'Sialkot', 'Gujranwala',
  'Hyderabad', 'Abbottabad', 'Bahawalpur', 'Sargodha', 'Sukkur',
  'Larkana', 'Sheikhupura', 'Rahim Yar Khan', 'Jhang', 'Gujrat',
  'Mardan', 'Kasur', 'Dera Ghazi Khan', 'Nawabshah', 'Sahiwal',
  'Mirpur Khas', 'Okara', 'Mingora', 'Chiniot', 'Turbat'
];

// Quick price options
const PRICE_PRESETS = [
  { label: 'Free', min: '0', max: '0' },
  { label: 'Under 500', min: '0', max: '500' },
  { label: '500 – 1,000', min: '500', max: '1000' },
  { label: '1,000 – 2,000', min: '1000', max: '2000' },
  { label: '2,000 – 5,000', min: '2000', max: '5000' },
  { label: '5,000+', min: '5000', max: '' },
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
  
  // Separate display state (what user types) from actual filter state (what gets sent to API)
  const [inputValues, setInputValues] = useState({
    search: filters.search,
    city: filters.city,
    minPrice: filters.minPrice,
    maxPrice: filters.maxPrice,
  });

  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [filteredCities, setFilteredCities] = useState(PAKISTAN_CITIES);

  // Debounce — wait 600ms after user stops typing, THEN update filters
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters(prev => ({
        ...prev,
        search: inputValues.search,
        city: inputValues.city,
        minPrice: inputValues.minPrice,
        maxPrice: inputValues.maxPrice,
      }));
    }, 600);

    return () => clearTimeout(timer);
  }, [inputValues.search, inputValues.city, inputValues.minPrice, inputValues.maxPrice]);

  // Trigger filter change when filters state changes
  useEffect(() => {
    onFilterChange(filters);
  }, [filters]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleClearFilters = () => {
    setInputValues({ search: '', city: '', minPrice: '', maxPrice: '' });
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

      {/* Location with dropdown */}
      <div style={{ position: 'relative' }}>
        <label style={{ color: '#7A94AA', fontSize: '12px', display: 'block', marginBottom: '6px' }}>
          Location
        </label>
        <input
          type="text"
          placeholder="Search city..."
          value={inputValues.city}
          onChange={(e) => {
            const val = e.target.value;
            setInputValues(prev => ({ ...prev, city: val }));
            setFilteredCities(
              PAKISTAN_CITIES.filter(c => c.toLowerCase().includes(val.toLowerCase()))
            );
            setCityDropdownOpen(true);
          }}
          onFocus={() => {
            setFilteredCities(PAKISTAN_CITIES);
            setCityDropdownOpen(true);
          }}
          onBlur={() => setTimeout(() => setCityDropdownOpen(false), 200)}
          style={{
            width: '100%',
            background: '#0F1C2E',
            border: '1px solid #2E4A63',
            borderRadius: '7px',
            padding: '8px 12px',
            color: '#EDF2F7',
            fontSize: '13px',
            outline: 'none',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#C9A84C'}
          onMouseLeave={e => e.currentTarget.style.borderColor = inputValues.city ? '#C9A84C' : '#2E4A63'}
        />

        {/* Dropdown list */}
        {cityDropdownOpen && filteredCities.length > 0 && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: '#1A2B3D',
            border: '1px solid #2E4A63',
            borderRadius: '8px',
            marginTop: '4px',
            maxHeight: '200px',
            overflowY: 'auto',
            zIndex: 999,
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
          }}>
            {/* Clear option */}
            <div
              onMouseDown={() => {
                setInputValues(prev => ({ ...prev, city: '' }));
                setFilters(prev => ({ ...prev, city: '' }));
                setCityDropdownOpen(false);
              }}
              style={{
                padding: '8px 12px',
                fontSize: '12px',
                color: '#5A7A94',
                cursor: 'pointer',
                borderBottom: '1px solid #2E4A63',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,168,76,0.05)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              All Cities
            </div>

            {filteredCities.map((city) => (
              <div
                key={city}
                onMouseDown={() => {
                  setInputValues(prev => ({ ...prev, city }));
                  setFilters(prev => ({ ...prev, city }));
                  setCityDropdownOpen(false);
                }}
                style={{
                  padding: '8px 12px',
                  fontSize: '13px',
                  color: '#B8C5D3',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(201,168,76,0.08)';
                  e.currentTarget.style.color = '#C9A84C';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = '#B8C5D3';
                }}
              >
                📍 {city}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Price Range */}
      <div>
        <label style={{ color: '#7A94AA', fontSize: '12px', display: 'block', marginBottom: '6px' }}>
          Price Range (PKR)
        </label>

        {/* Quick preset buttons */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
          {PRICE_PRESETS.map((preset) => {
            const isActive = inputValues.minPrice === preset.min && inputValues.maxPrice === preset.max;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  setInputValues(prev => ({ ...prev, minPrice: preset.min, maxPrice: preset.max }));
                  setFilters(prev => ({ ...prev, minPrice: preset.min, maxPrice: preset.max }));
                }}
                style={{
                  padding: '4px 10px',
                  fontSize: '11px',
                  borderRadius: '20px',
                  border: isActive ? '1px solid #C9A84C' : '1px solid #2E4A63',
                  background: isActive ? 'rgba(201,168,76,0.12)' : 'transparent',
                  color: isActive ? '#C9A84C' : '#7A94AA',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {/* Manual min/max inputs */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            type="number"
            min="0"
            placeholder="Min"
            value={inputValues.minPrice}
            onChange={(e) => setInputValues(prev => ({ ...prev, minPrice: e.target.value }))}
            style={{
              width: '100%',
              background: '#0F1C2E',
              border: '1px solid #2E4A63',
              borderRadius: '7px',
              padding: '8px 12px',
              color: '#EDF2F7',
              fontSize: '13px',
              outline: 'none',
            }}
            onFocus={e => e.target.style.borderColor = '#C9A84C'}
            onBlur={e => e.target.style.borderColor = '#2E4A63'}
          />
          <span style={{ color: '#5A7A94', flexShrink: 0 }}>—</span>
          <input
            type="number"
            min="0"
            placeholder="Max"
            value={inputValues.maxPrice}
            onChange={(e) => setInputValues(prev => ({ ...prev, maxPrice: e.target.value }))}
            style={{
              width: '100%',
              background: '#0F1C2E',
              border: '1px solid #2E4A63',
              borderRadius: '7px',
              padding: '8px 12px',
              color: '#EDF2F7',
              fontSize: '13px',
              outline: 'none',
            }}
            onFocus={e => e.target.style.borderColor = '#C9A84C'}
            onBlur={e => e.target.style.borderColor = '#2E4A63'}
          />
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
              value={inputValues.search}
              onChange={(e) => setInputValues(prev => ({ ...prev, search: e.target.value }))}
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
