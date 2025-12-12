'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { Mail, Lock, ArrowRight, Sparkles, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isMagicLink, setIsMagicLink] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'
  const supabase = createClient()

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      console.log('Attempting login with:', email)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      console.log('Login response:', { data, error })

      if (error) throw error

      // Check if we have a session
      const { data: sessionData } = await supabase.auth.getSession()
      console.log('Session after login:', sessionData)

      // Force a hard navigation to ensure cookies are sent with the request
      const targetUrl = redirect || '/'
      console.log('Redirecting to:', targetUrl)
      
      // Use setTimeout to ensure state updates complete first
      setTimeout(() => {
        window.location.replace(targetUrl)
      }, 100)
    } catch (err: any) {
      console.error('Login error:', err)
      setError(err.message || 'Failed to sign in')
      setIsLoading(false)
    }
  }

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${redirect}`,
        },
      })

      if (error) throw error

      setMessage('Check your email for the magic link!')
    } catch (err: any) {
      setError(err.message || 'Failed to send magic link')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-mesh bg-surface-900 flex-col justify-between p-12">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">AgentOps</span>
          </div>
        </div>
        
        <div className="space-y-6">
          <h1 className="text-4xl font-bold text-white">
            Multi-Agent Evaluation<br />& Optimization Platform
          </h1>
          <p className="text-lg text-surface-300">
            Evaluate, monitor, and optimize your LLM responses with intelligent 
            multi-agent analysis. Track coherence, factuality, safety, and more.
          </p>
          
          <div className="grid grid-cols-2 gap-4 pt-6">
            {[
              { label: 'Coherence', value: '94%' },
              { label: 'Factuality', value: '98%' },
              { label: 'Safety', value: '99%' },
              { label: 'Helpfulness', value: '91%' },
            ].map((stat) => (
              <div key={stat.label} className="rounded-lg bg-white/5 p-4 backdrop-blur">
                <div className="text-2xl font-bold text-primary-400">{stat.value}</div>
                <div className="text-sm text-surface-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="text-sm text-surface-500">
          © 2024 AgentOps Platform. All rights reserved.
        </div>
      </div>

      {/* Right side - Login form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold">AgentOps</span>
            </div>
            <h2 className="text-3xl font-bold text-surface-900">Welcome back</h2>
            <p className="mt-2 text-surface-600">
              Sign in to your account to continue
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-danger/10 p-4 text-danger">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {message && (
            <div className="flex items-center gap-2 rounded-lg bg-success/10 p-4 text-success">
              <Mail className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm">{message}</span>
            </div>
          )}

          <form onSubmit={isMagicLink ? handleMagicLink : handleEmailLogin} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label htmlFor="email" className="label">
                  Email address
                </label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-surface-400" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input pl-10"
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              {!isMagicLink && (
                <div>
                  <label htmlFor="password" className="label">
                    Password
                  </label>
                  <div className="relative mt-1">
                    <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-surface-400" />
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input pl-10"
                      placeholder="••••••••"
                      required={!isMagicLink}
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full"
            >
              {isLoading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <>
                  {isMagicLink ? 'Send Magic Link' : 'Sign In'}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-surface-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-surface-50 px-2 text-surface-500">or</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsMagicLink(!isMagicLink)}
            className="btn-secondary w-full"
          >
            {isMagicLink ? 'Sign in with password' : 'Sign in with magic link'}
          </button>

          <p className="text-center text-sm text-surface-600">
            Don't have an account?{' '}
            <Link href="/signup" className="font-medium text-primary-600 hover:text-primary-500">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

