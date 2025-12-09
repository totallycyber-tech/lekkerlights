import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DeleteListingRequest {
  listingId: string;
  editToken: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { listingId, editToken }: DeleteListingRequest = await req.json();
    
    console.log(`Attempting to delete listing: ${listingId}`);

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
      .select("id, edit_token, title")
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
      console.warn(`Invalid edit token attempt for listing deletion: ${listingId}`);
      return new Response(
        JSON.stringify({ success: false, error: "Invalid edit token" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Perform the deletion
    const { error: deleteError } = await supabaseAdmin
      .from("listings")
      .delete()
      .eq("id", listingId);

    if (deleteError) {
      console.error("Error deleting listing:", deleteError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to delete listing" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Successfully deleted listing: ${listingId} (${listing.title})`);

    return new Response(
      JSON.stringify({ success: true, message: "Listing deleted successfully" }),
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
