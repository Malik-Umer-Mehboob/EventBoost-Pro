import api from './axios';

export interface EventData {
  _id?: string;
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
}

export const getCategories = async () => {
  const { data } = await api.get('/events/categories');
  return data;
};

export const createEvent = async (eventData: EventData | FormData) => {
  const { data } = await api.post('/events', eventData, {
    headers: eventData instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {}
  });
  return data;
};

export const getMyEvents = async () => {
  const { data } = await api.get('/events/my-events');
  return data;
};

export const getAllEvents = async () => {
  const { data } = await api.get('/events');
  return data;
};

export const getEventById = async (id: string) => {
  const { data } = await api.get(`/events/${id}`);
  return data;
};

export const getPublicEvents = async () => {
  const { data } = await api.get('/events/public');
  return data;
};

export const updateEvent = async (id: string, eventData: Partial<EventData> | FormData) => {
  const { data } = await api.put(`/events/${id}`, eventData, {
    headers: eventData instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {}
  });
  return data;
};

export const deleteEvent = async (id: string) => {
  const { data } = await api.delete(`/events/${id}`);
  return data;
};

export const registerForEvent = async (id: string) => {
  const { data } = await api.post(`/events/${id}/register`);
  return data;
};
