import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import { createClient } from '@/utils/supabase/client'
import type { 
  EvaluationRequest, 
  EvaluationResponse, 
  ConversationListResponse,
  ConversationDetail,
  DashboardStats,
  ModelTestRequest,
  ModelTestResponse,
} from './types'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

/**
 * Create an Axios instance with Supabase auth interceptor.
 */
function createApiClient(): AxiosInstance {
  const client = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // Add auth token to every request
  client.interceptors.request.use(async (config) => {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`
    }
    
    return config
  })

  // Handle auth errors
  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      if (error.response?.status === 401) {
        // Redirect to login on auth error
        window.location.href = '/login'
      }
      return Promise.reject(error)
    }
  )

  return client
}

// API client instance
const api = createApiClient()

/**
 * API functions for AgentOps backend.
 */
export const agentOpsApi = {
  /**
   * Run multi-agent evaluation on a conversation.
   */
  async evaluate(request: EvaluationRequest): Promise<EvaluationResponse> {
    const { data } = await api.post<EvaluationResponse>('/api/evaluate', request)
    return data
  },

  /**
   * Get paginated list of conversations.
   */
  async getConversations(params?: {
    page?: number
    page_size?: number
    model?: string
    min_safety_risk?: number
  }): Promise<ConversationListResponse> {
    const { data } = await api.get<ConversationListResponse>('/api/conversations', {
      params,
    })
    return data
  },

  /**
   * Get a single conversation with full evaluation details.
   */
  async getConversation(id: string): Promise<ConversationDetail> {
    const { data } = await api.get<ConversationDetail>(`/api/conversations/${id}`)
    return data
  },

  /**
   * Get dashboard overview statistics.
   */
  async getDashboardStats(): Promise<DashboardStats> {
    const { data } = await api.get<DashboardStats>('/api/conversations/stats/overview')
    return data
  },

  /**
   * Test a prompt across multiple models.
   */
  async testModel(request: ModelTestRequest): Promise<ModelTestResponse> {
    const { data } = await api.post<ModelTestResponse>('/api/test-model', request)
    return data
  },

  /**
   * Health check.
   */
  async healthCheck(): Promise<{ status: string }> {
    const { data } = await api.get<{ status: string }>('/health')
    return data
  },
}

export default agentOpsApi

