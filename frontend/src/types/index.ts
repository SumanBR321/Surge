// Shared TypeScript types for the Surge app

export type Category =
  | 'college' | 'freelance' | 'placement' | 'project'
  | 'workout' | 'learning' | 'finance' | 'sleep' | 'other'

export type BlockStatus = 'done' | 'partial' | 'missed' | 'pending'

export interface TimetableBlock {
  id: number
  day_of_week: string
  start_time: string
  end_time: string
  category: Category
  label: string
}

export interface DailyLog {
  id: number
  date: string
  block_id: number | null
  category: Category
  minutes_completed: number
  status: BlockStatus
  notes: string
}

export interface DailyRating {
  id: number
  date: string
  sleep_hours: number
  self_priority_score: number
  savings_amount: number
  notes: string
}

export interface DailyScore {
  date: string
  score: number
  rolling_avg: number | null
}

export interface WeightEntry {
  key: string
  weight: number
}

export interface NonNegotiable {
  id: number
  area: string
  rule: string
}

export interface WeeklyAdherence {
  week_start: string
  week_end: string
  data: {
    category: Category
    scheduled: number
    completed: number
    adherence_pct: number
  }[]
}

export const CATEGORY_COLORS: Record<string, string> = {
  college: '#60a5fa',
  placement: '#a78bfa',
  learning: '#34d399',
  workout: '#fb923c',
  freelance: '#f472b6',
  project: '#38bdf8',
  finance: '#facc15',
  sleep: '#818cf8',
  other: '#94a3b8',
}

export const CATEGORY_LABELS: Record<string, string> = {
  college: 'College',
  placement: 'Placement',
  learning: 'Learning',
  workout: 'Workout',
  freelance: 'Freelance',
  project: 'Project',
  finance: 'Finance',
  sleep: 'Sleep',
  other: 'Other',
}
