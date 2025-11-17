import { z } from "zod";

/**
 * Platform form validation schemas
 * PLATFORM.md Phase 10.1
 */

export const platformSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100, "Slug too long")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must contain only lowercase letters, numbers, and hyphens"
    ),
  category: z.enum(["search", "code", "ai", "social", "shopping"], {
    required_error: "Category is required",
  }),
  url_pattern: z
    .string()
    .min(1, "URL pattern is required")
    .url("Must be a valid URL")
    .refine((url) => url.includes("%s"), {
      message: "URL pattern must contain %s placeholder",
    }),
  context: z
    .array(z.enum(["selection", "image"]))
    .min(1, "At least one context is required"),
  icon_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  tags: z.array(z.string()).optional(),
  featured: z.boolean().optional(),
  supports_prefill: z.boolean().optional(),
  enabled: z.boolean().optional(),
});

export const iconUploadSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= 500 * 1024, {
      message: "File size must be less than 500KB",
    })
    .refine(
      (file) =>
        ["image/png", "image/jpeg", "image/jpg", "image/svg+xml"].includes(
          file.type
        ),
      {
        message: "File must be PNG, JPG, or SVG",
      }
    ),
});

export type PlatformSchema = z.infer<typeof platformSchema>;
export type IconUploadSchema = z.infer<typeof iconUploadSchema>;
