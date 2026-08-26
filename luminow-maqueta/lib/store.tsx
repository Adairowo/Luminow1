"use client"

import { createContext, useContext, useMemo, useState, type ReactNode } from "react"

export type AppointmentStatus = "pending" | "confirmed" | "completed" | "cancelled" | "no_show"

export type Service = {
  id: number
  name: string
  description: string
  durationMinutes: number
  price: number
  isActive: boolean
}

export type StaffMember = {
  id: number
  name: string
  phone: string
  isActive: boolean
  serviceIds: number[]
}

export type Appointment = {
  id: number
  serviceId: number
  staffId: number
  clientName: string
  clientPhone: string
  date: string // YYYY-MM-DD
  startTime: string // HH:mm
  endTime: string // HH:mm
  status: AppointmentStatus
  notes?: string
}

export type BusinessHour = {
  dayOfWeek: number // 0=Dom ... 6=Sab
  openTime: string
  closeTime: string
  isClosed: boolean
}

export type Settings = {
  businessName: string
  slug: string
  phone: string
  email: string
  address: string
  timezone: string
  whatsappEnabled: boolean
  autoConfirm: boolean
  slotInterval: number
}

export const DAY_NAMES = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"]

const today = new Date()
function dateOffset(days: number) {
  const d = new Date(today)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

const initialServices: Service[] = [
  { id: 1, name: "Corte de cabello", description: "Corte clásico con tijera y máquina", durationMinutes: 30, price: 150, isActive: true },
  { id: 2, name: "Corte + Barba", description: "Corte completo con perfilado de barba", durationMinutes: 45, price: 220, isActive: true },
  { id: 3, name: "Afeitado clásico", description: "Afeitado con navaja y toalla caliente", durationMinutes: 30, price: 180, isActive: true },
  { id: 4, name: "Tinte", description: "Aplicación de color profesional", durationMinutes: 60, price: 350, isActive: false },
]

const initialStaff: StaffMember[] = [
  { id: 1, name: "Carlos Méndez", phone: "+52 55 1234 5678", isActive: true, serviceIds: [1, 2, 3] },
  { id: 2, name: "Diego Ramírez", phone: "+52 55 8765 4321", isActive: true, serviceIds: [1, 2] },
  { id: 3, name: "Andrés Torres", phone: "+52 55 5555 1212", isActive: true, serviceIds: [1, 3, 4] },
]

const initialAppointments: Appointment[] = [
  { id: 1, serviceId: 2, staffId: 1, clientName: "Luis Herrera", clientPhone: "+52 55 1111 2222", date: dateOffset(0), startTime: "09:00", endTime: "09:45", status: "confirmed" },
  { id: 2, serviceId: 1, staffId: 2, clientName: "Marcos Díaz", clientPhone: "+52 55 3333 4444", date: dateOffset(0), startTime: "10:00", endTime: "10:30", status: "confirmed" },
  { id: 3, serviceId: 3, staffId: 3, clientName: "Pedro Salas", clientPhone: "+52 55 5555 6666", date: dateOffset(0), startTime: "11:30", endTime: "12:00", status: "pending" },
  { id: 4, serviceId: 1, staffId: 1, clientName: "Jorge Vega", clientPhone: "+52 55 7777 8888", date: dateOffset(0), startTime: "13:00", endTime: "13:30", status: "completed" },
  { id: 5, serviceId: 2, staffId: 2, clientName: "Raúl Campos", clientPhone: "+52 55 9999 0000", date: dateOffset(1), startTime: "09:30", endTime: "10:15", status: "confirmed" },
  { id: 6, serviceId: 3, staffId: 1, clientName: "Iván Ortiz", clientPhone: "+52 55 2222 3333", date: dateOffset(1), startTime: "12:00", endTime: "12:30", status: "confirmed" },
  { id: 7, serviceId: 1, staffId: 3, clientName: "Hugo Núñez", clientPhone: "+52 55 4444 5555", date: dateOffset(-1), startTime: "16:00", endTime: "16:30", status: "cancelled" },
  { id: 8, serviceId: 2, staffId: 2, clientName: "Sergio Rojas", clientPhone: "+52 55 6666 7777", date: dateOffset(-1), startTime: "17:00", endTime: "17:45", status: "no_show" },
  { id: 9, serviceId: 1, staffId: 1, clientName: "Tomás Flores", clientPhone: "+52 55 8888 9999", date: dateOffset(-2), startTime: "10:00", endTime: "10:30", status: "completed" },
  { id: 10, serviceId: 3, staffId: 3, clientName: "Emilio Cano", clientPhone: "+52 55 1010 2020", date: dateOffset(2), startTime: "11:00", endTime: "11:30", status: "pending" },
]

const initialHours: BusinessHour[] = [
  { dayOfWeek: 0, openTime: "10:00", closeTime: "14:00", isClosed: true },
  { dayOfWeek: 1, openTime: "09:00", closeTime: "19:00", isClosed: false },
  { dayOfWeek: 2, openTime: "09:00", closeTime: "19:00", isClosed: false },
  { dayOfWeek: 3, openTime: "09:00", closeTime: "19:00", isClosed: false },
  { dayOfWeek: 4, openTime: "09:00", closeTime: "19:00", isClosed: false },
  { dayOfWeek: 5, openTime: "09:00", closeTime: "20:00", isClosed: false },
  { dayOfWeek: 6, openTime: "10:00", closeTime: "16:00", isClosed: false },
]

const initialSettings: Settings = {
  businessName: "Barbería Don Pedro",
  slug: "barberia-don-pedro",
  phone: "+52 55 4000 1234",
  email: "contacto@donpedro.mx",
  address: "Av. Reforma 123, CDMX",
  timezone: "America/Mexico_City",
  whatsappEnabled: true,
  autoConfirm: true,
  slotInterval: 30,
}

type Store = {
  services: Service[]
  staff: StaffMember[]
  appointments: Appointment[]
  hours: BusinessHour[]
  settings: Settings
  saveService: (s: Omit<Service, "id"> & { id?: number }) => void
  deleteService: (id: number) => void
  saveStaff: (s: Omit<StaffMember, "id"> & { id?: number }) => void
  deleteStaff: (id: number) => void
  addAppointment: (a: Omit<Appointment, "id">) => Appointment
  setAppointmentStatus: (id: number, status: AppointmentStatus) => void
  updateHours: (hours: BusinessHour[]) => void
  updateSettings: (s: Settings) => void
}

const StoreContext = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [services, setServices] = useState<Service[]>(initialServices)
  const [staff, setStaff] = useState<StaffMember[]>(initialStaff)
  const [appointments, setAppointments] = useState<Appointment[]>(initialAppointments)
  const [hours, setHours] = useState<BusinessHour[]>(initialHours)
  const [settings, setSettings] = useState<Settings>(initialSettings)

  const value = useMemo<Store>(
    () => ({
      services,
      staff,
      appointments,
      hours,
      settings,
      saveService: (s) =>
        setServices((prev) =>
          s.id
            ? prev.map((x) => (x.id === s.id ? { ...(s as Service) } : x))
            : [...prev, { ...s, id: Math.max(0, ...prev.map((p) => p.id)) + 1 } as Service],
        ),
      deleteService: (id) => setServices((prev) => prev.filter((x) => x.id !== id)),
      saveStaff: (s) =>
        setStaff((prev) =>
          s.id
            ? prev.map((x) => (x.id === s.id ? { ...(s as StaffMember) } : x))
            : [...prev, { ...s, id: Math.max(0, ...prev.map((p) => p.id)) + 1 } as StaffMember],
        ),
      deleteStaff: (id) => setStaff((prev) => prev.filter((x) => x.id !== id)),
      addAppointment: (a) => {
        const created: Appointment = { ...a, id: Math.max(0, ...appointments.map((p) => p.id)) + 1 }
        setAppointments((prev) => [...prev, created])
        return created
      },
      setAppointmentStatus: (id, status) =>
        setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a))),
      updateHours: (h) => setHours(h),
      updateSettings: (s) => setSettings(s),
    }),
    [services, staff, appointments, hours, settings],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error("useStore must be used within StoreProvider")
  return ctx
}

export const STATUS_LABELS: Record<AppointmentStatus, string> = {
  pending: "Pendiente",
  confirmed: "Confirmada",
  completed: "Completada",
  cancelled: "Cancelada",
  no_show: "No asistió",
}
