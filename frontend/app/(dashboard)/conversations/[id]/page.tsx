'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { ScoreBadge, ScoreBar } from '@/components/ui/score-badge'
import { SafetyAlert } from '@/components/ui/safety-alert'
import { agentOpsApi } from '@/lib/api-client'
import { formatCurrency, formatLatency, formatDate } from '@/lib/utils'
import {
  ArrowLeft,
  Clock,
  DollarSign,
  Cpu,
  FileText,
  Lightbulb,
  AlertTriangle,
  CheckCircle,
  Copy,
  Check,
} from 'lucide-react'
import type { ConversationDetail } from '@/lib/types'

export default function ConversationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [conversation, setConversation] = useState<ConversationDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function fetchConversation() {
      try {
        setIsLoading(true)
        const data = await agentOpsApi.getConversation(params.id as string)
        setConversation(data)
      } catch (err) {
        console.error('Failed to fetch conversation:', err)
        // Mock data for demo
        setConversation({
          id: params.id as string,
          user_id: 'user-123',
          session_id: 'session-456',
          user_input: 'How do I implement a binary search algorithm in Python? Please provide a clean implementation with comments.',
          model_output: `Here's a clean implementation of binary search in Python:

\`\`\`python
def binary_search(arr, target):
    """
    Perform binary search on a sorted array.
    
    Args:
        arr: Sorted list of elements
        target: Element to search for
        
    Returns:
        Index of target if found, -1 otherwise
    """
    left, right = 0, len(arr) - 1
    
    while left <= right:
        mid = (left + right) // 2
        
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
            
    return -1
\`\`\`

This implementation has O(log n) time complexity and O(1) space complexity.`,
          model: 'gpt-4o-mini',
          latency_ms: 450,
          input_tokens: 35,
          output_tokens: 180,
          cost_usd: 0.0012,
          created_at: new Date().toISOString(),
          evaluations: [{
            id: 'eval-1',
            conversation_id: params.id as string,
            coherence_score: 0.92,
            factuality_score: 0.95,
            helpfulness_score: 0.88,
            safety_risk: 0.02,
            sop_violations: [],
            evaluator_details: {
              coherence: {
                score: 0.92,
                explanation: 'The response is well-structured with clear sections for the code, explanation, and complexity analysis.',
              },
              factuality: {
                score: 0.95,
                hallucination_likelihood: 0.05,
                corrected_facts: [],
                sources_checked: ['Python documentation', 'Algorithm textbooks'],
              },
              safety: {
                risk_score: 0.02,
                category: 'none',
                explanation: 'The response is safe and contains only technical programming information.',
                recommended_fix: null,
              },
              helpfulness: {
                score: 0.88,
                usefulness_score: 0.92,
                tone_score: 0.85,
                empathy_score: 0.75,
                suggestions: ['Could add example usage', 'Consider adding error handling'],
              },
              model_recommendation: {
                recommended_model: 'gpt-4o-mini',
                cost_estimate: 0.001,
                latency_prediction: 400,
                reasoning: 'For straightforward coding tasks, gpt-4o-mini provides excellent quality at lower cost.',
                alternatives: [],
              },
            },
            created_at: new Date().toISOString(),
          }],
          prompt_improvements: [{
            improved_prompt: 'Write a Python function that implements binary search on a sorted array. Include: 1) Type hints, 2) Docstring with Args/Returns, 3) Comments explaining key steps, 4) Time/space complexity, 5) Example usage.',
            reasoning: 'The improved prompt is more specific about requirements, which leads to more complete and consistent responses.',
            changes_made: [
              'Added explicit requirements list',
              'Requested type hints',
              'Asked for example usage',
            ],
          }],
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchConversation()
  }, [params.id])

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600" />
      </div>
    )
  }

  if (!conversation) {
    return (
      <div className="flex h-screen flex-col items-center justify-center">
        <p className="text-surface-600">Conversation not found</p>
        <button onClick={() => router.back()} className="btn-primary mt-4">
          Go Back
        </button>
      </div>
    )
  }

  const evaluation = conversation.evaluations[0]
  const promptImprovement = conversation.prompt_improvements[0]

  return (
    <div className="min-h-screen">
      <Header
        title="Conversation Details"
        description={`ID: ${conversation.id.slice(0, 8)}...`}
      />

      <div className="p-6 space-y-6">
        {/* Back button and metadata */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-surface-600 hover:text-surface-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Conversations
          </button>
          
          <div className="flex items-center gap-4 text-sm text-surface-500">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {formatDate(conversation.created_at)}
            </span>
            <span className="flex items-center gap-1">
              <Cpu className="h-4 w-4" />
              {conversation.model}
            </span>
            <span className="flex items-center gap-1">
              <DollarSign className="h-4 w-4" />
              {formatCurrency(conversation.cost_usd)}
            </span>
          </div>
        </div>

        {/* Main content grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Conversation */}
          <div className="lg:col-span-2 space-y-6">
            {/* User Input */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-surface-900">User Input</h3>
                <button
                  onClick={() => handleCopy(conversation.user_input)}
                  className="btn-ghost p-2"
                >
                  {copied ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-surface-700 whitespace-pre-wrap">{conversation.user_input}</p>
            </div>

            {/* Model Output */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-surface-900">Model Output</h3>
                <span className="badge badge-primary">{conversation.model}</span>
              </div>
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap text-sm text-surface-700 bg-surface-50 p-4 rounded-lg overflow-x-auto">
                  {conversation.model_output}
                </pre>
              </div>
            </div>

            {/* Prompt Improvement */}
            {promptImprovement && (
              <div className="card border-accent-200 bg-accent-50/30">
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb className="h-5 w-5 text-accent-600" />
                  <h3 className="font-semibold text-surface-900">Suggested Prompt Improvement</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="rounded-lg bg-white p-4 border border-accent-200">
                    <p className="text-sm font-medium text-surface-500 mb-2">Improved Prompt:</p>
                    <p className="text-surface-700">{promptImprovement.improved_prompt}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm font-medium text-surface-500 mb-2">Reasoning:</p>
                    <p className="text-sm text-surface-600">{promptImprovement.reasoning}</p>
                  </div>
                  
                  {promptImprovement.changes_made.length > 0 && (
                    <div>
                      <p className="text-sm font-medium text-surface-500 mb-2">Changes Made:</p>
                      <ul className="list-disc list-inside text-sm text-surface-600 space-y-1">
                        {promptImprovement.changes_made.map((change, i) => (
                          <li key={i}>{change}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Evaluation Sidebar */}
          <div className="space-y-6">
            {/* Scores */}
            <div className="card">
              <h3 className="font-semibold text-surface-900 mb-4">Evaluation Scores</h3>
              <div className="space-y-4">
                <ScoreBar
                  score={evaluation?.coherence_score || 0}
                  label="Coherence"
                />
                <ScoreBar
                  score={evaluation?.factuality_score || 0}
                  label="Factuality"
                />
                <ScoreBar
                  score={evaluation?.helpfulness_score || 0}
                  label="Helpfulness"
                />
                <ScoreBar
                  score={1 - (evaluation?.safety_risk || 0)}
                  label="Safety"
                />
              </div>
            </div>

            {/* Safety Assessment */}
            {evaluation?.evaluator_details?.safety && (
              <SafetyAlert
                riskScore={evaluation.evaluator_details.safety.risk_score}
                category={evaluation.evaluator_details.safety.category as any}
                explanation={evaluation.evaluator_details.safety.explanation}
                recommendedFix={evaluation.evaluator_details.safety.recommended_fix}
              />
            )}

            {/* Telemetry */}
            <div className="card">
              <h3 className="font-semibold text-surface-900 mb-4">Telemetry</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-surface-500">Latency</span>
                  <span className="font-medium">{formatLatency(conversation.latency_ms)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-surface-500">Input Tokens</span>
                  <span className="font-medium">{conversation.input_tokens}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-surface-500">Output Tokens</span>
                  <span className="font-medium">{conversation.output_tokens}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-surface-500">Cost</span>
                  <span className="font-medium">{formatCurrency(conversation.cost_usd)}</span>
                </div>
              </div>
            </div>

            {/* SOP Compliance */}
            <div className="card">
              <h3 className="font-semibold text-surface-900 mb-4">SOP Compliance</h3>
              {evaluation?.sop_violations?.length === 0 ? (
                <div className="flex items-center gap-2 text-success">
                  <CheckCircle className="h-5 w-5" />
                  <span>All SOP rules followed</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {evaluation?.sop_violations?.map((violation, i) => (
                    <div key={i} className="rounded-lg bg-warning/10 p-3">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-warning" />
                        <span className="font-medium text-sm">{violation.rule_name}</span>
                      </div>
                      <p className="text-xs text-surface-600 mt-1">{violation.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

