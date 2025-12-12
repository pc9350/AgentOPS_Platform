'use client'

import { useEffect, useState } from 'react'
import { Header } from '@/components/layout/header'
import { createClient } from '@/utils/supabase/client'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { Activity, Cpu, DollarSign, Zap, Clock, AlertCircle, FileText } from 'lucide-react'

interface TelemetryStats {
  timeline: {
    date: string
    input_tokens: number
    output_tokens: number
    cost_usd: number
    count: number
  }[]
  model_costs: Record<string, number>
  latency_distribution: Record<string, number>
  total_input_tokens: number
  total_output_tokens: number
  total_cost: number
}

interface SafetyHeatmap {
  categories: Record<string, {
    count: number
    total_risk: number
    avg_risk: number
  }>
}

const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1']

export default function TelemetryPage() {
  const [telemetry, setTelemetry] = useState<TelemetryStats | null>(null)
  const [safety, setSafety] = useState<SafetyHeatmap | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [days, setDays] = useState(7)
  const supabase = createClient()

  useEffect(() => {
    fetchTelemetry()
  }, [days])

  async function fetchTelemetry() {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setError('Not authenticated')
        setIsLoading(false)
        return
      }

      // Fetch telemetry stats
      const telemetryResponse = await fetch(
        `http://localhost:8000/api/conversations/stats/telemetry?days=${days}`,
        {
          headers: { 'Authorization': `Bearer ${session.access_token}` },
        }
      )

      // Fetch safety heatmap
      const safetyResponse = await fetch(
        'http://localhost:8000/api/conversations/stats/safety-heatmap',
        {
          headers: { 'Authorization': `Bearer ${session.access_token}` },
        }
      )

      if (!telemetryResponse.ok || !safetyResponse.ok) {
        throw new Error('Failed to fetch telemetry data')
      }

      const telemetryData = await telemetryResponse.json()
      const safetyData = await safetyResponse.json()

      setTelemetry(telemetryData)
      setSafety(safetyData)
      setIsLoading(false)
    } catch (err: any) {
      console.error('Failed to fetch telemetry:', err)
      setError(err.message)
      setIsLoading(false)
    }
  }

  if (error) {
    return (
      <div className="min-h-screen">
        <Header
          title="Telemetry"
          description="Detailed metrics and analytics for your AI operations"
        />
        <div className="p-6">
          <div className="card bg-red-50 border-red-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-medium text-red-900">Error loading telemetry data</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Prepare chart data
  const tokenUsageData = telemetry?.timeline.map(t => ({
    date: new Date(t.date).toLocaleDateString('en-US', { weekday: 'short' }),
    input: t.input_tokens,
    output: t.output_tokens,
  })) || []

  const costOverTimeData = telemetry?.timeline.map(t => ({
    date: new Date(t.date).toLocaleDateString('en-US', { weekday: 'short' }),
    cost: t.cost_usd,
  })) || []

  const modelCostsData = telemetry ? Object.entries(telemetry.model_costs).map(([model, cost]) => ({
    model,
    cost: Number(cost.toFixed(4)),
  })) : []

  const latencyData = telemetry ? Object.entries(telemetry.latency_distribution).map(([range, count]) => ({
    range,
    count,
  })) : []

  const safetyCategories = safety ? Object.entries(safety.categories).map(([category, data]) => ({
    category: category.replace(/_/g, ' '),
    count: data.count,
    avgRisk: (data.avg_risk * 100).toFixed(0),
  })) : []

  return (
    <div className="min-h-screen">
      <Header
        title="Telemetry"
        description="Detailed metrics and analytics for your AI operations"
      />

      <div className="p-6 space-y-6">
        {/* Time Range Selector */}
        <div className="flex gap-2">
          {[7, 14, 30, 90].map(d => (
            <button
              key={d}
              onClick={() => setDays(d)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                days === d
                  ? 'bg-primary-600 text-white'
                  : 'bg-surface-100 text-surface-700 hover:bg-surface-200'
              }`}
            >
              {d} days
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-lg bg-surface-100" />
            ))}
          </div>
        ) : telemetry ? (
          <>
            {/* Summary Stats */}
            <div className="grid gap-4 md:grid-cols-4">
              <div className="card">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary-100 p-2">
                    <FileText className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm text-surface-500">Total Tokens</p>
                    <p className="text-2xl font-bold">
                      {((telemetry.total_input_tokens + telemetry.total_output_tokens) / 1000).toFixed(1)}K
                    </p>
                  </div>
                </div>
              </div>
              <div className="card">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-success/10 p-2">
                    <DollarSign className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-sm text-surface-500">Total Cost</p>
                    <p className="text-2xl font-bold">${telemetry.total_cost.toFixed(4)}</p>
                  </div>
                </div>
              </div>
              <div className="card">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-accent-100 p-2">
                    <Zap className="h-5 w-5 text-accent-600" />
                  </div>
                  <div>
                    <p className="text-sm text-surface-500">Input Tokens</p>
                    <p className="text-2xl font-bold">
                      {(telemetry.total_input_tokens / 1000).toFixed(1)}K
                    </p>
                  </div>
                </div>
              </div>
              <div className="card">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-purple-100 p-2">
                    <Activity className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-surface-500">Output Tokens</p>
                    <p className="text-2xl font-bold">
                      {(telemetry.total_output_tokens / 1000).toFixed(1)}K
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Token Usage Over Time */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Token Usage Over Time</h3>
              {tokenUsageData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={tokenUsageData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                    />
                    <Area
                      type="monotone"
                      dataKey="input"
                      stackId="1"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.6}
                      name="Input Tokens"
                    />
                    <Area
                      type="monotone"
                      dataKey="output"
                      stackId="1"
                      stroke="#8b5cf6"
                      fill="#8b5cf6"
                      fillOpacity={0.6}
                      name="Output Tokens"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-surface-500 py-12">No data available</p>
              )}
            </div>

            {/* Cost Over Time */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Cost Over Time</h3>
              {costOverTimeData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={costOverTimeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis dataKey="date" stroke="#6b7280" />
                    <YAxis stroke="#6b7280" />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                      formatter={(value: number) => `$${value.toFixed(4)}`}
                    />
                    <Area
                      type="monotone"
                      dataKey="cost"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.6}
                      name="Cost (USD)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-surface-500 py-12">No data available</p>
              )}
            </div>

            {/* Cost by Model & Latency Distribution */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Cost by Model */}
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">Cost by Model</h3>
                {modelCostsData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={modelCostsData}
                        dataKey="cost"
                        nameKey="model"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={(entry) => `${entry.model}: $${entry.cost}`}
                      >
                        {modelCostsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => `$${value.toFixed(4)}`} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-surface-500 py-12">No data available</p>
                )}
              </div>

              {/* Latency Distribution */}
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">Latency Distribution</h3>
                {latencyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={latencyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis dataKey="range" stroke="#6b7280" />
                      <YAxis stroke="#6b7280" />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                      />
                      <Bar dataKey="count" fill="#3b82f6" name="Count" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-surface-500 py-12">No data available</p>
                )}
              </div>
            </div>

            {/* Safety Heatmap */}
            {safetyCategories.length > 0 && (
              <div className="card">
                <h3 className="text-lg font-semibold mb-4">Safety Issues by Category</h3>
                <div className="space-y-3">
                  {safetyCategories.map((cat) => (
                    <div key={cat.category} className="flex items-center gap-4">
                      <div className="w-32 text-sm font-medium text-surface-700 capitalize">
                        {cat.category}
                      </div>
                      <div className="flex-1 flex items-center gap-2">
                        <div className="flex-1 h-8 bg-surface-100 rounded-lg overflow-hidden">
                          <div
                            className="h-full bg-red-500 transition-all"
                            style={{ width: `${Math.min(cat.count * 10, 100)}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-surface-900 w-16 text-right">
                          {cat.count} issues
                        </span>
                        <span className="text-xs text-surface-500 w-20 text-right">
                          {cat.avgRisk}% avg risk
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="card text-center py-12">
            <Activity className="h-12 w-12 text-surface-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-surface-900 mb-2">No Telemetry Data Yet</h3>
            <p className="text-surface-600">
              Run some evaluations to start collecting telemetry data!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
