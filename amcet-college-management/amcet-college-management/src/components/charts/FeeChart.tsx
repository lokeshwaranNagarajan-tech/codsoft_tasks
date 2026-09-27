'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

interface FeeChartProps {
  data: { name: string; collected: number; pending: number }[];
}

export default function FeeChart({ data }: FeeChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-slate-500">
        No fee collection data available
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
          <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
          <YAxis
            stroke="#64748B"
            fontSize={10}
            tickLine={false}
            tickFormatter={(val) => `₹${val / 1000}k`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0F172A',
              borderColor: '#334155',
              borderRadius: '0.75rem',
              color: '#F8FAFC',
              fontSize: '12px',
            }}
            formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, '']}
          />
          <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
          <Bar dataKey="collected" name="Collected Fee" fill="#10B981" radius={[4, 4, 0, 0]} />
          <Bar dataKey="pending" name="Pending Fee" fill="#EF4444" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
