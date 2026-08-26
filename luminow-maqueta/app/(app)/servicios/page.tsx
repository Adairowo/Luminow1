"use client"

import { Clock, Pencil, Plus, Trash2 } from "lucide-react"
import { useState } from "react"

import { PageHeader } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label, Textarea } from "@/components/ui/label"
import { Modal } from "@/components/ui/modal"
import { Switch } from "@/components/ui/switch"
import { useStore, type Service } from "@/lib/store"

type Draft = {
  id?: number
  name: string
  description: string
  durationMinutes: number
  price: number
  isActive: boolean
}

const EMPTY: Draft = { name: "", description: "", durationMinutes: 30, price: 0, isActive: true }

export default function ServicesPage() {
  const { services, saveService, deleteService } = useStore()
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<Draft>(EMPTY)

  function openNew() {
    setDraft(EMPTY)
    setOpen(true)
  }

  function openEdit(s: Service) {
    setDraft({ ...s })
    setOpen(true)
  }

  function submit() {
    if (!draft.name.trim()) return
    saveService(draft)
    setOpen(false)
  }

  return (
    <>
      <PageHeader
        title="Servicios"
        description="Administra los servicios que ofrece tu negocio."
        action={
          <Button size="sm" onClick={openNew}>
            <Plus className="size-4" />
            Nuevo servicio
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((s) => (
          <Card key={s.id}>
            <CardContent className="flex flex-col gap-3 p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col gap-1">
                  <span className="font-medium">{s.name}</span>
                  {s.isActive ? (
                    <Badge variant="muted">Activo</Badge>
                  ) : (
                    <Badge variant="outline">Inactivo</Badge>
                  )}
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon-sm" onClick={() => openEdit(s)} aria-label="Editar">
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => deleteService(s.id)}
                    aria-label="Eliminar"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
              <p className="min-h-8 text-sm text-muted-foreground text-pretty">{s.description}</p>
              <div className="flex items-center justify-between border-t border-border pt-3">
                <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Clock className="size-3.5" />
                  {s.durationMinutes} min
                </span>
                <span className="text-base font-semibold tabular-nums">${s.price.toLocaleString("es-MX")}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Modal
        open={open}
        onOpenChange={setOpen}
        title={draft.id ? "Editar servicio" : "Nuevo servicio"}
        description="Define nombre, duración y precio del servicio."
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="svc-name">Nombre</Label>
            <Input
              id="svc-name"
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              placeholder="Corte de cabello"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="svc-desc">Descripción</Label>
            <Textarea
              id="svc-desc"
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              placeholder="Descripción breve del servicio"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="svc-dur">Duración (min)</Label>
              <Input
                id="svc-dur"
                type="number"
                min={5}
                step={5}
                value={draft.durationMinutes}
                onChange={(e) => setDraft({ ...draft, durationMinutes: Number(e.target.value) })}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="svc-price">Precio ($)</Label>
              <Input
                id="svc-price"
                type="number"
                min={0}
                value={draft.price}
                onChange={(e) => setDraft({ ...draft, price: Number(e.target.value) })}
              />
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
            <Label>Servicio activo</Label>
            <Switch
              checked={draft.isActive}
              onCheckedChange={(checked) => setDraft({ ...draft, isActive: checked })}
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button size="sm" onClick={submit}>
              Guardar
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
