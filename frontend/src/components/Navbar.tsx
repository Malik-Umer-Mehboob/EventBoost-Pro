import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/Logo_event.png';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-gray-800 p-4 text-white flex justify-between items-center shadow-md">
      
      {/* Logo + Text */}
      <Link to="/" className="flex items-center gap-2 group">
        <img 
          src={logo} 
          alt="EventBoostPro Logo" 
          className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <span className="text-2xl font-bold tracking-tight">EventBoostPro</span>
      </Link>

      {/* Navbar Links / User Section */}
      <div className="space-x-4">
        {user ? (
          <>
            <span className="mr-4">Welcome, {user.name} ({user.role})</span>
            
            {user.role === 'admin' && (
              <Link to="/admin/dashboard" className="hover:text-gray-300">Admin</Link>
            )}
            {user.role === 'organizer' && (
              <Link to="/organizer/dashboard" className="hover:text-gray-300">Organizer</Link>
            )}
            {user.role === 'user' && (
              <Link to="/user/dashboard" className="hover:text-gray-300">Dashboard</Link>
            )}

            <button 
              onClick={handleLogout} 
              className="bg-red-500 px-3 py-1 rounded hover:bg-red-600"
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="hover:text-gray-300">Login</Link>
            <Link to="/register" className="hover:text-gray-300">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
