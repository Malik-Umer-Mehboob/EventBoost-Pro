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
    <div className="space-y-6 mb-12">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search Bar */}
        <div className="relative flex-1 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-navy-500 group-focus-within:text-gold transition-colors w-5 h-5" />
          <input
            type="text"
            placeholder="Search events by title..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pl-12 pr-4 py-4 glass rounded-2xl focus:ring-2 focus:ring-gold/30 transition-all outline-none text-lg text-navy-100 placeholder-navy-500"
          />
        </div>

        {/* Mobile Filter Toggle (Optional) */}
        <button className="md:hidden glass px-6 py-4 rounded-2xl flex items-center justify-between font-black text-navy-200 uppercase tracking-widest text-[10px]">
          <span className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-gold" />
            Filters
          </span>
          <ChevronDown className="w-5 h-5" />
        </button>
      </div>

      {/* Category Pills */}
      <div className="flex flex-wrap gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((cat) => (
          <motion.button
            key={cat}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleCategoryClick(cat)}
            className={`px-8 py-2.5 rounded-full font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap border ${
              activeCategory === cat
                ? 'bg-gold text-navy-900 border-gold shadow-lg shadow-gold/20'
                : 'glass text-navy-400 border-navy-600/50 hover:text-gold hover:border-gold/30'
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
