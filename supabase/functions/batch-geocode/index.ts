import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify this is a service role request (admin-only function)
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      console.error("Missing authorization header");
      return new Response(
        JSON.stringify({ error: "Unauthorized - missing authorization" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Extract and verify the token is service role
    const token = authHeader.replace("Bearer ", "");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    // Only allow service role key (not anon key)
    if (token !== supabaseServiceKey) {
      console.error("Invalid authorization - not service role");
      return new Response(
        JSON.stringify({ error: "Unauthorized - admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Authorized service role request for batch geocode");
    const googleMapsKey = Deno.env.get("GOOGLE_MAPS_SERVER_API_KEY");
    if (!googleMapsKey) {
      throw new Error("Google Maps server API key not configured");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch all listings without coordinates
    const { data: listings, error: fetchError } = await supabase
      .from("listings")
      .select("id, street_number, street_name, suburb, city, province, postal_code")
      .is("lat", null);

    if (fetchError) {
      throw new Error(`Failed to fetch listings: ${fetchError.message}`);
    }

    console.log(`Found ${listings?.length || 0} listings to geocode`);

    const results: { id: string; success: boolean; error?: string }[] = [];

    for (const listing of listings || []) {
      const address = `${listing.street_number} ${listing.street_name}, ${listing.suburb}, ${listing.city}, ${listing.province}, ${listing.postal_code}, South Africa`;
      
      try {
        const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${googleMapsKey}`;
        const geocodeResponse = await fetch(geocodeUrl);
        const geocodeData = await geocodeResponse.json();

        if (geocodeData.status === "OK" && geocodeData.results.length > 0) {
          const location = geocodeData.results[0].geometry.location;
          
          const { error: updateError } = await supabase
            .from("listings")
            .update({ lat: location.lat, lng: location.lng })
            .eq("id", listing.id);

          if (updateError) {
            results.push({ id: listing.id, success: false, error: updateError.message });
            console.error(`Failed to update listing ${listing.id}:`, updateError.message);
          } else {
            results.push({ id: listing.id, success: true });
            console.log(`Geocoded listing ${listing.id}: ${location.lat}, ${location.lng}`);
          }
        } else {
          results.push({ id: listing.id, success: false, error: `Geocoding failed: ${geocodeData.status}` });
          console.error(`Geocoding failed for ${listing.id}: ${geocodeData.status}`);
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        results.push({ id: listing.id, success: false, error: String(error) });
        console.error(`Error geocoding listing ${listing.id}:`, error);
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    return new Response(
      JSON.stringify({ 
        message: `Geocoded ${successCount} listings, ${failCount} failed`,
        results 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Batch geocode error:", error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
