"use client"

import { Pencil, Phone, Plus, Trash2, Loader2, Users, AlertCircle } from "lucide-react"
import { useEffect, useState } from "react"
import api from "@/lib/axios"

import { PageHeader } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Modal } from "@/components/ui/modal"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

type StaffMember = {
  id: number
  name: string
  phone: string | null
  is_active: boolean
  services: { id: number; name: string }[]
}

type ServiceOption = {
  id: number
  name: string
}

type Draft = {
  id?: number
  name: string
  phone: string
  is_active: boolean
  service_ids: number[]
}

const EMPTY: Draft = { name: "", phone: "", is_active: true, service_ids: [] }

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

export default function StaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [services, setServices] = useState<ServiceOption[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<Draft>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [staffRes, svcRes] = await Promise.all([
        api.get("/api/v1/tenant/staff"),
        api.get("/api/v1/tenant/services"),
      ])
      setStaff(staffRes.data.data ?? [])
      setServices(svcRes.data.data ?? [])
    } catch (err: any) {
      console.error("Error fetching data", err)
      setError(err.response?.data?.message || "Error al cargar los datos.")
    } finally {
      setLoading(false)
    }
  }

  function openNew() {
    setDraft(EMPTY)
    setError(null)
    setOpen(true)
  }

  function openEdit(s: StaffMember) {
    setDraft({
      id: s.id,
      name: s.name,
      phone: s.phone ?? "",
      is_active: s.is_active,
      service_ids: s.services?.map((x) => x.id) ?? [],
    })
    setError(null)
    setOpen(true)
  }

  function toggleService(id: number) {
    setDraft((d) => ({
      ...d,
      service_ids: d.service_ids.includes(id)
        ? d.service_ids.filter((x) => x !== id)
        : [...d.service_ids, id],
    }))
  }

  async function submit() {
    if (!draft.name.trim()) return
    setSaving(true)
    setError(null)
    try {
      let staffId = draft.id

      if (staffId) {
        await api.put(`/api/v1/tenant/staff/${staffId}`, {
          name: draft.name,
          phone: draft.phone,
          is_active: draft.is_active,
        })
      } else {
        const res = await api.post("/api/v1/tenant/staff", {
          name: draft.name,
          phone: draft.phone,
          is_active: draft.is_active,
        })
        staffId = res.data.data?.id ?? res.data.id
      }

      await api.put(`/api/v1/tenant/staff/${staffId}/services`, {
        services: draft.service_ids.map((id) => ({ service_id: id })),
      })

      await fetchData()
      setOpen(false)
    } catch (err: any) {
      const msg =
        err.response?.data?.message ??
        err.response?.data?.errors?.name?.[0] ??
        "Error al guardar el empleado"
      setError(msg)
    } finally {
      setSaving(false)
    }
  }

  async function deleteStaff(id: number) {
    if (!confirm("¿Seguro que deseas eliminar a este miembro del personal?")) return
    try {
      await api.delete(`/api/v1/tenant/staff/${id}`)
      setStaff((prev) => prev.filter((s) => s.id !== id))
    } catch (err: any) {
      alert(err.response?.data?.message ?? "Error al eliminar")
    }
  }

  return (
    <div className="flex flex-col gap-6 py-2">
      <PageHeader
        title="Personal"
        description="Gestiona tus colaboradores y los servicios que tiene asignados cada uno."
        action={
          <Button size="sm" onClick={openNew} className="h-9 font-medium shadow-sm hover:shadow transition-all">
            <Plus className="size-4" />
            Nuevo colaborador
          </Button>
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-40 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {staff.map((s) => (
            <Card key={s.id} className="border-border/60 shadow-sm hover:shadow transition-all duration-300 flex flex-col justify-between group">
              <CardContent className="flex flex-col gap-4 p-6 justify-between h-full">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-sm border border-primary/10">
                      {initials(s.name)}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors truncate">
                        {s.name}
                      </span>
                      {s.phone ? (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                          <Phone className="size-3 text-muted-foreground/60" />
                          {s.phone}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground/50 mt-0.5">Sin teléfono</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => openEdit(s)}
                      aria-label="Editar"
                      className="size-8 rounded-lg hover:bg-muted"
                    >
                      <Pencil className="size-3.5 text-muted-foreground hover:text-foreground" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => deleteStaff(s.id)}
                      aria-label="Eliminar"
                      className="size-8 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/75">
                    Servicios Asignados
                  </span>
                  <div className="flex flex-wrap gap-1.5 min-h-[26px]">
                    {!s.services || s.services.length === 0 ? (
                      <span className="text-xs text-muted-foreground/60 italic font-medium">Ningún servicio asignado</span>
                    ) : (
                      s.services.map((svc) => (
                        <Badge key={svc.id} variant="outline" className="border-border/60 bg-muted/30 text-muted-foreground hover:text-foreground text-[10px] py-0.5 px-2 font-medium">
                          {svc.name}
                        </Badge>
                      ))
                    )}
                  </div>
                </div>

                <div className="border-t border-border/40 pt-3 flex items-center justify-between mt-1">
                  <span className="text-[11px] font-medium text-muted-foreground">Estado laboral:</span>
                  {s.is_active ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 border border-emerald-500/20">
                      Activo
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-semibold text-rose-600 border border-rose-500/20">
                      Inactivo
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          {staff.length === 0 && (
            <div className="col-span-full py-16 text-center text-muted-foreground border border-dashed border-border/70 rounded-xl bg-muted/10 flex flex-col items-center justify-center gap-2">
              <Users className="size-8 text-muted-foreground/45 mb-1" />
              <p className="font-semibold text-foreground/80 text-sm">No hay personal registrado</p>
              <p className="text-xs">Comienza registrando un nuevo colaborador para tu negocio</p>
            </div>
          )}
        </div>
      )}

      <Modal
        open={open}
        onOpenChange={setOpen}
        title={draft.id ? "Editar empleado" : "Nuevo empleado"}
        description="Gestiona los datos básicos del colaborador y sus servicios disponibles."
      >
        <div className="flex flex-col gap-4.5 pt-2">
          {error && (
            <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive font-medium animate-in fade-in slide-in-from-top-1 duration-200">
              <AlertCircle className="size-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="st-name" className="text-xs font-semibold text-foreground/80">Nombre completo</Label>
            <Input
              id="st-name"
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              placeholder="Ej. Carlos Méndez"
              className="border-muted-foreground/20"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="st-phone" className="text-xs font-semibold text-foreground/80">Número de teléfono</Label>
            <Input
              id="st-phone"
              value={draft.phone}
              onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
              placeholder="Ej. +52 55 1234 5678"
              className="border-muted-foreground/20"
            />
          </div>
          
          <div className="flex flex-col gap-2">
            <Label className="text-xs font-semibold text-foreground/80">Servicios asignados</Label>
            {services.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">No hay servicios creados aún.</p>
            ) : (
              <div className="flex flex-wrap gap-1.5 max-h-[140px] overflow-y-auto p-1 border border-border/50 rounded-lg bg-muted/10">
                {services.map((svc) => {
                  const active = draft.service_ids.includes(svc.id)
                  return (
                    <button
                      key={svc.id}
                      type="button"
                      onClick={() => toggleService(svc.id)}
                      className={cn(
                        "rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all duration-200 cursor-pointer select-none",
                        active
                          ? "border-transparent bg-primary text-primary-foreground shadow-sm"
                          : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      {svc.name}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/20 px-3.5 py-3">
            <div className="flex flex-col gap-0.5">
              <Label className="text-sm font-semibold text-foreground/90">Colaborador activo</Label>
              <span className="text-[11px] text-muted-foreground">Estará disponible para recibir citas</span>
            </div>
            <Switch
              checked={draft.is_active}
              onCheckedChange={(checked) => setDraft({ ...draft, is_active: checked })}
            />
          </div>
          
          <div className="flex justify-end gap-2 border-t border-border/40 pt-4 mt-2">
            <Button variant="outline" size="sm" onClick={() => setOpen(false)} className="h-9 font-medium shadow-sm">
              Cancelar
            </Button>
            <Button size="sm" onClick={submit} disabled={saving} className="h-9 font-medium shadow-sm">
              {saving ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Guardando...
                </>
              ) : (
                "Guardar"
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

