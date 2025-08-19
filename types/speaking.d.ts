// Enhanced speaking types for conversation capture and evaluation
export interface VapiMessage {
  type?: string;
  transcript?: string;
  message?: {
    role?: string;
    content?: string;
    text?: string;
  };
  role?: string;
  content?: string;
  text?: string;
}

// Conversation message structure
export interface ConversationMessage {
  id: string;
  timestamp: Date;
  role: 'user' | 'assistant';
  content: string;
  type: 'question' | 'answer' | 'instruction' | 'general';
}

// Speaking session data structure
export interface SpeakingSession {
  id: string;
  userId?: string;
  startTime: Date;
  endTime?: Date;
  status: 'active' | 'completed' | 'evaluated';
  messages: ConversationMessage[];
  fullTranscript: string;
  evaluation?: SpeakingEvaluation;
}

// Question-answer pair structure
export interface QuestionAnswerPair {
  question: string;
  answer: string;
  part: 1 | 2 | 3;
  topic?: string;
  evaluation: {
    relevance: number;
    fluency: number;
    vocabulary: number;
    grammar: number;
  };
}

// Speaking evaluation result structure
export interface SpeakingEvaluation {
  sessionId: string;
  overallBandScore: number;
  criteria: {
    fluencyCoherence: number;
    lexicalResource: number;
    grammaticalRange: number;
    pronunciation: number;
  };
  questionAnswerPairs: QuestionAnswerPair[];
  detailedFeedback: {
    fluencyCoherence: string;
    lexicalResource: string;
    grammaticalRange: string;
    pronunciation: string;
  };
  strengths: string[];
  improvements: string[];
  advice: string;
  evaluatedAt: Date;
}

// Session management interface
export interface SpeakingSessionManager {
  currentSession: SpeakingSession | null;
  createSession(): SpeakingSession;
  addMessage(message: Omit<ConversationMessage, 'id' | 'timestamp'>): void;
  endSession(): void;
  getFullTranscript(): string;
}

// Evaluation request/response types
export interface SpeakingEvaluationRequest {
  sessionId: string;
  fullTranscript: string;
  messages: ConversationMessage[];
  sessionDuration: number;
}

export interface SpeakingEvaluationResponse {
  success: boolean;
  evaluation?: SpeakingEvaluation;
  error?: string;
  evaluatedAt: string;
}