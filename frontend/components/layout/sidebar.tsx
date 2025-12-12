'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  MessageSquare,
  Sparkles,
  Activity,
  Settings,
  HelpCircle,
  Beaker,
} from 'lucide-react'

const navigation = [
  { name: 'Overview', href: '/', icon: LayoutDashboard },
  { name: 'Conversations', href: '/conversations', icon: MessageSquare },
  { name: 'Test Evaluation', href: '/test', icon: Beaker },
  { name: 'Optimization', href: '/optimization', icon: Sparkles },
  { name: 'Telemetry', href: '/telemetry', icon: Activity },
]

const secondaryNavigation = [
  { name: 'Settings', href: '/settings', icon: Settings },
  { name: 'Help', href: '/help', icon: HelpCircle },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col border-r border-surface-200 bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-surface-200 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-500">
          <Sparkles className="h-5 w-5 text-white" />
        </div>
        <span className="text-lg font-bold text-surface-900">AgentOps</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/' && pathname?.startsWith(item.href))
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900'
                )}
              >
                <item.icon className={cn(
                  'h-5 w-5',
                  isActive ? 'text-primary-600' : 'text-surface-400'
                )} />
                {item.name}
              </Link>
            )
          })}
        </div>

        <div className="my-4 border-t border-surface-200" />

        <div className="space-y-1">
          {secondaryNavigation.map((item) => {
            const isActive = pathname === item.href
            
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-surface-600 hover:bg-surface-100 hover:text-surface-900'
                )}
              >
                <item.icon className={cn(
                  'h-5 w-5',
                  isActive ? 'text-primary-600' : 'text-surface-400'
                )} />
                {item.name}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-surface-200 p-4">
        <div className="rounded-lg bg-gradient-to-br from-primary-500/10 to-accent-500/10 p-4">
          <p className="text-sm font-medium text-surface-900">Need help?</p>
          <p className="mt-1 text-xs text-surface-600">
            Check out our docs for guides and API reference.
          </p>
          <Link
            href="#"
            className="mt-3 inline-flex text-xs font-medium text-primary-600 hover:text-primary-700"
          >
            View Documentation →
          </Link>
        </div>
      </div>
    </div>
  )
}

