"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { SubmissionStateBanner } from "@/components/landing/submission-state-banner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  attributionFieldNames,
  defaultLandingPageVariant,
  leadFormSchema,
  leadRoleOptions,
  monthlyVolumeOptions,
  specialtyOptions,
  stateOptions,
  timelineOptions,
  type LeadFormValues,
  type LeadFormInput,
} from "@/lib/validation";
import {
  captureAttributionFromLocation,
  getEmptyAttribution,
  trackClientEvent,
} from "@/lib/tracking";

type SubmissionBannerState =
  | {
      variant: "success" | "error";
      title: string;
      description: string;
    }
  | null;

const defaultValues: Partial<LeadFormInput> = {
  fullName: "",
  professionalEmail: "",
  practiceName: "",
  notes: "",
  confirmedProfessionalUse: false,
  honeypot: "",
  ...getEmptyAttribution(),
};

function FieldError({
  message,
  id,
}: {
  message?: string;
  id: string;
}) {
  if (!message) {
    return null;
  }

  return (
    <p id={id} className="text-sm text-destructive" role="alert">
      {message}
    </p>
  );
}

export function LeadCaptureForm() {
  const router = useRouter();
  const hasTrackedFormStart = useRef(false);
  const [submissionBanner, setSubmissionBanner] = useState<SubmissionBannerState>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    setError,
    setValue,
    getValues,
  } = useForm<LeadFormInput, undefined, LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues,
  });

  useEffect(() => {
    const attribution = captureAttributionFromLocation(window.location.search);

    for (const fieldName of attributionFieldNames) {
      setValue(fieldName, attribution[fieldName] ?? "", {
        shouldDirty: false,
        shouldTouch: false,
      });
    }
  }, [setValue]);

  function trackFormStart() {
    if (hasTrackedFormStart.current) {
      return;
    }

    hasTrackedFormStart.current = true;
    trackClientEvent("form_started", {
      landing_page_variant: getValues("landing_page_variant") ?? defaultLandingPageVariant,
      utm_source: getValues("utm_source"),
      utm_campaign: getValues("utm_campaign"),
    });
  }

  const onSubmit = handleSubmit(async (values) => {
    setSubmissionBanner(null);

    trackClientEvent("form_submit_attempted", {
      role: values.role,
      state: values.state,
      monthly_volume: values.monthlyVolume,
      landing_page_variant: values.landing_page_variant ?? defaultLandingPageVariant,
    });

    try {
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });

      const payload = (await response.json().catch(() => null)) as
        | {
            success?: boolean;
            duplicate?: boolean;
            message?: string;
            fieldErrors?: Record<string, string[]>;
            leadScore?: { bucket?: string; score?: number };
          }
        | null;

      if (!response.ok) {
        if (payload?.fieldErrors) {
          for (const [fieldName, fieldErrors] of Object.entries(payload.fieldErrors)) {
            const firstError = fieldErrors?.[0];

            if (firstError) {
              setError(fieldName as keyof LeadFormInput, {
                type: "server",
                message: firstError,
              });
            }
          }
        }

        setSubmissionBanner({
          variant: "error",
          title: "Unable to submit request",
          description:
            payload?.message ??
            "Please review the highlighted fields and try again. If the issue persists, try again shortly.",
        });
        trackClientEvent("form_submit_error", {
          landing_page_variant: values.landing_page_variant ?? defaultLandingPageVariant,
        });
        return;
      }

      if (response.status === 202 && payload?.duplicate) {
        setSubmissionBanner({
          variant: "success",
          title: "Request already received",
          description:
            payload.message ??
            "We already have this request in review. There is no need to resubmit at this time.",
        });
        return;
      }

      setSubmissionBanner({
        variant: "success",
        title: "Request received",
        description:
          "Your request is now in review. You will be redirected to the confirmation page with next-step expectations.",
      });

      trackClientEvent("form_submit_success", {
        lead_bucket: payload?.leadScore?.bucket,
        lead_score: payload?.leadScore?.score,
        landing_page_variant: values.landing_page_variant ?? defaultLandingPageVariant,
      });
      router.push("/thank-you");
    } catch (error) {
      console.error("Lead submission failed", error);
      setSubmissionBanner({
        variant: "error",
        title: "Request could not be processed",
        description:
          "A network or service issue interrupted submission. Please try again in a moment.",
      });
      trackClientEvent("form_submit_error", {
        landing_page_variant: values.landing_page_variant ?? defaultLandingPageVariant,
      });
    }
  });

  return (
    <form className="space-y-6" onSubmit={onSubmit} noValidate>
      <div className="hidden" aria-hidden="true">
        <Label htmlFor="honeypot">Leave this field blank</Label>
        <Input id="honeypot" tabIndex={-1} autoComplete="off" {...register("honeypot")} />
      </div>

      {attributionFieldNames.map((fieldName) => (
        <input key={fieldName} type="hidden" {...register(fieldName)} />
      ))}

      {submissionBanner ? (
        <SubmissionStateBanner
          variant={submissionBanner.variant}
          title={submissionBanner.title}
          description={submissionBanner.description}
        />
      ) : null}

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            placeholder="Dr. Taylor Quinn"
            autoComplete="name"
            aria-invalid={Boolean(errors.fullName)}
            aria-describedby={errors.fullName ? "fullName-error" : undefined}
            {...register("fullName")}
            onFocus={trackFormStart}
          />
          <FieldError id="fullName-error" message={errors.fullName?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="professionalEmail">Professional Email</Label>
          <Input
            id="professionalEmail"
            type="email"
            placeholder="name@practice.com"
            autoComplete="email"
            aria-invalid={Boolean(errors.professionalEmail)}
            aria-describedby={errors.professionalEmail ? "professionalEmail-error" : undefined}
            {...register("professionalEmail")}
            onFocus={trackFormStart}
          />
          <FieldError id="professionalEmail-error" message={errors.professionalEmail?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="practiceName">Practice / Facility Name</Label>
          <Input
            id="practiceName"
            placeholder="Northshore Clinic"
            autoComplete="organization"
            aria-invalid={Boolean(errors.practiceName)}
            aria-describedby={errors.practiceName ? "practiceName-error" : undefined}
            {...register("practiceName")}
            onFocus={trackFormStart}
          />
          <FieldError id="practiceName-error" message={errors.practiceName?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Controller
            control={control}
            name="role"
            render={({ field }) => (
              <Select value={field.value ?? ""} onValueChange={field.onChange}>
                <SelectTrigger
                  ref={field.ref}
                  id="role"
                  aria-invalid={Boolean(errors.role)}
                  aria-describedby={errors.role ? "role-error" : undefined}
                  onFocus={trackFormStart}
                >
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  {leadRoleOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError id="role-error" message={errors.role?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="specialty">Specialty</Label>
          <Controller
            control={control}
            name="specialty"
            render={({ field }) => (
              <Select value={field.value ?? ""} onValueChange={field.onChange}>
                <SelectTrigger
                  ref={field.ref}
                  id="specialty"
                  aria-invalid={Boolean(errors.specialty)}
                  aria-describedby={errors.specialty ? "specialty-error" : undefined}
                  onFocus={trackFormStart}
                >
                  <SelectValue placeholder="Select specialty" />
                </SelectTrigger>
                <SelectContent>
                  {specialtyOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError id="specialty-error" message={errors.specialty?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="state">State</Label>
          <Controller
            control={control}
            name="state"
            render={({ field }) => (
              <Select value={field.value ?? ""} onValueChange={field.onChange}>
                <SelectTrigger
                  ref={field.ref}
                  id="state"
                  aria-invalid={Boolean(errors.state)}
                  aria-describedby={errors.state ? "state-error" : undefined}
                  onFocus={trackFormStart}
                >
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {stateOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError id="state-error" message={errors.state?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="monthlyVolume">Estimated Monthly Volume</Label>
          <Controller
            control={control}
            name="monthlyVolume"
            render={({ field }) => (
              <Select value={field.value ?? ""} onValueChange={field.onChange}>
                <SelectTrigger
                  ref={field.ref}
                  id="monthlyVolume"
                  aria-invalid={Boolean(errors.monthlyVolume)}
                  aria-describedby={errors.monthlyVolume ? "monthlyVolume-error" : undefined}
                  onFocus={trackFormStart}
                >
                  <SelectValue placeholder="Select volume range" />
                </SelectTrigger>
                <SelectContent>
                  {monthlyVolumeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError id="monthlyVolume-error" message={errors.monthlyVolume?.message} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="timeline">Timeline / Urgency</Label>
          <Controller
            control={control}
            name="timeline"
            render={({ field }) => (
              <Select value={field.value ?? ""} onValueChange={field.onChange}>
                <SelectTrigger
                  ref={field.ref}
                  id="timeline"
                  aria-invalid={Boolean(errors.timeline)}
                  aria-describedby={errors.timeline ? "timeline-error" : undefined}
                  onFocus={trackFormStart}
                >
                  <SelectValue placeholder="Select timeline" />
                </SelectTrigger>
                <SelectContent>
                  {timelineOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError id="timeline-error" message={errors.timeline?.message} />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes / Sourcing Need</Label>
        <Textarea
          id="notes"
          placeholder="Share current sourcing needs, expected cadence, documentation requirements, or facility context."
          aria-invalid={Boolean(errors.notes)}
          aria-describedby={errors.notes ? "notes-error" : undefined}
          {...register("notes")}
          onFocus={trackFormStart}
        />
        <FieldError id="notes-error" message={errors.notes?.message} />
      </div>

      <div className="rounded-[1.5rem] border border-border/70 bg-background/70 p-4">
        <div className="flex items-start gap-3">
          <Controller
            control={control}
            name="confirmedProfessionalUse"
            render={({ field }) => (
              <Checkbox
                ref={field.ref}
                id="confirmedProfessionalUse"
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(Boolean(checked))}
                onFocus={trackFormStart}
                aria-invalid={Boolean(errors.confirmedProfessionalUse)}
                aria-describedby={
                  errors.confirmedProfessionalUse
                    ? "confirmedProfessionalUse-error"
                    : undefined
                }
              />
            )}
          />
          <div className="space-y-2">
            <Label htmlFor="confirmedProfessionalUse" className="leading-6">
              I confirm I am a licensed clinician or authorized healthcare purchaser seeking
              information for professional use.
            </Label>
            <FieldError
              id="confirmedProfessionalUse-error"
              message={errors.confirmedProfessionalUse?.message}
            />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <Button type="submit" size="lg" disabled={isSubmitting} className="w-full sm:w-auto">
          {isSubmitting ? (
            <>
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Submitting request
            </>
          ) : (
            "Submit Request"
          )}
        </Button>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          Pricing, availability, and access are subject to verification and applicable
          requirements.
        </p>
      </div>
    </form>
  );
}
