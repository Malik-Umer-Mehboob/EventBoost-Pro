import api from './axios';

export interface ReviewPayload {
  rating: number;
  comment: string;
}

export interface Review {
  _id: string;
  event: string | { _id: string; title: string; date: string };
  organizer: string;
  user: { _id: string; name: string; profilePicture?: { url: string } };
  rating: number;
  comment: string;
  isVerifiedAttendee: boolean;
  createdAt: string;
}

export interface ReviewsResponse {
  reviews: Review[];
  total: number;
  page: number;
  pages: number;
  distribution: { 1: number; 2: number; 3: number; 4: number; 5: number };
}

export const submitReview = async (eventId: string, payload: ReviewPayload): Promise<Review> => {
  const { data } = await api.post(`/reviews/${eventId}`, payload);
  return data;
};

export const getEventReviews = async (eventId: string, page = 1, limit = 5): Promise<ReviewsResponse> => {
  const { data } = await api.get(`/reviews/event/${eventId}`, { params: { page, limit } });
  return data;
};

export const getOrganizerReviews = async (organizerId: string, limit = 5) => {
  const { data } = await api.get(`/reviews/organizer/${organizerId}`, { params: { limit } });
  return data;
};

export const getMyReview = async (eventId: string): Promise<Review | null> => {
  const { data } = await api.get(`/reviews/my-review/${eventId}`);
  return data;
};

export const updateReview = async (reviewId: string, payload: ReviewPayload): Promise<Review> => {
  const { data } = await api.put(`/reviews/${reviewId}`, payload);
  return data;
};

export const deleteReview = async (reviewId: string): Promise<void> => {
  await api.delete(`/reviews/${reviewId}`);
};
