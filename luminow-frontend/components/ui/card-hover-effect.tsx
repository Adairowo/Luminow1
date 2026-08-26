"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import React, { useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export const HoverEffect = ({
  items,
  className,
}: {
  items: {
    title: string;
    description?: string;
    link: string;
    image?: string;
  }[];
  className?: string;
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div
      onMouseLeave={() => setHoveredIndex(null)}
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 py-6 sm:py-10",
        className
      )}
    >
      {items.map((item, idx) => (
        <Link
          href={item?.link || "#"}
          key={item?.title}
          className="relative group block p-2 h-full w-full"
          onMouseEnter={() => setHoveredIndex(idx)}
        >
          <AnimatePresence>
            {hoveredIndex === idx && (
              <motion.span
                key="hoverBackground"
                className="absolute inset-0 h-full w-full bg-[#FFD67C] block rounded-3xl pointer-events-none"
                layoutId="hoverBackground"
                initial={{ opacity: 0 }}
                animate={{
                  opacity: 1,
                  transition: { duration: 0.15 },
                }}
                exit={{
                  opacity: 0,
                  transition: { duration: 0.15, delay: 0.1 },
                }}
              />
            )}
          </AnimatePresence>

          {item.image ? (
            <div className="rounded-2xl md:rounded-3xl relative overflow-hidden aspect-[4/3] sm:aspect-[1.15/1] bg-muted shadow-sm w-full z-20 border border-transparent dark:border-white/[0.1] transition-all duration-300 pointer-events-none">
              <img
                src={item.image}
                alt={item.title}
                loading="lazy"
                className="h-full w-full object-cover absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent transition-all duration-300 group-hover:from-black/90 group-hover:via-black/45" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5 sm:p-6 z-30">
                <span className="text-lg sm:text-xl font-bold text-white tracking-wide drop-shadow-md font-chillax">
                  {item.title}
                </span>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-transform duration-300 group-hover:scale-110 group-hover:bg-white group-hover:text-black">
                  <ArrowUpRight className="h-4 w-4" />
                </div>
              </div>
            </div>
          ) : (
            <Card>
              <CardTitle>{item.title}</CardTitle>
              {item.description && (
                <CardDescription>{item.description}</CardDescription>
              )}
            </Card>
          )}
        </Link>
      ))}
    </div>
  );
};

export const Card = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <div
      className={cn(
        "rounded-2xl h-full w-full p-4 overflow-hidden bg-black border border-transparent dark:border-white/[0.2] relative z-20 pointer-events-none",
        className
      )}
    >
      <div className="relative z-50">
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

export const CardTitle = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <h4 className={cn("text-zinc-100 font-bold tracking-wide mt-4", className)}>
      {children}
    </h4>
  );
};

export const CardDescription = ({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) => {
  return (
    <p
      className={cn(
        "mt-8 text-zinc-400 tracking-wide leading-relaxed text-sm",
        className
      )}
    >
      {children}
    </p>
  );
};
