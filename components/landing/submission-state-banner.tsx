import { AlertCircle, CheckCircle2 } from "lucide-react";

import { cn } from "@/lib/utils";

interface SubmissionStateBannerProps {
  variant: "success" | "error";
  title: string;
  description: string;
}

export function SubmissionStateBanner({
  variant,
  title,
  description,
}: SubmissionStateBannerProps) {
  const Icon = variant === "success" ? CheckCircle2 : AlertCircle;

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-[1.5rem] border px-4 py-4 text-sm",
        variant === "success" &&
          "border-success/18 bg-success/8 text-success",
        variant === "error" &&
          "border-destructive/18 bg-destructive/8 text-destructive",
      )}
      role={variant === "error" ? "alert" : "status"}
    >
      <Icon className="mt-0.5 h-5 w-5 shrink-0" />
      <div className="space-y-1">
        <p className="font-semibold">{title}</p>
        <p
          className={cn(
            "leading-6",
            variant === "success" ? "text-success" : "text-destructive",
          )}
        >
          {description}
        </p>
      </div>
    </div>
  );
}
