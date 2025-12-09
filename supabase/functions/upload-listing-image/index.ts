import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Allowed MIME types and their magic bytes
const ALLOWED_TYPES: Record<string, { mimeType: string; magicBytes: number[][] }> = {
  'image/jpeg': {
    mimeType: 'image/jpeg',
    magicBytes: [[0xFF, 0xD8, 0xFF]]
  },
  'image/png': {
    mimeType: 'image/png',
    magicBytes: [[0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]]
  },
  'image/webp': {
    mimeType: 'image/webp',
    magicBytes: [[0x52, 0x49, 0x46, 0x46]] // RIFF header, WebP has WEBP after size bytes
  },
  'image/gif': {
    mimeType: 'image/gif',
    magicBytes: [[0x47, 0x49, 0x46, 0x38, 0x37, 0x61], [0x47, 0x49, 0x46, 0x38, 0x39, 0x61]] // GIF87a and GIF89a
  }
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

function checkMagicBytes(bytes: Uint8Array, expected: number[]): boolean {
  if (bytes.length < expected.length) return false;
  for (let i = 0; i < expected.length; i++) {
    if (bytes[i] !== expected[i]) return false;
  }
  return true;
}

function validateFileType(bytes: Uint8Array): string | null {
  for (const [mimeType, config] of Object.entries(ALLOWED_TYPES)) {
    for (const magicBytes of config.magicBytes) {
      if (checkMagicBytes(bytes, magicBytes)) {
        // Special check for WebP - verify WEBP signature at offset 8
        if (mimeType === 'image/webp') {
          if (bytes.length >= 12) {
            const webpSig = [0x57, 0x45, 0x42, 0x50]; // WEBP
            if (checkMagicBytes(bytes.slice(8), webpSig)) {
              return mimeType;
            }
          }
          continue;
        }
        return mimeType;
      }
    }
  }
  return null;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const listingId = formData.get('listingId') as string | null;
    const editToken = formData.get('editToken') as string | null;

    // Validate required fields
    if (!file || !listingId) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields (file, listingId)" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Upload request for listing ${listingId}, file: ${file.name}, size: ${file.size}`);

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      console.log(`File too large: ${file.size} bytes`);
      return new Response(
        JSON.stringify({ success: false, error: `File size exceeds maximum of 5MB` }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Read file bytes for magic byte validation
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    // Validate file type using magic bytes
    const detectedType = validateFileType(bytes);
    if (!detectedType) {
      console.log(`Invalid file type detected for file: ${file.name}`);
      return new Response(
        JSON.stringify({ success: false, error: "Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`File type validated: ${detectedType}`);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // If editToken provided, verify it (for editing existing listings)
    if (editToken) {
      const { data: tokenRecord, error: tokenError } = await supabase
        .from("listing_edit_tokens")
        .select("edit_token")
        .eq("listing_id", listingId)
        .single();

      if (tokenError || !tokenRecord || tokenRecord.edit_token !== editToken) {
        console.log("Invalid edit token for listing:", listingId);
        return new Response(
          JSON.stringify({ success: false, error: "Invalid edit token" }),
          { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    } else {
      // For new listings, verify the listing exists (was just created)
      const { data: listing, error: listingError } = await supabase
        .from("listings")
        .select("id")
        .eq("id", listingId)
        .single();

      if (listingError || !listing) {
        console.log("Listing not found:", listingId);
        return new Response(
          JSON.stringify({ success: false, error: "Listing not found" }),
          { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    // Generate unique filename
    const ext = detectedType.split('/')[1];
    const filename = `${crypto.randomUUID()}.${ext}`;
    const filePath = `${listingId}/${filename}`;

    // Upload to storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("listing-images")
      .upload(filePath, bytes, {
        contentType: detectedType,
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to upload image" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from("listing-images")
      .getPublicUrl(filePath);

    console.log(`Successfully uploaded image: ${publicUrl}`);

    return new Response(
      JSON.stringify({ success: true, url: publicUrl, path: filePath }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
