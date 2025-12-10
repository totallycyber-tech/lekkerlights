import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface CreateTokenRequest {
  listingId: string;
  email: string;
  listingTitle: string;
}

// HTML escape function to prevent injection
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
    const { listingId, email, listingTitle }: CreateTokenRequest = await req.json();

    if (!listingId || !email || !listingTitle) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Creating token and sending edit link for listing: ${listingId}`);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Calculate expiry time (1 hour from now)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();

    // Check if token already exists for this listing
    const { data: existingToken } = await supabase
      .from("listing_edit_tokens")
      .select("edit_token")
      .eq("listing_id", listingId)
      .single();

    let editToken: string;

    if (existingToken) {
      // Update existing token with new value and fresh expiry
      const newToken = crypto.randomUUID();
      const { error: updateError } = await supabase
        .from("listing_edit_tokens")
        .update({ 
          edit_token: newToken,
          expires_at: expiresAt 
        })
        .eq("listing_id", listingId);

      if (updateError) {
        console.error("Failed to update token:", updateError);
        return new Response(
          JSON.stringify({ success: false, error: "Failed to create edit token" }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      editToken = newToken;
    } else {
      // Create new token with expiry
      const { data: newToken, error: insertError } = await supabase
        .from("listing_edit_tokens")
        .insert({ 
          listing_id: listingId,
          expires_at: expiresAt
        })
        .select("edit_token")
        .single();

      if (insertError || !newToken) {
        console.error("Failed to create token:", insertError);
        return new Response(
          JSON.stringify({ success: false, error: "Failed to create edit token" }),
          { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      editToken = newToken.edit_token;
    }

    // Send email with edit link
    const siteUrl = Deno.env.get("SITE_URL") || "https://lekkerlights.co.za";
    const editLink = `${siteUrl}/edit-listing/${listingId}?token=${editToken}`;
    const safeTitle = escapeHtml(listingTitle);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
      },
      body: JSON.stringify({
        from: "Lekker Lights <noreply@lekkerlights.co.za>",
        to: [email],
        subject: `Your Listing Edit Link - ${safeTitle}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #dc2626;">🎄 Lekker Lights</h1>
            <h2>Your Listing is Live!</h2>
            <p>Thank you for listing "<strong>${safeTitle}</strong>" on Lekker Lights!</p>
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
              Need a new edit link? Visit <a href="${siteUrl}/resend-edit-link" style="color: #dc2626;">our website</a> and use the "Lost Edit Link?" feature.
            </p>
          </div>
        `,
      }),
    });

    const data = await res.json();
    console.log("Email sent:", data);

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
