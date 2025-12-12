'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/layout/header'
import { createClient } from '@/utils/supabase/client'
import { 
  Lightbulb, 
  ArrowRight, 
  TrendingUp, 
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from 'lucide-react'

interface PromptImprovement {
  id: string
  created_at: string
  model: string
  original_prompt: string
  improved_prompt: string
  reasoning: string
  changes_made: string[]
}

export default function OptimizationPage() {
  const [improvements, setImprovements] = useState<PromptImprovement[]>([])
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchImprovements()
  }, [])

  async function fetchImprovements() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setError('Not authenticated')
        setIsLoading(false)
        return
      }

      const response = await fetch('http://localhost:8000/api/prompt-improvements', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }

      const data = await response.json()
      setImprovements(data.improvements || [])
      setIsLoading(false)
    } catch (err: any) {
      console.error('Failed to fetch improvements:', err)
      setError(err.message)
      setIsLoading(false)
    }
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <Header
          title="Prompt Optimization"
          description="AI-suggested improvements to your prompts"
        />
        <div className="p-6">
          <div className="card bg-red-50 border-red-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-medium text-red-900">Error loading prompt improvements</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Header
        title="Prompt Optimization"
        description="AI-suggested improvements to your prompts"
      />

      <div className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-accent-100 p-2">
                <Lightbulb className="h-5 w-5 text-accent-600" />
              </div>
              <div>
                <p className="text-sm text-surface-500">Total Improvements</p>
                <p className="text-2xl font-bold">{improvements.length}</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-success/10 p-2">
                <TrendingUp className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm text-surface-500">Prompts Optimized</p>
                <p className="text-2xl font-bold">{improvements.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Optimizations List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-surface-900">Recent Improvements</h2>
          
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-32 animate-pulse rounded-lg bg-surface-100" />
              ))}
            </div>
          ) : improvements.length === 0 ? (
            <div className="card text-center py-12">
              <Lightbulb className="h-12 w-12 text-surface-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-surface-900 mb-2">No Prompt Improvements Yet</h3>
              <p className="text-surface-600">
                Run some evaluations on the Test page to get AI-suggested prompt improvements!
              </p>
            </div>
          ) : (
            improvements.map((imp) => {
              const isExpanded = expandedId === imp.id

              return (
                <div key={imp.id} className="card">
                  {/* Header */}
                  <div
                    className="flex items-start justify-between cursor-pointer"
                    onClick={() => setExpandedId(isExpanded ? null : imp.id)}
                  >
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <Lightbulb className="h-5 w-5 text-accent-500" />
                        <span className="badge badge-accent">{imp.model}</span>
                        <span className="text-xs text-surface-500">
                          {new Date(imp.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-surface-700 font-medium line-clamp-2">{imp.original_prompt}</p>
                    </div>
                    <button className="p-2 text-surface-400 hover:text-surface-600">
                      {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                    </button>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="mt-6 space-y-6 border-t border-surface-200 pt-6">
                      {/* Before/After Comparison */}
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="rounded-lg bg-surface-50 p-4">
                          <p className="text-sm font-medium text-surface-500 mb-2">Original Prompt</p>
                          <p className="text-surface-700">{imp.original_prompt}</p>
                        </div>
                        <div className="rounded-lg bg-accent-50 border border-accent-200 p-4">
                          <div className="flex items-center gap-2 mb-2">
                            <ArrowRight className="h-4 w-4 text-accent-600" />
                            <p className="text-sm font-medium text-accent-700">Improved Prompt</p>
                          </div>
                          <p className="text-surface-700">{imp.improved_prompt}</p>
                        </div>
                      </div>

                      {/* Reasoning */}
                      <div>
                        <p className="text-sm font-medium text-surface-500 mb-2">Why This Improvement?</p>
                        <p className="text-surface-600">{imp.reasoning}</p>
                      </div>

                      {/* Changes Made */}
                      {imp.changes_made && imp.changes_made.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-surface-500 mb-2">Changes Made</p>
                          <ul className="space-y-2">
                            {imp.changes_made.map((change, i) => (
                              <li key={i} className="flex items-start gap-2 text-sm text-surface-600">
                                <div className="h-1.5 w-1.5 rounded-full bg-accent-500 mt-1.5" />
                                <span>{change}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </div>
    </div>
  )
}
