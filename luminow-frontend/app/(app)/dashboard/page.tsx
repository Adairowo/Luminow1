"use client"

import { CalendarDays, CheckCircle2, TrendingUp, XCircle, QrCode, Download, ExternalLink, Users, Clock, Calendar } from "lucide-react"
import { QRCodeCanvas } from "qrcode.react"
import Link from "next/link"
import { useEffect, useState, useRef } from "react"
import api from "@/lib/axios"

import { PageHeader } from "@/components/page-header"
import { StatusBadge } from "@/components/status-badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { AppointmentStatus } from "@/lib/types"

// Dashboard data shape as returned by GET /api/v1/tenant/dashboard
interface DashboardData {
  tenant: {
    business_name: string
    slug: string
    booking_url: string
  }
  period: string
  date_range: { from: string; to: string }
  summary: {
    total: number
    pending: number
    confirmed: number
    completed: number
    cancelled: number
    no_show: number
    cancellation_rate_percent: number
    variation_vs_previous_percent: number | null
  }
  upcoming: {
    id: number
    client_name: string
    appointment_date: string
    start_time: string
    end_time: string
    status: AppointmentStatus
    status_label: string
    service_name: string | null
    staff_name: string | null
  }[]
  peak_hours: Record<string, number>
  top_staff: { staff_name: string; total_appointments: number }[]
  top_services: { service_name: string; total_appointments: number }[]
}

