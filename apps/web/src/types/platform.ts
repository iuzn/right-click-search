// Platform context types
export type PlatformContext = "selection" | "image";

// Platform categories
export type PlatformCategory = "search" | "code" | "ai" | "social" | "shopping";

// Platform interface - matches Supabase schema
export interface Platform {
  id: string;
  name: string;
  slug: string;
  category: PlatformCategory;
  url_pattern: string;
  context: PlatformContext[];
  icon_url?: string;
  tags?: string[];
  featured?: boolean;
  supports_prefill?: boolean;
  enabled?: boolean;
  created_at?: string;
  updated_at?: string;
}

// Engine types - matches Extension format
export type EngineContext = "selection" | "image";

export interface EngineInput {
  title: string;
  url: string;
  contexts: EngineContext[];
  icon?: string;
  tags?: string[];
  source?: "catalog";
}

// Form types
export interface PlatformFormData {
  name: string;
  slug: string;
  category: PlatformCategory;
  url_pattern: string;
  context: PlatformContext[];
  icon_url?: string;
  tags?: string[];
  featured?: boolean;
  supports_prefill?: boolean;
  enabled?: boolean;
}
