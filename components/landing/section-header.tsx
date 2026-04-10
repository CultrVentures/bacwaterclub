import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  description: string;
  align?: "left" | "center";
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  align = "left",
}: SectionHeaderProps) {
  return (
    <div
      className={cn(
        "max-w-3xl space-y-5",
        align === "center" && "mx-auto text-center",
      )}
    >
      <Badge variant="outline" className="w-fit bg-white/65">
        {eyebrow}
      </Badge>
      <div className="space-y-3">
        <h2 className="serif-heading text-4xl leading-tight text-foreground md:text-5xl">
          {title}
        </h2>
        <p className="max-w-2xl text-base leading-7 text-muted-foreground md:text-lg">
          {description}
        </p>
      </div>
    </div>
  );
}
