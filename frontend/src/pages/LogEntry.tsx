import { useState } from 'react'
import { api } from '../api/client'
import { CATEGORY_COLORS, CATEGORY_LABELS } from '../types'
import type { Category } from '../types'
import { format } from 'date-fns'
import { PlusCircle, Trash2 } from 'lucide-react'

const CATEGORIES: Category[] = ['college', 'freelance', 'placement', 'project', 'workout', 'learning', 'finance', 'sleep', 'other']
const STATUSES = ['done', 'partial', 'missed', 'pending'] as const

export default function LogEntry() {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [category, setCategory] = useState<Category>('learning')
  const [status, setStatus] = useState<'done' | 'partial' | 'missed' | 'pending'>('done')
  const [minutes, setMinutes] = useState(30)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [flash, setFlash] = useState<string | null>(null)

  const STATUS_COLORS = { done: '#4ade80', partial: '#fbbf24', missed: '#f87171', pending: '#5a5a7a' }

  const submit = async () => {
    setSaving(true)
    try {
      await api.createLog({ date, category, status, minutes_completed: minutes, notes })
      setFlash('Log saved!')
      setNotes('')
    } catch {
      setFlash('Error saving log.')
    } finally {
      setSaving(false)
      setTimeout(() => setFlash(null), 2500)
    }
  }

  return (
    <div style={{ maxWidth: 540, margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>Log Entry</h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Record a block or freeform activity</p>
      </div>

      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>

        {/* Date */}
        <div>
          <label style={labelStyle}>Date</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="input-field"
          />
        </div>

        {/* Category */}
        <div>
          <label style={labelStyle}>Category</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {CATEGORIES.map(cat => {
              const color = CATEGORY_COLORS[cat]
              const active = cat === category
              return (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  style={{
                    padding: '0.35rem 0.75rem', borderRadius: 20, fontSize: '0.78rem', fontWeight: 600,
                    cursor: 'pointer', border: `1.5px solid ${active ? color : 'var(--border)'}`,
                    background: active ? color + '22' : 'var(--bg-elevated)',
                    color: active ? color : 'var(--text-muted)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {CATEGORY_LABELS[cat]}
                </button>
              )
            })}
          </div>
        </div>

        {/* Status */}
        <div>
          <label style={labelStyle}>Status</label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            {STATUSES.map(s => {
              const color = STATUS_COLORS[s]
              const active = s === status
              return (
                <button
                  key={s}
                  onClick={() => setStatus(s)}
                  style={{
                    flex: 1, padding: '0.5rem', borderRadius: 10, fontSize: '0.78rem', fontWeight: 600,
                    cursor: 'pointer', border: `1.5px solid ${active ? color : 'var(--border)'}`,
                    background: active ? color + '22' : 'var(--bg-elevated)',
                    color: active ? color : 'var(--text-muted)',
                    transition: 'all 0.15s ease', textTransform: 'capitalize',
                  }}
                >
                  {s}
                </button>
              )
            })}
          </div>
        </div>

        {/* Minutes */}
        <div>
          <label style={labelStyle}>Minutes Completed</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <input
              type="range" min={0} max={480} step={5} value={minutes}
              onChange={e => setMinutes(+e.target.value)}
              style={{ flex: 1, accentColor: CATEGORY_COLORS[category] }}
            />
            <span style={{
              minWidth: 52, textAlign: 'center', fontWeight: 700, fontSize: '0.9rem',
              color: CATEGORY_COLORS[category],
              background: CATEGORY_COLORS[category] + '18',
              border: `1px solid ${CATEGORY_COLORS[category]}40`,
              borderRadius: 8, padding: '0.25rem 0.5rem',
            }}>
              {minutes}m
            </span>
          </div>
        </div>

        {/* Notes */}
        <div>
          <label style={labelStyle}>Notes (optional)</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="What did you work on?"
            rows={3}
            style={{
              width: '100%', background: 'var(--bg-elevated)', border: '1px solid var(--border)',
              borderRadius: 10, color: 'var(--text-primary)', fontSize: '0.875rem',
              padding: '0.6rem 0.875rem', resize: 'vertical', outline: 'none', fontFamily: 'inherit',
            }}
            onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
            onBlur={e => (e.target.style.borderColor = 'var(--border)')}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            className="btn-primary"
            onClick={submit}
            disabled={saving}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <PlusCircle size={15} />
            {saving ? 'Saving…' : 'Add Log'}
          </button>
          {flash && (
            <span style={{
              fontSize: '0.85rem', fontWeight: 600,
              color: flash.startsWith('Error') ? '#f87171' : '#4ade80',
              animation: 'fadeIn 0.3s ease',
            }}>
              {flash}
            </span>
          )}
        </div>
      </div>

      {/* Recent entries tip */}
      <div style={{
        marginTop: '1.25rem', padding: '0.75rem 1rem',
        background: 'var(--bg-elevated)', borderRadius: 12,
        border: '1px solid var(--border)',
        fontSize: '0.8rem', color: 'var(--text-muted)',
        display: 'flex', alignItems: 'center', gap: '0.5rem',
      }}>
        <Trash2 size={14} />
        Logged entries appear in the Dashboard and Charts pages.
      </div>

      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }`}</style>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: '0.75rem', fontWeight: 600,
  letterSpacing: '0.06em', textTransform: 'uppercase',
  color: 'var(--text-muted)', marginBottom: '0.5rem',
}
