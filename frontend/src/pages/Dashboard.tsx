import { useEffect, useState, useCallback } from 'react'
import { api } from '../api/client'
import type { TimetableBlock, DailyLog, DailyRating, DailyScore } from '../types'
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../types'
import { format } from 'date-fns'
import {
  CheckCircle2, Circle, MinusCircle, XCircle,
  Zap, Moon, Star, DollarSign, RefreshCw,
} from 'lucide-react'

const TODAY = format(new Date(), 'yyyy-MM-dd')
const DAY_NAME = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()

type BlockStatus = 'done' | 'partial' | 'missed' | 'pending'

const STATUS_META: Record<BlockStatus, { icon: typeof CheckCircle2; color: string; label: string }> = {
  done:    { icon: CheckCircle2, color: '#4ade80', label: 'Done'    },
  partial: { icon: MinusCircle,  color: '#fbbf24', label: 'Partial' },
  missed:  { icon: XCircle,      color: '#f87171', label: 'Missed'  },
  pending: { icon: Circle,       color: '#5a5a7a', label: 'Pending' },
}

function ScoreRing({ score }: { score: number }) {
  const r = 54
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ
  const color = score >= 80 ? '#4ade80' : score >= 55 ? '#fbbf24' : '#f87171'

  return (
    <div style={{ position: 'relative', width: 140, height: 140, flexShrink: 0 }}>
      <svg width="140" height="140" viewBox="0 0 140 140" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx="70" cy="70" r={r} fill="none" stroke="#2a2a3a" strokeWidth="12" />
        <circle
          cx="70" cy="70" r={r} fill="none"
          stroke={color} strokeWidth="12"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: '2rem', fontWeight: 800, color, lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: '0.65rem', color: '#5a5a7a', fontWeight: 600, letterSpacing: '0.08em' }}>SCORE</span>
      </div>
    </div>
  )
}

function BlockRow({
  block, log, onStatusChange, onMinutesChange,
}: {
  block: TimetableBlock
  log: DailyLog | undefined
  onStatusChange: (blockId: number, logId: number | undefined, status: BlockStatus) => void
  onMinutesChange: (logId: number, minutes: number) => void
}) {
  const status = (log?.status ?? 'pending') as BlockStatus
  const meta = STATUS_META[status]
  const color = CATEGORY_COLORS[block.category]
  const [mins, setMins] = useState(log?.minutes_completed ?? 0)
  const [editing, setEditing] = useState(false)

  useEffect(() => { setMins(log?.minutes_completed ?? 0) }, [log?.minutes_completed])

  const cycleStatus = () => {
    const cycle: BlockStatus[] = ['pending', 'done', 'partial', 'missed']
    const next = cycle[(cycle.indexOf(status) + 1) % cycle.length]
    onStatusChange(block.id, log?.id, next)
  }

  const handleMinsBlur = () => {
    setEditing(false)
    if (log?.id) onMinutesChange(log.id, mins)
  }

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '0.75rem',
      padding: '0.75rem 1rem',
      background: 'var(--bg-elevated)',
      borderRadius: 12,
      border: `1px solid ${status !== 'pending' ? meta.color + '30' : 'var(--border)'}`,
      transition: 'all 0.2s ease',
    }}>
      <div style={{ width: 4, height: 36, borderRadius: 2, background: color, flexShrink: 0 }} />
      <div style={{ minWidth: 88, fontSize: '0.75rem', color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
        {block.start_time}–{block.end_time}
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{block.label}</div>
        <div style={{ fontSize: '0.7rem', color, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 1 }}>
          {CATEGORY_LABELS[block.category]}
        </div>
      </div>
      {editing ? (
        <input
          type="number" min={0} max={480}
          value={mins}
          onChange={e => setMins(+e.target.value)}
          onBlur={handleMinsBlur}
          autoFocus
          style={{
            width: 60, background: 'var(--bg-card)', border: '1px solid var(--accent)',
            borderRadius: 6, color: 'var(--text-primary)', fontSize: '0.8rem',
            padding: '0.2rem 0.4rem', outline: 'none', textAlign: 'center',
          }}
        />
      ) : (
        <button
          onClick={() => setEditing(true)}
          style={{
            background: 'var(--bg-card)', border: '1px solid var(--border)',
            borderRadius: 6, color: 'var(--text-secondary)', fontSize: '0.75rem',
            padding: '0.2rem 0.5rem', cursor: 'pointer', minWidth: 52, textAlign: 'center',
          }}
        >
          {mins}m
        </button>
      )}
      <button
        onClick={cycleStatus}
        title={meta.label}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: meta.color, padding: 2, display: 'flex', borderRadius: 6,
          transition: 'transform 0.15s ease',
        }}
        onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.2)')}
        onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
      >
        <meta.icon size={22} />
      </button>
    </div>
  )
}

