import Image from "next/image";

import { PRODUCT } from "@/lib/product";

export function LifestyleSection() {
  return (
    <section className="section-spacing">
      <div className="container-shell">
        <div className="grid gap-8 md:grid-cols-2 lg:gap-10">
          {PRODUCT.lifestyleImages.map((src, index) => (
            <div
              key={src}
              className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-lg)] border border-border/60 bg-white/75 shadow-[var(--shadow-soft)]"
            >
              <Image
                src={src}
                alt={`${PRODUCT.name} lifestyle ${index + 1}`}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
