"use client"

import { Check, Download, ExternalLink, QrCode } from "lucide-react"
import { QRCodeCanvas } from "qrcode.react"
import { useEffect, useRef, useState } from "react"

import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useStore, type Settings } from "@/lib/store"

export default function SettingsPage() {
  const { settings, updateSettings } = useStore()
  const [draft, setDraft] = useState<Settings>(settings)
  const [saved, setSaved] = useState(false)
  const qrRef = useRef<HTMLDivElement>(null)
  const [origin, setOrigin] = useState("https://luminow.app")

  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  const bookingPath = `/book/${draft.slug}`
  const bookingUrl = `${origin}${bookingPath}`

  function set<K extends keyof Settings>(key: K, value: Settings[K]) {
    setSaved(false)
    setDraft((d) => ({ ...d, [key]: value }))
  }

  function save() {
    updateSettings(draft)
    setSaved(true)
  }

  function downloadQr() {
    const canvas = qrRef.current?.querySelector("canvas")
    if (!canvas) return
    const link = document.createElement("a")
    link.download = `qr-${draft.slug}.png`
    link.href = canvas.toDataURL("image/png")
    link.click()
  }

  return (
    <>
      <PageHeader
        title="Ajustes"
        description="Configura la información y las preferencias de tu negocio."
        action={
          <Button size="sm" onClick={save}>
            {saved ? <Check className="size-4" /> : null}
            {saved ? "Guardado" : "Guardar cambios"}
          </Button>
        }
      />

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Información del negocio</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <Label htmlFor="biz-name">Nombre del negocio</Label>
                <Input
                  id="biz-name"
                  value={draft.businessName}
                  onChange={(e) => set("businessName", e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="biz-slug">Slug (URL pública)</Label>
                <Input id="biz-slug" value={draft.slug} onChange={(e) => set("slug", e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="biz-phone">Teléfono</Label>
                <Input id="biz-phone" value={draft.phone} onChange={(e) => set("phone", e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="biz-email">Email</Label>
                <Input
                  id="biz-email"
                  type="email"
                  value={draft.email}
                  onChange={(e) => set("email", e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="biz-tz">Zona horaria</Label>
                <Select id="biz-tz" value={draft.timezone} onChange={(e) => set("timezone", e.target.value)}>
                  <option value="America/Mexico_City">America/Mexico_City</option>
                  <option value="America/Monterrey">America/Monterrey</option>
                  <option value="America/Tijuana">America/Tijuana</option>
                  <option value="America/Bogota">America/Bogota</option>
                  <option value="America/Argentina/Buenos_Aires">America/Buenos_Aires</option>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <Label htmlFor="biz-addr">Dirección</Label>
                <Input id="biz-addr" value={draft.address} onChange={(e) => set("address", e.target.value)} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Preferencias de reservas</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
                <div className="flex flex-col">
                  <Label>Confirmación automática</Label>
                  <span className="text-xs text-muted-foreground">
                    Las citas nuevas quedan confirmadas al instante.
                  </span>
                </div>
                <Switch checked={draft.autoConfirm} onCheckedChange={(c) => set("autoConfirm", c)} />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
                <div className="flex flex-col">
                  <Label>Notificaciones por WhatsApp</Label>
                  <span className="text-xs text-muted-foreground">
                    Enviar confirmaciones y recordatorios vía WhatsApp.
                  </span>
                </div>
                <Switch checked={draft.whatsappEnabled} onCheckedChange={(c) => set("whatsappEnabled", c)} />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
                <div className="flex flex-col">
                  <Label htmlFor="biz-interval">Intervalo de slots</Label>
                  <span className="text-xs text-muted-foreground">Frecuencia de los horarios disponibles.</span>
                </div>
                <Select
                  id="biz-interval"
                  className="h-8 w-28"
                  value={String(draft.slotInterval)}
                  onChange={(e) => set("slotInterval", Number(e.target.value))}
                >
                  <option value="15">15 min</option>
                  <option value="30">30 min</option>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <QrCode className="size-4" />
              Código QR
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <div ref={qrRef} className="rounded-xl border border-border bg-background p-4">
              <QRCodeCanvas value={bookingUrl} size={168} level="M" marginSize={0} />
            </div>
            <p className="break-all text-center text-xs text-muted-foreground">{bookingUrl}</p>
            <Button variant="outline" size="sm" className="w-full" onClick={downloadQr}>
              <Download className="size-4" />
              Descargar QR
            </Button>
            <a
              href={bookingPath}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium transition-colors hover:bg-accent"
            >
              <ExternalLink className="size-4" />
              Ver página de reserva
            </a>
            <p className="text-center text-xs text-muted-foreground text-pretty">
              Imprime este código para que tus clientes reserven escaneándolo.
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
