"use client"

import { useMemo, useState } from "react"

import { PageHeader } from "@/components/page-header"
import { StatusBadge } from "@/components/status-badge"
import { Card } from "@/components/ui/card"
import { Select } from "@/components/ui/select"
import {
  STATUS_LABELS,
  useStore,
  type AppointmentStatus,
} from "@/lib/store"

const STATUS_OPTIONS: AppointmentStatus[] = ["pending", "confirmed", "completed", "cancelled", "no_show"]

function formatDate(date: string) {
  return new Date(date + "T00:00:00").toLocaleDateString("es-MX", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  })
}

export default function AppointmentsPage() {
  const { appointments, services, staff, setAppointmentStatus } = useStore()
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [staffFilter, setStaffFilter] = useState<string>("all")

  const filtered = useMemo(() => {
    return [...appointments]
      .filter((a) => (statusFilter === "all" ? true : a.status === statusFilter))
      .filter((a) => (staffFilter === "all" ? true : a.staffId === Number(staffFilter)))
      .sort((a, b) => (b.date + b.startTime).localeCompare(a.date + a.startTime))
  }, [appointments, statusFilter, staffFilter])

  return (
    <>
      <PageHeader title="Citas" description="Consulta y actualiza el estado de las reservas." />

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="flex flex-1 flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Estado</label>
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">Todos los estados</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex flex-1 flex-col gap-1.5">
          <label className="text-xs font-medium text-muted-foreground">Personal</label>
          <Select value={staffFilter} onChange={(e) => setStaffFilter(e.target.value)}>
            <option value="all">Todo el personal</option>
            {staff.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <Card className="overflow-hidden">
        {/* Desktop table */}
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="px-4 py-3 font-medium">Fecha</th>
                <th className="px-4 py-3 font-medium">Hora</th>
                <th className="px-4 py-3 font-medium">Cliente</th>
                <th className="px-4 py-3 font-medium">Servicio</th>
                <th className="px-4 py-3 font-medium">Personal</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Acción</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a) => {
                const service = services.find((s) => s.id === a.serviceId)
                const member = staff.find((s) => s.id === a.staffId)
                return (
                  <tr key={a.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 capitalize">{formatDate(a.date)}</td>
                    <td className="px-4 py-3 tabular-nums">
                      {a.startTime}–{a.endTime}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium">{a.clientName}</div>
                      <div className="text-xs text-muted-foreground">{a.clientPhone}</div>
                    </td>
                    <td className="px-4 py-3">{service?.name}</td>
                    <td className="px-4 py-3">{member?.name}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={a.status} />
                    </td>
                    <td className="px-4 py-3">
                      <Select
                        className="h-8 w-36 text-xs"
                        value={a.status}
                        onChange={(e) => setAppointmentStatus(a.id, e.target.value as AppointmentStatus)}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {STATUS_LABELS[s]}
                          </option>
                        ))}
                      </Select>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <ul className="flex flex-col divide-y divide-border md:hidden">
          {filtered.map((a) => {
            const service = services.find((s) => s.id === a.serviceId)
            const member = staff.find((s) => s.id === a.staffId)
            return (
              <li key={a.id} className="flex flex-col gap-2 p-4">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium">{a.clientName}</span>
                  <StatusBadge status={a.status} />
                </div>
                <div className="text-xs text-muted-foreground">
                  <span className="capitalize">{formatDate(a.date)}</span> · {a.startTime}–{a.endTime}
                </div>
                <div className="text-xs text-muted-foreground">
                  {service?.name} · {member?.name}
                </div>
                <Select
                  className="mt-1 h-8 text-xs"
                  value={a.status}
                  onChange={(e) => setAppointmentStatus(a.id, e.target.value as AppointmentStatus)}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </option>
                  ))}
                </Select>
              </li>
            )
          })}
        </ul>

        {filtered.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">No hay citas que coincidan.</p>
        ) : null}
      </Card>
    </>
  )
}
