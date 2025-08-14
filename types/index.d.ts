type FormType =  "sign-in" | "sign-up" ;
interface SignUpParams {
    uid: string;
    name: string;
    email: string;
    password: string;
  }
interface SignInParams {
    email: string;
    idToken: string;
  }

  interface SpeakingTest {
    id: string;
    title: string;
    description: string;
    parts: SpeakingPart[];
    timeLimit: number; // in minutes
    difficulty: 'easy' | 'medium' | 'hard';
    createdAt: Date;
    updatedAt: Date;
  }

  interface SpeakingPart {
    id: string;
    partNumber: 1 | 2 | 3;
    title: string;
    questions: SpeakingQuestion[];
    timeLimit: number; // in minutes
    instructions: string;
  }

  interface SpeakingQuestion {
    id: string;
    question: string;
    preparationTime?: number; // in seconds
    responseTime: number; // in seconds
    topic?: string;
    followUpQuestions?: string[];
  }

  interface SpeakingTestAttempt {
    id: string;
    userId: string;
    testId: string;
    responses: SpeakingResponse[];
    totalScore?: number;
    feedback?: string;
    startedAt: Date;
    completedAt?: Date;
    status: 'in-progress' | 'completed' | 'expired';
  }

  interface SpeakingResponse {
    questionId: string;
    audioUrl?: string;
    transcription?: string;
    score?: number;
    feedback?: string;
    duration: number; // in seconds
    recordedAt: Date;
  }

  interface DailySpeakingLimit {
    userId: string;
    date: string; // YYYY-MM-DD format
    testsTaken: number;
    maxTests: number;
    lastTestAt?: Date;
  }

  interface DailySpeakingStats {
    testsTaken: number;
    testsRemaining: number;
    maxTests: number;
    canTakeTest: boolean;
    date: string;
    lastTestAt?: Date;
  }

  // Question Database Types
  interface SpeakingQuestionDB {
    id: string;
    question: string;
    category: string;
    preparationTime: number;
    responseTime: number;
    difficulty: 'easy' | 'medium' | 'hard';
    cueCard?: {
      points: string[];
    };
    createdAt: Date;
    isActive: boolean;
  }

  interface SpeakingPartDB {
    title: string;
    description: string;
    timeLimit: number;
    preparationTime: number;
    totalQuestions: number;
    lastUpdated: Date;
  }

  interface SpeakingTestSession {
    sessionId: string;
    userId: string;
    questions: {
      part1: SpeakingQuestionDB[];
      part2: SpeakingQuestionDB[];
      part3: SpeakingQuestionDB[];
    };
    currentPart: 1 | 2 | 3;
    currentQuestionIndex: number;
    responses: SpeakingSessionResponse[];
    startedAt: Date;
    status: 'active' | 'paused' | 'completed';
    totalEstimatedTime: number;
  }

  interface SpeakingSessionResponse {
    questionId: string;
    part: 1 | 2 | 3;
    audioUrl?: string;
    transcription?: string;
    duration: number;
    recordedAt: Date;
    evaluation?: SpeakingEvaluation;
  }

  interface SpeakingEvaluation {
    overallScore: number; // 0-9 IELTS scale
    criteria: {
      fluencyAndCoherence: number;
      lexicalResource: number;
      grammaticalRangeAndAccuracy: number;
      pronunciation: number;
    };
    feedback: string;
    suggestions: string[];
    evaluatedAt: Date;
  }

  interface GreetingsDB {
    initial: string[];
    transitions: {
      part1ToPart2: string;
      part2ToPart3: string;
    };
    conclusion: string[];
    lastUpdated: Date;
  }
