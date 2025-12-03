// ============================================================
// TouchBase Academy - PostHog Analytics Client
// ============================================================

import posthog from "posthog-js";
import { AnalyticsEvents, AnalyticsEventProperties, AnalyticsEventName } from "./events";

let initialized = false;

export function initPosthog() {
  if (typeof window === "undefined" || initialized) return;

  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const host = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com";

  if (!key) {
    if (process.env.NODE_ENV === "development") {
      console.warn("PostHog API key not found - analytics disabled");
    }
    return;
  }

  posthog.init(key, {
    api_host: host,
    capture_pageview: true,
    capture_pageleave: true,
    loaded: (posthog) => {
      if (process.env.NODE_ENV === "development") {
        console.log("PostHog initialized");
      }
    },
  });

  initialized = true;
}

/**
 * Track an analytics event
 */
export function trackEvent(
  eventName: AnalyticsEventName,
  properties?: AnalyticsEventProperties
): void {
  if (typeof window === "undefined") return;

  const posthog = (window as any).posthog;
  if (!posthog) {
    console.warn("PostHog not initialized");
    return;
  }

  posthog.capture(eventName, properties);
}

/**
 * Identify a user
 */
export function identifyUser(userId: string, properties?: Record<string, any>): void {
  if (typeof window === "undefined") return;

  const posthog = (window as any).posthog;
  if (!posthog) {
    console.warn("PostHog not initialized");
    return;
  }

  posthog.identify(userId, properties);
}

/**
 * Set user properties
 */
export function setUserProperties(properties: Record<string, any>): void {
  if (typeof window === "undefined") return;

  const posthog = (window as any).posthog;
  if (!posthog) {
    console.warn("PostHog not initialized");
    return;
  }

  posthog.setPersonProperties(properties);
}

/**
 * Reset user session (on logout)
 */
export function resetUser(): void {
  if (typeof window === "undefined") return;

  const posthog = (window as any).posthog;
  if (!posthog) {
    console.warn("PostHog not initialized");
    return;
  }

  posthog.reset();
}

export { posthog };

