import React from 'react';
import StarRating from './StarRating';
import { MessageSquare } from 'lucide-react';

interface ReviewSummaryProps {
  averageRating: number;
  totalReviews: number;
  distribution: { [key: number]: number };
}

const ReviewSummary: React.FC<ReviewSummaryProps> = ({
  averageRating,
  totalReviews,
  distribution,
}) => {
  const getPercent = (count: number) =>
    totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;

  return (
    <div className="bg-[#1A2B3D] border border-[#2E4A63] rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row gap-8 items-center sm:items-start">
      {/* Big Rating Number */}
      <div className="flex flex-col items-center justify-center min-w-[140px]">
        <span
          className="text-7xl font-black leading-none"
          style={{ color: '#EDF2F7' }}
        >
          {totalReviews > 0 ? averageRating.toFixed(1) : '—'}
        </span>
        <div className="mt-3">
          <StarRating rating={averageRating} size={22} />
        </div>
        <p className="mt-2 text-sm font-medium" style={{ color: '#5A7A94' }}>
          <MessageSquare className="inline w-3.5 h-3.5 mr-1 mb-0.5" />
          {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}
        </p>
      </div>

      {/* Divider */}
      <div className="hidden sm:block w-px bg-[#2E4A63] self-stretch" />

      {/* Rating Breakdown */}
      <div className="flex-1 space-y-2 w-full">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = distribution?.[star] ?? 0;
          const pct = getPercent(count);
          return (
            <div key={star} className="flex items-center gap-3">
              <span
                className="text-xs font-black w-5 text-right shrink-0"
                style={{ color: '#C9A84C' }}
              >
                {star}
              </span>
              <div
                className="flex-1 h-2 rounded-full overflow-hidden"
                style={{ background: '#2E4A63' }}
              >
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${pct}%`,
                    background: '#C9A84C',
                  }}
                />
              </div>
              <span
                className="text-xs font-bold w-8 text-right shrink-0"
                style={{ color: '#5A7A94' }}
              >
                {pct}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ReviewSummary;
