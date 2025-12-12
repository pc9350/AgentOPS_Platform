'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { Mail, Lock, User, ArrowRight, Sparkles, AlertCircle, CheckCircle } from 'lucide-react'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  
  const router = useRouter()
  const supabase = createClient()

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error

      setSuccess(true)
    } catch (err: any) {
      setError(err.message || 'Failed to sign up')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8 text-center">
          <div className="flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-surface-900">Check your email</h2>
            <p className="mt-2 text-surface-600">
              We've sent a confirmation link to <strong>{email}</strong>. 
              Click the link to verify your account.
            </p>
          </div>
          <Link href="/login" className="btn-primary inline-flex">
            Back to Login
          </Link>
        </div>
      </div>
    )
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
            Start Evaluating<br />Your AI Responses
          </h1>
          <p className="text-lg text-surface-300">
            Create your free account and get access to powerful multi-agent 
            evaluation tools. No credit card required.
          </p>
          
          <ul className="space-y-4 pt-6">
            {[
              '7 specialized evaluation agents',
              'Real-time telemetry dashboard',
              'Prompt optimization suggestions',
              'Model comparison & routing',
              'Safety & compliance checks',
            ].map((feature) => (
              <li key={feature} className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-primary-400" />
                <span className="text-surface-300">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="text-sm text-surface-500">
          © 2024 AgentOps Platform. All rights reserved.
        </div>
      </div>

      {/* Right side - Signup form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <div className="lg:hidden flex items-center justify-center gap-3 mb-8">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-500">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold">AgentOps</span>
            </div>
            <h2 className="text-3xl font-bold text-surface-900">Create an account</h2>
            <p className="mt-2 text-surface-600">
              Start your free trial today
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-danger/10 p-4 text-danger">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-6">
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
                    required
                    minLength={6}
                  />
                </div>
                <p className="mt-1 text-xs text-surface-500">Must be at least 6 characters</p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="label">
                  Confirm password
                </label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-surface-400" />
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="input pl-10"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
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
                  Create Account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-surface-600">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-primary-600 hover:text-primary-500">
              Sign in
            </Link>
          </p>

          <p className="text-center text-xs text-surface-500">
            By creating an account, you agree to our{' '}
            <Link href="#" className="underline hover:text-surface-700">Terms of Service</Link>
            {' '}and{' '}
            <Link href="#" className="underline hover:text-surface-700">Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

