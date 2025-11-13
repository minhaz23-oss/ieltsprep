export interface QualificationQuestion {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'fill-in-blank';
  category: 'grammar' | 'vocabulary' | 'reading-comprehension';
  question: string;
  options?: string[]; // For multiple-choice
  correctAnswer: string | string[];
  points: number;
  explanation?: string;
}

export interface QualificationExam {
  id: string;
  title: string;
  description: string;
  duration: number; // in minutes
  passingScore: number; // percentage (e.g., 70)
  totalPoints: number;
  questions: QualificationQuestion[];
  isActive: boolean;
  createdAt: string | Date | any; // ISO string when serialized
}

export interface ExamAttempt {
  id?: string;
  userId: string;
  examId: string;
  startedAt: string | Date | any; // ISO string when serialized
  completedAt?: string | Date | any; // ISO string when serialized
  answers: Record<string, string | string[]>; // questionId -> answer
  score: number; // percentage
  totalPoints: number;
  earnedPoints: number;
  passed: boolean;
  timeSpent: number; // in seconds
  premiumUnlocked: boolean;
}

export interface UserQualificationStatus {
  userId: string;
  hasPassed: boolean;
  attempts: number;
  lastAttemptAt?: string | Date | any; // ISO string when serialized
  passedAt?: string | Date | any; // ISO string when serialized
  premiumAccessMethod?: 'exam' | 'subscription';
  premiumExpiresAt?: string | Date | any; // ISO string when serialized
  nextAttemptAvailableAt?: string | Date | any; // ISO string when serialized
}

export interface PromotionalPeriod {
  startDate: Date | any;
  endDate: Date | any;
  isActive: boolean;
  daysRemaining?: number;
}
