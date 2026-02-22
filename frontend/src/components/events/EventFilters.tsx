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
        console.error('Failed to fetch categories');
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
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-600 transition-colors w-5 h-5" />
          <input
            type="text"
            placeholder="Search events by title..."
            value={searchTerm}
            onChange={handleSearch}
            className="w-full pl-12 pr-4 py-4 glass rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none text-lg"
          />
        </div>

        {/* Mobile Filter Toggle (Optional) */}
        <button className="md:hidden glass px-6 py-4 rounded-2xl flex items-center justify-between font-semibold text-gray-700">
          <span className="flex items-center gap-2">
            <SlidersHorizontal className="w-5 h-5 text-indigo-600" />
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
                ? 'gradient-primary text-white shadow-lg shadow-indigo-200'
                : 'glass text-gray-600 hover:text-indigo-600'
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
