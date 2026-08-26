"use client"

import { useEffect, useState } from "react"
import api from "@/lib/axios"

import { PageHeader } from "@/components/page-header"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select } from "@/components/ui/select"
import { STATUS_LABELS, type AppointmentStatus } from "@/lib/types"
import { Calendar, Clock, User, Phone, Filter, RotateCcw, ShieldAlert } from "lucide-react"

const STATUS_OPTIONS: AppointmentStatus[] = [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
  "no_show",
]

function formatDate(date: string) {
  return new Date(date + "T00:00:00").toLocaleDateString("es-MX", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  })
}

function getInitials(name: string) {
  if (!name) return ""
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("")
}

interface Appointment {
  id: number
  client_name: string
  client_phone: string
  appointment_date: string
  start_time: string
  end_time: string
  status: AppointmentStatus
  notes: string | null
  cancellation_reason: string | null
  service: { id: number; name: string } | null
  staff_member: { id: number; name: string } | null
}

interface Meta {
  current_page: number
  last_page: number
  per_page: number
  total: number
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [staffList, setStaffList] = useState<{ id: number; name: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [meta, setMeta] = useState<Meta | null>(null)

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [staffFilter, setStaffFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("")
  const [page, setPage] = useState(1)

  useEffect(() => {
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, staffFilter, dateFilter, page])

  useEffect(() => {
    // Load staff list once for filter dropdown
    api
      .get("/api/v1/tenant/staff")
      .then((res) => setStaffList(res.data.data ?? []))
      .catch(() => {})
  }, [])

  async function fetchData() {
    setLoading(true)
    try {
      const params: Record<string, string> = { per_page: "30", page: String(page) }
      if (statusFilter !== "all") params.status = statusFilter
      if (staffFilter !== "all") params.staff_id = staffFilter
      if (dateFilter) params.date = dateFilter

      const res = await api.get("/api/v1/tenant/appointments", { params })
      setAppointments(res.data.data ?? [])
      setMeta(res.data.meta ?? null)
    } catch (err) {
      console.error("Error fetching appointments", err)
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(id: number, status: AppointmentStatus) {
    const body: Record<string, string> = { status }
    if (status === "cancelled") {
      body.cancellation_reason = "Cancelado por el administrador"
    }
    try {
      await api.patch(`/api/v1/tenant/appointments/${id}/status`, body)
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status } : a))
      )
    } catch (err: any) {
      alert(err.response?.data?.message ?? "Error al actualizar el estado")
    }
  }

  function resetFilters() {
    setStatusFilter("all")
    setStaffFilter("all")
    setDateFilter("")
    setPage(1)
  }

