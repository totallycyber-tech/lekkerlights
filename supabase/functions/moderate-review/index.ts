import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { listing_id, rating, comment } = await req.json();

    if (!listing_id || !rating) {
      return new Response(
        JSON.stringify({ error: 'listing_id and rating are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (rating < 1 || rating > 5) {
      return new Response(
        JSON.stringify({ error: 'Rating must be between 1 and 5' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Supabase configuration missing');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    let moderationStatus = 'approved';
    let moderationReason: string | null = null;

    // Only moderate if there's a comment
    if (comment && comment.trim() && LOVABLE_API_KEY) {
      console.log('Moderating comment:', comment);
      
      try {
        const moderationResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash-lite',
            messages: [
              {
                role: 'system',
                content: `You are a content moderator for a Christmas lights display website. Analyze the review comment and determine if it should be approved or rejected.

REJECT comments that contain:
- Profanity, slurs, or offensive language
- Personal attacks or harassment
- Personal contact information (phone numbers, emails, addresses)
- Promotional content or spam
- Inappropriate sexual content
- Threats or incitement to violence
- Discriminatory content

APPROVE comments that are:
- Genuine reviews about Christmas light displays
- Constructive feedback (positive or negative)
- Appropriate for all ages

Respond ONLY with a JSON object: {"status": "approved" or "rejected", "reason": "brief explanation if rejected, null if approved"}`
              },
              {
                role: 'user',
                content: `Review comment to moderate: "${comment}"`
              }
            ],
          }),
        });

        if (moderationResponse.ok) {
          const aiData = await moderationResponse.json();
          const content = aiData.choices?.[0]?.message?.content;
          console.log('AI moderation response:', content);
          
          if (content) {
            try {
              // Extract JSON from the response
              const jsonMatch = content.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                const result = JSON.parse(jsonMatch[0]);
                moderationStatus = result.status === 'rejected' ? 'rejected' : 'approved';
                moderationReason = result.reason || null;
              }
            } catch (parseError) {
              console.error('Failed to parse moderation response:', parseError);
              // Default to flagged if we can't parse the response
              moderationStatus = 'flagged';
              moderationReason = 'Unable to determine content appropriateness';
            }
          }
        } else {
          const errorText = await moderationResponse.text();
          console.error('Moderation API error:', moderationResponse.status, errorText);
          
          if (moderationResponse.status === 429) {
            moderationStatus = 'flagged';
            moderationReason = 'Rate limit exceeded, pending manual review';
          } else if (moderationResponse.status === 402) {
            moderationStatus = 'flagged';
            moderationReason = 'Service temporarily unavailable';
          } else {
            moderationStatus = 'flagged';
            moderationReason = 'Moderation service error';
          }
        }
      } catch (aiError) {
        console.error('AI moderation error:', aiError);
        moderationStatus = 'flagged';
        moderationReason = 'Moderation service unavailable';
      }
    }

    // Insert the review with moderation status
    const { data: review, error: insertError } = await supabase
      .from('reviews')
      .insert({
        listing_id,
        rating,
        comment: comment?.trim() || null,
        moderation_status: moderationStatus,
        moderation_reason: moderationReason,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Failed to insert review:', insertError);
      return new Response(
        JSON.stringify({ error: 'Failed to save review' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Review saved:', review.id, 'Status:', moderationStatus);

    return new Response(
      JSON.stringify({ 
        success: true, 
        review_id: review.id,
        status: moderationStatus,
        message: moderationStatus === 'approved' 
          ? 'Thank you for your review!' 
          : moderationStatus === 'rejected'
          ? 'Your review could not be posted due to content policy violations.'
          : 'Your review has been submitted and is pending moderation.'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in moderate-review function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
