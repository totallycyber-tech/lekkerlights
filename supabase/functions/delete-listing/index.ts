import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface DeleteListingRequest {
  listingId: string;
  editToken?: string;
  batchToken?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { listingId, editToken, batchToken }: DeleteListingRequest = await req.json();

    if (!listingId || (!editToken && !batchToken)) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Delete request for listing: ${listingId}`);

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
        console.error("Listing not found or not part of batch:", listingError);
        return new Response(
          JSON.stringify({ success: false, error: "Listing not found or not part of batch" }),
          { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Verify batch token
      const { data: batchTokenRecord, error: batchTokenError } = await supabase
        .from("batch_edit_tokens")
        .select("edit_token, expires_at")
        .eq("batch_id", listingData.batch_id)
        .single();

      if (batchTokenError || !batchTokenRecord || batchTokenRecord.edit_token !== batchToken) {
        console.error("Invalid batch token:", batchTokenError);
        return new Response(
          JSON.stringify({ success: false, error: "Invalid edit token" }),
          { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Check if batch token has expired
      if (batchTokenRecord.expires_at) {
        const expiresAt = new Date(batchTokenRecord.expires_at);
        if (new Date() > expiresAt) {
          console.log("Batch token expired for listing:", listingId);
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: "expired",
              message: "This edit link has expired. Please request a new edit link."
            }),
            { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }
      }
    } else if (editToken) {
      // Verify token from secure listing_edit_tokens table including expiry
      const { data: tokenRecord, error: tokenError } = await supabase
        .from("listing_edit_tokens")
        .select("edit_token, expires_at")
        .eq("listing_id", listingId)
        .single();

      if (tokenError || !tokenRecord) {
        console.error("Token record not found:", tokenError);
        return new Response(
          JSON.stringify({ success: false, error: "Listing not found" }),
          { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      if (tokenRecord.edit_token !== editToken) {
        console.error("Token mismatch for listing:", listingId);
        return new Response(
          JSON.stringify({ success: false, error: "Invalid edit token" }),
          { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      // Check if token has expired
      if (tokenRecord.expires_at) {
        const expiresAt = new Date(tokenRecord.expires_at);
        const now = new Date();
        
        if (now > expiresAt) {
          console.log("Token expired for listing:", listingId, "Expired at:", expiresAt);
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: "expired",
              message: "This edit link has expired. Please request a new edit link."
            }),
            { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
          );
        }
      }
    }

    // Delete listing (CASCADE will also delete the token record for single listings)
    const { error: deleteError } = await supabase
      .from("listings")
      .delete()
      .eq("id", listingId);

    if (deleteError) {
      console.error("Delete error:", deleteError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to delete listing" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Listing deleted successfully:", listingId);

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
