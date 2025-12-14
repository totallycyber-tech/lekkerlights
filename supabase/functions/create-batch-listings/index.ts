import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ListingData {
  title?: string | null;
  description?: string | null;
  streetNumber: string;
  streetName: string;
  suburb: string;
  city: string;
  province: string;
  postalCode: string;
  complexName?: string;
  unitNo?: string;
  youtubeUrls?: string[];
  tags?: string[];
  operatingHours?: any;
  parkingInfo?: string;
  maxVisitors?: number;
  gateAccessInfo?: string;
}

interface CreateBatchRequest {
  listings: ListingData[];
  contactEmail: string;
  contactName?: string;
  contactPhone?: string;
  nameVisible: boolean;
  emailVisible: boolean;
  phoneVisible: boolean;
}

// HTML escape function
function escapeHtml(text: string): string {
  const entities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  };
  return text.replace(/[&<>"']/g, char => entities[char]);
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: CreateBatchRequest = await req.json();
    const { listings, contactEmail, contactName, contactPhone, nameVisible, emailVisible, phoneVisible } = body;

    // Validate
    if (!listings || !Array.isArray(listings) || listings.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: "No listings provided" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (listings.length > 10) {
      return new Response(
        JSON.stringify({ success: false, error: "Maximum 10 listings allowed per batch" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!contactEmail || !contactEmail.trim()) {
      return new Response(
        JSON.stringify({ success: false, error: "Email address is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contactEmail.trim())) {
      return new Response(
        JSON.stringify({ success: false, error: "Invalid email address" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Creating batch of ${listings.length} listings for ${contactEmail}`);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Generate batch_id
    const batchId = crypto.randomUUID();
    const createdListings: { id: string; title: string }[] = [];

    // Check for duplicate addresses
    for (const listing of listings) {
      const { data: existing } = await supabase
        .from("listings")
        .select("id")
        .ilike("street_number", listing.streetNumber.trim())
        .ilike("street_name", listing.streetName.trim())
        .ilike("suburb", listing.suburb.trim())
        .ilike("city", listing.city.trim());

      if (existing && existing.length > 0) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            error: `Address "${listing.streetNumber} ${listing.streetName}, ${listing.suburb}" is already listed` 
          }),
          { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }
    }

    // Create all listings with the same batch_id
    for (const listing of listings) {
      const { data: newListing, error: insertError } = await supabase
        .from("listings")
        .insert({
          title: listing.title || null,
          description: listing.description || null,
          street_number: listing.streetNumber,
          street_name: listing.streetName,
          suburb: listing.suburb,
          city: listing.city,
          province: listing.province,
          postal_code: listing.postalCode,
          complex_name: listing.complexName || null,
          unit_no: listing.unitNo || null,
          youtube_urls: listing.youtubeUrls || [],
          tags: listing.tags || [],
          operating_hours: listing.operatingHours || {},
          parking_info: listing.parkingInfo || null,
          max_visitors: listing.maxVisitors || null,
          gate_access_info: listing.gateAccessInfo || null,
          contact_email: contactEmail.trim(),
          contact_name: contactName || null,
          contact_phone: contactPhone || null,
          name_visible: nameVisible,
          email_visible: emailVisible,
          phone_visible: phoneVisible,
          image_urls: [],
          batch_id: batchId,
        })
        .select("id, title")
        .single();

      if (insertError || !newListing) {
        console.error("Failed to create listing:", insertError);
        return new Response(
          JSON.stringify({ success: false, error: `Failed to create listing: ${listing.title || listing.streetNumber + ' ' + listing.streetName}` }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      createdListings.push({ id: newListing.id, title: newListing.title || `${listing.streetNumber} ${listing.streetName}` });

      // Geocode the address
      try {
        const fullAddress = [
          listing.streetNumber,
          listing.streetName,
          listing.suburb,
          listing.city,
          listing.province,
          listing.postalCode,
          'South Africa'
        ].filter(Boolean).join(', ');

        const googleMapsKey = Deno.env.get("GOOGLE_MAPS_API_KEY");
        if (googleMapsKey) {
          const geocodeResponse = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${googleMapsKey}`
          );
          const geocodeData = await geocodeResponse.json();
          
          if (geocodeData.status === "OK" && geocodeData.results?.[0]?.geometry?.location) {
            const { lat, lng } = geocodeData.results[0].geometry.location;
            await supabase
              .from("listings")
              .update({ lat, lng })
              .eq("id", newListing.id);
          }
        }
      } catch (geocodeError) {
        console.error("Geocode error:", geocodeError);
      }
    }

    // Create batch edit token
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    const { data: tokenData, error: tokenError } = await supabase
      .from("batch_edit_tokens")
      .insert({
        batch_id: batchId,
        email: contactEmail.trim().toLowerCase(),
        expires_at: expiresAt,
      })
      .select("edit_token")
      .single();

    if (tokenError || !tokenData) {
      console.error("Failed to create batch token:", tokenError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to create edit token" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Send email with batch edit link
    const siteUrl = Deno.env.get("SITE_URL") || "https://lekkerlights.co.za";
    const editLink = `${siteUrl}/edit-batch/${batchId}?token=${tokenData.edit_token}`;
    
    const listingTitles = createdListings.map(l => `• ${escapeHtml(l.title)}`).join("<br>");

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
      },
      body: JSON.stringify({
        from: "Lekker Lights <noreply@lekkerlights.co.za>",
        to: [contactEmail.trim()],
        subject: `Your Bulk Listings Edit Link - ${createdListings.length} displays`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #dc2626;">🎄 Lekker Lights</h1>
            <h2>Your ${createdListings.length} Listings are Live!</h2>
            <p>Thank you for listing the following displays on Lekker Lights:</p>
            <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
              ${listingTitles}
            </div>
            <div style="background: #fef3c7; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <p style="color: #92400e; font-weight: bold; margin: 0 0 8px;">⏰ This link expires in 1 hour</p>
              <p style="color: #92400e; margin: 0; font-size: 14px;">
                For security, this edit link is only valid for 1 hour. If it expires, you can request a new one using the "Lost Edit Link?" feature on our website.
              </p>
            </div>
            <p><a href="${editLink}" style="display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Edit All Listings</a></p>
            <p style="color: #666; font-size: 12px; margin-top: 20px;">Link: ${editLink}</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
            <p style="color: #666; font-size: 12px;">
              Need a new edit link? Visit <a href="${siteUrl}/resend-edit-link" style="color: #dc2626;">our website</a> and select "Bulk Listings" option.
            </p>
          </div>
        `,
      }),
    });

    const emailData = await res.json();
    console.log("Email sent:", emailData);

    return new Response(
      JSON.stringify({ 
        success: true, 
        batchId,
        listings: createdListings,
      }),
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
