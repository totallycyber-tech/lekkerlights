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

    // Check if token already exists for this listing
    const { data: existingToken } = await supabase
      .from("listing_edit_tokens")
      .select("edit_token")
      .eq("listing_id", listingId)
      .single();

    let editToken: string;

    if (existingToken) {
      editToken = existingToken.edit_token;
    } else {
      // Create new token
      const { data: newToken, error: insertError } = await supabase
        .from("listing_edit_tokens")
        .insert({ listing_id: listingId })
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
            <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
              <p style="color: #dc2626; font-weight: bold;">⚠️ SAVE THIS EMAIL</p>
              <p>This email contains your secure edit link. Keep it safe!</p>
            </div>
            <p><a href="${editLink}" style="display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Edit Your Listing</a></p>
            <p style="color: #666; font-size: 12px; margin-top: 20px;">Link: ${editLink}</p>
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
