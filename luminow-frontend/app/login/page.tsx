"use client"

import { Scissors, Mail, Lock, Loader2, Eye, EyeOff, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, type FormEvent } from "react"
import api from "@/lib/axios"
import { useAuthStore } from "@/store/useAuthStore"
import type { AuthUser, Tenant } from "@/store/useAuthStore"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const router = useRouter()
  const { setUser, setToken } = useAuthStore()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await api.post("/api/v1/auth/login", { email, password })

      const { token, user, tenant } = response.data as {
        token: string
        user: AuthUser
        tenant: Tenant | null
      }

      if (token) {
        setToken(token)
      }

      setUser(user, tenant)
      router.push("/dashboard")
    } catch (err: any) {
      setError(err.response?.data?.message || "Credenciales incorrectas")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="relative flex min-h-svh items-center justify-center bg-background px-4 overflow-hidden">
      {/* Premium background gradient effect */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_120%,var(--color-primary)/0.08,transparent_50%)]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 h-[310px] w-[600px] max-w-full bg-[radial-gradient(circle_at_center,var(--color-primary)/0.05,transparent_65%)] blur-3xl" />

      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md transition-transform hover:scale-105 duration-300">
            <Scissors className="size-6 rotate-45" />
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-b from-foreground to-foreground/80 bg-clip-text text-transparent">
              Luminow
            </h1>
            <p className="text-sm text-muted-foreground">Panel de administración</p>
          </div>
        </div>

        <Card className="border-border/60 shadow-lg shadow-black/[0.03] backdrop-blur-[2px]">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-semibold tracking-tight text-center">
              Iniciar Sesión
            </CardTitle>
            <CardDescription className="text-center">
              Ingresa tus credenciales para acceder al sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <form onSubmit={onSubmit} className="flex flex-col gap-4">
              {error && (
                <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive font-medium animate-in fade-in slide-in-from-top-1 duration-200">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-foreground/80">
                  Correo electrónico
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="Correo electrónico"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9 h-10 border-muted-foreground/20 focus-visible:ring-primary/20 focus-visible:border-primary transition-all duration-200"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-xs font-semibold text-foreground/80">
                    Contraseña
                  </Label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9 pr-9 h-10 border-muted-foreground/20 focus-visible:ring-primary/20 focus-visible:border-primary transition-all duration-200"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 size-8 flex items-center justify-center text-muted-foreground hover:text-foreground rounded-md transition-colors"
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full h-10 mt-2 bg-primary text-primary-foreground hover:bg-primary/90 transition-all font-semibold shadow-sm hover:shadow active:scale-[0.98] duration-150"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 size-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  "Iniciar sesión"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground text-pretty px-6 leading-relaxed">
          Demo del panel <span className="font-semibold text-foreground/75">Luminow</span>.
        </p>
      </div>
    </main>
  )
}

