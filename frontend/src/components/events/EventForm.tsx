import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Upload, X, Calendar, MapPin, Tag, DollarSign, Users, Sparkles } from 'lucide-react';
import { EventData, getCategories } from '../../api/eventApi';

interface EventFormProps {
  initialData?: EventData;
  onSubmit: (data: any) => void;
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
  const [preview, setPreview] = useState<string | null>(initialData?.bannerImage?.url || null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (error) {
        console.error('Failed to fetch categories');
      }
    };
    fetchCategories();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const finalValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    setFormData((prev) => ({ ...prev, [name]: finalValue }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        // In a real app, you'd upload this to Cloudinary here or on submit
        // For simplicity, we'll pass the base64 for now
        setFormData((prev) => ({ ...prev, bannerImage: { url: reader.result as string } }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass p-8 rounded-2xl space-y-6 max-w-4xl mx-auto"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(formData);
      }}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column: Basic Info */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
            <div className="relative">
              <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                placeholder="e.g. Summer Music Festival"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              required
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
              placeholder="Tell people about your event..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  name="category"
                  required
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none bg-white appearance-none"
                >
                  <option value="">Select</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="datetime-local"
                  name="date"
                  required
                  value={formData.date ? new Date(formData.date).toISOString().slice(0, 16) : ''}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Logistics & Image */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                name="location"
                required
                value={formData.location}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                placeholder="e.g. Grand Plaza, NYC"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ticket Price ($)</label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="number"
                  name="ticketPrice"
                  required
                  min="0"
                  value={formData.ticketPrice}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Quantity</label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="number"
                  name="ticketQuantity"
                  required
                  min="1"
                  value={formData.ticketQuantity}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 transition-all outline-none"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Banner Image</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-xl hover:border-indigo-500 transition-colors relative overflow-hidden group">
              {preview ? (
                <div className="relative w-full h-40">
                  <img src={preview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                  <button
                    type="button"
                    onClick={() => setPreview(null)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                      <span>Upload a file</span>
                      <input type="file" className="sr-only" accept="image/*" onChange={handleImageChange} />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 py-2">
            <input
              type="checkbox"
              name="isFeatured"
              id="isFeatured"
              checked={formData.isFeatured}
              onChange={(e) => setFormData(prev => ({ ...prev, isFeatured: e.target.checked }))}
              className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
            <label htmlFor="isFeatured" className="text-sm font-medium text-gray-700 cursor-pointer">
              Mark as Featured Event
            </label>
          </div>
        </div>
      </div>

      <div className="pt-6 border-t border-gray-100">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-4 px-6 rounded-xl text-white font-bold gradient-primary gradient-hover shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.01] active:scale-[0.99]"
        >
          {isLoading ? 'Saving...' : initialData ? 'Update Event' : 'Create Event'}
        </button>
      </div>
    </motion.form>
  );
};

export default EventForm;
