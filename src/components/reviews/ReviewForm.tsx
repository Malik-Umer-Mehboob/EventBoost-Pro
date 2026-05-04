import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import StarRating from './StarRating';
import { Loader2, Send } from 'lucide-react';
import { Review } from '../../api/reviewApi';

interface ReviewFormProps {
  eventId: string;
  existingReview?: Review | null;
  onSubmit: (rating: number, comment: string) => Promise<void>;
  onDelete?: () => Promise<void>;
}

const MAX_CHARS = 500;

const ReviewForm: React.FC<ReviewFormProps> = ({
  existingReview,
  onSubmit,
  onDelete,
}) => {
  const [rating, setRating] = useState(existingReview?.rating ?? 0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState(existingReview?.comment ?? '');
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(!existingReview);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (rating === 0) {
      setError('Please select a star rating.');
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(rating, comment);
      setIsEditing(false);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete) return;
    setDeleting(true);
    try {
      await onDelete();
    } catch {
      setError('Failed to delete review.');
    } finally {
      setDeleting(false);
    }
  };

  const LABEL = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

  if (existingReview && !isEditing) {
    return (
      <div className="bg-[#1A2B3D] border border-[#2E4A63] rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest mb-2" style={{ color: '#5A7A94' }}>
              Your Review
            </p>
            <StarRating rating={existingReview.rating} size={20} />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border transition-all"
              style={{ borderColor: '#2E4A63', color: '#C9A84C', background: 'transparent' }}
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border transition-all"
              style={{ borderColor: '#3D1A1A', color: '#e24b4a', background: 'transparent' }}
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
            </button>
          </div>
        </div>
        {existingReview.comment && (
          <p className="text-sm leading-relaxed" style={{ color: '#B8C5D3' }}>
            {existingReview.comment}
          </p>
        )}
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#1A2B3D] border border-[#2E4A63] rounded-3xl p-6 sm:p-8 space-y-6"
      >
        <div>
          <h3 className="text-lg font-black tracking-tight mb-1" style={{ color: '#EDF2F7' }}>
            {existingReview ? 'Edit Your Review' : 'Write a Review'}
          </h3>
          <p className="text-xs font-medium" style={{ color: '#5A7A94' }}>
            Share your experience to help others discover great events
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Star Selector */}
          <div className="flex flex-col gap-2">
            <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: '#5A7A94' }}>
              Your Rating
            </p>
            <div className="flex items-center gap-4">
              <StarRating
                rating={rating}
                size={32}
                interactive
                onRate={setRating}
                hoveredRating={hoveredRating}
                onHover={setHoveredRating}
                onLeave={() => setHoveredRating(0)}
              />
              {(hoveredRating || rating) ? (
                <span className="text-sm font-black" style={{ color: '#C9A84C' }}>
                  {LABEL[hoveredRating || rating]}
                </span>
              ) : null}
            </div>
          </div>

          {/* Comment */}
          <div className="flex flex-col gap-2">
            <label
              className="text-[10px] font-black uppercase tracking-widest"
              style={{ color: '#5A7A94' }}
            >
              Comment <span className="normal-case font-medium">(optional)</span>
            </label>
            <div className="relative">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value.slice(0, MAX_CHARS))}
                rows={4}
                placeholder="Tell others what you thought about this event..."
                className="w-full px-4 py-3 rounded-2xl text-sm resize-none outline-none transition-all"
                style={{
                  background: '#0F1C2E',
                  border: `1px solid ${comment ? '#C9A84C' : '#2E4A63'}`,
                  color: '#EDF2F7',
                }}
              />
              <span
                className="absolute bottom-3 right-4 text-[10px] font-bold"
                style={{ color: comment.length > 450 ? '#e24b4a' : '#3D5A73' }}
              >
                {comment.length}/{MAX_CHARS}
              </span>
            </div>
          </div>

          {error && (
            <p className="text-xs font-bold" style={{ color: '#e24b4a' }}>
              {error}
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg"
              style={{
                background: '#C9A84C',
                color: '#162333',
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {existingReview ? 'Update Review' : 'Submit Review'}
            </button>
            {existingReview && (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest border transition-all"
                style={{ borderColor: '#2E4A63', color: '#5A7A94' }}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </motion.div>
    </AnimatePresence>
  );
};

export default ReviewForm;
