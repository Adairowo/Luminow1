"use client";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { ArrowUpRight, TextAlignJustify } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { NoiseBackground } from "@/components/ui/noise-background";

export type NavigationSection = {
  title: string;
  href: string;
};

const navigationData: NavigationSection[] = [
  {
    title: "Cómo funciona",
    href: "#como-funciona",
  },
  {
    title: "Beneficios",
    href: "#beneficios",
  },
  {
    title: "Casos de uso",
    href: "#negocios",
  },
  {
    title: "Precios",
    href: "#pricing",
  },
  {
    title: "FAQ",
    href: "#faq",
  },
];

const CollaborateButton = ({ className }: { className?: string }) => (
  <div className={cn("flex justify-center", className)}>
    <NoiseBackground
      containerClassName="w-fit p-[3px] rounded-full mx-auto"
      gradientColors={[
        "rgb(255, 100, 150)",
        "rgb(100, 150, 255)",
        "rgb(255, 200, 100)",
      ]}
    >
      <Link
        href="/login"
        className="h-full w-full cursor-pointer rounded-full bg-linear-to-r from-neutral-100 via-neutral-100 to-white px-4 py-2 text-xs font-semibold text-black shadow-[0px_2px_0px_0px_var(--color-neutral-50)_inset,0px_0.5px_1px_0px_var(--color-neutral-400)] transition-all duration-100 active:scale-98 dark:from-black dark:via-black dark:to-neutral-900 dark:text-white dark:shadow-[0px_1px_0px_0px_var(--color-neutral-950)_inset,0px_1px_0px_0px_var(--color-neutral-800)] flex items-center justify-center gap-1"
      >
        Prueba gratis &rarr;
      </Link>
    </NoiseBackground>
  </div>
);

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const handleResize = useCallback(() => {
    if (window.innerWidth >= 768) setIsOpen(false);
  }, []);

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [handleResize]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 200);
    };
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <nav className="max-w-7xl fixed top-4 mx-auto inset-x-0 z-50 w-[95%] lg:w-full transition-all duration-300" style={{ transform: "none" }}>
      <div className="hidden lg:block w-full">
        <div
          className={cn(
            "w-full flex relative justify-between px-4 py-2 rounded-full transition-all duration-300",
            isScrolled
              ? "bg-neutral-50 dark:bg-neutral-900 shadow-[0px_-2px_0px_0px_var(--color-neutral-200),0px_2px_0px_0px_var(--color-neutral-200)] dark:shadow-[0px_-2px_0px_0px_var(--color-neutral-800),0px_2px_0px_0px_var(--color-neutral-800)]"
              : "bg-background shadow-none"
          )}
        >
          <div
            className="absolute inset-0 h-full w-full bg-neutral-100 dark:bg-neutral-800 pointer-events-none [mask-image:linear-gradient(to_bottom,white,transparent,white)] rounded-full transition-opacity duration-300"
            style={{ opacity: isScrolled ? 1 : 0 }}
          ></div>
          <div className="flex flex-row gap-2 items-center relative z-10">
            <Link className="font-normal flex space-x-2 items-center text-sm mr-4 text-black px-2 py-1 relative z-20" href="/">
              <span className="text-2xl font-semibold font-chillax text-black dark:text-white tracking-tight">Lumibook</span>
            </Link>
            <div className="flex items-center gap-1.5">
              {navigationData.map((navItem) => (
                <Link
                  key={navItem.title}
                  href={navItem.href}
                  className="flex items-center justify-center text-sm font-medium px-4 py-2 rounded-md hover:bg-[#F5F5F5] dark:hover:bg-neutral-800 text-muted-foreground transition-colors"
                >
                  {navItem.title}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex space-x-2 items-center relative z-10">
            <CollaborateButton className="hidden lg:flex" />
          </div>
        </div>
      </div>
      <div className="flex h-full w-full items-center lg:hidden">
        <div
          className={cn(
            "flex justify-between items-center w-full rounded-full px-2.5 py-1.5 transition-all duration-300 relative",
            isScrolled
              ? "bg-neutral-50 dark:bg-neutral-900 shadow-[0px_-2px_0px_0px_var(--color-neutral-200),0px_2px_0px_0px_var(--color-neutral-200)] dark:shadow-[0px_-2px_0px_0px_var(--color-neutral-800),0px_2px_0px_0px_var(--color-neutral-800)]"
              : "bg-background shadow-none"
          )}
        >
          <Link className="font-normal flex space-x-2 items-center text-sm mr-4 text-black px-2 py-1 relative z-20" href="/">
            <span className="text-2xl font-semibold font-chillax text-black dark:text-white tracking-tight">Luminow</span>
          </Link>
          <div className="flex items-center gap-2 relative z-20">
            <CollaborateButton className="flex" />
            <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
              <DropdownMenuTrigger className="text-black dark:text-white h-8 w-8 flex items-center justify-center outline-none cursor-pointer">
                <TextAlignJustify size={24} />
                <span className="sr-only">Menu</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-2">
                {navigationData.map((item) => (
                  <DropdownMenuItem key={item.title}>
                    <a href={item.href} className="w-full cursor-pointer text-sm font-medium">{item.title}</a>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

