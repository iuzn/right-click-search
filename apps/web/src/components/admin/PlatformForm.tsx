import { useState, useEffect } from "react";
import {
  Platform,
  PlatformFormData,
  PlatformCategory,
  PlatformContext,
} from "@/types/platform";
import { IconUpload } from "./IconUpload";
import { Loader2 } from "lucide-react";

interface PlatformFormProps {
  platform?: Platform;
  adminEmail: string;
  onSubmit: (data: PlatformFormData) => Promise<void>;
  onCancel: () => void;
}

/**
 * Platform form component
 * PLATFORM.md Phase 6.3
 */
export function PlatformForm({
  platform,
  adminEmail,
  onSubmit,
  onCancel,
}: PlatformFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<PlatformFormData>({
    name: platform?.name || "",
    slug: platform?.slug || "",
    category: platform?.category || "search",
    url_pattern: platform?.url_pattern || "",
    context: platform?.context || ["selection"],
    icon_url: platform?.icon_url || "",
    tags: platform?.tags || [],
    featured: platform?.featured || false,
    supports_prefill: platform?.supports_prefill ?? true,
    enabled: platform?.enabled ?? true,
  });

  // Auto-generate slug from name
  useEffect(() => {
    if (!platform && formData.name) {
      const slug = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
      setFormData((prev) => ({ ...prev, slug }));
    }
  }, [formData.name, platform]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.url_pattern.includes("%s")) {
      alert("URL pattern must contain %s placeholder");
      return;
    }

    if (formData.context.length === 0) {
      alert("Select at least one context");
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
    } finally {
      setLoading(false);
    }
  };

  const toggleContext = (ctx: PlatformContext) => {
    setFormData((prev) => ({
      ...prev,
      context: prev.context.includes(ctx)
        ? prev.context.filter((c) => c !== ctx)
        : [...prev.context, ctx],
    }));
  };

  const handleTagsChange = (value: string) => {
    const tags = value
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    setFormData((prev) => ({ ...prev, tags }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Platform Name *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          required
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900"
          placeholder="e.g., Google Web"
        />
      </div>

      {/* Slug */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Slug *
        </label>
        <input
          type="text"
          value={formData.slug}
          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          required
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900"
          placeholder="e.g., google-web"
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Category *
        </label>
        <select
          value={formData.category}
          onChange={(e) =>
            setFormData({
              ...formData,
              category: e.target.value as PlatformCategory,
            })
          }
          required
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900"
        >
          <option value="search">Search</option>
          <option value="code">Code</option>
          <option value="ai">AI</option>
          <option value="social">Social</option>
          <option value="shopping">Shopping</option>
        </select>
      </div>

      {/* URL Pattern */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          URL Pattern * (must contain %s)
        </label>
        <input
          type="text"
          value={formData.url_pattern}
          onChange={(e) =>
            setFormData({ ...formData, url_pattern: e.target.value })
          }
          required
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900"
          placeholder="https://www.google.com/search?q=%s"
        />
        <p className="text-xs text-muted-foreground mt-1">
          %s will be replaced with search query
        </p>
      </div>

      {/* Context */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          Context *
        </label>
        <div className="flex gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.context.includes("selection")}
              onChange={() => toggleContext("selection")}
              className="rounded border-border"
            />
            <span className="text-sm">Text Selection</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.context.includes("image")}
              onChange={() => toggleContext("image")}
              className="rounded border-border"
            />
            <span className="text-sm">Image</span>
          </label>
        </div>
      </div>

      {/* Icon Upload */}
      <IconUpload
        currentUrl={formData.icon_url}
        onUploadComplete={(url) => setFormData({ ...formData, icon_url: url })}
        adminEmail={adminEmail}
      />

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">
          Tags (comma separated)
        </label>
        <input
          type="text"
          value={formData.tags?.join(", ") || ""}
          onChange={(e) => handleTagsChange(e.target.value)}
          className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900"
          placeholder="google, web, search"
        />
      </div>

      {/* Toggles */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.featured}
            onChange={(e) =>
              setFormData({ ...formData, featured: e.target.checked })
            }
            className="rounded border-border"
          />
          <span className="text-sm">Featured</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.supports_prefill}
            onChange={(e) =>
              setFormData({ ...formData, supports_prefill: e.target.checked })
            }
            className="rounded border-border"
          />
          <span className="text-sm">Supports Prefill (%s)</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.enabled}
            onChange={(e) =>
              setFormData({ ...formData, enabled: e.target.checked })
            }
            className="rounded border-border"
          />
          <span className="text-sm">Enabled</span>
        </label>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-md border border-border px-4 py-2 text-sm transition-colors hover:bg-muted"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 rounded-md bg-indigo-600 px-4 py-2 text-sm text-white transition-colors hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : platform ? (
            "Update Platform"
          ) : (
            "Create Platform"
          )}
        </button>
      </div>
    </form>
  );
}
