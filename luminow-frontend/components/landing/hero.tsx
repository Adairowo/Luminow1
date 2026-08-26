import React from "react";
import SideRays from "@/components/ui/SideRays";

export default function Hero() {
  return (
    <section id="hero" className="relative w-full overflow-hidden min-h-[50rem] flex flex-col">
      {/* Background */}
      <div className="absolute inset-0 z-0 bg-background">
        <SideRays
          speed={2.5}
          rayColor1="#EAB308"
          rayColor2="#96c8ff"
          intensity={2}
          spread={2.2}
          origin="top-right"
          tilt={0}
          saturation={1.5}
          blend={0.75}
          falloff={0.75}
          opacity={1.0}
        />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-4 pt-36 text-center md:pt-48 lg:pt-56">
        <h1 className="text-4xl font-bold font-chillax tracking-tight text-white drop-shadow-md md:text-6xl lg:text-7xl leading-[1.1] md:leading-[1.15]">
          Gestionar tus citas nunca <br className="hidden md:block" /> fue tan{" "}
          <span className="text-yellow-400">fácil</span>
        </h1>
        <p className="mt-6 max-w-2xl text-base text-neutral-200 drop-shadow-sm md:text-lg leading-relaxed font-sans font-normal">
          Deja que el sistema agende por ti, mientras tú atiendes a tus clientes.
          Ahorra horas de trabajo cada semana con automatización que funciona mientras duermes.
        </p>
        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
          <a
            href="#"
            className="rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-black font-sans shadow-lg transition hover:-translate-y-0.5 hover:bg-white/90"
          >
            Prueba gratis
          </a>
          <a
            href="/pricing"
            className="rounded-full border border-white/40 bg-white/10 px-6 py-2.5 text-sm font-semibold text-white font-sans backdrop-blur-sm transition hover:bg-white/20"
          >
            Ver cómo funciona
          </a>
        </div>
        <p className="mt-4 text-xs text-neutral-300 font-sans tracking-wide">
          No se requiere tarjeta de crédito &middot; Prueba gratis de 14 días
        </p>
      </div>

      {/* Dashboard Image */}
      <div className="relative z-10 mx-auto mt-12 w-full max-w-6xl px-4 pb-12 md:mt-16 md:px-8">
        <div className="rounded-2xl border border-white/30 bg-white/20 p-2 shadow-2xl backdrop-blur-md md:rounded-[2rem] md:p-3">
          <img
            src="https://assets.aceternity.com/pro/aceternity-landing.webp"
            alt="Luminow dashboard"
            className="w-full rounded-xl border border-black/5 shadow-lg md:rounded-3xl"
          />
        </div>
      </div>
    </section>
  );
}