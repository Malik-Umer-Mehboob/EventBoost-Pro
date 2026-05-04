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
    <footer className="relative mt-auto border-t border-[#1A2B3D] bg-[#08111C]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 sm:gap-8">

          {/* Brand Column */}
          <div className="space-y-6">
            <Link to="/" className="flex items-center space-x-3">
              <div className="p-2 bg-[#1A2B3D] rounded-lg">
                <Sparkles className="w-6 h-6 text-[#C9A84C]" />
              </div>
              <span className="text-2xl font-bold text-[#EDF2F7] tracking-tight">
                Event<span className="text-[#C9A84C]">Boost</span>
              </span>
            </Link>
            <p className="text-[#7A94AA] text-sm leading-relaxed">
              Elevating event experiences through cutting-edge management and seamless booking solutions. Discover, create, and manage with confidence.
            </p>
            <div className="flex items-center space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 bg-[#1A2B3D] hover:bg-[#2E4A63] border border-[#2E4A63] rounded-full text-[#5A7A94] hover:text-[#B8C5D3] transition-colors"
                  aria-label={social.name}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="lg:pl-8">
            <h3 className="text-[#EDF2F7] font-semibold text-sm mb-6">
              Quick Navigation
            </h3>
            <ul className="space-y-4">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="flex items-center space-x-2 text-[#5A7A94] hover:text-[#B8C5D3] transition-colors duration-200 group"
                  >
                    <link.icon className="w-4 h-4 text-[#5A7A94] group-hover:text-[#B8C5D3]" />
                    <span className="text-sm font-medium">{link.name}</span>
                  </Link>
                </li>
              ))}
              {!user && (
                <li>
                  <Link
                    to="/login"
                    className="flex items-center space-x-2 text-[#5A7A94] hover:text-[#B8C5D3] transition-colors duration-200 group"
                  >
                    <UserIcon className="w-4 h-4 text-[#5A7A94] group-hover:text-[#B8C5D3]" />
                    <span className="text-sm font-medium">Sign In / Register</span>
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Contact Info Column */}
          <div>
            <h3 className="text-[#EDF2F7] font-semibold text-sm mb-6">
              Get in Touch
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3 text-[#7A94AA]">
                <Mail className="w-5 h-5 text-[#C9A84C] flex-shrink-0" />
                <span className="text-sm leading-tight text-[#7A94AA]">support@eventboost.com</span>
              </li>
              <li className="flex items-start space-x-3 text-[#7A94AA]">
                <Phone className="w-5 h-5 text-[#C9A84C] flex-shrink-0" />
                <span className="text-sm leading-tight text-[#7A94AA]">+1 (555) 123-4567</span>
              </li>
              <li className="flex items-start space-x-3 text-[#7A94AA]">
                <MapPin className="w-5 h-5 text-[#C9A84C] flex-shrink-0" />
                <span className="text-sm leading-tight text-[#7A94AA]">
                  123 Innovation Drive,<br />
                  Tech Valley, CA 94043
                </span>
              </li>
            </ul>
          </div>

          {/* Newsletter Column */}
          <div className="space-y-6">
            <h3 className="text-[#EDF2F7] font-semibold text-sm mb-6">
              Stay Updated
            </h3>
            <p className="text-[#7A94AA] text-sm leading-relaxed">
              Subscribe to get the latest updates on events and exclusive offers.
            </p>
            <div className="relative">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full bg-[#0F1C2E] border border-[#2E4A63] rounded-xl py-2.5 px-4 text-[#EDF2F7] text-sm placeholder-[#3D5A73] focus:outline-none focus:border-[#C9A84C] transition-all"
              />
              <button className="mt-3 w-full bg-[#C9A84C] hover:bg-[#b8963e] text-[#0F1C2E] font-semibold py-2.5 rounded-xl transition-all">
                Subscribe Now
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-[#1A2B3D] flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-[#3D5A73] text-sm font-medium">
            © {new Date().getFullYear()} <span className="text-[#B8C5D3] font-semibold">EventBoost</span>. All rights reserved.
          </p>
          <div className="flex space-x-8">
            <Link to="/privacy" className="text-[#5A7A94] hover:text-[#B8C5D3] text-sm font-medium transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="text-[#5A7A94] hover:text-[#B8C5D3] text-sm font-medium transition-colors">Terms of Service</Link>
            <Link to="/cookies" className="text-[#5A7A94] hover:text-[#B8C5D3] text-sm font-medium transition-colors">Cookies Settings</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
