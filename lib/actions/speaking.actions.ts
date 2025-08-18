import { SpeakingTestData, SpeakingSession, Part2Topic, Part3Theme, SpeakingFeedback } from '@/types/speaking';
import speakingData from '@/data/speakingQuestions.json';

export class SpeakingTestManager {
  private testData: SpeakingTestData;
  private session: SpeakingSession | null = null;

  constructor() {
    this.testData = speakingData as SpeakingTestData;
  }

  // Initialize a new speaking test session
  initializeSession(): SpeakingSession {
    this.session = {
      currentPart: 1,
      currentQuestionIndex: 0,
      currentTopicIndex: 0,
      startTime: new Date(),
      responses: [],
      isActive: true,
      isPaused: false,
    };
    return this.session;
  }

  // Get current session
  getCurrentSession(): SpeakingSession | null {
    return this.session;
  }

  // Get introduction message for Part 1
  getIntroductionMessage(): string {
    return this.testData.part1.introduction.examiner_intro;
  }

  // Get follow-up questions for introduction
  getIntroductionFollowUpQuestions(): string[] {
    return this.testData.part1.introduction.follow_up_questions;
  }

  // Get current question based on session state
  getCurrentQuestion(): string | null {
    if (!this.session) return null;

    switch (this.session.currentPart) {
      case 1:
        return this.getPart1Question();
      case 2:
        return this.getPart2Question();
      case 3:
        return this.getPart3Question();
      default:
        return null;
    }
  }

  // Get Part 1 question
  private getPart1Question(): string | null {
    const topics = this.testData.part1.topics;
    if (this.session!.currentTopicIndex >= topics.length) return null;
    
    const currentTopic = topics[this.session!.currentTopicIndex];
    if (this.session!.currentQuestionIndex >= currentTopic.questions.length) return null;
    
    return currentTopic.questions[this.session!.currentQuestionIndex];
  }

  // Get Part 2 cue card
  private getPart2Question(): string | null {
    const topics = this.testData.part2.topics;
    if (this.session!.currentTopicIndex >= topics.length) return null;
    
    const currentTopic = topics[this.session!.currentTopicIndex];
    return currentTopic.cue_card;
  }

  // Get Part 3 question
  private getPart3Question(): string | null {
    const themes = this.testData.part3.discussion_themes;
    if (this.session!.currentTopicIndex >= themes.length) return null;
    
    const currentTheme = themes[this.session!.currentTopicIndex];
    if (this.session!.currentQuestionIndex >= currentTheme.questions.length) return null;
    
    return currentTheme.questions[this.session!.currentQuestionIndex];
  }

  // Move to next question
  moveToNextQuestion(): boolean {
    if (!this.session) return false;

    switch (this.session.currentPart) {
      case 1:
        return this.moveToNextPart1Question();
      case 2:
        return this.moveToNextPart2Question();
      case 3:
        return this.moveToNextPart3Question();
      default:
        return false;
    }
  }

  private moveToNextPart1Question(): boolean {
    const topics = this.testData.part1.topics;
    const currentTopic = topics[this.session!.currentTopicIndex];
    
    // Move to next question in current topic
    if (this.session!.currentQuestionIndex < currentTopic.questions.length - 1) {
      this.session!.currentQuestionIndex++;
      return true;
    }
    
    // Move to next topic
    if (this.session!.currentTopicIndex < topics.length - 1) {
      this.session!.currentTopicIndex++;
      this.session!.currentQuestionIndex = 0;
      return true;
    }
    
    // Move to Part 2
    this.session!.currentPart = 2;
    this.session!.currentTopicIndex = Math.floor(Math.random() * this.testData.part2.topics.length);
    this.session!.currentQuestionIndex = 0;
    return true;
  }

  private moveToNextPart2Question(): boolean {
    // Part 2 is a single cue card, move to Part 3
    this.session!.currentPart = 3;
    
    // Find the related Part 3 theme
    const part2Topic = this.testData.part2.topics[this.session!.currentTopicIndex];
    const relatedTheme = this.testData.part3.discussion_themes.find(
      theme => theme.related_to === part2Topic.id
    );
    
    if (relatedTheme) {
      this.session!.currentTopicIndex = this.testData.part3.discussion_themes.indexOf(relatedTheme);
    } else {
      this.session!.currentTopicIndex = 0;
    }
    
    this.session!.currentQuestionIndex = 0;
    return true;
  }

