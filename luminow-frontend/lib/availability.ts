/**
 * Pure utility functions for availability calculations.
 * No dependency on the mock store — uses types from lib/types.ts
 */

function toMinutes(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number)
  return h * 60 + m
}

function toHHMM(minutes: number) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`
}

export function addMinutes(hhmm: string, minutes: number) {
  return toHHMM(toMinutes(hhmm) + minutes)
}

/**
 * Returns the next `count` calendar days starting from today (inclusive).
 * Used in the booking flow when the backend API provides availability per-date.
 * The actual open/closed status is determined by the server via the availability endpoint.
 */
export function upcomingDays(count = 30): { date: string; label: string }[] {
  const days: { date: string; label: string }[] = []
  const cursor = new Date()
  for (let i = 0; days.length < count; i++) {
    const date = cursor.toISOString().slice(0, 10)
    const label = cursor.toLocaleDateString("es-MX", {
      weekday: "short",
      day: "numeric",
      month: "short",
    })
    days.push({ date, label })
    cursor.setDate(cursor.getDate() + 1)
  }
  return days
}
