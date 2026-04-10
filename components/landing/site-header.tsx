"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";

const navItems = [
  { href: "#product", label: "Product" },
  { href: "#faq", label: "FAQ" },
  { href: "#reviews", label: "Reviews" },
] as const;

export function SiteHeader() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/50 bg-background/90 backdrop-blur-xl">
      <div className="container-shell py-5">
        <div className="flex items-center justify-between gap-6">
          <Link
            href="/"
            className="focus-outline flex items-center gap-3 rounded-full px-1 py-1"
            aria-label="Bacwaterclub home"
          >
            <div className="flex size-11 items-center justify-center rounded-full border border-primary/20 bg-white/85 text-sm font-semibold text-primary">
              BW
            </div>
            <div>
              <p className="serif-heading text-xl text-foreground">Bacwaterclub</p>
              <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Research-grade bac water
              </p>
            </div>
          </Link>

          <nav aria-label="Primary" className="hidden items-center gap-8 lg:flex">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="focus-outline rounded-full px-2 py-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Button
              asChild
              size="lg"
              className="shrink-0 bg-[#1e4fa6] text-[#ffffff] hover:bg-[#173d80]"
            >
              <a href="#buy" style={{ color: "#ffffff" }}>
                Shop now
              </a>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="lg:hidden"
              aria-expanded={mobileNavOpen}
              aria-controls="mobile-primary-nav"
              aria-label={mobileNavOpen ? "Close navigation menu" : "Open navigation menu"}
              onClick={() => {
                setMobileNavOpen((current) => !current);
              }}
            >
              {mobileNavOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {mobileNavOpen ? (
          <nav
            id="mobile-primary-nav"
            aria-label="Mobile primary"
            className="grid gap-2 pt-4 lg:hidden"
          >
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="focus-outline rounded-2xl border border-border/60 bg-white/85 px-4 py-3 text-sm text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => {
                  setMobileNavOpen(false);
                }}
              >
                {item.label}
              </a>
            ))}
          </nav>
        ) : null}
      </div>
    </header>
  );
}