  private moveToNextPart3Question(): boolean {
    const themes = this.testData.part3.discussion_themes;
    const currentTheme = themes[this.session!.currentTopicIndex];
    
    // Move to next question in current theme
    if (this.session!.currentQuestionIndex < currentTheme.questions.length - 1) {
      this.session!.currentQuestionIndex++;
      return true;
    }
    
    // Test is complete
    this.session!.isActive = false;
    return false;
  }

  // Record user response
  recordResponse(question: string, response: string): void {
    if (!this.session) return;

    this.session.responses.push({
      part: this.session.currentPart,
      question,
      response,
      timestamp: new Date(),
    });
  }

  // Get current part information
  getCurrentPartInfo(): { title: string; description: string; duration: number } | null {
    if (!this.session) return null;

    switch (this.session.currentPart) {
      case 1:
        return {
          title: this.testData.part1.title,
          description: this.testData.part1.description,
          duration: this.testData.part1.duration,
        };
      case 2:
        return {
          title: this.testData.part2.title,
          description: this.testData.part2.description,
          duration: this.testData.part2.duration,
        };
      case 3:
        return {
          title: this.testData.part3.title,
          description: this.testData.part3.description,
          duration: this.testData.part3.duration,
        };
      default:
        return null;
    }
  }

  // Get Part 2 preparation time
  getPart2PrepTime(): number {
    return this.testData.part2.prep_time;
  }

  // Get Part 2 speaking time
  getPart2SpeakingTime(): number {
    return this.testData.part2.speaking_time;
  }

  // Check if test is complete
  isTestComplete(): boolean {
    return this.session ? !this.session.isActive : false;
  }

  // Get test progress
  getTestProgress(): { currentPart: number; totalParts: number; progress: number } {
    if (!this.session) return { currentPart: 0, totalParts: 3, progress: 0 };

    const totalParts = 3;
    const currentPart = this.session.currentPart;
    const progress = ((currentPart - 1) / totalParts) * 100;

    return { currentPart, totalParts, progress };
  }

  // Generate basic feedback (simplified version)
  generateFeedback(): SpeakingFeedback {
    if (!this.session) {
      return {
        overallScore: 0,
        fluencyCoherence: 0,
        lexicalResource: 0,
        grammaticalRange: 0,
        pronunciation: 0,
        feedback: 'No session data available.',
        suggestions: [],
      };
    }

    // This is a simplified feedback system
    // In a real application, you would use AI/ML models for proper evaluation
    const responseCount = this.session.responses.length;
    const avgResponseLength = this.session.responses.reduce(
      (acc, response) => acc + response.response.length,
      0
    ) / responseCount || 0;

    // Basic scoring based on response length and count (simplified)
    const baseScore = Math.min(9, Math.max(1, Math.floor(avgResponseLength / 50) + 3));
    
    return {
      overallScore: baseScore,
      fluencyCoherence: baseScore,
      lexicalResource: baseScore,
      grammaticalRange: baseScore,
      pronunciation: baseScore,
      feedback: `You completed ${responseCount} responses with an average length of ${Math.floor(avgResponseLength)} characters. This is a basic assessment - for accurate scoring, consider professional evaluation.`,
      suggestions: [
        'Practice speaking for longer periods to improve fluency',
        'Use a wider range of vocabulary',
        'Work on grammatical accuracy',
        'Focus on clear pronunciation',
      ],
    };
  }

  // End session
  endSession(): void {
    if (this.session) {
      this.session.isActive = false;
    }
  }

  // Pause/Resume session
  pauseSession(): void {
    if (this.session) {
      this.session.isPaused = true;
    }
  }

  resumeSession(): void {
    if (this.session) {
      this.session.isPaused = false;
    }
  }
}

// Export singleton instance
export const speakingTestManager = new SpeakingTestManager();

// Utility functions
export const validateVapiToken = (): boolean => {
  const token = process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN;
  return !!(token && token.length > 0);
};

export const getVapiToken = (): string | null => {
  return process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN || null;
};