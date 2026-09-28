import { useEffect, useState } from 'react'
import { api } from '../api/client'
import type { WeightEntry, NonNegotiable } from '../types'
import { Save, ShieldCheck } from 'lucide-react'

const WEIGHT_META: Record<string, { label: string; description: string; color: string }> = {
  adherence:     { label: 'Timetable Adherence', description: 'Fraction of scheduled blocks done/partial', color: '#7c6ee6' },
  placement:     { label: 'Placement Prep',       description: 'Minutes spent on placement activities',    color: '#a78bfa' },
  learning:      { label: 'Learning',              description: 'Self-study & skill building minutes',      color: '#34d399' },
  workout:       { label: 'Workout',               description: 'Physical activity minutes',               color: '#fb923c' },
  sleep:         { label: 'Sleep Quality',         description: 'Hours slept vs 7.5h target',              color: '#818cf8' },
  self_priority: { label: 'Focus Score',           description: 'Self-rated focus level (1–5)',            color: '#fbbf24' },
}

export default function Settings() {
  const [weights, setWeights] = useState<WeightEntry[]>([])
  const [nonNeg, setNonNeg] = useState<NonNegotiable[]>([])
  const [localW, setLocalW] = useState<Record<string, number>>({})
  const [saving, setSaving] = useState(false)
  const [flash, setFlash] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([api.getWeights(), api.getNonNegotiables()]).then(([w, nn]) => {
      setWeights(w)
      setNonNeg(nn)
      const map: Record<string, number> = {}
      w.forEach(e => { map[e.key] = e.weight })
      setLocalW(map)
    })
  }, [])

  const total = Object.values(localW).reduce((a, v) => a + v, 0)

  const handleSave = async () => {
    setSaving(true)
    try {
      const payload: WeightEntry[] = Object.entries(localW).map(([key, weight]) => ({ key, weight }))
      const updated = await api.updateWeights(payload)
      setWeights(updated)
      setFlash('Weights saved!')
    } catch {
      setFlash('Error saving weights.')
    } finally {
      setSaving(false)
      setTimeout(() => setFlash(null), 2500)
    }
  }

  return (
    <div style={{ maxWidth: 640, margin: '0 auto' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>Config</h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Tune your growth score weights</p>
      </div>

      {/* Weights */}
      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>Score Weights</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{
              fontSize: '0.8rem', fontWeight: 600, padding: '0.25rem 0.65rem', borderRadius: 20,
              background: Math.abs(total - 1) < 0.01 ? '#4ade8018' : '#f8717118',
              color: Math.abs(total - 1) < 0.01 ? '#4ade80' : '#f87171',
              border: `1px solid ${Math.abs(total - 1) < 0.01 ? '#4ade8040' : '#f8717140'}`,
            }}>
              Total: {total.toFixed(2)} / 1.00
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          {weights.map(w => {
            const meta = WEIGHT_META[w.key]
            if (!meta) return null
            const val = localW[w.key] ?? 0
            return (
              <div key={w.key}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <div>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{meta.label}</span>
                    <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 1 }}>{meta.description}</p>
                  </div>
                  <span style={{
                    fontSize: '0.85rem', fontWeight: 800, color: meta.color,
                    background: meta.color + '18', borderRadius: 8, padding: '0.2rem 0.55rem',
                    border: `1px solid ${meta.color}40`, minWidth: 44, textAlign: 'center',
                  }}>
                    {val.toFixed(2)}
                  </span>
                </div>
                <input
                  type="range" min={0} max={1} step={0.05} value={val}
                  onChange={e => setLocalW(prev => ({ ...prev, [w.key]: parseFloat(e.target.value) }))}
                  style={{ width: '100%', accentColor: meta.color }}
                />
              </div>
            )
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
          <button
            className="btn-primary"
            onClick={handleSave}
            disabled={saving}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Save size={14} />
            {saving ? 'Saving…' : 'Save Weights'}
          </button>
          {flash && (
            <span style={{
              fontSize: '0.85rem', fontWeight: 600,
              color: flash.startsWith('Error') ? '#f87171' : '#4ade80',
            }}>
              {flash}
            </span>
          )}
        </div>
      </div>

      {/* Non-negotiables */}
      {nonNeg.length > 0 && (
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <ShieldCheck size={16} color="#7c6ee6" />
            <p style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>Non-Negotiables</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            {nonNeg.map(nn => (
              <div key={nn.id} style={{
                display: 'flex', alignItems: 'flex-start', gap: '0.75rem',
                padding: '0.7rem 0.875rem', background: 'var(--bg-elevated)',
                borderRadius: 10, border: '1px solid var(--border)',
              }}>
                <div style={{
                  flexShrink: 0, marginTop: 2, width: 8, height: 8,
                  borderRadius: '50%', background: '#7c6ee6',
                }} />
                <div>
                  <p style={{ fontSize: '0.75rem', fontWeight: 700, color: '#7c6ee6', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 2 }}>
                    {nn.area}
                  </p>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{nn.rule}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* About card */}
      <div style={{
        marginTop: '1.25rem', padding: '0.875rem 1rem',
        background: 'var(--bg-elevated)', borderRadius: 12,
        border: '1px solid var(--border)',
      }}>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          <strong style={{ color: 'var(--text-secondary)' }}>Surge</strong> · Growth Tracker · Local-only · SQLite backend
          <br />
          Score = Σ(weight × normalized_metric) × 100. Weights should ideally sum to 1.
        </p>
      </div>
    </div>
  )
}
