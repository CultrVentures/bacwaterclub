"use client";

import { useEffect } from "react";

import { captureAttributionFromLocation, trackClientEvent } from "@/lib/tracking";

interface PageViewTrackerProps {
  eventName: string;
}

export function PageViewTracker({ eventName }: PageViewTrackerProps) {
  useEffect(() => {
    captureAttributionFromLocation(window.location.search);
    trackClientEvent(eventName);
  }, [eventName]);

  return null;
}
