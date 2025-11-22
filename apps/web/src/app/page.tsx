"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useCallback, memo, useEffect, useMemo } from "react";
import { Controlled as ControlledZoom } from "react-medium-image-zoom";
import { ThemeToggle } from "@/components/theme-toggle";
import { CTAButton } from "@/components/CTAButton";
import { Search, Image as ImageIcon, Shield, AlertCircle, Loader2, Chrome, Download } from "lucide-react";
import { useScrollTracking } from "@/lib/analytics";
import { usePlatforms } from "@/hooks/usePlatforms";
import { useExtensionBridge } from "@/hooks/useExtensionBridge";
import { PlatformCard } from "@/components/catalog/PlatformCard";
import { CatalogHeader } from "@/components/catalog/CatalogHeader";
import { mapPlatformsToEngines } from "@/lib/mapToEngine";
import { toast } from "sonner";

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] },
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// Memoized Zoom Component with performance optimizations
const OptimizedZoom = memo(function OptimizedZoom({
  isZoomed,
  onZoomChange,
  children,
  zoomImg,
}: {
  isZoomed: boolean;
  onZoomChange: (zoomed: boolean) => void;
  children: React.ReactNode;
  zoomImg?: React.ImgHTMLAttributes<HTMLImageElement>;
}) {
  const handleZoomChange = useCallback(
    (shouldZoom: boolean) => {
      onZoomChange(shouldZoom);
    },
    [onZoomChange]
  );

  return (
    <ControlledZoom
      isZoomed={isZoomed}
      onZoomChange={handleZoomChange}
      zoomImg={zoomImg}
      zoomMargin={20}
    >
      {children}
    </ControlledZoom>
  );
});

