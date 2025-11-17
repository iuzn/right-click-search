import { motion } from "framer-motion";
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
  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onToggle}
      className={cn(
        "group relative w-full rounded-xl border p-4 text-left transition-all",
        selected
          ? "border-indigo-500 ring-2 ring-indigo-200 dark:ring-indigo-900"
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
        ) : (
          <div className="h-8 w-8 rounded-md bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
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

      {/* Select indicator */}
      <div className="pointer-events-none absolute right-3 top-3 rounded-md border border-border bg-background px-2 py-0.5 text-xs opacity-0 transition-opacity group-hover:opacity-100">
        {selected ? "✓ Selected" : "Select"}
      </div>

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
