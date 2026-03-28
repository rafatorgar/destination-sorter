"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import MapPin from "@/components/icons/MapPin";

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-dashed border-border bg-background/80 backdrop-blur-xl">
      <nav className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 text-xl font-bold tracking-tight text-foreground"
        >
          <MapPin className="w-5 h-5" />
          Destinos Oposiciones
        </Link>
        <div className="flex items-center gap-1">
          <Link
            href="/"
            className={cn(
              "px-3 py-2 rounded-md text-sm font-medium transition-colors",
              pathname === "/"
                ? "text-foreground bg-muted"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
            )}
          >
            Inicio
          </Link>
          <Link href="/herramienta">
            <Button
              variant={pathname === "/herramienta" ? "default" : "outline"}
              size="sm"
            >
              Organizar Destinos
            </Button>
          </Link>
        </div>
      </nav>
    </header>
  );
}
