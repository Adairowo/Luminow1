import Navbar from "@/components/landing/navbar"
import Hero from "@/components/landing/hero"
import Industries from "@/components/landing/industries"
import Footer from "@/components/landing/footer"

export default function RootPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Industries />
      </main>
      <Footer />
    </div>
  )
}
