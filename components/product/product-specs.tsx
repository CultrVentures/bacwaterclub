import { FlaskConical, Factory, ShieldCheck } from "lucide-react";

import { PRODUCT } from "@/lib/product";

const featureIcons = [FlaskConical, ShieldCheck, Factory];

export function ProductSpecs() {
  return (
    <section className="section-spacing bg-white/50">
      <div className="container-shell">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs uppercase tracking-[0.22em] text-primary">
            Why it matters
          </p>
          <h2 className="serif-heading mt-4 text-3xl text-foreground sm:text-4xl lg:text-[2.75rem]">
            Built for the bench — not the shelf.
          </h2>
          <p className="mt-5 text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">
            {PRODUCT.shortDescription}
          </p>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {PRODUCT.features.map((feature, index) => {
            const Icon = featureIcons[index] ?? FlaskConical;
            return (
              <div
                key={feature.title}
                className="rounded-[var(--radius-lg)] border border-border/60 bg-white/85 p-7 shadow-[var(--shadow-soft)]"
              >
                <div className="flex size-12 items-center justify-center rounded-2xl bg-accent text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="serif-heading mt-6 text-xl text-foreground">{feature.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{feature.body}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-20 grid gap-10 lg:grid-cols-[1fr_1fr] lg:items-start lg:gap-14">
          <div className="space-y-6 text-base leading-7 text-muted-foreground sm:text-[1.0625rem] sm:leading-8">
            {PRODUCT.longDescription.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>

          <dl className="rounded-[var(--radius-lg)] border border-border/60 bg-white/85 p-8 shadow-[var(--shadow-soft)]">
            <p className="serif-heading text-lg text-foreground">Specifications</p>
            <div className="mt-5 divide-y divide-border/50">
              {PRODUCT.specs.map((spec) => (
                <div
                  key={spec.label}
                  className="flex items-start justify-between gap-6 py-3.5 text-sm first:pt-0 last:pb-0"
                >
                  <dt className="text-muted-foreground">{spec.label}</dt>
                  <dd className="text-right font-medium text-foreground">{spec.value}</dd>
                </div>
              ))}
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
