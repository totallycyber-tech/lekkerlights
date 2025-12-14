import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface GeocodeRequest {
  listingId: string;
  address: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { listingId, address }: GeocodeRequest = await req.json();

    if (!listingId || !address) {
      console.error("Missing required fields:", { listingId, address });
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Geocoding address for listing ${listingId}: ${address}`);

    // Use server-side API key without HTTP referer restrictions for geocoding
    const googleMapsApiKey = Deno.env.get("GOOGLE_MAPS_SERVER_API_KEY");
    if (!googleMapsApiKey) {
      console.error("Google Maps API key not configured");
      return new Response(
        JSON.stringify({ success: false, error: "Geocoding service not configured" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Call Google Geocoding API
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${googleMapsApiKey}&region=za`;
    
    const geocodeResponse = await fetch(geocodeUrl);
    const geocodeData = await geocodeResponse.json();

    console.log("Geocode response status:", geocodeData.status);

    if (geocodeData.status !== "OK" || !geocodeData.results || geocodeData.results.length === 0) {
      console.error("Geocoding failed:", geocodeData.status, geocodeData.error_message);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Geocoding failed: ${geocodeData.status}`,
          details: geocodeData.error_message 
        }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const location = geocodeData.results[0].geometry.location;
    const lat = location.lat;
    const lng = location.lng;

    console.log(`Geocoded coordinates: lat=${lat}, lng=${lng}`);

    // Update the listing with coordinates using service role
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { error: updateError } = await supabase
      .from("listings")
      .update({ lat, lng })
      .eq("id", listingId);

    if (updateError) {
      console.error("Failed to update listing with coordinates:", updateError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to update listing coordinates" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Successfully updated listing ${listingId} with coordinates`);

    return new Response(
      JSON.stringify({ success: true, lat, lng }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in geocode-address function:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
