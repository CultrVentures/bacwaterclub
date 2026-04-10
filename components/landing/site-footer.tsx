import Link from "next/link";

const footerLinks = [
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms" },
  { href: "/#lead-form", label: "Request Support" },
  { href: "/#documentation", label: "Documentation" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-border/70 bg-white/45">
      <div className="container-shell flex flex-col gap-8 py-10 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl space-y-3">
          <p className="serif-heading text-2xl text-foreground">CULTR Health</p>
          <p className="text-sm leading-7 text-muted-foreground">
            Intended for healthcare professionals and authorized purchasers only. This site
            supports verified pricing requests, documentation follow-up, and professional account
            review.
          </p>
        </div>

        <nav aria-label="Footer" className="flex flex-wrap gap-5 text-sm text-muted-foreground">
          {footerLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="focus-outline rounded-full px-2 py-1 transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
