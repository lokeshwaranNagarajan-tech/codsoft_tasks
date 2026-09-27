'use client';

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface AttendanceChartProps {
  data: { name: string; attendancePct: number }[];
}

export default function AttendanceChart({ data }: AttendanceChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-slate-500">
        No attendance records found
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" vertical={false} />
          <XAxis dataKey="name" stroke="#64748B" fontSize={11} tickLine={false} />
          <YAxis domain={[0, 100]} stroke="#64748B" fontSize={11} tickLine={false} />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0F172A',
              borderColor: '#334155',
              borderRadius: '0.75rem',
              color: '#F8FAFC',
              fontSize: '12px',
            }}
            formatter={(value: any) => [`${value}%`, 'Attendance']}
          />
          <Line
            type="monotone"
            dataKey="attendancePct"
            stroke="#10B981"
            strokeWidth={3}
            dot={{ fill: '#10B981', r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
