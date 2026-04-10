import { PackageCheck, ShieldCheck, Truck, Undo2 } from "lucide-react";

import { PRODUCT, type TrustBadge } from "@/lib/product";

const icons = [Truck, PackageCheck, ShieldCheck, Undo2];

export function TrustBadges() {
  return (
    <section className="section-spacing-sm bg-white/50">
      <div className="container-shell">
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4" role="list">
          {PRODUCT.trustBadges.map((badge: TrustBadge, index: number) => {
            const Icon = icons[index] ?? ShieldCheck;
            return (
              <li
                key={badge.title}
                className="flex items-start gap-4 rounded-[var(--radius-lg)] border border-border/60 bg-white/85 p-6 shadow-[var(--shadow-soft)]"
              >
                <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-accent text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{badge.title}</p>
                  <p className="mt-1.5 text-xs leading-5 text-muted-foreground">{badge.detail}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
