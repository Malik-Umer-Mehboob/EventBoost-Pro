import { useState, useRef, useEffect } from 'react';
import { Bell, CheckCircle, Info, Megaphone, Calendar, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications, Notification } from '../hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';

const NotificationDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'ticket_confirmation':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'event_update':
        return <Info className="w-4 h-4 text-blue-500" />;
      case 'announcement':
        return <Megaphone className="w-4 h-4 text-purple-500" />;
      case 'reminder':
        return <Calendar className="w-4 h-4 text-indigo-500" />;
      default:
        return <Bell className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50/50 rounded-full transition-all"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 text-[10px] font-bold text-white items-center justify-center">
              {unreadCount}
            </span>
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-3 w-80 sm:w-96 glass rounded-2xl shadow-2xl border border-white/30 overflow-hidden z-[60]"
          >
            <div className="p-4 border-b border-white/20 flex items-center justify-between bg-white/40">
              <h3 className="font-black text-gray-900">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                >
                  Mark all as read
                </button>
              )}
            </div>

            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
              {notifications.length > 0 ? (
                notifications.map((n) => (
                  <div
                    key={n._id}
                    className={`p-4 border-b border-white/10 hover:bg-white/40 transition-all cursor-pointer relative ${
                      !n.isRead ? 'bg-indigo-50/30' : ''
                    }`}
                    onClick={() => markAsRead(n._id)}
                  >
                    {!n.isRead && (
                      <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-8 bg-indigo-500 rounded-full" />
                    )}
                    <div className="flex gap-3">
                      <div className="mt-1">{getIcon(n.type)}</div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <p className={`text-sm font-bold ${!n.isRead ? 'text-gray-900' : 'text-gray-600'}`}>
                            {n.title}
                          </p>
                          <span className="text-[10px] font-medium text-gray-400 whitespace-nowrap ml-2">
                             {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                          {n.message}
                        </p>
                        {n.link && (
                          <Link
                            to={n.link}
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-600 mt-2 hover:underline"
                            onClick={(e) => e.stopPropagation()}
                          >
                            View Details <ExternalLink className="w-3 h-3" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center">
                  <Bell className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-sm font-medium text-gray-400">No notifications yet</p>
                </div>
              )}
            </div>

            <div className="p-3 bg-white/20 text-center border-t border-white/10">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                Real-time updates active
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationDropdown;
