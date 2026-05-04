import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Tag, DollarSign, Users, Sparkles } from 'lucide-react';
import { EventData, getCategories } from '../../api/eventApi';
import ImageUploader from '../common/ImageUploader';

interface EventFormProps {
  initialData?: EventData;
  onSubmit: (data: FormData) => void;
  isLoading: boolean;
}

const EventForm: React.FC<EventFormProps> = ({ initialData, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<Partial<EventData>>(
    initialData || {
      title: '',
      description: '',
      date: '',
      location: '',
      category: '',
      ticketPrice: 0,
      ticketQuantity: 0,
      isFeatured: false,
    }
  );

  const [categories, setCategories] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        console.error('Failed to fetch categories', error);
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData((prev) => ({ ...prev, [name]: finalValue }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== undefined && key !== 'bannerImage') {
        data.append(key, String(value));
      }
    });

    if (selectedFile) {
      data.append('banner', selectedFile);
    }

    onSubmit(data);
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-navy-800/50 p-8 sm:p-10 rounded-[40px] border border-navy-600 shadow-2xl space-y-10 max-w-4xl mx-auto backdrop-blur-md"
      onSubmit={handleSubmit}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Left Column: Basic Info */}
        <div className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-navy-400 uppercase tracking-widest mb-2 pl-1">Event Designation</label>
            <div className="relative group">
              <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 text-navy-500 group-focus-within:text-gold transition-colors w-5 h-5" />
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-4 bg-navy-950 border border-navy-700 rounded-2xl focus:border-gold/30 transition-all outline-none text-navy-100 font-bold placeholder-navy-600 shadow-inner"
                placeholder="e.g. Quantum Tech Summit"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-navy-400 uppercase tracking-widest mb-2 pl-1">Project Abstract</label>
            <textarea
              name="description"
              required
              rows={5}
              value={formData.description}
              onChange={handleChange}
              className="w-full px-5 py-4 bg-navy-950 border border-navy-700 rounded-2xl focus:border-gold/30 transition-all outline-none text-navy-100 font-medium placeholder-navy-600 shadow-inner resize-none"
              placeholder="Detailed operational briefing for attendees..."
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black text-navy-400 uppercase tracking-widest mb-2 pl-1">Sector</label>
              <div className="relative group">
                <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-navy-500 group-focus-within:text-gold transition-colors w-5 h-5" />
                <select
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 bg-navy-950 border border-navy-700 rounded-2xl focus:border-gold/30 transition-all outline-none text-navy-100 font-bold appearance-none cursor-pointer"
                >
                  <option value="" className="bg-navy-900">Select</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat} className="bg-navy-900">{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-navy-400 uppercase tracking-widest mb-2 pl-1">Schedule</label>
              <div className="relative group">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-navy-500 group-focus-within:text-gold transition-colors w-5 h-5" />
                <input
                  type="datetime-local"
                  name="date"
                  required
                  value={formData.date ? new Date(formData.date).toISOString().slice(0, 16) : ''}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 bg-navy-950 border border-navy-700 rounded-2xl focus:border-gold/30 transition-all outline-none text-navy-100 font-bold"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Logistics & Image */}
        <div className="space-y-6">
          <div>
            <label className="block text-[10px] font-black text-navy-400 uppercase tracking-widest mb-2 pl-1">Operational Zone</label>
            <div className="relative group">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-navy-500 group-focus-within:text-gold transition-colors w-5 h-5" />
              <input
                type="text"
                name="location"
                required
                value={formData.location}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-4 bg-navy-950 border border-navy-700 rounded-2xl focus:border-gold/30 transition-all outline-none text-navy-100 font-bold placeholder-navy-600 shadow-inner"
                placeholder="e.g. Orbital Station, L4"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] font-black text-navy-400 uppercase tracking-widest mb-2 pl-1">Unit Valuation ($)</label>
              <div className="relative group">
                <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-navy-500 group-focus-within:text-gold transition-colors w-5 h-5" />
                <input
                  type="number"
                  name="ticketPrice"
                  required
                  min="0"
                  value={formData.ticketPrice}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 bg-navy-950 border border-navy-700 rounded-2xl focus:border-gold/30 transition-all outline-none text-navy-100 font-bold shadow-inner"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-navy-400 uppercase tracking-widest mb-2 pl-1">Capacity</label>
              <div className="relative group">
                <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-navy-500 group-focus-within:text-gold transition-colors w-5 h-5" />
                <input
                  type="number"
                  name="ticketQuantity"
                  required
                  min="1"
                  value={formData.ticketQuantity}
                  onChange={handleChange}
                  className="w-full pl-12 pr-4 py-4 bg-navy-950 border border-navy-700 rounded-2xl focus:border-gold/30 transition-all outline-none text-navy-100 font-bold shadow-inner"
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <ImageUploader 
              label="Visual Identity (Banner)"
              currentImage={initialData?.bannerImage?.url}
              onImageSelect={setSelectedFile}
            />
          </div>

          <div className="flex items-center gap-4 py-4 px-6 bg-navy-950/50 rounded-2xl border border-navy-700">
            <input
              type="checkbox"
              name="isFeatured"
              id="isFeatured"
              checked={formData.isFeatured}
              onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
              className="w-6 h-6 rounded border-navy-700 text-gold focus:ring-gold bg-navy-900 cursor-pointer transition-all"
            />
            <label htmlFor="isFeatured" className="text-[10px] font-black text-navy-300 uppercase tracking-widest cursor-pointer select-none">
              Prioritize in Global Feed (Featured)
            </label>
          </div>
        </div>
      </div>

      <div className="pt-8 border-t border-navy-700">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-5 px-8 rounded-2xl bg-gold text-navy-900 font-black text-sm uppercase tracking-widest shadow-xl shadow-gold/10 hover:bg-[#b8963e] disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed transition-all transform hover:scale-[1.01] active:scale-[0.98]"
        >
          {isLoading ? 'Synchronizing Archive...' : initialData ? 'Authorize Updates' : 'Initialize Event Protocol'}
        </button>
      </div>
    </motion.form>
  );
};

export default EventForm;
