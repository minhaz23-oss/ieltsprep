'use server'

// This interface should match the structure of the data you send from the client
interface SpeakingResponse {
  question: string;
  transcript: string;
  audioUrl?: string;
}

/**
 * Evaluates a series of speaking responses using Gemini AI.
 * @param responses An array of speaking responses
 * @returns An object containing the overall band score and detailed results for each response
 */
export async function evaluateSpeakingTest(responses: SpeakingResponse[]) {
  try {
    if (!responses || responses.length === 0) {
      return { success: false, message: "No responses to evaluate." };
    }

    // Call the Gemini-powered speaking evaluation API
    const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/evaluate-speaking`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ responses }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const result = await response.json();

    if (result.success) {
      return {
        success: true,
        data: result.data,
      };
    } else {
      return {
        success: false,
        message: result.error || "Failed to evaluate speaking test.",
      };
    }

  } catch (error) {
    console.error("Error evaluating speaking test:", error);
    return {
      success: false,
      message: "An unexpected error occurred during evaluation.",
    };
  }
}
