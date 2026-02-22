import { Toaster } from 'sonner';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import OrganizerDashboard from './pages/OrganizerDashboard';
import AuthSuccess from './pages/AuthSuccess';
import PaymentSuccess from './pages/PaymentSuccess';
import ProtectedRoute from './components/ProtectedRoute';
import CreateEvent from './pages/CreateEvent';
import EditEvent from './pages/EditEvent';
import EventList from './pages/EventList';
import EventDetails from './pages/EventDetails';
import Transactions from './pages/Transactions';
import AdminTransactions from './pages/AdminTransactions';

import AuthLayout from './layouts/AuthLayout';
import MainLayout from './layouts/MainLayout';

const LandingRedirect = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;

  if (!user) return <Navigate to="/login" />;

  const dashboardPath = 
    user.role === 'admin' ? '/admin/dashboard' :
    user.role === 'organizer' ? '/organizer-dashboard' :
    '/user/dashboard';

  return <Navigate to={dashboardPath} />;
};

import { SocketProvider } from './context/SocketContext';

const App = () => {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <Routes>
            {/* Auth Layout Group */}
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/auth-success" element={<AuthSuccess />} />
              <Route path="/payment-success" element={<PaymentSuccess />} />
            </Route>

            {/* Main Layout Group (Authenticated/Discovery) */}
            <Route element={<MainLayout />}>
              <Route path="/events" element={<EventList />} />
              <Route path="/events/:id" element={<EventDetails />} />
              
              <Route path="/" element={<LandingRedirect />} />

              <Route element={<ProtectedRoute />}>
                <Route path="/profile" element={<UserDashboard />} />
                <Route path="/profile/transactions" element={<Transactions />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/transactions" element={<AdminTransactions />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['organizer']} />}>
                <Route path="/organizer-dashboard" element={<OrganizerDashboard />} />
                <Route path="/create-event" element={<CreateEvent />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['user']} />}>
                <Route path="/user/dashboard" element={<UserDashboard />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['admin', 'organizer']} />}>
                <Route path="/edit-event/:id" element={<EditEvent />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
        <Toaster position="top-right" richColors />
      </SocketProvider>
    </AuthProvider>
  );
};

export default App;
