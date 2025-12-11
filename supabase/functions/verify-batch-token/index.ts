import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface VerifyBatchTokenRequest {
  batchId: string;
  editToken: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { batchId, editToken }: VerifyBatchTokenRequest = await req.json();

    if (!batchId || !editToken) {
      return new Response(
        JSON.stringify({ valid: false, error: "Missing batch ID or token" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Verifying batch token for batch: ${batchId}`);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get token from secure table
    const { data: tokenRecord, error: tokenError } = await supabase
      .from("batch_edit_tokens")
      .select("edit_token, expires_at, email")
      .eq("batch_id", batchId)
      .single();

    if (tokenError || !tokenRecord) {
      console.error("Token not found:", tokenError);
      return new Response(
        JSON.stringify({ valid: false, error: "Invalid batch or token" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if token matches
    if (tokenRecord.edit_token !== editToken) {
      console.error("Token mismatch for batch:", batchId);
      return new Response(
        JSON.stringify({ valid: false, error: "Invalid token" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Check if token has expired
    if (tokenRecord.expires_at && new Date(tokenRecord.expires_at) < new Date()) {
      console.log("Token expired for batch:", batchId);
      return new Response(
        JSON.stringify({ valid: false, expired: true, error: "Token has expired. Please request a new edit link." }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get all listings for this batch
    const { data: listings, error: listingsError } = await supabase
      .from("listings")
      .select("*")
      .eq("batch_id", batchId);

    if (listingsError) {
      console.error("Failed to fetch listings:", listingsError);
      return new Response(
        JSON.stringify({ valid: false, error: "Failed to fetch listings" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Token valid for batch ${batchId}, found ${listings?.length || 0} listings`);

    return new Response(
      JSON.stringify({ 
        valid: true, 
        listings: listings || [],
        email: tokenRecord.email,
      }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ valid: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
