
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

// Buckets defined in supabase/schema.sql
export const STORAGE_BUCKETS = {
    PUBLIC_ASSETS: "public-assets",
    VEHICLES: "vehicles",
    LOGOS: "logos",
    DOCUMENTS: "documents", // Private
    AVATARS: "avatars",
} as const;

export type BucketName = (typeof STORAGE_BUCKETS)[keyof typeof STORAGE_BUCKETS];

export interface UploadResult {
    path: string;
    url: string;
    fullPath?: string;
}

/**
 * Uploads a file to a specific Supabase Storage bucket.
 * Generates a unique filename using UUID.
 */
export async function uploadFile(
    file: File,
    bucket: BucketName,
    folder: string = ""
): Promise<{ success: boolean; data?: UploadResult; error?: string }> {
    try {
        const fileExt = file.name.split(".").pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = folder ? `${folder}/${fileName}` : fileName;

        const { data, error } = await supabase.storage
            .from(bucket)
            .upload(filePath, file, {
                cacheControl: "3600",
                upsert: false,
            });

        if (error) {
            console.error("Supabase Upload Error:", error);
            return { success: false, error: error.message };
        }

        // Get Public URL
        const {
            data: { publicUrl },
        } = supabase.storage.from(bucket).getPublicUrl(data.path);

        return {
            success: true,
            data: {
                path: data.path,
                url: publicUrl,
                fullPath: data.fullPath,
            },
        };
    } catch (err: any) {
        console.error("Unexpected Upload Error:", err);
        return { success: false, error: err.message || "Unknown error occurred" };
    }
}

/**
 * Uploads a vehicle image to the 'vehicles' bucket.
 */
export async function uploadVehicleImage(file: File) {
    return uploadFile(file, STORAGE_BUCKETS.VEHICLES, "images");
}

/**
 * Uploads a company or supplier logo to the 'logos' bucket.
 */
export async function uploadCompanyLogo(file: File) {
    return uploadFile(file, STORAGE_BUCKETS.LOGOS);
}

/**
 * Uploads a user or driver avatar to the 'avatars' bucket.
 */
export async function uploadAvatar(file: File) {
    return uploadFile(file, STORAGE_BUCKETS.AVATARS);
}

/**
 * Uploads a private document to the 'documents' bucket.
 * Note: Does not return a usable public URL, only the path.
 */
export async function uploadPrivateDocument(file: File, documentType: string = "general") {
    const result = await uploadFile(file, STORAGE_BUCKETS.DOCUMENTS, documentType);
    if (result.success && result.data) {
        // For private buckets, the publicUrl is not accessible.
        // We return the path so the application can request a Signed URL later.
        return {
            success: true,
            data: {
                ...result.data,
                url: "", // Not public
                path: result.data.path
            }
        };
    }
    return result;
}

/**
 * Generates a temporary signed URL for a private file.
 * Valid for 1 hour by default.
 */
export async function getSignedDocumentUrl(path: string, expiresIn = 3600) {
    const { data, error } = await supabase.storage
        .from(STORAGE_BUCKETS.DOCUMENTS)
        .createSignedUrl(path, expiresIn);

    if (error) {
        console.error("Error creating signed URL:", error);
        return null;
    }
    return data.signedUrl;
}

/**
 * Deletes a file from storage
 */
export async function deleteFile(bucket: BucketName, path: string) {
    const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

    if (error) {
        console.error("Error deleting file:", error);
        return false;
    }
    return true;
}
