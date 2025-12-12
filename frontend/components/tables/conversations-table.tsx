'use client'

import { useRouter } from 'next/navigation'
import { cn, formatCurrency, formatLatency, formatRelativeTime, truncate } from '@/lib/utils'
import { ScoreBadge } from '@/components/ui/score-badge'
import { ChevronRight, ExternalLink } from 'lucide-react'
import type { ConversationListItem } from '@/lib/types'

interface ConversationsTableProps {
  conversations: ConversationListItem[]
  isLoading?: boolean
}

export function ConversationsTable({ conversations, isLoading }: ConversationsTableProps) {
  const router = useRouter()

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-lg bg-surface-100" />
        ))}
      </div>
    )
  }

  if (conversations.length === 0) {
    return (
      <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed border-surface-300 bg-surface-50">
        <p className="text-surface-600">No conversations found</p>
        <p className="mt-1 text-sm text-surface-400">
          Start evaluating to see results here
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-lg border border-surface-200 bg-white">
      <table className="w-full">
        <thead>
          <tr className="border-b border-surface-200 bg-surface-50">
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-surface-500">
              Conversation
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-surface-500">
              Model
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-surface-500">
              Scores
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-surface-500">
              Latency
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-surface-500">
              Cost
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-surface-500">
              Time
            </th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-surface-100">
          {conversations.map((conversation) => {
            const evaluation = conversation.evaluations?.[0]
            
            return (
              <tr
                key={conversation.id}
                onClick={() => router.push(`/conversations/${conversation.id}`)}
                className="cursor-pointer transition-colors hover:bg-surface-50"
              >
                <td className="px-4 py-4">
                  <div className="max-w-xs">
                    <p className="truncate text-sm font-medium text-surface-900">
                      {truncate(conversation.user_input, 50)}
                    </p>
                    <p className="mt-1 truncate text-xs text-surface-500">
                      {truncate(conversation.model_output, 60)}
                    </p>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className="inline-flex items-center rounded-md bg-surface-100 px-2 py-1 text-xs font-medium text-surface-700">
                    {conversation.model}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    {evaluation ? (
                      <>
                        <ScoreBadge 
                          score={evaluation.coherence_score || 0} 
                          label="C" 
                          size="sm" 
                        />
                        <ScoreBadge 
                          score={evaluation.factuality_score || 0} 
                          label="F" 
                          size="sm" 
                        />
                        {evaluation.safety_risk !== null && evaluation.safety_risk > 0.3 && (
                          <span className="text-xs text-danger">⚠️</span>
                        )}
                      </>
                    ) : (
                      <span className="text-xs text-surface-400">No evaluation</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <span className="text-sm text-surface-600">
                    {formatLatency(conversation.latency_ms)}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <span className="text-sm text-surface-600">
                    {formatCurrency(conversation.cost_usd)}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <span className="text-sm text-surface-500">
                    {formatRelativeTime(conversation.created_at)}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <ChevronRight className="h-4 w-4 text-surface-400" />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  return (
    <div className="flex items-center justify-between border-t border-surface-200 bg-white px-4 py-3">
      <div className="text-sm text-surface-500">
        Page {currentPage} of {totalPages}
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="btn-secondary text-sm disabled:opacity-50"
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="btn-secondary text-sm disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  )
}

