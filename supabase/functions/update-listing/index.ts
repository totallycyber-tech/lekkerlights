import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface UpdateListingRequest {
  listingId: string;
  editToken: string;
  updates: Record<string, unknown>;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { listingId, editToken, updates }: UpdateListingRequest = await req.json();

    if (!listingId || !editToken || !updates) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Update request for listing: ${listingId}`);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

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

    // Sanitize updates - remove any sensitive fields that shouldn't be updated
    const sanitizedUpdates = { ...updates };
    delete sanitizedUpdates.id;
    delete sanitizedUpdates.edit_token;
    delete sanitizedUpdates.created_at;

    // Perform the update
    const { data: updatedListing, error: updateError } = await supabase
      .from("listings")
      .update(sanitizedUpdates)
      .eq("id", listingId)
      .select()
      .single();

    if (updateError) {
      console.error("Update error:", updateError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to update listing" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Remove edit_token from response
    const { edit_token: _, ...safeResponse } = updatedListing;

    console.log("Listing updated successfully:", listingId);

    return new Response(
      JSON.stringify({ success: true, listing: safeResponse }),
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
