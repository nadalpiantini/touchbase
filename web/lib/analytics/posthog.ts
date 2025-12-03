// ============================================================
// TouchBase Academy - PostHog Analytics Client
// ============================================================

import posthog from "posthog-js";

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

export { posthog };

