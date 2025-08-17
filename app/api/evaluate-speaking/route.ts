import { NextRequest, NextResponse } from 'next/server';
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

export async function POST(request: NextRequest) {
  try {
    const { responses } = await request.json();

    if (!responses || !Array.isArray(responses) || responses.length === 0) {
      return NextResponse.json(
        { error: 'Responses array is required' },
        { status: 400 }
      );
    }

    // Check for API key
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY && !process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Google AI API key not configured' },
        { status: 500 }
      );
    }

    // Initialize the Google AI model
    const model = google('gemini-2.0-flash-001');

    // Create evaluation prompt for speaking responses
    const evaluateSpeakingResponses = async (responses: any[]) => {
      const responsesText = responses.map((r, index) => 
        `Question ${index + 1}: ${r.question}\nAnswer: ${r.transcript}\n`
      ).join('\n');

      const prompt = `You are an expert IELTS speaking examiner. Evaluate these IELTS speaking test responses based on the official IELTS assessment criteria.

IMPORTANT: Use the full IELTS band scale from 1-9. Do not artificially limit high scores. Award scores of 7, 8, or 9 when the speaking truly demonstrates the required proficiency level.

IELTS Speaking Band Score Guidelines:
- Band 9: Expert user (exceptional command, natural fluency)
- Band 8: Very good user (fully operational command, occasional hesitation)
- Band 7: Good user (operational command with occasional inaccuracies)
- Band 6: Competent user (effective command despite some inaccuracies)
- Band 5: Modest user (partial command with frequent problems)
- Band 4 and below: Limited to non-user

SPEAKING TEST RESPONSES:
${responsesText}

Please provide a comprehensive evaluation following the IELTS Speaking assessment criteria:

1. FLUENCY AND COHERENCE (25%):
- How smoothly and naturally does the candidate speak?
- Is there logical organization of ideas?
- Are there appropriate pauses and hesitations?
- Does the speech flow coherently?

2. LEXICAL RESOURCE (25%):
- Is there sufficient range of vocabulary?
- Is vocabulary used accurately and appropriately?
- Are there attempts at less common vocabulary?
- Is there effective paraphrasing?

3. GRAMMATICAL RANGE AND ACCURACY (25%):
- Is there variety in sentence structures?
- Are complex sentences attempted?
- Is grammar used accurately?
- Are there grammatical errors that impede communication?

4. PRONUNCIATION (25%):
- Is pronunciation clear and intelligible?
- Are individual sounds produced correctly?
- Is there appropriate word and sentence stress?
- Is intonation natural and effective?

Provide your response in this exact JSON format. Use the FULL range 1-9, including scores of 7, 8, and 9 when appropriate:

{
  "overallBand": [average band score to 0.5],
  "responses": [
    {
      "question": "Question text",
      "fluency": [score 1-9],
      "coherence": [score 1-9],
      "lexicalResource": [score 1-9],
      "grammaticalRange": [score 1-9],
      "pronunciation": [score 1-9],
      "overallBand": [average of the 4 criteria to 0.5],
      "feedback": "Specific feedback for this response",
      "strengths": ["strength 1", "strength 2"],
      "improvements": ["improvement 1", "improvement 2"]
    }
  ],
  "detailedFeedback": {
    "fluency": "Overall feedback on fluency across all responses",
    "coherence": "Overall feedback on coherence across all responses",
    "lexicalResource": "Overall feedback on vocabulary usage across all responses",
    "grammaticalRange": "Overall feedback on grammar across all responses",
    "pronunciation": "Overall feedback on pronunciation across all responses"
  },
  "overallStrengths": ["overall strength 1", "overall strength 2", "overall strength 3"],
  "overallImprovements": ["overall improvement 1", "overall improvement 2", "overall improvement 3"],
  "advice": "Overall advice for improvement"
}`;

      try {
        const { text } = await generateText({
          model,
          prompt,
          temperature: 0.3,
        });

        // Extract JSON from the response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const evaluationResult = JSON.parse(jsonMatch[0]);
          return {
            ...evaluationResult,
            rawResponse: text
          };
        } else {
          throw new Error('No valid JSON found in AI response');
        }
      } catch (error) {
        console.error('Error evaluating speaking responses:', error);
        // Return fallback evaluation
        const fallbackResponses = responses.map((r, index) => ({
          question: r.question,
          fluency: 6.0,
          coherence: 6.0,
          lexicalResource: 6.0,
          grammaticalRange: 6.0,
          pronunciation: 6.0,
          overallBand: 6.0,
          feedback: 'Unable to provide detailed feedback due to evaluation error.',
          strengths: ['Response submitted successfully'],
          improvements: ['Please try submitting again for detailed feedback']
        }));

        return {
          overallBand: 6.0,
          responses: fallbackResponses,
          detailedFeedback: {
            fluency: 'Unable to provide detailed feedback due to evaluation error.',
            coherence: 'Unable to provide detailed feedback due to evaluation error.',
            lexicalResource: 'Unable to provide detailed feedback due to evaluation error.',
            grammaticalRange: 'Unable to provide detailed feedback due to evaluation error.',
            pronunciation: 'Unable to provide detailed feedback due to evaluation error.'
          },
          overallStrengths: ['Responses submitted successfully'],
          overallImprovements: ['Please try submitting again for detailed feedback'],
          advice: 'There was an error in the evaluation process. Please contact support if this persists.',
          error: 'Evaluation error occurred'
        };
      }
    };

    const evaluationResult = await evaluateSpeakingResponses(responses);

    return NextResponse.json({
      success: true,
      data: evaluationResult,
      evaluatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in speaking evaluation:', error);
    return NextResponse.json(
      { 
        error: 'Failed to evaluate speaking', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
