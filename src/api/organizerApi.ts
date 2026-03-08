import api from './axios';

export const getOrganizerProfile = async () => {
  const { data } = await api.get('/organizers/profile');
  return data;
};

export const updateOrganizerProfile = async (name: string) => {
  const { data } = await api.patch('/organizers/profile', { name });
  return data;
};
