import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ContactUsRequest {
  name: string;
  email: string;
  message: string;
  submittedAt: string;
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

const RATE_LIMIT_MAX = 3; // Max 3 messages per window
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour window

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
    const { name, email, message, submittedAt }: ContactUsRequest = await req.json();

    // Input validation
    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ success: false, error: "All fields are required." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (name.length > 100 || email.length > 255 || message.length > 2000) {
      return new Response(
        JSON.stringify({ success: false, error: "Input exceeds maximum length." }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Rate limiting based on IP + email combination
    const clientIP = getClientIP(req);
    const rateLimitKey = `${clientIP}:${email}`;
    
    const rateLimit = checkRateLimit(rateLimitKey);
    if (!rateLimit.allowed) {
      console.log(`Rate limit exceeded for ${clientIP} with email ${email}`);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Too many messages. Please try again in ${rateLimit.remainingTime} minutes.` 
        }),
        { status: 429, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log(`Contact form received from: ${name} (${email})`);

    // Escape user content for HTML
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safeMessage = escapeHtml(message);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("RESEND_API_KEY")}`,
      },
      body: JSON.stringify({
        from: "Lekker Lights Contact <noreply@lekkerlights.co.za>",
        to: ["lekkerlights.za@gmail.com"],
        subject: `💬 Contact Form: Message from ${safeName}`,
        reply_to: email,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #16a34a;">💬 New Contact Form Message</h1>
            
            <div style="background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 16px; margin: 20px 0;">
              <h2 style="margin: 0 0 12px; color: #166534; font-size: 18px;">Sender Details</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #666; width: 100px;"><strong>Name:</strong></td>
                  <td style="padding: 8px 0; color: #111;">${safeName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;"><strong>Email:</strong></td>
                  <td style="padding: 8px 0; color: #111;"><a href="mailto:${safeEmail}" style="color: #16a34a;">${safeEmail}</a></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;"><strong>Sent:</strong></td>
                  <td style="padding: 8px 0; color: #111;">${new Date(submittedAt).toLocaleString('en-ZA', { timeZone: 'Africa/Johannesburg' })}</td>
                </tr>
              </table>
            </div>

            <div style="background: #f3f4f6; border-radius: 8px; padding: 16px; margin: 20px 0;">
              <h3 style="margin: 0 0 12px; color: #111; font-size: 16px;">Message</h3>
              <p style="margin: 0; color: #111; white-space: pre-wrap; line-height: 1.6;">${safeMessage}</p>
            </div>

            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
            <p style="color: #666; font-size: 12px; text-align: center;">
              This message was submitted via the Lekker Lights contact form.<br>
              You can reply directly to this email to respond to ${safeName}.
            </p>
          </div>
        `,
      }),
    });

    const data = await res.json();
    console.log("Contact email sent:", data);

    if (!res.ok) {
      throw new Error(data.message || "Failed to send email");
    }

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error sending contact form:", error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);