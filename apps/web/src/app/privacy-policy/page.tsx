"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] },
};

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-xl bg-background/80 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <motion.div
            className="flex items-center space-x-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/">
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div className="flex items-center space-x-3">
              <Image
                src="/images/logo.png"
                alt="Right Click Search Extension Logo"
                width={32}
                height={32}
                className="rounded-lg"
              />
              <span className="font-semibold text-xl">Right Click Search</span>
            </div>
          </motion.div>
          <ThemeToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-16 max-w-4xl">
        <motion.div
          initial="initial"
          animate="animate"
          variants={{
            animate: {
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
        >
          {/* Header */}
          <motion.div className="text-center mb-16" variants={fadeInUp}>
            <div className="flex justify-center mb-6">
              <Shield className="w-16 h-16 text-blue-500" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Privacy Policy
            </h1>
            <p className="text-xl text-muted-foreground">
              Your privacy is fundamental to how Right Click Search Extension
              operates
            </p>
          </motion.div>

          {/* Content */}
          <motion.div
            className="prose prose-neutral dark:prose-invert max-w-none"
            variants={fadeInUp}
          >
            <div className="bg-card border border-border rounded-lg p-8 mb-8">
              <h2 className="text-2xl font-bold mb-4 text-green-600 dark:text-green-400">
                🔒 Privacy-First Promise
              </h2>
              <p className="text-lg leading-relaxed">
                Right Click Search Extension is designed with privacy as its
                foundation. Unlike other browser extensions, we believe your
                search data and browsing habits should stay private and never
                leave your browser.
              </p>
            </div>

            <motion.section className="mb-12" variants={fadeInUp}>
              <h2 className="text-3xl font-bold mb-6">
                What We Don&apos;t Collect
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-3 text-red-600 dark:text-red-400">
                    ❌ No Personal Data
                  </h3>
                  <p className="text-muted-foreground">
                    We don&apos;t collect names, emails, phone numbers, or any
                    personal information.
                  </p>
                </div>
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-3 text-red-600 dark:text-red-400">
                    ❌ No Search History
                  </h3>
                  <p className="text-muted-foreground">
                    Your search queries and selected text never leave your
                    browser.
                  </p>
                </div>
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-3 text-red-600 dark:text-red-400">
                    ❌ No Usage Analytics
                  </h3>
                  <p className="text-muted-foreground">
                    We don&apos;t track how you use the extension or what
                    features you access.
                  </p>
                </div>
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-3 text-red-600 dark:text-red-400">
                    ❌ No Browsing History
                  </h3>
                  <p className="text-muted-foreground">
                    We don&apos;t access or store your browsing history or
                    habits.
                  </p>
                </div>
              </div>
            </motion.section>

            <motion.section className="mb-12" variants={fadeInUp}>
              <h2 className="text-3xl font-bold mb-6">
                How Right Click Search Extension Works
              </h2>
              <div className="space-y-6">
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-3 text-blue-600 dark:text-blue-400">
                    🌐 Browser-Based Processing
                  </h3>
                  <p className="leading-relaxed">
                    All text selection and search functionality happens directly
                    in your browser using Chrome&apos;s extension APIs. Your
                    selected text is processed locally and sent to search
                    engines only when you explicitly choose to search.
                  </p>
                </div>
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-3 text-blue-600 dark:text-blue-400">
                    🔒 Local Storage Only
                  </h3>
                  <p className="leading-relaxed">
                    Your search engine configurations and settings are stored
                    only in Chrome&apos;s local storage. Nothing is uploaded to
                    any servers or cloud services. Your settings sync across
                    devices through your Chrome account.
                  </p>
                </div>
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-3 text-blue-600 dark:text-blue-400">
                    🚫 No Third-Party Tracking
                  </h3>
                  <p className="leading-relaxed">
                    Right Click Search Extension doesn&apos;t include any
                    third-party analytics, advertising, or tracking SDKs. We
                    don&apos;t use Google Analytics, Facebook SDK, or any
                    similar services.
                  </p>
                </div>
              </div>
            </motion.section>

            <motion.section className="mb-12" variants={fadeInUp}>
              <h2 className="text-3xl font-bold mb-6">
                Permissions We Request
              </h2>
              <div className="space-y-4">
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-2">
                    🌐 Active Tab Access
                  </h3>
                  <p className="text-muted-foreground">
                    Required to detect text selection and provide right-click
                    context menu options. We only access the currently active
                    tab when you right-click, and we never read or store your
                    browsing content.
                  </p>
                </div>
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-2">
                    💾 Storage Access
                  </h3>
                  <p className="text-muted-foreground">
                    Used to save your custom search engine configurations
                    locally in Chrome. This data never leaves your browser and
                    syncs securely through your Chrome account.
                  </p>
                </div>
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-2">
                    🎯 Context Menu Access
                  </h3>
                  <p className="text-muted-foreground">
                    Allows the extension to add search options to Chrome&apos;s
                    right-click context menu. This permission is essential for
                    the extension&apos;s core functionality.
                  </p>
                </div>
              </div>
            </motion.section>

            <motion.section className="mb-12" variants={fadeInUp}>
              <h2 className="text-3xl font-bold mb-6">About the Developer</h2>
              <div className="bg-card border border-border rounded-lg p-6">
                <p className="leading-relaxed mb-4">
                  Right Click Search Extension is developed by{" "}
                  <strong>Ibrahim Uzun</strong>, an individual developer based
                  in Istanbul, Turkey. This is not a corporate product with
                  complex privacy policies and data collection schemes.
                </p>
                <p className="leading-relaxed mb-4">
                  As an individual developer, I believe in creating software
                  that respects user privacy and works exactly as advertised.
                  Right Click Search Extension reflects my personal commitment
                  to privacy-first browser extension development.
                </p>
                <p className="leading-relaxed">
                  If you have any questions about this privacy policy or how
                  Right Click Search Extension works, you can contact me
                  directly through the Chrome Web Store or via social media.
                </p>
              </div>
            </motion.section>

            <motion.section className="mb-12" variants={fadeInUp}>
              <h2 className="text-3xl font-bold mb-6">
                Technical Implementation
              </h2>
              <div className="space-y-4">
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-2">
                    🛠️ Chrome Extension Technologies
                  </h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>
                      • <strong>Chrome Storage API:</strong> For secure local
                      storage of user configurations
                    </li>
                    <li>
                      • <strong>Context Menu API:</strong> For adding
                      right-click search options
                    </li>
                    <li>
                      • <strong>Tabs API:</strong> For accessing selected text
                      and opening search results
                    </li>
                    <li>
                      • <strong>Manifest V3:</strong> Modern Chrome extension
                      standard for security and performance
                    </li>
                  </ul>
                </div>
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="text-lg font-semibold mb-2">
                    🌐 Minimal Network Usage
                  </h3>
                  <p className="text-muted-foreground">
                    Right Click Search Extension only makes network requests
                    when you explicitly perform a search. All configuration and
                    settings are stored locally in your browser.
                  </p>
                </div>
              </div>
            </motion.section>

            <motion.section className="mb-12" variants={fadeInUp}>
              <h2 className="text-3xl font-bold mb-6">
                Changes to This Policy
              </h2>
              <div className="bg-card border border-border rounded-lg p-6">
                <p className="leading-relaxed mb-4">
                  Given that Right Click Search Extension doesn&apos;t collect
                  any personal data, there&apos;s very little that could change
                  about this privacy policy. However, if significant changes are
                  made to the extension that would affect your privacy, this
                  policy will be updated accordingly.
                </p>
                <p className="leading-relaxed">
                  Any updates will be reflected on this page and in the
                  extension&apos;s Chrome Web Store listing. The extension will
                  never start collecting data without explicit user consent and
                  clear notification.
                </p>
              </div>
            </motion.section>

            <motion.section className="mb-12" variants={fadeInUp}>
              <h2 className="text-3xl font-bold mb-6">Questions?</h2>
              <div className="bg-card border border-border rounded-lg p-6">
                <p className="leading-relaxed mb-4">
                  If you have any questions about this privacy policy or Right
                  Click Search Extension&apos;s privacy practices, please
                  don&apos;t hesitate to reach out.
                </p>
                <p className="text-muted-foreground">
                  <strong>Developer:</strong> Ibrahim Uzun
                  <br />
                  <strong>Contact:</strong> Available through Chrome Web Store
                  reviews or social media
                  <br />
                  <strong>Last Updated:</strong> October 2025
                </p>
              </div>
            </motion.section>
          </motion.div>

          {/* Back to Home */}
          <motion.div className="text-center mt-16" variants={fadeInUp}>
            <Link href="/">
              <Button size="lg" variant="outline">
                <ArrowLeft className="mr-2 w-4 h-4" />
                Back to Home
              </Button>
            </Link>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
