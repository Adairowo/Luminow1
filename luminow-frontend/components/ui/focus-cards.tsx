"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type FocusCardItem = {
  title: string;
  src?: string;
  image?: string;
  href?: string;
  slug?: string;
};

export const Card = React.memo(
  ({
    card,
    index,
    hovered,
    setHovered,
  }: {
    card: FocusCardItem;
    index: number;
    hovered: number | null;
    setHovered: React.Dispatch<React.SetStateAction<number | null>>;
  }) => {
    const content = (
      <div
        onMouseEnter={() => setHovered(index)}
        onMouseLeave={() => setHovered(null)}
        className={cn(
          "group relative overflow-hidden rounded-2xl md:rounded-3xl aspect-[4/3] sm:aspect-[1.15/1] bg-muted shadow-sm transition-all duration-300 ease-out cursor-pointer",
          hovered !== null && hovered !== index && "blur-xs scale-[0.98] opacity-75"
        )}
      >
        <img
          src={card.src || card.image}
          alt={card.title}
          loading="lazy"
          className="h-full w-full object-cover absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent transition-all duration-300 group-hover:from-black/90 group-hover:via-black/45" />
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-5 sm:p-6">
          <span className="text-lg sm:text-xl font-bold text-white tracking-wide drop-shadow-md font-chillax">
            {card.title}
          </span>
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-transform duration-300 group-hover:scale-110 group-hover:bg-white group-hover:text-black">
            <ArrowUpRight className="h-4 w-4" />
          </div>
        </div>
      </div>
    );

    if (card.href) {
      return (
        <Link href={card.href} className="block w-full">
          {content}
        </Link>
      );
    }

    return content;
  }
);

Card.displayName = "Card";

export function FocusCards({
  cards,
  className,
}: {
  cards: FocusCardItem[];
  className?: string;
}) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className={cn("grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6 w-full", className)}>
      {cards.map((card, index) => (
        <Card
          key={card.title}
          card={card}
          index={index}
          hovered={hovered}
          setHovered={setHovered}
        />
      ))}
    </div>
  );
}
