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
    <footer className="relative mt-auto border-t border-navy-800 bg-navy-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 sm:gap-8">
          
          {/* Brand Column */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center space-x-3">
              <div className="p-2 bg-navy-800 rounded-lg">
                <Sparkles className="w-6 h-6 text-gold" />
              </div>
              <span className="text-2xl font-bold text-navy-100 tracking-tight">
                Event<span className="text-gold">Boost</span>
              </span>
            </Link>
            <p className="text-navy-400 text-sm leading-relaxed">
              Elevating event experiences through cutting-edge management and seamless booking solutions. Discover, create, and manage with confidence.
            </p>
            <div className="flex items-center space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-navy-900 hover:bg-navy-800 border border-navy-700 rounded-full text-navy-400 hover:text-gold transition-colors"
                  aria-label={social.name}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="lg:pl-8">
            <h3 className="text-navy-100 font-semibold text-sm mb-6">
              Quick Navigation
            </h3>
            <ul className="space-y-4">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="flex items-center space-x-2 text-navy-400 hover:text-gold transition-colors duration-200 group"
                  >
                    <link.icon className="w-4 h-4 text-navy-500 group-hover:text-gold" />
                    <span className="text-sm font-medium">{link.name}</span>
                  </Link>
                </li>
              ))}
              {!user && (
                <li>
                  <Link
                    to="/login"
                    className="flex items-center space-x-2 text-navy-400 hover:text-gold transition-colors duration-200 group"
                  >
                    <UserIcon className="w-4 h-4 text-navy-500 group-hover:text-gold" />
                    <span className="text-sm font-medium">Sign In / Register</span>
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Contact Info Column */}
          <div>
            <h3 className="text-navy-100 font-semibold text-sm mb-6">
              Get in Touch
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3 text-navy-400">
                <Mail className="w-5 h-5 text-gold flex-shrink-0" />
                <span className="text-sm leading-tight text-navy-400">support@eventboost.com</span>
              </li>
              <li className="flex items-start space-x-3 text-navy-400">
                <Phone className="w-5 h-5 text-gold flex-shrink-0" />
                <span className="text-sm leading-tight text-navy-400">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-start space-x-3 text-navy-400">
                <MapPin className="w-5 h-5 text-gold flex-shrink-0" />
                <span className="text-sm leading-tight text-navy-400">
                  123 Innovation Drive,<br />
                  Tech Valley, CA 94043
                </span>
              </li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="space-y-6">
            <h3 className="text-navy-100 font-semibold text-sm mb-6">
              Stay Updated
            </h3>
            <p className="text-navy-400 text-sm leading-relaxed">
              Subscribe to get the latest updates on events and exclusive offers.
            </p>
            <div className="relative">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full bg-navy-900 border border-navy-700 rounded-xl py-2.5 px-4 text-navy-100 text-sm focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all shadow-sm placeholder-navy-500"
              />
              <button className="mt-3 w-full bg-gold hover:bg-[#b8963e] text-navy-900 font-bold py-2.5 rounded-xl transition-all shadow-lg hover:shadow-gold/20">
                Subscribe Now
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-navy-800 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-navy-500 text-sm font-medium">
            © {new Date().getFullYear()} <span className="text-gold font-semibold">EventBoost</span>. All rights reserved.
          </p>
          <div className="flex space-x-8">
            <Link to="/privacy" className="text-navy-500 hover:text-gold text-sm font-medium transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="text-navy-500 hover:text-gold text-sm font-medium transition-colors">Terms of Service</Link>
            <Link to="/cookies" className="text-navy-500 hover:text-gold text-sm font-medium transition-colors">Cookies Settings</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
