import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut, User, LayoutDashboard, Sparkles, Ticket, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';
import { toast } from 'sonner';
import logo from '../assets/Logo_event.png';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const navLinks = [
    ...(user?.role === 'user' || !user ? [{ name: 'Discover', path: '/events', icon: Sparkles }] : []),
    ...(user?.role === 'user' ? [{ name: 'My Tickets', path: '/user/dashboard', icon: Ticket }] : []),
    ...(user?.role === 'organizer' ? [
        { name: 'My Events', path: '/organizer-dashboard', icon: LayoutDashboard },
        { name: 'Create Event', path: '/create-event', icon: Ticket }
    ] : []),
    ...(user?.role === 'admin' ? [
        { name: 'Manage Events', path: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Users', path: '/admin/users', icon: User }
    ] : []),
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-4 md:px-6">
      <div className="max-w-7xl mx-auto bg-white/95 backdrop-blur-xl rounded-2xl md:rounded-full px-6 py-2.5 flex items-center justify-between shadow-[0_2px_20px_rgb(0,0,0,0.04)] border border-gray-100">
        
        {/* Left Section: Back + Logo */}
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all md:flex"
            title="Go Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>

          <Link to="/" className="flex items-center gap-2 group">
            <motion.img 
              whileHover={{ rotate: 10, scale: 1.05 }}
              src={logo} 
              alt="Logo" 
              className="h-8 w-auto object-contain"
            />
            <span className="text-xl font-bold text-gray-900 tracking-tight hidden sm:block font-sans">
              Event<span className="text-indigo-600">Boost</span>
            </span>
          </Link>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-1.5">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link 
                key={link.path}
                to={link.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm transition-all ${
                  isActive 
                    ? 'bg-indigo-50 text-indigo-700 shadow-sm' 
                    : 'text-gray-600 hover:text-indigo-600 hover:bg-gray-50'
                }`}
              >
                <link.icon className="w-4 h-4" />
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* User Actions */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-semibold text-gray-900 leading-none capitalize">{user.name}</span>
                <span className="mt-1 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-indigo-50 text-indigo-600 border border-indigo-100">
                  {user.role}
                </span>
              </div>
              <NotificationDropdown />
              <div className="h-9 w-9 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-100 text-indigo-600">
                <User className="w-4 h-4" />
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-all"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="px-5 py-2 rounded-full font-medium text-sm text-gray-600 hover:text-indigo-600 hover:bg-gray-50 transition-all">
                Login
              </Link>
              <Link 
                to="/register" 
                className="px-5 py-2 rounded-full font-semibold text-sm bg-indigo-600 text-white hover:bg-indigo-700 transition-all shadow-[0_2px_10px_rgba(79,70,229,0.3)] hover:shadow-[0_4px_14px_rgba(79,70,229,0.4)]"
              >
                Join Free
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
