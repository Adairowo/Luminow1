import type { Appointment, BusinessHour } from "@/lib/store"

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

/** Next `count` days that are open, respecting business hours. */
export function upcomingOpenDays(hours: BusinessHour[], count = 14) {
  const days: { date: string; label: string }[] = []
  const cursor = new Date()
  for (let i = 0; days.length < count && i < 60; i++) {
    const dow = cursor.getDay()
    const rule = hours.find((h) => h.dayOfWeek === dow)
    if (rule && !rule.isClosed) {
      const date = cursor.toISOString().slice(0, 10)
      const label = cursor.toLocaleDateString("es-MX", {
        weekday: "short",
        day: "numeric",
        month: "short",
      })
      days.push({ date, label })
    }
    cursor.setDate(cursor.getDate() + 1)
  }
  return days
}

/**
 * Generate available start-time slots for a given day, excluding slots that
 * collide with an existing appointment for the chosen staff (or any staff).
 */
export function availableSlots(params: {
  date: string
  hours: BusinessHour[]
  appointments: Appointment[]
  durationMinutes: number
  slotInterval: number
  staffId: number | null
}) {
  const { date, hours, appointments, durationMinutes, slotInterval, staffId } = params
  const dow = new Date(`${date}T00:00:00`).getDay()
  const rule = hours.find((h) => h.dayOfWeek === dow)
  if (!rule || rule.isClosed) return []

  const open = toMinutes(rule.openTime)
  const close = toMinutes(rule.closeTime)
  const now = new Date()
  const isToday = date === now.toISOString().slice(0, 10)
  const nowMinutes = now.getHours() * 60 + now.getMinutes()

  const taken = appointments.filter(
    (a) => a.date === date && a.status !== "cancelled" && (staffId ? a.staffId === staffId : true),
  )

  const slots: string[] = []
  for (let start = open; start + durationMinutes <= close; start += slotInterval) {
    if (isToday && start <= nowMinutes) continue
    const end = start + durationMinutes
    const collides = taken.some((a) => {
      const aStart = toMinutes(a.startTime)
      const aEnd = toMinutes(a.endTime)
      return start < aEnd && end > aStart
    })
    if (!collides) slots.push(toHHMM(start))
  }
  return slots
}
