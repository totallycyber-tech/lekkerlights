import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const { email, listingTitle, editToken, listingId }: SendEditLinkRequest = await req.json();
    
    // Input validation
    if (!email || !listingTitle || !editToken || !listingId) {
      return new Response(
        JSON.stringify({ success: false, error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Rate limiting
    const clientIP = getClientIP(req);
    const rateLimitKey = `${clientIP}:${email}`;
    const rateCheck = checkRateLimit(rateLimitKey);
    
    if (!rateCheck.allowed) {
      console.log(`Rate limit exceeded for ${rateLimitKey}`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Too many requests. Please try again in ${rateCheck.remainingTime} minutes.` 
        }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Validating edit link request for listing: ${listingId}`);

    // Create Supabase client with service role to validate token
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Verify listing exists and get details (without edit_token - that's in separate secure table)
    const { data: listing, error: dbError } = await supabase
      .from("listings")
      .select("id, title, contact_email")
      .eq("id", listingId)
      .single();

    if (dbError || !listing) {
      console.error("Listing not found:", dbError);
      return new Response(
        JSON.stringify({ success: false, error: "Listing not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get token from secure tokens table
    const { data: tokenRecord, error: tokenError } = await supabase
      .from("listing_edit_tokens")
      .select("edit_token")
      .eq("listing_id", listingId)
      .single();

    if (tokenError || !tokenRecord) {
      console.error("Token not found:", tokenError);
      return new Response(
        JSON.stringify({ success: false, error: "Listing not found" }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate that the provided editToken matches the one in the secure table
    if (tokenRecord.edit_token !== editToken) {
      console.error("Edit token mismatch for listing:", listingId);
      return new Response(
        JSON.stringify({ success: false, error: "Invalid edit token" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate that the email matches the listing's contact email
    if (listing.contact_email?.toLowerCase() !== email.trim().toLowerCase()) {
      console.error("Email mismatch for listing:", listingId);
      return new Response(
        JSON.stringify({ success: false, error: "Email does not match listing" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate that the email matches the listing's contact email
    if (listing.contact_email?.toLowerCase() !== email.trim().toLowerCase()) {
      console.error("Email mismatch for listing:", listingId);
      return new Response(
        JSON.stringify({ success: false, error: "Email does not match listing" }),
        { status: 403, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Sending edit link email to ${email} for listing: ${listing.title}`);

    const siteUrl = Deno.env.get("SITE_URL") || "https://lekkerlights.co.za";
    const editLink = `${siteUrl}/edit-listing/${listingId}?token=${editToken}`;
    
    // Escape user content for HTML
    const safeTitle = escapeHtml(listing.title);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
      },
      body: JSON.stringify({
        from: "Lekker Lights <onboarding@resend.dev>",
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
