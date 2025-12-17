import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ResendBatchLinkRequest {
  email: string;
}

// Rate limiting
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function getClientIP(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
         req.headers.get("x-real-ip") || 
         "unknown";
}

function checkRateLimit(identifier: string): { allowed: boolean; remainingTime?: number } {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(identifier, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true };
  }

  if (record.count >= RATE_LIMIT_MAX) {
    const remainingTime = Math.ceil((record.resetTime - now) / 1000 / 60);
    return { allowed: false, remainingTime };
  }

  record.count++;
  return { allowed: true };
}

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
    const { email }: ResendBatchLinkRequest = await req.json();

    if (!email || !email.trim()) {
      return new Response(
        JSON.stringify({ success: false, error: "Email required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Rate limiting
    const clientIP = getClientIP(req);
    const rateLimitKey = `${clientIP}:${email}`;
    const rateCheck = checkRateLimit(rateLimitKey);
    
    if (!rateCheck.allowed) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Too many requests. Please try again in ${rateCheck.remainingTime} minutes.` 
        }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Resending batch edit link for email: ${email}`);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find batch tokens for this email
    const { data: batchTokens, error: fetchError } = await supabase
      .from("batch_edit_tokens")
      .select("batch_id, edit_token")
      .eq("email", email.trim().toLowerCase());

    if (fetchError) {
      console.error("Error fetching batch tokens:", fetchError);
    }

    // Always return success (don't reveal if email exists)
    if (!batchTokens || batchTokens.length === 0) {
      console.log("No batch tokens found for email:", email);
      return new Response(
        JSON.stringify({ success: true }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const siteUrl = Deno.env.get("SITE_URL") || "https://lekkerlights.co.za";

    // Send email for each batch
    for (const token of batchTokens) {
      // Generate new token with fresh expiry
      const newToken = crypto.randomUUID();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
      
      await supabase
        .from("batch_edit_tokens")
        .update({ edit_token: newToken, expires_at: expiresAt })
        .eq("batch_id", token.batch_id);

      // Get listings for this batch
      const { data: listings } = await supabase
        .from("listings")
        .select("title")
        .eq("batch_id", token.batch_id);

      const listingTitles = listings?.map(l => `• ${escapeHtml(l.title || 'Untitled Display')}`).join("<br>") || "Your listings";
      const editLink = `${siteUrl}/edit-batch/${token.batch_id}?token=${newToken}`;

      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
        },
        body: JSON.stringify({
          from: "Lekker Lights <noreply@lekkerlights.co.za>",
          to: [email.trim()],
          subject: `Your Bulk Listings Edit Link - ${listings?.length || 0} displays`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <h1 style="color: #dc2626;">🎄 Lekker Lights</h1>
              <h2>Your Bulk Edit Link</h2>
              <p>Here's your edit link for the following listings:</p>
              <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
                ${listingTitles}
              </div>
              <div style="background: #fef3c7; padding: 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                <p style="color: #92400e; font-weight: bold; margin: 0 0 8px;">⏰ This link expires in 1 hour</p>
                <p style="color: #92400e; margin: 0; font-size: 14px;">
                  For security, this edit link is only valid for 1 hour.
                </p>
              </div>
              <p><a href="${editLink}" style="display: inline-block; background: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">Edit All Listings</a></p>
              <p style="color: #666; font-size: 12px; margin-top: 20px;">Link: ${editLink}</p>
            </div>
          `,
        }),
      });
    }

    console.log(`Sent ${batchTokens.length} batch edit link(s) to ${email}`);

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
