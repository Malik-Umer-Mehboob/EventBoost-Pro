export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'organizer' | 'user';
  token: string;
  profilePicture?: {
    url: string;
    public_id?: string;
  };
}

export interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  category: string;
  ticketPrice: number;
  ticketQuantity: number;
  bannerImage?: {
    url: string;
    public_id?: string;
  };
  isFeatured?: boolean;
  soldTickets?: number;
  organizer?: {
    _id: string;
    name: string;
  };
  createdBy?: {
    _id: string;
    name: string;
  };
  attendees?: string[];
  status?: 'active' | 'cancelled' | 'resubmitted';
  averageRating?: number;
  totalReviews?: number;
}

export interface Booking {
  _id: string;
  event: Event;
  user: string | User;
  quantity: number;
  totalAmount: number;
  paymentStatus: 'paid' | 'pending' | 'failed' | 'refunded' | 'cancelled';
  refundStatus: 'none' | 'pending' | 'completed' | 'failed' | 'refunded';
  qrCode?: string;
  stripeSessionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  _id: string;
  booking: string | Booking;
  user: string | User;
  event?: {
    _id: string;
    title: string;
  };
  amount: number;
  currency?: string;
  type: 'payment' | 'refund';
  status: 'completed' | 'pending' | 'failed' | 'succeeded';
  stripePaymentIntentId?: string;
  createdAt: string;
}

export interface AxiosErrorData {
  message?: string;
}

export interface AxiosErrorResponse {
  response?: {
    data: AxiosErrorData | Blob;
  };
}

export type ChartData = Record<string, string | number>;

export interface Attendee {
  bookingId: string;
  name: string;
  email: string;
  tickets: number;
  totalPaid: number;
  bookedAt: string;
}

export interface OrgStats {
  totalEvents: number;
  totalSold: number;
  totalRevenue: number;
  upcomingEvents: number;
}

export interface AdminStats {
  users: number;
  organizers: number;
  events: number;
  revenue: number;
  ticketsSold: number;
}

export interface RecentBooking {
  _id: string;
  user: { name: string; email: string };
  event: { title: string; date: string };
  quantity: number;
  totalAmount: number;
  createdAt: string;
}
