"use client";

import { useEffect } from "react";
import { getFirebaseApp } from "@/lib/firebase";

/**
 * Initializes Firebase Analytics on the client, once, after the page has gone
 * quiet.
 *
 * Analytics can only run in the browser (it touches `window`/`document`), and
 * `isSupported()` skips environments where measurement isn't available (SSR,
 * some privacy modes), so this never throws during render or on the server.
 *
 * The work is deferred to idle time rather than fired on mount. Measurement is
 * never worth competing with hydration for the main thread, and on a phone that
 * competition is exactly what makes the first few taps feel unresponsive.
 */
export function FirebaseAnalytics() {
  useEffect(() => {
    let cancelled = false;

    const load = () => {
      if (cancelled) return;
      Promise.all([import("firebase/analytics"), getFirebaseApp()])
        .then(async ([{ isSupported, getAnalytics }, app]) => {
          if (cancelled) return;
          if (await isSupported()) getAnalytics(app);
        })
        .catch(() => {
          // Analytics is non-critical; never let it break the app.
        });
    };

    // requestIdleCallback isn't in Safari before 18, hence the timeout fallback.
    let cancelSchedule: () => void;
    if (typeof window.requestIdleCallback === "function") {
      const id = window.requestIdleCallback(load, { timeout: 4000 });
      cancelSchedule = () => window.cancelIdleCallback(id);
    } else {
      const id = window.setTimeout(load, 2000);
      cancelSchedule = () => window.clearTimeout(id);
    }

    return () => {
      cancelled = true;
      cancelSchedule();
    };
  }, []);

  return null;
}
