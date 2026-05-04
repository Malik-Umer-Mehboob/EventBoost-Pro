import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut, User, LayoutDashboard, Sparkles, Ticket, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';
import { toast } from 'sonner';
import Logo from './Logo';

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
      <div className="max-w-7xl mx-auto bg-navy-900/95 backdrop-blur-xl rounded-2xl md:rounded-full px-6 py-2.5 flex items-center justify-between shadow-[0_2px_20px_rgb(0,0,0,0.2)] border border-navy-600">
        
        {/* Left Section: Back + Logo */}
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="p-2 text-navy-400 hover:text-gold hover:bg-navy-800 rounded-full transition-all md:flex"
            title="Go Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </motion.button>

          <Link to="/" className="flex items-center group">
            <Logo />
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
                    ? 'bg-navy-800 text-gold shadow-sm border border-gold/20' 
                    : 'text-navy-200 hover:text-gold hover:bg-navy-800'
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
                <span className="text-sm font-semibold text-navy-100 leading-none capitalize">{user.name}</span>
                <span className="mt-1 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-navy-800 text-gold border border-navy-600">
                  {user.role}
                </span>
              </div>
              <NotificationDropdown />
              <div className="h-9 w-9 rounded-full bg-navy-800 flex items-center justify-center border border-navy-600 text-gold">
                <User className="w-4 h-4" />
              </div>
              <button 
                onClick={handleLogout}
                className="p-2 text-navy-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-full transition-all"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="px-5 py-2 rounded-full font-medium text-sm text-navy-200 hover:text-gold hover:bg-navy-800 transition-all">
                Login
              </Link>
              <Link 
                to="/register" 
                className="px-5 py-2 rounded-full font-semibold text-sm bg-gold text-navy-900 hover:bg-[#b8963e] transition-all shadow-lg hover:shadow-gold/20"
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
