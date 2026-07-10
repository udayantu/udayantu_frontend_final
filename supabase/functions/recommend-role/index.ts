import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { aptitudeScore, psychometricProfile, gkScore, desiredRole } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Generating role recommendation based on assessment results');

    const systemPrompt = `You are an expert career counselor specializing in business roles. Based on assessment results, recommend the most suitable role from these options:
- BD (Business Development)
- CS (Customer Success)
- PM (Product Management)
- Ops (Operations)
- Product (Product Development)
- HR (Human Resources)
- MM (Marketing Management)
- CSP (Customer Support)

Consider the candidate's aptitude, personality traits, knowledge, and preferences.`;

    const userPrompt = `Based on these assessment results, recommend the best role:

Aptitude Score: ${aptitudeScore}%
General Knowledge Score: ${gkScore}%
Psychometric Profile: ${JSON.stringify(psychometricProfile)}
Desired Role: ${desiredRole}

Provide:
1. Recommended role (one of: BD, CS, PM, Ops, Product, HR, MM, CSP)
2. Confidence score (0-100)
3. Brief reasoning (2-3 sentences)
4. Alternative roles if applicable

Return ONLY a valid JSON object with this structure:
{
  "recommendedRole": "Role abbreviation",
  "confidence": 85,
  "reasoning": "Explanation here",
  "alternativeRoles": ["Role1", "Role2"]
}`;

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
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Payment required. Please add credits to your workspace.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.choices[0].message.content;
    
    // Extract JSON from the response
    const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Failed to parse recommendation from AI response');
    }

    const recommendation = JSON.parse(jsonMatch[0]);
    
    console.log(`Role recommendation: ${recommendation.recommendedRole} (${recommendation.confidence}% confidence)`);

    return new Response(
      JSON.stringify(recommendation),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in recommend-role:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});