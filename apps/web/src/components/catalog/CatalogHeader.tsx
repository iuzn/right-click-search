import { Search } from "lucide-react";
import { PlatformCategory, PlatformContext } from "@/types/platform";

interface CatalogHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  category: string;
  onCategoryChange: (value: string) => void;
  context: string;
  onContextChange: (value: string) => void;
}

/**
 * Catalog header and filters
 * PLATFORM.md Phase 4.3
 */
export function CatalogHeader({
  searchQuery,
  onSearchChange,
  category,
  onCategoryChange,
  context,
  onContextChange,
}: CatalogHeaderProps) {
  return (
    <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <h1 className="text-2xl font-semibold text-foreground">
        Platform Catalog
      </h1>

      <div className="flex flex-col sm:flex-row gap-2">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search (name/tag)..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full sm:w-64 rounded-md border border-border bg-background px-3 py-2 pl-9 text-sm outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900"
          />
        </div>

        {/* Category Filter */}
        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900"
        >
          <option value="all">All Categories</option>
          <option value="search">🔍 Search</option>
          <option value="code">💻 Code</option>
          <option value="ai">🤖 AI</option>
          <option value="social">👥 Social</option>
          <option value="shopping">🛒 Shopping</option>
        </select>

        {/* Context Filter */}
        <select
          value={context}
          onChange={(e) => onContextChange(e.target.value)}
          className="rounded-md border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-900"
        >
          <option value="all">All Contexts</option>
          <option value="selection">📝 Text</option>
          <option value="image">🖼️ Image</option>
        </select>
      </div>
    </header>
  );
}
