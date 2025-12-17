import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Resend } from "https://esm.sh/resend@2.0.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerifyEmailRequest {
  listingId: string;
  email: string;
}

// Rate limiting
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour

function getClientIP(req: Request): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
         req.headers.get('x-real-ip') || 
         'unknown';
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
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { listingId, email }: VerifyEmailRequest = await req.json();

    if (!listingId || !email) {
      return new Response(
        JSON.stringify({ error: 'Listing ID and email are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Rate limiting
    const clientIP = getClientIP(req);
    const rateLimitKey = `${clientIP}:${normalizedEmail}`;
    const rateCheck = checkRateLimit(rateLimitKey);
    
    if (!rateCheck.allowed) {
      return new Response(
        JSON.stringify({ 
          error: `Too many attempts. Please try again in ${rateCheck.remainingTime} minutes.` 
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if this is a single listing or part of a batch
    const { data: listing, error: listingError } = await supabase
      .from('listings')
      .select('id, contact_email, batch_id, title, street_number, street_name, suburb, city')
      .eq('id', listingId)
      .maybeSingle();

    if (listingError || !listing) {
      console.error('Listing fetch error:', listingError);
      return new Response(
        JSON.stringify({ error: 'Listing not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Verify email matches
    if (listing.contact_email?.toLowerCase().trim() !== normalizedEmail) {
      console.log('Email mismatch:', listing.contact_email, 'vs', normalizedEmail);
      return new Response(
        JSON.stringify({ error: 'Email address does not match our records for this listing' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate new edit token
    const newToken = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour

    let editUrl: string;
    let isBatch = false;

    if (listing.batch_id) {
      // This is a batch listing - update batch_edit_tokens
      isBatch = true;
      const { error: updateError } = await supabase
        .from('batch_edit_tokens')
        .update({ edit_token: newToken, expires_at: expiresAt })
        .eq('batch_id', listing.batch_id);

      if (updateError) {
        console.error('Batch token update error:', updateError);
        return new Response(
          JSON.stringify({ error: 'Failed to generate edit token' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const siteUrl = Deno.env.get('SITE_URL') || 'https://lekkerlights.co.za';
      editUrl = `${siteUrl}/edit-batch/${listing.batch_id}?token=${newToken}`;
    } else {
      // This is a single listing - update listing_edit_tokens
      const { error: updateError } = await supabase
        .from('listing_edit_tokens')
        .upsert({ 
          listing_id: listingId, 
          edit_token: newToken, 
          expires_at: expiresAt 
        });

      if (updateError) {
        console.error('Token update error:', updateError);
        return new Response(
          JSON.stringify({ error: 'Failed to generate edit token' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const siteUrl = Deno.env.get('SITE_URL') || 'https://lekkerlights.co.za';
      editUrl = `${siteUrl}/edit/${listingId}?token=${newToken}`;
    }

    // Send email in background (don't wait for it)
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (resendApiKey) {
      const resend = new Resend(resendApiKey);
      const listingTitle = listing.title || `${listing.street_number} ${listing.street_name}, ${listing.suburb}`;
      
      resend.emails.send({
        from: 'Lekker Lights <noreply@lekkerlights.co.za>',
        to: [normalizedEmail],
        subject: `Edit Link for Your Lekker Lights Listing`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #16a34a;">🎄 Edit Your Listing</h1>
            <p>Hi there!</p>
            <p>Here's your edit link for <strong>${escapeHtml(listingTitle)}</strong>:</p>
            <p style="margin: 20px 0;">
              <a href="${editUrl}" 
                 style="background-color: #16a34a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Edit Listing
              </a>
            </p>
            <p style="color: #666; font-size: 14px;">This link is valid for 1 hour only.</p>
            <p style="color: #666; font-size: 14px;">If you didn't request this, you can safely ignore this email.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
            <p style="color: #999; font-size: 12px;">
              Lekker Lights - South Africa's Festive Lights Community
            </p>
          </div>
        `,
      }).catch(err => console.error('Email send error:', err));
    }

    console.log('Edit verified for listing:', listingId, 'batch:', isBatch);

    return new Response(
      JSON.stringify({ 
        success: true, 
        editUrl,
        isBatch,
        message: 'Email verified. You can now edit your listing.'
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in verify-email-for-edit:', error);
    return new Response(
      JSON.stringify({ error: 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
};

serve(handler);
