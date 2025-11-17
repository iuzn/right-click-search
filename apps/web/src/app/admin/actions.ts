"use server";

import { revalidatePath } from "next/cache";
import { supabaseServer } from "@/lib/supabase/server";
import { PlatformFormData } from "@/types/platform";

/**
 * Admin server actions
 * PLATFORM.md Phase 6.5
 * NOTE: admins table removed - just authenticated user check
 */

// Create platform
export async function createPlatform(formData: PlatformFormData) {
  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from("platforms")
    .insert([formData])
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/platforms");
  revalidatePath("/catalog");
  return { data };
}

// Update platform
export async function updatePlatform(
  id: string,
  formData: Partial<PlatformFormData>
) {
  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from("platforms")
    .update(formData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/platforms");
  revalidatePath("/catalog");
  return { data };
}

// Delete platform
export async function deletePlatform(id: string) {
  const supabase = supabaseServer();
  const { error } = await supabase.from("platforms").delete().eq("id", id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/admin/platforms");
  revalidatePath("/catalog");
  return { success: true };
}

// Toggle platform enabled status
export async function togglePlatformEnabled(id: string, enabled: boolean) {
  return updatePlatform(id, { enabled });
}

// Icon upload
export async function uploadIcon(file: File) {
  const supabase = supabaseServer();

  // File validations
  const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml"];
  if (!validTypes.includes(file.type)) {
    return { error: "Invalid file type. Use PNG, JPG, or SVG" };
  }

  if (file.size > 500 * 1024) {
    // 500KB
    return { error: "File too large. Maximum 500KB" };
  }

  const fileName = `${Date.now()}-${file.name}`;
  const { data, error } = await supabase.storage
    .from("icons")
    .upload(fileName, file, {
      contentType: file.type,
      upsert: false,
    });

  if (error) {
    return { error: error.message };
  }

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("icons").getPublicUrl(data.path);

  return { url: publicUrl };
}

// Delete icon
export async function deleteIcon(url: string) {
  const supabase = supabaseServer();

  // Extract path from URL
  const path = url.split("/icons/").pop();
  if (!path) return { error: "Invalid URL" };

  const { error } = await supabase.storage.from("icons").remove([path]);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

// Get all platforms (for admin - show disabled ones too)
export async function getAllPlatforms() {
  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from("platforms")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return { error: error.message };
  }

  return { data };
}
