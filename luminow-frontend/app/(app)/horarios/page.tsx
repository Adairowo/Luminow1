"use client"

import { Check, Loader2, Building2, Users } from "lucide-react"
import { useEffect, useState } from "react"

import api from "@/lib/axios"
import { cn } from "@/lib/utils"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { DayScheduleCard, type DayScheduleData } from "@/components/schedule/day-schedule-card"
import { ScheduleToolbar } from "@/components/schedule/schedule-toolbar"
import { StaffSchedule } from "@/components/schedule/staff-schedule"

type BusinessHour = {
  day_of_week: number
  open_time: string | null
  close_time: string | null
  break_start: string | null
  break_end: string | null
  is_closed: boolean
}

const DAY_NAMES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]

function apiToLocal(h: BusinessHour): DayScheduleData {
  return {
    dayOfWeek: h.day_of_week,
    dayName: DAY_NAMES[h.day_of_week],
    isOpen: !h.is_closed,
    openTime: h.open_time,
    closeTime: h.close_time,
    breakStart: h.break_start,
    breakEnd: h.break_end,
  }
}

function localToApi(d: DayScheduleData): BusinessHour {
  return {
    day_of_week: d.dayOfWeek,
    open_time: d.isOpen ? d.openTime : null,
    close_time: d.isOpen ? d.closeTime : null,
    break_start: d.isOpen ? d.breakStart : null,
    break_end: d.isOpen ? d.breakEnd : null,
    is_closed: !d.isOpen,
  }
}

function BusinessScheduleTab() {
  const [draft, setDraft] = useState<DayScheduleData[]>([])
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function fetchHours() {
      try {
        const res = await api.get("/api/v1/tenant/business-hours")
        const hours: BusinessHour[] = res.data.data ?? []
        setDraft(hours.sort((a, b) => a.day_of_week - b.day_of_week).map(apiToLocal))
      } catch (err) {
        console.error("Error fetching business hours", err)
      } finally {
        setLoading(false)
      }
    }
    fetchHours()
  }, [])

  function updateDay(dayOfWeek: number, patch: Partial<DayScheduleData>) {
    setSaved(false)
    setDraft((prev) =>
      prev.map((d) => (d.dayOfWeek === dayOfWeek ? { ...d, ...patch } : d))
    )
  }

  async function save() {
    setSaving(true)
    try {
      await api.put("/api/v1/tenant/business-hours", {
        hours: draft.map(localToApi),
      })
      setSaved(true)
    } catch (err) {
      alert("Error al guardar los horarios")
    } finally {
      setSaving(false)
    }
  }

  function copyMondayToWeekdays() {
    const monday = draft.find((d) => d.dayOfWeek === 1)
    if (!monday) return
    setSaved(false)
    setDraft((prev) =>
      prev.map((d) => {
        if (d.dayOfWeek >= 2 && d.dayOfWeek <= 5) {
          return {
            ...d,
            isOpen: monday.isOpen,
            openTime: monday.openTime,
            closeTime: monday.closeTime,
            breakStart: monday.breakStart,
            breakEnd: monday.breakEnd,
          }
        }
        return d
      })
    )
  }

  function openAll() {
    setSaved(false)
    setDraft((prev) =>
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
    setDraft((prev) =>
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

  const hasBreaks = draft.some((d) => d.breakStart && d.breakEnd)

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="h-16 bg-muted rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Toolbar + Save */}
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
          disabled={saving || loading}
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
          {saving ? "Guardando..." : saved ? "Guardado" : "Guardar cambios"}
        </Button>
      </div>

      {/* Day cards grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {draft.map((day) => (
          <DayScheduleCard
            key={day.dayOfWeek}
            data={day}
            onUpdate={(patch) => updateDay(day.dayOfWeek, patch)}
          />
        ))}
      </div>
    </div>
  )
}

export default function HoursPage() {
  return (
    <div className="flex flex-col gap-6 py-2">
      <PageHeader
        title="Horarios"
        description="Configura los horarios de apertura y descanso de tu negocio y tu personal."
      />

      <Tabs defaultValue="business">
        <TabsList variant="line" className="w-fit">
          <TabsTrigger value="business" className="gap-2 px-4">
            <Building2 className="size-4" />
            Horario del Negocio
          </TabsTrigger>
          <TabsTrigger value="staff" className="gap-2 px-4">
            <Users className="size-4" />
            Horarios del Personal
          </TabsTrigger>
        </TabsList>

        <TabsContent value="business" className="mt-5">
          <BusinessScheduleTab />
        </TabsContent>

        <TabsContent value="staff" className="mt-5">
          <StaffSchedule />
        </TabsContent>
      </Tabs>
    </div>
  )
}
