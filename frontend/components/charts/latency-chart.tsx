'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts'

interface LatencyDataPoint {
  date: string
  latency: number
  requests?: number
}

interface LatencyChartProps {
  data: LatencyDataPoint[]
  showArea?: boolean
}

export function LatencyChart({ data, showArea = false }: LatencyChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-surface-500">
        No data available
      </div>
    )
  }

  const Chart = showArea ? AreaChart : LineChart

  return (
    <ResponsiveContainer width="100%" height={280}>
      <Chart data={data}>
        <defs>
          <linearGradient id="latencyGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12, fill: '#64748b' }}
          tickLine={false}
          axisLine={{ stroke: '#e2e8f0' }}
        />
        <YAxis
          tick={{ fontSize: 12, fill: '#64748b' }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `${value}ms`}
        />
        <Tooltip
          content={({ active, payload, label }) => {
            if (active && payload && payload.length) {
              return (
                <div className="rounded-lg border border-surface-200 bg-white px-3 py-2 shadow-lg">
                  <p className="text-xs text-surface-500">{label}</p>
                  <p className="font-medium text-surface-900">
                    {payload[0].value}ms
                  </p>
                  {payload[0].payload.requests && (
                    <p className="text-xs text-surface-500">
                      {payload[0].payload.requests} requests
                    </p>
                  )}
                </div>
              )
            }
            return null
          }}
        />
        {showArea ? (
          <Area
            type="monotone"
            dataKey="latency"
            stroke="#0ea5e9"
            strokeWidth={2}
            fill="url(#latencyGradient)"
          />
        ) : (
          <Line
            type="monotone"
            dataKey="latency"
            stroke="#0ea5e9"
            strokeWidth={2}
            dot={{ fill: '#0ea5e9', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, fill: '#0ea5e9' }}
          />
        )}
      </Chart>
    </ResponsiveContainer>
  )
}

