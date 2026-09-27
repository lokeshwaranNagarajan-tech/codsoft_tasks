'use client';

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';

interface ExamResultsChartProps {
  data: { name: string; averageMarks: number; passRate: number }[];
}

export default function ExamResultsChart({ data }: ExamResultsChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-xs text-slate-500">
        No exam performance data available
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
          />
          <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
          <Bar dataKey="averageMarks" name="Avg Score" fill="#3B82F6" radius={[4, 4, 0, 0]} />
          <Bar dataKey="passRate" name="Pass Rate %" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
