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
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case 'event_update':
        return <Info className="w-4 h-4 text-blue-400" />;
      case 'announcement':
        return <Megaphone className="w-4 h-4 text-[#C9A84C]" />;
      case 'reminder':
        return <Calendar className="w-4 h-4 text-[#C9A84C]" />;
      default:
        return <Bell className="w-4 h-4 text-[#5A7A94]" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-[#5A7A94] hover:text-[#C9A84C] hover:bg-[#1A2B3D] rounded-full transition-all"
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
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C9A84C] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-[#C9A84C] text-[10px] font-black text-[#0F1C2E] items-center justify-center shadow-sm">
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
            className="absolute right-0 mt-3 w-80 sm:w-96 bg-[#162333] rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.5)] border border-[#2E4A63] overflow-hidden z-[60]"
          >
            <div className="p-4 border-b border-[#2E4A63] flex items-center justify-between bg-[#1A2B3D]/50">
              <h3 className="font-black text-[#EDF2F7]">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs font-bold text-[#C9A84C] hover:text-[#b8963e] transition-colors"
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
                    className={`p-4 bg-[#1A2B3D] border-[0.5px] border-b-[#2E4A63] border-x-transparent border-t-transparent hover:bg-[#2E4A63]/20 transition-all cursor-pointer relative ${
                      !n.isRead ? 'border-l-[2px] border-l-[#C9A84C]' : 'opacity-60'
                    }`}
                    onClick={() => markAsRead(n._id)}
                  >
                    <div className="flex gap-3 items-start">
                      <div className="mt-1 relative">
                        {getIcon(n.type)}
                        <div className={`absolute -top-1 -right-1 w-2 h-2 rounded-full ${!n.isRead ? 'bg-[#C9A84C]' : 'bg-[#2E4A63]'}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <p className={`text-sm font-bold ${!n.isRead ? 'text-[#EDF2F7]' : 'text-[#B8C5D3]'}`}>
                            {n.title}
                          </p>
                          <span className="text-[10px] font-medium text-[#3D5A73] whitespace-nowrap ml-2">
                             {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-xs text-[#B8C5D3] mt-1 leading-relaxed">
                          {n.message}
                        </p>
                        {n.link && (
                          <Link
                            to={n.link}
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-[#C9A84C] mt-2 hover:underline"
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
                  <Bell className="w-12 h-12 text-[#2E4A63] mx-auto mb-3" />
                  <p className="text-sm font-medium text-[#5A7A94]">No notifications yet</p>
                </div>
              )}
            </div>

            <div className="p-3 bg-[#1A2B3D]/50 text-center border-t border-[#2E4A63]">
              <p className="text-[10px] font-bold text-[#5A7A94] uppercase tracking-widest">
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
