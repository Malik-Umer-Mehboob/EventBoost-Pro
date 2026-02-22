import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface RevenueChartProps {
  data: Record<string, any>[];
  lines: { key: string; label: string; color: string }[];
  title?: string;
  height?: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="glass p-4 border border-white/20 shadow-2xl rounded-2xl min-w-[160px]">
        <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-2 border-b border-white/10 pb-2">
          {label}
        </p>
        <div className="space-y-1.5">
          {payload.map((entry: any) => (
            <div key={entry.dataKey} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-xs font-bold text-gray-500">{entry.name}</span>
              </div>
              <span className="text-xs font-black text-gray-900">
                {typeof entry.value === 'number' && entry.name.toLowerCase().includes('revenue')
                  ? `$${entry.value.toLocaleString()}`
                  : entry.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

const RevenueChart: React.FC<RevenueChartProps> = ({ data, lines, title, height = 280 }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center rounded-3xl bg-slate-50 border-2 border-dashed border-gray-200" style={{ height }}>
        <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">No chart data yet</p>
      </div>
    );
  }

  return (
    <div>
      {title && (
        <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-4">{title}</p>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <defs>
            {lines.map(line => (
              <linearGradient key={line.key} id={`grad-${line.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={line.color} stopOpacity={0.15} />
                <stop offset="95%" stopColor={line.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10, fontWeight: 700, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fontWeight: 700, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          <Tooltip content={<CustomTooltip />} />
          {lines.length > 1 && <Legend />}
          {lines.map(line => (
            <Area
              key={line.key}
              type="monotone"
              dataKey={line.key}
              name={line.label}
              stroke={line.color}
              strokeWidth={2.5}
              fill={`url(#grad-${line.key})`}
              dot={{ r: 4, fill: line.color, strokeWidth: 2, stroke: '#fff' }}
              activeDot={{ r: 6 }}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueChart;
