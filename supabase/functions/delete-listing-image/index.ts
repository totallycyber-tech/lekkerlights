import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 20; // Max 20 deletions per minute per IP

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

// Clean up old entries periodically
function cleanupRateLimitMap() {
  const now = Date.now();
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}

interface DeleteImageRequest {
  listingId: string;
  editToken?: string;
  batchToken?: string;
  imagePath: string;
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
      JSON.stringify({ success: false, error: "Too many requests. Please try again later." }),
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
    const { listingId, editToken, batchToken, imagePath }: DeleteImageRequest = await req.json();

    // Validate required fields
    if (!listingId || (!editToken && !batchToken) || !imagePath) {
      console.log("Missing required fields:", { listingId: !!listingId, editToken: !!editToken, batchToken: !!batchToken, imagePath: !!imagePath });
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate that the image path belongs to the listing
    if (!imagePath.startsWith(`${listingId}/`)) {
      console.log("Image path does not belong to listing:", { imagePath, listingId });
      return new Response(
        JSON.stringify({ success: false, error: "Image does not belong to this listing" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Verifying token for listing: ${listingId} (IP: ${clientIP})`);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify token - either batch token or edit token
    if (batchToken) {
      // Get the listing's batch_id first
      const { data: listingData, error: listingError } = await supabase
        .from("listings")
        .select("batch_id")
        .eq("id", listingId)
        .single();

      if (listingError || !listingData?.batch_id) {
        console.log("Listing not found or not part of batch:", listingId);
        return new Response(
          JSON.stringify({ success: false, error: "Invalid token" }),
          { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Verify batch token
      const { data: batchTokenRecord, error: batchTokenError } = await supabase
        .from("batch_edit_tokens")
        .select("edit_token, expires_at")
        .eq("batch_id", listingData.batch_id)
        .single();

      if (batchTokenError || !batchTokenRecord || batchTokenRecord.edit_token !== batchToken) {
        console.log("Invalid batch token for listing:", listingId);
        return new Response(
          JSON.stringify({ success: false, error: "Invalid token" }),
          { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Check if batch token has expired
      if (batchTokenRecord.expires_at) {
        const expiresAt = new Date(batchTokenRecord.expires_at);
        if (new Date() > expiresAt) {
          console.log("Batch token expired for listing:", listingId);
          return new Response(
            JSON.stringify({ success: false, error: "Token has expired" }),
            { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }
      }
    } else if (editToken) {
      // Verify edit token
      const { data: tokenRecord, error: tokenError } = await supabase
        .from("listing_edit_tokens")
        .select("edit_token, expires_at")
        .eq("listing_id", listingId)
        .single();

      if (tokenError || !tokenRecord) {
        console.log("Token not found for listing:", listingId);
        return new Response(
          JSON.stringify({ success: false, error: "Invalid token" }),
          { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      if (tokenRecord.edit_token !== editToken) {
        console.log("Token mismatch for listing:", listingId);
        return new Response(
          JSON.stringify({ success: false, error: "Invalid token" }),
          { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Check if token has expired
      if (tokenRecord.expires_at) {
        const expiresAt = new Date(tokenRecord.expires_at);
        if (new Date() > expiresAt) {
          console.log("Token expired for listing:", listingId);
          return new Response(
            JSON.stringify({ success: false, error: "Token has expired" }),
            { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }
      }
    }

    console.log(`Token verified, deleting image: ${imagePath}`);

    // Delete the image using service role (bypasses RLS)
    const { error: deleteError } = await supabase.storage
      .from("listing-images")
      .remove([imagePath]);

    if (deleteError) {
      console.error("Error deleting image:", deleteError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to delete image" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Successfully deleted image: ${imagePath}`);

    return new Response(
      JSON.stringify({ success: true }),
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
