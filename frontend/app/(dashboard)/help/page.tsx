'use client'

import { Header } from '@/components/layout/header'
import { HelpCircle, Book, MessageSquare, ExternalLink, Mail } from 'lucide-react'
import Link from 'next/link'

const faqs = [
  {
    question: 'How does the multi-agent evaluation work?',
    answer: 'Our system uses 7 specialized AI agents that run in parallel to evaluate different aspects of LLM responses: coherence, factuality, safety, helpfulness, SOP compliance, model optimization, and prompt improvement.',
  },
  {
    question: 'What models are supported?',
    answer: 'Currently we support OpenAI models including GPT-4o and GPT-4o-mini. The model router agent can recommend the optimal model based on task complexity and cost requirements.',
  },
  {
    question: 'How is factuality verified?',
    answer: 'The factuality agent extracts claims from responses and verifies them using Tavily search API to check against real-time web sources, detecting potential hallucinations.',
  },
  {
    question: 'What safety categories are checked?',
    answer: 'We check for toxicity, bias, illegal content, and harmful advice. Each category is scored and flagged with recommendations for improvement.',
  },
  {
    question: 'How are costs calculated?',
    answer: 'Costs are calculated based on input and output tokens multiplied by the model\'s pricing. We track this in real-time and show breakdowns by model and time period.',
  },
]

export default function HelpPage() {
  return (
    <div className="min-h-screen">
      <Header
        title="Help & Documentation"
        description="Learn how to use AgentOps Platform"
      />

      <div className="p-6 space-y-8 max-w-4xl">
        {/* Quick Links */}
        <div className="grid gap-4 md:grid-cols-3">
          <Link href="#" className="card hover:border-primary-300 transition-colors group">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary-100 p-2 group-hover:bg-primary-200 transition-colors">
                <Book className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <h3 className="font-semibold text-surface-900">Documentation</h3>
                <p className="text-sm text-surface-500">Read the full docs</p>
              </div>
            </div>
          </Link>
          
          <Link href="#" className="card hover:border-primary-300 transition-colors group">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-accent-100 p-2 group-hover:bg-accent-200 transition-colors">
                <MessageSquare className="h-5 w-5 text-accent-600" />
              </div>
              <div>
                <h3 className="font-semibold text-surface-900">Community</h3>
                <p className="text-sm text-surface-500">Join Discord</p>
              </div>
            </div>
          </Link>
          
          <Link href="#" className="card hover:border-primary-300 transition-colors group">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-success/10 p-2 group-hover:bg-success/20 transition-colors">
                <Mail className="h-5 w-5 text-success" />
              </div>
              <div>
                <h3 className="font-semibold text-surface-900">Support</h3>
                <p className="text-sm text-surface-500">Contact us</p>
              </div>
            </div>
          </Link>
        </div>

        {/* FAQ Section */}
        <div>
          <h2 className="text-xl font-semibold text-surface-900 mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="card">
                <h3 className="font-medium text-surface-900 mb-2">{faq.question}</h3>
                <p className="text-surface-600 text-sm">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* API Reference */}
        <div>
          <h2 className="text-xl font-semibold text-surface-900 mb-4">API Reference</h2>
          <div className="card">
            <h3 className="font-medium text-surface-900 mb-4">Endpoints</h3>
            <div className="space-y-3 font-mono text-sm">
              <div className="flex items-center gap-3 p-2 rounded bg-surface-50">
                <span className="badge bg-success/10 text-success">POST</span>
                <span className="text-surface-700">/api/evaluate</span>
                <span className="text-surface-400 ml-auto">Run multi-agent evaluation</span>
              </div>
              <div className="flex items-center gap-3 p-2 rounded bg-surface-50">
                <span className="badge bg-primary-100 text-primary-700">GET</span>
                <span className="text-surface-700">/api/conversations</span>
                <span className="text-surface-400 ml-auto">List conversations</span>
              </div>
              <div className="flex items-center gap-3 p-2 rounded bg-surface-50">
                <span className="badge bg-primary-100 text-primary-700">GET</span>
                <span className="text-surface-700">/api/conversations/:id</span>
                <span className="text-surface-400 ml-auto">Get conversation details</span>
              </div>
              <div className="flex items-center gap-3 p-2 rounded bg-surface-50">
                <span className="badge bg-success/10 text-success">POST</span>
                <span className="text-surface-700">/api/test-model</span>
                <span className="text-surface-400 ml-auto">Compare models</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

