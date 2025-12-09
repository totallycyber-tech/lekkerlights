import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Image } from "https://deno.land/x/imagescript@1.3.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Rate limiting
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 30; // Max 30 uploads per minute per IP

function checkRateLimit(clientIP: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(clientIP);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(clientIP, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }

  record.count++;
  return true;
}

function cleanupRateLimitMap() {
  const now = Date.now();
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}

// Image optimization settings
const MAX_DIMENSION = 1920; // Max width or height
const JPEG_QUALITY = 80; // 80% quality for JPEG compression

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
    magicBytes: [[0x52, 0x49, 0x46, 0x46]]
  },
  'image/gif': {
    mimeType: 'image/gif',
    magicBytes: [[0x47, 0x49, 0x46, 0x38, 0x37, 0x61], [0x47, 0x49, 0x46, 0x38, 0x39, 0x61]]
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
        if (mimeType === 'image/webp') {
          if (bytes.length >= 12) {
            const webpSig = [0x57, 0x45, 0x42, 0x50];
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

async function optimizeImage(bytes: Uint8Array, mimeType: string): Promise<{ data: Uint8Array; mimeType: string }> {
  try {
    // Decode the image
    const image = await Image.decode(bytes);
    
    const width = image.width;
    const height = image.height;
    
    console.log(`Original dimensions: ${width}x${height}`);
    
    // Check if resizing is needed
    let needsResize = false;
    let newWidth = width;
    let newHeight = height;
    
    if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
      needsResize = true;
      if (width > height) {
        newWidth = MAX_DIMENSION;
        newHeight = Math.round((height / width) * MAX_DIMENSION);
      } else {
        newHeight = MAX_DIMENSION;
        newWidth = Math.round((width / height) * MAX_DIMENSION);
      }
      console.log(`Resizing to: ${newWidth}x${newHeight}`);
    }
    
    // Resize if needed
    if (needsResize) {
      image.resize(newWidth, newHeight);
    }
    
    // Encode based on original type - output as JPEG for better compression
    // GIFs stay as PNG to preserve any animation frames (though imagescript doesn't preserve animation)
    let outputData: Uint8Array;
    let outputMimeType: string;
    
    if (mimeType === 'image/gif') {
      // Keep as PNG for GIFs
      outputData = await image.encode();
      outputMimeType = 'image/png';
    } else {
      // Convert to JPEG for compression (including PNG and WebP)
      outputData = await image.encodeJPEG(JPEG_QUALITY);
      outputMimeType = 'image/jpeg';
    }
    
    const originalSize = bytes.length;
    const newSize = outputData.length;
    const savings = ((originalSize - newSize) / originalSize * 100).toFixed(1);
    
    console.log(`Optimization complete: ${originalSize} bytes -> ${newSize} bytes (${savings}% reduction)`);
    
    return { data: outputData, mimeType: outputMimeType };
  } catch (error) {
    console.error('Image optimization failed, using original:', error);
    // Return original if optimization fails
    return { data: bytes, mimeType };
  }
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Clean up old rate limit entries
  cleanupRateLimitMap();

  // Get client IP for rate limiting
  const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() 
    || req.headers.get("cf-connecting-ip") 
    || "unknown";

  // Check rate limit
  if (!checkRateLimit(clientIP)) {
    console.log(`Rate limit exceeded for IP: ${clientIP}`);
    return new Response(
      JSON.stringify({ success: false, error: "Too many uploads. Please try again later." }),
      { 
        status: 429, 
        headers: { 
          "Content-Type": "application/json", 
          "Retry-After": "60",
          ...corsHeaders 
        } 
      }
    );
  }

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const listingId = formData.get('listingId') as string | null;
    const editToken = formData.get('editToken') as string | null;

    if (!file || !listingId) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields (file, listingId)" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Upload request from ${clientIP} for listing ${listingId}, file: ${file.name}, size: ${file.size}`);

    if (file.size > MAX_FILE_SIZE) {
      console.log(`File too large: ${file.size} bytes`);
      return new Response(
        JSON.stringify({ success: false, error: `File size exceeds maximum of 5MB` }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

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

    // Optimize the image (resize and compress)
    console.log('Starting image optimization...');
    const { data: optimizedData, mimeType: optimizedMimeType } = await optimizeImage(bytes, detectedType);

    // Generate unique filename with correct extension
    const ext = optimizedMimeType === 'image/jpeg' ? 'jpg' : 'png';
    const filename = `${crypto.randomUUID()}.${ext}`;
    const filePath = `${listingId}/${filename}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("listing-images")
      .upload(filePath, optimizedData, {
        contentType: optimizedMimeType,
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to upload image" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const { data: { publicUrl } } = supabase.storage
      .from("listing-images")
      .getPublicUrl(filePath);

    console.log(`Successfully uploaded optimized image: ${publicUrl}`);

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
