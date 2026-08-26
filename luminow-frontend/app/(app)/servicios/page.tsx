"use client"

import { Clock, Pencil, Plus, Trash2, Loader2, Scissors } from "lucide-react"
import { useEffect, useState } from "react"
import api from "@/lib/axios"

import { PageHeader } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label, Textarea } from "@/components/ui/label"
import { Modal } from "@/components/ui/modal"
import { Switch } from "@/components/ui/switch"

type Service = {
  id: number
  name: string
  description: string
  duration_minutes: number
  price: number
  is_active: boolean
}

type Draft = {
  id?: number
  name: string
  description: string
  duration_minutes: number
  price: number
  is_active: boolean
}

const EMPTY: Draft = { name: "", description: "", duration_minutes: 30, price: 0, is_active: true }

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<Draft>(EMPTY)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchServices()
  }, [])

  async function fetchServices() {
    try {
      const res = await api.get("/api/v1/tenant/services")
      setServices(res.data.data ?? [])
    } catch (err) {
      console.error("Error fetching services", err)
    } finally {
      setLoading(false)
    }
  }

  function openNew() {
    setDraft(EMPTY)
    setOpen(true)
  }

  function openEdit(s: Service) {
    setDraft({ ...s })
    setOpen(true)
  }

  async function submit() {
    if (!draft.name.trim()) return
    setSaving(true)
    try {
      if (draft.id) {
        await api.put(`/api/v1/tenant/services/${draft.id}`, draft)
      } else {
        await api.post("/api/v1/tenant/services", draft)
      }
      await fetchServices()
      setOpen(false)
    } catch (err) {
      alert("Error al guardar el servicio")
    } finally {
      setSaving(false)
    }
  }

  async function deleteService(id: number) {
    if (!confirm("¿Seguro que deseas eliminar este servicio?")) return
    try {
      await api.delete(`/api/v1/tenant/services/${id}`)
      setServices(services.filter(s => s.id !== id))
    } catch (err) {
      alert("Error al eliminar el servicio")
    }
  }

  return (
    <div className="flex flex-col gap-6 py-2">
      <PageHeader
        title="Servicios"
        description="Administra el catálogo de servicios que ofrece tu negocio."
        action={
          <Button size="sm" onClick={openNew} className="h-9 font-medium shadow-sm hover:shadow transition-all">
            <Plus className="size-4" />
            Nuevo servicio
          </Button>
        }
      />

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-44 bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <Card key={s.id} className="border-border/60 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group">
              <CardContent className="flex flex-col gap-3.5 p-6 h-full justify-between">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col gap-1.5 min-w-0">
                    <span className="font-semibold text-foreground text-base truncate group-hover:text-primary transition-colors">
                      {s.name}
                    </span>
                    {s.is_active ? (
                      <span className="inline-flex w-fit items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 border border-emerald-500/20">
                        Activo
                      </span>
                    ) : (
                      <span className="inline-flex w-fit items-center gap-1 rounded-full bg-rose-500/10 px-2 py-0.5 text-[10px] font-semibold text-rose-600 border border-rose-500/20">
                        Inactivo
                      </span>
                    )}
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
                      onClick={() => deleteService(s.id)}
                      aria-label="Eliminar"
                      className="size-8 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
                
                <p className="text-xs text-muted-foreground text-pretty line-clamp-3 leading-relaxed flex-1 pt-1">
                  {s.description || "Sin descripción proporcionada."}
                </p>
                
                <div className="flex items-center justify-between border-t border-border/40 pt-4 mt-1">
                  <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                    <Clock className="size-4 text-muted-foreground/70" />
                    {s.duration_minutes} min
                  </span>
                  <span className="text-lg font-bold tabular-nums text-foreground">
                    ${Number(s.price).toLocaleString("es-MX")}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
          {services.length === 0 && (
            <div className="col-span-full py-16 text-center text-muted-foreground border border-dashed border-border/70 rounded-xl bg-muted/10 flex flex-col items-center justify-center gap-2">
              <Scissors className="size-8 text-muted-foreground/45 mb-1" />
              <p className="font-semibold text-foreground/80 text-sm">No hay servicios registrados</p>
              <p className="text-xs">Comienza agregando un nuevo servicio para tu negocio</p>
            </div>
          )}
        </div>
      )}

      <Modal
        open={open}
        onOpenChange={setOpen}
        title={draft.id ? "Editar servicio" : "Nuevo servicio"}
        description="Define nombre, duración, precio y estado del servicio."
      >
        <div className="flex flex-col gap-4.5 pt-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="svc-name" className="text-xs font-semibold text-foreground/80">Nombre del servicio</Label>
            <Input
              id="svc-name"
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              placeholder="Ej. Corte de Cabello Caballero"
              className="border-muted-foreground/20"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="svc-desc" className="text-xs font-semibold text-foreground/80">Descripción</Label>
            <Textarea
              id="svc-desc"
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              placeholder="Describe en qué consiste el servicio..."
              className="min-h-[80px] border-muted-foreground/20"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="svc-dur" className="text-xs font-semibold text-foreground/80">Duración (minutos)</Label>
              <Input
                id="svc-dur"
                type="number"
                min={5}
                step={5}
                value={draft.duration_minutes}
                onChange={(e) => setDraft({ ...draft, duration_minutes: Number(e.target.value) })}
                className="border-muted-foreground/20"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="svc-price" className="text-xs font-semibold text-foreground/80">Precio (MXN)</Label>
              <Input
                id="svc-price"
                type="number"
                min={0}
                value={draft.price}
                onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) })}
                className="border-muted-foreground/20"
              />
            </div>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/20 px-3.5 py-3">
            <div className="flex flex-col gap-0.5">
              <Label className="text-sm font-semibold text-foreground/90">Servicio activo</Label>
              <span className="text-[11px] text-muted-foreground">Estará disponible para agendar citas</span>
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
