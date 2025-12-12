'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { 
  Bell, 
  Search, 
  ChevronDown, 
  LogOut, 
  User, 
  Settings,
  Moon,
  Sun,
} from 'lucide-react'

interface HeaderProps {
  title?: string
  description?: string
}

export function Header({ title, description }: HeaderProps) {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-surface-200 bg-white px-6">
      {/* Left side - Title */}
      <div>
        {title && (
          <h1 className="text-xl font-semibold text-surface-900">{title}</h1>
        )}
        {description && (
          <p className="text-sm text-surface-500">{description}</p>
        )}
      </div>

      {/* Right side - Search & User */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-surface-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 w-64 rounded-lg border border-surface-200 bg-surface-50 pl-9 pr-3 text-sm placeholder:text-surface-400 focus:border-primary-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>

        {/* Notifications */}
        <button className="relative rounded-lg p-2 text-surface-500 hover:bg-surface-100 hover:text-surface-700">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-danger" />
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-surface-100"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-700">
              <User className="h-4 w-4" />
            </div>
            <ChevronDown className="h-4 w-4 text-surface-400" />
          </button>

          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute right-0 z-20 mt-2 w-56 rounded-lg border border-surface-200 bg-white py-1 shadow-lg">
                <div className="border-b border-surface-100 px-4 py-3">
                  <p className="text-sm font-medium text-surface-900">My Account</p>
                  <p className="text-xs text-surface-500">Manage your settings</p>
                </div>
                
                <div className="py-1">
                  <button className="flex w-full items-center gap-3 px-4 py-2 text-sm text-surface-700 hover:bg-surface-50">
                    <User className="h-4 w-4 text-surface-400" />
                    Profile
                  </button>
                  <button className="flex w-full items-center gap-3 px-4 py-2 text-sm text-surface-700 hover:bg-surface-50">
                    <Settings className="h-4 w-4 text-surface-400" />
                    Settings
                  </button>
                </div>

                <div className="border-t border-surface-100 py-1">
                  <button
                    onClick={handleSignOut}
                    className="flex w-full items-center gap-3 px-4 py-2 text-sm text-danger hover:bg-danger/5"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

