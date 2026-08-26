"use client"

import { Check } from "lucide-react"
import { useState } from "react"

import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { DAY_NAMES, useStore, type BusinessHour } from "@/lib/store"

export default function HoursPage() {
  const { hours, updateHours } = useStore()
  const [draft, setDraft] = useState<BusinessHour[]>(hours)
  const [saved, setSaved] = useState(false)

  function update(day: number, patch: Partial<BusinessHour>) {
    setSaved(false)
    setDraft((prev) => prev.map((h) => (h.dayOfWeek === day ? { ...h, ...patch } : h)))
  }

  function save() {
    updateHours(draft)
    setSaved(true)
  }

  return (
    <>
      <PageHeader
        title="Horarios"
        description="Define los días y las horas de apertura del negocio."
        action={
          <Button size="sm" onClick={save}>
            {saved ? <Check className="size-4" /> : null}
            {saved ? "Guardado" : "Guardar cambios"}
          </Button>
        }
      />

      <Card>
        <CardContent className="flex flex-col divide-y divide-border p-0">
          {[...draft]
            .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
            .map((h) => (
              <div
                key={h.dayOfWeek}
                className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex items-center gap-3">
                  <Switch
                    checked={!h.isClosed}
                    onCheckedChange={(checked) => update(h.dayOfWeek, { isClosed: !checked })}
                  />
                  <span className="w-24 text-sm font-medium">{DAY_NAMES[h.dayOfWeek]}</span>
                </div>

                {h.isClosed ? (
                  <span className="text-sm text-muted-foreground">Cerrado</span>
                ) : (
                  <div className="flex items-center gap-2">
                    <Input
                      type="time"
                      className="h-8 w-32"
                      value={h.openTime}
                      onChange={(e) => update(h.dayOfWeek, { openTime: e.target.value })}
                    />
                    <span className="text-sm text-muted-foreground">a</span>
                    <Input
                      type="time"
                      className="h-8 w-32"
                      value={h.closeTime}
                      onChange={(e) => update(h.dayOfWeek, { closeTime: e.target.value })}
                    />
                  </div>
                )}
              </div>
            ))}
        </CardContent>
      </Card>
    </>
  )
}
