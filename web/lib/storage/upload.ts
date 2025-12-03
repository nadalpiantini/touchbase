import { SupabaseClient } from "@supabase/supabase-js";

const AVATARS_BUCKET = "avatars";
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export interface UploadResult {
  url: string;
  path: string;
  error?: string;
}

/**
 * Upload an image file to Supabase Storage
 * @param supabase - Supabase client
 * @param file - File to upload
 * @param userId - User ID for path organization
 * @param folder - Optional folder name (default: "avatars")
 * @returns Upload result with URL and path
 */
export async function uploadImage(
  supabase: SupabaseClient,
  file: File,
  userId: string,
  folder: string = AVATARS_BUCKET
): Promise<UploadResult> {
  // Validate file type
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      url: "",
      path: "",
      error: "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.",
    };
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      url: "",
      path: "",
      error: "File size exceeds 5MB limit.",
    };
  }

  // Generate unique filename
  const fileExt = file.name.split(".").pop();
  const fileName = `${userId}-${Date.now()}.${fileExt}`;
  const filePath = `${folder}/${fileName}`;

  try {
    // Upload file to Supabase Storage
    const { data, error } = await supabase.storage
      .from(folder)
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      return {
        url: "",
        path: "",
        error: error.message,
      };
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(folder).getPublicUrl(filePath);

    return {
      url: publicUrl,
      path: filePath,
    };
  } catch (error) {
    return {
      url: "",
      path: "",
      error: error instanceof Error ? error.message : "Upload failed",
    };
  }
}

/**
 * Delete an image from Supabase Storage
 * @param supabase - Supabase client
 * @param path - File path to delete
 * @param folder - Optional folder name (default: "avatars")
 */
export async function deleteImage(
  supabase: SupabaseClient,
  path: string,
  folder: string = AVATARS_BUCKET
): Promise<{ error?: string }> {
  try {
    const { error } = await supabase.storage.from(folder).remove([path]);

    if (error) {
      return { error: error.message };
    }

    return {};
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Delete failed",
    };
  }
}

