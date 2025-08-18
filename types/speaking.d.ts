export interface SpeakingQuestion {
  topic: string;
  questions: string[];
}

export interface Part2Topic {
  id: string;
  title: string;
  cue_card: string;
  follow_up_questions: string[];
}

export interface Part3Theme {
  theme: string;
  related_to: string;
  questions: string[];
}

export interface SpeakingTestData {
  part1: {
    title: string;
    duration: number;
    description: string;
    introduction: {
      examiner_intro: string;
      follow_up_questions: string[];
    };
    topics: SpeakingQuestion[];
  };
  part2: {
    title: string;
    duration: number;
    description: string;
    prep_time: number;
    speaking_time: number;
    topics: Part2Topic[];
  };
  part3: {
    title: string;
    duration: number;
    description: string;
    discussion_themes: Part3Theme[];
  };
  scoring_criteria: {
    [key: string]: {
      description: string;
      bands: {
        [key: string]: string;
      };
    };
  };
}

export interface SpeakingSession {
  currentPart: 1 | 2 | 3;
  currentQuestionIndex: number;
  currentTopicIndex: number;
  startTime: Date;
  responses: {
    part: number;
    question: string;
    response: string;
    timestamp: Date;
  }[];
  isActive: boolean;
  isPaused: boolean;
}

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

export interface SpeakingFeedback {
  overallScore: number;
  fluencyCoherence: number;
  lexicalResource: number;
  grammaticalRange: number;
  pronunciation: number;
  feedback: string;
  suggestions: string[];
}