function StatChip({ icon, label, color }: { icon: React.ReactNode; label: string; color: string }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
      background: color + '18', border: `1px solid ${color}40`,
      borderRadius: 20, padding: '0.25rem 0.6rem',
      color, fontSize: '0.75rem', fontWeight: 600,
    }}>
      {icon}{label}
    </div>
  )
}

function RatingPanel({ rating, onSave }: {
  rating: DailyRating | null
  onSave: (r: Partial<DailyRating>) => void
}) {
  const [sleep, setSleep] = useState(rating?.sleep_hours ?? 7)
  const [priority, setPriority] = useState(rating?.self_priority_score ?? 3)
  const [savings, setSavings] = useState(rating?.savings_amount ?? 0)
  const [notes, setNotes] = useState(rating?.notes ?? '')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (rating) {
      setSleep(rating.sleep_hours)
      setPriority(rating.self_priority_score)
      setSavings(rating.savings_amount)
      setNotes(rating.notes)
    }
  }, [rating])

  const handleSave = () => {
    onSave({ sleep_hours: sleep, self_priority_score: priority, savings_amount: savings, notes })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <p className="section-label">Daily Vitals</p>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Moon size={16} color="#818cf8" />
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', minWidth: 60 }}>Sleep</span>
        <input
          type="range" min={0} max={12} step={0.5} value={sleep}
          onChange={e => setSleep(+e.target.value)}
          style={{ flex: 1, accentColor: '#818cf8' }}
        />
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#818cf8', minWidth: 36 }}>{sleep}h</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Star size={16} color="#fbbf24" />
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', minWidth: 60 }}>Focus</span>
        <div style={{ display: 'flex', gap: '0.4rem', flex: 1 }}>
          {[1, 2, 3, 4, 5].map(v => (
            <button
              key={v}
              onClick={() => setPriority(v)}
              style={{
                width: 28, height: 28, borderRadius: '50%', border: 'none', cursor: 'pointer',
                background: v <= priority ? `hsl(${60 + (priority - 1) * 24}, 80%, 55%)` : 'var(--bg-elevated)',
                transition: 'all 0.15s ease',
                transform: v === priority ? 'scale(1.15)' : 'scale(1)',
              }}
            />
          ))}
        </div>
        <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fbbf24', minWidth: 16 }}>{priority}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <DollarSign size={16} color="#4ade80" />
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', minWidth: 60 }}>Savings</span>
        <input
          type="number" min={0} step={50} value={savings}
          onChange={e => setSavings(+e.target.value)}
          style={{
            flex: 1, background: 'var(--bg-elevated)', border: '1px solid var(--border)',
            borderRadius: 8, color: 'var(--text-primary)', fontSize: '0.85rem',
            padding: '0.35rem 0.6rem', outline: 'none',
          }}
          onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
          onBlur={e => (e.target.style.borderColor = 'var(--border)')}
        />
        <span style={{ color: '#4ade80', fontSize: '0.8rem', minWidth: 16 }}>₹</span>
      </div>

      <textarea
        value={notes}
        onChange={e => setNotes(e.target.value)}
        placeholder="Reflection…"
        rows={2}
        style={{
          background: 'var(--bg-elevated)', border: '1px solid var(--border)',
          borderRadius: 10, color: 'var(--text-primary)', fontSize: '0.85rem',
          padding: '0.5rem 0.75rem', resize: 'vertical', outline: 'none',
          width: '100%', fontFamily: 'inherit',
        }}
        onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
        onBlur={e => (e.target.style.borderColor = 'var(--border)')}
      />

      <button
        onClick={handleSave}
        className="btn-primary"
        style={{ alignSelf: 'flex-end', background: saved ? '#4ade80' : undefined, transition: 'background 0.3s' }}
      >
        {saved ? '✓ Saved' : 'Save Vitals'}
      </button>
    </div>
  )
}

