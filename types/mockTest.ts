export interface MockTestSection {
  testId: string;
  duration: number; // in minutes
  order: number;
}

export interface MockTest {
  id: string;
  title: string;
  description: string;
  isPremium: boolean;
  createdAt: Date | any;
  sections: {
    listening: MockTestSection;
    reading: MockTestSection;
    writing: MockTestSection;
    speaking: MockTestSection;
  };
}

export interface SectionResult {
  testId: string;
  score?: number;
  bandScore?: number;
  answers?: any;
  startedAt: Date | any;
  completedAt?: Date | any;
  evaluation?: any;
}

export type MockTestStatus = 'not_started' | 'in_progress' | 'completed';
export type MockTestSectionName = 'listening' | 'reading' | 'writing' | 'speaking';

export interface MockTestSession {
  id?: string;
  userId: string;
  mockTestId: string;
  status: MockTestStatus;
  startedAt: Date | any;
  completedAt?: Date | any;
  currentSection?: MockTestSectionName;
  sectionResults: {
    listening?: SectionResult;
    reading?: SectionResult;
    writing?: SectionResult;
    speaking?: SectionResult;
  };
  overallBandScore?: number;
  isPremium: boolean;
}

export interface MockTestWithSession extends MockTest {
  session?: MockTestSession;
  completionStatus?: 'not_started' | 'in_progress' | 'completed';
}
