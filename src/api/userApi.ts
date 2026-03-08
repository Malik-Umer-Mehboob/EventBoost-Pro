import api from './axios';

export const updateProfilePicture = async (formData: FormData) => {
  const { data } = await api.post('/users/profile/picture', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return data;
};

export const getUserProfile = async () => {
  const { data } = await api.get('/users/profile');
  return data;
};
