# Bacwaterclub.com

> **Pivot notice (2026-04-09):** This site was originally scoped as a clinician lead-capture funnel for Hospira Bacteriostatic Water (the PRD below). It has since pivoted to a direct-to-consumer storefront selling Bacwaterclub-branded 30 mL bacteriostatic water vials via Stripe Checkout. The PRD content beyond this banner reflects the **old** product direction and is kept for historical reference. Treat the live source code (`app/`, `components/product/`, `lib/product.ts`, `lib/stripe.ts`) as the source of truth.

## Quickstart

```bash
pnpm install
pnpm dev
```

## Required environment variables

Add these to `.env.local`:

```bash
STRIPE_SECRET_KEY=sk_test_...           # Stripe API secret (test mode for dev)
NEXT_PUBLIC_SITE_URL=http://localhost:3000  # Used for absolute URLs in checkout success/cancel redirects
```

## Scripts

| Command | Purpose |
|---|---|
| `pnpm dev` | Start the Next.js dev server |
| `pnpm build` | Production build |
| `pnpm typecheck` | TypeScript no-emit check |
| `pnpm lint` | ESLint (`--max-warnings=0`) |
| `pnpm test:run` | Vitest one-shot |

---

# Original PRD (historical — pre-pivot)

Comprehensive README + PRD

---

# Table of Contents

