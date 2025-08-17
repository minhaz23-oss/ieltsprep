// IELTS Listening Band Score Utility
// Based on official IELTS scoring system

export interface IELTSScore {
  band: number;
  rawScore: number;
  percentage: number;
  description: string;
  performance: string;
}

// Official IELTS Listening band score ranges (out of 40 questions)
const IELTS_LISTENING_BANDS = [
  { minScore: 39, maxScore: 40, band: 9.0, description: "Expert user", performance: "Has fully operational command of the language" },
  { minScore: 37, maxScore: 38, band: 8.5, description: "Very good user", performance: "Handles complex language very well with occasional inaccuracies" },
  { minScore: 35, maxScore: 36, band: 8.0, description: "Very good user", performance: "Handles complex language well with few inaccuracies" },
  { minScore: 32, maxScore: 34, band: 7.5, description: "Good user", performance: "Has operational command of the language with occasional inaccuracies" },
  { minScore: 30, maxScore: 31, band: 7.0, description: "Good user", performance: "Has operational command of the language" },
  { minScore: 26, maxScore: 29, band: 6.5, description: "Competent user", performance: "Has generally effective command of the language" },
  { minScore: 23, maxScore: 25, band: 6.0, description: "Competent user", performance: "Has generally effective command despite some inaccuracies" },
  { minScore: 18, maxScore: 22, band: 5.5, description: "Modest user", performance: "Has partial command of the language" },
  { minScore: 16, maxScore: 17, band: 5.0, description: "Modest user", performance: "Has limited command with many errors" },
  { minScore: 13, maxScore: 15, band: 4.5, description: "Limited user", performance: "Basic competence in familiar situations only" },
  { minScore: 11, maxScore: 12, band: 4.0, description: "Limited user", performance: "Basic competence limited to familiar situations" },
  { minScore: 8, maxScore: 10, band: 3.5, description: "Extremely limited user", performance: "Conveys general meaning in very familiar situations" },
  { minScore: 6, maxScore: 7, band: 3.0, description: "Extremely limited user", performance: "Conveys general meaning in familiar situations only" },
  { minScore: 4, maxScore: 5, band: 2.5, description: "Intermittent user", performance: "No real communication except basic information" },
  { minScore: 2, maxScore: 3, band: 2.0, description: "Intermittent user", performance: "Great difficulty understanding spoken language" },
  { minScore: 1, maxScore: 1, band: 1.5, description: "Non-user", performance: "Essentially no ability except isolated words" },
  { minScore: 0, maxScore: 0, band: 1.0, description: "Non-user", performance: "No ability to use the language" }
];

/**
 * Calculate IELTS band score based on correct answers
 * @param correctAnswers Number of correct answers
 * @param totalQuestions Total number of questions
 * @returns IELTSScore object with band score and details
 */
export function calculateIELTSListeningBand(correctAnswers: number, totalQuestions: number): IELTSScore {
  // Convert to 40-question scale (official IELTS format)
  const scaledScore = Math.round((correctAnswers / totalQuestions) * 40);
  const percentage = (correctAnswers / totalQuestions) * 100;
  
  // Find the appropriate band
  const bandInfo = IELTS_LISTENING_BANDS.find(
    band => scaledScore >= band.minScore && scaledScore <= band.maxScore
  ) || IELTS_LISTENING_BANDS[IELTS_LISTENING_BANDS.length - 1]; // Default to lowest band if not found

  return {
    band: bandInfo.band,
    rawScore: correctAnswers,
    percentage: Math.round(percentage),
    description: bandInfo.description,
    performance: bandInfo.performance
  };
}

/**
 * Get band color based on IELTS band score
 * @param band IELTS band score
 * @returns CSS class names for styling
 */
export function getBandColor(band: number): string {
  if (band >= 8.0) return "text-green-600 bg-green-50 border-green-200";
  if (band >= 7.0) return "text-blue-600 bg-blue-50 border-blue-200";
  if (band >= 6.0) return "text-yellow-600 bg-yellow-50 border-yellow-200";
  if (band >= 5.0) return "text-orange-600 bg-orange-50 border-orange-200";
  return "text-red-600 bg-red-50 border-red-200";
}

/**
 * Get performance level based on IELTS band score
 * @param band IELTS band score
 * @returns Performance level string
 */
export function getPerformanceLevel(band: number): string {
  if (band >= 8.0) return "Excellent";
  if (band >= 7.0) return "Very Good";
  if (band >= 6.0) return "Good";
  if (band >= 5.0) return "Satisfactory";
  if (band >= 4.0) return "Needs Improvement";
  return "Poor";
}

/**
 * Get study recommendations based on IELTS band score
 * @param band IELTS band score
 * @returns Array of recommendation strings
 */
export function getStudyRecommendations(band: number): string[] {
  if (band >= 8.0) {
    return [
      "Excellent work! Focus on maintaining consistency",
      "Practice with authentic IELTS materials",
      "Work on advanced academic vocabulary",
      "Try listening to complex academic lectures"
    ];
  }
  
  if (band >= 7.0) {
    return [
      "Great progress! Focus on fine-tuning skills",
      "Practice with varied accents and speakers",
      "Work on complex sentence structures",
      "Listen to academic podcasts and lectures"
    ];
  }
  
  if (band >= 6.0) {
    return [
      "Good foundation! Continue regular practice",
      "Focus on listening for specific information",
      "Practice note-taking while listening",
      "Work on understanding implied meanings"
    ];
  }
  
  if (band >= 5.0) {
    return [
      "Keep practicing regularly",
      "Focus on basic listening comprehension",
      "Listen to clear, slow speech materials",
      "Practice identifying key words and phrases"
    ];
  }
  
  return [
    "Start with basic listening exercises",
    "Focus on everyday vocabulary",
    "Listen to simple, clear audio materials",
    "Practice identifying basic information"
  ];
}

