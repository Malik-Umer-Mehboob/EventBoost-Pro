import api from './axios';

export const cancelEventAdmin = async (id: string) => {
  const { data } = await api.put(`/admin/events/${id}/cancel`);
  return data;
};

export const updateEventAdmin = async (id: string, formData: FormData) => {
  const { data } = await api.patch(`/admin/events/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return data;
};

export const deleteEventAdmin = async (id: string) => {
  const { data } = await api.delete(`/admin/events/${id}`);
  return data;
};
