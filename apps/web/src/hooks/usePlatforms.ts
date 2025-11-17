import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { Platform } from "@/types/platform";

/**
 * Fetches platform data from Supabase
 * PLATFORM.md Phase 4.4
 */
export function usePlatforms() {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlatforms = async () => {
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from("platforms")
          .select("*")
          .eq("enabled", true)
          .order("featured", { ascending: false })
          .order("name", { ascending: true });

        if (fetchError) throw fetchError;

        setPlatforms(data || []);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load platform data"
        );
        setPlatforms([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPlatforms();
  }, []);

  return { platforms, loading, error };
}
