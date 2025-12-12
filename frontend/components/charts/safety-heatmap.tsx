'use client'

import { cn } from '@/lib/utils'

interface SafetyData {
  category: string
  count: number
  avgRisk: number
}

interface SafetyHeatmapProps {
  data: SafetyData[]
}

const getCellColor = (risk: number): string => {
  if (risk >= 0.8) return 'bg-danger'
  if (risk >= 0.6) return 'bg-orange-500'
  if (risk >= 0.4) return 'bg-warning'
  if (risk >= 0.2) return 'bg-yellow-300'
  return 'bg-success'
}

const getCellOpacity = (count: number, maxCount: number): string => {
  const ratio = count / maxCount
  if (ratio >= 0.8) return 'opacity-100'
  if (ratio >= 0.6) return 'opacity-80'
  if (ratio >= 0.4) return 'opacity-60'
  if (ratio >= 0.2) return 'opacity-40'
  return 'opacity-20'
}

export function SafetyHeatmap({ data }: SafetyHeatmapProps) {
  const maxCount = Math.max(...data.map((d) => d.count), 1)

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-surface-500">
        No safety data available
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-surface-500">Risk Level</span>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded bg-success" />
            <span className="text-xs text-surface-500">Low</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded bg-warning" />
            <span className="text-xs text-surface-500">Medium</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-3 w-3 rounded bg-danger" />
            <span className="text-xs text-surface-500">High</span>
          </div>
        </div>
      </div>

      {/* Heatmap grid */}
      <div className="grid grid-cols-2 gap-3">
        {data.map((item) => (
          <div
            key={item.category}
            className={cn(
              'relative overflow-hidden rounded-lg p-4 text-white',
              getCellColor(item.avgRisk),
              getCellOpacity(item.count, maxCount)
            )}
          >
            <div className="relative z-10">
              <p className="text-sm font-medium capitalize">
                {item.category.replace('_', ' ')}
              </p>
              <p className="mt-1 text-2xl font-bold">{item.count}</p>
              <p className="text-xs opacity-80">
                Avg risk: {(item.avgRisk * 100).toFixed(0)}%
              </p>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="rounded-lg bg-surface-100 p-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-surface-600">Total flagged</span>
          <span className="font-medium text-surface-900">
            {data.reduce((sum, d) => sum + d.count, 0)}
          </span>
        </div>
      </div>
    </div>
  )
}

