'use client'

import { Header } from '@/components/layout/header'
import { Settings, Bell, Shield, Key, User } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="min-h-screen">
      <Header
        title="Settings"
        description="Manage your account and preferences"
      />

      <div className="p-6 space-y-6 max-w-3xl">
        {/* Profile Section */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="rounded-lg bg-primary-100 p-2">
              <User className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-surface-900">Profile</h3>
              <p className="text-sm text-surface-500">Manage your account information</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="label">Display Name</label>
              <input type="text" className="input mt-1" placeholder="Your name" />
            </div>
            <div>
              <label className="label">Email</label>
              <input type="email" className="input mt-1" placeholder="you@example.com" disabled />
              <p className="text-xs text-surface-500 mt-1">Email cannot be changed</p>
            </div>
          </div>
        </div>

        {/* API Keys Section */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="rounded-lg bg-warning/10 p-2">
              <Key className="h-5 w-5 text-warning" />
            </div>
            <div>
              <h3 className="font-semibold text-surface-900">API Configuration</h3>
              <p className="text-sm text-surface-500">Manage your API keys and integrations</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="label">OpenAI API Key</label>
              <input type="password" className="input mt-1" placeholder="sk-..." />
            </div>
            <div>
              <label className="label">Tavily API Key</label>
              <input type="password" className="input mt-1" placeholder="tvly-..." />
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="rounded-lg bg-accent-100 p-2">
              <Bell className="h-5 w-5 text-accent-600" />
            </div>
            <div>
              <h3 className="font-semibold text-surface-900">Notifications</h3>
              <p className="text-sm text-surface-500">Configure alert preferences</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <label className="flex items-center gap-3">
              <input type="checkbox" className="h-4 w-4 rounded border-surface-300" defaultChecked />
              <span className="text-sm text-surface-700">Email alerts for high safety risks</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" className="h-4 w-4 rounded border-surface-300" defaultChecked />
              <span className="text-sm text-surface-700">Weekly usage reports</span>
            </label>
            <label className="flex items-center gap-3">
              <input type="checkbox" className="h-4 w-4 rounded border-surface-300" />
              <span className="text-sm text-surface-700">Daily digest of evaluations</span>
            </label>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button className="btn-primary">Save Changes</button>
        </div>
      </div>
    </div>
  )
}

