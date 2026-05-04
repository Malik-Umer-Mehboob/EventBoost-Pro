import api from './axios';

export const joinWaitlist = async (eventId: string) => {
  const { data } = await api.post(`/waitlist/join/${eventId}`);
  return data;
};

export const leaveWaitlist = async (eventId: string) => {
  const { data } = await api.delete(`/waitlist/leave/${eventId}`);
  return data;
};

export const getWaitlistPosition = async (eventId: string) => {
  const { data } = await api.get(`/waitlist/position/${eventId}`);
  return data;
};

export const getEventWaitlist = async (eventId: string) => {
  const { data } = await api.get(`/waitlist/${eventId}`);
  return data;
};

export const getMyWaitlist = async () => {
  const { data } = await api.get('/waitlist/my-waitlist');
  return data;
};
