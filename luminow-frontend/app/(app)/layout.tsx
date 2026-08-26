"use client"

import type { ReactNode } from "react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { Sidebar } from "@/components/sidebar"
import { useAuthStore } from "@/store/useAuthStore"
import api from "@/lib/axios"

export default function AppLayout({ children }: { children: ReactNode }) {
  const router = useRouter()
  const { isAuthenticated, setUser, setLoading, isLoading } = useAuthStore()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    async function rehydrateSession() {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null

      if (!token) {
        setLoading(false)
        router.push("/login")
        return
      }

      // Token exists but store is empty (e.g. page refresh) — reload user from API
      if (!isAuthenticated) {
        try {
          const res = await api.get("/api/v1/auth/me")
          setUser(res.data.user, res.data.tenant)
        } catch {
          // Token is invalid or expired
          localStorage.removeItem("token")
          setLoading(false)
          router.push("/login")
          return
        }
      }

      setLoading(false)
    }

    rehydrateSession()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!mounted || isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) return null

  return (
    <div className="flex min-h-svh flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 overflow-x-hidden">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
