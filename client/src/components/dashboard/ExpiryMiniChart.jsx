import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardDescription } from '../ui';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-2.5 rounded-xl border border-charcoal-border shadow-soft-sm text-xs">
        <p className="font-semibold text-charcoal">{data.name}</p>
        <p className="text-charcoal-muted mt-0.5">
          <span className="font-bold text-charcoal">{data.count}</span> items
        </p>
      </div>
    );
  }
  return null;
};

export function ExpiryMiniChart({ data = [] }) {
  const totalItems = data.reduce((acc, curr) => acc + (curr.count || 0), 0);

  return (
    <Card className="p-5 flex flex-col justify-between">
      <CardHeader className="pb-2 mb-2">
        <div>
          <CardTitle className="text-base sm:text-lg">Freshness Distribution</CardTitle>
          <CardDescription className="text-xs">
            {totalItems > 0
              ? `${totalItems} total items across timeline`
              : 'Add items to visualize expiry distribution'}
          </CardDescription>
        </div>
      </CardHeader>

      <div className="h-44 w-full pt-2">
        {totalItems === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-charcoal-muted">
            No pantry data yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: '#6B7A70' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 11, fill: '#6B7A70' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || '#4F7A4A'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </Card>
  );
}

export default ExpiryMiniChart;
