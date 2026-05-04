import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal, ChevronDown } from 'lucide-react';
import { getCategories } from '../../api/eventApi';

interface EventFiltersProps {
  onSearch: (term: string) => void;
  onFilterChange: (category: string) => void;
}

const EventFilters: React.FC<EventFiltersProps> = ({ onSearch, onFilterChange }) => {
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(['All', ...data]);
      } catch (error) {
        console.error('Failed to fetch categories', error);
      }
    };
    fetchCategories();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    onSearch(e.target.value);
  };

  const handleCategoryClick = (cat: string) => {
    setActiveCategory(cat);
    onFilterChange(cat === 'All' ? '' : cat);
  };

  return (
    <div className="space-y-6 mb-8">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Bar */}
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5A7A94] group-focus-within:text-[#C9A84C] transition-colors w-5 h-5" />
          <input
            type="text"
            placeholder="Search events by title..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pl-12 pr-4 py-4 bg-[#162333] border border-[#2E4A63] rounded-2xl focus:border-[#C9A84C] outline-none transition-all text-lg text-[#EDF2F7] placeholder-[#3D5A73]"
          />
        </div>

        {/* Mobile Filter Toggle (Optional) */}
        <button className="md:hidden bg-[#162333] border border-[#2E4A63] px-6 py-4 rounded-2xl flex items-center justify-between font-semibold text-[#B8C5D3]">
          <span className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-[#C9A84C]" />
            Filters
          </span>
          <ChevronDown className="w-5 h-5" />
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((cat) => (
          <motion.button
            key={cat}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleCategoryClick(cat)}
            className={`px-6 py-2 rounded-full font-medium transition-all whitespace-nowrap ${
              activeCategory === cat
                ? 'bg-[#C9A84C] text-[#0F1C2E] shadow-lg'
                : 'bg-[#162333] border border-[#2E4A63] text-[#7A94AA] hover:text-[#C9A84C] hover:border-[#C9A84C]/40'
            }`}
          >
            {cat}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default EventFilters;