  return (
    <div className="flex flex-col gap-6 py-2">
      <PageHeader title="Citas" description="Consulta y actualiza el estado de las reservas de tu negocio." />

      {/* Filters Card */}
      <Card className="border-border/60 shadow-sm bg-card/60 backdrop-blur-[1px]">
        <CardContent className="p-4 flex flex-wrap items-end gap-3.5">
          <div className="flex flex-1 min-w-[160px] flex-col gap-1.5">
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Filter className="size-3" /> Estado
            </span>
            <Select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1) }}
              className="h-9 border-muted-foreground/15 text-xs font-medium"
            >
              <option value="all">Todos los estados</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </Select>
          </div>
          
          <div className="flex flex-1 min-w-[160px] flex-col gap-1.5">
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <User className="size-3" /> Colaborador
            </span>
            <Select
              value={staffFilter}
              onChange={(e) => { setStaffFilter(e.target.value); setPage(1) }}
              className="h-9 border-muted-foreground/15 text-xs font-medium"
            >
              <option value="all">Todo el personal</option>
              {staffList.map((s) => (
                <option key={s.id} value={String(s.id)}>
                  {s.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="flex flex-1 min-w-[160px] flex-col gap-1.5">
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
              <Calendar className="size-3" /> Fecha de reserva
            </span>
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => { setDateFilter(e.target.value); setPage(1) }}
              className="h-9 border-muted-foreground/15 text-xs font-medium"
            />
          </div>

          {(statusFilter !== "all" || staffFilter !== "all" || dateFilter) && (
            <div className="shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={resetFilters}
                className="text-muted-foreground hover:text-foreground h-9 px-3 gap-1.5 transition-colors text-xs font-medium"
              >
                <RotateCcw className="size-3.5" />
                Limpiar filtros
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-border/60 shadow-sm">
        {/* Desktop table */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-muted/40 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">
                <th className="px-5 py-3.5 font-semibold">Fecha</th>
                <th className="px-5 py-3.5 font-semibold">Hora</th>
                <th className="px-5 py-3.5 font-semibold">Cliente</th>
                <th className="px-5 py-3.5 font-semibold">Servicio</th>
                <th className="px-5 py-3.5 font-semibold">Personal</th>
                <th className="px-5 py-3.5 font-semibold">Estado</th>
                <th className="px-5 py-3.5 font-semibold text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {loading ? (
                [...Array(6)].map((_, i) => (
                  <tr key={i} className="border-b border-border/30 last:border-0 animate-pulse">
                    <td className="px-5 py-4"><div className="h-4 w-20 bg-muted rounded" /></td>
                    <td className="px-5 py-4"><div className="h-4 w-24 bg-muted rounded" /></td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-8 rounded-full bg-muted shrink-0" />
                        <div className="flex flex-col gap-1.5 w-28">
                          <div className="h-3.5 bg-muted rounded" />
                          <div className="h-3 w-20 bg-muted rounded" />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4"><div className="h-4 w-24 bg-muted rounded" /></td>
                    <td className="px-5 py-4"><div className="h-6 w-20 bg-muted rounded" /></td>
                    <td className="px-5 py-4"><div className="h-6 w-16 bg-muted rounded" /></td>
                    <td className="px-5 py-4 text-right"><div className="h-8 w-28 bg-muted rounded ml-auto" /></td>
                  </tr>
                ))
              ) : appointments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <ShieldAlert className="size-8 text-muted-foreground/40" />
                      <p className="font-medium text-foreground/80 text-sm">No hay citas registradas</p>
                      <p className="text-xs">Prueba cambiando o limpiando los filtros de búsqueda</p>
                    </div>
                  </td>
                </tr>
              ) : (
                appointments.map((a) => (
                  <tr key={a.id} className="hover:bg-muted/15 transition-colors">
                    <td className="px-5 py-4 font-medium text-foreground/90 capitalize">
                      <div className="flex items-center gap-2">
                        <Calendar className="size-3.5 text-muted-foreground/75" />
                        <span>{formatDate(a.appointment_date)}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-muted-foreground font-medium tabular-nums">
                      <div className="flex items-center gap-2">
                        <Clock className="size-3.5 text-muted-foreground/60" />
                        <span>{a.start_time} - {a.end_time}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                          {getInitials(a.client_name)}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-medium text-foreground truncate">{a.client_name}</span>
                          <span className="text-xs text-muted-foreground/90 flex items-center gap-1 mt-0.5">
                            <Phone className="size-3 text-muted-foreground/60" />
                            {a.client_phone}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-semibold text-foreground/85">
                      {a.service?.name ?? "—"}
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground font-medium bg-muted/60 px-2 py-1 rounded-md border border-border/30">
                        <span className="size-1.5 rounded-full bg-foreground/45" />
                        {a.staff_member?.name ?? "—"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge status={a.status} />
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Select
                        className="h-8 w-32 text-xs border-muted-foreground/15 font-medium ml-auto"
                        value={a.status}
                        onChange={(e) =>
                          updateStatus(a.id, e.target.value as AppointmentStatus)
                        }
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {STATUS_LABELS[s]}
                          </option>
                        ))}
                      </Select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <ul className="flex flex-col divide-y divide-border/40 md:hidden bg-card">
          {loading ? (
            [...Array(4)].map((_, i) => (
              <li key={i} className="flex flex-col gap-3 p-4 animate-pulse">
                <div className="flex justify-between">
                  <div className="h-4 w-32 bg-muted rounded" />
                  <div className="h-5 w-16 bg-muted rounded" />
                </div>
                <div className="h-3 w-40 bg-muted rounded" />
                <div className="h-3 w-32 bg-muted rounded" />
                <div className="h-8 bg-muted rounded-lg" />
              </li>
            ))
          ) : appointments.length === 0 ? (
            <li className="py-16 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
              <ShieldAlert className="size-8 text-muted-foreground/40" />
              <p className="font-medium text-foreground/80 text-sm">No hay citas registradas</p>
              <p className="text-xs">Prueba cambiando o limpiando los filtros</p>
            </li>
          ) : (
            appointments.map((a) => (
              <li key={a.id} className="flex flex-col gap-3.5 p-4.5 hover:bg-muted/10 transition-colors">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                      {getInitials(a.client_name)}
                    </div>
                    <span className="font-semibold text-foreground text-sm">{a.client_name}</span>
                  </div>
                  <StatusBadge status={a.status} />
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground/90 font-medium">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="size-3 text-muted-foreground/75" />
                    <span className="capitalize">{formatDate(a.appointment_date)}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="size-3 text-muted-foreground/75" />
                    <span>{a.start_time} - {a.end_time}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 text-xs mt-0.5">
                  <span className="font-medium text-foreground/85 bg-muted px-2 py-0.5 rounded">
                    {a.service?.name || "—"}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-muted-foreground bg-muted/40 px-2 py-0.5 rounded border border-border/30">
                    <span className="size-1 rounded-full bg-foreground/35" />
                    {a.staff_member?.name || "—"}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-1 border-t border-border/30 pt-3">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground shrink-0">Estado:</span>
                  <Select
                    className="h-8 text-xs flex-1 border-muted-foreground/15 font-medium"
                    value={a.status}
                    onChange={(e) =>
                      updateStatus(a.id, e.target.value as AppointmentStatus)
                    }
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABELS[s]}
                      </option>
                    ))}
                  </Select>
                </div>
              </li>
            ))
          )}
        </ul>
      </Card>

      {/* Pagination */}
      {meta && meta.last_page > 1 && (
        <div className="flex items-center justify-between text-sm bg-muted/10 px-4 py-3 rounded-lg border border-border/40">
          <span className="text-muted-foreground font-medium">
            {meta.total} citas · Página {meta.current_page} de {meta.last_page}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 shadow-sm hover:shadow text-xs font-semibold"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => p - 1)}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 shadow-sm hover:shadow text-xs font-semibold"
              disabled={page >= meta.last_page || loading}
              onClick={() => setPage((p) => p + 1)}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

