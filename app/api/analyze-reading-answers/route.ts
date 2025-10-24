import { NextRequest, NextResponse } from 'next/server';
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

interface IncorrectAnswer {
  questionNumber: number;
  userAnswer: string;
  correctAnswer: string;
  questionText?: string;
  questionType: string;
  passageNumber: number;
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

    // Create the prompt for analyzing reading answers
    const analysisPrompt = `You are an expert IELTS Reading instructor analyzing incorrect answers from a student's reading test.

TEST INFORMATION:
- Test Title: ${testTitle}
- Number of Incorrect Answers: ${incorrectAnswers.length}

INCORRECT ANSWERS TO ANALYZE:
${incorrectAnswers.map((ans, idx) => `
${idx + 1}. Question ${ans.questionNumber} (Passage ${ans.passageNumber}, ${ans.questionType})
   Question Context: ${ans.questionText || 'N/A'}
   Student's Answer: "${ans.userAnswer || '[blank]'}"
   Correct Answer: "${ans.correctAnswer}"
`).join('\n')}

TASK:
For each incorrect answer above, provide a detailed, personalized analysis that includes:

1. **Explanation**: Why the correct answer is right and why the student's answer is wrong. Be specific about what reading comprehension skill they need to improve (e.g., understanding main ideas, locating specific information, understanding writer's opinion, recognizing paraphrasing).

2. **Reading Skill Point**: Explain the relevant reading skill or strategy that applies to this question. This could include:
   - Skimming vs scanning techniques
   - Understanding synonyms and paraphrasing
   - Identifying key words and their equivalents
   - Understanding context clues
   - Distinguishing facts from opinions
   - Recognizing text structure and organization
   - Understanding referencing (pronouns, this/that/these/those)

3. **Common Mistake**: Identify what type of reading mistake this represents (e.g., missing key information, misunderstanding paraphrasing, not reading carefully, choosing distractor answers, misinterpreting the question type).

4. **Tip**: Give one practical, actionable tip to avoid this type of mistake in the future, specifically tailored to the question type.

IMPORTANT GUIDELINES:
- Be empathetic and encouraging while being precise and instructive
- Tailor explanations to the specific answer given, not generic advice
- If the student left it blank, focus on what reading strategy they should have used
- Make explanations concise but comprehensive (2-4 sentences each)
- Use clear, simple language appropriate for IELTS students
- Connect feedback to official IELTS reading skills and question types
- For question types like TRUE/FALSE/NOT GIVEN and YES/NO/NOT GIVEN, explain the distinction clearly
- For matching questions, explain how to identify key information efficiently

RESPONSE FORMAT:
Provide your analysis as a JSON array with this exact structure:

[
  {
    "questionNumber": [question number],
    "explanation": "[specific explanation for this question]",
    "grammarPoint": "[relevant reading skill/strategy point]",
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
        explanation: `The correct answer is "${ans.correctAnswer}". ${ans.userAnswer ? `You wrote "${ans.userAnswer}".` : 'You left this blank.'} This type of question requires careful reading to identify specific details or main ideas from the passage.`,
        grammarPoint: 'In IELTS Reading, pay attention to synonyms and paraphrasing. The passage often uses different words to express the same idea as the question.',
        commonMistake: 'Missing key information or not recognizing paraphrased content in the passage.',
        tip: 'Underline key words in the question and scan the passage for synonyms or related concepts rather than exact matches.'
      }));

      return NextResponse.json({
        success: true,
        analyses: fallbackAnalyses
      } as AnalysisResponse);
    }

  } catch (error) {
    console.error('Error in reading analysis:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to analyze reading answers'
    } as AnalysisResponse, { status: 500 });
  }
}
