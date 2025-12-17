import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Restrict who can request the browser Google Maps key.
// Note: This does NOT replace HTTP referrer restrictions in Google Cloud Console.
const ALLOWED_ORIGIN_PATTERNS: RegExp[] = [
  /^https:\/\/([a-z0-9-]+\.)*lovable\.app$/i,
  /^https:\/\/([a-z0-9-]+\.)*lovableproject\.com$/i,
  /^https:\/\/([a-z0-9-]+\.)*lekkerlights\.co\.za$/i,
  /^http:\/\/localhost:\d+$/i,
  /^http:\/\/127\.0\.0\.1:\d+$/i,
];

function isAllowedOrigin(origin: string): boolean {
  return ALLOWED_ORIGIN_PATTERNS.some((re) => re.test(origin));
}

function getRequestOrigin(req: Request): string | null {
  const origin = req.headers.get("origin");
  if (origin && isAllowedOrigin(origin)) return origin;

  // Some clients might not send Origin (rare), so try Referer.
  const referer = req.headers.get("referer");
  if (referer) {
    try {
      const url = new URL(referer);
      const derivedOrigin = `${url.protocol}//${url.host}`;
      if (isAllowedOrigin(derivedOrigin)) return derivedOrigin;
    } catch {
      // ignore
    }
  }

  return null;
}

function corsHeadersFor(origin: string) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Vary": "Origin",
  };
}

// Rate limiting: 60 requests per minute per IP
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 60;
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }

  record.count++;
  return true;
}

serve(async (req) => {
  // Enforce origin allow-list (also for OPTIONS)
  const allowedOrigin = getRequestOrigin(req);

  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    if (!allowedOrigin) {
      return new Response(null, { status: 403 });
    }
    return new Response(null, { headers: corsHeadersFor(allowedOrigin) });
  }

  if (!allowedOrigin) {
    return new Response(
      JSON.stringify({ error: "Forbidden" }),
      {
        status: 403,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    // Rate limiting check
    const clientIP =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    if (!checkRateLimit(clientIP)) {
      console.log(`Rate limit exceeded for IP: ${clientIP}`);
      return new Response(
        JSON.stringify({ error: "Too many requests. Please try again later." }),
        {
          status: 429,
          headers: { ...corsHeadersFor(allowedOrigin), "Content-Type": "application/json" },
        }
      );
    }

    const apiKey = Deno.env.get("GOOGLE_MAPS_API_KEY");

    if (!apiKey) {
      console.error("GOOGLE_MAPS_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Google Maps API key not configured" }),
        {
          status: 500,
          headers: { ...corsHeadersFor(allowedOrigin), "Content-Type": "application/json" },
        }
      );
    }

    console.log("Successfully retrieved Google Maps API key for IP:", clientIP);

    return new Response(JSON.stringify({ apiKey }), {
      status: 200,
      headers: { ...corsHeadersFor(allowedOrigin), "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching API key:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      {
        status: 500,
        headers: { ...corsHeadersFor(allowedOrigin), "Content-Type": "application/json" },
      }
    );
  }
});
