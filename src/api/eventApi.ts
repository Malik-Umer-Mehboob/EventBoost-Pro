import api from './axios';
import { Event } from '../types';

export type EventData = Event;

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

export const getAllEvents = async (params = {}) => {
  const { data } = await api.get('/events', { params });
  return data;
};

export const getEventById = async (id: string) => {
  const { data } = await api.get(`/events/${id}`);
  return data;
};

export const getPublicEvents = async (params = {}) => {
  const { data } = await api.get('/events/public', { params });
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

export const cancelEvent = async (id: string) => {
  const { data } = await api.patch(`/events/${id}/cancel`);
  return data;
};

export const approveEvent = async (id: string) => {
  const { data } = await api.patch(`/admin/events/${id}/approve`);
  return data;
};