export default function Home() {
  // Enable scroll depth tracking
  useScrollTracking();

  // View state management
  const [view, setView] = useState<"landing" | "catalog">("landing");

  // Extension and platforms data
  const { connected, installedEngines, addEngines, removeEngine } = useExtensionBridge();
  const { platforms, loading } = usePlatforms();

  // Set default view based on extension connection
  useEffect(() => {
    if (connected) {
      setView("catalog");
    }
  }, [connected]);

  // Catalog state management
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [context, setContext] = useState<string>("all");

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

  // Check if platform is installed
  const isPlatformInstalled = useCallback((platformUrl: string) => {
    return installedEngines.some(engine => engine.url === platformUrl);
  }, [installedEngines]);

  // Custom engines: created in extension but not in database
  const customEngines = useMemo(() => {
    return installedEngines.filter(engine => {
      return !platforms.some(platform => {
        const platformEngine = mapPlatformsToEngines([platform])[0];
        return platformEngine.url === engine.url;
      });
    });
  }, [installedEngines, platforms]);

  // Toggle platform install/uninstall
  const togglePlatform = async (platform: typeof platforms[0]) => {
    const engine = mapPlatformsToEngines([platform])[0];
    const isInstalled = isPlatformInstalled(engine.url);

    if (isInstalled) {
      // Remove engine
      const res = await removeEngine(engine.url);
      if (res.ok) {
        toast.success(`${platform.name} removed from extension`);
      } else {
        toast.error(res.message || "Failed to remove platform");
      }
    } else {
      // Add engine
      const res = await addEngines([engine]);
      if (res.ok) {
        toast.success(`${platform.name} added to extension!`);
      } else {
        toast.error(res.message || "Failed to add platform");
      }
    }
  };

  // Consolidated zoom states for better performance
  const [zoomStates, setZoomStates] = useState({
    image1: false,
    image2: false,
    image3: false,
  });

  // Optimized zoom change handler
  const handleZoomChange = useCallback(
    (imageKey: keyof typeof zoomStates) => (shouldZoom: boolean) => {
      setZoomStates((prev) => ({ ...prev, [imageKey]: shouldZoom }));
    },
    []
  );

  // Cleanup effect for zoom components
  useEffect(() => {
    // Handle any global event listeners or resources
    const handleKeyDown = (event: KeyboardEvent) => {
      // Close all zooms on Escape key
      if (event.key === "Escape") {
        setZoomStates({
          image1: false,
          image2: false,
          image3: false,
        });
      }
    };

    // Add global escape key handler for better UX
    document.addEventListener("keydown", handleKeyDown);

    // Cleanup function
    return () => {
      document.removeEventListener("keydown", handleKeyDown);

      // Clean up any zoom-related dialogs that might be left open
      const zoomDialogs = document.querySelectorAll("[data-rmiz-modal]");
      zoomDialogs.forEach((dialog) => {
        if (dialog instanceof HTMLDialogElement && dialog.open) {
          dialog.close();
        }
      });
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-xl bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <motion.div
            className="flex items-center space-x-2 md:space-x-3 cursor-pointer min-w-0"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            onClick={() => setView("landing")}
          >
            <Image
              src="/images/logo.png"
              alt="Right Click Search Extension Logo"
              width={32}
              height={32}
              className="rounded-lg flex-shrink-0"
            />
            <span className="font-semibold text-base sm:text-lg md:text-xl whitespace-nowrap">
              Right Click Search
            </span>
          </motion.div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setView(view === "landing" ? "catalog" : "landing")}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
            >
              {view === "landing" ? "Platform Catalog" : "About"}
            </button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content - Conditional rendering based on view */}
      {view === "landing" ? (
        <main role="main">
          {/* Hero Section */}
          <section
            className="container mx-auto px-4 py-16 md:py-24"
            aria-labelledby="hero-heading"
          >
            <motion.div
              className="text-center max-w-4xl mx-auto"
              variants={stagger}
              initial="initial"
              animate="animate"
            >
              <motion.div
                className="flex justify-center mb-8"
                variants={fadeInUp}
              >
                <Image
                  src="/images/logo.png"
                  alt="Right Click Search Extension Logo - Powerful Customizable Right-Click Search Tool"
                  width={120}
                  height={120}
                  className="rounded-3xl"
                  priority
                />
              </motion.div>
              <motion.h1
                id="hero-heading"
                className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-6 pb-2"
                variants={fadeInUp}
              >
                Right Click Search
              </motion.h1>
              <motion.p
                className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto"
                variants={fadeInUp}
              >
                Transform Any Text or Image Into Instant Search Results
              </motion.p>
              <motion.p
                className="text-lg text-muted-foreground/80 mb-12 max-w-3xl mx-auto"
                variants={fadeInUp}
              >
                A powerful, customizable right-click search extension with modern
                design. Select any text or right-click any image to instantly
                search across multiple engines like Google, YouTube, GitHub, and
                more.
              </motion.p>

              {/* Installation Notice - Show if extension not connected */}
              {!connected && (
                <motion.div
                  className="bg-gradient-to-r from-lime-300 via-lime-400 to-lime-500 dark:from-lime-600 dark:via-lime-500 dark:to-lime-600 rounded-2xl p-8 mb-8 shadow-2xl border border-lime-200/50 dark:border-lime-500/30 max-w-2xl mx-auto"
                  variants={fadeInUp}
                >
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <Chrome className="w-8 h-8 text-white drop-shadow-md" />
                    <h2 className="text-2xl font-bold text-white drop-shadow-md">
                      Install Extension to Get Started
                    </h2>
                  </div>
                  <p className="text-white/95 mb-6 drop-shadow">
                    Install the Right Click Search extension to unlock powerful
                    search capabilities across the web.
                  </p>
                  <a
                    href="https://chromewebstore.google.com/detail/right-click-search/fajaapjchmhiacpbkjnkijdlhcbmccdi"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-white dark:bg-slate-50 text-lime-700 dark:text-lime-800 rounded-xl font-semibold text-lg hover:bg-lime-50 dark:hover:bg-white transition-all transform hover:scale-105 hover:shadow-2xl"
                  >
                    <Download className="w-5 h-5" />
                    Install from Chrome Web Store
                  </a>
                </motion.div>
              )}

              {/* Hero CTA - Show if extension connected */}
              {connected && (
                <motion.div variants={fadeInUp}>
                  <CTAButton showText={false} size="small" />
                </motion.div>
              )}
            </motion.div>
          </section>

          {/* Extension Features */}
          <section
            className="container mx-auto px-4 py-16"
            aria-labelledby="features-heading"
          >
            <motion.div
              className="grid gap-16 max-w-6xl mx-auto"
              variants={stagger}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              <h2 id="features-heading" className="sr-only">
                Right Click Search Extension Features
              </h2>

              {/* First Image - Text Search */}
              <motion.article
                className="flex flex-col lg:flex-row-reverse items-center gap-8 lg:gap-16"
                variants={fadeInUp}
              >
                <div className="flex-1 space-y-6">
                  <header className="flex items-center gap-3">
                    <Search
                      className="w-8 h-8 text-blue-500"
                      aria-hidden="true"
                    />
                    <h3 className="text-3xl md:text-4xl font-bold">
                      Smart Right-Click Search
                    </h3>
                  </header>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Select any text on any webpage and right-click to instantly
                    search across multiple engines. Choose from Google, YouTube,
                    GitHub, and unlimited custom search engines.
                  </p>
                  <ul className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 bg-blue-500 rounded-full"
                        aria-hidden="true"
                      ></div>
                      Text selection search
                    </li>
                    <li className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 bg-blue-500 rounded-full"
                        aria-hidden="true"
                      ></div>
                      Multiple engine support
                    </li>
                  </ul>
                </div>
                <div className="flex-1 max-w-lg">
                  <OptimizedZoom
                    isZoomed={zoomStates.image1}
                    onZoomChange={handleZoomChange("image1")}
                    zoomImg={{
                      src: "/images/1.jpg",
                      alt: "Text Search Interface showing right-click search functionality with multiple search engines - High Resolution",
                    }}
                  >
                    <img
                      src="/images/1.jpg"
                      alt="Text Search Interface showing right-click search functionality with multiple search engines"
                      width={500}
                      height={750}
                      className="rounded-3xl cursor-zoom-in w-full h-auto"
                    />
                  </OptimizedZoom>
                </div>
              </motion.article>

              {/* Second Image - Image Search */}
              <motion.article
                className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16"
                variants={fadeInUp}
              >
                <div className="flex-1 space-y-6">
                  <header className="flex items-center gap-3">
                    <ImageIcon
                      className="w-8 h-8 text-purple-500"
                      aria-hidden="true"
                    />
                    <h3 className="text-3xl md:text-4xl font-bold">
                      Image Search
                    </h3>
                  </header>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Right-click any image on the web for reverse image search
                    capabilities. Find similar images, source identification, and
                    visual search across supported image search engines.
                  </p>
                  <ul className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 bg-purple-500 rounded-full"
                        aria-hidden="true"
                      ></div>
                      Reverse image search
                    </li>
                    <li className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 bg-purple-500 rounded-full"
                        aria-hidden="true"
                      ></div>
                      Source identification
                    </li>
                  </ul>
                </div>
                <div className="flex-1 max-w-lg">
                  <OptimizedZoom
                    isZoomed={zoomStates.image2}
                    onZoomChange={handleZoomChange("image2")}
                    zoomImg={{
                      src: "/images/2.jpg",
                      alt: "Image Search Interface showing reverse image search and visual search capabilities - High Resolution",
                    }}
                  >
                    <img
                      src="/images/2.jpg"
                      alt="Image Search Interface showing reverse image search and visual search capabilities"
                      width={500}
                      height={750}
                      className="rounded-3xl cursor-zoom-in w-full h-auto"
                    />
                  </OptimizedZoom>
                </div>
              </motion.article>

              {/* Third Image - Settings & Customization */}
              <motion.article
                className="flex flex-col lg:flex-row-reverse items-center gap-8 lg:gap-16"
                variants={fadeInUp}
              >
                <div className="flex-1 space-y-6">
                  <header className="flex items-center gap-3">
                    <ImageIcon
                      className="w-8 h-8 text-purple-500"
                      aria-hidden="true"
                    />
                    <h3 className="text-3xl md:text-4xl font-bold">
                      Powerful Image Search
                    </h3>
                  </header>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Right-click any image on the web for reverse image search
                    capabilities. Find similar images, source identification, and
                    visual search across supported image search engines.
                  </p>
                  <ul className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 bg-purple-500 rounded-full"
                        aria-hidden="true"
                      ></div>
                      Reverse image search
                    </li>
                    <li className="flex items-center gap-2">
                      <div
                        className="w-2 h-2 bg-purple-500 rounded-full"
                        aria-hidden="true"
                      ></div>
                      Source identification
                    </li>
                  </ul>
                </div>
                <div className="flex-1 max-w-lg">
                  <OptimizedZoom
                    isZoomed={zoomStates.image3}
                    onZoomChange={handleZoomChange("image3")}
                    zoomImg={{
                      src: "/images/3.jpg",
                      alt: "Settings & Customization Interface - High Resolution",
                    }}
                  >
                    <img
                      src="/images/3.jpg"
                      alt="Settings & Customization Interface"
                      width={500}
                      height={750}
                      className="rounded-3xl cursor-zoom-in w-full h-auto"
                    />
                  </OptimizedZoom>
                </div>
              </motion.article>
            </motion.div>
          </section>

          {/* Platform Preview Section - Blurred with mask */}
          {!connected && platforms.length > 0 && (
            <section className="container mx-auto px-4 py-16">
              <motion.div
                className="max-w-6xl mx-auto"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold mb-2">
                    Available Search Platforms
                  </h2>
                  <p className="text-muted-foreground">
                    Preview of platforms you'll have access to
                  </p>
                </div>

                {/* Masked Preview Container */}
                <div className="relative">
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 z-10 bg-gradient-to-b from-transparent via-transparent to-background pointer-events-none" />

                  {/* Top fade */}
                  <div className="absolute top-0 left-0 right-0 h-20 z-10 bg-gradient-to-b from-background to-transparent pointer-events-none" />

                  {/* Disabled Platforms Grid */}
                  <div className="relative max-h-[500px] overflow-hidden">
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 opacity-40 blur-[1px] pointer-events-none select-none">
                      {platforms.slice(0, 24).map((platform) => (
                        <div
                          key={platform.id}
                          className="relative group cursor-not-allowed"
                        >
                          <PlatformCard
                            platform={platform}
                            selected={false}
                            onToggle={() => { }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Call-to-Action Overlay */}
                  <Link
                    href="https://chromewebstore.google.com/detail/right-click-search/fajaapjchmhiacpbkjnkijdlhcbmccdi"
                    className="absolute bottom-0 left-0 right-0 z-20 pb-8 pt-32 bg-gradient-to-t from-background via-background/95 to-transparent">
                    <div className="text-center">
                      <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-lime-400 via-lime-600 to-lime-900 dark:from-lime-600 dark:via-lime-500 dark:to-lime-600 text-white rounded-full font-semibold mb-4 shadow-lg drop-shadow-md hover:opacity-90">
                        <Chrome className="w-5 h-5" />
                        Install Extension to Unlock
                      </div>
                      <p className="text-sm text-muted-foreground max-w-md mx-auto">
                        Access all {platforms.length}+ search platforms by
                        installing the extension
                      </p>
                    </div>
                  </Link>
                </div>
              </motion.div>
            </section>
          )}

          {/* Privacy Section */}
          <section
            className="container mx-auto px-4 py-16 border-t border-border/40"
            aria-labelledby="privacy-heading"
          >
            <motion.div
              className="text-center max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex justify-center mb-6">
                <Shield className="w-16 h-16 text-blue-500" aria-hidden="true" />
              </div>
              <h2
                id="privacy-heading"
                className="text-3xl md:text-4xl font-bold mb-6"
              >
                Privacy-First Extension
              </h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                Your search data never leaves your browser. All settings and
                configurations are stored locally on your device with
                Chrome&apos;s secure storage API.
              </p>
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <article className="space-y-3">
                  <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                    <Shield
                      className="w-6 h-6 text-green-500"
                      aria-hidden="true"
                    />
                  </div>
                  <h3 className="font-semibold">Local Storage</h3>
                  <p className="text-sm text-muted-foreground">
                    All settings stored locally in Chrome
                  </p>
                </article>
                <article className="space-y-3">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto">
                    <Shield
                      className="w-6 h-6 text-blue-500"
                      aria-hidden="true"
                    />
                  </div>
                  <h3 className="font-semibold">No Data Collection</h3>
                  <p className="text-sm text-muted-foreground">
                    Your searches and browsing data stay private
                  </p>
                </article>
                <article className="space-y-3">
                  <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto">
                    <Shield
                      className="w-6 h-6 text-purple-500"
                      aria-hidden="true"
                    />
                  </div>
                  <h3 className="font-semibold">Secure Sync</h3>
                  <p className="text-sm text-muted-foreground">
                    Cross-device sync through Chrome account
                  </p>
                </article>
              </div>
            </motion.div>
          </section>

          {/* Download CTA */}
          <section className="container mx-auto px-4 py-16">
            <CTAButton />
          </section>
        </main>
      ) : (
        /* Catalog View */
        <main className="container mx-auto px-4 py-8 min-h-[calc(100vh-180px)]">
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
              <Loader2 className="h-8 w-8 animate-spin text-lime-500" />
            </div>
          )}

          {/* Platform Grid */}
          {!loading && (
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
                  {filtered.map((platform) => {
                    const engine = mapPlatformsToEngines([platform])[0];
                    const isInstalled = isPlatformInstalled(engine.url);

                    return (
                      <motion.li key={platform.id} variants={fadeInUp}>
                        <PlatformCard
                          platform={platform}
                          selected={isInstalled}
                          onToggle={() => togglePlatform(platform)}
                        />
                      </motion.li>
                    );
                  })}
                </motion.ul>
              )}
            </>
          )}

          {/* Custom Search Engines */}
          {connected && customEngines.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-4">Your Custom Search Engines</h2>
              <p className="text-muted-foreground text-sm mb-6">
                Custom search engines you created in the extension. Manage them from the extension popup.
              </p>

              <motion.ul
                className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6"
                variants={stagger}
                initial="initial"
                animate="animate"
              >
                {customEngines.map((engine) => {
                  const customPlatform: typeof platforms[0] = {
                    id: engine.url,
                    slug: engine.title.toLowerCase().replace(/\s+/g, '-'),
                    name: engine.title,
                    url_pattern: engine.url,
                    context: engine.contexts as any,
                    icon_url: engine.icon && engine.icon.startsWith('http') ? engine.icon : null,
                    category: 'search',
                    tags: engine.tags || [],
                    featured: false,
                    supports_prefill: true,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                  };

                  return (
                    <motion.li key={engine.url} variants={fadeInUp}>
                      <div className="relative">
                        <PlatformCard
                          platform={customPlatform}
                          selected={true}
                          onToggle={() => { }}
                        />
                        <div className="absolute top-2 right-2 rounded-md bg-purple-500 dark:bg-purple-600 px-2 py-0.5 text-xs text-white font-semibold shadow-md">
                          Custom
                        </div>
                      </div>
                    </motion.li>
                  );
                })}
              </motion.ul>
            </div>
          )}

          {/* GitHub Contribution CTA */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-16 mb-8 max-w-3xl mx-auto"
          >
            <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-muted/30 to-muted/10 p-8 text-center">
              {/* Decorative gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-lime-500/5 to-transparent" />

              <div className="relative z-10">
                <h3 className="text-2xl font-bold mb-3">
                  Want to Add More Platforms?
                </h3>
                <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                  Help us grow the catalog! If you'd like to add new search platforms or improve existing ones,
                  we welcome contributions to our open-source repository.
                </p>
                <a
                  href="https://github.com/iuzn/right-click-search/issues/new"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background rounded-xl font-semibold hover:bg-foreground/90 transition-all transform hover:scale-105 shadow-lg"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  Contribute on GitHub
                </a>
              </div>
            </div>
          </motion.section>
        </main>
      )
      }

      {/* Footer */}
      <footer
        className="border-t border-border/40 bg-muted/20"
        role="contentinfo"
      >
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Image
                  src="/images/logo.png"
                  alt="Right Click Search Extension Logo"
                  width={24}
                  height={24}
                  className="rounded"
                />
                <span className="font-semibold">Right Click Search</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Powerful, customizable right-click search extension
              </p>
              <p className="text-sm text-muted-foreground">
                Built with ❤️ by Ibrahim Uzun
              </p>
            </div>

            <nav className="space-y-4" aria-label="Legal pages">
              <h3 className="font-semibold">Legal</h3>
              <div className="space-y-2 text-sm flex flex-col">
                <Link
                  href="/privacy-policy"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Privacy Policy
                </Link>
                <Link
                  href="/terms-of-service"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Terms of Service
                </Link>
              </div>
            </nav>

            <div className="space-y-4">
              <h3 className="font-semibold">Developer</h3>
              <address className="space-y-2 text-sm text-muted-foreground not-italic">
                <p>Ibrahim Uzun</p>
                <p>Chrome Extension Developer</p>
                <p>Istanbul, Turkey</p>
                <Link
                  href="https://x.com/ibrahimuzn"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-400 transition-colors"
                >
                  @ibrahimuzn
                </Link>
              </address>
            </div>
          </div>

          <div className="border-t border-border/40 mt-8 pt-8 text-center">
            <p className="text-sm text-muted-foreground">
              © 2025 Right Click Search Extension. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div >
  );
}
