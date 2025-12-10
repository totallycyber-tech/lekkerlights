import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ResendEditLinkRequest {
  email: string;
}

// Rate limiting
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 3;
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
    const { email }: ResendEditLinkRequest = await req.json();
    
    // Rate limiting
    const clientIP = getClientIP(req);
    const rateLimitKey = `${clientIP}:${email || 'unknown'}`;
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
    
    if (!email || !email.trim()) {
      return new Response(
        JSON.stringify({ success: false, error: "Email is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Resend edit link request for email: ${email}`);

    // Create Supabase client with service role to access edit_token
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Find all listings with this email (without edit_token - that's in separate secure table)
    const { data: listings, error } = await supabase
      .from("listings")
      .select("id, title")
      .eq("contact_email", email.trim().toLowerCase());

    if (error) {
      console.error("Database error:", error);
      throw new Error("Failed to look up listings");
    }

    // For security, always return success even if no listings found
    // This prevents email enumeration attacks
    if (!listings || listings.length === 0) {
      console.log("No listings found for email, returning success anyway");
      return new Response(
        JSON.stringify({ success: true, message: "If listings exist for this email, edit links have been sent." }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Found ${listings.length} listing(s) for email`);

    // Calculate new expiry time (1 hour from now)
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    const siteUrl = Deno.env.get("SITE_URL") || "https://lekkerlights.co.za";

    // Generate new tokens for each listing with fresh expiry
    const listingsHtml: string[] = [];
    
    for (const listing of listings) {
      // Generate a fresh token with new expiry
      const newToken = crypto.randomUUID();
      
      // Update the token in the database
      const { error: updateError } = await supabase
        .from("listing_edit_tokens")
        .update({ 
          edit_token: newToken,
          expires_at: expiresAt 
        })
        .eq("listing_id", listing.id);

      if (updateError) {
        console.error("Failed to update token for listing:", listing.id, updateError);
        continue; // Skip this listing but continue with others
      }

      const editLink = `${siteUrl}/edit-listing/${listing.id}?token=${newToken}`;
      const safeTitle = escapeHtml(listing.title);
      
      listingsHtml.push(`
        <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
          <h3 style="margin: 0 0 8px; color: #111827;">${safeTitle}</h3>
          <a href="${editLink}" style="display: inline-block; background: #dc2626; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-size: 14px;">Edit This Listing</a>
          <p style="color: #666; font-size: 11px; margin: 12px 0 0; word-break: break-all;">Link: ${editLink}</p>
        </div>
      `);
    }

    // Send email with all edit links
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
      },
      body: JSON.stringify({
        from: "Lekker Lights <noreply@lekkerlights.co.za>",
        to: [email.trim()],
        subject: `Your Lekker Lights Edit Links`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #dc2626;">🎄 Lekker Lights</h1>
            <h2>Your Edit Links</h2>
            <p>You requested your edit links for Lekker Lights. Here ${listings.length === 1 ? "is your listing" : "are your listings"}:</p>
            
            <div style="background: #fef3c7; padding: 12px 16px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
              <p style="margin: 0 0 8px; color: #92400e; font-weight: bold;">⏰ These links expire in 1 hour</p>
              <p style="margin: 0; color: #92400e; font-size: 14px;">
                For security, edit links are only valid for 1 hour. If they expire, simply request new ones using the "Lost Edit Link?" feature.
              </p>
            </div>
            
            ${listingsHtml.join("")}
            
            <p style="color: #666; font-size: 12px; margin-top: 24px;">
              If you didn't request this email, you can safely ignore it. Your listings remain unchanged.
            </p>
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
            <p style="color: #666; font-size: 12px;">
              © ${new Date().getFullYear()} Lekker Lights. All rights reserved.
            </p>
          </div>
        `,
      }),
    });

    const data = await res.json();
    console.log("Email sent:", data);

    return new Response(
      JSON.stringify({ success: true, message: "If listings exist for this email, edit links have been sent." }),
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
