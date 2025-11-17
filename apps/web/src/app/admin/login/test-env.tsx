"use client";

export function TestEnv() {
  if (typeof window === "undefined") return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded text-xs max-w-md">
      <div className="font-bold mb-2">🔧 Environment Check:</div>
      <div>URL: {process.env.NEXT_PUBLIC_SUPABASE_URL || "❌ Missing"}</div>
      <div>
        Key:{" "}
        {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "✅ Set" : "❌ Missing"}
      </div>
    </div>
  );
}
