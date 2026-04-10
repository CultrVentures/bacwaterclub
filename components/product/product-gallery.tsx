"use client";

import Image from "next/image";
import { useState } from "react";

import { cn } from "@/lib/utils";

type ProductGalleryProps = {
  images: readonly string[];
  alt: string;
};

export function ProductGallery({ images, alt }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeImage = images[activeIndex] ?? images[0];

  return (
    <div className="flex flex-col gap-5">
      <div className="relative aspect-square w-full overflow-hidden rounded-[var(--radius-lg)] border border-border/60 bg-white/85 shadow-[var(--shadow-soft)]">
        <Image
          key={activeImage}
          src={activeImage}
          alt={alt}
          fill
          priority
          sizes="(min-width: 1024px) 560px, 100vw"
          className="object-contain p-6"
        />
      </div>
      {images.length > 1 ? (
        <ul className="grid grid-cols-5 gap-3" role="list">
          {images.map((src, index) => {
            const isActive = index === activeIndex;
            return (
              <li key={src}>
                <button
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Show image ${index + 1}`}
                  aria-pressed={isActive}
                  className={cn(
                    "focus-outline relative block aspect-square w-full overflow-hidden rounded-2xl border bg-white/80 transition-all duration-200",
                    isActive
                      ? "border-primary ring-2 ring-primary/40"
                      : "border-border/60 hover:border-primary/60",
                  )}
                >
                  <Image
                    src={src}
                    alt=""
                    fill
                    sizes="120px"
                    className="object-contain p-1"
                  />
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
