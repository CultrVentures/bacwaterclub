"use client";

import { useEffect } from "react";

import { trackClientEvent } from "@/lib/tracking";

export function ThankYouTracker() {
  useEffect(() => {
    trackClientEvent("thank_you_page_view");
  }, []);

  return null;
}