export default function DashboardPage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<DashboardData | null>(null)
  const qrRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const response = await api.get("/api/v1/tenant/dashboard")
        setData(response.data.data)
      } catch (err) {
        console.error("Error fetching dashboard data", err)
      } finally {
        setLoading(false)
      }
    }
    fetchDashboard()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse py-6">
        <div className="flex flex-col gap-2">
          <div className="h-8 w-48 bg-muted rounded-lg" />
          <div className="h-4 w-72 bg-muted rounded-md" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-muted rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="h-72 bg-muted rounded-xl" />
          <div className="h-72 bg-muted rounded-xl" />
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 h-80 bg-muted rounded-xl" />
          <div className="h-80 bg-muted rounded-xl" />
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="rounded-full bg-destructive/10 p-3 text-destructive mb-3">
          <XCircle className="size-6" />
        </div>
        <p className="text-sm font-medium text-foreground">No se pudo cargar el dashboard</p>
        <p className="text-xs text-muted-foreground mt-1">Por favor, intenta recargar la página</p>
      </div>
    )
  }

  const { summary, upcoming, peak_hours, top_staff } = data

  const stats = [
    {
      label: "Total del período",
      value: summary.total,
      icon: CalendarDays,
      hint: `${data.date_range.from} · ${data.period}`,
      color: "bg-blue-500/10 text-blue-500",
    },
    {
      label: "Confirmadas",
      value: summary.confirmed,
      icon: CheckCircle2,
      hint: `${summary.pending} pendientes`,
      color: "bg-emerald-500/10 text-emerald-500",
    },
    {
      label: "Completadas",
      value: summary.completed,
      icon: TrendingUp,
      hint: `${summary.variation_vs_previous_percent !== null ? (summary.variation_vs_previous_percent > 0 ? "+" : "") + summary.variation_vs_previous_percent + "% vs período anterior" : "Sin datos anteriores"}`,
      color: "bg-violet-500/10 text-violet-500",
    },
    {
      label: "Tasa de cancelación",
      value: `${summary.cancellation_rate_percent}%`,
      icon: XCircle,
      hint: `${summary.cancelled} canceladas · ${summary.no_show} no asistió`,
      color: "bg-rose-500/10 text-rose-500",
    },
  ]

  const peakEntries = Object.entries(peak_hours ?? {}).sort(([a], [b]) => a.localeCompare(b))
  const maxPeak = Math.max(1, ...peakEntries.map(([, v]) => Number(v)))

  const maxStaff = Math.max(1, ...(top_staff ?? []).map((s) => s.total_appointments))

  function downloadQr() {
    const canvas = qrRef.current?.querySelector("canvas")
    if (!canvas || !data?.tenant) return
    const link = document.createElement("a")
    link.download = `qr-${data.tenant.slug}.png`
    link.href = canvas.toDataURL("image/png")
    link.click()
  }

  return (
    <div className="flex flex-col gap-6 py-2">
      <PageHeader
        title="Dashboard"
        description={`Bienvenido de nuevo. Resumen de actividad para ${data.tenant?.business_name || "tu negocio"}.`}
        action={
          <Link href="/citas">
            <Button variant="outline" size="sm" className="h-9 font-medium shadow-sm hover:shadow transition-all">
              Ver todas las citas
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, hint, color }) => (
          <Card key={label} className="border-border/60 shadow-sm hover:shadow transition-all duration-300">
            <CardContent className="flex flex-col gap-3 p-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
                <div className={`p-2 rounded-lg ${color}`}>
                  <Icon className="size-4" />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <div className="text-3xl font-bold tracking-tight text-foreground">{value}</div>
                <span className="text-xs text-muted-foreground/80 font-medium truncate">{hint}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-muted-foreground" />
              <CardTitle className="text-base font-semibold">Horas pico</CardTitle>
            </div>
            <CardDescription>Distribución de reservas por hora del día</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {peakEntries.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">Sin datos para este período.</p>
            ) : (
              peakEntries.map(([hour, count]) => (
                <div key={hour} className="flex items-center gap-3 group">
                  <span className="w-12 shrink-0 text-xs font-medium tabular-nums text-muted-foreground group-hover:text-foreground transition-colors">
                    {hour}
                  </span>
                  <div className="h-3 flex-1 overflow-hidden rounded-full bg-muted/60">
                    <div
                      className="h-full rounded-full bg-primary/85 group-hover:bg-primary transition-all duration-500 ease-out"
                      style={{ width: `${(Number(count) / maxPeak) * 100}%` }}
                    />
                  </div>
                  <span className="w-6 shrink-0 text-right text-xs font-semibold tabular-nums text-muted-foreground group-hover:text-foreground transition-colors">
                    {String(count)}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Users className="size-4 text-muted-foreground" />
              <CardTitle className="text-base font-semibold">Personal más solicitado</CardTitle>
            </div>
            <CardDescription>Colaboradores con mayor volumen de citas</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {!top_staff || top_staff.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">Sin datos para este período.</p>
            ) : (
              top_staff.map((s) => (
                <div key={s.staff_name} className="flex items-center gap-3 group">
                  <span className="w-28 shrink-0 truncate text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                    {s.staff_name}
                  </span>
                  <div className="h-3 flex-1 overflow-hidden rounded-full bg-muted/60">
                    <div
                      className="h-full rounded-full bg-primary/85 group-hover:bg-primary transition-all duration-500 ease-out"
                      style={{ width: `${(s.total_appointments / maxStaff) * 100}%` }}
                    />
                  </div>
                  <span className="w-6 shrink-0 text-right text-xs font-semibold tabular-nums text-muted-foreground group-hover:text-foreground transition-colors">
                    {s.total_appointments}
                  </span>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="h-full border-border/60 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Calendar className="size-4 text-muted-foreground" />
                <CardTitle className="text-base font-semibold">Próximas citas</CardTitle>
              </div>
              <CardDescription>Citas agendadas para las siguientes horas</CardDescription>
            </CardHeader>
            <CardContent>
              {upcoming.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Calendar className="size-8 text-muted-foreground/45 mb-2" />
                  <p className="text-sm text-muted-foreground">No hay citas próximas programadas.</p>
                </div>
              ) : (
                <ul className="flex flex-col divide-y divide-border/50">
                  {upcoming.map((a) => (
                    <li key={a.id} className="flex items-center gap-4 py-3.5 px-2 hover:bg-muted/30 rounded-lg transition-colors duration-200">
                      <div className="w-14 shrink-0 text-sm font-semibold tabular-nums text-foreground/95">
                        {a.start_time}
                      </div>
                      <div className="flex flex-1 flex-col overflow-hidden">
                        <span className="truncate text-sm font-medium text-foreground">{a.client_name}</span>
                        <span className="truncate text-xs text-muted-foreground mt-0.5">
                          {a.service_name} · {a.staff_name}
                        </span>
                      </div>
                      <div className="shrink-0">
                        <StatusBadge status={a.status} />
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="h-full border-border/60 shadow-sm flex flex-col justify-between">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <QrCode className="size-4 text-muted-foreground" />
                <CardTitle className="text-base font-semibold">Código QR del negocio</CardTitle>
              </div>
              <CardDescription>Comparte este código para recibir reservas</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4 flex-1 justify-center pt-2">
              <div ref={qrRef} className="rounded-2xl border border-border/65 bg-white p-4.5 shadow-sm hover:shadow transition-shadow duration-300">
                {data.tenant?.booking_url ? (
                  <QRCodeCanvas value={data.tenant.booking_url} size={152} level="M" marginSize={0} />
                ) : (
                  <div className="flex size-[152px] items-center justify-center text-xs text-muted-foreground">
                    Sin URL
                  </div>
                )}
              </div>
              <div className="text-center w-full mt-1">
                <p className="break-all text-xs font-semibold text-foreground">{data.tenant?.business_name}</p>
                <p className="break-all text-[11px] text-muted-foreground mt-0.5 hover:text-primary transition-colors underline decoration-dotted">
                  {data.tenant?.booking_url}
                </p>
              </div>
              <div className="flex w-full flex-col gap-2 mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full h-9 font-medium shadow-sm"
                  onClick={downloadQr}
                  disabled={!data.tenant?.booking_url}
                >
                  <Download className="size-4" />
                  Descargar QR
                </Button>
                {data.tenant?.slug && (
                  <a
                    href={`/book/${data.tenant.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border h-9 px-3 text-sm font-medium transition-colors hover:bg-accent text-foreground shadow-sm hover:shadow"
                  >
                    <ExternalLink className="size-4" />
                    Página de reserva
                  </a>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

