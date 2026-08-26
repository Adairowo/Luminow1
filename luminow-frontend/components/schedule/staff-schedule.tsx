"use client"

import { useEffect, useState } from "react"
import { Loader2, Check, Users } from "lucide-react"
import { motion } from "motion/react"

import api from "@/lib/axios"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { DayScheduleCard, type DayScheduleData } from "@/components/schedule/day-schedule-card"
import { ScheduleToolbar } from "@/components/schedule/schedule-toolbar"

type StaffMember = {
  id: number
  name: string
  is_active: boolean
}

type StaffScheduleEntry = {
  day_of_week: number
  start_time: string | null
  end_time: string | null
  break_start: string | null
  break_end: string | null
  is_day_off: boolean
}

const DAY_NAMES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]

function initials(name: string) {
  return name.split(" ").slice(0, 2).map((n) => n[0]).join("").toUpperCase()
}

function apiToLocal(entry: StaffScheduleEntry): DayScheduleData {
  return {
    dayOfWeek: entry.day_of_week,
    dayName: DAY_NAMES[entry.day_of_week],
    isOpen: !entry.is_day_off,
    openTime: entry.start_time,
    closeTime: entry.end_time,
    breakStart: entry.break_start,
    breakEnd: entry.break_end,
  }
}

function localToApi(d: DayScheduleData): StaffScheduleEntry {
  return {
    day_of_week: d.dayOfWeek,
    start_time: d.isOpen ? d.openTime : null,
    end_time: d.isOpen ? d.closeTime : null,
    break_start: d.isOpen ? d.breakStart : null,
    break_end: d.isOpen ? d.breakEnd : null,
    is_day_off: !d.isOpen,
  }
}

function StaffSchedule() {
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [schedule, setSchedule] = useState<DayScheduleData[]>([])
  const [loadingStaff, setLoadingStaff] = useState(true)
  const [loadingSchedule, setLoadingSchedule] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Fetch staff list
  useEffect(() => {
    async function fetchStaff() {
      try {
        const res = await api.get("/api/v1/tenant/staff")
        const members: StaffMember[] = (res.data.data ?? []).filter((s: StaffMember) => s.is_active)
        setStaff(members)
        if (members.length > 0) {
          setSelectedId(members[0].id)
        }
      } catch (err) {
        console.error("Error fetching staff", err)
      } finally {
        setLoadingStaff(false)
      }
    }
    fetchStaff()
  }, [])

  // Fetch schedule when staff changes
  useEffect(() => {
    if (!selectedId) return
    async function fetchSchedule() {
      setLoadingSchedule(true)
      setSaved(false)
      try {
        const res = await api.get(`/api/v1/tenant/staff/${selectedId}/schedule`)
        const entries: StaffScheduleEntry[] = res.data.data ?? []
        setSchedule(entries.sort((a, b) => a.day_of_week - b.day_of_week).map(apiToLocal))
      } catch (err) {
        console.error("Error fetching schedule", err)
      } finally {
        setLoadingSchedule(false)
      }
    }
    fetchSchedule()
  }, [selectedId])

  function updateDay(dayOfWeek: number, patch: Partial<DayScheduleData>) {
    setSaved(false)
    setSchedule((prev) =>
      prev.map((d) => (d.dayOfWeek === dayOfWeek ? { ...d, ...patch } : d))
    )
  }

  async function save() {
    if (!selectedId) return
    setSaving(true)
    try {
      await api.put(`/api/v1/tenant/staff/${selectedId}/schedule`, {
        schedule: schedule.map(localToApi),
      })
      setSaved(true)
    } catch (err) {
      alert("Error al guardar el horario del empleado")
    } finally {
      setSaving(false)
    }
  }

  function copyMondayToWeekdays() {
    const monday = schedule.find((d) => d.dayOfWeek === 1)
    if (!monday) return
    setSaved(false)
    setSchedule((prev) =>
      prev.map((d) => {
        if (d.dayOfWeek >= 2 && d.dayOfWeek <= 5) {
          return { ...d, isOpen: monday.isOpen, openTime: monday.openTime, closeTime: monday.closeTime, breakStart: monday.breakStart, breakEnd: monday.breakEnd }
        }
        return d
      })
    )
  }

  function openAll() {
    setSaved(false)
    setSchedule((prev) =>
      prev.map((d) => ({
        ...d,
        isOpen: true,
        openTime: d.openTime ?? "09:00",
        closeTime: d.closeTime ?? "19:00",
      }))
    )
  }

  function toggleAllBreaks(enabled: boolean) {
    setSaved(false)
    setSchedule((prev) =>
      prev.map((d) => {
        if (!d.isOpen) return d
        return {
          ...d,
          breakStart: enabled ? "13:00" : null,
          breakEnd: enabled ? "14:00" : null,
        }
      })
    )
  }

  const hasBreaks = schedule.some((d) => d.breakStart && d.breakEnd)

  if (loadingStaff) {
    return (
      <div className="flex flex-col gap-4">
        <div className="flex gap-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-10 w-28 bg-muted rounded-lg animate-pulse" />
          ))}
        </div>
        <div className="space-y-3">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (staff.length === 0) {
    return (
      <div className="py-16 text-center border border-dashed border-border/70 rounded-xl bg-muted/10 flex flex-col items-center justify-center gap-2">
        <Users className="size-8 text-muted-foreground/45 mb-1" />
        <p className="font-semibold text-foreground/80 text-sm">No hay personal activo</p>
        <p className="text-xs text-muted-foreground">
          Agrega colaboradores desde la sección de Personal para configurar sus horarios individuales.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Staff Selector */}
      <div className="flex flex-col gap-3">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60">
          Seleccionar colaborador
        </label>
        <div className="flex flex-wrap gap-2">
          {staff.map((s) => {
            const active = s.id === selectedId
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => setSelectedId(s.id)}
                className={cn(
                  "relative flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 cursor-pointer select-none border",
                  active
                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                    : "bg-card text-foreground/80 border-border/60 hover:bg-muted/40 hover:border-border hover:text-foreground",
                )}
              >
                <div
                  className={cn(
                    "flex size-7 items-center justify-center rounded-full text-[10px] font-bold",
                    active
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-primary/10 text-primary border border-primary/10",
                  )}
                >
                  {initials(s.name)}
                </div>
                {s.name}
                {active && (
                  <motion.div
                    layoutId="staff-indicator"
                    className="absolute inset-0 rounded-xl border-2 border-primary/30"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <ScheduleToolbar
          onCopyMondayToWeekdays={copyMondayToWeekdays}
          onOpenAll={openAll}
          onToggleAllBreaks={toggleAllBreaks}
          hasBreaks={hasBreaks}
        />
        <Button
          size="sm"
          onClick={save}
          disabled={saving || loadingSchedule}
          className={cn(
            "h-9 font-medium shadow-sm transition-all duration-200",
            saved
              ? "bg-emerald-600 hover:bg-emerald-600 text-white"
              : "bg-primary text-primary-foreground hover:bg-primary/95",
          )}
        >
          {saving ? (
            <Loader2 className="size-4 animate-spin mr-1.5" />
          ) : saved ? (
            <Check className="size-4 mr-1.5" />
          ) : null}
          {saving ? "Guardando..." : saved ? "Guardado" : "Guardar horario"}
        </Button>
      </div>

      {/* Schedule Grid */}
      {loadingSchedule ? (
        <div className="space-y-3">
          {[...Array(7)].map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {schedule.map((day) => (
            <DayScheduleCard
              key={day.dayOfWeek}
              data={day}
              onUpdate={(patch) => updateDay(day.dayOfWeek, patch)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export { StaffSchedule }
