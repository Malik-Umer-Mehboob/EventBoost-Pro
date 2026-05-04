import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Loader2, Star, Users, Calendar, ArrowLeft, ShieldCheck } from 'lucide-react';
import api from '../api/axios';
import { getOrganizerReviews, Review } from '../api/reviewApi';
import StarRating from '../components/reviews/StarRating';

interface OrganizerInfo {
  _id: string;
  name: string;
  email: string;
  profilePicture?: { url: string };
  averageRating: number;
  totalReviews: number;
}

const OrganizerProfile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [organizer, setOrganizer] = useState<OrganizerInfo | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [totalReviews, setTotalReviews] = useState(0);
  const [eventsCount, setEventsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchAll = async () => {
      try {
        setLoading(true);
        const [userRes, reviewsRes, eventsRes] = await Promise.allSettled([
          api.get(`/users/public/${id}`),
          getOrganizerReviews(id, 5),
          api.get(`/events?organizer=${id}&limit=1`),
        ]);

        if (userRes.status === 'fulfilled') setOrganizer(userRes.value.data);
        if (reviewsRes.status === 'fulfilled') {
          setReviews(reviewsRes.value.reviews);
          setTotalReviews(reviewsRes.value.total);
        }
        if (eventsRes.status === 'fulfilled') {
          setEventsCount(eventsRes.value.data?.total ?? eventsRes.value.data?.length ?? 0);
        }
      } catch (err) {
        console.error('Failed to load organizer profile', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center pt-24">
        <Loader2 className="w-12 h-12 text-gold animate-spin" />
      </div>
    );
  }

  if (!organizer) {
    return (
      <div className="min-h-screen bg-navy-900 flex items-center justify-center pt-24">
        <p className="text-navy-400 font-bold">Organizer not found.</p>
      </div>
    );
  }

  const initials = organizer.name?.slice(0, 2).toUpperCase() || 'OR';

  return (
    <div className="min-h-screen bg-navy-900 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Back */}
        <Link
          to="/events"
          className="flex items-center gap-2 text-navy-400 hover:text-gold transition-colors font-black uppercase text-xs tracking-widest"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Events
        </Link>

        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-navy-700 p-8 sm:p-10 rounded-[40px] border border-navy-600 shadow-xl shadow-black/20"
        >
          <div className="flex flex-col sm:flex-row items-center gap-8">
            {/* Avatar */}
            {organizer.profilePicture?.url ? (
              <img
                src={organizer.profilePicture.url}
                alt={organizer.name}
                className="w-28 h-28 rounded-full object-cover border-4 border-navy-900 shadow-2xl"
              />
            ) : (
              <div
                className="w-28 h-28 rounded-full flex items-center justify-center text-4xl font-black shadow-2xl border-4 border-navy-900"
                style={{ background: '#C9A84C', color: '#162333' }}
              >
                {initials}
              </div>
            )}

            <div className="flex-1 text-center sm:text-left space-y-3">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: '#5A7A94' }}>
                  Event Organizer
                </p>
                <h1 className="text-4xl font-black text-navy-100 tracking-tight">{organizer.name}</h1>
              </div>

              {/* Stats Row */}
              <div className="flex flex-wrap justify-center sm:justify-start gap-4 pt-3">
                {/* Rating */}
                <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border"
                  style={{ background: 'rgba(201,168,76,0.08)', borderColor: 'rgba(201,168,76,0.2)' }}>
                  <Star className="w-4 h-4" style={{ fill: '#C9A84C', color: '#C9A84C' }} />
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest leading-none mb-0.5" style={{ color: '#5A7A94' }}>Rating</p>
                    <p className="text-lg font-black leading-none" style={{ color: '#C9A84C' }}>
                      {totalReviews > 0 ? (organizer.averageRating ?? 0).toFixed(1) : '—'}
                    </p>
                  </div>
                </div>

                {/* Reviews */}
                <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border border-navy-600 bg-navy-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest leading-none mb-0.5 text-navy-500">Reviews</p>
                    <p className="text-lg font-black text-navy-100 leading-none">{totalReviews}</p>
                  </div>
                </div>

                {/* Events */}
                {eventsCount > 0 && (
                  <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl border border-navy-600 bg-navy-800">
                    <Calendar className="w-4 h-4 text-gold" />
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest leading-none mb-0.5 text-navy-500">Events</p>
                      <p className="text-lg font-black text-navy-100 leading-none">{eventsCount}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Stars */}
              {totalReviews > 0 && (
                <div className="flex items-center gap-3 justify-center sm:justify-start">
                  <StarRating rating={organizer.averageRating ?? 0} size={20} />
                  <span className="text-sm font-medium" style={{ color: '#5A7A94' }}>
                    Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Recent Reviews */}
        <div className="space-y-6">
          <h2 className="text-2xl font-black tracking-tight text-navy-100">
            Recent Reviews
            {totalReviews > 0 && (
              <span
                className="ml-3 px-3 py-0.5 rounded-full text-xs font-black"
                style={{ background: 'rgba(201,168,76,0.12)', color: '#C9A84C' }}
              >
                {totalReviews}
              </span>
            )}
          </h2>

          {reviews.length === 0 ? (
            <div
              className="text-center py-16 rounded-3xl border-2 border-dashed"
              style={{ borderColor: '#2E4A63', background: '#1A2B3D' }}
            >
              <p className="text-4xl mb-3">⭐</p>
              <p className="font-black text-navy-100">No reviews yet</p>
              <p className="text-sm mt-1" style={{ color: '#5A7A94' }}>
                Reviews from verified attendees will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review, i) => {
                const name = review.user.name;
                const initials = name?.slice(0, 2).toUpperCase() || 'U';
                const eventObj = typeof review.event === 'object' ? review.event : null;
                const date = new Date(review.createdAt).toLocaleDateString(undefined, {
                  year: 'numeric', month: 'short', day: 'numeric'
                });

                return (
                  <motion.div
                    key={review._id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="p-6 rounded-3xl space-y-4"
                    style={{ background: '#1A2B3D', border: '0.5px solid #2E4A63' }}
                  >
                    {/* Event link */}
                    {eventObj && (
                      <Link
                        to={`/events/${eventObj._id}`}
                        className="block text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl w-fit"
                        style={{ background: 'rgba(201,168,76,0.1)', color: '#C9A84C' }}
                      >
                        {eventObj.title}
                      </Link>
                    )}

                    {/* Reviewer */}
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-3">
                        {review.user.profilePicture?.url ? (
                          <img
                            src={review.user.profilePicture.url}
                            alt={name}
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
                          <p className="font-black text-sm" style={{ color: '#EDF2F7' }}>{name}</p>
                          <p className="text-[10px] font-medium" style={{ color: '#3D5A73' }}>{date}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
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
                      </div>
                    </div>

                    {review.comment && (
                      <p className="text-sm leading-relaxed" style={{ color: '#B8C5D3' }}>
                        {review.comment}
                      </p>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrganizerProfile;
