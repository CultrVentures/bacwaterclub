import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const pushMock = vi.fn();
const trackingMock = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

vi.mock("@/lib/tracking", () => ({
  captureAttributionFromLocation: () => ({
    utm_source: "",
    utm_medium: "",
    utm_campaign: "",
    utm_content: "",
    utm_term: "",
    reddit_click_id: "",
    landing_page_variant: "hcp-editorial-v1",
  }),
  getEmptyAttribution: () => ({
    utm_source: "",
    utm_medium: "",
    utm_campaign: "",
    utm_content: "",
    utm_term: "",
    reddit_click_id: "",
    landing_page_variant: "hcp-editorial-v1",
  }),
  trackClientEvent: (...args: unknown[]) => trackingMock(...args),
}));

import { LeadCaptureForm } from "@/components/landing/lead-capture-form";

async function completeValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Full Name"), "Dr. Jordan Hale");
  await user.type(
    screen.getByLabelText("Professional Email"),
    "jhale@northshoreclinic.com",
  );
  await user.type(screen.getByLabelText("Practice / Facility Name"), "Northshore Clinic");

  await user.click(screen.getByLabelText("Role"));
  await user.click(await within(await screen.findByRole("listbox")).findByText("Physician"));

  await user.click(screen.getByLabelText("Specialty"));
  await user.click(await within(await screen.findByRole("listbox")).findByText("Aesthetics"));

  await user.click(screen.getByLabelText("State"));
  await user.click(await within(await screen.findByRole("listbox")).findByText("CA"));

  await user.click(screen.getByLabelText("Estimated Monthly Volume"));
  await user.click(
    await within(await screen.findByRole("listbox")).findByText("11-50 units / month"),
  );

  await user.click(screen.getByLabelText("Timeline / Urgency"));
  await user.click(await within(await screen.findByRole("listbox")).findByText("This month"));

  await user.type(
    screen.getByLabelText("Notes / Sourcing Need"),
    "Need pricing and availability for recurring clinic use.",
  );

  await user.click(
    screen.getByLabelText(
      /I confirm I am a licensed clinician or authorized healthcare purchaser/i,
    ),
  );
}

describe("LeadCaptureForm", () => {
  beforeEach(() => {
    pushMock.mockReset();
    trackingMock.mockReset();
    global.fetch = vi.fn();
    vi.useRealTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("navigates straight to the thank-you page after a successful submission", async () => {
    const user = userEvent.setup();
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        message: "Request received",
        leadScore: {
          score: 81,
          bucket: "high",
        },
      }),
    } as Response);

    render(<LeadCaptureForm />);

    await completeValidForm(user);
    await user.click(screen.getByRole("button", { name: "Submit Request" }));

    await waitFor(
      () => {
        expect(pushMock).toHaveBeenCalledWith("/thank-you");
      },
      { timeout: 100 },
    );
  });

  it("keeps duplicate submissions inline instead of redirecting again", async () => {
    const user = userEvent.setup();
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      status: 202,
      json: async () => ({
        success: true,
        duplicate: true,
        message: "Request already received and currently under review.",
      }),
    } as Response);

    render(<LeadCaptureForm />);

    await completeValidForm(user);
    await user.click(screen.getByRole("button", { name: "Submit Request" }));

    expect(await screen.findByText("Request already received")).toBeInTheDocument();

    await new Promise((resolve) => {
      setTimeout(resolve, 1_100);
    });

    expect(pushMock).not.toHaveBeenCalled();
  });
});
