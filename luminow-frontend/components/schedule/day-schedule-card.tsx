"use client"

import { motion, AnimatePresence } from "motion/react"
import { Coffee, Sun, Moon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Switch } from "@/components/ui/switch"
import { TimePicker } from "@/components/ui/time-picker"

type DayScheduleData = {
  dayOfWeek: number
  dayName: string
  isOpen: boolean
  openTime: string | null
  closeTime: string | null
  breakStart: string | null
  breakEnd: string | null
}

type DayScheduleCardProps = {
  data: DayScheduleData
  onUpdate: (patch: Partial<DayScheduleData>) => void
  compact?: boolean
}

const DAY_ICONS: Record<number, string> = {
  0: "D", 1: "L", 2: "M", 3: "X", 4: "J", 5: "V", 6: "S",
}

function getTimeIcon(time: string | null) {
  if (!time) return Sun
  const h = parseInt(time.split(":")[0])
  if (h < 12) return Sun
  return Moon
}

function calculateHours(open: string | null, close: string | null, breakStart: string | null, breakEnd: string | null) {
  if (!open || !close) return null
  const [oh, om] = open.split(":").map(Number)
  const [ch, cm] = close.split(":").map(Number)
  let total = (ch * 60 + cm) - (oh * 60 + om)

  if (breakStart && breakEnd) {
    const [bsh, bsm] = breakStart.split(":").map(Number)
    const [beh, bem] = breakEnd.split(":").map(Number)
    total -= (beh * 60 + bem) - (bsh * 60 + bsm)
  }

  const hours = Math.floor(total / 60)
  const mins = total % 60
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
}

function DayScheduleCard({ data, onUpdate, compact = false }: DayScheduleCardProps) {
  const hasBreak = !!(data.breakStart && data.breakEnd)
  const totalHours = data.isOpen ? calculateHours(data.openTime, data.closeTime, data.breakStart, data.breakEnd) : null

  return (
    <motion.div
      layout
      className={cn(
        "group relative rounded-xl border border-border/60 bg-card transition-all duration-300",
        data.isOpen
          ? "shadow-sm hover:shadow-md hover:border-border"
          : "opacity-60 hover:opacity-80",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-3 px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex size-9 items-center justify-center rounded-lg text-sm font-bold transition-colors duration-200",
              data.isOpen
                ? "bg-primary/10 text-primary border border-primary/15"
                : "bg-muted text-muted-foreground/60 border border-border/40",
            )}
          >
            {DAY_ICONS[data.dayOfWeek]}
          </div>
          <div className="flex flex-col">
            <span className={cn(
              "text-sm font-semibold transition-colors",
              data.isOpen ? "text-foreground" : "text-muted-foreground/70",
            )}>
              {data.dayName}
            </span>
            {data.isOpen && totalHours && (
              <span className="text-[10px] font-medium text-muted-foreground/60 mt-0.5">
                {totalHours} laborables
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {!data.isOpen && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/50 bg-muted/50 px-2 py-1 rounded-md">
              Cerrado
            </span>
          )}
          <Switch
            checked={data.isOpen}
            onCheckedChange={(checked) => onUpdate({ isOpen: checked })}
          />
        </div>
      </div>

      {/* Time Pickers */}
      <AnimatePresence initial={false}>
        {data.isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-border/40 px-4 py-3.5 space-y-3">
              {/* Open/Close times */}
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 mb-1.5 block">
                    Apertura
                  </label>
                  <TimePicker
                    value={data.openTime}
                    onChange={(t) => onUpdate({ openTime: t })}
                    maxTime={data.closeTime ?? undefined}
                  />
                </div>
                <span className="text-xs font-semibold text-muted-foreground/40 mt-5">→</span>
                <div className="flex-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60 mb-1.5 block">
                    Cierre
                  </label>
                  <TimePicker
                    value={data.closeTime}
                    onChange={(t) => onUpdate({ closeTime: t })}
                    minTime={data.openTime ?? undefined}
                  />
                </div>
              </div>

              {/* Break toggle */}
              <div className="flex items-center justify-between rounded-lg bg-muted/30 border border-border/30 px-3 py-2">
                <div className="flex items-center gap-2">
                  <Coffee className="size-3.5 text-muted-foreground/60" />
                  <span className="text-xs font-medium text-muted-foreground/80">
                    Hora de descanso
                  </span>
                </div>
                <Switch
                  checked={hasBreak}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      onUpdate({ breakStart: "13:00", breakEnd: "14:00" })
                    } else {
                      onUpdate({ breakStart: null, breakEnd: null })
                    }
                  }}
                />
              </div>

              {/* Break times */}
              <AnimatePresence initial={false}>
                {hasBreak && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.15, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-center gap-2 rounded-lg bg-amber-500/5 border border-amber-500/15 p-3">
                      <div className="flex-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-amber-600/70 dark:text-amber-400/70 mb-1.5 block">
                          Inicio descanso
                        </label>
                        <TimePicker
                          value={data.breakStart}
                          onChange={(t) => onUpdate({ breakStart: t })}
                          minTime={data.openTime ?? undefined}
                          maxTime={data.breakEnd ?? data.closeTime ?? undefined}
                        />
                      </div>
                      <span className="text-xs font-semibold text-amber-500/40 mt-5">→</span>
                      <div className="flex-1">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-amber-600/70 dark:text-amber-400/70 mb-1.5 block">
                          Fin descanso
                        </label>
                        <TimePicker
                          value={data.breakEnd}
                          onChange={(t) => onUpdate({ breakEnd: t })}
                          minTime={data.breakStart ?? data.openTime ?? undefined}
                          maxTime={data.closeTime ?? undefined}
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export { DayScheduleCard }
export type { DayScheduleData }
