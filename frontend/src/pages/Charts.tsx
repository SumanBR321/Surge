import { useEffect, useState } from 'react'
import { api } from '../api/client'
import type { DailyScore } from '../types'
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../types'
import { format, subDays } from 'date-fns'
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  ReferenceLine,
} from 'recharts'
import { TrendingUp } from 'lucide-react'

const FMT = 'yyyy-MM-dd'
const DISPLAY = 'MMM d'

interface WeeklyData {
  category: string
  scheduled: number
  completed: number
  adherence_pct: number
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string; color: string }[]; label?: string }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: 'var(--bg-elevated)', border: '1px solid var(--border)',
      borderRadius: 10, padding: '0.6rem 0.9rem', fontSize: '0.8rem',
    }}>
      <p style={{ color: 'var(--text-muted)', marginBottom: 4 }}>{label}</p>
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color, fontWeight: 700 }}>{p.name}: {p.value}</p>
      ))}
    </div>
  )
}

export default function Charts() {
  const [scores, setScores] = useState<DailyScore[]>([])
  const [weekly, setWeekly] = useState<WeeklyData[]>([])
  const [range, setRange] = useState(30)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    const end = format(new Date(), FMT)
    const start = format(subDays(new Date(), range - 1), FMT)
    Promise.all([
      api.getScoreRange(start, end),
      api.getWeeklyAdherence(),
    ]).then(([s, w]) => {
      setScores(s)
      setWeekly(w.data)
    }).finally(() => setLoading(false))
  }, [range])

  const chartData = scores.map(s => ({
    date: format(new Date(s.date), DISPLAY),
    score: s.score,
    avg: s.rolling_avg ?? 0,
  }))

  const adherenceData = weekly.map(w => ({
    name: CATEGORY_LABELS[w.category] ?? w.category,
    pct: w.adherence_pct,
    color: CATEGORY_COLORS[w.category] ?? '#94a3b8',
  }))

  const avg = scores.length ? Math.round(scores.reduce((acc, s) => acc + s.score, 0) / scores.length) : 0
  const best = scores.length ? Math.max(...scores.map(s => s.score)) : 0
  const streak = (() => {
    let count = 0
    for (let i = scores.length - 1; i >= 0; i--) {
      if (scores[i].score >= 50) count++
      else break
    }
    return count
  })()

  return (
    <div style={{ maxWidth: 860, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>Charts</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Track your growth over time</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {[7, 14, 30, 60].map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              style={{
                padding: '0.35rem 0.75rem', borderRadius: 8, fontSize: '0.8rem', fontWeight: 600,
                cursor: 'pointer', border: `1.5px solid ${range === r ? 'var(--accent)' : 'var(--border)'}`,
                background: range === r ? 'var(--accent-glow)' : 'transparent',
                color: range === r ? 'var(--accent)' : 'var(--text-muted)',
                transition: 'all 0.15s ease',
              }}
            >
              {r}d
            </button>
          ))}
        </div>
      </div>

      {/* Stat pills */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
        {[
          { label: 'Average Score', value: avg, color: '#7c6ee6', suffix: '' },
          { label: 'Best Score', value: best, color: '#4ade80', suffix: '' },
          { label: 'Day Streak ≥50', value: streak, color: '#fbbf24', suffix: 'd' },
        ].map(({ label, value, color, suffix }) => (
          <div key={label} className="card" style={{ textAlign: 'center' }}>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 4 }}>{label}</p>
            <p style={{ fontSize: '2rem', fontWeight: 800, color, lineHeight: 1 }}>{value}{suffix}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>Loading chart data…</div>
      ) : (
        <>
          {/* Score + rolling avg line chart */}
          <div className="card" style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <TrendingUp size={16} color="var(--accent)" />
              <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>Daily Growth Score</p>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c6ee6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#7c6ee6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" vertical={false} />
                <XAxis dataKey="date" tick={{ fill: '#5a5a7a', fontSize: 11 }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis domain={[0, 100]} tick={{ fill: '#5a5a7a', fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <ReferenceLine y={50} stroke="#5a5a7a" strokeDasharray="4 4" />
                <Area type="monotone" dataKey="score" stroke="#7c6ee6" strokeWidth={2} fill="url(#scoreGrad)" dot={false} name="Score" />
                <Line type="monotone" dataKey="avg" stroke="#4fc4cf" strokeWidth={2} dot={false} name="7d Avg" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Weekly adherence bar chart */}
          {adherenceData.length > 0 && (
            <div className="card">
              <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: '1rem' }}>
                This Week · Category Adherence
              </p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={adherenceData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#5a5a7a', fontSize: 11 }} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#5a5a7a', fontSize: 11 }} tickLine={false} axisLine={false} />
                  <Tooltip
                    content={({ active, payload, label }) =>
                      active && payload?.length ? (
                        <div style={{
                          background: 'var(--bg-elevated)', border: '1px solid var(--border)',
                          borderRadius: 10, padding: '0.6rem 0.9rem', fontSize: '0.8rem',
                        }}>
                          <p style={{ color: 'var(--text-muted)', marginBottom: 4 }}>{label}</p>
                          <p style={{ color: payload[0].payload.color, fontWeight: 700 }}>{payload[0].value}%</p>
                        </div>
                      ) : null
                    }
                  />
                  <Bar dataKey="pct" name="Adherence %"
                    radius={[4, 4, 0, 0]}
                    fill="#7c6ee6"
                    // colour each bar by category
                    label={false}
                  >
                    {adherenceData.map((entry, i) => (
                      <rect key={i} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.75rem' }}>
                {adherenceData.map(d => (
                  <span key={d.name} style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                    fontSize: '0.72rem', fontWeight: 600, color: d.color,
                    background: d.color + '18', borderRadius: 20, padding: '0.2rem 0.55rem',
                    border: `1px solid ${d.color}40`,
                  }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: d.color, display: 'inline-block' }} />
                    {d.name} {d.pct}%
                  </span>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
