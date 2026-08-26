"use client"

import { CalendarDays, CheckCircle2, TrendingUp, XCircle } from "lucide-react"
import Link from "next/link"

import { PageHeader } from "@/components/page-header"
import { StatusBadge } from "@/components/status-badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useStore } from "@/lib/store"

function todayStr() {
  return new Date().toISOString().slice(0, 10)
}

export default function DashboardPage() {
  const { appointments, services, staff, settings } = useStore()
  const today = todayStr()

  const todays = appointments.filter((a) => a.date === today && a.status !== "cancelled")
  const confirmed = appointments.filter((a) => a.status === "confirmed").length
  const completed = appointments.filter((a) => a.status === "completed").length
  const cancelled = appointments.filter((a) => a.status === "cancelled" || a.status === "no_show").length
  const totalActive = appointments.filter((a) => a.status !== "cancelled").length
  const cancellationRate = appointments.length
    ? Math.round((cancelled / appointments.length) * 100)
    : 0

  const estimatedRevenue = appointments
    .filter((a) => a.status === "completed")
    .reduce((sum, a) => sum + (services.find((s) => s.id === a.serviceId)?.price ?? 0), 0)

  const stats = [
    { label: "Citas de hoy", value: todays.length, icon: CalendarDays, hint: `${settings.businessName}` },
    { label: "Confirmadas", value: confirmed, icon: CheckCircle2, hint: `${totalActive} activas en total` },
    { label: "Ingresos (completadas)", value: `$${estimatedRevenue.toLocaleString("es-MX")}`, icon: TrendingUp, hint: `${completed} citas completadas` },
    { label: "Tasa de cancelación", value: `${cancellationRate}%`, icon: XCircle, hint: `${cancelled} canceladas / no asistió` },
  ]

  // Peak hours distribution
  const buckets: Record<string, number> = {}
  appointments
    .filter((a) => a.status !== "cancelled")
    .forEach((a) => {
      const hour = a.startTime.slice(0, 2) + ":00"
      buckets[hour] = (buckets[hour] ?? 0) + 1
    })
  const peakEntries = Object.entries(buckets).sort(([a], [b]) => a.localeCompare(b))
  const maxPeak = Math.max(1, ...peakEntries.map(([, v]) => v))

  // Staff ranking
  const staffCount = staff
    .map((s) => ({
      name: s.name,
      count: appointments.filter((a) => a.staffId === s.id && a.status !== "cancelled").length,
    }))
    .sort((a, b) => b.count - a.count)
  const maxStaff = Math.max(1, ...staffCount.map((s) => s.count))

  const upcoming = [...todays].sort((a, b) => a.startTime.localeCompare(b.startTime)).slice(0, 6)

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Resumen de la actividad de tu negocio."
        action={
          <Link href="/citas">
            <Button variant="outline" size="sm">
              Ver todas las citas
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, hint }) => (
          <Card key={label}>
            <CardContent className="flex flex-col gap-3 p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{label}</span>
                <Icon className="size-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-semibold tracking-tight">{value}</div>
              <span className="text-xs text-muted-foreground">{hint}</span>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Horas pico</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {peakEntries.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin datos.</p>
            ) : (
              peakEntries.map(([hour, count]) => (
                <div key={hour} className="flex items-center gap-3">
                  <span className="w-12 shrink-0 text-xs tabular-nums text-muted-foreground">{hour}</span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-foreground"
                      style={{ width: `${(count / maxPeak) * 100}%` }}
                    />
                  </div>
                  <span className="w-6 shrink-0 text-right text-xs tabular-nums text-muted-foreground">{count}</span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Personal más solicitado</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {staffCount.map((s) => (
              <div key={s.name} className="flex items-center gap-3">
                <span className="w-28 shrink-0 truncate text-xs text-muted-foreground">{s.name}</span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-foreground"
                    style={{ width: `${(s.count / maxStaff) * 100}%` }}
                  />
                </div>
                <span className="w-6 shrink-0 text-right text-xs tabular-nums text-muted-foreground">{s.count}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Próximas citas de hoy</CardTitle>
        </CardHeader>
        <CardContent>
          {upcoming.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">No hay citas para hoy.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {upcoming.map((a) => {
                const service = services.find((s) => s.id === a.serviceId)
                const member = staff.find((s) => s.id === a.staffId)
                return (
                  <li key={a.id} className="flex items-center gap-4 py-3">
                    <div className="w-14 shrink-0 text-sm font-semibold tabular-nums">{a.startTime}</div>
                    <div className="flex flex-1 flex-col overflow-hidden">
                      <span className="truncate text-sm font-medium">{a.clientName}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {service?.name} · {member?.name}
                      </span>
                    </div>
                    <StatusBadge status={a.status} />
                  </li>
                )
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </>
  )
}
