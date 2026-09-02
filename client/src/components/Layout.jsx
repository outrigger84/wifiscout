import { NavLink } from 'react-router-dom'
import { Wifi, List, Map, PlusCircle, Settings, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/', label: 'Venues', icon: List, end: true },
  { to: '/map', label: 'Map', icon: Map },
  { to: '/log', label: 'Log a visit', icon: PlusCircle },
  { to: '/setup', label: 'Setup', icon: Settings },
]

export default function Layout({ children }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {open && (
        <div className="fixed inset-0 z-20 bg-black/40 md:hidden" onClick={() => setOpen(false)} />
      )}

      <aside className={cn(
        'fixed inset-y-0 left-0 z-30 flex flex-col w-56 bg-slate-900 text-slate-100 transition-transform duration-200 md:static md:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex items-center gap-2 px-4 py-4 border-b border-slate-700">
          <Wifi className="w-6 h-6 text-cyan-400" />
          <span className="font-semibold text-base tracking-tight">WifiScout</span>
          <button className="ml-auto md:hidden" onClick={() => setOpen(false)}>
            <X className="w-4 h-4" />
          </button>
        </div>
        <nav className="flex-1 py-4 space-y-0.5 px-2">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setOpen(false)}
              className={({ isActive }) => cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-cyan-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <header className="flex items-center gap-3 px-4 py-3 border-b bg-white md:hidden shrink-0">
          <button onClick={() => setOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Wifi className="w-5 h-5 text-cyan-600" />
            <span className="font-semibold text-sm">WifiScout</span>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
