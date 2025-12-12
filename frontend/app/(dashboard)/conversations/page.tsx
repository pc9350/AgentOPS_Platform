'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/layout/header'
import { ConversationsTable, Pagination } from '@/components/tables/conversations-table'
import { agentOpsApi } from '@/lib/api-client'
import { Search, Filter, Download } from 'lucide-react'
import type { ConversationListItem } from '@/lib/types'

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<ConversationListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchQuery, setSearchQuery] = useState('')
  const [modelFilter, setModelFilter] = useState<string>('')
  const [safetyFilter, setSafetyFilter] = useState<string>('')

  const fetchConversations = async () => {
    try {
      setIsLoading(true)
      const data = await agentOpsApi.getConversations({
        page,
        page_size: 20,
        model: modelFilter || undefined,
        min_safety_risk: safetyFilter ? parseFloat(safetyFilter) : undefined,
      })
      setConversations(data.conversations)
      setTotalPages(data.total_pages)
    } catch (err) {
      console.error('Failed to fetch conversations:', err)
      // Set mock data for demo
      setConversations([
        {
          id: '1',
          model: 'gpt-4o-mini',
          latency_ms: 450,
          cost_usd: 0.0012,
          created_at: new Date().toISOString(),
          user_input: 'How do I implement a binary search algorithm in Python?',
          model_output: 'Here\'s how you can implement a binary search algorithm...',
          evaluations: [{
            coherence_score: 0.92,
            factuality_score: 0.95,
            helpfulness_score: 0.88,
            safety_risk: 0.02,
          }],
        },
        {
          id: '2',
          model: 'gpt-4o',
          latency_ms: 820,
          cost_usd: 0.0045,
          created_at: new Date(Date.now() - 3600000).toISOString(),
          user_input: 'Explain quantum computing to a 5 year old',
          model_output: 'Imagine you have a magic box that can look at many things at once...',
          evaluations: [{
            coherence_score: 0.85,
            factuality_score: 0.78,
            helpfulness_score: 0.92,
            safety_risk: 0.01,
          }],
        },
        {
          id: '3',
          model: 'gpt-4o-mini',
          latency_ms: 380,
          cost_usd: 0.0008,
          created_at: new Date(Date.now() - 7200000).toISOString(),
          user_input: 'What are the health benefits of green tea?',
          model_output: 'Green tea has numerous health benefits including...',
          evaluations: [{
            coherence_score: 0.88,
            factuality_score: 0.82,
            helpfulness_score: 0.85,
            safety_risk: 0.15,
          }],
        },
      ])
      setTotalPages(5)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchConversations()
  }, [page, modelFilter, safetyFilter])

  const handleExport = () => {
    // Export to CSV functionality
    const csvContent = conversations.map(c => 
      `"${c.user_input}","${c.model}","${c.latency_ms}","${c.cost_usd}"`
    ).join('\n')
    
    const blob = new Blob([`Input,Model,Latency,Cost\n${csvContent}`], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'conversations.csv'
    a.click()
  }

  return (
    <div className="min-h-screen">
      <Header
        title="Conversations"
        description="Browse and analyze all evaluated conversations"
      />

      <div className="p-6 space-y-6">
        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-10"
              />
            </div>

            {/* Model Filter */}
            <select
              value={modelFilter}
              onChange={(e) => setModelFilter(e.target.value)}
              className="input w-40"
            >
              <option value="">All Models</option>
              <option value="gpt-4o">GPT-4o</option>
              <option value="gpt-4o-mini">GPT-4o Mini</option>
            </select>

            {/* Safety Filter */}
            <select
              value={safetyFilter}
              onChange={(e) => setSafetyFilter(e.target.value)}
              className="input w-40"
            >
              <option value="">All Safety Levels</option>
              <option value="0.6">High Risk (60%+)</option>
              <option value="0.4">Medium Risk (40%+)</option>
              <option value="0.2">Low Risk (20%+)</option>
            </select>
          </div>

          {/* Export Button */}
          <button onClick={handleExport} className="btn-secondary">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </button>
        </div>

        {/* Table */}
        <ConversationsTable conversations={conversations} isLoading={isLoading} />

        {/* Pagination */}
        {!isLoading && conversations.length > 0 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        )}
      </div>
    </div>
  )
}

