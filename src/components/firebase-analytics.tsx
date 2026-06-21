"use client";

import { useEffect } from "react";
import { firebaseApp } from "@/lib/firebase";

/**
 * Initializes Firebase Analytics on the client, once, after mount.
 *
 * Analytics can only run in the browser (it touches `window`/`document`), and
 * `isSupported()` skips environments where measurement isn't available (SSR,
 * some privacy modes), so this never throws during render or on the server.
 */
export function FirebaseAnalytics() {
  useEffect(() => {
    let cancelled = false;
    import("firebase/analytics")
      .then(async ({ isSupported, getAnalytics }) => {
        if (cancelled) return;
        if (await isSupported()) getAnalytics(firebaseApp);
      })
      .catch(() => {
        // Analytics is non-critical; never let it break the app.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
