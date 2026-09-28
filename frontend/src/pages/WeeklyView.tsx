import { useEffect, useState } from 'react'
import { api } from '../api/client'
import type { WeeklyAdherence } from '../types'
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../types'
import { format, startOfWeek, addDays } from 'date-fns'

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
const DAY_SHORT = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function AdherenceBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div style={{ position: 'relative', height: 8, background: 'var(--bg-elevated)', borderRadius: 4, overflow: 'hidden' }}>
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0,
        width: `${pct}%`, background: color, borderRadius: 4,
        transition: 'width 0.6s cubic-bezier(0.4,0,0.2,1)',
      }} />
    </div>
  )
}

export default function WeeklyView() {
  const [adherence, setAdherence] = useState<WeeklyAdherence | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getWeeklyAdherence()
      .then(d => setAdherence(d))
      .finally(() => setLoading(false))
  }, [])

  // Build week calendar header
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
  const weekDates = DAYS.map((_, i) => addDays(weekStart, i))
  const todayIdx = (new Date().getDay() + 6) % 7 // Mon=0

  return (
    <div style={{ maxWidth: 760, margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>Weekly View</h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {adherence ? `${format(new Date(adherence.week_start), 'MMM d')} – ${format(new Date(adherence.week_end), 'MMM d, yyyy')}` : 'Loading…'}
        </p>
      </div>

      {/* Day strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.4rem', marginBottom: '1.5rem' }}>
        {weekDates.map((d, i) => {
          const isToday = i === todayIdx
          const isPast = i < todayIdx
          return (
            <div key={i} style={{
              textAlign: 'center', padding: '0.6rem 0.25rem',
              borderRadius: 12,
              background: isToday ? 'var(--accent-glow)' : isPast ? 'var(--bg-elevated)' : 'transparent',
              border: `1px solid ${isToday ? 'var(--accent)' : 'var(--border)'}`,
            }}>
              <p style={{ fontSize: '0.65rem', fontWeight: 600, color: isToday ? 'var(--accent)' : 'var(--text-muted)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                {DAY_SHORT[i]}
              </p>
              <p style={{ fontSize: '1rem', fontWeight: isToday ? 800 : 500, color: isToday ? 'var(--accent)' : 'var(--text-primary)', marginTop: 2 }}>
                {format(d, 'd')}
              </p>
            </div>
          )
        })}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading weekly data…</div>
      ) : !adherence || adherence.data.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '3rem', color: 'var(--text-muted)',
          background: 'var(--bg-elevated)', borderRadius: 16, border: '1px solid var(--border)',
        }}>
          No scheduled blocks logged this week yet.
        </div>
      ) : (
        <div className="card">
          <p className="section-label" style={{ marginBottom: '1.25rem' }}>Category Adherence This Week</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
            {adherence.data.map(d => {
              const color = CATEGORY_COLORS[d.category] ?? '#94a3b8'
              const label = CATEGORY_LABELS[d.category] ?? d.category
              return (
                <div key={d.category}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ width: 10, height: 10, borderRadius: 3, background: color }} />
                      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{label}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {d.completed}/{d.scheduled} blocks
                      </span>
                      <span style={{
                        fontSize: '0.8rem', fontWeight: 700,
                        color: d.adherence_pct >= 80 ? '#4ade80' : d.adherence_pct >= 50 ? '#fbbf24' : '#f87171',
                        minWidth: 40, textAlign: 'right',
                      }}>
                        {d.adherence_pct}%
                      </span>
                    </div>
                  </div>
                  <AdherenceBar pct={d.adherence_pct} color={color} />
                </div>
              )
            })}
          </div>

          {/* Summary row */}
          <div style={{
            marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)',
            display: 'flex', gap: '1.5rem', flexWrap: 'wrap',
          }}>
            {(() => {
              const totalSched = adherence.data.reduce((a, d) => a + d.scheduled, 0)
              const totalComp = adherence.data.reduce((a, d) => a + d.completed, 0)
              const overall = totalSched > 0 ? Math.round(totalComp / totalSched * 100) : 0
              const best = adherence.data.reduce((a, d) => d.adherence_pct > a.adherence_pct ? d : a)
              return (
                <>
                  <div>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Overall</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 800, color: overall >= 70 ? '#4ade80' : '#fbbf24' }}>{overall}%</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Total Blocks</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>{totalComp}/{totalSched}</p>
                  </div>
                  <div>
                    <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em' }}>Best Category</p>
                    <p style={{ fontSize: '1rem', fontWeight: 700, color: CATEGORY_COLORS[best.category] ?? '#94a3b8' }}>
                      {CATEGORY_LABELS[best.category] ?? best.category} · {best.adherence_pct}%
                    </p>
                  </div>
                </>
              )
            })()}
          </div>
        </div>
      )}
    </div>
  )
}
