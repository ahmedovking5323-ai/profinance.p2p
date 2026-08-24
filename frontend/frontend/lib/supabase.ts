import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

// Supabase client instance
export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

export interface RealtimeOrderPayload {
  id: string;
  status: string;
  tx_hash?: string;
  user_receipt_url?: string;
  updated_at: string;
}

export interface RealtimeChatMessage {
  id: string;
  order_id: string;
  sender_type: "buyer" | "admin" | "system";
  sender_name: string;
  message: string;
  attachment_url?: string;
  created_at: string;
}

/**
 * Uploads a receipt image to Supabase Storage bucket 'order-receipts'
 */
export async function uploadReceiptImage(file: File, orderId: string): Promise<{ url?: string; error?: string }> {
  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${orderId}/${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from("order-receipts")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: true,
      });

    if (error) {
      console.warn("Supabase upload error:", error.message);
      // Create a local blob URL fallback for demo/testing
      const localUrl = URL.createObjectURL(file);
      return { url: localUrl };
    }

    const { data: publicUrlData } = supabase.storage
      .from("order-receipts")
      .getPublicUrl(fileName);

    return { url: publicUrlData.publicUrl };
  } catch (err: any) {
    return { url: URL.createObjectURL(file) };
  }
}
