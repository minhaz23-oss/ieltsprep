import { NextRequest, NextResponse } from 'next/server';
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

interface IncorrectAnswer {
  questionNumber: number;
  userAnswer: string;
  correctAnswer: string;
  questionText?: string;
  questionType: string;
  sectionNumber: number;
}

interface AnalysisRequest {
  incorrectAnswers: IncorrectAnswer[];
  testTitle: string;
}

interface AIAnalysisResult {
  questionNumber: number;
  explanation: string;
  grammarPoint: string;
  commonMistake: string;
  tip: string;
}

interface AnalysisResponse {
  success: boolean;
  analyses?: AIAnalysisResult[];
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { incorrectAnswers, testTitle }: AnalysisRequest = await request.json();

    if (!incorrectAnswers || incorrectAnswers.length === 0) {
      return NextResponse.json({
        success: true,
        analyses: []
      } as AnalysisResponse);
    }

    // Check for API key
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY && !process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'Google AI API key not configured'
      } as AnalysisResponse, { status: 500 });
    }

    // Initialize the Google AI model
    const model = google('gemini-2.0-flash-001');

    // Create the prompt for analyzing listening answers
    const analysisPrompt = `You are an expert IELTS Listening instructor analyzing incorrect answers from a student's listening test.

TEST INFORMATION:
- Test Title: ${testTitle}
- Number of Incorrect Answers: ${incorrectAnswers.length}

INCORRECT ANSWERS TO ANALYZE:
${incorrectAnswers.map((ans, idx) => `
${idx + 1}. Question ${ans.questionNumber} (Section ${ans.sectionNumber}, ${ans.questionType})
   Question Context: ${ans.questionText || 'N/A'}
   Student's Answer: "${ans.userAnswer || '[blank]'}"
   Correct Answer: "${ans.correctAnswer}"
`).join('\n')}

TASK:
For each incorrect answer above, provide a detailed, personalized analysis that includes:

1. **Explanation**: Why the correct answer is right and why the student's answer is wrong. Be specific about what they likely misheard, misunderstood, or missed from the audio.

2. **Grammar/Language Point**: Explain the relevant grammar rule, vocabulary, or language pattern that applies to this question. This could include:
   - Word forms (singular/plural, verb tenses)
   - Synonyms and paraphrasing used in IELTS
   - Number formats and spelling rules
   - Collocation and phrase patterns
   - Specific vocabulary related to the topic

3. **Common Mistake**: Identify what type of listening mistake this represents (e.g., mishearing similar sounds, missing key words, not understanding context, focusing on wrong details, not recognizing paraphrasing).

4. **Tip**: Give one practical, actionable tip to avoid this type of mistake in the future.

IMPORTANT GUIDELINES:
- Be empathetic and encouraging while being precise and instructive
- Tailor explanations to the specific answer given, not generic advice
- If the student left it blank, focus on what they should have listened for
- Make explanations concise but comprehensive (2-4 sentences each)
- Use clear, simple language appropriate for IELTS students
- Connect feedback to official IELTS listening skills

RESPONSE FORMAT:
Provide your analysis as a JSON array with this exact structure:

[
  {
    "questionNumber": [question number],
    "explanation": "[specific explanation for this question]",
    "grammarPoint": "[relevant grammar/language point]",
    "commonMistake": "[type of mistake made]",
    "tip": "[practical tip to improve]"
  }
]

Respond with ONLY the JSON array, no additional text.`;

    try {
      const { text } = await generateText({
        model,
        prompt: analysisPrompt,
        temperature: 0.4, // Slightly higher for more natural explanations
      });

      // Extract JSON from the response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const analyses: AIAnalysisResult[] = JSON.parse(jsonMatch[0]);
        
        return NextResponse.json({
          success: true,
          analyses
        } as AnalysisResponse);
      } else {
        throw new Error('No valid JSON found in AI response');
      }

    } catch (error) {
      console.error('Error during AI analysis:', error);
      
      // Provide fallback analyses
      const fallbackAnalyses: AIAnalysisResult[] = incorrectAnswers.map(ans => ({
        questionNumber: ans.questionNumber,
        explanation: `The correct answer is "${ans.correctAnswer}". ${ans.userAnswer ? `You wrote "${ans.userAnswer}".` : 'You left this blank.'} This type of question requires careful listening to identify specific details from the audio.`,
        grammarPoint: 'In IELTS Listening, answers must match exactly what you hear. Pay attention to word forms, spelling, and number formats.',
        commonMistake: 'Missing key information or mishearing similar-sounding words.',
        tip: 'Read the question carefully before the audio plays and underline key words to listen for.'
      }));

      return NextResponse.json({
        success: true,
        analyses: fallbackAnalyses
      } as AnalysisResponse);
    }

  } catch (error) {
    console.error('Error in listening analysis:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to analyze listening answers'
    } as AnalysisResponse, { status: 500 });
  }
}
