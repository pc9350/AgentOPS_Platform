'use client'

import { cn } from '@/lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  trend?: {
    value: number
    label: string
  }
  icon?: LucideIcon
  iconColor?: string
  className?: string
}

export function StatsCard({
  title,
  value,
  description,
  trend,
  icon: Icon,
  iconColor = 'text-primary-600 bg-primary-100',
  className,
}: StatsCardProps) {
  const getTrendIcon = () => {
    if (!trend) return null
    if (trend.value > 0) return <TrendingUp className="h-4 w-4" />
    if (trend.value < 0) return <TrendingDown className="h-4 w-4" />
    return <Minus className="h-4 w-4" />
  }

  const getTrendColor = () => {
    if (!trend) return ''
    if (trend.value > 0) return 'text-success'
    if (trend.value < 0) return 'text-danger'
    return 'text-surface-500'
  }

  return (
    <div className={cn('card', className)}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-surface-500">{title}</p>
          <p className="text-2xl font-bold text-surface-900">{value}</p>
        </div>
        {Icon && (
          <div className={cn('rounded-lg p-2', iconColor)}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>

      {(description || trend) && (
        <div className="mt-4 flex items-center gap-2">
          {trend && (
            <span className={cn('flex items-center gap-1 text-sm font-medium', getTrendColor())}>
              {getTrendIcon()}
              {Math.abs(trend.value)}%
            </span>
          )}
          {description && (
            <span className="text-sm text-surface-500">{description}</span>
          )}
          {trend && !description && (
            <span className="text-sm text-surface-500">{trend.label}</span>
          )}
        </div>
      )}
    </div>
  )
}

