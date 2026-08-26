import type { ReactNode } from "react"

import { Sidebar } from "@/components/sidebar"
import { StoreProvider } from "@/lib/store"

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <StoreProvider>
      <div className="flex min-h-svh flex-col lg:flex-row">
        <Sidebar />
        <main className="flex-1 overflow-x-hidden">
          <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </StoreProvider>
  )
}
