'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/layout/header'
import { StatsCard } from '@/components/charts/stats-card'
import { ModelDistributionChart } from '@/components/charts/model-distribution-chart'
import { LatencyChart } from '@/components/charts/latency-chart'
import { SafetyHeatmap } from '@/components/charts/safety-heatmap'
import { ConversationsTable } from '@/components/tables/conversations-table'
import { agentOpsApi } from '@/lib/api-client'
import { formatCurrency, formatLatency, formatNumber } from '@/lib/utils'
import { 
  MessageSquare, 
  DollarSign, 
  Clock, 
  Shield,
  TrendingUp,
  Zap,
} from 'lucide-react'
import type { DashboardStats, ConversationListItem } from '@/lib/types'

// Mock data for demo (replace with real API data)
const mockLatencyData = [
  { date: 'Mon', latency: 450, requests: 23 },
  { date: 'Tue', latency: 520, requests: 31 },
  { date: 'Wed', latency: 380, requests: 28 },
  { date: 'Thu', latency: 410, requests: 35 },
  { date: 'Fri', latency: 490, requests: 42 },
  { date: 'Sat', latency: 350, requests: 18 },
  { date: 'Sun', latency: 420, requests: 25 },
]

const mockSafetyData = [
  { category: 'toxicity', count: 3, avgRisk: 0.7 },
  { category: 'bias', count: 8, avgRisk: 0.4 },
  { category: 'harmful_advice', count: 2, avgRisk: 0.6 },
  { category: 'illegal', count: 0, avgRisk: 0 },
]

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentConversations, setRecentConversations] = useState<ConversationListItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        setIsLoading(true)
        
        // Fetch dashboard stats
        const statsData = await agentOpsApi.getDashboardStats()
        setStats(statsData)
        
        // Fetch recent conversations
        const conversationsData = await agentOpsApi.getConversations({ page_size: 5 })
        setRecentConversations(conversationsData.conversations)
      } catch (err: any) {
        console.error('Failed to fetch dashboard data:', err)
        setError(err.message || 'Failed to load dashboard data')
        
        // Set mock data for demo
        setStats({
          total_conversations: 156,
          total_cost_usd: 12.45,
          avg_latency_ms: 432,
          model_distribution: {
            'gpt-4o': 45,
            'gpt-4o-mini': 111,
          },
          avg_scores: {
            coherence: 0.87,
            factuality: 0.92,
            helpfulness: 0.85,
            safety_risk: 0.08,
          },
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  return (
    <div className="min-h-screen">
      <Header 
        title="Overview" 
        description="Monitor your AI evaluation metrics at a glance" 
      />
      
      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Conversations"
            value={formatNumber(stats?.total_conversations || 0)}
            icon={MessageSquare}
            iconColor="text-primary-600 bg-primary-100"
            trend={{ value: 12, label: 'from last week' }}
          />
          <StatsCard
            title="Total Cost"
            value={formatCurrency(stats?.total_cost_usd || 0)}
            icon={DollarSign}
            iconColor="text-success bg-success/10"
            trend={{ value: -5, label: 'from last week' }}
          />
          <StatsCard
            title="Avg Latency"
            value={formatLatency(stats?.avg_latency_ms || 0)}
            icon={Clock}
            iconColor="text-warning bg-warning/10"
            description="Across all models"
          />
          <StatsCard
            title="Safety Score"
            value={`${((1 - (stats?.avg_scores?.safety_risk || 0)) * 100).toFixed(0)}%`}
            icon={Shield}
            iconColor="text-accent-600 bg-accent-100"
            description="Average safety"
          />
        </div>

        {/* Scores Overview */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="card">
            <div className="flex items-center justify-between">
              <span className="text-sm text-surface-500">Coherence</span>
              <TrendingUp className="h-4 w-4 text-success" />
            </div>
            <p className="mt-2 text-3xl font-bold text-surface-900">
              {((stats?.avg_scores?.coherence || 0) * 100).toFixed(0)}%
            </p>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-surface-100">
              <div
                className="h-full rounded-full bg-primary-500"
                style={{ width: `${(stats?.avg_scores?.coherence || 0) * 100}%` }}
              />
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center justify-between">
              <span className="text-sm text-surface-500">Factuality</span>
              <Zap className="h-4 w-4 text-success" />
            </div>
            <p className="mt-2 text-3xl font-bold text-surface-900">
              {((stats?.avg_scores?.factuality || 0) * 100).toFixed(0)}%
            </p>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-surface-100">
              <div
                className="h-full rounded-full bg-success"
                style={{ width: `${(stats?.avg_scores?.factuality || 0) * 100}%` }}
              />
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center justify-between">
              <span className="text-sm text-surface-500">Helpfulness</span>
              <TrendingUp className="h-4 w-4 text-primary-500" />
            </div>
            <p className="mt-2 text-3xl font-bold text-surface-900">
              {((stats?.avg_scores?.helpfulness || 0) * 100).toFixed(0)}%
            </p>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-surface-100">
              <div
                className="h-full rounded-full bg-accent-500"
                style={{ width: `${(stats?.avg_scores?.helpfulness || 0) * 100}%` }}
              />
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center justify-between">
              <span className="text-sm text-surface-500">Safety</span>
              <Shield className="h-4 w-4 text-success" />
            </div>
            <p className="mt-2 text-3xl font-bold text-surface-900">
              {((1 - (stats?.avg_scores?.safety_risk || 0)) * 100).toFixed(0)}%
            </p>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-surface-100">
              <div
                className="h-full rounded-full bg-success"
                style={{ width: `${(1 - (stats?.avg_scores?.safety_risk || 0)) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Model Distribution */}
          <div className="card">
            <h3 className="text-lg font-semibold text-surface-900">Model Distribution</h3>
            <p className="text-sm text-surface-500">Usage breakdown by model</p>
            <div className="mt-4">
              <ModelDistributionChart data={stats?.model_distribution || {}} />
            </div>
          </div>

          {/* Latency Trend */}
          <div className="card">
            <h3 className="text-lg font-semibold text-surface-900">Latency Trend</h3>
            <p className="text-sm text-surface-500">Average response time over time</p>
            <div className="mt-4">
              <LatencyChart data={mockLatencyData} showArea />
            </div>
          </div>
        </div>

        {/* Safety Heatmap & Recent Conversations */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Safety Heatmap */}
          <div className="card">
            <h3 className="text-lg font-semibold text-surface-900">Safety Overview</h3>
            <p className="text-sm text-surface-500">Risk distribution by category</p>
            <div className="mt-4">
              <SafetyHeatmap data={mockSafetyData} />
            </div>
          </div>

          {/* Recent Conversations */}
          <div className="card lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-surface-900">Recent Conversations</h3>
                <p className="text-sm text-surface-500">Latest evaluated interactions</p>
              </div>
              <a href="/conversations" className="text-sm font-medium text-primary-600 hover:text-primary-700">
                View all →
              </a>
            </div>
            <ConversationsTable conversations={recentConversations} isLoading={isLoading} />
          </div>
        </div>
      </div>
    </div>
  )
}

