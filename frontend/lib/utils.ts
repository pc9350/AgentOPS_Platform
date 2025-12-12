import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind CSS classes with clsx.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number as currency (USD).
 */
export function formatCurrency(value: number): string {
  if (value < 0.01) {
    return `$${value.toFixed(6)}`
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(value)
}

/**
 * Format a number with commas.
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value)
}

/**
 * Format milliseconds as human-readable duration.
 */
export function formatLatency(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`
  }
  return `${(ms / 1000).toFixed(2)}s`
}

/**
 * Format a date string as relative time.
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSecs = Math.floor(diffMs / 1000)
  const diffMins = Math.floor(diffSecs / 60)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSecs < 60) return 'just now'
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  
  return date.toLocaleDateString()
}

/**
 * Format a date string as full date.
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Get color class based on score (0-1).
 */
export function getScoreColor(score: number): string {
  if (score >= 0.8) return 'text-success'
  if (score >= 0.6) return 'text-primary-500'
  if (score >= 0.4) return 'text-warning'
  return 'text-danger'
}

/**
 * Get background color class based on score (0-1).
 */
export function getScoreBgColor(score: number): string {
  if (score >= 0.8) return 'bg-success/10 text-success'
  if (score >= 0.6) return 'bg-primary-500/10 text-primary-500'
  if (score >= 0.4) return 'bg-warning/10 text-warning'
  return 'bg-danger/10 text-danger'
}

/**
 * Get risk level label.
 */
export function getRiskLevel(risk: number): string {
  if (risk >= 0.8) return 'Critical'
  if (risk >= 0.6) return 'High'
  if (risk >= 0.4) return 'Medium'
  if (risk >= 0.2) return 'Low'
  return 'Safe'
}

/**
 * Truncate text with ellipsis.
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3) + '...'
}

