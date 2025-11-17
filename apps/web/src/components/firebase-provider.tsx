"use client";

import { useEffect } from "react";
import { getAnalytics, logEvent, Analytics } from "firebase/analytics";
import { app } from "@/lib/firebase";

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize Firebase Analytics on client side
    if (typeof window !== "undefined") {
      try {
        const analytics: Analytics = getAnalytics(app);

        // Log page view
        logEvent(analytics, "page_view", {
          page_title: document.title,
          page_location: window.location.href,
        });

        // Log app version
        logEvent(analytics, "app_version", {
          version: "1.0.0",
          platform: "web",
        });
      } catch (error) {
        console.warn("Firebase Analytics failed to initialize:", error);
      }
    }
  }, []);

  return <>{children}</>;
}
