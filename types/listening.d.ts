// Enhanced types for dynamic IELTS listening tests based on actual JSON structure
export interface QuestionGroup {
  groupId: string;
  instructions: string;
  displayType: 'form' | 'single-choice' | 'multiple-answer' | 'matching' | 'notes';
  imageUrl?: string;
  customFields?: Record<string, string | number | boolean>;
  content: {
    type: string;
    title?: string;
    questionText?: string;
    options?: Array<{ letter: string; text: string }>;
    questions?: Array<{
      questionNumber: number;
      questionText?: string;
      options?: Array<{ letter: string; text: string }>;
      correctAnswer: string;
    }>;
    matchingOptions?: Array<{ letter: string; text: string }>;
    items?: Array<{ questionNumber: number; text: string; correctAnswer: string }>;
    sectionTitle?: string;
    fields?: Array<{
      label?: string;
      value?: string;
      suffix?: string;
      isStatic?: boolean;
      isExample?: boolean;
      isSection?: boolean;
      sectionTitle?: string;
      questionNumber?: number;
      inputType?: string;
      correctAnswer?: string;
      inputPlaceholder?: string;
      isList?: boolean;
      listItems?: Array<{
        prefix?: string;
        questionNumber?: number;
        inputType?: string;
        correctAnswer?: string;
        suffix?: string;
        value?: string;
        isStatic?: boolean;
      }>;
    }>;
    sections?: Array<{
      sectionTitle?: string;
      content: Array<{
        text?: string;
        questionNumber?: number;
        inputType?: string;
        correctAnswer?: string;
        suffix?: string;
        isStatic?: boolean;
        isBullet?: boolean;
      }>;
    }>;
  };
}

export interface ListeningSection {
  id: number;
  title: string;
  audioUrl: string;
  questionGroups: QuestionGroup[];
  customFields?: Record<string, string | number | boolean>;
}

export interface ListeningTest {
  id: string;
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  totalQuestions: number;
  timeLimit: number; // in minutes
  metadata: {
    tags: string[];
    description: string;
    createdAt?: string;
    updatedAt?: string;
  };
  sections: ListeningSection[];
}

export interface ListeningTestResult {
  id: string;
  testId: string;
  userId: string;
  answers: Record<string | number, string | string[]>;
  score: {
    correct: number;
    total: number;
    percentage: number;
  };
  bandScore: number;
  timeSpent: number;
  completedAt: string;
  title: string;
  difficulty: string;
  totalQuestions: number;
}

// Admin panel types
export interface AdminListeningTest extends ListeningTest {
  stats?: {
    totalAttempts: number;
    averageScore: number;
    averageBandScore: number;
  };
}

export interface ListeningTestUpload {
  file: File;
  testData?: Partial<ListeningTest>;
}