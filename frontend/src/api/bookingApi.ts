import axios from './axios';

export const initiateBooking = async (eventId: string, quantity: number) => {
  const response = await axios.post(`/bookings/checkout/${eventId}`, { quantity });
  return response.data;
};

export const getMyBookings = async () => {
  const response = await axios.get('/bookings/my-tickets');
  return response.data;
};

export const getMyTransactions = async () => {
  const response = await axios.get('/bookings/my-transactions');
  return response.data;
};

export const getAllTransactions = async () => {
  const response = await axios.get('/admin/transactions');
  return response.data;
};

export const requestRefund = async (bookingId: string) => {
  const response = await axios.post(`/bookings/${bookingId}/refund`);
  return response.data;
};
