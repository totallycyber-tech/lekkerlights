import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CreateListingRequest {
  title?: string | null;
  description?: string | null;
  streetNumber: string;
  streetName: string;
  suburb: string;
  city: string;
  province: string;
  postalCode: string;
  complexName?: string | null;
  unitNo?: string | null;
  contactEmail: string;
  contactName?: string | null;
  contactPhone?: string | null;
  nameVisible: boolean;
  emailVisible: boolean;
  phoneVisible: boolean;
  youtubeUrls?: string[];
  tags?: string[];
  operatingHours?: any;
  parkingInfo?: string | null;
  maxVisitors?: number | null;
  gateAccessInfo?: string | null;
  hasCoverPhoto?: boolean;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: CreateListingRequest = await req.json();
    const {
      title,
      description,
      streetNumber,
      streetName,
      suburb,
      city,
      province,
      postalCode,
      complexName,
      unitNo,
      contactEmail,
      contactName,
      contactPhone,
      nameVisible,
      emailVisible,
      phoneVisible,
      youtubeUrls,
      tags,
      operatingHours,
      parkingInfo,
      maxVisitors,
      gateAccessInfo,
      hasCoverPhoto,
    } = body;

    // Validate required fields
    if (!streetNumber || !streetName || !suburb || !city || !province || !postalCode) {
      return new Response(
        JSON.stringify({ success: false, error: "Address fields are required" }),
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

    console.log(`Creating single listing for ${contactEmail} at ${streetNumber} ${streetName}`);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check for duplicate address
    const { data: existing } = await supabase
      .from("listings")
      .select("id")
      .ilike("street_number", streetNumber.trim())
      .ilike("street_name", streetName.trim())
      .ilike("suburb", suburb.trim())
      .ilike("city", city.trim());

    if (existing && existing.length > 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: `This address is already listed. If this is your listing, you can request an edit link.`,
        }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Create the listing
    const { data: newListing, error: insertError } = await supabase
      .from("listings")
      .insert({
        title: title || null,
        description: description || null,
        street_number: streetNumber,
        street_name: streetName,
        suburb: suburb,
        city: city,
        province: province,
        postal_code: postalCode,
        complex_name: complexName || null,
        unit_no: unitNo || null,
        contact_email: contactEmail.trim(),
        contact_name: contactName || null,
        contact_phone: contactPhone || null,
        name_visible: nameVisible,
        email_visible: emailVisible,
        phone_visible: phoneVisible,
        youtube_urls: youtubeUrls || [],
        tags: tags || [],
        operating_hours: operatingHours || {},
        parking_info: parkingInfo || null,
        max_visitors: maxVisitors || null,
        gate_access_info: gateAccessInfo || null,
        has_cover_photo: hasCoverPhoto || false,
        image_urls: [],
      })
      .select("id")
      .single();

    if (insertError || !newListing) {
      console.error("Failed to create listing:", insertError);
      return new Response(
        JSON.stringify({ success: false, error: `Failed to create listing: ${insertError?.message}` }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Created listing with ID: ${newListing.id}`);

    // Geocode the address
    try {
      const fullAddress = [
        streetNumber,
        streetName,
        suburb,
        city,
        province,
        postalCode,
        'South Africa'
      ].filter(Boolean).join(', ');

      const googleMapsKey = Deno.env.get("GOOGLE_MAPS_SERVER_API_KEY");
      if (googleMapsKey) {
        console.log(`Geocoding address for listing ${newListing.id}: ${fullAddress}`);
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
          console.log(`Geocoded listing ${newListing.id}: ${lat}, ${lng}`);
        }
      }
    } catch (geocodeError) {
      console.error("Geocode error:", geocodeError);
      // Don't fail the request if geocoding fails
    }

    // Create edit token
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    const { data: tokenData, error: tokenError } = await supabase
      .from("listing_edit_tokens")
      .insert({
        listing_id: newListing.id,
        expires_at: expiresAt,
      })
      .select("edit_token")
      .single();

    if (tokenError || !tokenData) {
      console.error("Failed to create edit token:", tokenError);
      return new Response(
        JSON.stringify({ success: false, error: "Failed to create edit token" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Send email with edit link
    const siteUrl = Deno.env.get("SITE_URL") || "https://lekkerlights.co.za";
    const editLink = `${siteUrl}/edit/${newListing.id}?token=${tokenData.edit_token}`;
    const displayTitle = title || `${streetNumber} ${streetName}, ${suburb}`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
      },
      body: JSON.stringify({
        from: "Lekker Lights <noreply@lekkerlights.co.za>",
        to: [contactEmail.trim()],
        subject: `Your Listing Edit Link - ${displayTitle}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #dc2626;">🎄 Lekker Lights</h1>
            <h2>Your Listing is Live!</h2>
            <p>Thank you for listing your Christmas display on Lekker Lights:</p>
            <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
              <strong>${displayTitle}</strong>
            </div>
            <div style="background: #fef3c7; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <p style="color: #92400e; font-weight: bold; margin: 0 0 8px;">⏰ This link expires in 1 hour</p>
              <p style="color: #92400e; margin: 0; font-size: 14px;">
                For security, this edit link is only valid for 1 hour. If it expires, you can request a new one using the "Lost Edit Link?" feature on our website.
              </p>
            </div>
            <p><a href="${editLink}" style="display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Edit Your Listing</a></p>
            <p style="color: #666; font-size: 12px; margin-top: 20px;">Link: ${editLink}</p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
            <p style="color: #666; font-size: 12px;">
              Need a new edit link? Visit <a href="${siteUrl}/resend-edit-link" style="color: #dc2626;">our website</a> to request one.
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
        listingId: newListing.id,
        editToken: tokenData.edit_token,
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
