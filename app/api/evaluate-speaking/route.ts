import { NextRequest, NextResponse } from 'next/server';
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';
import { SpeakingEvaluationRequest, SpeakingEvaluationResponse } from '@/types/speaking';

export async function POST(request: NextRequest) {
  try {
    const evaluationRequest: SpeakingEvaluationRequest = await request.json();
    
    const { sessionId, fullTranscript, messages, sessionDuration } = evaluationRequest;

    if (!fullTranscript || fullTranscript.trim().length < 100) {
      return NextResponse.json({
        success: false,
        error: 'Conversation too short for meaningful evaluation. Please have a longer conversation.',
        evaluatedAt: new Date().toISOString()
      } as SpeakingEvaluationResponse);
    }

    // Check for API key
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY && !process.env.GEMINI_API_KEY) {
      return NextResponse.json({
        success: false,
        error: 'Google AI API key not configured',
        evaluatedAt: new Date().toISOString()
      } as SpeakingEvaluationResponse);
    }

    // Initialize the Google AI model
    const model = google('gemini-2.0-flash-001');

    // Create comprehensive evaluation prompt
    const evaluationPrompt = `You are an expert IELTS Speaking examiner. Analyze this speaking test conversation and provide a comprehensive evaluation based on the official IELTS Speaking assessment criteria.

IMPORTANT: Use the full IELTS band scale from 1-9. Do not artificially limit high scores. Award scores of 7, 8, or 9 when the speaking truly demonstrates the required proficiency level.

IELTS Band Score Guidelines:
- Band 9: Expert user (exceptional command)
- Band 8: Very good user (fully operational command)
- Band 7: Good user (operational command with occasional inaccuracies)
- Band 6: Competent user (effective command despite some inaccuracies)
- Band 5: Modest user (partial command with frequent problems)
- Band 4 and below: Limited to non-user

SESSION DETAILS:
- Session Duration: ${sessionDuration} seconds
- Total Messages: ${messages.length}
- Session ID: ${sessionId}

FULL CONVERSATION TRANSCRIPT:
${fullTranscript}

TASK 1: CONVERSATION ANALYSIS
First, analyze the conversation and extract question-answer pairs. Identify:
1. Questions asked by the AI examiner
2. Corresponding answers given by the candidate
3. Which IELTS Speaking test part each exchange belongs to (Part 1: Introduction/Interview, Part 2: Long Turn/Cue Card, Part 3: Discussion)
4. Topics covered in each part

TASK 2: IELTS SPEAKING EVALUATION
Evaluate the candidate's performance based on the four IELTS Speaking criteria:

1. FLUENCY AND COHERENCE (25%):
- Rate of speech and speech continuity
- Range of connectives and discourse markers used appropriately
- Coherence and cohesion in extended discourse
- Ability to develop topics coherently and appropriately

2. LEXICAL RESOURCE (25%):
- Range of vocabulary used appropriately
- Attempts to use less common vocabulary
- Awareness of style and collocation
- Flexibility and precise usage

3. GRAMMATICAL RANGE AND ACCURACY (25%):
- Range of structures used appropriately
- Accuracy of structures
- Appropriate use of complex structures
- Control of grammar and punctuation

4. PRONUNCIATION (25%):
- Individual sounds and sound features
- Word and sentence stress, rhythm and intonation
- Effect on communication
- Intelligibility and naturalness

RESPONSE FORMAT:
Provide your evaluation in this exact JSON format. Use the FULL range 1-9, including scores of 7, 8, and 9 when appropriate:

{
  "questionAnswerPairs": [
    {
      "question": "extracted question text",
      "answer": "corresponding answer text",
      "part": 1 | 2 | 3,
      "topic": "topic name if identifiable",
      "evaluation": {
        "relevance": [score 1-9],
        "fluency": [score 1-9],
        "vocabulary": [score 1-9],
        "grammar": [score 1-9]
      }
    }
  ],
  "overallBandScore": [average band score to 0.5],
  "criteria": {
    "fluencyCoherence": [score 1-9 (use full range)],
    "lexicalResource": [score 1-9 (use full range)],
    "grammaticalRange": [score 1-9 (use full range)],
    "pronunciation": [score 1-9 (use full range)]
  },
  "detailedFeedback": {
    "fluencyCoherence": "Specific feedback on fluency and coherence",
    "lexicalResource": "Specific feedback on vocabulary usage",
    "grammaticalRange": "Specific feedback on grammar and sentence structure",
    "pronunciation": "Specific feedback on pronunciation and delivery"
  },
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "improvements": ["improvement 1", "improvement 2", "improvement 3"],
  "advice": "Overall advice for improvement and next steps"
}

EVALUATION GUIDELINES:
- Be thorough in extracting question-answer pairs from the natural conversation
- Consider the context and flow of the conversation
- Evaluate based on actual IELTS standards, not artificially deflated scores
- Provide constructive, specific feedback
- Consider the candidate's ability to maintain conversation flow
- Assess pronunciation based on intelligibility and natural rhythm
- Look for evidence of language proficiency across all criteria
- Award appropriate scores for demonstrated competency levels`;

    try {
      const { text } = await generateText({
        model,
        prompt: evaluationPrompt,
        temperature: 0.3,
      });

      // Extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const evaluationResult = JSON.parse(jsonMatch[0]);
        
        // Validate and structure the response
        const evaluation = {
          sessionId,
          overallBandScore: evaluationResult.overallBandScore || 5.0,
          criteria: {
            fluencyCoherence: evaluationResult.criteria?.fluencyCoherence || 5,
            lexicalResource: evaluationResult.criteria?.lexicalResource || 5,
            grammaticalRange: evaluationResult.criteria?.grammaticalRange || 5,
            pronunciation: evaluationResult.criteria?.pronunciation || 5,
          },
          questionAnswerPairs: evaluationResult.questionAnswerPairs || [],
          detailedFeedback: {
            fluencyCoherence: evaluationResult.detailedFeedback?.fluencyCoherence || 'No specific feedback available.',
            lexicalResource: evaluationResult.detailedFeedback?.lexicalResource || 'No specific feedback available.',
            grammaticalRange: evaluationResult.detailedFeedback?.grammaticalRange || 'No specific feedback available.',
            pronunciation: evaluationResult.detailedFeedback?.pronunciation || 'No specific feedback available.',
          },
          strengths: evaluationResult.strengths || ['Completed the speaking test'],
          improvements: evaluationResult.improvements || ['Continue practicing speaking'],
          advice: evaluationResult.advice || 'Keep practicing to improve your speaking skills.',
          evaluatedAt: new Date(),
        };

        return NextResponse.json({
          success: true,
          evaluation,
          evaluatedAt: new Date().toISOString()
        } as SpeakingEvaluationResponse);
        
      } else {
        throw new Error('No valid JSON found in AI response');
      }
      
    } catch (error) {
      console.error('Error during AI evaluation:', error);
      
      // Provide fallback evaluation
      const fallbackEvaluation = {
        sessionId,
        overallBandScore: 5.0,
        criteria: {
          fluencyCoherence: 5,
          lexicalResource: 5,
          grammaticalRange: 5,
          pronunciation: 5,
        },
        questionAnswerPairs: [],
        detailedFeedback: {
          fluencyCoherence: 'Unable to provide detailed feedback due to evaluation error.',
          lexicalResource: 'Unable to provide detailed feedback due to evaluation error.',
          grammaticalRange: 'Unable to provide detailed feedback due to evaluation error.',
          pronunciation: 'Unable to provide detailed feedback due to evaluation error.',
        },
        strengths: ['Completed the speaking test session'],
        improvements: ['Please try again for detailed feedback'],
        advice: 'There was an error in the evaluation process. Please contact support if this persists.',
        evaluatedAt: new Date(),
      };

      return NextResponse.json({
        success: true,
        evaluation: fallbackEvaluation,
        evaluatedAt: new Date().toISOString()
      } as SpeakingEvaluationResponse);
    }

  } catch (error) {
    console.error('Error in speaking evaluation:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to evaluate speaking session',
      evaluatedAt: new Date().toISOString()
    } as SpeakingEvaluationResponse, { status: 500 });
  }
}