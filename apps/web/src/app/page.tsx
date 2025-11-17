"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { useState, useCallback, memo, useEffect } from "react";
import { Controlled as ControlledZoom } from "react-medium-image-zoom";
import { ThemeToggle } from "@/components/theme-toggle";
import { CTAButton } from "@/components/CTAButton";
import { Search, Image as ImageIcon, Shield } from "lucide-react";
import { useScrollTracking } from "@/lib/analytics";

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
            className="flex items-center space-x-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Image
              src="/images/logo.png"
              alt="Right Click Search Extension Logo"
              width={32}
              height={32}
              className="rounded-lg"
            />
            <span className="font-semibold text-xl">Right Click Search</span>
          </motion.div>
          <div className="flex items-center gap-4">
            <Link
              href="/catalog"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Platform Catalog
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </header>

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
              className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent mb-6"
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

            {/* Hero CTA */}
            <motion.div variants={fadeInUp}>
              <CTAButton showText={false} size="small" />
            </motion.div>
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
    </div>
  );
}
