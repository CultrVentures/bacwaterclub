import { Star } from "lucide-react";

import { PRODUCT } from "@/lib/product";

export function ReviewsSection() {
  const summary = PRODUCT.reviewsSummary;

  return (
    <section id="reviews" className="section-spacing bg-white/40">
      <div className="container-shell">
        <div className="flex flex-col items-start gap-4 text-left sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
              Customer reviews
            </p>
            <h2 className="serif-heading mt-3 text-3xl text-foreground sm:text-4xl">
              Trusted by researchers, hobbyists, and compounders.
            </h2>
          </div>
          <div className="flex items-center gap-3 rounded-full border border-border/60 bg-white/80 px-5 py-3 text-sm shadow-[var(--shadow-soft)]">
            <div className="flex items-center gap-1 text-[#b8860b]" aria-hidden="true">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-current" />
              ))}
            </div>
            <span className="font-semibold text-foreground">{summary.rating.toFixed(1)}/5</span>
            <span className="text-muted-foreground">
              · {summary.count.toLocaleString()} verified reviews
            </span>
          </div>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {PRODUCT.reviews.map((review) => (
            <article
              key={review.author + review.title}
              className="flex flex-col gap-4 rounded-[var(--radius-lg)] border border-border/60 bg-white/80 p-6 shadow-[var(--shadow-soft)]"
            >
              <div className="flex items-center gap-1 text-[#b8860b]" aria-label={`${review.rating} out of 5`}>
                {Array.from({ length: review.rating }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" />
                ))}
              </div>
              <div className="flex-1">
                <h3 className="serif-heading text-lg text-foreground">{review.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{review.body}</p>
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{review.author}</span>
                {review.verified ? (
                  <span className="rounded-full bg-accent px-2 py-1 text-[0.625rem] font-semibold uppercase tracking-[0.12em] text-accent-foreground">
                    Verified buyer
                  </span>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
