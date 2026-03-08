import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

api.interceptors.request.use(
  (config) => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.token) {
        config.headers.Authorization = `Bearer ${user.token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong. Please try again.';
    
    // Global error toast
    import('sonner').then(({ toast }) => {
        toast.error('API Error', {
            description: message,
        });
    });

    if (error.response?.status === 401) {
      // Potentially clear local storage and redirect to login
      // However, we should be careful about infinite loops if we redirect on a failed /me call
      // localStorage.removeItem('user');
      // window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;
