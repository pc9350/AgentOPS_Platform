'use client'

import { cn } from '@/lib/utils'

interface ScoreBadgeProps {
  score: number
  label?: string
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function ScoreBadge({ 
  score, 
  label, 
  showLabel = true,
  size = 'md' 
}: ScoreBadgeProps) {
  const getColorClasses = (value: number): string => {
    if (value >= 0.8) return 'bg-success/10 text-success border-success/20'
    if (value >= 0.6) return 'bg-primary-100 text-primary-700 border-primary-200'
    if (value >= 0.4) return 'bg-warning/10 text-warning border-warning/20'
    return 'bg-danger/10 text-danger border-danger/20'
  }

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  }

  const percentage = (score * 100).toFixed(0)

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-medium',
        getColorClasses(score),
        sizeClasses[size]
      )}
    >
      <span className="font-semibold">{percentage}%</span>
      {showLabel && label && (
        <span className="opacity-70">{label}</span>
      )}
    </span>
  )
}

interface ScoreBarProps {
  score: number
  label: string
  showPercentage?: boolean
}

export function ScoreBar({ score, label, showPercentage = true }: ScoreBarProps) {
  const getBarColor = (value: number): string => {
    if (value >= 0.8) return 'bg-success'
    if (value >= 0.6) return 'bg-primary-500'
    if (value >= 0.4) return 'bg-warning'
    return 'bg-danger'
  }

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-surface-600">{label}</span>
        {showPercentage && (
          <span className="font-medium text-surface-900">
            {(score * 100).toFixed(0)}%
          </span>
        )}
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-surface-100">
        <div
          className={cn('h-full rounded-full transition-all duration-500', getBarColor(score))}
          style={{ width: `${score * 100}%` }}
        />
      </div>
    </div>
  )
}

