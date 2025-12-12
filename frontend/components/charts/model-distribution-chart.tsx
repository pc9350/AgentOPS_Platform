'use client'

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts'

interface ModelDistributionChartProps {
  data: Record<string, number>
}

const COLORS = ['#0ea5e9', '#d946ef', '#10b981', '#f59e0b', '#ef4444']

export function ModelDistributionChart({ data }: ModelDistributionChartProps) {
  const chartData = Object.entries(data).map(([name, value]) => ({
    name,
    value,
  }))

  if (chartData.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-surface-500">
        No data available
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
        >
          {chartData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={COLORS[index % COLORS.length]}
              className="stroke-white stroke-2"
            />
          ))}
        </Pie>
        <Tooltip
          content={({ active, payload }) => {
            if (active && payload && payload.length) {
              return (
                <div className="rounded-lg border border-surface-200 bg-white px-3 py-2 shadow-lg">
                  <p className="font-medium text-surface-900">
                    {payload[0].name}
                  </p>
                  <p className="text-sm text-surface-600">
                    {payload[0].value} conversations
                  </p>
                </div>
              )
            }
            return null
          }}
        />
        <Legend
          verticalAlign="bottom"
          height={36}
          formatter={(value) => (
            <span className="text-sm text-surface-600">{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}

