import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface DeleteImageRequest {
  listingId: string;
  editToken: string;
  imagePath: string; // Full path like "listingId/filename.jpg"
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { listingId, editToken, imagePath }: DeleteImageRequest = await req.json();

    // Validate required fields
    if (!listingId || !editToken || !imagePath) {
      console.log("Missing required fields:", { listingId: !!listingId, editToken: !!editToken, imagePath: !!imagePath });
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

    console.log(`Verifying edit token for listing: ${listingId}`);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify edit token
    const { data: tokenRecord, error: tokenError } = await supabase
      .from("listing_edit_tokens")
      .select("edit_token")
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
