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
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto glass rounded-2xl md:rounded-full px-8 py-3 flex items-center justify-between shadow-2xl border border-white/30">
        
        {/* Left Section: Back + Logo */}
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigate(-1)}
            className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50/50 rounded-full transition-all md:flex"
            title="Go Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>

          <Link to="/" className="flex items-center gap-3 group">
            <motion.img 
              whileHover={{ rotate: 10, scale: 1.1 }}
              src={logo} 
              alt="Logo" 
              className="h-10 w-auto object-contain"
            />
            <span className="text-xl font-black text-gray-900 tracking-tight hidden sm:block">
              Event<span className="text-indigo-600">Boost</span>
            </span>
          </Link>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-2">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link 
                key={link.path}
                to={link.path}
                className={`flex items-center gap-2 px-5 py-2 rounded-full font-bold text-sm transition-all ${
                  isActive 
                    ? 'gradient-primary text-white shadow-lg shadow-indigo-100' 
                    : 'text-gray-500 hover:text-indigo-600 hover:bg-indigo-50/50'
                }`}
              >
                <link.icon className="w-4 h-4" />
                {link.name}
              </Link>
            );
          })}
        </div>

        {/* User Actions */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-xs font-black text-gray-900 leading-none capitalize">{user.name}</span>
                <span className="mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-indigo-100 text-indigo-700 border border-indigo-200">
                  {user.role}
                </span>
              </div>
              <NotificationDropdown />
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center border-2 border-white shadow-md">
                <User className="w-5 h-5 text-indigo-600" />
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-full transition-all"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="px-6 py-2 rounded-full font-bold text-sm text-gray-600 hover:text-indigo-600 transition-all">
                Login
              </Link>
              <Link 
                to="/register" 
                className="px-6 py-2 rounded-full font-bold text-sm bg-gray-900 text-white hover:bg-gray-800 transition-all shadow-lg"
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