// IELTS Speaking Evaluation Interfaces and Functions

export interface SpeakingEvaluationResult {
  overallBand: number;
  fluency: number;
  coherence: number;
  lexicalResource: number;
  grammaticalRange: number;
  pronunciation: number;
  feedback: string;
  suggestions: string[];
}

/**
 * Evaluates a speaking response and provides IELTS band scores
 * @param transcript The transcript of the speaking response
 * @param audioUrl Optional audio URL for additional analysis
 * @returns SpeakingEvaluationResult with detailed band scores and feedback
 */
export async function evaluateSpeakingResponse(
  transcript: string, 
  audioUrl?: string
): Promise<SpeakingEvaluationResult> {
  // This is a mock implementation - in a real app, you'd integrate with an AI service
  // like OpenAI, Azure Cognitive Services, or a specialized IELTS evaluation API
  
  // Basic analysis based on transcript length and complexity
  const wordCount = transcript.split(' ').length;
  const sentenceCount = transcript.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  const avgWordsPerSentence = wordCount / Math.max(sentenceCount, 1);
  
  // Mock scoring logic (replace with actual AI evaluation)
  let fluency = 6.0;
  let coherence = 6.0;
  let lexicalResource = 6.0;
  let grammaticalRange = 6.0;
  let pronunciation = 6.0;
  
  // Adjust scores based on basic metrics
  if (wordCount < 50) {
    fluency -= 1.0;
    coherence -= 0.5;
  } else if (wordCount > 150) {
    fluency += 0.5;
    coherence += 0.5;
  }
  
  if (avgWordsPerSentence > 15) {
    grammaticalRange += 0.5;
  } else if (avgWordsPerSentence < 8) {
    grammaticalRange -= 0.5;
  }
  
  // Calculate overall band (average of all criteria)
  const overallBand = Math.round(
    (fluency + coherence + lexicalResource + grammaticalRange + pronunciation) / 5 * 2
  ) / 2;
  
  // Generate feedback based on scores
  const feedback = generateSpeakingFeedback(overallBand, {
    fluency,
    coherence,
    lexicalResource,
    grammaticalRange,
    pronunciation
  });
  
  const suggestions = generateSpeakingSuggestions(overallBand, {
    fluency,
    coherence,
    lexicalResource,
    grammaticalRange,
    pronunciation
  });
  
  return {
    overallBand,
    fluency: Math.round(fluency * 2) / 2,
    coherence: Math.round(coherence * 2) / 2,
    lexicalResource: Math.round(lexicalResource * 2) / 2,
    grammaticalRange: Math.round(grammaticalRange * 2) / 2,
    pronunciation: Math.round(pronunciation * 2) / 2,
    feedback,
    suggestions
  };
}

/**
 * Generates feedback based on speaking scores
 */
function generateSpeakingFeedback(overallBand: number, scores: Record<string, number>): string {
  if (overallBand >= 8.0) {
    return "Excellent speaking performance! You demonstrate a high level of English proficiency with natural fluency and sophisticated language use.";
  } else if (overallBand >= 7.0) {
    return "Very good speaking ability! You communicate effectively with good fluency and a wide range of vocabulary and grammar.";
  } else if (overallBand >= 6.0) {
    return "Good speaking skills! You can communicate your ideas clearly, though there's room for improvement in fluency and language complexity.";
  } else if (overallBand >= 5.0) {
    return "Satisfactory speaking performance. You can convey basic information but need to work on fluency, vocabulary range, and grammatical accuracy.";
  } else {
    return "Your speaking needs improvement. Focus on building basic vocabulary, improving pronunciation, and developing fluency through regular practice.";
  }
}

/**
 * Generates specific suggestions for improvement
 */
function generateSpeakingSuggestions(overallBand: number, scores: Record<string, number>): string[] {
  const suggestions: string[] = [];
  
  if (scores.fluency < 6.0) {
    suggestions.push("Practice speaking regularly to improve fluency and reduce hesitation");
    suggestions.push("Record yourself speaking and identify areas where you pause or stumble");
  }
  
  if (scores.coherence < 6.0) {
    suggestions.push("Work on organizing your thoughts before speaking");
    suggestions.push("Use linking words and phrases to connect ideas");
  }
  
  if (scores.lexicalResource < 6.0) {
    suggestions.push("Expand your vocabulary by learning topic-specific words");
    suggestions.push("Practice using synonyms and paraphrasing");
  }
  
  if (scores.grammaticalRange < 6.0) {
    suggestions.push("Practice using a variety of sentence structures");
    suggestions.push("Focus on common grammar patterns used in IELTS speaking");
  }
  
  if (scores.pronunciation < 6.0) {
    suggestions.push("Practice pronunciation of difficult sounds");
    suggestions.push("Work on word stress and intonation patterns");
  }
  
  if (suggestions.length === 0) {
    suggestions.push("Continue practicing to maintain your current level");
    suggestions.push("Try more challenging speaking topics to push your boundaries");
  }
  
  return suggestions;
}
