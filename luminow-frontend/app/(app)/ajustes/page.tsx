"use client"

import { Check, Download, ExternalLink, QrCode, Loader2, Settings, ShieldCheck, CreditCard, MessageSquare } from "lucide-react"
import { QRCodeCanvas } from "qrcode.react"
import { useEffect, useRef, useState } from "react"
import api from "@/lib/axios"

import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

// Shape of the settings object returned by GET /api/v1/tenant/settings
interface TenantSettings {
  business_name: string
  slug: string
  phone: string | null
  email: string | null
  address: string | null
  timezone: string
  logo_url: string | null
  qr_code_url: string | null
  booking_url: string
  subscription_status: string
  subscription_status_label: string
  trial_ends_at: string | null
  settings: {
    whatsapp_enabled: boolean
    slot_interval_minutes: number
  }
}

export default function SettingsPage() {
  const [draft, setDraft] = useState<TenantSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const qrRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await api.get("/api/v1/tenant/settings")
        setDraft(res.data.data)
      } catch (err) {
        console.error("Error fetching settings", err)
        setError("No se pudieron cargar los ajustes. Verifica tu conexión.")
      } finally {
        setLoading(false)
      }
    }
    fetchSettings()
  }, [])

  const bookingUrl = draft?.booking_url ?? ""
  const bookingPath = draft?.slug ? `/book/${draft.slug}` : ""

  function set(key: keyof TenantSettings, value: unknown) {
    setSaved(false)
    setDraft((d) => d ? { ...d, [key]: value } : d)
  }

  function setNestedSetting(key: keyof TenantSettings["settings"], value: unknown) {
    setSaved(false)
    setDraft((d) =>
      d ? { ...d, settings: { ...d.settings, [key]: value } } : d
    )
  }

  async function save() {
    if (!draft) return
    setSaving(true)
    setError(null)
    try {
      await api.put("/api/v1/tenant/settings", {
        business_name: draft.business_name,
        phone: draft.phone,
        email: draft.email,
        address: draft.address,
        settings: {
          whatsapp_enabled: draft.settings.whatsapp_enabled,
          slot_interval_minutes: draft.settings.slot_interval_minutes,
        },
      })
      setSaved(true)
    } catch {
      setError("Error al guardar los ajustes. Inténtalo de nuevo.")
    } finally {
      setSaving(false)
    }
  }

  function downloadQr() {
    const canvas = qrRef.current?.querySelector("canvas")
    if (!canvas || !draft) return
    const link = document.createElement("a")
    link.download = `qr-${draft.slug}.png`
    link.href = canvas.toDataURL("image/png")
    link.click()
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse py-6">
        <div className="flex flex-col gap-2">
          <div className="h-8 w-40 bg-muted rounded-lg" />
          <div className="h-4 w-72 bg-muted rounded-md" />
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 flex flex-col gap-4">
            <div className="h-80 bg-muted rounded-xl" />
            <div className="h-48 bg-muted rounded-xl" />
            <div className="h-32 bg-muted rounded-xl" />
          </div>
          <div className="h-96 bg-muted rounded-xl" />
        </div>
      </div>
    )
  }

  if (error && !draft) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="rounded-full bg-destructive/10 p-3 text-destructive mb-3">
          <Loader2 className="size-6" />
        </div>
        <p className="text-sm font-medium text-foreground">{error}</p>
      </div>
    )
  }

  if (!draft) return null

  return (
    <div className="flex flex-col gap-6 py-2">
      <PageHeader
        title="Ajustes"
        description="Configura la información y las preferencias operacionales de tu negocio."
        action={
          <Button
            size="sm"
            onClick={save}
            disabled={saving}
            className={`h-9 font-medium shadow-sm transition-all duration-200 ${
              saved
                ? "bg-emerald-600 hover:bg-emerald-600 text-white"
                : "bg-primary text-primary-foreground hover:bg-primary/95"
            }`}
          >
            {saving ? (
              <Loader2 className="size-4 animate-spin mr-1.5" />
            ) : saved ? (
              <Check className="size-4 mr-1.5" />
            ) : null}
            {saving ? "Guardando..." : saved ? "Guardado" : "Guardar cambios"}
          </Button>
        }
      />

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3.5 text-xs text-destructive font-medium animate-in fade-in slide-in-from-top-1 duration-200">
          <Loader2 className="size-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="flex flex-col gap-4 lg:col-span-2">
          {/* Business Info */}
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Settings className="size-4 text-muted-foreground" />
                <CardTitle className="text-base font-semibold">Información del negocio</CardTitle>
              </div>
              <CardDescription>Datos principales y de contacto de tu local</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2">
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <Label htmlFor="biz-name" className="text-xs font-semibold text-foreground/80">Nombre comercial</Label>
                <Input
                  id="biz-name"
                  value={draft.business_name}
                  onChange={(e) => set("business_name", e.target.value)}
                  className="border-muted-foreground/20 h-10"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="biz-slug" className="text-xs font-semibold text-foreground/80">
                  Slug (Ruta URL pública)
                  <span className="ml-1.5 text-[10px] text-muted-foreground/80 font-normal">(Solo lectura)</span>
                </Label>
                <Input
                  id="biz-slug"
                  value={draft.slug}
                  readOnly
                  className="cursor-not-allowed opacity-60 bg-muted/30 border-muted-foreground/15 h-10"
                  title="El slug no se puede cambiar directamente para evitar romper links existentes"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="biz-phone" className="text-xs font-semibold text-foreground/80">Teléfono de contacto</Label>
                <Input
                  id="biz-phone"
                  value={draft.phone ?? ""}
                  onChange={(e) => set("phone", e.target.value)}
                  className="border-muted-foreground/20 h-10"
                  placeholder="Ej. +52 55 1234 5678"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="biz-email" className="text-xs font-semibold text-foreground/80">Correo electrónico</Label>
                <Input
                  id="biz-email"
                  type="email"
                  value={draft.email ?? ""}
                  onChange={(e) => set("email", e.target.value)}
                  className="border-muted-foreground/20 h-10"
                  placeholder="negocio@correo.com"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="biz-tz" className="text-xs font-semibold text-foreground/80">Zona horaria</Label>
                <Select
                  id="biz-tz"
                  value={draft.timezone}
                  onChange={(e) => set("timezone", e.target.value)}
                  className="h-10 border-muted-foreground/20 text-xs font-medium"
                >
                  <option value="America/Mexico_City">America/Mexico_City</option>
                  <option value="America/Monterrey">America/Monterrey</option>
                  <option value="America/Tijuana">America/Tijuana</option>
                  <option value="America/Bogota">America/Bogota</option>
                  <option value="America/Argentina/Buenos_Aires">America/Buenos_Aires</option>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <Label htmlFor="biz-addr" className="text-xs font-semibold text-foreground/80">Dirección física</Label>
                <Input
                  id="biz-addr"
                  value={draft.address ?? ""}
                  onChange={(e) => set("address", e.target.value)}
                  className="border-muted-foreground/20 h-10"
                  placeholder="Calle, Número, Colonia, Ciudad"
                />
              </div>
            </CardContent>
          </Card>

          {/* Preferences */}
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="size-4 text-muted-foreground" />
                <CardTitle className="text-base font-semibold">Preferencias de reservas</CardTitle>
              </div>
              <CardDescription>Configura cómo interactúan tus clientes con el sistema</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 pt-2">
              <div className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/20 px-3.5 py-3 hover:bg-muted/30 transition-colors duration-200">
                <div className="flex flex-col gap-0.5">
                  <Label className="text-sm font-semibold text-foreground/90">Notificaciones por WhatsApp</Label>
                  <span className="text-[11px] text-muted-foreground">
                    Enviar de forma automatizada confirmaciones y recordatorios.
                  </span>
                </div>
                <Switch
                  checked={draft.settings.whatsapp_enabled}
                  onCheckedChange={(c) => setNestedSetting("whatsapp_enabled", c)}
                />
              </div>
              
              <div className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/20 px-3.5 py-3 hover:bg-muted/30 transition-colors duration-200">
                <div className="flex flex-col gap-0.5">
                  <Label className="text-sm font-semibold text-foreground/90">Intervalo de reservas (slots)</Label>
                  <span className="text-[11px] text-muted-foreground">
                    Define la frecuencia y la división horaria disponible.
                  </span>
                </div>
                <Select
                  id="biz-interval"
                  className="h-9 w-28 border-muted-foreground/15 text-xs font-semibold"
                  value={String(draft.settings.slot_interval_minutes)}
                  onChange={(e) => setNestedSetting("slot_interval_minutes", Number(e.target.value))}
                >
                  <option value="15">15 min</option>
                  <option value="30">30 min</option>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Subscription */}
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="size-4 text-muted-foreground" />
                <CardTitle className="text-base font-semibold">Estado de suscripción</CardTitle>
              </div>
              <CardDescription>Detalles del plan y facturación de Luminow</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 pt-1">
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                    draft.subscription_status === "active"
                      ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                      : draft.subscription_status === "trial"
                      ? "bg-yellow-500/10 text-yellow-600 border border-yellow-500/20"
                      : "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                  }`}
                >
                  <ShieldCheck className="size-3.5 mr-1" />
                  {draft.subscription_status_label}
                </span>
              </div>
              {draft.trial_ends_at && (
                <p className="text-xs text-muted-foreground font-medium mt-1">
                  Tu período de prueba finaliza el: <strong className="text-foreground">{draft.trial_ends_at}</strong>
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* QR Code Widget */}
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
              {bookingUrl ? (
                <QRCodeCanvas value={bookingUrl} size={152} level="M" marginSize={0} />
              ) : (
                <div className="flex size-[152px] items-center justify-center text-xs text-muted-foreground">
                  Sin URL
                </div>
              )}
            </div>
            <div className="text-center w-full mt-1">
              <p className="break-all text-[11px] text-muted-foreground hover:text-primary transition-colors underline decoration-dotted">
                {bookingUrl}
              </p>
            </div>
            <div className="flex w-full flex-col gap-2 mt-3">
              <Button
                variant="outline"
                size="sm"
                className="w-full h-9 font-medium shadow-sm"
                onClick={downloadQr}
                disabled={!bookingUrl}
              >
                <Download className="size-4" />
                Descargar QR
              </Button>
              {bookingPath && (
                <a
                  href={bookingPath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border h-9 px-3 text-sm font-medium transition-colors hover:bg-accent text-foreground shadow-sm hover:shadow"
                >
                  <ExternalLink className="size-4" />
                  Ver página de reserva
                </a>
              )}
            </div>
            <p className="text-center text-[10px] text-muted-foreground/80 leading-relaxed px-4 mt-2">
              Imprime este código y colócalo en tu local para facilitar que tus clientes agenden escaneando directamente.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

