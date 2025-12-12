'use client'

import { useState } from 'react'
import { Header } from '@/components/layout/header'
import { Send, Loader2, CheckCircle, AlertTriangle } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

export default function TestPage() {
  const supabase = createClient()
  const [userMessage, setUserMessage] = useState('')
  const [aiResponse, setAiResponse] = useState('')
  const [model, setModel] = useState('gpt-5-mini')
  const [isEvaluating, setIsEvaluating] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handleEvaluate = async () => {
    if (!userMessage.trim() || !aiResponse.trim()) {
      setError('Please enter both user message and AI response')
      return
    }

    setIsEvaluating(true)
    setError(null)
    setResult(null)

    try {
      // Get the user's session token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session) {
        throw new Error('You must be logged in to evaluate conversations')
      }

      const response = await fetch(`${API_URL}/api/evaluate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          conversation: [
            { role: 'user', content: userMessage },
            { role: 'assistant', content: aiResponse }
          ],
          model: model,
          session_id: `test-${Date.now()}`
        })
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error:', errorText)
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }

      const data = await response.json()
      console.log('API Response:', data)
      setResult(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsEvaluating(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600'
    if (score >= 0.6) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBg = (score: number) => {
    if (score >= 0.8) return 'bg-green-50 border-green-200'
    if (score >= 0.6) return 'bg-yellow-50 border-yellow-200'
    return 'bg-red-50 border-red-200'
  }

  return (
    <div className="min-h-screen">
      <Header
        title="Test Evaluation"
        description="Test the multi-agent evaluation system with sample conversations"
      />

      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Input Form */}
        <div className="card space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-2">
              User Message
            </label>
            <textarea
              value={userMessage}
              onChange={(e) => setUserMessage(e.target.value)}
              placeholder="What did the user ask?"
              className="w-full px-4 py-3 border border-surface-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 min-h-[100px]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-surface-700 mb-2">
              AI Response
            </label>
            <textarea
              value={aiResponse}
              onChange={(e) => setAiResponse(e.target.value)}
              placeholder="How did the AI respond?"
              className="w-full px-4 py-3 border border-surface-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 min-h-[150px]"
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-surface-700 mb-2">
                Model Used
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full px-4 py-2 border border-surface-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <optgroup label="OpenAI - Latest (2025)">
                  <option value="gpt-5.2">GPT-5.2 ($1.75/$14)</option>
                  <option value="gpt-5.1">GPT-5.1 ($1.25/$10)</option>
                  <option value="gpt-5-mini">GPT-5 Mini ($0.25/$2)</option>
                  <option value="gpt-5-nano">GPT-5 Nano ($0.05/$0.40)</option>
                </optgroup>
                <optgroup label="OpenAI - Reasoning">
                  <option value="o3-pro">o3-pro ($20/$80)</option>
                  <option value="o3">o3 ($2/$8)</option>
                  <option value="o4-mini">o4-mini ($1.10/$4.40)</option>
                </optgroup>
                <optgroup label="OpenAI - Legacy">
                  <option value="gpt-4o">GPT-4o ($2.50/$10)</option>
                </optgroup>
                <optgroup label="Anthropic Claude - Latest (2025)">
                  <option value="claude-opus-4.5">Claude Opus 4.5 ($5/$25)</option>
                  <option value="claude-opus-4.1">Claude Opus 4.1 ($15/$75)</option>
                  <option value="claude-sonnet-4.5">Claude Sonnet 4.5 ($3/$15)</option>
                  <option value="claude-sonnet-4">Claude Sonnet 4 ($3/$15)</option>
                  <option value="claude-haiku-4.5">Claude Haiku 4.5 ($1/$5)</option>
                  <option value="claude-haiku-3.5">Claude Haiku 3.5 ($0.80/$4)</option>
                </optgroup>
                <optgroup label="Google Gemini (2025)">
                  <option value="gemini-3-pro">Gemini 3 Pro ($2/$12)</option>
                  <option value="gemini-2.5-pro">Gemini 2.5 Pro ($1.25/$10)</option>
                  <option value="gemini-2.5-flash">Gemini 2.5 Flash ($0.30/$2.50)</option>
                  <option value="gemini-2.5-flash-lite">Gemini 2.5 Flash Lite ($0.10/$0.40)</option>
                  <option value="gemini-2.0-flash">Gemini 2.0 Flash ($0.10/$0.40)</option>
                </optgroup>
              </select>
            </div>

            <div className="pt-7">
              <button
                onClick={handleEvaluate}
                disabled={isEvaluating}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isEvaluating ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Evaluating...
                  </>
                ) : (
                  <>
                    <Send className="h-5 w-5" />
                    Evaluate
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="card bg-red-50 border-red-200">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="font-medium text-red-900">Error</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
                <p className="text-xs text-red-600 mt-2">
                  Make sure the backend is running and your .env file has OpenAI API key set.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-4">
            {/* Success Message */}
            <div className="card bg-green-50 border-green-200">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <p className="font-medium text-green-900">
                  Evaluation completed successfully! Check the Conversations page to see full details.
                </p>
              </div>
            </div>

            {/* Evaluation Scores */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Evaluation Scores</h3>
              <div className="grid gap-4 md:grid-cols-4">
                <div className={`p-4 border rounded-lg ${getScoreBg(result.coherence?.score || 0)}`}>
                  <p className="text-sm text-surface-600 mb-1">Coherence</p>
                  <p className={`text-3xl font-bold ${getScoreColor(result.coherence?.score || 0)}`}>
                    {((result.coherence?.score || 0) * 100).toFixed(0)}%
                  </p>
                </div>
                <div className={`p-4 border rounded-lg ${getScoreBg(result.factuality?.score || 0)}`}>
                  <p className="text-sm text-surface-600 mb-1">Factuality</p>
                  <p className={`text-3xl font-bold ${getScoreColor(result.factuality?.score || 0)}`}>
                    {((result.factuality?.score || 0) * 100).toFixed(0)}%
                  </p>
                </div>
                <div className={`p-4 border rounded-lg ${getScoreBg(result.helpfulness?.score || 0)}`}>
                  <p className="text-sm text-surface-600 mb-1">Helpfulness</p>
                  <p className={`text-3xl font-bold ${getScoreColor(result.helpfulness?.score || 0)}`}>
                    {((result.helpfulness?.score || 0) * 100).toFixed(0)}%
                  </p>
                </div>
                <div className={`p-4 border rounded-lg ${getScoreBg(1 - (result.safety?.risk_score || 0))}`}>
                  <p className="text-sm text-surface-600 mb-1">Safety Risk</p>
                  <p className={`text-3xl font-bold ${(result.safety?.risk_score || 0) > 0.5 ? 'text-red-600' : 'text-green-600'}`}>
                    {((result.safety?.risk_score || 0) * 100).toFixed(0)}%
                  </p>
                </div>
              </div>
            </div>

            {/* Telemetry */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Telemetry</h3>
              <div className="grid gap-4 md:grid-cols-4">
                <div>
                  <p className="text-sm text-surface-600">Latency</p>
                  <p className="text-xl font-bold">{result.telemetry.latency_ms}ms</p>
                </div>
                <div>
                  <p className="text-sm text-surface-600">Cost</p>
                  <p className="text-xl font-bold">${result.telemetry.cost_usd.toFixed(4)}</p>
                </div>
                <div>
                  <p className="text-sm text-surface-600">Input Tokens</p>
                  <p className="text-xl font-bold">{result.telemetry.input_tokens}</p>
                </div>
                <div>
                  <p className="text-sm text-surface-600">Output Tokens</p>
                  <p className="text-xl font-bold">{result.telemetry.output_tokens}</p>
                </div>
              </div>
            </div>

            {/* Prompt Improvement */}
            {result.prompt_improvement && (
              <div className="card bg-accent-50">
                <h3 className="text-lg font-semibold mb-2">💡 Suggested Prompt Improvement</h3>
                <p className="text-surface-700 mb-3">{result.prompt_improvement.improved_prompt}</p>
                <p className="text-sm text-surface-600">
                  <strong>Why:</strong> {result.prompt_improvement.reasoning}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

