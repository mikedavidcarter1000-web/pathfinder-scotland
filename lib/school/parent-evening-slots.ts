// Parents' evening slot-time math. Converts HH:MM strings to minute-of-day
// integers for simple arithmetic, then back for display. No timezone logic
// because all times are local to the evening.

export function parseTime(t: string): number {
  const [h, m] = t.split(':').map((v) => parseInt(v, 10))
  if (Number.isNaN(h) || Number.isNaN(m)) return 0
  return h * 60 + m
}

export function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
}

export function addMinutes(t: string, minutes: number): string {
  return formatTime(parseTime(t) + minutes)
}

// Given a staff availability window and slot / break durations, return the
// list of booking slot start times that fit in the window. The last slot
// must fully end before availableTo.
export function generateSlots(
  availableFrom: string,
  availableTo: string,
  slotDurationMinutes: number,
  breakMinutes: number,
  maxConsecutive: number
): string[] {
  const start = parseTime(availableFrom)
  const end = parseTime(availableTo)
  const step = slotDurationMinutes + breakMinutes
  if (step <= 0) return []
  const slots: string[] = []
  for (let t = start; t + slotDurationMinutes <= end && slots.length < maxConsecutive; t += step) {
    slots.push(formatTime(t))
  }
  return slots
}

// Normalise a time-only string returned by Postgres (e.g. "15:30:00") down
// to HH:MM. Tolerant of already-short inputs.
export function normaliseTime(t: string | null | undefined): string {
  if (!t) return ''
  const trimmed = t.trim()
  if (trimmed.length <= 5) return trimmed
  return trimmed.slice(0, 5)
}
