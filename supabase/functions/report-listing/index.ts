import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ReportListingRequest {
  listingId: string;
  listingTitle: string;
  reason: string;
  additionalDetails: string;
  reporterName: string;
  reporterEmail: string;
  reporterPhone: string;
  reportedAt: string;
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

// In-memory rate limiting store (resets when function cold starts)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT_MAX = 3; // Max 3 reports per window
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour window

function checkRateLimit(identifier: string): { allowed: boolean; remainingTime?: number } {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  if (!record || now > record.resetTime) {
    // Create new rate limit record
    rateLimitStore.set(identifier, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true };
  }

  if (record.count >= RATE_LIMIT_MAX) {
    const remainingTime = Math.ceil((record.resetTime - now) / 1000 / 60); // minutes
    return { allowed: false, remainingTime };
  }

  // Increment count
  record.count++;
  rateLimitStore.set(identifier, record);
  return { allowed: true };
}

function getClientIP(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
         req.headers.get("x-real-ip") || 
         "unknown";
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      listingId,
      listingTitle,
      reason,
      additionalDetails,
      reporterName,
      reporterEmail,
      reporterPhone,
      reportedAt,
    }: ReportListingRequest = await req.json();

    // Rate limiting based on IP + listing combination
    const clientIP = getClientIP(req);
    const rateLimitKey = `${clientIP}:${listingId}`;
    
    const rateLimit = checkRateLimit(rateLimitKey);
    if (!rateLimit.allowed) {
      console.log(`Rate limit exceeded for ${clientIP} on listing ${listingId}`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Too many reports. Please try again in ${rateLimit.remainingTime} minutes.` 
        }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Report received for listing: ${listingTitle} (${listingId}) from IP: ${clientIP}`);
    console.log(`Reason: ${reason}`);

    // Escape user content for HTML
    const safeTitle = escapeHtml(listingTitle);
    const safeReason = escapeHtml(reason);
    const safeDetails = additionalDetails ? escapeHtml(additionalDetails) : '';
    const safeName = escapeHtml(reporterName);
    const safeEmail = reporterEmail ? escapeHtml(reporterEmail) : '';
    const safePhone = reporterPhone ? escapeHtml(reporterPhone) : '';

    const siteUrl = Deno.env.get("SITE_URL") || "https://lekkerlights.co.za";
    const listingUrl = `${siteUrl}/listing/${listingId}`;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
      },
      body: JSON.stringify({
        from: "Lekker Lights Reports <onboarding@resend.dev>",
        to: ["totallycyber.tech@gmail.com"],
        subject: `🚨 Listing Report: ${safeReason} - ${safeTitle}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #dc2626;">🚨 Listing Report</h1>
            
            <div style="background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin: 20px 0;">
              <h2 style="margin: 0 0 8px; color: #991b1b; font-size: 18px;">Report Details</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #666; width: 140px;"><strong>Reason:</strong></td>
                  <td style="padding: 8px 0; color: #111;">${safeReason}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;"><strong>Date & Time:</strong></td>
                  <td style="padding: 8px 0; color: #111;">${new Date(reportedAt).toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg' })}</td>
                </tr>
              </table>
            </div>

            <div style="background: #f3f4f6; border-radius: 8px; padding: 16px; margin: 20px 0;">
              <h3 style="margin: 0 0 12px; color: #111; font-size: 16px;">Listing Information</h3>
              <p style="margin: 0 0 8px;"><strong>Title:</strong> ${safeTitle}</p>
              <p style="margin: 0 0 8px;"><strong>ID:</strong> ${listingId}</p>
              <p style="margin: 0;"><a href="${listingUrl}" style="color: #dc2626;">View Listing →</a></p>
            </div>

            ${safeDetails ? `
            <div style="background: #fffbeb; border: 1px solid #fde68a; border-radius: 8px; padding: 16px; margin: 20px 0;">
              <h3 style="margin: 0 0 8px; color: #92400e; font-size: 16px;">Additional Details</h3>
              <p style="margin: 0; color: #111; white-space: pre-wrap;">${safeDetails}</p>
            </div>
            ` : ''}

            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 20px 0;">
              <h3 style="margin: 0 0 12px; color: #166534; font-size: 16px;">Reporter Contact</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 4px 0; color: #666; width: 80px;"><strong>Name:</strong></td>
                  <td style="padding: 4px 0; color: #111;">${safeName}</td>
                </tr>
                ${safeEmail ? `
                <tr>
                  <td style="padding: 4px 0; color: #666;"><strong>Email:</strong></td>
                  <td style="padding: 4px 0; color: #111;"><a href="mailto:${safeEmail}" style="color: #dc2626;">${safeEmail}</a></td>
                </tr>
                ` : ''}
                ${safePhone ? `
                <tr>
                  <td style="padding: 4px 0; color: #666;"><strong>Phone:</strong></td>
                  <td style="padding: 4px 0; color: #111;"><a href="tel:${safePhone}" style="color: #dc2626;">${safePhone}</a></td>
                </tr>
                ` : ''}
              </table>
            </div>

            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
            <p style="color: #666; font-size: 12px; text-align: center;">
              This report was submitted via Lekker Lights
            </p>
          </div>
        `,
      }),
    });

    const data = await res.json();
    console.log("Report email sent:", data);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error sending report:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);