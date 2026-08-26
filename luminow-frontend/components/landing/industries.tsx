import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const categories = [
  {
    title: "Salón",
    image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80",
    link: "/book/demo",
  },
  {
    title: "Barbería",
    image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80",
    link: "/book/demo",
  },
  {
    title: "Uñas",
    image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?auto=format&fit=crop&w=800&q=80",
    link: "/book/demo",
  },
  {
    title: "Spa y sauna",
    image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80",
    link: "/book/demo",
  },
  {
    title: "Medspa",
    image: "https://images.unsplash.com/photo-1512290900672-1f000b467a57?auto=format&fit=crop&w=800&q=80",
    link: "/book/demo",
  },
  {
    title: "Masaje",
    image: "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?auto=format&fit=crop&w=800&q=80",
    link: "/book/demo",
  },
  {
    title: "Fitness y recuperación",
    image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80",
    link: "/book/demo",
  },
  {
    title: "Fisioterapia",
    image: "https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80",
    link: "/book/demo",
  },
  {
    title: "Práctica de salud",
    image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80",
    link: "/book/demo",
  },
  {
    title: "Tatuajes y piercings",
    image: "https://images.unsplash.com/photo-1598371839696-5c5bb00bdc28?auto=format&fit=crop&w=800&q=80",
    link: "/book/demo",
  },
  {
    title: "Estética para mascotas",
    image: "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=800&q=80",
    link: "/book/demo",
  },
  {
    title: "Estudio de bronceado",
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=800&q=80",
    link: "/book/demo",
  },
];

export default function Industries() {
  return (
    <section id="negocios" className="relative w-full bg-background py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-5xl font-chillax">
            Una plataforma, infinitas posibilidades
          </h2>
          <p className="mt-4 text-sm text-muted-foreground sm:text-base leading-relaxed font-sans">
            Todo lo que necesitas para crecer y prosperar. Luminow ofrece numerosas herramientas para aumentar tus ventas, administrar tu calendario y retener a tus clientes, así puedes concentrarte en lo que mejor sabes hacer.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-2.5 text-xs font-semibold text-background shadow-md transition-all hover:scale-105 hover:bg-foreground/90 active:scale-95"
            >
              <span>Empieza hoy</span>
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Grid Cards without hover effect */}
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Link
              key={category.title}
              href={category.link}
              className="relative block overflow-hidden rounded-2xl md:rounded-3xl aspect-[4/3] sm:aspect-[1.15/1] bg-muted shadow-sm border border-neutral-200/20 dark:border-white/[0.08]"
            >
              <img
                src={category.image}
                alt={category.title}
                loading="lazy"
                className="h-full w-full object-cover absolute inset-0"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5 sm:p-6 z-10">
                <span className="text-lg sm:text-xl font-bold text-white tracking-wide drop-shadow-md font-chillax">
                  {category.title}
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md">
                  <ArrowUpRight className="h-4 w-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
