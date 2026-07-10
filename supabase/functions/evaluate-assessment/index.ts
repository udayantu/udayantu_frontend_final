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
    const { questions, answers, assessmentType } = await req.json();
    
    console.log(`Evaluating ${assessmentType} assessment with ${Object.keys(answers).length} answers`);

    let score = 0;
    let totalQuestions = questions.length;
    const analysis: any = {
      correctAnswers: 0,
      incorrectAnswers: 0,
      categoryScores: {} as Record<string, { correct: number; total: number }>,
      strengths: [] as string[],
      improvements: [] as string[],
    };

    // Calculate score for objective tests
    if (assessmentType !== 'psychometric') {
      questions.forEach((question: any, index: number) => {
        const userAnswer = answers[index];
        const isCorrect = userAnswer === question.correctAnswer;
        
        if (isCorrect) {
          score++;
          analysis.correctAnswers++;
        } else {
          analysis.incorrectAnswers++;
        }

        // Track category-wise performance
        const category = question.category || 'General';
        if (!analysis.categoryScores[category]) {
          analysis.categoryScores[category] = { correct: 0, total: 0 };
        }
        analysis.categoryScores[category].total++;
        if (isCorrect) {
          analysis.categoryScores[category].correct++;
        }
      });

      // Calculate percentage
      score = Math.round((score / totalQuestions) * 100);

      // Identify strengths and improvements
      Object.entries(analysis.categoryScores).forEach(([category, scores]: [string, any]) => {
        const categoryPercent = (scores.correct / scores.total) * 100;
        if (categoryPercent >= 70) {
          analysis.strengths.push(category);
        } else if (categoryPercent < 50) {
          analysis.improvements.push(category);
        }
      });
    } else {
      // For psychometric tests, analyze personality traits
      const traitCounts: Record<string, number> = {};
      
      questions.forEach((question: any, index: number) => {
        const userAnswer = answers[index];
        const trait = question.category || 'General';
        
        if (!traitCounts[trait]) {
          traitCounts[trait] = 0;
        }
        traitCounts[trait]++;
      });

      analysis.personalityProfile = traitCounts;
      score = 100; // Psychometric tests don't have right/wrong answers
    }

    console.log(`Assessment evaluated. Score: ${score}%`);

    return new Response(
      JSON.stringify({ score, analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in evaluate-assessment:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});