import React from 'react';
import { motion } from 'framer-motion';
import StarRating from './StarRating';
import { Review } from '../../api/reviewApi';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface ReviewListProps {
  reviews: Review[];
  total: number;
  page: number;
  pages: number;
  loading: boolean;
  onLoadMore: () => void;
  onDelete: (reviewId: string) => Promise<void>;
}

const ReviewList: React.FC<ReviewListProps> = ({
  reviews,
  total,
  page,
  pages,
  loading,
  onLoadMore,
  onDelete,
}) => {
  const { user } = useAuth();

  if (!loading && reviews.length === 0) {
    return (
      <div
        className="text-center py-16 rounded-3xl border-2 border-dashed"
        style={{ borderColor: '#2E4A63', background: '#1A2B3D' }}
      >
        <p className="text-4xl mb-3">⭐</p>
        <p className="font-black" style={{ color: '#EDF2F7' }}>No reviews yet</p>
        <p className="text-sm mt-1" style={{ color: '#5A7A94' }}>
          Be the first to share your experience!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-black text-sm uppercase tracking-widest" style={{ color: '#5A7A94' }}>
          {total} {total === 1 ? 'Review' : 'Reviews'}
        </h3>
      </div>

      {/* Review Cards */}
      <div className="space-y-4">
        {reviews.map((review, i) => {
          const isOwn = user?._id === review.user._id;
          const isAdmin = user?.role === 'admin';
          const initials = review.user.name?.slice(0, 2).toUpperCase() || 'U';
          const date = new Date(review.createdAt).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          });

          return (
            <motion.div
              key={review._id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="p-5 sm:p-6 rounded-3xl"
              style={{
                background: '#1A2B3D',
                border: '0.5px solid #2E4A63',
              }}
            >
              {/* Top row */}
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  {review.user.profilePicture?.url ? (
                    <img
                      src={review.user.profilePicture.url}
                      alt={review.user.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm"
                      style={{ background: '#C9A84C', color: '#162333' }}
                    >
                      {initials}
                    </div>
                  )}
                  <div>
                    <p className="font-black text-sm" style={{ color: '#EDF2F7' }}>
                      {review.user.name}
                    </p>
                    <p className="text-[10px] font-medium" style={{ color: '#3D5A73' }}>
                      {date}
                    </p>
                  </div>
                </div>

                {/* Right side: badge + stars + actions */}
                <div className="flex items-center gap-3 flex-wrap">
                  {review.isVerifiedAttendee && (
                    <span
                      className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest"
                      style={{
                        background: 'rgba(29,158,117,0.12)',
                        color: '#1D9E75',
                        border: '0.5px solid rgba(29,158,117,0.25)',
                      }}
                    >
                      <ShieldCheck className="w-3 h-3" />
                      Verified Attendee
                    </span>
                  )}
                  <StarRating rating={review.rating} size={16} />
                  {(isOwn || isAdmin) && (
                    <button
                      onClick={() => onDelete(review._id)}
                      className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-lg border transition-all"
                      style={{
                        borderColor: '#3D1A1A',
                        color: '#e24b4a',
                        background: 'transparent',
                      }}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>

              {/* Comment */}
              {review.comment && (
                <p
                  className="mt-4 text-sm leading-relaxed"
                  style={{ color: '#B8C5D3' }}
                >
                  {review.comment}
                </p>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Load More */}
      {page < pages && (
        <div className="text-center pt-2">
          <button
            onClick={onLoadMore}
            disabled={loading}
            className="px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-widest border transition-all"
            style={{
              borderColor: '#2E4A63',
              color: '#C9A84C',
              background: 'transparent',
            }}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin inline" />
            ) : (
              `Load More (${total - reviews.length} remaining)`
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewList;
