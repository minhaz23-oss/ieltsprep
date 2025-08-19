import {
  SpeakingSession,
  ConversationMessage,
  SpeakingEvaluationRequest,
  SpeakingEvaluationResponse
} from '@/types/speaking';

// Utility functions for VAPI integration
export const validateVapiToken = (): boolean => {
  const token = process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN;
  return !!(token && token.length > 0);
};

export const getVapiToken = (): string | null => {
  return process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN || null;
};

// Generate unique session ID
const generateSessionId = (): string => {
  return `speaking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Generate unique message ID
const generateMessageId = (): string => {
  return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Speaking Session Manager Class
export class SpeakingSessionManager {
  public currentSession: SpeakingSession | null = null;

  createSession(): SpeakingSession {
    const session: SpeakingSession = {
      id: generateSessionId(),
      startTime: new Date(),
      status: 'active',
      messages: [],
      fullTranscript: ''
    };
    
    this.currentSession = session;
    
    // Store session in localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentSpeakingSession', JSON.stringify(session));
    }
    
    return session;
  }

  addMessage(message: Omit<ConversationMessage, 'id' | 'timestamp'>): void {
    if (!this.currentSession) {
      console.warn('No active session to add message to');
      return;
    }

    const fullMessage: ConversationMessage = {
      ...message,
      id: generateMessageId(),
      timestamp: new Date()
    };

    this.currentSession.messages.push(fullMessage);
    
    // Update full transcript
    this.updateFullTranscript();
    
    // Persist to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentSpeakingSession', JSON.stringify(this.currentSession));
    }
  }

  private updateFullTranscript(): void {
    if (!this.currentSession) return;
    
    this.currentSession.fullTranscript = this.currentSession.messages
      .map(msg => `${msg.role.toUpperCase()}: ${msg.content}`)
      .join('\n\n');
  }

  endSession(): void {
    if (!this.currentSession) {
      console.warn('No active session to end');
      return;
    }

    this.currentSession.endTime = new Date();
    this.currentSession.status = 'completed';
    
    // Persist final session state
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentSpeakingSession', JSON.stringify(this.currentSession));
    }
  }

  getFullTranscript(): string {
    return this.currentSession?.fullTranscript || '';
  }

  getSessionDuration(): number {
    if (!this.currentSession?.startTime) return 0;
    const endTime = this.currentSession.endTime || new Date();
    return Math.floor((endTime.getTime() - this.currentSession.startTime.getTime()) / 1000);
  }

  // Load session from localStorage
  loadSession(): SpeakingSession | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const sessionData = localStorage.getItem('currentSpeakingSession');
      if (sessionData) {
        const session = JSON.parse(sessionData);
        // Convert date strings back to Date objects
        session.startTime = new Date(session.startTime);
        if (session.endTime) session.endTime = new Date(session.endTime);
        session.messages = session.messages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        
        this.currentSession = session;
        return session;
      }
    } catch (error) {
      console.error('Error loading session from localStorage:', error);
    }
    
    return null;
  }

  // Clear session data
  clearSession(): void {
    this.currentSession = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('currentSpeakingSession');
    }
  }

  // Get evaluation request data
  getEvaluationRequest(): SpeakingEvaluationRequest | null {
    if (!this.currentSession) return null;
    
    return {
      sessionId: this.currentSession.id,
      fullTranscript: this.currentSession.fullTranscript,
      messages: this.currentSession.messages,
      sessionDuration: this.getSessionDuration()
    };
  }
}

// Export singleton instance for global session management
export const speakingSessionManager = new SpeakingSessionManager();

// Server action to evaluate speaking session
export async function evaluateSpeakingSession(
  evaluationRequest: SpeakingEvaluationRequest
): Promise<SpeakingEvaluationResponse> {
  try {
    const response = await fetch('/api/evaluate-speaking', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(evaluationRequest),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result: SpeakingEvaluationResponse = await response.json();
    return result;
  } catch (error) {
    console.error('Error evaluating speaking session:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      evaluatedAt: new Date().toISOString()
    };
  }
}

// Utility function to classify message type
export function classifyMessageType(content: string, role: 'user' | 'assistant'): 'question' | 'answer' | 'instruction' | 'general' {
  if (role === 'assistant') {
    // Check if it's a question (ends with ? or contains question words)
    if (content.includes('?') || /\b(what|how|why|when|where|which|who|do you|can you|would you|have you)\b/i.test(content)) {
      return 'question';
    }
    // Check if it's an instruction
    if (/\b(please|now|let's|describe|tell me|talk about)\b/i.test(content)) {
      return 'instruction';
    }
    return 'general';
  } else {
    // User messages are typically answers
    return 'answer';
  }
}

// Basic session tracking (legacy - keeping for compatibility)
export class SimpleSpeakingSession {
  private startTime: Date | null = null;
  private isActive: boolean = false;

  start(): void {
    this.startTime = new Date();
    this.isActive = true;
  }

  end(): void {
    this.isActive = false;
  }

  getSessionDuration(): number {
    if (!this.startTime) return 0;
    return Math.floor((new Date().getTime() - this.startTime.getTime()) / 1000);
  }

  isSessionActive(): boolean {
    return this.isActive;
  }
}

// Export singleton instance for basic session tracking (legacy)
export const simpleSpeakingSession = new SimpleSpeakingSession();