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

import { ChartData } from '../../types';

interface RevenueChartProps {
  data: ChartData[];
  lines: { key: string; label: string; color: string }[];
  title?: string;
  height?: number;
}

interface TooltipEntry {
  dataKey: string;
  name: string;
  value: string | number;
  color: string;
  payload: ChartData;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-navy-800 p-5 border border-navy-600 shadow-2xl rounded-[24px] min-w-[160px]">
        <p className="text-[10px] font-black text-gold uppercase tracking-widest mb-2 border-b border-navy-600 pb-2">
          {label}
        </p>
        <div className="space-y-1.5">
          {payload.map((entry: TooltipEntry) => (
            <div key={entry.dataKey} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-[10px] font-black uppercase tracking-widest text-navy-400">{entry.name}</span>
              </div>
              <span className="text-xs font-black text-navy-100">
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
      <div className="flex items-center justify-center rounded-3xl bg-navy-900 border-2 border-dashed border-navy-600" style={{ height }}>
        <p className="text-navy-500 font-black text-[10px] uppercase tracking-widest">No chart data yet</p>
      </div>
    );
  }

  return (
    <div>
      {title && (
        <p className="text-[10px] font-black uppercase tracking-widest text-navy-500 mb-4">{title}</p>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <defs>
            {lines.map(line => (
              <linearGradient key={line.key} id={`grad-${line.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={line.color} stopOpacity={0.2} />
                <stop offset="95%" stopColor={line.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#2E4A63" vertical={false} strokeOpacity={0.5} />
          <XAxis
            dataKey="name"
            tick={{ fontSize: 10, fontWeight: 900, fill: '#5A7A94' }}
            axisLine={false}
            tickLine={false}
            dy={10}
          />
          <YAxis
            tick={{ fontSize: 10, fontWeight: 900, fill: '#5A7A94' }}
            axisLine={false}
            tickLine={false}
            width={40}
          />
          <Tooltip content={<CustomTooltip />} />
          {lines.length > 1 && <Legend iconType="circle" />}
          {lines.map(line => (
            <Area
              key={line.key}
              type="monotone"
              dataKey={line.key}
              name={line.label}
              stroke={line.color}
              strokeWidth={3}
              fill={`url(#grad-${line.key})`}
              dot={{ r: 4, fill: line.color, strokeWidth: 2, stroke: '#0F1C2E' }}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RevenueChart;

