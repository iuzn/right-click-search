import { motion } from "framer-motion";
import { Check, Download } from "lucide-react";
import { Platform } from "@/types/platform";
import { cn } from "@/lib/utils";

interface PlatformCardProps {
  platform: Platform;
  selected: boolean;
  onToggle: () => void;
}

/**
 * Platform card component
 * PLATFORM.md Phase 4.2
 */
export function PlatformCard({
  platform,
  selected,
  onToggle,
}: PlatformCardProps) {
  // Extract domain from url_pattern for favicon
  const getDomainFromUrl = (urlPattern: string): string => {
    try {
      // Replace placeholders with dummy values to create a valid URL
      const dummyUrl = urlPattern
        .replace("{searchTerms}", "test")
        .replace("{url}", "test");
      const url = new URL(dummyUrl);
      return url.hostname;
    } catch {
      // If parsing fails, try to extract domain manually
      const match = urlPattern.match(/(?:https?:\/\/)?(?:www\.)?([^\/\?]+)/);
      return match ? match[1] : "";
    }
  };

  const domain = getDomainFromUrl(platform.url_pattern);
  const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;

  return (
    <motion.button
      whileTap={{ scale: 0.98 }}
      onClick={onToggle}
      className={cn(
        "group relative w-full rounded-2xl border p-4 text-left transition-all cursor-pointer",
        selected
          ? "border-lime-500 ring-2 ring-lime-200 dark:ring-lime-900"
          : "border-border hover:border-slate-300 dark:hover:border-slate-600"
      )}
    >
      {/* Platform Icon & Info */}
      <div className="mb-3 flex items-center gap-3">
        {platform.icon_url ? (
          <img
            src={platform.icon_url}
            alt={`${platform.name} icon`}
            className="h-8 w-8 rounded-md object-cover"
          />
        ) : domain ? (
          <img
            src={faviconUrl}
            alt={`${platform.name} icon`}
            className="h-8 w-8 rounded-md object-cover"
            onError={(e) => {
              // Fallback to initial letter if favicon fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = "none";
              const fallback = target.nextElementSibling as HTMLElement;
              if (fallback) fallback.style.display = "flex";
            }}
          />
        ) : null}
        {/* Fallback to first letter */}
        {!platform.icon_url && (
          <div
            className="h-8 w-8 rounded-md bg-gradient-to-br from-lime-400 to-lime-600 flex items-center justify-center text-white font-bold text-sm"
            style={{ display: domain ? "none" : "flex" }}
          >
            {platform.name.charAt(0).toUpperCase()}
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="truncate font-medium text-foreground">
            {platform.name}
          </div>
          <div className="truncate text-xs text-muted-foreground">
            {platform.url_pattern}
          </div>
        </div>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap gap-1">
        {platform.context.map((ctx) => (
          <span
            key={ctx}
            className="rounded bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-xs text-slate-700 dark:text-slate-300"
          >
            {ctx}
          </span>
        ))}

        {platform.featured && (
          <span className="rounded bg-amber-100 dark:bg-amber-900 px-2 py-0.5 text-xs text-amber-700 dark:text-amber-300">
            featured
          </span>
        )}

        {!platform.supports_prefill && (
          <span className="rounded bg-orange-100 dark:bg-orange-900 px-2 py-0.5 text-xs text-orange-700 dark:text-orange-300">
            no prefill
          </span>
        )}
      </div>

      {/* Select/Install indicator - Bottom right, always visible when installed */}
      {selected ? (
        <div className="absolute right-3 bottom-3 rounded-md bg-lime-500 dark:bg-lime-600 px-2 py-1 text-xs text-white font-semibold shadow-md flex items-center gap-1">
          <Check className="w-3 h-3" />
          Installed
        </div>
      ) : (
        <div className="pointer-events-none absolute right-3 bottom-3 rounded-md border border-border bg-background px-2 py-1 text-xs opacity-0 transition-opacity group-hover:opacity-100 flex items-center gap-1">
          <Download className="w-3 h-3" />
          Install
        </div>
      )}

      {/* Tags (optional, shown on hover) */}
      {platform.tags && platform.tags.length > 0 && (
        <div className="mt-2 opacity-0 transition-opacity group-hover:opacity-100">
          <div className="flex flex-wrap gap-1">
            {platform.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-[10px] text-muted-foreground">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </motion.button>
  );
}
