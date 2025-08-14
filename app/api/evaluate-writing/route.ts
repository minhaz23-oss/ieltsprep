import { NextRequest, NextResponse } from 'next/server';
import { google } from '@ai-sdk/google';
import { generateText } from 'ai';

export async function POST(request: NextRequest) {
  try {
    const { task1Answer, task2Answer, task1Prompt, task2Prompt, taskType } = await request.json();

    if (!task1Answer && !task2Answer) {
      return NextResponse.json(
        { error: 'At least one task answer is required' },
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

    // Create evaluation prompts for each task
    const evaluateTask = async (answer: string, prompt: string, taskNumber: 1 | 2) => {
      if (!answer || answer.trim().length < 50) {
        return {
          score: 0,
          bandScore: 1.0,
          feedback: `Task ${taskNumber} appears to be incomplete or too short. Please provide a more comprehensive response.`,
          criteria: {
            taskAchievement: 1,
            coherenceCohesion: 1,
            lexicalResource: 1,
            grammaticalRange: 1
          },
          wordCount: answer.trim().split(/\s+/).length
        };
      }

      const taskSpecificPrompt = taskNumber === 1 
        ? `You are an expert IELTS examiner. Evaluate this IELTS Writing Task 1 response based on the official IELTS assessment criteria.

IMPORTANT: Use the full IELTS band scale from 1-9. Do not artificially limit high scores. Award scores of 7, 8, or 9 when the writing truly demonstrates the required proficiency level.

IELTS Band Score Guidelines:
- Band 9: Expert user (exceptional command)
- Band 8: Very good user (fully operational command)
- Band 7: Good user (operational command with occasional inaccuracies)
- Band 6: Competent user (effective command despite some inaccuracies)
- Band 5: Modest user (partial command with frequent problems)
- Band 4 and below: Limited to non-user

TASK 1 PROMPT: ${prompt}

STUDENT RESPONSE: ${answer}

Please provide a comprehensive evaluation following the IELTS Writing Task 1 assessment criteria:

1. TASK ACHIEVEMENT (25%):
- Does the response adequately address all requirements of the task?
- Does it present a clear overview of main trends, differences or stages?
- Are key features/bullet points covered and appropriately highlighted?
- Is the information accurate?

2. COHERENCE AND COHESION (25%):
- Is the information logically organized?
- Is there clear progression throughout the response?
- Are cohesive devices used appropriately?
- Is paragraphing used effectively?

3. LEXICAL RESOURCE (25%):
- Is there sufficient range of vocabulary?
- Is vocabulary used accurately and appropriately?
- Are there attempts at less common vocabulary?
- Are there any spelling errors?

4. GRAMMATICAL RANGE AND ACCURACY (25%):
- Is there variety in sentence structures?
- Are complex sentences attempted?
- Is grammar used accurately?
- Are there punctuation errors?

Provide your response in this exact JSON format. Use the FULL range 1-9, including scores of 7, 8, and 9 when appropriate:
{
  "taskAchievement": [score 1-9 (use full range)],
  "coherenceCohesion": [score 1-9 (use full range)], 
  "lexicalResource": [score 1-9 (use full range)],
  "grammaticalRange": [score 1-9 (use full range)],
  "overallBand": [average band score to 0.5],
  "wordCount": [actual word count],
  "detailedFeedback": {
    "taskAchievement": "Specific feedback on task achievement",
    "coherenceCohesion": "Specific feedback on coherence and cohesion",
    "lexicalResource": "Specific feedback on vocabulary usage", 
    "grammaticalRange": "Specific feedback on grammar and sentence structure"
  },
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "improvements": ["improvement 1", "improvement 2", "improvement 3"],
  "advice": "Overall advice for improvement"
}`
        : `You are an expert IELTS examiner. Evaluate this IELTS Writing Task 2 response based on the official IELTS assessment criteria.

IMPORTANT: Use the full IELTS band scale from 1-9. Do not artificially limit high scores. Award scores of 7, 8, or 9 when the writing truly demonstrates the required proficiency level.

IELTS Band Score Guidelines:
- Band 9: Expert user (exceptional command)
- Band 8: Very good user (fully operational command)
- Band 7: Good user (operational command with occasional inaccuracies)
- Band 6: Competent user (effective command despite some inaccuracies)
- Band 5: Modest user (partial command with frequent problems)
- Band 4 and below: Limited to non-user

TASK 2 PROMPT: ${prompt}

STUDENT RESPONSE: ${answer}

Please provide a comprehensive evaluation following the IELTS Writing Task 2 assessment criteria:

1. TASK RESPONSE (25%):
- Does the response address all parts of the task?
- Is there a clear position throughout the response?
- Are ideas extended and supported with examples?
- Are all parts of the question addressed?

2. COHERENCE AND COHESION (25%):
- Is the information logically organized?
- Is there clear progression throughout the response?
- Are cohesive devices used appropriately?
- Is paragraphing used effectively?

3. LEXICAL RESOURCE (25%):
- Is there sufficient range of vocabulary?
- Is vocabulary used accurately and appropriately?
- Are there attempts at less common vocabulary?
- Are there any spelling errors?

4. GRAMMATICAL RANGE AND ACCURACY (25%):
- Is there variety in sentence structures?
- Are complex sentences attempted?
- Is grammar used accurately?
- Are there punctuation errors?

Provide your response in this exact JSON format. Use the FULL range 1-9, including scores of 7, 8, and 9 when appropriate:
{
  "taskResponse": [score 1-9 (use full range)],
  "coherenceCohesion": [score 1-9 (use full range)],
  "lexicalResource": [score 1-9 (use full range)], 
  "grammaticalRange": [score 1-9 (use full range)],
  "overallBand": [average band score to 0.5],
  "wordCount": [actual word count],
  "detailedFeedback": {
    "taskResponse": "Specific feedback on task response",
    "coherenceCohesion": "Specific feedback on coherence and cohesion",
    "lexicalResource": "Specific feedback on vocabulary usage",
    "grammaticalRange": "Specific feedback on grammar and sentence structure"
  },
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "improvements": ["improvement 1", "improvement 2", "improvement 3"], 
  "advice": "Overall advice for improvement"
}`

      try {
        const { text } = await generateText({
          model,
          prompt: taskSpecificPrompt,
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
        console.error(`Error evaluating Task ${taskNumber}:`, error);
        return {
          taskAchievement: taskNumber === 1 ? 5 : undefined,
          taskResponse: taskNumber === 2 ? 5 : undefined,
          coherenceCohesion: 5,
          lexicalResource: 5,
          grammaticalRange: 5,
          overallBand: 5.0,
          wordCount: answer.trim().split(/\s+/).length,
          detailedFeedback: {
            [taskNumber === 1 ? 'taskAchievement' : 'taskResponse']: 'Unable to provide detailed feedback due to evaluation error.',
            coherenceCohesion: 'Unable to provide detailed feedback due to evaluation error.',
            lexicalResource: 'Unable to provide detailed feedback due to evaluation error.',
            grammaticalRange: 'Unable to provide detailed feedback due to evaluation error.'
          },
          strengths: ['Response submitted successfully'],
          improvements: ['Please try submitting again for detailed feedback'],
          advice: 'There was an error in the evaluation process. Please contact support if this persists.',
          error: 'Evaluation error occurred'
        };
      }
    };

    // Evaluate both tasks if provided
    const results: any = {};
    
    if (task1Answer) {
      results.task1 = await evaluateTask(task1Answer, task1Prompt, 1);
    }
    
    if (task2Answer) {
      results.task2 = await evaluateTask(task2Answer, task2Prompt, 2);
    }

    // Calculate overall score if both tasks are completed
    let overallBandScore = null;
    if (results.task1 && results.task2) {
      // Task 2 is weighted more heavily (approximately 2/3 vs 1/3)
      const task1Weight = 0.33;
      const task2Weight = 0.67;
      overallBandScore = (results.task1.overallBand * task1Weight + results.task2.overallBand * task2Weight);
      overallBandScore = Math.round(overallBandScore * 2) / 2; // Round to nearest 0.5
    } else if (results.task1) {
      overallBandScore = results.task1.overallBand;
    } else if (results.task2) {
      overallBandScore = results.task2.overallBand;
    }

    return NextResponse.json({
      success: true,
      results,
      overallBandScore,
      evaluatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error in writing evaluation:', error);
    return NextResponse.json(
      { 
        error: 'Failed to evaluate writing', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
