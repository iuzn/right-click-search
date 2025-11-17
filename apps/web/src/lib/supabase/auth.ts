import { supabase } from "./client";

/**
 * Supabase Auth helper functions
 */

// Sign in with email and password
export async function signInWithEmail(email: string, password: string) {
  console.log("🔐 signInWithEmail called with:", email);

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("❌ signInWithEmail error:", error);
    throw error;
  }

  console.log(
    "✅ signInWithEmail success:",
    data.session ? "Session created" : "No session"
  );
  return data;
}

// Sign up with email and password
export async function signUpWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

// Sign out
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// Get current session
export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

// Get current user
export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user;
}

// Check if user is admin
export async function isAdmin(email: string) {
  const { data, error } = await supabase
    .from("admins")
    .select("email")
    .eq("email", email)
    .single();

  return !error && !!data;
}
