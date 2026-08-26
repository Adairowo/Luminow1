import type { ReactNode } from "react"

import { StoreProvider } from "@/lib/store"

export default function BookingLayout({ children }: { children: ReactNode }) {
  return (
    <StoreProvider>
      <main className="min-h-svh bg-muted/40">
        <div className="mx-auto flex min-h-svh w-full max-w-md flex-col px-4 py-6">{children}</div>
      </main>
    </StoreProvider>
  )
}
