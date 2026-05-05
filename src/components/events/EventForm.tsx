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
      endDate: '',
      location: '',
      venue: '',
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

  const inputClass = "w-full pl-10 pr-4 py-3 border border-[#2E4A63] rounded-xl focus:border-[#C9A84C] outline-none transition-all bg-[#0F1C2E] text-[#EDF2F7] placeholder-[#3D5A73] font-medium";
  const labelClass = "block text-xs font-black text-[#B8C5D3] uppercase tracking-widest mb-1 ml-1";
  const iconClass = "absolute left-3 top-1/2 -translate-y-1/2 text-[#5A7A94] w-5 h-5";

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#162333] p-8 sm:p-10 rounded-[32px] border border-[#2E4A63] shadow-[0_8px_30px_rgb(0,0,0,0.3)] space-y-8 max-w-4xl mx-auto"
      onSubmit={handleSubmit}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column: Basic Info */}
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Event Title</label>
            <div className="relative">
              <Sparkles className={iconClass} />
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className={inputClass}
                placeholder="e.g. Summer Music Festival"
              />
            </div>
          </div>

          <div>
            <label className={labelClass}>Description</label>
            <textarea
              name="description"
              required
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-[#2E4A63] rounded-xl focus:border-[#C9A84C] outline-none transition-all bg-[#0F1C2E] text-[#EDF2F7] placeholder-[#3D5A73] font-medium resize-none"
              placeholder="Tell people about your event..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Category</label>
              <div className="relative">
                <Tag className={iconClass} />
                <select
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-[#2E4A63] rounded-xl focus:border-[#C9A84C] outline-none transition-all bg-[#0F1C2E] text-[#EDF2F7] font-medium appearance-none"
                >
                  <option value="">Select</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass}>Start Date & Time</label>
              <div className="relative">
                <Calendar className={iconClass} />
                <input
                  type="datetime-local"
                  name="date"
                  required
                  value={formData.date ? new Date(formData.date).toISOString().slice(0, 16) : ''}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>

            {/* End Date */}
            <div>
              <label style={{ color: '#7A94AA', fontSize: '13px', display: 'block', marginBottom: '6px' }}>
                End Date & Time
              </label>
              <input
                type="datetime-local"
                name="endDate"
                value={formData.endDate ? new Date(formData.endDate).toISOString().slice(0, 16) : ''}
                onChange={handleChange}
                style={{
                  width: '100%',
                  background: '#0F1C2E',
                  border: '1px solid #2E4A63',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  color: '#EDF2F7',
                  fontSize: '13px',
                  outline: 'none',
                }}
                onFocus={e => e.target.style.borderColor = '#C9A84C'}
                onBlur={e => e.target.style.borderColor = '#2E4A63'}
              />
            </div>
          </div>
        </div>

        {/* Right Column: Logistics & Image */}
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Venue / Address</label>
            <div className="relative">
              <MapPin className={iconClass} />
              <input
                type="text"
                name="venue"
                required
                value={formData.venue}
                onChange={handleChange}
                className={inputClass}
                placeholder="e.g. Grand Plaza, NYC"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label style={{ color: '#7A94AA', fontSize: '13px', display: 'block', marginBottom: '6px' }}>
              City / Location
            </label>
            <input
              type="text"
              name="location"
              placeholder="e.g. Karachi, Lahore, Islamabad"
              value={formData.location || ''}
              onChange={handleChange}
              style={{
                width: '100%',
                background: '#0F1C2E',
                border: '1px solid #2E4A63',
                borderRadius: '8px',
                padding: '10px 12px',
                color: '#EDF2F7',
                fontSize: '13px',
                outline: 'none',
              }}
              onFocus={e => e.target.style.borderColor = '#C9A84C'}
              onBlur={e => e.target.style.borderColor = '#2E4A63'}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Ticket Price ($)</label>
              <div className="relative">
                <DollarSign className={iconClass} />
                <input
                  type="number"
                  name="ticketPrice"
                  required
                  min="0"
                  value={formData.ticketPrice}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Total Quantity</label>
              <div className="relative">
                <Users className={iconClass} />
                <input
                  type="number"
                  name="ticketQuantity"
                  required
                  min="1"
                  value={formData.ticketQuantity}
                  onChange={handleChange}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          <ImageUploader
            label="Event Banner"
            currentImage={initialData?.bannerImage?.url}
            onImageSelect={setSelectedFile}
          />

          <div className="flex items-center gap-3 py-2">
            <input
              type="checkbox"
              name="isFeatured"
              id="isFeatured"
              checked={formData.isFeatured}
              onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
              className="w-5 h-5 rounded accent-[#C9A84C] cursor-pointer"
            />
            <label htmlFor="isFeatured" className="text-sm font-medium text-[#B8C5D3] cursor-pointer">
              Mark as Featured Event
            </label>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-[#2E4A63]">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 px-6 rounded-xl bg-[#C9A84C] text-[#0F1C2E] font-bold hover:bg-[#b8963e] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.01] active:scale-[0.99]"
        >
          {isLoading ? 'Saving...' : initialData ? 'Update Event' : 'Create Event'}
        </button>
      </div>
    </motion.form>
  );
};

export default EventForm;