1. [Document Purpose](#document-purpose)
2. [Executive Summary](#executive-summary)
3. [Product Vision](#product-vision)
4. [Business Context](#business-context)
5. [Goals](#goals)
6. [Non-Goals](#non-goals)
7. [Primary Users](#primary-users)
8. [User Jobs To Be Done](#user-jobs-to-be-done)
9. [Core Positioning](#core-positioning)
10. [Product Principles](#product-principles)
11. [Functional Scope](#functional-scope)
12. [Information Architecture](#information-architecture)
13. [User Flows](#user-flows)
14. [Detailed Product Requirements](#detailed-product-requirements)
15. [Copy System](#copy-system)
16. [Design System Direction](#design-system-direction)
17. [Component Map](#component-map)
18. [Technical Architecture](#technical-architecture)
19. [File Structure](#file-structure)
20. [API Design](#api-design)
21. [Data Contracts](#data-contracts)
22. [Validation Rules](#validation-rules)
23. [Lead Scoring System](#lead-scoring-system)
24. [CRM / Notifications / Email Workflows](#crm--notifications--email-workflows)
25. [Tracking and Attribution](#tracking-and-attribution)
26. [Analytics Plan](#analytics-plan)
27. [SEO and Metadata](#seo-and-metadata)
28. [Performance Requirements](#performance-requirements)
29. [Accessibility Requirements](#accessibility-requirements)
30. [Security Requirements](#security-requirements)
31. [Operational Requirements](#operational-requirements)
32. [Deployment Guide](#deployment-guide)
33. [Environment Variables](#environment-variables)
34. [QA Checklist](#qa-checklist)
35. [Acceptance Criteria](#acceptance-criteria)
36. [Roadmap](#roadmap)
37. [Risks and Open Questions](#risks-and-open-questions)
38. [Engineering Handoff Notes](#engineering-handoff-notes)
39. [Launch Checklist](#launch-checklist)

---

# Document Purpose

This document serves as the canonical product and implementation specification for a clinician-focused landing page built to support paid acquisition, qualified lead capture, account-request workflows, and internal routing automation.

It is intended to be used by:

* product
* engineering
* design
* growth / GTM
* operations
* CRM / lifecycle owners
* analytics / paid media teams

This document combines two roles:

1. **README**: how the project is structured, configured, deployed, and operated
2. **PRD**: what the product is, why it exists, what it must do, and how success will be measured

---

# Executive Summary

The product is a premium clinician-only landing page for Hospira Bacteriostatic Water that converts paid Reddit traffic into qualified professional inquiries.

This page must not behave like a consumer ecommerce page. It must instead function like a professional procurement and account-request experience for clinicians, practice administrators, procurement teams, and authorized healthcare purchasers.

The page should:

* build trust immediately
* make audience targeting explicit
* provide documentation access
* capture qualified requests for pricing and account setup
* support backend validation, scoring, routing, and follow-up automation
* operate cleanly on Vercel with modular reusable architecture

The system should minimize manual effort by automatically handling attribution capture, form validation, lead scoring, CRM handoff, internal alerts, and email confirmation.

---

# Product Vision

Build a high-trust, premium, clinician-facing landing page that quietly filters for the right audience, converts professional demand efficiently, and functions as a reusable template for future regulated clinician acquisition funnels.

---

# Business Context

The landing page exists because clinician-targeted paid traffic in regulated categories performs poorly when sent to generic consumer-style pages.

A conventional retail experience creates several problems:

* it reduces trust among professional buyers
* it invites low-quality or mismatched traffic
* it weakens account-request and procurement framing
* it creates friction for legitimate professional users
* it makes downstream sales and routing less structured

The business needs a clinician-specific acquisition experience that:

* aligns with professional expectations
* increases lead quality
* supports documentation access
* creates clearer downstream operations
* enables campaign measurement and optimization

---

# Goals

## Primary Goals

* Convert Reddit traffic into qualified clinician leads
* Drive account requests and pricing inquiries
* Establish professional trust within the first screen
* Capture attribution data for every inquiry
* Route leads automatically with minimal manual handling
* Create a deployable Vercel-native acquisition system

## Secondary Goals

* Support product insert or documentation download
* Improve lead quality over raw lead volume
* Segment leads by role, specialty, geography, and volume
* Create a scalable template for related clinician products

## Tertiary Goals

* Support A/B testing of message hierarchy and CTAs
* Support downstream lifecycle automation
* Enable future personalization by specialty or campaign variant

---

# Non-Goals

The following are explicitly out of scope for the initial build:

* consumer checkout
* cart functionality
* “buy now” behavior
* ecommerce catalog architecture
* consumer wellness funnel styling
* unsupported efficacy claims
* broad educational content hub
* blog / CMS expansion in MVP
* live inventory surface in MVP
* multi-step onboarding portal in MVP

---

# Primary Users

## 1. Physician

A physician who wants fast legitimacy confirmation, product context, documentation access, and a clear procurement path.

## 2. Nurse Practitioner / Physician Assistant

A clinical buyer or decision influencer who values clarity, account setup simplicity, and fast follow-up.

## 3. Practice Administrator

An operations-minded user looking for pricing, documentation, process clarity, and operational reliability.

## 4. Procurement / Operations Lead

A professional user who needs a controlled sourcing pathway, volume alignment, and minimal ambiguity.

## 5. Authorized Healthcare Purchaser

An internal buyer or approved staff member seeking professional-use information and a valid inquiry flow.

## 6. Low-Intent or Unqualified Visitor

A user who should be gently filtered by professional tone, audience framing, and form structure rather than aggressively blocked.

---

# User Jobs To Be Done

Users come to the page to answer one or more of these questions:

* Is this page actually for clinicians or professional buyers?
* Is this a legitimate and trustworthy source?
* Can I get pricing or account setup here?
* Can I access product documentation?
* What do I need to submit?
* What happens after I submit?
* How quickly will someone follow up?

The page must answer those questions clearly and quickly.

---

# Core Positioning

## Positioning Statement

A premium, trust-first clinician acquisition page for authorized professional buyers seeking pricing, availability, documentation, and account setup.

## What It Is

* a clinician landing page
* a qualified lead capture page
* a documentation and procurement-support page
* a routing surface into internal CRM and operations workflows

## What It Is Not

* a general consumer health page
* a peptide-style direct-response funnel
* a low-friction DTC checkout flow
* a hype-driven wellness page

---

# Product Principles

1. **Professional before persuasive**
2. **Trust before conversion pressure**
3. **Qualification before transaction**
4. **Clarity before cleverness**
5. **Premium, not flashy**
6. **Operationally autonomous under the surface**
7. **Simple user experience, robust backend behavior**
8. **Lead quality over vanity conversion volume**

---

# Functional Scope

The product includes:

* single landing page
* audience bar
* header and navigation
* hero section
* trust / product context section
* audience-fit section
* workflow explanation section
* lead capture form
* documentation section
* FAQ section
* final CTA section
* footer
* thank-you page
* server-side form submission endpoint
* lead scoring utility
* CRM integration layer
* notification layer
* email confirmation layer
* attribution capture layer
* Reddit tracking readiness
* analytics event model

---

# Information Architecture

## Top-Level Page Sections

1. Audience Bar
2. Header / Navigation
3. Hero
4. Trust / Product Context
5. Who This Is For
6. How Ordering Works
7. Lead Capture Section
8. Documentation Section
9. FAQ
10. Final CTA
11. Footer

## Thank-You Experience

1. Confirmation message
2. Next steps summary
3. Support / documentation actions
4. Optional rep-contact expectation

---

# User Flows

## Flow 1: Primary Paid Traffic Conversion

1. User clicks Reddit ad
2. User lands on page with UTM + Reddit click parameters
3. User scans audience bar and hero
4. User evaluates trust strip and product context
5. User submits pricing / account request form
6. Server validates and scores lead
7. Lead is stored and routed
8. User lands on thank-you page
9. Internal team receives alert and CRM entry
10. Follow-up begins

## Flow 2: Documentation-Led Conversion

1. User lands on page
2. User clicks documentation CTA
3. User reviews documentation or requests it
4. User returns to primary inquiry form
5. User submits request

## Flow 3: Low-Intent Self-Filter

1. User lands on page
2. User sees professional audience messaging
3. User recognizes page is not intended for consumer purchase
4. User exits without polluting the sales workflow

## Flow 4: High-Intent Operations Buyer

1. User arrives from targeted Reddit campaign
2. User recognizes procurement-oriented language
3. User reviews ordering steps and account-request flow
4. User submits detailed practice and volume information
5. Lead is bucketed as high intent and escalated internally

---

# Detailed Product Requirements

## 1. Audience Bar

### Purpose

Establish the intended audience immediately and reduce mismatched traffic.

### Requirements

* visible at top of page
* short, calm, professional tone
* present across desktop and mobile
* not visually dominant over hero

### Example Copy

`For healthcare professionals and authorized purchasers only`

### Acceptance Criteria

* visible without scrolling
* readable at all breakpoints
* not styled like a warning banner

---

## 2. Header / Navigation

### Purpose

Provide lightweight navigation and persistent access to primary CTA.

### Requirements

* logo or brand text lockup
* nav links: Product, How It Works, Documentation, FAQ
* primary CTA: Request Pricing
* mobile-friendly navigation pattern
* optional sticky header behavior

### Acceptance Criteria

* primary CTA visible above the fold
* navigation remains minimal and uncluttered
* mobile drawer or collapsible nav is accessible

---

## 3. Hero Section

### Purpose

Communicate who the page is for, what it offers, and what the next step is.

### Requirements

* clinician-focused headline
* restrained supporting subheadline
* primary CTA: Request Pricing
* secondary CTA: Download Documentation Preview
* trust strip or badge row
* premium right-side qualification card on desktop

### Hero Must Communicate

* clinician audience
* product context
* professional procurement posture
* clear next step

### Acceptance Criteria

* user understands audience + action in under 5 seconds
* CTA is prominent and visible on mobile and desktop
* trust indicators reinforce legitimacy without clutter

---

## 4. Trust / Product Context Section

### Purpose

Reinforce professional legitimacy and clarify the page’s role.

### Required Cards

* Official Product Context
* Clinician-First Workflow
* Compliance-Forward Procurement

### Acceptance Criteria

* visual tone remains restrained and premium
* copy does not become hypey or consumerized
* section supports the user’s confidence before form submission

---

## 5. Who This Is For Section

### Purpose

Help qualified visitors self-identify quickly.

### Required Audience Cards

* Physicians
* NPs / PAs
* Practice Administrators
* Procurement / Operations Teams
* Clinics / Med Spas
* Authorized Healthcare Buyers

### Acceptance Criteria

* segment cards are easy to scan
* section reinforces audience fit
* iconography is subtle, not playful

---

## 6. How Ordering Works Section

### Purpose

Reduce ambiguity and explain the operational flow.

### Required Steps

1. Submit account request
2. Verify purchaser and practice details
3. Receive pricing, availability, and ordering support

### Optional Adjacent Panel

* fast review and routing explanation
* internal support expectations
* quote / access workflow summary

### Acceptance Criteria

* clearly communicates there is no casual instant checkout
* reduces uncertainty about what happens after form submission

---

## 7. Lead Capture Section

### Purpose

Serve as the primary conversion block.

### Required Fields

* Full Name
* Professional Email
* Practice / Facility Name
* Role
* Specialty
* State
* Estimated Monthly Volume
* Timeline / Urgency
* Notes / Sourcing Need
* Confirmation checkbox for professional use

### Hidden Attribution Fields

* utm_source
* utm_medium
* utm_campaign
* utm_content
* utm_term
* reddit_click_id
* landing_page_variant

### Required Behavior

* inline validation
* loading state
* disabled submit during submission
* accessible error handling
* clear success / failure response
* redirect to thank-you page or show inline success state

### Acceptance Criteria

* form works across breakpoints
* user errors are clear and recoverable
* successful submit routes properly server-side

---

## 8. Documentation Section

### Purpose

Provide support materials and reduce friction for documentation-dependent buyers.

### Required Cards

* Product Insert
* Request Documentation
* Ordering Support
* Verification Workflow

### Acceptance Criteria

* documentation access feels professional and purposeful
* each card has a clear CTA and short description

---

## 9. FAQ Section

### Purpose

Answer common qualification and workflow questions.

### Required Questions

* Who can request pricing?
* Is this intended for clinical use?
* How does verification work?
* Can I access product documentation?
* What happens after I submit a request?
* Is this page intended for consumers?

### Acceptance Criteria

* accordion is accessible
* answers are concise, professional, and aligned to positioning

---

## 10. Final CTA Section

### Purpose

Offer one more strong conversion opportunity after trust-building content.

### Required Elements

* headline
* primary CTA: Request Pricing
* secondary CTA: Speak With a Rep

### Acceptance Criteria

* high visual contrast and clarity
* does not feel repetitive or aggressive

---

## 11. Footer

### Purpose

Complete the experience with professional utility links and audience reinforcement.

### Required Elements

* intended audience note
* privacy policy
* terms
* contact
* documentation

### Acceptance Criteria

* clean and minimal
* accessible and mobile-friendly

---

# Copy System

## Tone Attributes

* premium
* professional
* calm
* restrained
* credible
* clinician-appropriate
* direct but not aggressive

## Avoid

* exaggerated claims
* bro-marketing language
* gimmicky urgency
* casual DTC supplement tone
* overly legalistic messaging
* consumer wellness framing

## Messaging Pillars

* clinician / professional audience
* trusted workflow
* documentation availability
* account request / pricing support
* responsive review process
* professional use context

---

# Design System Direction

## Visual Direction

A refined clinical-editorial aesthetic balancing premium brand presence with institutional trust.

## Color Palette

* Deep green: `#2B4542`
* Cream: `#F7F6E8`
* Light green accent: `#D7F3DC`
* Dark text: `#1D2B2A`
* Muted border / secondary tones: green-gray variants

## Typography Direction

* serif display style for major headings
* clean sans serif for body copy, UI, form fields, and labels

## UI Characteristics

* generous whitespace
* rounded 2xl cards and inputs
* soft layered shadows
* restrained gradients
* crisp borders
* minimal but elegant iconography
* premium layout density

## Motion Guidance

* subtle hover states
* gentle entrance or fade effects only where useful
* no excessive animation

---

# Component Map

## Page-Level Components

### `LandingPageShell`

Global page wrapper that handles shared layout, background, spacing, and theme containment.

### `AudienceBar`

Top strip displaying intended audience context.

### `SiteHeader`

Navigation, logo area, and persistent primary CTA.

### `SiteFooter`

Footer with support links and audience note.

---

## Hero Components

### `HeroSection`

Main positioning block containing headline, subheadline, CTAs, trust strip, and form preview.

### `HeroCopyBlock`

Left-side hero content.

### `HeroActionGroup`

CTA group for Request Pricing / Download Documentation Preview.

### `HeroTrustStrip`

Inline badge row such as:

* Rx Only
* U.S. HCP Audience
* Documentation Preview Available
* 30 mL Multiple-Dose Vial
* Verification Required

### `HeroQualificationCard`

Compact visual preview of the account request workflow.

---

## Content Components

### `SectionHeader`

Reusable section header component with eyebrow, title, and description.

### `TrustCardsSection`

Container for trust-building product context cards.

### `TrustCard`

Reusable card with title, short body, optional icon, and optional CTA.

### `AudienceGridSection`

Grid layout for professional audience segments.

### `AudienceCard`

Individual audience segment card.

### `WorkflowStepsSection`

Three-step procurement / inquiry process section.

### `WorkflowStepCard`

Individual step card.

### `AutomationPanel`

Side panel explaining review, routing, and support workflow.

---

## Lead Capture Components

### `LeadCaptureSection`

Container section for the main form area.

### `LeadCaptureForm`

Main submission form with validation, hidden attribution support, loading state, and structured error handling.

### `FormFieldText`

Reusable text input wrapper.

### `FormFieldSelect`

Reusable select wrapper.

### `FormFieldTextarea`

Reusable long-form notes wrapper.

### `FormFieldCheckbox`

Reusable confirmation checkbox wrapper.

### `SubmissionStateBanner`

Inline success or error summary component.

---

## Documentation Components

### `DocumentationSection`

Container for documentation and support cards.

### `DocumentationCard`

Card for product insert, documentation request, ordering support, or verification workflow.

---

## FAQ / CTA Components

### `FaqSection`

Accordion-based FAQ wrapper.

### `FaqItem`

Single FAQ entry.

### `FinalCtaSection`

Last-page conversion opportunity.

---

## Thank-You Page Components

### `ThankYouPageShell`

Layout shell for post-submit experience.

### `ThankYouMessageCard`

Primary confirmation card.

### `NextStepsList`

Expected follow-up explanation.

### `SupportOptionsCard`

Support and documentation actions after form submission.

---

## Tracking / Utility Components

### `RedditPixel`

Client-side pixel injector.

### `AttributionCapture`

Utility component or hook that captures and persists UTM + Reddit click params.

### `useAttribution`

Hook for reading attribution state and prefilling hidden form values.

### `trackEvent()`

Unified analytics event emitter.

### `submitLead()`

Client helper for POSTing lead payload.

### `scoreLead()`

Lead scoring utility.

### `validateLeadPayload()`

Shared validation function or zod schema wrapper.

### `sendSlackNotification()`

Notification utility.

### `sendConfirmationEmail()`

Email utility.

### `upsertCrmLead()`

CRM adapter.

---

# Technical Architecture

## Frontend

* Next.js App Router
* TypeScript
* Tailwind CSS
* shadcn/ui

## Backend

* Vercel route handlers
* Zod validation
* Lead scoring utilities
* CRM adapter layer
* Notifications layer
* Tracking helpers

## Integrations

* CRM: HubSpot or equivalent
* Email: Resend or Postmark
* Notifications: Slack webhook
* Database: Postgres-compatible store
* Tracking: Reddit Pixel + future Reddit CAPI endpoint

## Architectural Principles

* modular and reusable
* Vercel-native
* server-side integration handling
* graceful degradation if third-party systems fail
* shared validation across client and server where practical

---

# File Structure

```txt
app/
  page.tsx
  thank-you/
    page.tsx
  api/
    lead/
      route.ts
    reddit-capi/
      route.ts
components/
  landing/
    audience-bar.tsx
    site-header.tsx
    hero-section.tsx
    trust-cards-section.tsx
    audience-grid-section.tsx
    workflow-steps-section.tsx
    lead-capture-section.tsx
    lead-capture-form.tsx
    documentation-section.tsx
    faq-section.tsx
    final-cta-section.tsx
    site-footer.tsx
    section-header.tsx
    submission-state-banner.tsx
lib/
  env.ts
  validation.ts
  lead-scoring.ts
  tracking.ts
  crm.ts
  notifications.ts
  email.ts
  db.ts
  content.ts
  utils.ts
types/
  lead.ts
  analytics.ts
  content.ts
public/
  images/
  icons/
```

---

# API Design

## POST `/api/lead`

### Purpose

Receive form submissions, validate them, score leads, store the payload, notify internal systems, and return a structured response.

### Responsibilities

* parse request body
* validate schema
* sanitize strings
* compute lead score
* persist lead record
* upsert to CRM
* trigger internal notifications
* trigger confirmation email
* return JSON response

### Expected Response Shape

```json
{
  "success": true,
  "message": "Request received",
  "leadScore": {
    "score": 78,
    "bucket": "high",
    "routingRecommendation": "priority_queue"
  }
}
```

## POST `/api/reddit-capi`

### Purpose

Future-ready endpoint for server-side Reddit conversion events.

### Responsibilities

* receive normalized conversion payload
* validate event type and identifiers
* forward to Reddit Conversions API when configured
* fail safely without affecting user experience

---

# Data Contracts

## `LeadPayload`

```ts
interface LeadPayload {
  fullName: string
  professionalEmail: string
  practiceName: string
  role: string
  specialty: string
  state: string
  monthlyVolume: string
  timeline: string
  notes?: string
  confirmedProfessionalUse: boolean
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmContent?: string
  utmTerm?: string
  redditClickId?: string
  landingPageVariant?: string
}
```

## `LeadScoreResult`

```ts
interface LeadScoreResult {
  score: number
  bucket: "low" | "medium" | "high"
  routingRecommendation: string
  reasons: string[]
}
```

## `AnalyticsEventPayload`

```ts
interface AnalyticsEventPayload {
  eventName: string
  timestamp: string
  pageVariant?: string
  utmSource?: string
  utmMedium?: string
  utmCampaign?: string
  utmContent?: string
  utmTerm?: string
  redditClickId?: string
  roleSelected?: string
  stateSelected?: string
  volumeSelected?: string
}
```

---

# Validation Rules

## Required Fields

* fullName
* professionalEmail
* practiceName
* role
* specialty
* state
* monthlyVolume
* timeline
* confirmedProfessionalUse

## Email Rules

* must be valid format
* professional domain preferred for scoring
* free email should not block submission automatically if other fields are strong

## String Rules

* trim whitespace
* reject obviously malformed payloads
* cap character lengths to safe limits
* escape or sanitize where needed before storage or rendering

## Checkbox Rules

* confirmedProfessionalUse must be true

## Anti-Abuse Rules

* honeypot field optional
* rate limiting on route
* duplicate-submission heuristic
* bot-like content checks optional

---

# Lead Scoring System

## Purpose

Rank inbound leads so the team can prioritize serious clinicians and buyers.

## Scoring Inputs

* email domain quality
* role relevance
* practice / facility detail presence
* specialty presence
* estimated monthly volume
* urgency / timeline
* completeness of notes
* attribution quality if useful

## Example Heuristics

### Positive Signals

* professional email domain
* physician / NP / PA / admin / procurement title
* real facility name
* meaningful volume estimate
* near-term timeline
* detailed sourcing notes

### Neutral Signals

* moderate detail but no volume
* unclear urgency
* mixed-quality email domain with otherwise strong info

### Negative Signals

* empty facility name
* vague role
* no meaningful detail
* spammy content
* duplicate submissions within a short time period

## Output

* numeric score
* low / medium / high bucket
* routing recommendation

## Example Routing Recommendations

* `priority_queue`
* `standard_queue`
* `review_queue`
* `spam_review`

---

# CRM / Notifications / Email Workflows

## CRM Workflow

### Goal

Create or update a lead/contact record enriched with source and qualification data.

### CRM Payload Should Include

* all normalized form fields
* lead score
* lead bucket
* routing recommendation
* source attribution
* original landing page variant
* submission timestamp

## Slack Notification Workflow

### Goal

Alert internal team of new inquiries.

### Alert Levels

* high-intent lead → priority channel or tagged alert
* standard lead → standard sales or ops channel
* suspicious lead → review channel or logged only

## Confirmation Email Workflow

### Goal

Acknowledge request receipt and set expectations.

### Email Content Should Include

* confirmation that request was received
* brief explanation of review process
* optional documentation/support links
* no promises that cannot be operationally met

---

# Tracking and Attribution

## Attribution Capture

Capture on initial landing:

* utm_source
* utm_medium
* utm_campaign
* utm_content
* utm_term
* reddit_click_id
* landing_page_variant

## Attribution Persistence

Store attribution in:

* memory / state
* localStorage or sessionStorage if needed
* hidden form fields for submission

## Pixel Readiness

Prepare for:

* Reddit Pixel page view
* CTA click events
* form start events
* form submit events
* thank-you page view / conversion event

## Server-Side Readiness

Provide future hook points for Reddit Conversions API.

---

# Analytics Plan

## Core Events

* landing_page_view
* hero_request_pricing_click
* hero_product_insert_click
* trust_card_docs_click
* workflow_cta_click
* form_started
* form_submit_attempted
* form_submit_success
* form_submit_error
* thank_you_page_view
* faq_opened
* final_cta_click

## Event Properties

* pageVariant
* utmSource
* utmMedium
* utmCampaign
* utmContent
* utmTerm
* redditClickId
* deviceType
* roleSelected
* stateSelected
* volumeSelected
* leadScoreBucket

## KPI Monitoring

* qualified lead conversion rate
* form completion rate
* cost per qualified lead
* high-intent lead ratio
* sales acceptance rate
* documentation download assist rate

---

# SEO and Metadata

## Metadata Goals

* clear clinician audience positioning
* professional search appearance
* strong canonical structure
* clean Open Graph previews for internal sharing

## Recommended Metadata Elements

* page title aligned to clinician/professional intent
* professional meta description
* canonical URL
* Open Graph title and description
* robots defaults suitable for public landing page
* optional structured data for organization / webpage

## SEO Caveat

This page is primarily paid-acquisition-oriented. SEO is secondary to clarity, trust, and conversion quality.

---

# Performance Requirements

* fast initial render
* minimal layout shift
* compressed media assets
* optimized font loading
* low bundle bloat
* mobile responsiveness suitable for paid traffic
* efficient client-side JS footprint

---

# Accessibility Requirements

* semantic headings and landmarks
* keyboard accessible navigation and forms
* proper form labels
* ARIA support where needed
* accessible error messaging
* adequate color contrast
* focus states clearly visible
* accordion interactions accessible
* reduced motion consideration if animations are present

---

# Security Requirements

* sanitize all incoming form input
* validate server-side
* store secrets server-side only
* rate limit submission endpoint
* optional honeypot or anti-bot layer
* no sensitive keys exposed to client
* handle third-party failures without crashing user flow
* log integration failures safely

---

# Operational Requirements

* internal team must be alerted when new leads arrive
* priority leads should be distinguishable
* CRM must remain the source of truth after submission
* thank-you state should set expectations clearly
* deployment must be easy to reproduce on Vercel
* environment configuration should be explicit and documented

---

# Deployment Guide

## Local Development

1. install dependencies
2. configure environment variables
3. run development server
4. test form submission and mock integrations

Example:

```bash
pnpm install
pnpm dev
```

## Build

```bash
pnpm build
```

## Deploy to Vercel

1. push repository to Git provider
2. import repo into Vercel
3. configure environment variables
4. deploy preview
5. validate analytics, forms, and API routes
6. promote to production

## Post-Deployment Verification

* page loads correctly
* metadata renders correctly
* form submits successfully
* CRM payload works
* Slack alert works
* confirmation email works
* thank-you page renders
* attribution fields populate correctly

---

# Environment Variables

```bash
# Core
NEXT_PUBLIC_SITE_URL=
NODE_ENV=

# CRM
HUBSPOT_API_KEY=
HUBSPOT_PORTAL_ID=
HUBSPOT_FORM_ID=

# Notifications
SLACK_WEBHOOK_URL=

# Email
RESEND_API_KEY=
POSTMARK_SERVER_TOKEN=
EMAIL_FROM=
EMAIL_REPLY_TO=

# Database
DATABASE_URL=

# Tracking
NEXT_PUBLIC_REDDIT_PIXEL_ID=
REDDIT_ACCESS_TOKEN=
REDDIT_AD_ACCOUNT_ID=

# App behavior
LEAD_RATE_LIMIT_WINDOW_MS=
LEAD_RATE_LIMIT_MAX=
DEFAULT_LEAD_ROUTING_QUEUE=
```

## Notes

* never expose server-only secrets to the client
* only `NEXT_PUBLIC_*` variables should be client-readable
* document environment values per environment: local, preview, production

---

# QA Checklist

## UX / UI

* [ ] all sections render correctly on mobile
* [ ] all sections render correctly on desktop
* [ ] spacing is consistent
* [ ] CTAs are visually clear
* [ ] no section feels consumer-ecommerce styled
* [ ] trust hierarchy is clear above the fold

## Form

* [ ] required field validation works
* [ ] invalid email handling works
* [ ] checkbox required behavior works
* [ ] submit button loading state works
* [ ] success state works
* [ ] error state works
* [ ] duplicate submission handling is reasonable

## Data / Backend

* [ ] `/api/lead` validates correctly
* [ ] lead scoring returns expected bucket
* [ ] CRM adapter receives payload
* [ ] Slack notifications send successfully
* [ ] confirmation email sends
* [ ] failures degrade gracefully

## Tracking

* [ ] UTM params captured
* [ ] Reddit click id captured when present
* [ ] analytics events fire at correct moments
* [ ] thank-you page view event fires

## Accessibility

* [ ] tab order is logical
* [ ] labels are correctly associated
* [ ] accordion is keyboard accessible
* [ ] contrast passes review
* [ ] focus rings are visible

---

# Acceptance Criteria

The product is complete when:

* the page clearly targets clinicians and authorized purchasers
* the page feels premium and professional
* the user understands the workflow without confusion
* the page does not resemble a consumer checkout funnel
* the primary form works across devices
* attribution is captured correctly
* lead scoring is functional
* CRM / Slack / email workflows are wired or safely stubbed
* thank-you flow is clear and polished
* the project is deployable to Vercel without structural rework
* the codebase is modular enough for reuse on future product pages

---

# Roadmap

## Phase 1: MVP

* landing page
* lead form
* thank-you page
* validation
* lead scoring
* CRM placeholder or live integration
* Slack alert
* email confirmation
* Reddit tracking readiness

## Phase 2: Optimization

* A/B test hero copy
* A/B test CTA labels
* specialty-specific audience modules
* improved scoring logic
* enhanced anti-spam logic
* dynamic documentation workflows

## Phase 3: Scale

* template system for related clinician product pages
* richer analytics dashboards
* territory-based routing
* calendar booking or rep scheduling
* server-side conversion optimization

---

# Risks and Open Questions

## Risks

* low-quality paid traffic if audience framing is too broad
* weak professional trust if visual tone drifts toward DTC wellness
* CRM inconsistency if source-of-truth model is unclear
* under-instrumentation if attribution capture is incomplete
* friction increase if form is too long without enough trust-building

## Open Questions

* Which CRM is the final source of truth?
* Will documentation be downloadable immediately or request-gated?
* What is the SLA for high-intent leads?
* Should state-based routing exist in MVP?
* Should rep contact be direct or mediated through operations?
* Should free-email domains be accepted, downgraded, or partially restricted?

---

# Engineering Handoff Notes

## Implementation Priorities

1. build the page shell and core sections
2. implement the lead form and validation
3. wire server-side route handling
4. implement lead scoring
5. wire CRM / Slack / email stubs
6. add attribution capture
7. add analytics events
8. polish thank-you experience
9. optimize responsiveness and accessibility

## Coding Standards

* use TypeScript strictly
* keep components small and reusable
* separate content from behavior where practical
* centralize theme tokens and copy config
* keep API route logic readable and testable
* fail gracefully on third-party errors

---

# Launch Checklist

## Pre-Launch

* [ ] final copy reviewed
* [ ] final design reviewed
* [ ] form payload reviewed
* [ ] CRM mapping reviewed
* [ ] Slack message formatting reviewed
* [ ] confirmation email reviewed
* [ ] analytics naming finalized
* [ ] Reddit tracking configured
* [ ] Vercel environment variables set
* [ ] mobile QA complete
* [ ] accessibility QA complete

## Launch Day

* [ ] deploy production build
* [ ] verify page load
* [ ] verify API route health
* [ ] verify test submission end to end
* [ ] verify CRM record creation
* [ ] verify Slack alert
* [ ] verify confirmation email
* [ ] verify attribution capture
* [ ] verify thank-you page event

## Post-Launch

* [ ] monitor error logs
* [ ] review first submissions for quality
* [ ] inspect lead scoring distribution
* [ ] compare campaigns by qualified lead rate
* [ ] optimize hero and form friction if needed

---

# Final Summary

This product should feel like a premium clinical-access experience: credible, calm, focused, and operationally mature.

On the surface, it should be simple.
Under the hood, it should capture, score, route, notify, and support paid acquisition with as little manual effort as possible.

That combination is the real objective:
**a high-trust frontend with an autonomous GTM-ready backend workflow.**

---

# Implementation Notes

## Required Environment Variables

```bash
NEXT_PUBLIC_SITE_URL=
HUBSPOT_API_KEY=
SLACK_WEBHOOK_URL=
RESEND_API_KEY=
POSTMARK_SERVER_TOKEN=
EMAIL_FROM=
REDDIT_PIXEL_ID=
REDDIT_ACCESS_TOKEN=
DATABASE_URL=
LEAD_RATE_LIMIT_WINDOW_MS=
LEAD_RATE_LIMIT_MAX=
```

Recommended public client variable:

```bash
NEXT_PUBLIC_REDDIT_PIXEL_ID=
```

## CRM Wiring

The scaffold maps form submissions into a HubSpot-style payload in `lib/crm.ts`.
To wire a live CRM:

1. Set `HUBSPOT_API_KEY`
2. Review and finalize the included HubSpot search + upsert flow
3. Map custom properties for role, specialty, monthly volume, timeline, attribution, and lead score

## Slack Wiring

The scaffold formats a structured webhook payload in `lib/notifications.ts`.
To enable it:

1. Create an incoming webhook in Slack
2. Set `SLACK_WEBHOOK_URL`
3. Point it to the channel responsible for inbound clinician lead review

## Email Wiring

Confirmation email support is prepared for Resend or Postmark in `lib/notifications.ts`.

1. Set `RESEND_API_KEY` to use Resend, or `POSTMARK_SERVER_TOKEN` to use Postmark
2. Set `EMAIL_FROM` to the verified sender identity
3. Update the HTML body and reply handling to match your real support workflow

## Vercel Deployment

1. Import the repository into Vercel
2. Add the environment variables above for Preview and Production
3. Set the production domain in `NEXT_PUBLIC_SITE_URL`
4. Deploy and verify `/api/lead`, `/api/reddit-capi`, and the thank-you flow
5. Configure a durable sink (`DATABASE_URL` or live CRM) before using the page as a real lead intake surface
