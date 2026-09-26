const BASE = '/api'

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`)
  return res.json()
}

export const api = {
  // Timetable
  getBlocksForDay: (day: string) =>
    request<import('../types').TimetableBlock[]>(`/timetable/${day}`),

  // Logs
  getLogsForDate: (date: string) =>
    request<import('../types').DailyLog[]>(`/logs/${date}`),
  createLog: (body: object) =>
    request<import('../types').DailyLog>('/logs/', { method: 'POST', body: JSON.stringify(body) }),
  updateLog: (id: number, body: object) =>
    request<import('../types').DailyLog>(`/logs/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  deleteLog: (id: number) =>
    request<{ ok: boolean }>(`/logs/${id}`, { method: 'DELETE' }),

  // Ratings
  getRating: (date: string) =>
    request<import('../types').DailyRating>(`/ratings/${date}`),
  upsertRating: (body: object) =>
    request<import('../types').DailyRating>('/ratings/', { method: 'PUT', body: JSON.stringify(body) }),

  // Scores
  getScoreRange: (start: string, end: string) =>
    request<import('../types').DailyScore[]>(`/scores/range?start=${start}&end=${end}`),
  getTodayScore: () =>
    request<import('../types').DailyScore>('/scores/today'),

  // Settings
  getWeights: () =>
    request<import('../types').WeightEntry[]>('/settings/weights'),
  updateWeights: (body: import('../types').WeightEntry[]) =>
    request<import('../types').WeightEntry[]>('/settings/weights', { method: 'PUT', body: JSON.stringify(body) }),
  getNonNegotiables: () =>
    request<import('../types').NonNegotiable[]>('/settings/non-negotiables'),

  // Weekly
  getWeeklyAdherence: () =>
    request<import('../types').WeeklyAdherence>('/weekly/adherence'),
}
