"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { usePlatforms } from "@/hooks/usePlatforms";
import { useExtensionBridge } from "@/hooks/useExtensionBridge";
import { PlatformCard } from "@/components/catalog/PlatformCard";
import { CatalogHeader } from "@/components/catalog/CatalogHeader";
import { mapPlatformsToEngines } from "@/lib/mapToEngine";

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3 },
};

/**
 * Catalog page - Platform list and extension integration
 * PLATFORM.md Phase 4.1 (lines 374-512)
 */
export default function CatalogPage() {
  const { platforms, loading, error } = usePlatforms();
  const { connected, addEngines } = useExtensionBridge();

  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [context, setContext] = useState<string>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Filter platforms
  const filtered = useMemo(() => {
    return platforms.filter((p) => {
      const matchQuery =
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.tags || []).some((t) =>
          t.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchCategory = category === "all" || p.category === category;
      const matchContext =
        context === "all" || p.context.includes(context as any);

      return matchQuery && matchCategory && matchContext;
    });
  }, [platforms, searchQuery, category, context]);

  // Toggle selection
  const toggle = (id: string) => {
    setSelected((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });
  };

  // Add selected platforms to extension
  const addSelected = async () => {
    const selectedPlatforms = filtered.filter((p) => selected.has(p.id));
    const engines = mapPlatformsToEngines(selectedPlatforms);

    const res = await addEngines(engines);

    if (res.ok) {
      toast.success(`${selectedPlatforms.length} platforms added to extension!`);
      setSelected(new Set());
    } else {
      toast.error(res.message || "Error occurred while adding to extension");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header Navigation */}
      <header className="border-b border-border/40 backdrop-blur-xl bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Home
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Extension Connection Banner */}
        {!connected && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 rounded-lg border border-orange-200 dark:border-orange-900 bg-orange-50 dark:bg-orange-950/30 p-3 text-sm flex items-start gap-2"
          >
            <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-orange-800 dark:text-orange-200">
                <strong>Extension not connected.</strong> To add platforms,
                you need to install the Chrome Extension.
              </p>
              <a
                href="https://chromewebstore.google.com/detail/right-click-search/fajaapjchmhiacpbkjnkijdlhcbmccdi"
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-600 dark:text-orange-400 underline hover:no-underline mt-1 inline-block"
              >
                Install from Chrome Web Store →
              </a>
            </div>
          </motion.div>
        )}

        {/* Header & Filters */}
        <CatalogHeader
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          category={category}
          onCategoryChange={setCategory}
          context={context}
          onContextChange={setContext}
        />

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/30 p-4 text-sm text-red-800 dark:text-red-200">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Platform Grid */}
        {!loading && !error && (
          <>
            {filtered.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  No platforms found. Try changing your filters.
                </p>
              </div>
            ) : (
              <motion.ul
                className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6"
                variants={stagger}
                initial="initial"
                animate="animate"
              >
                {filtered.map((platform) => (
                  <motion.li key={platform.id} variants={fadeInUp}>
                    <PlatformCard
                      platform={platform}
                      selected={selected.has(platform.id)}
                      onToggle={() => toggle(platform.id)}
                    />
                  </motion.li>
                ))}
              </motion.ul>
            )}
          </>
        )}

        {/* Bottom Action Bar */}
        {selected.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed inset-x-0 bottom-0 z-10 border-t border-border bg-background/80 backdrop-blur-xl"
          >
            <div className="container mx-auto flex items-center justify-between px-4 py-3">
              <div className="text-sm text-foreground">
                <strong>{selected.size}</strong> platforms selected
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelected(new Set())}
                  className="rounded-md border border-border px-4 py-2 text-sm transition-colors hover:bg-muted"
                >
                  Clear
                </button>
                <button
                  onClick={addSelected}
                  disabled={!connected}
                  className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white transition-colors hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add to Extension
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
