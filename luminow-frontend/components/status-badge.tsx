import { Badge } from "@/components/ui/badge"
import { STATUS_LABELS, type AppointmentStatus } from "@/lib/types"
import { cn } from "@/lib/utils"

const STYLES: Record<AppointmentStatus, string> = {
  confirmed: "border border-foreground/20 bg-foreground text-background",
  pending: "border border-border bg-transparent text-foreground",
  completed: "border border-border bg-muted text-muted-foreground",
  cancelled: "border border-dashed border-border bg-transparent text-muted-foreground line-through",
  no_show: "border border-border bg-muted text-muted-foreground",
}

export function StatusBadge({ status }: { status: AppointmentStatus }) {
  return <Badge className={cn("font-medium", STYLES[status])}>{STATUS_LABELS[status]}</Badge>
}
