import api from './axios';

export const cancelEventAdmin = async (id: string) => {
  const { data } = await api.put(`/admin/events/${id}/cancel`);
  return data;
};
