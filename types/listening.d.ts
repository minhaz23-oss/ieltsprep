// Enhanced types for dynamic IELTS listening tests
export interface ListeningSection {
  id: number;
  title: string;
  description?: string;
  instructions: string;
  audioUrl: string; // Supabase URL
  audioStartTime?: number; // For section-specific audio timing
  audioEndTime?: number;
  questions: ListeningQuestion[];
}

export interface ListeningQuestion {
  id: number;
  sectionId: number;
  questionNumber: number; // Global question number (1-40)
  type: 'multiple-choice' | 'fill-blank' | 'true-false' | 'matching' | 'short-answer' | 'diagram-labeling' | 'form-completion' | 'note-completion' | 'table-completion' | 'sentence-completion' | 'summary-completion';
  question: string;
  instructions?: string;
  options?: string[];
  correctAnswer: string | number | string[];
  acceptableAnswers?: string[]; // For fill-blank questions with multiple acceptable answers
  caseSensitive?: boolean;
  wordLimit?: number; // For short answer questions
  context?: {
    formTitle?: string;
    tableHeaders?: string[];
    diagramUrl?: string;
    noteStructure?: any;
  };
}

export interface ListeningTest {
  id: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  totalQuestions: number;
  timeLimit: number; // in minutes
  sections: ListeningSection[];
  metadata: {
    createdAt: string;
    updatedAt: string;
    tags: string[];
    description: string;
  };
}

export interface ListeningTestResult {
  id: string;
  testId: string;
  userId: string;
  answers: Record<number, string | number | string[]>;
  score: {
    correct: number;
    total: number;
    percentage: number;
    sectionScores: Array<{
      sectionId: number;
      correct: number;
      total: number;
    }>;
  };
  bandScore: number;
  timeSpent: number;
  completedAt: string;
  sectionResults: Array<{
    sectionId: number;
    timeSpent: number;
    completed: boolean;
  }>;
}

// Question type specific interfaces
export interface FormCompletionContext {
  formTitle: string;
  fields: Array<{
    label: string;
    questionId: number;
    type: 'text' | 'number' | 'date';
  }>;
}

export interface TableCompletionContext {
  headers: string[];
  rows: Array<{
    cells: Array<{
      content: string | null; // null means this is a question cell
      questionId?: number;
    }>;
  }>;
}

export interface DiagramLabelingContext {
  diagramUrl: string;
  labels: Array<{
    questionId: number;
    x: number; // percentage position
    y: number; // percentage position
  }>;
}

export interface MatchingContext {
  leftColumn: string[];
  rightColumn: string[];
  instructions: string;
}