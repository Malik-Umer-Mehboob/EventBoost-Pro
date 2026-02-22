import React from 'react';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

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
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass p-6 rounded-3xl flex flex-col gap-4"
    >
      <div className={`w-12 h-12 rounded-2xl ${bg} ${color} flex items-center justify-center`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-1">{label}</p>
        <p className="text-3xl font-black text-gray-900">{value}</p>
        {trend && (
          <p className={`text-xs font-bold mt-1 ${trend.positive ? 'text-emerald-600' : 'text-rose-500'}`}>
            {trend.positive ? '▲' : '▼'} {trend.value}
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default StatsCard;
