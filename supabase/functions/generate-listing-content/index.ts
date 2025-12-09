import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, tags, existingTitle, existingDescription } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    let systemPrompt = '';
    let userPrompt = '';

    if (type === 'title') {
      systemPrompt = `You are a creative assistant helping homeowners name their Christmas light displays. Generate catchy, festive, and memorable display titles. Keep titles concise (3-6 words). Do not use generic names. Be creative and unique.`;
      
      const tagContext = tags?.length > 0 
        ? `The display features: ${tags.join(', ')}.` 
        : '';
      const descContext = existingDescription 
        ? `Description of the display: "${existingDescription}"` 
        : '';
      
      userPrompt = `Generate a single creative title for a Christmas light display. ${tagContext} ${descContext}

Return ONLY the title text, nothing else. No quotes, no explanation.`;
    } else if (type === 'description') {
      systemPrompt = `You are a creative assistant helping homeowners write descriptions for their Christmas light displays. Write engaging, warm, and inviting descriptions that make visitors excited to see the display. Keep descriptions between 2-4 sentences.`;
      
      const tagContext = tags?.length > 0 
        ? `The display features: ${tags.join(', ')}.` 
        : '';
      const titleContext = existingTitle 
        ? `The display is called: "${existingTitle}"` 
        : '';
      
      userPrompt = `Write a short, engaging description for a Christmas light display. ${titleContext} ${tagContext}

Return ONLY the description text, nothing else. No quotes around it, no explanation. 2-4 sentences maximum.`;
    } else {
      return new Response(JSON.stringify({ error: 'Invalid type. Use "title" or "description".' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Generating ${type} with Lovable AI...`);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI service temporarily unavailable.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.choices?.[0]?.message?.content?.trim() || '';

    console.log(`Generated ${type}:`, generatedText);

    return new Response(JSON.stringify({ text: generatedText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-listing-content:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate content';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
