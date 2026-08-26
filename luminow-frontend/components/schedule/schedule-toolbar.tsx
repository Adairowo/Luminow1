"use client"

import { Copy, CalendarCheck, Coffee } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

type ScheduleToolbarProps = {
  onCopyMondayToWeekdays: () => void
  onOpenAll: () => void
  onToggleAllBreaks: (enabled: boolean) => void
  hasBreaks: boolean
  className?: string
}

function ScheduleToolbar({
  onCopyMondayToWeekdays,
  onOpenAll,
  onToggleAllBreaks,
  hasBreaks,
  className,
}: ScheduleToolbarProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onCopyMondayToWeekdays}
        className="h-8 text-xs font-medium gap-1.5 border-border/60 hover:bg-muted/50"
      >
        <Copy className="size-3.5" />
        Copiar Lunes a L–V
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onOpenAll}
        className="h-8 text-xs font-medium gap-1.5 border-border/60 hover:bg-muted/50"
      >
        <CalendarCheck className="size-3.5" />
        Abrir todos
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onToggleAllBreaks(!hasBreaks)}
        className={cn(
          "h-8 text-xs font-medium gap-1.5 border-border/60 hover:bg-muted/50",
          hasBreaks && "bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400 hover:bg-amber-500/15"
        )}
      >
        <Coffee className="size-3.5" />
        {hasBreaks ? "Quitar descansos" : "Agregar descanso a todos"}
      </Button>
    </div>
  )
}

export { ScheduleToolbar }
