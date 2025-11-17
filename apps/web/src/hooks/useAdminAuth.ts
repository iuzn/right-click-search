"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

/**
 * Admin authentication hook using Supabase Auth
 * Only checks authenticated user - no admins table
 */
export function useAdminAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check current session
    const checkAuth = async () => {
      try {
        console.log("🔍 useAdminAuth: Checking session...");
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          console.log("❌ useAdminAuth: No session, redirecting to login");
          router.push("/admin/login");
          return;
        }

        console.log("✅ useAdminAuth: Session found for", session.user.email);
        setUser(session.user);
      } catch (error) {
        console.error("❌ useAdminAuth: Error checking auth:", error);
        router.push("/admin/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("🔔 useAdminAuth: Auth state changed:", event);

      if (event === "SIGNED_OUT") {
        setUser(null);
        router.push("/admin/login");
      } else if (session) {
        setUser(session.user);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  return { user, loading };
}
