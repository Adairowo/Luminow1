"use client"

import { ArrowLeft, Calendar, Check, ChevronRight, Clock, MapPin, Scissors, User } from "lucide-react"
import { useMemo, useState, type FormEvent } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/label"
import { addMinutes, availableSlots, upcomingOpenDays } from "@/lib/availability"
import { useStore, type Service, type StaffMember } from "@/lib/store"

type Step = "service" | "staff" | "datetime" | "details" | "done"

const STEPS: Step[] = ["service", "staff", "datetime", "details"]

function money(n: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", minimumFractionDigits: 0 }).format(n)
}

export function BookingFlow() {
  const { services, staff, appointments, hours, settings, addAppointment } = useStore()

  const [step, setStep] = useState<Step>("service")
  const [service, setService] = useState<Service | null>(null)
  const [member, setMember] = useState<StaffMember | null>(null)
  const [date, setDate] = useState<string>("")
  const [time, setTime] = useState<string>("")
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [notes, setNotes] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const activeServices = useMemo(() => services.filter((s) => s.isActive), [services])

  const eligibleStaff = useMemo(
    () => staff.filter((s) => s.isActive && (service ? s.serviceIds.includes(service.id) : true)),
    [staff, service],
  )

  const days = useMemo(() => upcomingOpenDays(hours, 14), [hours])

  const slots = useMemo(() => {
    if (!service || !date) return []
    return availableSlots({
      date,
      hours,
      appointments,
      durationMinutes: service.durationMinutes,
      slotInterval: settings.slotInterval,
      staffId: member?.id ?? null,
    })
  }, [service, date, member, hours, appointments, settings.slotInterval])

  function reset() {
    setService(null)
    setMember(null)
    setDate("")
    setTime("")
    setName("")
    setPhone("")
    setEmail("")
    setNotes("")
    setStep("service")
  }

  function goBack() {
    if (step === "staff") setStep("service")
    else if (step === "datetime") setStep("staff")
    else if (step === "details") setStep("datetime")
  }

  function submit(e: FormEvent) {
    e.preventDefault()
    if (!service || !date || !time) return
    setSubmitting(true)
    const assigned = member ?? eligibleStaff[0]
    setTimeout(() => {
      addAppointment({
        serviceId: service.id,
        staffId: assigned?.id ?? 0,
        clientName: name,
        clientPhone: phone,
        date,
        startTime: time,
        endTime: addMinutes(time, service.durationMinutes),
        status: settings.autoConfirm ? "confirmed" : "pending",
        notes: notes || undefined,
      })
      setSubmitting(false)
      setStep("done")
    }, 600)
  }

  const stepIndex = STEPS.indexOf(step)

  if (step === "done") {
    const assigned = member ?? eligibleStaff[0]
    const selectedDay = days.find((d) => d.date === date)
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Check className="size-7" />
        </div>
        <div className="flex flex-col gap-1.5">
          <h1 className="text-xl font-semibold tracking-tight text-balance">
            {settings.autoConfirm ? "¡Cita confirmada!" : "¡Solicitud enviada!"}
          </h1>
          <p className="text-sm text-muted-foreground text-pretty">
            {settings.autoConfirm
              ? "Te esperamos. Recibirás un recordatorio antes de tu cita."
              : "El negocio confirmará tu cita en breve."}
          </p>
        </div>
        <div className="w-full rounded-xl border border-border bg-card p-4 text-left">
          <dl className="flex flex-col gap-2.5 text-sm">
            <Row label="Servicio" value={service?.name ?? ""} />
            <Row label="Profesional" value={assigned?.name ?? "Cualquiera"} />
            <Row label="Fecha" value={selectedDay?.label ?? date} />
            <Row label="Hora" value={time} />
            <Row label="A nombre de" value={name} />
          </dl>
        </div>
        <Button variant="outline" className="w-full" onClick={reset}>
          Agendar otra cita
        </Button>
      </div>
    )
  }

  return (
    <>
      {/* Business header */}
      <header className="flex flex-col items-center gap-3 pb-6 text-center">
        <div className="flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <Scissors className="size-5" />
        </div>
        <div className="flex flex-col gap-1">
          <h1 className="text-lg font-semibold tracking-tight text-balance">{settings.businessName}</h1>
          <p className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
            <MapPin className="size-3" />
            {settings.address}
          </p>
        </div>
      </header>

      {/* Progress */}
      <div className="mb-5 flex items-center gap-1.5">
        {STEPS.map((s, i) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full ${i <= stepIndex ? "bg-primary" : "bg-border"}`}
            aria-hidden
          />
        ))}
      </div>

      <div className="flex-1">
        {step !== "service" && (
          <button
            type="button"
            onClick={goBack}
            className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
            Atrás
          </button>
        )}

        {/* Step 1: Service */}
        {step === "service" && (
          <section className="flex flex-col gap-3">
            <StepTitle icon={<Scissors className="size-4" />} title="Elige un servicio" />
            <ul className="flex flex-col gap-2">
              {activeServices.map((s) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setService(s)
                      setMember(null)
                      setStep("staff")
                    }}
                    className="flex w-full items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-foreground/30"
                  >
                    <span className="flex flex-col gap-0.5">
                      <span className="font-medium">{s.name}</span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="size-3" />
                        {s.durationMinutes} min
                      </span>
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="font-semibold tabular-nums">{money(s.price)}</span>
                      <ChevronRight className="size-4 text-muted-foreground" />
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Step 2: Staff */}
        {step === "staff" && (
          <section className="flex flex-col gap-3">
            <StepTitle icon={<User className="size-4" />} title="Elige un profesional" />
            <ul className="flex flex-col gap-2">
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setMember(null)
                    setDate("")
                    setTime("")
                    setStep("datetime")
                  }}
                  className="flex w-full items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-foreground/30"
                >
                  <span className="font-medium">Cualquier profesional</span>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </button>
              </li>
              {eligibleStaff.map((m) => (
                <li key={m.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setMember(m)
                      setDate("")
                      setTime("")
                      setStep("datetime")
                    }}
                    className="flex w-full items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-foreground/30"
                  >
                    <span className="flex items-center gap-3">
                      <span className="flex size-9 items-center justify-center rounded-full bg-muted text-sm font-medium">
                        {m.name.charAt(0)}
                      </span>
                      <span className="font-medium">{m.name}</span>
                    </span>
                    <ChevronRight className="size-4 text-muted-foreground" />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Step 3: Date & time */}
        {step === "datetime" && (
          <section className="flex flex-col gap-4">
            <StepTitle icon={<Calendar className="size-4" />} title="Elige fecha y hora" />
            <div className="flex gap-2 overflow-x-auto pb-1">
              {days.map((d) => (
                <button
                  key={d.date}
                  type="button"
                  onClick={() => {
                    setDate(d.date)
                    setTime("")
                  }}
                  className={`flex shrink-0 flex-col items-center gap-0.5 rounded-xl border px-4 py-2.5 text-center transition-colors ${
                    date === d.date
                      ? "border-foreground bg-primary text-primary-foreground"
                      : "border-border bg-card hover:border-foreground/30"
                  }`}
                >
                  <span className="text-xs capitalize">{d.label.split(" ")[0]}</span>
                  <span className="text-sm font-semibold capitalize">
                    {d.label.split(" ").slice(1).join(" ")}
                  </span>
                </button>
              ))}
            </div>

            {date && (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {slots.length === 0 && (
                  <p className="col-span-full py-4 text-center text-sm text-muted-foreground">
                    No hay horarios disponibles este día.
                  </p>
                )}
                {slots.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setTime(s)
                      setStep("details")
                    }}
                    className="rounded-lg border border-border bg-card py-2 text-sm font-medium tabular-nums transition-colors hover:border-foreground/30"
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
            <div className="rounded-xl border border-border bg-card p-4">
              <dl className="flex flex-col gap-2 text-sm">
                <Row label="Servicio" value={service?.name ?? ""} />
                <Row label="Profesional" value={(member ?? eligibleStaff[0])?.name ?? "Cualquiera"} />
                <Row label="Fecha" value={days.find((d) => d.date === date)?.label ?? date} />
                <Row label="Hora" value={time} />
              </dl>
            </div>
            <form onSubmit={submit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="c-name">Nombre completo</Label>
                <Input id="c-name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="c-phone">Teléfono / WhatsApp</Label>
                <Input
                  id="c-phone"
                  type="tel"
                  inputMode="tel"
                  placeholder="+52 55 1234 5678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="c-email">Correo (opcional)</Label>
                <Input
                  id="c-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="c-notes">Notas (opcional)</Label>
                <Textarea
                  id="c-notes"
                  rows={2}
                  placeholder="Algo que debamos saber…"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
              <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                {submitting ? "Agendando…" : "Confirmar cita"}
              </Button>
            </form>
          </section>
        )}
      </div>

      <footer className="pt-6 text-center">
        <p className="text-xs text-muted-foreground">
          Reserva impulsada por <span className="font-medium text-foreground">Luminow</span>
        </p>
      </footer>
    </>
  )
}

function StepTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <h2 className="flex items-center gap-2 text-base font-semibold tracking-tight">
      <span className="text-muted-foreground">{icon}</span>
      {title}
    </h2>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium text-right">{value}</dd>
    </div>
  )
}
