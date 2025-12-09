import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
    
    console.log(`Attempting to update listing: ${listingId}`);

    if (!listingId || !editToken) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing listingId or editToken" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create Supabase client with service role to bypass RLS
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // First, verify the edit token matches the listing
    const { data: listing, error: fetchError } = await supabaseAdmin
      .from("listings")
      .select("id, edit_token")
      .eq("id", listingId)
      .maybeSingle();

    if (fetchError) {
      console.error("Error fetching listing:", fetchError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to verify listing" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!listing) {
      return new Response(
        JSON.stringify({ success: false, error: "Listing not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate the edit token
    if (listing.edit_token !== editToken) {
      console.warn(`Invalid edit token attempt for listing: ${listingId}`);
      return new Response(
        JSON.stringify({ success: false, error: "Invalid edit token" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Remove edit_token from updates if someone tries to change it
    const sanitizedUpdates = { ...updates };
    delete sanitizedUpdates.edit_token;
    delete sanitizedUpdates.id;

    // Perform the update
    const { data: updatedListing, error: updateError } = await supabaseAdmin
      .from("listings")
      .update(sanitizedUpdates)
      .eq("id", listingId)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating listing:", updateError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to update listing" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Successfully updated listing: ${listingId}`);

    // Remove edit_token from response
    const { edit_token: _, ...safeResponse } = updatedListing;

    return new Response(
      JSON.stringify({ success: true, data: safeResponse }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: unknown) {
    console.error("Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ success: false, error: errorMessage }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
