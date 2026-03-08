import { Link } from 'react-router-dom';
import { 
  Facebook, 
  Twitter, 
  Linkedin, 
  Instagram, 
  Sparkles, 
  Ticket, 
  LayoutDashboard, 
  User as UserIcon,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Footer = () => {
  const { user } = useAuth();

  const quickLinks = [
    ...(user?.role === 'user' || !user ? [{ name: 'Discover', path: '/events', icon: Sparkles }] : []),
    ...(user?.role === 'user' ? [{ name: 'My Tickets', path: '/user/dashboard', icon: Ticket }] : []),
    ...(user?.role === 'organizer' ? [
        { name: 'My Events', path: '/organizer-dashboard', icon: LayoutDashboard },
        { name: 'Create Event', path: '/create-event', icon: Ticket }
    ] : []),
    ...(user?.role === 'admin' ? [
        { name: 'Manage Events', path: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Users', path: '/admin/users', icon: UserIcon }
    ] : []),
  ];

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, href: 'https://facebook.com' },
    { name: 'Twitter', icon: Twitter, href: 'https://twitter.com' },
    { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com' },
    { name: 'Instagram', icon: Instagram, href: 'https://instagram.com' },
  ];

  return (
    <footer className="relative mt-auto border-t border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 sm:gap-8">
          
          {/* Brand Column */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <Sparkles className="w-6 h-6 text-indigo-600" />
              </div>
              <span className="text-2xl font-bold text-gray-900 tracking-tight">
                Event<span className="text-indigo-600">Boost</span>
              </span>
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed">
              Elevating event experiences through cutting-edge management and seamless booking solutions. Discover, create, and manage with confidence.
            </p>
            <div className="flex items-center space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-gray-50 hover:bg-indigo-50 border border-gray-100 rounded-full text-gray-500 hover:text-indigo-600 transition-colors"
                  aria-label={social.name}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="lg:pl-8">
            <h3 className="text-gray-900 font-semibold text-sm mb-6">
              Quick Navigation
            </h3>
            <ul className="space-y-4">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="flex items-center space-x-2 text-gray-500 hover:text-indigo-600 transition-colors duration-200 group"
                  >
                    <link.icon className="w-4 h-4 text-gray-400 group-hover:text-indigo-600" />
                    <span className="text-sm font-medium">{link.name}</span>
                  </Link>
                </li>
              ))}
              {!user && (
                <li>
                  <Link
                    to="/login"
                    className="flex items-center space-x-2 text-gray-500 hover:text-indigo-600 transition-colors duration-200 group"
                  >
                    <UserIcon className="w-4 h-4 text-gray-400 group-hover:text-indigo-600" />
                    <span className="text-sm font-medium">Sign In / Register</span>
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Contact Info Column */}
          <div>
            <h3 className="text-gray-900 font-semibold text-sm mb-6">
              Get in Touch
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3 text-gray-500">
                <Mail className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                <span className="text-sm leading-tight text-gray-500">support@eventboost.com</span>
              </li>
              <li className="flex items-start space-x-3 text-gray-500">
                <Phone className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                <span className="text-sm leading-tight text-gray-500">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-start space-x-3 text-gray-500">
                <MapPin className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                <span className="text-sm leading-tight text-gray-500">
                  123 Innovation Drive,<br />
                  Tech Valley, CA 94043
                </span>
              </li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="space-y-6">
            <h3 className="text-gray-900 font-semibold text-sm mb-6">
              Stay Updated
            </h3>
            <p className="text-gray-500 text-sm leading-relaxed">
              Subscribe to get the latest updates on events and exclusive offers.
            </p>
            <div className="relative">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full bg-white border border-gray-200 rounded-xl py-2.5 px-4 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
              />
              <button className="mt-3 w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl transition-all shadow-[0_2px_10px_rgba(79,70,229,0.2)] hover:shadow-[0_4px_14px_rgba(79,70,229,0.3)]">
                Subscribe Now
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-gray-500 text-sm font-medium">
            © {new Date().getFullYear()} <span className="text-gray-900 font-semibold">EventBoost</span>. All rights reserved.
          </p>
          <div className="flex space-x-8">
            <Link to="/privacy" className="text-gray-500 hover:text-indigo-600 text-sm font-medium transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="text-gray-500 hover:text-indigo-600 text-sm font-medium transition-colors">Terms of Service</Link>
            <Link to="/cookies" className="text-gray-500 hover:text-indigo-600 text-sm font-medium transition-colors">Cookies Settings</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
