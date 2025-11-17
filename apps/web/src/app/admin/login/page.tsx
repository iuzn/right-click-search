"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { signInWithEmail } from "@/lib/supabase/auth";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { TestEnv } from "./test-env";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const router = useRouter();

  // Redirect to admin panel if already logged in
  useEffect(() => {
    const checkSession = async () => {
      console.log("🔍 Login page: Checking session...");
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        console.log(
          "📋 Login page: Session data:",
          session ? "✅ Exists" : "❌ No session"
        );

        if (session) {
          console.log("🔄 Login page: Redirecting to /admin/platforms");
          router.push("/admin/platforms");
        }
      } catch (error) {
        console.error("❌ Login page: Session check error:", error);
      } finally {
        setChecking(false);
        console.log("✅ Login page: Check complete, showing form");
      }
    };
    checkSession();
  }, [router]);

  console.log(
    "🎨 Login page: Rendering, checking =",
    checking,
    "loading =",
    loading
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    console.log("📝 Login form: Submit started with email:", email);
    setLoading(true);

    try {
      // Sign in with Supabase Auth
      console.log("🔐 Calling signInWithEmail...");
      const result = await signInWithEmail(email, password);
      console.log("✅ Login successful:", result);

      toast.success("Login successful!");
      router.push("/admin/platforms");
    } catch (error: any) {
      console.error("❌ Login error:", error);

      let errorMessage = "Login failed.";
      if (error.message.includes("Invalid login credentials")) {
        errorMessage = "Invalid email or password.";
      } else if (error.message.includes("Email not confirmed")) {
        errorMessage = "You need to confirm your email address.";
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Show loading if checking session
  if (checking) {
    console.log("⏳ Login page: Still checking session, showing loader");
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400 mx-auto"></div>
          <p className="text-slate-600 dark:text-slate-400">
            Checking...
          </p>
        </div>
      </div>
    );
  }

  console.log("✅ Login page: Showing form");
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Admin Login
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Welcome to the platform management panel
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition"
                placeholder="admin@example.com"
                disabled={loading}
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition"
                placeholder="••••••••"
                disabled={loading}
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-200 dark:border-indigo-800">
            <p className="text-sm text-indigo-800 dark:text-indigo-200">
              <strong>Note:</strong> You are logging in with Supabase Auth. Your email
              address must be in the{" "}
              <code className="px-1 py-0.5 bg-indigo-100 dark:bg-indigo-900 rounded">
                admins
              </code>{" "}
              table.
            </p>
          </div>
        </div>
      </div>
      <TestEnv />
    </div>
  );
}
