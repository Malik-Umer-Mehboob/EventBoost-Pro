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
        <AnimatePresence>
          {unreadCount > 0 && (
            <motion.span 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              key={unreadCount}
              className="absolute top-1 right-1 flex h-4 w-4"
            >
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 text-[10px] font-black text-white items-center justify-center shadow-sm">
                {unreadCount}
              </span>
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-3 w-80 sm:w-96 bg-navy-700 rounded-[32px] shadow-2xl border border-navy-600 overflow-hidden z-[60]"
          >
            <div className="p-5 border-b border-navy-600 flex items-center justify-between bg-navy-800/50">
              <h3 className="font-black text-navy-100">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-[10px] font-black text-gold hover:text-gold/80 uppercase tracking-widest transition-colors"
                >
                  Mark all as read
                </button>
              )}
            </div>

            <div className="max-h-[400px] overflow-y-auto custom-scrollbar bg-navy-700">
              {notifications.length > 0 ? (
                notifications.map((n) => (
                  <div
                    key={n._id}
                    className={`p-5 border-b border-navy-600/50 hover:bg-navy-800 transition-all cursor-pointer relative ${
                      !n.isRead ? 'bg-navy-800/40' : 'opacity-60'
                    }`}
                    onClick={() => markAsRead(n._id)}
                  >
                    {!n.isRead && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-10 bg-gold rounded-full" />
                    )}
                    <div className="flex gap-4">
                      <div className="mt-1 p-2 bg-navy-900 rounded-xl border border-navy-600">
                        {getIcon(n.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <p className={`text-sm font-black tracking-tight ${!n.isRead ? 'text-navy-100' : 'text-navy-200'}`}>
                            {n.title}
                          </p>
                          <span className="text-[10px] font-black text-navy-500 whitespace-nowrap ml-2 uppercase tracking-widest">
                             {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-xs text-navy-200 leading-relaxed font-medium">
                          {n.message}
                        </p>
                        {n.link && (
                          <Link
                            to={n.link}
                            className="inline-flex items-center gap-1 text-[10px] font-black text-gold mt-3 hover:underline uppercase tracking-widest"
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
                <div className="p-12 text-center">
                  <Bell className="w-16 h-16 text-navy-800 mx-auto mb-4 opacity-20" />
                  <p className="text-[10px] font-black text-navy-500 uppercase tracking-widest">All caught up</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-navy-800/80 text-center border-t border-navy-600">
              <p className="text-[9px] font-black text-navy-500 uppercase tracking-[0.2em]">
                Secure Real-time Stream
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationDropdown;
