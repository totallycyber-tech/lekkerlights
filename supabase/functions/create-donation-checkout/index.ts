import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Rate limiting store (in-memory, resets on function restart)
const rateLimitStore: Map<string, { count: number; resetTime: number }> = new Map();
const RATE_LIMIT_MAX = 5; // Max 5 donation attempts per hour
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in milliseconds

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return true;
  }

  record.count++;
  return false;
}

interface DonationRequest {
  amount: number; // Amount in cents (e.g., 5000 = R50)
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const clientIP = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || 
                     req.headers.get("cf-connecting-ip") || 
                     "unknown";

    // Check rate limit
    if (isRateLimited(clientIP)) {
      console.log(`Rate limit exceeded for IP: ${clientIP}`);
      return new Response(
        JSON.stringify({ error: "Too many donation attempts. Please try again later." }),
        {
          status: 429,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const { amount }: DonationRequest = await req.json();

    // Validate amount
    if (!amount || amount < 500) { // Minimum R5
      return new Response(
        JSON.stringify({ error: "Minimum donation amount is R5" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    if (amount > 1000000) { // Maximum R10,000
      return new Response(
        JSON.stringify({ error: "Maximum donation amount is R10,000" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const yocoSecretKey = Deno.env.get("YOCO_SECRET_KEY");
    if (!yocoSecretKey) {
      console.error("YOCO_SECRET_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Payment system not configured" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    // Get the origin for redirect URLs
    const origin = req.headers.get("origin") || "https://lekker-lights.lovable.app";

    console.log(`Creating Yoco checkout for amount: ${amount} cents`);

    // Create Yoco checkout session
    const yocoResponse = await fetch("https://payments.yoco.com/api/checkouts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${yocoSecretKey}`,
      },
      body: JSON.stringify({
        amount: amount,
        currency: "ZAR",
        successUrl: `${origin}/donate/success`,
        cancelUrl: `${origin}/donate/cancelled`,
        metadata: {
          type: "donation",
          source: "lekker-lights",
        },
      }),
    });

    if (!yocoResponse.ok) {
      const errorText = await yocoResponse.text();
      console.error("Yoco API error:", errorText);
      return new Response(
        JSON.stringify({ error: "Failed to create payment session" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const yocoData = await yocoResponse.json();
    console.log("Yoco checkout created successfully:", yocoData.id);

    return new Response(
      JSON.stringify({ redirectUrl: yocoData.redirectUrl }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in create-donation-checkout:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
