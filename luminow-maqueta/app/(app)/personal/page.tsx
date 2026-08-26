"use client"

import { Pencil, Phone, Plus, Trash2 } from "lucide-react"
import { useState } from "react"

import { PageHeader } from "@/components/page-header"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Modal } from "@/components/ui/modal"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { useStore, type StaffMember } from "@/lib/store"

type Draft = {
  id?: number
  name: string
  phone: string
  isActive: boolean
  serviceIds: number[]
}

const EMPTY: Draft = { name: "", phone: "", isActive: true, serviceIds: [] }

function initials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

export default function StaffPage() {
  const { staff, services, saveStaff, deleteStaff } = useStore()
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<Draft>(EMPTY)

  function openNew() {
    setDraft(EMPTY)
    setOpen(true)
  }

  function openEdit(s: StaffMember) {
    setDraft({ ...s })
    setOpen(true)
  }

  function toggleService(id: number) {
    setDraft((d) => ({
      ...d,
      serviceIds: d.serviceIds.includes(id)
        ? d.serviceIds.filter((x) => x !== id)
        : [...d.serviceIds, id],
    }))
  }

  function submit() {
    if (!draft.name.trim()) return
    saveStaff(draft)
    setOpen(false)
  }

  return (
    <>
      <PageHeader
        title="Personal"
        description="Gestiona empleados y los servicios que pueden realizar."
        action={
          <Button size="sm" onClick={openNew}>
            <Plus className="size-4" />
            Nuevo empleado
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {staff.map((s) => (
          <Card key={s.id}>
            <CardContent className="flex flex-col gap-3 p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                    {initials(s.name)}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium">{s.name}</span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Phone className="size-3" />
                      {s.phone}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon-sm" onClick={() => openEdit(s)} aria-label="Editar">
                    <Pencil className="size-4" />
                  </Button>
                  <Button variant="ghost" size="icon-sm" onClick={() => deleteStaff(s.id)} aria-label="Eliminar">
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 border-t border-border pt-3">
                {s.serviceIds.length === 0 ? (
                  <span className="text-xs text-muted-foreground">Sin servicios asignados</span>
                ) : (
                  s.serviceIds.map((id) => {
                    const svc = services.find((x) => x.id === id)
                    return svc ? (
                      <Badge key={id} variant="outline">
                        {svc.name}
                      </Badge>
                    ) : null
                  })
                )}
              </div>
              <div>
                {s.isActive ? (
                  <Badge variant="muted">Activo</Badge>
                ) : (
                  <Badge variant="outline">Inactivo</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Modal
        open={open}
        onOpenChange={setOpen}
        title={draft.id ? "Editar empleado" : "Nuevo empleado"}
        description="Datos del empleado y servicios que puede atender."
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="st-name">Nombre</Label>
            <Input
              id="st-name"
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              placeholder="Carlos Méndez"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="st-phone">Teléfono</Label>
            <Input
              id="st-phone"
              value={draft.phone}
              onChange={(e) => setDraft({ ...draft, phone: e.target.value })}
              placeholder="+52 55 1234 5678"
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label>Servicios que realiza</Label>
            <div className="flex flex-wrap gap-2">
              {services.map((svc) => {
                const active = draft.serviceIds.includes(svc.id)
                return (
                  <button
                    key={svc.id}
                    type="button"
                    onClick={() => toggleService(svc.id)}
                    className={cn(
                      "rounded-md border px-2.5 py-1 text-xs font-medium transition-colors",
                      active
                        ? "border-transparent bg-primary text-primary-foreground"
                        : "border-border text-muted-foreground hover:bg-muted",
                    )}
                  >
                    {svc.name}
                  </button>
                )
              })}
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
            <Label>Empleado activo</Label>
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
