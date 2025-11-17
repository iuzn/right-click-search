import { createClient } from "@supabase/supabase-js";

/**
 * Seed script for initial platforms
 * PLATFORM.md Phase 7.1 (lines 644-664)
 *
 * Run: bun run scripts/seed-platforms.ts
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Missing Supabase credentials in environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const platforms = [
  {
    name: "Google Web",
    slug: "google-web",
    category: "search",
    url_pattern: "https://www.google.com/search?q=%s",
    context: ["selection"],
    tags: ["google", "web"],
    featured: true,
    supports_prefill: true,
    enabled: true,
  },
  {
    name: "Google Images",
    slug: "google-images",
    category: "search",
    url_pattern: "https://www.google.com/search?tbm=isch&q=%s",
    context: ["image", "selection"],
    tags: ["google", "images"],
    featured: false,
    supports_prefill: true,
    enabled: true,
  },
  {
    name: "GitHub Code",
    slug: "github-code",
    category: "code",
    url_pattern: "https://github.com/search?type=code&q=%s",
    context: ["selection"],
    tags: ["github", "code"],
    featured: true,
    supports_prefill: true,
    enabled: true,
  },
  {
    name: "GitHub Repos",
    slug: "github-repos",
    category: "code",
    url_pattern: "https://github.com/search?type=repositories&q=%s",
    context: ["selection"],
    tags: ["github", "repos"],
    featured: false,
    supports_prefill: true,
    enabled: true,
  },
  {
    name: "Stack Overflow",
    slug: "stackoverflow",
    category: "code",
    url_pattern: "https://stackoverflow.com/search?q=%s",
    context: ["selection"],
    tags: ["stack", "dev"],
    featured: false,
    supports_prefill: true,
    enabled: true,
  },
  {
    name: "MDN Web Docs",
    slug: "mdn",
    category: "code",
    url_pattern: "https://developer.mozilla.org/en-US/search?q=%s",
    context: ["selection"],
    tags: ["docs", "web"],
    featured: false,
    supports_prefill: true,
    enabled: true,
  },
  {
    name: "NPM",
    slug: "npm",
    category: "code",
    url_pattern: "https://www.npmjs.com/search?q=%s",
    context: ["selection"],
    tags: ["npm", "packages"],
    featured: false,
    supports_prefill: true,
    enabled: true,
  },
  {
    name: "LinkedIn",
    slug: "linkedin",
    category: "social",
    url_pattern: "https://www.linkedin.com/search/results/all/?keywords=%s",
    context: ["selection"],
    tags: ["linkedin", "people"],
    featured: false,
    supports_prefill: true,
    enabled: true,
  },
  {
    name: "Twitter/X",
    slug: "x",
    category: "social",
    url_pattern: "https://twitter.com/search?q=%s&src=typed_query",
    context: ["selection"],
    tags: ["twitter", "x"],
    featured: false,
    supports_prefill: true,
    enabled: true,
  },
  {
    name: "YouTube",
    slug: "youtube",
    category: "search",
    url_pattern: "https://www.youtube.com/results?search_query=%s",
    context: ["selection"],
    tags: ["video"],
    featured: false,
    supports_prefill: true,
    enabled: true,
  },
  {
    name: "Amazon",
    slug: "amazon",
    category: "shopping",
    url_pattern: "https://www.amazon.com/s?k=%s",
    context: ["selection"],
    tags: ["amazon", "shopping"],
    featured: false,
    supports_prefill: true,
    enabled: true,
  },
  {
    name: "DuckDuckGo",
    slug: "ddg",
    category: "search",
    url_pattern: "https://duckduckgo.com/?q=%s",
    context: ["selection"],
    tags: ["privacy", "search"],
    featured: false,
    supports_prefill: true,
    enabled: true,
  },
  {
    name: "Bing",
    slug: "bing",
    category: "search",
    url_pattern: "https://www.bing.com/search?q=%s",
    context: ["selection"],
    tags: ["bing"],
    featured: false,
    supports_prefill: true,
    enabled: true,
  },
  {
    name: "Reddit",
    slug: "reddit",
    category: "social",
    url_pattern: "https://www.reddit.com/search/?q=%s",
    context: ["selection"],
    tags: ["reddit"],
    featured: false,
    supports_prefill: true,
    enabled: true,
  },
  {
    name: "ArXiv",
    slug: "arxiv",
    category: "ai",
    url_pattern: "https://arxiv.org/search/?query=%s&searchtype=all",
    context: ["selection"],
    tags: ["papers", "ai"],
    featured: false,
    supports_prefill: true,
    enabled: true,
  },
  {
    name: "Perplexity",
    slug: "perplexity",
    category: "ai",
    url_pattern: "https://www.perplexity.ai/search?q=%s",
    context: ["selection"],
    tags: ["ai", "qa"],
    featured: false,
    supports_prefill: true,
    enabled: true,
  },
  {
    name: "ChatGPT",
    slug: "chatgpt",
    category: "ai",
    url_pattern: "https://chat.openai.com",
    context: ["selection"],
    tags: ["ai"],
    featured: false,
    supports_prefill: false, // No prefill support
    enabled: true,
  },
  {
    name: "Claude",
    slug: "claude",
    category: "ai",
    url_pattern: "https://claude.ai/new",
    context: ["selection"],
    tags: ["ai"],
    featured: false,
    supports_prefill: false, // No prefill support
    enabled: true,
  },
];

async function seed() {
  console.log("🌱 Starting platform seeding...");

  try {
    // Check if platforms already exist
    const { count } = await supabase
      .from("platforms")
      .select("*", { count: "exact", head: true });

    if (count && count > 0) {
      console.log(`⚠️  Database already has ${count} platforms`);
      const answer = await confirm(
        "Do you want to continue? This will add duplicates if slugs match. (y/N): "
      );
      if (!answer) {
        console.log("❌ Seeding cancelled");
        process.exit(0);
      }
    }

    // Insert platforms
    const { data, error } = await supabase
      .from("platforms")
      .insert(platforms)
      .select();

    if (error) {
      throw error;
    }

    console.log(`✅ Successfully seeded ${data.length} platforms!`);
    console.log("\nSeeded platforms:");
    data.forEach((p: any) => {
      console.log(`  - ${p.name} (${p.category})`);
    });

    console.log("\n🎉 Seeding complete!");
  } catch (error) {
    console.error("❌ Error seeding platforms:", error);
    process.exit(1);
  }
}

// Simple confirm helper for CLI
function confirm(message: string): Promise<boolean> {
  return new Promise((resolve) => {
    process.stdout.write(message);
    process.stdin.once("data", (data) => {
      const answer = data.toString().trim().toLowerCase();
      resolve(answer === "y" || answer === "yes");
    });
  });
}

seed();
