interface Window {
  SpeechRecognition: any;
  webkitSpeechRecognition: any;
}

// Auth form types
type FormType = 'sign-in' | 'sign-up';

// Auth action parameter types
interface SignUpParams {
  uid: string;
  email: string;
  password: string;
  name: string;
}

interface SignInParams {
  email: string;
  idToken: string;
  name?: string;
  uid:string
}

// Test Results types
interface SaveReadingTestParams {
  testId: string;
  difficulty: string;
  title: string;
  score: {
    correct: number;
    total: number;
    percentage: number;
  };
  totalQuestions: number;
  timeSpent: number; // in seconds
  answers: Record<number, string | string[]>;
  skillAnalysis?: Record<string, { correct: number; total: number }>;
  bandScore: number;
}

interface SaveListeningTestParams {
  testId: string;
  difficulty: string;
  title: string;
  score: {
    correct: number;
    total: number;
    percentage: number;
  };
  totalQuestions: number;
  timeSpent: number; // in seconds
  answers: Record<number, string | number | string[]>;
  bandScore: number;
}

interface SaveWritingTestParams {
  testId: string;
  difficulty: string;
  task1Answer?: string;
  task2Answer?: string;
  evaluation: any;
  timeSpent: number; // in seconds
  overallBandScore: number;
}

interface SaveSpeakingTestParams {
  testId: string;
  difficulty: string;
  answers: any[];
  evaluation: any;
  timeSpent: number; // in seconds
  overallBandScore: number;
}

interface UserTestResult {
  id: string;
  userId: string;
  testType: 'reading' | 'listening' | 'writing' | 'speaking';
  testId: string;
  difficulty: string;
  score?: {
    correct: number;
    total: number;
    percentage: number;
  };
  bandScore?: number;
  overallBandScore?: number;
  timeSpent: number;
  completedAt: string;
  createdAt: string;
}

interface UserStats {
  userId: string;
  totalTests: number;
  testsByType: Record<string, number>;
  averageScores: Record<string, {
    percentage: number;
    bandScore: number;
    count: number;
  }>;
  bestScores: Record<string, {
    percentage: number;
    bandScore: number;
    achievedAt: string;
  }>;
  recentActivity: Array<{
    testType: string;
    percentage: number;
    bandScore: number;
    completedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

// Dashboard types

