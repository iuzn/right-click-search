"use client";

import { useEffect } from "react";
import { getAnalytics, logEvent } from "firebase/analytics";
import { app } from "@/lib/firebase";

export function useScrollTracking() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    let scrollDepth = 0;
    const milestones = [25, 50, 75, 90, 100];
    const trackedMilestones = new Set<number>();

    const handleScroll = () => {
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const currentDepth = Math.round((scrollTop / docHeight) * 100);

      if (currentDepth > scrollDepth) {
        scrollDepth = currentDepth;

        milestones.forEach((milestone) => {
          if (currentDepth >= milestone && !trackedMilestones.has(milestone)) {
            trackedMilestones.add(milestone);

            try {
              const analytics = getAnalytics(app);
              logEvent(analytics, "scroll_depth", {
                depth_percentage: milestone,
                page: window.location.pathname,
              });
            } catch (error) {
              console.warn("Scroll tracking failed:", error);
            }
          }
        });
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
}

export function logFeatureView(featureName: string) {
  if (typeof window === "undefined") return;

  try {
    const analytics = getAnalytics(app);
    logEvent(analytics, "feature_view", {
      feature_name: featureName,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.warn("Feature view tracking failed:", error);
  }
}
