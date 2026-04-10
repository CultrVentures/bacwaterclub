# B2B Clinician Landing Page Design Specification

## 1. Direction
This project is a **single editorial landing page**, not a marketplace, catalog, or checkout experience.

The page is designed to help licensed clinicians, practice administrators, procurement teams, and other authorized healthcare purchasers request:

- pricing
- availability follow-up
- account setup
- supporting documentation

The landing page must feel premium, restrained, and trustworthy. It should support a professional account-request workflow sourced from targeted Reddit traffic without drifting into direct-to-consumer e-commerce patterns.

## 2. Core Design Principles

1. **Professional before promotional**
   The page should look like a credible clinical procurement experience, not a consumer supplement funnel.

2. **Qualification before transaction**
   The UI captures verified requests. It does not expose cart, checkout, unlocked pricing, or self-serve ordering.

3. **Trust before urgency**
   Messaging should emphasize documentation, review, and operational clarity over hype or pressure tactics.

4. **One workflow, multiple outcomes**
   Pricing review, documentation requests, and rep follow-up all begin through the same verified request form, with copy making that shared intake path explicit.

## 3. Visual Identity

### Color palette
- Primary: medical blue `#1E4FA6`
- Background: cool white `#F6F9FC` with a soft white-to-blue gradient
- Secondary surface: pale blue `#E6EFFF`
- Accent: cool cyan `#CFE6F7`
- Primary text: navy-charcoal `#0F1E33`
- Muted text: slate `#52607A` tuned for readable contrast on cool surfaces

### Typography
- Headings: `Lora`
- Body/UI: `Public Sans`

### Surface and spacing rules
- Large vertical spacing
- Rounded `2xl` feel throughout
- Soft, restrained shadows rather than flat catalog cards
- Light gradients and gentle overlays are acceptable
- Visual density should stay low; whitespace is part of the premium signal

## 4. Page Architecture

The experience follows this fixed order:

1. **Audience bar**
   Sets the page boundary immediately: professional buyers only.

2. **Header**
   Lightweight anchor navigation plus a primary "Request Pricing" CTA.

3. **Hero**
   Strong clinical headline, restrained subhead, primary pricing CTA, and a documentation-preview download path.

4. **Trust / product context**
   Explains why the workflow exists and how professional review works.

5. **Who this is for**
   Names the intended buyer types directly.

6. **How ordering works**
   Explains the verified procurement path in simple steps.

7. **Lead capture section**
   The primary request form for pricing, documentation, account setup, and rep follow-up.

8. **Documentation section**
   Shows documentation preview and directs documentation/support needs back into the verified request workflow.

9. **FAQ**
   Clarifies intended audience, documentation access, and review expectations.

10. **Final CTA**
    Reinforces that follow-up starts through the same verified request form.

11. **Footer**
    Legal, documentation, and contact-routing links.

## 5. CTA and Interaction Rules

### Allowed CTA behaviors
- Anchor to the verified request form
- Download the documentation preview asset
- Navigate to internal informational pages such as privacy, terms, or thank-you

### Disallowed CTA behaviors
- Add to cart
- Buy now
- Unlock pricing
- Shop now
- Log in to buy
- Any wording that implies immediate self-serve purchase

### CTA truthfulness requirement
If a button routes to the lead form, the surrounding copy must explain that it **starts a request or follow-up process**, not an instant transaction.

Example:
- "Speak With a Rep" is acceptable only if supporting copy clarifies that rep outreach begins through the same verified request workflow.

## 6. Form Experience

The form should communicate seriousness, not friction for its own sake.

Required fields:
- full name
- professional email
- practice or facility name
- role
- specialty
- state
- estimated monthly volume
- timeline
- professional-use confirmation

Optional:
- notes
- attribution fields

Form behavior requirements:
- inline validation
- keyboard-accessible custom controls
- visible focus treatment
- duplicate submissions handled inline without double conversion behavior
- successful submissions move directly to the thank-you page
- duplicate responses remain on-page with clear status messaging

## 7. Accessibility Requirements

- Provide a skip link and clear main landmark
- Preserve heading hierarchy with a single page-level `h1`
- Ensure anchor links land below the sticky header
- Maintain readable color contrast for muted text, borders, and status states
- Keep mobile navigation and form controls keyboard accessible
- Ensure custom select and checkbox controls participate in focus management correctly

## 8. Copy Guardrails

The voice should be:
- restrained
- clinical
- polished
- operationally clear

Avoid:
- hype language
- wellness language
- unsupported efficacy claims
- exaggerated urgency
- internal implementation language such as "conversion block," "lead scoring," or "routing automation" in user-facing copy

Preferred themes:
- verification
- documentation
- professional review
- account setup
- availability follow-up
- qualified procurement support

## 9. Documentation Positioning

At this stage the downloadable asset is a **documentation preview**, not a final approved product insert.

Design and copy must reflect that honestly:
- the documentation path is visible and useful
- the live launch still requires replacement with an approved final asset
- the page should not imply that an unapproved scaffold file is the final clinical insert

## 10. Technical Mapping

This design corresponds to the current implementation structure:

- `app/page.tsx`
- `app/thank-you/page.tsx`
- `components/landing/*`
- `components/ui/*`
- `app/globals.css`

Backend behavior supporting the design:
- `app/api/lead/route.ts`
- `lib/storage.ts`
- `lib/crm.ts`
- `lib/notifications.ts`
- `lib/tracking.ts`

## 11. Explicit Non-Goals

This design does **not** include:

- product grid browsing
- variants catalog
- retailer-style marketplace UX
- authentication-gated shopping
- customer account dashboard
- cart, checkout, or payment collection

Any future authenticated purchasing workflow should be treated as a separate product phase, not implied by this landing-page design document.