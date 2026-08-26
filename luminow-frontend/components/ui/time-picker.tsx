"use client"

import { useState, useRef, useEffect } from "react"
import { Clock } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import { cn } from "@/lib/utils"

const HOURS = Array.from({ length: 18 }, (_, i) => i + 6) // 06:00 - 23:00
const MINUTES = [0, 30]

function generateTimeSlots(interval: 15 | 30 = 30) {
  const slots: string[] = []
  const mins = interval === 15 ? [0, 15, 30, 45] : [0, 30]
  for (const h of HOURS) {
    for (const m of mins) {
      slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`)
    }
  }
  return slots
}

function TimePicker({
  value,
  onChange,
  minTime,
  maxTime,
  interval = 30,
  placeholder = "Seleccionar",
  disabled = false,
  className,
}: {
  value: string | null
  onChange: (time: string) => void
  minTime?: string
  maxTime?: string
  interval?: 15 | 30
  placeholder?: string
  disabled?: boolean
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef<HTMLButtonElement>(null)
  const slots = generateTimeSlots(interval)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [open])

  // Scroll to active item when opened
  useEffect(() => {
    if (open && activeRef.current) {
      activeRef.current.scrollIntoView({ block: "center", behavior: "instant" })
    }
  }, [open])

  function isDisabled(slot: string) {
    if (minTime && slot <= minTime) return true
    if (maxTime && slot >= maxTime) return true
    return false
  }

  function formatDisplay(time: string) {
    const [h, m] = time.split(":").map(Number)
    const suffix = h >= 12 ? "PM" : "AM"
    const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
    return `${h12}:${String(m).padStart(2, "0")} ${suffix}`
  }

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex h-9 w-full items-center gap-2 rounded-lg border border-border bg-background px-3 text-sm font-medium transition-all duration-200",
          "hover:border-ring/50 hover:bg-muted/30 focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none",
          "disabled:pointer-events-none disabled:opacity-50",
          open && "border-ring/60 ring-2 ring-ring/30",
          !value && "text-muted-foreground",
        )}
      >
        <Clock className="size-3.5 text-muted-foreground/60 shrink-0" />
        <span className="flex-1 text-left">
          {value ? formatDisplay(value) : placeholder}
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -4, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className={cn(
              "absolute z-50 mt-1.5 w-full min-w-[140px] overflow-hidden rounded-xl border border-border bg-card shadow-lg",
            )}
          >
            <div className="max-h-[220px] overflow-y-auto p-1 scrollbar-thin">
              {slots.map((slot) => {
                const active = slot === value
                const slotDisabled = isDisabled(slot)
                return (
                  <button
                    key={slot}
                    ref={active ? activeRef : undefined}
                    type="button"
                    disabled={slotDisabled}
                    onClick={() => {
                      onChange(slot)
                      setOpen(false)
                    }}
                    className={cn(
                      "flex w-full items-center justify-center rounded-lg px-3 py-1.5 text-xs font-medium transition-all duration-150",
                      active
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-foreground/80 hover:bg-muted/60 hover:text-foreground",
                      slotDisabled && "pointer-events-none opacity-30",
                    )}
                  >
                    {formatDisplay(slot)}
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export { TimePicker }
