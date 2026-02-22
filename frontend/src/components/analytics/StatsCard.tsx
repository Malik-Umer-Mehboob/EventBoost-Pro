import { useEffect } from 'react';
import { LucideIcon } from 'lucide-react';
import { motion, useSpring, useTransform, animate } from 'framer-motion';

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  bg: string;
  trend?: { value: string; positive: boolean };
  delay?: number;
}

const StatsCard: React.FC<StatsCardProps> = ({ label, value, icon: Icon, color, bg, trend, delay = 0 }) => {
  const numericValue = typeof value === 'number' ? value : parseFloat(value.toString().replace(/[^0-9.]/g, '')) || 0;
  const isCurrency = value.toString().startsWith('$');
  
  const springValue = useSpring(0, { stiffness: 100, damping: 30 });
  const displayValue = useTransform(springValue, (latest) => {
    const rounded = Math.floor(latest);
    return isCurrency ? `$${rounded.toLocaleString()}` : rounded.toLocaleString();
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      animate(springValue, numericValue, { duration: 1.5, ease: "easeOut" });
    }, delay * 1000 + 200);
    return () => clearTimeout(timer);
  }, [numericValue, springValue, delay]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ delay }}
      className="glass p-6 rounded-3xl flex flex-col gap-4 border border-white/20 hover:border-indigo-200 hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-300"
    >
      <div className={`w-12 h-12 rounded-2xl ${bg} ${color} flex items-center justify-center shadow-inner`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">{label}</p>
        <motion.p className="text-3xl font-black text-gray-900 tracking-tight">
          {typeof value === 'number' || !isNaN(numericValue) ? (
            <motion.span>{displayValue}</motion.span>
          ) : value}
        </motion.p>
        {trend && (
          <p className={`text-xs font-bold mt-1 flex items-center gap-1 ${trend.positive ? 'text-emerald-600' : 'text-rose-500'}`}>
            <span className="text-[10px]">{trend.positive ? '▲' : '▼'}</span> {trend.value}
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default StatsCard;
