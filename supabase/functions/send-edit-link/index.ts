import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SendEditLinkRequest {
  email: string;
  listingTitle: string;
  editToken: string;
  listingId: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, listingTitle, editToken, listingId }: SendEditLinkRequest = await req.json();
    console.log(`Sending edit link email to ${email} for listing: ${listingTitle}`);

    const siteUrl = Deno.env.get("SITE_URL") || "https://lekkerlights.co.za";
    const editLink = `${siteUrl}/edit-listing/${listingId}?token=${editToken}`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
      },
      body: JSON.stringify({
        from: "Lekker Lights <onboarding@resend.dev>",
        to: [email],
        subject: `Your Listing Edit Link - ${listingTitle}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #dc2626;">🎄 Lekker Lights</h1>
            <h2>Your Listing is Live!</h2>
            <p>Thank you for listing "<strong>${listingTitle}</strong>" on Lekker Lights!</p>
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

    return new Response(JSON.stringify({ success: true, data }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);
