import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { toast } from 'sonner';

const AuthSuccess = () => {
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      const fetchUser = async () => {
        try {
          const { data } = await api.get('/auth/me', {
            headers: { Authorization: `Bearer ${token}` },
          });

          // Call login from context to store user info and token
          login({ ...data, token });

          toast.success('Login Successful 🔥', {
            description: `Welcome back, ${data.name}!`,
          });

          // Redirect based on role
          if (data.role === 'admin') {
            navigate('/admin/dashboard');
          } else if (data.role === 'organizer') {
            navigate('/organizer/dashboard');
          } else {
            navigate('/user/dashboard');
          }
        } catch (error) {
          console.error('Failed to fetch user after Google login:', error);
          navigate('/login');
        }
      };

      fetchUser();
    } else {
      navigate('/login');
    }
  }, [token, login, navigate]);

  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mb-4"></div>
      <p className="text-gray-600 font-medium">Authenticating, please wait...</p>
    </div>
  );
};

export default AuthSuccess;
