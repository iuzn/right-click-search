import { Platform, EngineInput } from "@/types/platform";

/**
 * Converts platform object to Extension EngineInput format
 * PLATFORM.md lines 288-301
 */
export function mapToEngine(platform: Platform): EngineInput {
  return {
    title: platform.name,
    url: platform.url_pattern,
    contexts: platform.context.length ? platform.context : ["selection"],
    icon: platform.icon_url,
    tags: platform.tags ?? [],
    source: "catalog",
  };
}

/**
 * Converts multiple platforms
 */
export function mapPlatformsToEngines(platforms: Platform[]): EngineInput[] {
  return platforms.map(mapToEngine);
}
