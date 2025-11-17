"use client";

import { useAdminAuth } from "@/hooks/useAdminAuth";
import { signOut } from "@/lib/supabase/auth";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, loading } = useAdminAuth();
  const router = useRouter();

  console.log("🎨 Admin Layout: Pathname =", pathname);

  // Bypass layout for login page
  if (pathname === "/admin/login") {
    console.log("✅ Admin Layout: Login page, rendering without layout");
    return <>{children}</>;
  }

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Logged out");
      router.push("/admin/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Error occurred while logging out");
    }
  };

  // Show spinner during loading
  if (loading) {
    console.log("⏳ Admin Layout: Loading auth state...");
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 dark:border-indigo-400 mx-auto"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't show content if no user (middleware will redirect anyway)
  if (!user) {
    console.log("❌ Admin Layout: No user, rendering empty");
    return null;
  }

  console.log("✅ Admin Layout: User authenticated, showing layout");

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link
                href="/admin/platforms"
                className="text-xl font-bold text-slate-900 dark:text-white"
              >
                Admin Panel
              </Link>
              <nav className="hidden md:flex space-x-4">
                <Link
                  href="/admin/platforms"
                  className="px-3 py-2 rounded-md text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                >
                  Platforms
                </Link>
              </nav>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {user?.email}
              </span>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="text-slate-700 dark:text-slate-300"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
