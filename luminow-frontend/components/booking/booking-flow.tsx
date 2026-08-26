"use client"

import { ArrowLeft, Calendar, Check, ChevronRight, Clock, MapPin, User, Loader2, Sparkles } from "lucide-react"
import { useEffect, useMemo, useState, type FormEvent } from "react"
import api from "@/lib/axios"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/label"
import { upcomingDays } from "@/lib/availability"

type Step = "service" | "staff" | "datetime" | "details" | "done"
const STEPS: Step[] = ["service", "staff", "datetime", "details"]

function money(n: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", minimumFractionDigits: 0 }).format(n)
}

function initials(name: string) {
  if (!name) return ""
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("")
}

export function BookingFlow({ slug }: { slug: string }) {
  const [loading, setLoading] = useState(true)
  const [business, setBusiness] = useState<any>(null)
  const [services, setServices] = useState<any[]>([])
  const [staff, setStaff] = useState<any[]>([])
  
  const [step, setStep] = useState<Step>("service")
  const [service, setService] = useState<any | null>(null)
  const [member, setMember] = useState<any | null>(null)
  const [date, setDate] = useState<string>("")
  const [time, setTime] = useState<string>("")
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [notes, setNotes] = useState("")
  
  const [slots, setSlots] = useState<string[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [confirmationData, setConfirmationData] = useState<any>(null)

  // Fetch initial data
  useEffect(() => {
    async function fetchInitial() {
      try {
        const [bizRes, srvRes] = await Promise.all([
          api.get(`/api/v1/book/${slug}`),
          api.get(`/api/v1/book/${slug}/services`)
        ])
        setBusiness(bizRes.data.data)
        setServices(srvRes.data.data ?? [])
      } catch (err) {
        console.error("Error fetching business info", err)
      } finally {
        setLoading(false)
      }
    }
    fetchInitial()
  }, [slug])

  // Fetch staff when moving to staff step
  useEffect(() => {
    if (step === "staff" && service) {
      api.get(`/api/v1/book/${slug}/staff?service_id=${service.id}`)
        .then(res => setStaff(res.data.data ?? []))
        .catch(err => console.error(err))
    }
  }, [step, service, slug])

  // Fetch slots when date changes
  useEffect(() => {
    if (step === "datetime" && date && service && member) {
      setSlotsLoading(true)
      api.get(`/api/v1/book/${slug}/availability?service_id=${service.id}&date=${date}&staff_id=${member.id}`)
        .then(res => setSlots(res.data.slots ?? []))
        .catch(err => {
            console.error(err)
            setSlots([])
        })
        .finally(() => setSlotsLoading(false))
    }
  }, [date, step, service, member, slug])

  const days = useMemo(() => {
    return upcomingDays(14)
  }, [])

  function reset() {
    setService(null)
    setMember(null)
    setDate("")
    setTime("")
    setName("")
    setPhone("")
    setEmail("")
    setNotes("")
    setConfirmationData(null)
    setStep("service")
  }

  function goBack() {
    if (step === "staff") setStep("service")
    else if (step === "datetime") setStep("staff")
    else if (step === "details") setStep("datetime")
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!service || !member || !date || !time) return
    setSubmitting(true)
    
    try {
      const res = await api.post(`/api/v1/book/${slug}/appointments`, {
        service_id: service.id,
        staff_member_id: member.id,
        client_name: name,
        client_phone: phone,
        client_email: email,
        date: date,
        start_time: time,
        notes
      })
      setConfirmationData(res.data.data)
      setStep("done")
    } catch (err: any) {
      alert(err.response?.data?.message || err.response?.data?.errors?.client_phone?.[0] || "Error al agendar cita")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 animate-pulse">
        <div className="size-16 bg-muted rounded-2xl" />
        <div className="h-5 w-40 bg-muted rounded-md" />
        <div className="h-4 w-56 bg-muted rounded-md mt-1" />
      </div>
    )
  }

  if (!business) {
    return <div className="flex h-svh items-center justify-center text-muted-foreground text-sm font-medium">Negocio no encontrado</div>
  }

  const stepIndex = STEPS.indexOf(step)

  if (step === "done" && confirmationData) {
    const { message, appointment, service: confService, staff: confStaff, client } = confirmationData
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center py-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex size-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shadow-sm">
          <Check className="size-8" />
        </div>
        <div className="flex flex-col gap-1.5">
          <h1 className="text-xl font-bold tracking-tight text-foreground text-balance">
            {message}
          </h1>
          <p className="text-sm text-muted-foreground text-pretty">
            El negocio confirmará tu cita en breve.
          </p>
        </div>
        <div className="w-full rounded-xl border border-border/60 bg-muted/20 p-5 text-left">
          <dl className="flex flex-col gap-3 text-xs">
            <Row label="Servicio" value={confService?.name ?? ""} />
            <Row label="Colaborador" value={confStaff?.name ?? ""} />
            <Row label="Fecha" value={appointment?.date_formatted ?? ""} />
            <Row label="Hora" value={`${appointment?.start_time} - ${appointment?.end_time}`} />
            <Row label="A nombre de" value={client?.name ?? ""} />
          </dl>
        </div>
        <Button variant="outline" className="w-full h-10 font-semibold shadow-sm" onClick={reset}>
          Agendar otra cita
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Business header */}
      <header className="flex flex-col items-center gap-3 pb-4 text-center">
        {business.logo_url ? (
           <img src={business.logo_url} alt={business.business_name} className="size-16 rounded-2xl object-cover shadow-sm" />
        ) : (
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary font-bold text-lg border border-primary/10 select-none">
            {initials(business.business_name)}
          </div>
        )}
        <div className="flex flex-col gap-1">
          <h1 className="text-lg font-bold tracking-tight text-foreground text-balance">{business.business_name}</h1>
          {business.address && (
            <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground font-medium">
              <MapPin className="size-3.5 text-muted-foreground/75" />
              {business.address}
            </p>
          )}
        </div>
      </header>

      {/* Progress */}
      <div className="flex items-center gap-1.5">
        {STEPS.map((s, i) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= stepIndex ? "bg-primary" : "bg-border/60"}`}
            aria-hidden
          />
        ))}
      </div>

      <div className="flex-1 flex flex-col">
        {step !== "service" && (
          <button
            type="button"
            onClick={goBack}
            className="mb-3.5 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground w-fit cursor-pointer"
          >
            <ArrowLeft className="size-4" />
            Atrás
          </button>
        )}

        {/* Step 1: Service */}
        {step === "service" && (
          <section className="flex flex-col gap-3">
            <StepTitle title="Elige un servicio" />
            <ul className="flex flex-col gap-2">
              {services.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setService(s)
                      setMember(null)
                      setStep("staff")
                    }}
                    className="flex w-full items-center justify-between gap-3 rounded-xl border border-border/60 bg-card p-4 text-left transition-all duration-200 hover:border-primary/40 hover:shadow-sm group cursor-pointer"
                  >
                    <span className="flex flex-col gap-0.5 min-w-0">
                      <span className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors truncate">{s.name}</span>
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                        <Clock className="size-3.5 text-muted-foreground/75" />
                        {s.duration_minutes} min
                      </span>
                    </span>
                    <span className="flex items-center gap-2 shrink-0">
                      <span className="font-bold text-foreground text-sm tabular-nums">{money(s.price)}</span>
                      <ChevronRight className="size-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </button>
                </li>
              ))}
              {services.length === 0 && (
                  <p className="text-sm text-muted-foreground py-6 text-center italic">No hay servicios disponibles.</p>
              )}
            </ul>
          </section>
        )}

        {/* Step 2: Staff */}
        {step === "staff" && (
          <section className="flex flex-col gap-3">
            <StepTitle icon={<User className="size-4" />} title="Elige un profesional" />
            <ul className="flex flex-col gap-2">
              {staff.map((m) => (
                <li key={m.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setMember(m)
                      setDate("")
                      setTime("")
                      setStep("datetime")
                    }}
                    className="flex w-full items-center justify-between gap-3 rounded-xl border border-border/60 bg-card p-4 text-left transition-all duration-200 hover:border-primary/40 hover:shadow-sm group cursor-pointer"
                  >
                    <span className="flex items-center gap-3">
                      {m.avatar_url ? (
                        <img src={m.avatar_url} alt={m.name} className="size-9 rounded-full object-cover" />
                      ) : (
                        <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/10">
                          {initials(m.name)}
                        </span>
                      )}
                      <span className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors">{m.name}</span>
                    </span>
                    <ChevronRight className="size-4 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </li>
              ))}
              {staff.length === 0 && (
                  <p className="text-sm text-muted-foreground py-6 text-center italic">No hay profesionales disponibles para este servicio.</p>
              )}
            </ul>
          </section>
        )}

        {/* Step 3: Date & time */}
        {step === "datetime" && (
          <section className="flex flex-col gap-4">
            <StepTitle icon={<Calendar className="size-4" />} title="Elige fecha y hora" />
            <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
              {days.map((d) => (
                <button
                  key={d.date}
                  type="button"
                  onClick={() => {
                    setDate(d.date)
                    setTime("")
                  }}
                  className={`flex shrink-0 flex-col items-center gap-0.5 rounded-xl border px-4 py-2.5 text-center transition-all duration-200 cursor-pointer ${
                    date === d.date
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-border/60 bg-card hover:border-primary/30 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <span className="text-[10px] uppercase font-semibold tracking-wider">{d.label.split(" ")[0]}</span>
                  <span className="text-sm font-bold capitalize mt-0.5">
                    {d.label.split(" ").slice(1).join(" ")}
                  </span>
                </button>
              ))}
            </div>

            {date && (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 mt-1">
                {slotsLoading && (
                  <div className="col-span-full py-8 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
                    <Loader2 className="size-4 animate-spin" />
                    <span>Cargando horarios disponibles...</span>
                  </div>
                )}
                {!slotsLoading && slots.length === 0 && (
                  <p className="col-span-full py-8 text-center text-sm text-muted-foreground italic">
                    No hay horarios disponibles este día.
                  </p>
                )}
                {!slotsLoading && slots.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setTime(s)
                      setStep("details")
                    }}
                    className="rounded-xl border border-border/60 bg-card py-2 text-sm font-semibold tabular-nums transition-all duration-200 hover:border-primary/40 hover:shadow-sm hover:text-primary cursor-pointer text-center"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Step 4: Details */}
        {step === "details" && (
          <section className="flex flex-col gap-4">
            <StepTitle icon={<User className="size-4" />} title="Tus datos" />
            <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
              <dl className="flex flex-col gap-2.5 text-xs">
                <Row label="Servicio" value={service?.name ?? ""} />
                <Row label="Colaborador" value={member?.name ?? ""} />
                <Row label="Fecha" value={days.find((d) => d.date === date)?.label ?? date} />
                <Row label="Hora" value={time} />
              </dl>
            </div>
            
            <form onSubmit={submit} className="flex flex-col gap-4 mt-1">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="c-name" className="text-xs font-semibold text-foreground/80">Nombre completo</Label>
                <Input id="c-name" value={name} onChange={(e) => setName(e.target.value)} required className="border-muted-foreground/20 h-10" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="c-phone" className="text-xs font-semibold text-foreground/80">Teléfono / WhatsApp</Label>
                <Input
                  id="c-phone"
                  type="tel"
                  inputMode="tel"
                  placeholder="Ej. 55 1234 5678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  className="border-muted-foreground/20 h-10"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="c-email" className="text-xs font-semibold text-foreground/80">Correo electrónico (opcional)</Label>
                <Input
                  id="c-email"
                  type="email"
                  placeholder="Ej. ejemplo@correo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-muted-foreground/20 h-10"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="c-notes" className="text-xs font-semibold text-foreground/80">Notas (opcional)</Label>
                <Textarea
                  id="c-notes"
                  rows={2}
                  placeholder="Ej. Detalles del servicio, alergias, requerimientos..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="border-muted-foreground/20"
                />
              </div>
              <Button type="submit" size="lg" className="w-full h-11 font-semibold shadow-md active:scale-[0.98] transition-all mt-2" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Agendando cita...
                  </>
                ) : (
                  "Confirmar cita"
                )}
              </Button>
            </form>
          </section>
        )}
      </div>

      <footer className="pt-6 text-center border-t border-border/20 mt-4">
        <p className="text-[10px] font-medium text-muted-foreground/80 flex items-center justify-center gap-1">
          Reserva impulsada por <span className="font-semibold text-foreground/75">Luminow</span>
        </p>
      </footer>
    </div>
  )
}

function StepTitle({ icon, title }: { icon?: React.ReactNode; title: string }) {
  return (
    <h2 className="flex items-center gap-2 text-sm font-bold tracking-tight text-foreground/90">
      {icon && <span className="text-muted-foreground/80">{icon}</span>}
      {title}
    </h2>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-0.5">
      <dt className="text-muted-foreground font-medium">{label}</dt>
      <dd className="font-semibold text-right text-foreground">{value}</dd>
    </div>
  )
}

