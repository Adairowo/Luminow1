"use client"

import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"
import {
  CalendarDays,
  Clock,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
} from "lucide-react"
import { motion } from "motion/react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  SidebarShell,
  SidebarBody,
  SidebarLink,
  useSidebar,
} from "@/components/ui/sidebar"
import { useAuthStore } from "@/store/useAuthStore"

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/citas", label: "Citas", icon: CalendarDays },
  { href: "/personal", label: "Personal", icon: Users },
  { href: "/horarios", label: "Horarios", icon: Clock },
  { href: "/ajustes", label: "Ajustes", icon: Settings },
]

function Logo() {
  const { open } = useSidebar()
  return (
    <div className="flex items-center gap-2 px-2 py-1">

      <motion.span
        animate={{
          display: open ? "inline-block" : "none",
          opacity: open ? 1 : 0,
        }}
        className="text-base font-semibold tracking-tight whitespace-pre text-foreground"
      >
        Luminow
      </motion.span>
    </div>
  )
}

function LogoIcon() {
  return (
    <div className="flex items-center px-2 py-1">

    </div>
  )
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const iconClass = "size-5 shrink-0"

  return (
    <div className="mt-8 flex flex-col gap-1">
      {NAV.map(({ href, label, icon: Icon }) => {
        const active = pathname === href || (href !== "/dashboard" && pathname.startsWith(href))
        return (
          <SidebarLink
            key={href}
            active={active}
            onClick={onNavigate}
            link={{
              label,
              href,
              icon: <Icon className={cn(iconClass, active ? "text-sidebar-accent-foreground" : "text-sidebar-foreground/70")} />,
            }}
          />
        )
      })}
    </div>
  )
}

function UserCard() {
  const { user, tenant, logout } = useAuthStore()
  const router = useRouter()
  const { open } = useSidebar()
  const [loggingOut, setLoggingOut] = useState(false)

  const displayName = user?.name ?? "—"
  const displayRole = user?.role_label ?? user?.role ?? "—"

  // Initials from name
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  async function handleLogout() {
    setLoggingOut(true)
    await logout()
    router.push("/login")
  }

  return (
    <div className="border-t border-sidebar-border pt-3">
      <div className="flex items-center gap-3 rounded-lg px-2 py-2">
        <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
          {initials || "?"}
        </div>
        <motion.div
          animate={{
            display: open ? "flex" : "none",
            opacity: open ? 1 : 0,
          }}
          className="flex flex-1 items-center gap-2 overflow-hidden"
        >
          <div className="flex flex-1 flex-col overflow-hidden">
            {tenant?.business_name && (
              <span className="truncate text-xs font-semibold text-muted-foreground">
                {tenant.business_name}
              </span>
            )}
            <span className="truncate text-sm font-medium">{displayName}</span>
            <span className="truncate text-xs text-muted-foreground capitalize">
              {displayRole}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            aria-label="Cerrar sesión"
            disabled={loggingOut}
            onClick={handleLogout}
          >
            {loggingOut ? (
              <div className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : (
              <LogOut className="size-4" />
            )}
          </Button>
        </motion.div>
      </div>
    </div>
  )
}

export function Sidebar() {
  const [open, setOpen] = useState(false)

  return (
    <SidebarShell open={open} setOpen={setOpen}>
      <SidebarBody className="justify-between gap-10 border-r border-sidebar-border">
        <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
          {open ? <Logo /> : <LogoIcon />}
          <NavLinks />
        </div>
        <UserCard />
      </SidebarBody>
    </SidebarShell>
  )
}
