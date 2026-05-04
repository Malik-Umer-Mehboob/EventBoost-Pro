import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import ReviewSummary from './ReviewSummary';
import ReviewForm from './ReviewForm';
import ReviewList from './ReviewList';
import {
  getEventReviews,
  getMyReview,
  submitReview,
  updateReview,
  deleteReview,
  Review,
  ReviewsResponse,
} from '../../api/reviewApi';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';

interface EventReviewsProps {
  eventId: string;
  eventDate: string;
  averageRating: number;
  totalReviews: number;
  hasVerifiedTicket: boolean;
  onRatingUpdate: (avg: number, total: number) => void;
}

const EventReviews: React.FC<EventReviewsProps> = ({
  eventId,
  eventDate,
  averageRating,
  totalReviews,
  hasVerifiedTicket,
  onRatingUpdate,
}) => {
  const { user } = useAuth();
  const [data, setData] = useState<ReviewsResponse | null>(null);
  const [myReview, setMyReview] = useState<Review | null>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const eventPassed = new Date(eventDate) < new Date();
  const canReview = !!user && hasVerifiedTicket && eventPassed;

  const fetchReviews = useCallback(async (p = 1) => {
    try {
      setLoading(true);
      const res = await getEventReviews(eventId, p);
      setData(prev =>
        p === 1 ? res : { ...res, reviews: [...(prev?.reviews ?? []), ...res.reviews] }
      );
    } catch {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  const fetchMyReview = useCallback(async () => {
    if (!user) return;
    try {
      const r = await getMyReview(eventId);
      setMyReview(r);
    } catch { /* silently ignore */ }
  }, [eventId, user]);

  useEffect(() => {
    fetchReviews(1);
    fetchMyReview();
  }, [fetchReviews, fetchMyReview]);

  const handleSubmit = async (rating: number, comment: string) => {
    let saved: Review;
    if (myReview) {
      saved = await updateReview(myReview._id, { rating, comment });
      toast.success('Review updated!');
    } else {
      saved = await submitReview(eventId, { rating, comment });
      toast.success('Review submitted!');
    }
    setMyReview(saved);
    const fresh = await getEventReviews(eventId, 1);
    setData(fresh);
    setPage(1);
    onRatingUpdate(fresh.reviews.length > 0 ? averageRating : 0, fresh.total);
  };

  const handleDelete = async () => {
    if (!myReview) return;
    await deleteReview(myReview._id);
    setMyReview(null);
    toast.success('Review deleted');
    const fresh = await getEventReviews(eventId, 1);
    setData(fresh);
    setPage(1);
  };

  const handleDeleteFromList = async (reviewId: string) => {
    await deleteReview(reviewId);
    toast.success('Review deleted');
    const fresh = await getEventReviews(eventId, 1);
    setData(fresh);
    setPage(1);
  };

  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchReviews(next);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <h2 className="text-2xl font-black tracking-tight text-navy-100">Reviews</h2>
        {totalReviews > 0 && (
          <span
            className="px-3 py-0.5 rounded-full text-xs font-black"
            style={{ background: 'rgba(201,168,76,0.12)', color: '#C9A84C' }}
          >
            {totalReviews}
          </span>
        )}
      </div>

      {/* Rating Summary */}
      {totalReviews > 0 && data?.distribution && (
        <ReviewSummary
          averageRating={averageRating}
          totalReviews={totalReviews}
          distribution={data.distribution}
        />
      )}

      {/* Write a Review */}
      {canReview ? (
        <ReviewForm
          eventId={eventId}
          existingReview={myReview}
          onSubmit={handleSubmit}
          onDelete={myReview ? handleDelete : undefined}
        />
      ) : (
        !user ? (
          <div
            className="p-5 rounded-2xl text-center text-sm font-medium border"
            style={{ borderColor: '#2E4A63', color: '#5A7A94', background: '#1A2B3D' }}
          >
            <a href="/login" className="underline" style={{ color: '#C9A84C' }}>Log in</a>
            {' '}to leave a review once the event has taken place.
          </div>
        ) : !eventPassed ? (
          <div
            className="p-5 rounded-2xl text-center text-sm font-medium border"
            style={{ borderColor: '#2E4A63', color: '#5A7A94', background: '#1A2B3D' }}
          >
            Reviews open after the event has taken place.
          </div>
        ) : !hasVerifiedTicket ? (
          <div
            className="p-5 rounded-2xl text-center text-sm font-medium border"
            style={{ borderColor: '#2E4A63', color: '#5A7A94', background: '#1A2B3D' }}
          >
            Only verified ticket holders can submit reviews.
          </div>
        ) : null
      )}

      {/* Reviews List */}
      <ReviewList
        reviews={data?.reviews ?? []}
        total={data?.total ?? 0}
        page={page}
        pages={data?.pages ?? 1}
        loading={loading}
        onLoadMore={handleLoadMore}
        onDelete={handleDeleteFromList}
      />
    </motion.div>
  );
};

export default EventReviews;
