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
    <footer className="relative mt-auto border-t border-white/10">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 -z-10" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 sm:gap-8">
          
          {/* Brand Column */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-600 rounded-lg shadow-lg shadow-indigo-500/20">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black text-white tracking-tighter italic">
                EventBoost<span className="text-indigo-400">Pro</span>
              </span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed font-medium">
              Elevating event experiences through cutting-edge management and seamless booking solutions. Discover, create, and manage with confidence.
            </p>
            <div className="flex items-center space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-white/5 hover:bg-indigo-600 border border-white/10 hover:border-indigo-400 rounded-full text-slate-400 hover:text-white transition-all duration-300 transform hover:-translate-y-1"
                  aria-label={social.name}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="lg:pl-8">
            <h3 className="text-white font-bold uppercase tracking-widest text-xs mb-6 px-1 border-l-2 border-indigo-500">
              Quick Navigation
            </h3>
            <ul className="space-y-4">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="flex items-center space-x-2 text-slate-400 hover:text-indigo-400 transition-colors duration-200 group"
                  >
                    <link.icon className="w-4 h-4 opacity-70 group-hover:opacity-100" />
                    <span className="text-sm font-medium">{link.name}</span>
                  </Link>
                </li>
              ))}
              {!user && (
                <li>
                  <Link
                    to="/login"
                    className="flex items-center space-x-2 text-slate-400 hover:text-indigo-400 transition-colors duration-200 group"
                  >
                    <UserIcon className="w-4 h-4 opacity-70 group-hover:opacity-100" />
                    <span className="text-sm font-medium">Sign In / Register</span>
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Contact Info Column */}
          <div>
            <h3 className="text-white font-bold uppercase tracking-widest text-xs mb-6 px-1 border-l-2 border-indigo-500">
              Get in Touch
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3 text-slate-400">
                <Mail className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                <span className="text-sm leading-tight text-slate-400">support@eventboostpro.com</span>
              </li>
              <li className="flex items-start space-x-3 text-slate-400">
                <Phone className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                <span className="text-sm leading-tight text-slate-400">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-start space-x-3 text-slate-400">
                <MapPin className="w-5 h-5 text-indigo-500 flex-shrink-0" />
                <span className="text-sm leading-tight text-slate-400">
                  123 Innovation Drive,<br />
                  Tech Valley, CA 94043
                </span>
              </li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="space-y-6">
            <h3 className="text-white font-bold uppercase tracking-widest text-xs mb-6 px-1 border-l-2 border-indigo-500">
              Stay Updated
            </h3>
            <p className="text-slate-400 text-sm font-medium leading-relaxed">
              Subscribe to get the latest updates on events and exclusive offers.
            </p>
            <div className="relative">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all"
              />
              <button className="mt-3 w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/20 active:scale-95">
                Subscribe Now
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-slate-500 text-xs font-semibold tracking-wide">
            © {new Date().getFullYear()} <span className="text-slate-400">EventBoostPro</span>. All rights reserved.
          </p>
          <div className="flex space-x-8">
            <Link to="/privacy" className="text-slate-500 hover:text-slate-300 text-xs font-bold transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="text-slate-500 hover:text-slate-300 text-xs font-bold transition-colors">Terms of Service</Link>
            <Link to="/cookies" className="text-slate-500 hover:text-slate-300 text-xs font-bold transition-colors">Cookies Settings</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
