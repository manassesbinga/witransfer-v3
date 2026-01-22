"use server"

import { supabaseAdmin } from "@/lib/supabase"
import { actionMiddleware } from "@/middlewares/actions/action-factory"

/**
 * Uploads a file to Supabase Storage and returns the public URL or signed URL.
 */
export async function uploadFileAction(formData: FormData): Promise<{ success: boolean; data?: { url: string; path: string }; error?: string }> {
    return actionMiddleware<{ bucket: string | null; path: string | null }, { url: string; path: string }>("UploadFile", async () => {
        try {
            const file = formData.get("file") as File
            const bucket = (formData.get("bucket") as string) || "public-assets"
            const path = formData.get("path") as string

            if (!file) throw new Error("Arquivo não encontrado")
            if (!path) throw new Error("Caminho do arquivo não especificado")

            const { data, error } = await supabaseAdmin.storage
                .from(bucket)
                .upload(path, file, {
                    upsert: true,
                    contentType: file.type
                })

            if (error) {
                console.error("Storage Upload Error:", error);
                throw error;
            }

            // Determine URL type based on bucket privacy
            let finalUrl: string;

            if (bucket === "documents") {
                // Documents bucket is private, generate a long-lived signed URL (10 years)
                // This avoids the "Bucket not found" error on public URL access
                const { data: signedData, error: signedError } = await supabaseAdmin.storage
                    .from(bucket)
                    .createSignedUrl(path, 60 * 60 * 24 * 365 * 10); // 10 years expiration

                if (signedError) {
                    console.error("Signed URL creation failed:", signedError);
                    // Fallback to public if signing fails (though unlikely to work if private)
                    const { data: { publicUrl } } = supabaseAdmin.storage.from(bucket).getPublicUrl(path);
                    finalUrl = publicUrl;
                } else {
                    finalUrl = signedData.signedUrl;
                }
            } else {
                // Public buckets (avatars, public-assets)
                const { data: { publicUrl } } = supabaseAdmin.storage
                    .from(bucket)
                    .getPublicUrl(path);
                finalUrl = publicUrl;
            }

            return { url: finalUrl, path: data.path }
        } catch (e: any) {
            console.error("Upload Action Final Error:", e);
            throw new Error(e.message || "Falha no upload do arquivo");
        }
    }, { bucket: formData.get("bucket") as string, path: formData.get("path") as string })
}