export default function Dashboard() {
  const [blocks, setBlocks] = useState<TimetableBlock[]>([])
  const [logs, setLogs] = useState<DailyLog[]>([])
  const [rating, setRating] = useState<DailyRating | null>(null)
  const [score, setScore] = useState<DailyScore | null>(null)
  const [loading, setLoading] = useState(true)
  const [spinning, setSpinning] = useState(false)

  const reload = useCallback(async () => {
    setSpinning(true)
    setLoading(true)
    try {
      const [b, l, s] = await Promise.all([
        api.getBlocksForDay(DAY_NAME),
        api.getLogsForDate(TODAY),
        api.getTodayScore(),
      ])
      setBlocks(b)
      setLogs(l)
      setScore(s)
      try { setRating(await api.getRating(TODAY)) } catch { setRating(null) }
    } finally {
      setLoading(false)
      setTimeout(() => setSpinning(false), 400)
    }
  }, [])

  useEffect(() => { reload() }, [reload])

  const getLogForBlock = (blockId: number) => logs.find(l => l.block_id === blockId)

  const handleStatusChange = async (blockId: number, logId: number | undefined, status: BlockStatus) => {
    if (logId !== undefined) {
      await api.updateLog(logId, { status })
    } else {
      await api.createLog({
        date: TODAY, block_id: blockId,
        category: blocks.find(b => b.id === blockId)!.category,
        status, minutes_completed: 0,
      })
    }
    const [l, s] = await Promise.all([api.getLogsForDate(TODAY), api.getTodayScore()])
    setLogs(l)
    setScore(s)
  }

  const handleMinutesChange = async (logId: number, minutes: number) => {
    await api.updateLog(logId, { minutes_completed: minutes })
    const s = await api.getTodayScore()
    setScore(s)
  }

  const handleRatingSave = async (r: Partial<DailyRating>) => {
    const saved = await api.upsertRating({ date: TODAY, ...r } as DailyRating)
    setRating(saved)
    const s = await api.getTodayScore()
    setScore(s)
  }

  const doneCount = logs.filter(l => l.status === 'done' || l.status === 'partial').length
  const dateLabel = new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div style={{ maxWidth: 720, margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>Today</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{dateLabel}</p>
        </div>
        <button
          onClick={reload}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4 }}
          title="Refresh"
        >
          <RefreshCw size={16} style={{ animation: spinning ? 'spin 0.8s linear infinite' : 'none' }} />
        </button>
      </div>

      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
        <ScoreRing score={score?.score ?? 0} />
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: 200 }}>
          <div>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Growth Score</p>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: 2 }}>
              {doneCount} / {blocks.length} blocks completed
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <StatChip icon={<Moon size={12} />} label={`${rating?.sleep_hours ?? '–'}h sleep`} color="#818cf8" />
            <StatChip icon={<Star size={12} />} label={`Focus ${rating?.self_priority_score ?? '–'}/5`} color="#fbbf24" />
            <StatChip icon={<Zap size={12} />} label={`Score ${score?.score ?? 0}`} color="#7c6ee6" />
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '1.25rem' }}>
        <p className="section-label">Schedule</p>
        {loading ? (
          <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>Loading…</div>
        ) : blocks.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '2rem', color: 'var(--text-muted)',
            background: 'var(--bg-elevated)', borderRadius: 12,
          }}>
            No blocks scheduled for today.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {blocks.map(block => (
              <BlockRow
                key={block.id}
                block={block}
                log={getLogForBlock(block.id)}
                onStatusChange={handleStatusChange}
                onMinutesChange={handleMinutesChange}
              />
            ))}
          </div>
        )}
      </div>

      <RatingPanel rating={rating} onSave={handleRatingSave} />
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
