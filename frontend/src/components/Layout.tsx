import { NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, BookOpen, BarChart2, Calendar, Settings } from 'lucide-react'

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Today' },
  { to: '/log',       icon: BookOpen,        label: 'Log'   },
  { to: '/charts',    icon: BarChart2,        label: 'Charts'},
  { to: '/weekly',    icon: Calendar,         label: 'Weekly'},
  { to: '/settings',  icon: Settings,         label: 'Config'},
]

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* Sidebar — desktop */}
      <aside style={{
        width: 220,
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        padding: '1.5rem 0',
        position: 'fixed',
        top: 0, left: 0, bottom: 0,
        zIndex: 50,
      }} className="hidden-mobile">
        <div style={{ padding: '0 1.25rem 1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'linear-gradient(135deg, #7c6ee6, #4fc4cf)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: '1rem', color: '#fff',
            }}>S</div>
            <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>Surge</span>
          </div>
        </div>
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2, padding: '0 0.75rem' }}>
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.625rem 0.875rem', borderRadius: 10,
              color: isActive ? 'var(--accent)' : 'var(--text-secondary)',
              background: isActive ? 'var(--accent-glow)' : 'transparent',
              textDecoration: 'none', fontWeight: isActive ? 600 : 400,
              fontSize: '0.875rem', transition: 'all 0.15s ease',
              border: isActive ? '1px solid #7c6ee640' : '1px solid transparent',
            })}>
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div style={{ padding: '1rem 1.25rem 0', color: 'var(--text-muted)', fontSize: '0.7rem' }}>
          Surge v1.0 · Local only
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, marginLeft: 220, padding: '1.5rem', minHeight: '100vh',
        paddingBottom: '5rem' }} className="main-content">
        {children}
      </main>

      {/* Bottom nav — mobile */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'var(--bg-surface)', borderTop: '1px solid var(--border)',
        display: 'flex', justifyContent: 'space-around', padding: '0.5rem 0',
        zIndex: 100,
      }} className="show-mobile">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} style={({ isActive }) => ({
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
            color: isActive ? 'var(--accent)' : 'var(--text-muted)',
            textDecoration: 'none', fontSize: '0.625rem', fontWeight: 600,
            padding: '0.25rem 0.75rem',
          })}>
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
      </nav>

      <style>{`
        @media (max-width: 768px) {
          .hidden-mobile { display: none !important; }
          .main-content { margin-left: 0 !important; padding: 1rem !important; }
        }
        @media (min-width: 769px) {
          .show-mobile { display: none !important; }
        }
      `}</style>
    </div>
  )
}
