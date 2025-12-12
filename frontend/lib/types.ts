/**
 * TypeScript types for AgentOps Platform.
 */

// Database types (for Supabase)
export interface Database {
  public: {
    Tables: {
      conversations: {
        Row: {
          id: string
          user_id: string
          session_id: string | null
          user_input: string
          model_output: string
          model: string
          latency_ms: number
          input_tokens: number
          output_tokens: number
          cost_usd: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['conversations']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['conversations']['Insert']>
      }
      evaluations: {
        Row: {
          id: string
          conversation_id: string
          coherence_score: number | null
          factuality_score: number | null
          helpfulness_score: number | null
          safety_risk: number | null
          sop_violations: SOPViolation[]
          evaluator_details: EvaluatorDetails
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['evaluations']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['evaluations']['Insert']>
      }
      prompt_improvements: {
        Row: {
          id: string
          conversation_id: string
          new_prompt: string
          reasoning: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['prompt_improvements']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['prompt_improvements']['Insert']>
      }
    }
  }
}

// Conversation types
export interface ConversationMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface ConversationListItem {
  id: string
  model: string
  latency_ms: number
  cost_usd: number
  created_at: string
  user_input: string
  model_output: string
  evaluations?: EvaluationSummary[]
}

export interface ConversationDetail {
  id: string
  user_id: string
  session_id: string | null
  user_input: string
  model_output: string
  model: string
  latency_ms: number
  input_tokens: number
  output_tokens: number
  cost_usd: number
  created_at: string
  evaluations: EvaluationRecord[]
  prompt_improvements: PromptImprovement[]
}

// Evaluation types
export interface CoherenceResult {
  score: number
  explanation: string
}

export interface FactualityResult {
  score: number
  hallucination_likelihood: number
  corrected_facts: string[]
  sources_checked: string[]
}

export type SafetyCategory = 'toxicity' | 'bias' | 'illegal' | 'harmful_advice' | 'none'

export interface SafetyResult {
  risk_score: number
  category: SafetyCategory
  explanation: string
  recommended_fix: string | null
}

export interface HelpfulnessResult {
  score: number
  usefulness_score: number
  tone_score: number
  empathy_score: number
  suggestions: string[]
}

export interface SOPViolation {
  rule_id: string
  rule_name: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
}

export interface SOPComplianceResult {
  compliant: boolean
  violations: SOPViolation[]
  severity_summary: Record<string, number>
}

export interface ModelRecommendation {
  recommended_model: string
  cost_estimate: number
  latency_prediction: number
  reasoning: string
  alternatives: Array<{
    model: string
    cost_estimate: number
    latency_prediction: number
  }>
}

export interface PromptImprovement {
  improved_prompt: string
  reasoning: string
  changes_made: string[]
}

export interface EvaluatorDetails {
  coherence: CoherenceResult
  factuality: FactualityResult
  safety: SafetyResult
  helpfulness: HelpfulnessResult
  model_recommendation: ModelRecommendation
}

export interface EvaluationSummary {
  coherence_score: number | null
  factuality_score: number | null
  helpfulness_score: number | null
  safety_risk: number | null
}

export interface EvaluationRecord {
  id: string
  conversation_id: string
  coherence_score: number | null
  factuality_score: number | null
  helpfulness_score: number | null
  safety_risk: number | null
  sop_violations: SOPViolation[]
  evaluator_details: EvaluatorDetails
  created_at: string
}

// API Request/Response types
export interface EvaluationRequest {
  conversation: ConversationMessage[]
  session_id?: string
}

export interface EvaluationResponse {
  conversation_id: string
  coherence: CoherenceResult
  factuality: FactualityResult
  safety: SafetyResult
  helpfulness: HelpfulnessResult
  sop_compliance: SOPComplianceResult
  model_recommendation: ModelRecommendation
  prompt_improvement: PromptImprovement | null
  telemetry: {
    latency_ms: number
    input_tokens: number
    output_tokens: number
    cost_usd: number
    model_used: string
  }
}

export interface ConversationListResponse {
  conversations: ConversationListItem[]
  total: number
  page: number
  page_size: number
  total_pages: number
}

export interface DashboardStats {
  total_conversations: number
  total_cost_usd: number
  avg_latency_ms: number
  model_distribution: Record<string, number>
  avg_scores: {
    coherence: number
    factuality: number
    helpfulness: number
    safety_risk: number
  }
}

export interface ModelTestRequest {
  prompt: string
  models?: string[]
}

export interface ModelComparisonResult {
  model: string
  latency_ms: number
  cost_usd: number
  response: string
  coherence_score: number
  factuality_score: number
  safety_risk: number
  helpfulness_score: number
}

export interface ModelTestResponse {
  results: ModelComparisonResult[]
  recommendation: ModelComparisonResult | null
}

