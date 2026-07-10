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
    const { assessmentType, roleType } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log(`Generating ${assessmentType} assessment for role: ${roleType || 'general'}`);

    // Define system prompts for different assessment types
    const systemPrompts = {
      aptitude: `You are an expert in creating aptitude tests for business roles. Generate 15 multiple-choice questions that test:
- Logical reasoning
- Numerical ability
- Data interpretation
- Problem-solving skills
Focus on practical business scenarios. Each question should have 4 options with only one correct answer.`,

      psychometric: `You are a psychometric assessment expert. Generate 15 multiple-choice questions that evaluate:
- Personality traits relevant to business roles
- Work style preferences
- Decision-making approach
- Interpersonal skills
- Stress management
Each question should have 4 options. No correct/wrong answers, just different personality indicators.`,

      gk: `You are a business knowledge expert. Generate 15 multiple-choice questions about:
- Current business trends in India
- Basic business terminology
- Industry knowledge
- Professional communication
- Workplace etiquette
Each question should have 4 options with only one correct answer.`,

      final_role: `You are a role-specific assessment expert. Generate 15 advanced multiple-choice questions specifically for ${roleType || 'the assigned role'}.
Test deep knowledge and practical skills required for this specific role.
Each question should have 4 options with only one correct answer.`
    };

    const systemPrompt = systemPrompts[assessmentType as keyof typeof systemPrompts] || systemPrompts.aptitude;

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
          { 
            role: 'user', 
            content: `Generate 15 questions. Return ONLY a valid JSON array with this exact structure:
[
  {
    "question": "Question text here",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Brief explanation of the correct answer",
    "category": "Category name"
  }
]
For psychometric tests, set correctAnswer to -1 (no right answer).
Make questions practical and relevant to Indian business context.`
          }
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
    const jsonMatch = generatedText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error('Failed to parse questions from AI response');
    }

    const questions = JSON.parse(jsonMatch[0]);
    
    console.log(`Successfully generated ${questions.length} questions for ${assessmentType}`);

    return new Response(
      JSON.stringify({ questions }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-assessment:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});