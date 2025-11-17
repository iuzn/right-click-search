"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { getAnalytics, logEvent } from "firebase/analytics";
import { app } from "@/lib/firebase";

interface CTAButtonProps {
  className?: string;
  showText?: boolean;
  size?: "small" | "medium" | "large";
}

const handleAppStoreClick = () => {
  if (typeof window !== "undefined") {
    try {
      const analytics = getAnalytics(app);
      logEvent(analytics, "cta_click", {
        button_type: "chrome_web_store_install",
        source: "landing_page",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.warn("Analytics event failed:", error);
    }
  }
};

interface CTAButtonProps {
  className?: string;
  showText?: boolean;
  size?: "small" | "medium" | "large";
}

export const CTAButton = ({
  className = "",
  showText = true,
  size = "medium",
}: CTAButtonProps) => {
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: [0.6, -0.05, 0.01, 0.99] },
  };

  const sizeClasses = {
    small: "max-w-md",
    medium: "max-w-2xl",
    large: "max-w-4xl",
  };

  return (
    <motion.div
      className={`text-center mx-auto ${sizeClasses[size]} ${className}`}
      variants={fadeInUp}
      initial="initial"
      whileInView="animate"
      viewport={{ once: true }}
    >
      {showText && (
        <>
          <motion.h2
            className="text-2xl md:text-3xl font-bold mb-4"
            variants={fadeInUp}
          >
            Install Right Click Search Extension
          </motion.h2>
          <motion.p
            className="text-lg text-muted-foreground mb-8"
            variants={fadeInUp}
          >
            Transform your browsing experience with powerful right-click search
            capabilities
          </motion.p>
        </>
      )}
      <motion.div className="flex justify-center" variants={fadeInUp}>
        <a
          href="https://chromewebstore.google.com/detail/right-click-search/EXTENSION_ID"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block transition-transform hover:scale-105 active:scale-95 scale-[0.75] sm:scale-100 px-3 py-3 bg-white rounded-xl shadow-lg border-neutral-200 dark:border-neutral-800"
          aria-label="Install Right Click Search Extension on Chrome Web Store"
          onClick={handleAppStoreClick}
        >
          <Image
            src="/cws.svg"
            alt="Chrome Web Store"
            width={253}
            height={85}
            className="w-full h-full object-cover rounded"
          />
        </a>
      </motion.div>
    </motion.div>
  );
};
