'use client'

import { cn } from '@/lib/utils'
import { AlertTriangle, ShieldAlert, Ban, AlertOctagon, CheckCircle } from 'lucide-react'
import type { SafetyCategory } from '@/lib/types'

interface SafetyAlertProps {
  riskScore: number
  category: SafetyCategory
  explanation?: string
  recommendedFix?: string | null
  compact?: boolean
}

const categoryConfig: Record<SafetyCategory, {
  icon: typeof AlertTriangle
  label: string
  color: string
}> = {
  toxicity: {
    icon: AlertOctagon,
    label: 'Toxicity Detected',
    color: 'text-danger bg-danger/10 border-danger/20',
  },
  bias: {
    icon: AlertTriangle,
    label: 'Potential Bias',
    color: 'text-orange-600 bg-orange-50 border-orange-200',
  },
  illegal: {
    icon: Ban,
    label: 'Illegal Content',
    color: 'text-danger bg-danger/10 border-danger/20',
  },
  harmful_advice: {
    icon: ShieldAlert,
    label: 'Harmful Advice',
    color: 'text-warning bg-warning/10 border-warning/20',
  },
  none: {
    icon: CheckCircle,
    label: 'No Issues',
    color: 'text-success bg-success/10 border-success/20',
  },
}

export function SafetyAlert({
  riskScore,
  category,
  explanation,
  recommendedFix,
  compact = false,
}: SafetyAlertProps) {
  const config = categoryConfig[category] || categoryConfig.none
  const Icon = config.icon
  
  const getRiskLevel = (score: number): string => {
    if (score >= 0.8) return 'Critical'
    if (score >= 0.6) return 'High'
    if (score >= 0.4) return 'Medium'
    if (score >= 0.2) return 'Low'
    return 'Safe'
  }

  if (compact) {
    return (
      <div className={cn('inline-flex items-center gap-2 rounded-lg border px-3 py-1.5', config.color)}>
        <Icon className="h-4 w-4" />
        <span className="text-sm font-medium">{config.label}</span>
        <span className="text-xs opacity-70">({getRiskLevel(riskScore)})</span>
      </div>
    )
  }

  return (
    <div className={cn('rounded-lg border p-4', config.color)}>
      <div className="flex items-start gap-3">
        <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">{config.label}</h4>
            <span className="text-sm font-medium">
              Risk: {(riskScore * 100).toFixed(0)}% ({getRiskLevel(riskScore)})
            </span>
          </div>
          
          {explanation && (
            <p className="text-sm opacity-80">{explanation}</p>
          )}
          
          {recommendedFix && (
            <div className="mt-3 rounded-md bg-white/50 p-3">
              <p className="text-xs font-medium uppercase tracking-wide opacity-60">
                Recommended Fix
              </p>
              <p className="mt-1 text-sm">{recommendedFix}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

interface SafetySummaryProps {
  riskScore: number
  categories: Record<SafetyCategory, number>
}

export function SafetySummary({ riskScore, categories }: SafetySummaryProps) {
  const getRiskColor = (score: number): string => {
    if (score >= 0.6) return 'text-danger'
    if (score >= 0.4) return 'text-warning'
    return 'text-success'
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-surface-600">Overall Safety</span>
        <span className={cn('text-lg font-bold', getRiskColor(riskScore))}>
          {(100 - riskScore * 100).toFixed(0)}% Safe
        </span>
      </div>
      
      <div className="h-2 w-full overflow-hidden rounded-full bg-surface-100">
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500',
            riskScore >= 0.6 ? 'bg-danger' : riskScore >= 0.4 ? 'bg-warning' : 'bg-success'
          )}
          style={{ width: `${(1 - riskScore) * 100}%` }}
        />
      </div>

      <div className="grid grid-cols-2 gap-2">
        {Object.entries(categories).map(([cat, count]) => {
          if (count === 0) return null
          const config = categoryConfig[cat as SafetyCategory]
          const Icon = config?.icon || AlertTriangle
          
          return (
            <div
              key={cat}
              className="flex items-center gap-2 rounded-lg bg-surface-50 px-3 py-2"
            >
              <Icon className="h-4 w-4 text-surface-500" />
              <span className="text-sm text-surface-700 capitalize">
                {cat.replace('_', ' ')}
              </span>
              <span className="ml-auto text-sm font-medium">{count}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

