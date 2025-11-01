'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { vapi } from '@/lib/vapi.sdk';
import { VapiMessage, SpeakingSession, ConversationMessage } from '@/types/speaking';
import { speakingSessionManager, classifyMessageType, evaluateSpeakingSession } from '@/lib/actions/speaking.actions';

type CallStatus = 'idle' | 'connecting' | 'active' | 'ended' | 'error' | 'evaluating' | 'evaluated';

export default function MockTestSpeakingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: mockTestId } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [speakingTestId, setSpeakingTestId] = useState<string | null>(null);
  
  // Speaking test state
  const [callStatus, setCallStatus] = useState<CallStatus>('idle');
  const [transcript, setTranscript] = useState<string>('');
  const [currentSession, setCurrentSession] = useState<SpeakingSession | null>(null);
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);

  useEffect(() => {
    loadMockTestSession();
  }, [mockTestId]);

  const loadMockTestSession = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/mock-tests/${mockTestId}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to load mock test');
      }

      const { mockTest, session } = data.data;

      if (!session) {
        router.push(`/mock-test/${mockTestId}/start`);
        return;
      }

      if (session.sectionResults?.speaking) {
        router.push(`/mock-test/${mockTestId}/results`);
        return;
      }

      if (session.currentSection !== 'speaking') {
        router.push(`/mock-test/${mockTestId}/${session.currentSection}`);
        return;
      }

      setSessionId(session.id);
      setSpeakingTestId(mockTest.sections.speaking.vapiAssistantId || 'vapi-assistant');
      setLoading(false);

    } catch (err) {
      console.error('Error loading mock test session:', err);
      setError(err instanceof Error ? err.message : 'Failed to load test');
      setLoading(false);
    }
  };

  const startVapiSession = async () => {
    if (!vapi.isReady()) {
      setError('Voice AI is not properly configured. Please check your settings.');
      return;
    }

    setIsLoading(true);
    setError('');
    
    try {
      setCallStatus('connecting');
      
      const session = speakingSessionManager.createSession();
      setCurrentSession(session);
      setConversationHistory([]);
      
      const firstMessage = `Hello! Welcome to the IELTS Speaking test. I'm your examiner for today. Let's begin with the speaking test.`;
      
      speakingSessionManager.addMessage({
        role: 'assistant',
        content: firstMessage,
        type: 'instruction'
      });
      
      await vapi.start({
        firstMessage,
        transcriber: {
          provider: 'deepgram',
          model: 'nova-2',
          language: 'en'
        },
        model: {
          provider: 'openai',
          model: 'gpt-3.5-turbo',
          temperature: 0.7,
          maxTokens: 150,
          systemPrompt: `You are an IELTS Speaking test examiner. Conduct a proper IELTS Speaking test following these rules:

CRITICAL INSTRUCTIONS:
1. Ask ONE question at a time and WAIT for the candidate's response
2. Do NOT ask multiple questions in a single response
3. Keep your responses short - maximum 2 sentences per response
4. Follow the IELTS Speaking test structure exactly

IELTS SPEAKING TEST STRUCTURE:

PART 1 (4-5 minutes): Introduction & Interview
- Start with: "Let's begin with Part 1. I'd like to ask you some questions about yourself."
- Ask about: home/accommodation, work/studies, hometown, hobbies, daily routine
- Ask 2-3 questions per topic, one at a time

PART 2 (3-4 minutes): Long Turn
- Give a cue card topic: "Now we'll move to Part 2. I'm going to give you a topic and I'd like you to talk about it for 1-2 minutes."
- Provide clear instructions

PART 3 (4-5 minutes): Discussion
- "Now let's discuss some more abstract questions related to your Part 2 topic."
- Ask deeper, analytical questions

Remember: ONE QUESTION AT A TIME. Wait for their complete response before asking the next question.`
        },
        voice: {
          provider: 'playht',
          voiceId: 'jennifer'
        },
        endCallFunctionEnabled: false,
        recordingEnabled: false
      });
      
    } catch (error) {
      console.error('Failed to start VAPI session:', error);
      setCallStatus('error');
      setError('Failed to start voice session. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const stopSession = async () => {
    try {
      await vapi.stop();
      speakingSessionManager.endSession();
      setTimeout(() => {
        handleEvaluation();
      }, 1000);
    } catch (error) {
      console.error('Failed to stop session:', error);
    }
  };

  const handleEvaluation = async () => {
    if (!currentSession || currentSession.messages.length < 2) {
      setError('Session too short for evaluation. Please have a longer conversation.');
      return;
    }

    setIsEvaluating(true);
    setCallStatus('evaluating');

    try {
      const evaluationRequest = speakingSessionManager.getEvaluationRequest();
      if (!evaluationRequest) {
        throw new Error('No session data available for evaluation');
      }

      const result = await evaluateSpeakingSession(evaluationRequest);
      
      if (result.success && result.evaluation) {
        if (currentSession) {
          currentSession.evaluation = result.evaluation;
          currentSession.status = 'evaluated';
          setCurrentSession({ ...currentSession });
        }
        
        setCallStatus('evaluated');
        
        // Save to mock test session
        await handleTestComplete(result.evaluation);
      } else {
        throw new Error(result.error || 'Evaluation failed');
      }
    } catch (error) {
      console.error('Evaluation error:', error);
      setError(`Evaluation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      setCallStatus('ended');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleTestComplete = async (evaluation: any) => {
    if (!sessionId) {
      console.error('No session ID available');
      alert('Session error. Please restart the test.');
      return;
    }

    try {
      const response = await fetch('/api/mock-tests/save-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          section: 'speaking',
          results: {
            testId: speakingTestId,
            bandScore: evaluation.overallBandScore,
            evaluation: {
              vapiCallId: currentSession?.id || 'ai-speaking-test',
              transcript: JSON.stringify(conversationHistory),
              criteria: evaluation.criteria,
              strengths: evaluation.strengths,
              improvements: evaluation.improvements
            }
          }
        }),
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.message || 'Failed to save results');

      // Redirect to results after short delay
      setTimeout(() => {
        router.push(`/mock-test/${mockTestId}/results`);
      }, 2000);

    } catch (err) {
      console.error('Error saving section results:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to save your results';
      alert(`${errorMessage}. Your results may not be saved, but you can continue.`);
      
      // Even on error, redirect to results
      setTimeout(() => {
        router.push(`/mock-test/${mockTestId}/results`);
      }, 2000);
    }
  };

  // Handle VAPI events
  useEffect(() => {
    const handleCallStart = () => setCallStatus('active');
    const handleCallEnd = () => {
      setCallStatus('ended');
      setTranscript('');
    };
    
    const handleMessage = (data: VapiMessage) => {
      try {
        if (data?.type === 'transcript') {
          if (typeof data.transcript === 'string' && data.transcript.trim()) {
            setTranscript(data.transcript);
            const messageType = classifyMessageType(data.transcript, 'user');
            speakingSessionManager.addMessage({
              role: 'user',
              content: data.transcript,
              type: messageType
            });
            if (currentSession) {
              setConversationHistory([...speakingSessionManager.currentSession?.messages || []]);
            }
          }
          return;
        }
        
        const role = data?.message?.role ?? data?.role;
        const text = data?.message?.content ?? data?.message?.text ?? data?.content ?? data?.text;
        
        if (role === 'assistant' && typeof text === 'string' && text.trim()) {
          const messageType = classifyMessageType(text, 'assistant');
          speakingSessionManager.addMessage({
            role: 'assistant',
            content: text,
            type: messageType
          });
          if (currentSession) {
            setConversationHistory([...speakingSessionManager.currentSession?.messages || []]);
          }
        }
      } catch (e) {
        console.error('Message handling error:', e);
      }
    };

    const handleError = (error: any) => {
      console.error('VAPI Error:', error);
      setCallStatus('error');
      setError('Voice session encountered an error. Please try again.');
    };

    if (vapi.isReady()) {
      vapi.on('call-start', handleCallStart);
      vapi.on('call-end', handleCallEnd);
      vapi.on('message', handleMessage);
      vapi.on('error', handleError);
    }

    return () => {
      if (vapi.isReady()) {
        vapi.off('call-start', handleCallStart);
        vapi.off('call-end', handleCallEnd);
        vapi.off('message', handleMessage);
        vapi.off('error', handleError);
      }
    };
  }, [currentSession]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading speaking test...</p>
        </div>
      </div>
    );
  }

  if (error && callStatus !== 'active') {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-red-50 border-2 border-red-200 rounded-xl p-8 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-900 mb-2">Error</h2>
          <p className="text-red-800 mb-6">{error}</p>
          <button onClick={() => router.push(`/mock-test/${mockTestId}`)} className="btn-primary">
            Back to Test Overview
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 bg-gradient-to-br from-pink-50 via-white to-orange-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            🎤 IELTS Speaking Test
          </h1>
          <p className="text-gray-600">AI-Powered Speaking Assessment</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8">
          {callStatus === 'idle' ? (
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Ready to Start Your Speaking Test?</h2>
              <p className="text-gray-600 mb-8 leading-relaxed">
                Connect with our AI examiner for a complete IELTS Speaking test simulation.
                The AI will guide you through all three parts of the test.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <button
                  onClick={startVapiSession}
                  disabled={isLoading}
                  className="btn-primary px-8 py-4 text-lg"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Connecting...
                    </>
                  ) : (
                    <>🎤 Start Speaking Test</>
                  )}
                </button>
                
                <button
                  onClick={async () => {
                    setIsLoading(true);
                    // Generate random band score between 0-9 with 0.5 increments
                    const randomScore = (Math.floor(Math.random() * 19) * 0.5).toFixed(1);
                    const bandScore = parseFloat(randomScore);
                    
                    // Simulate saving with random score
                    const mockEvaluation = {
                      overallBandScore: bandScore,
                      criteria: {
                        fluencyCoherence: bandScore,
                        lexicalResource: bandScore,
                        grammaticalRange: bandScore,
                        pronunciation: bandScore
                      },
                      strengths: ['Simulated test result'],
                      improvements: ['Take the real test for detailed feedback']
                    };
                    
                    await handleTestComplete(mockEvaluation);
                    setIsLoading(false);
                  }}
                  disabled={isLoading}
                  className="px-8 py-4 text-lg bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition-colors disabled:opacity-50"
                >
                  🎲 Simulate Test (Random Score)
                </button>
              </div>
              
              <p className="mt-4 text-sm text-gray-500">
                Use "Simulate Test" for quick testing with a random band score
              </p>
            </div>
          ) : callStatus === 'active' ? (
            <div className="space-y-6">
              <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                <h3 className="font-bold text-green-900 mb-2">🎤 Speaking Test in Progress</h3>
                <p className="text-sm text-green-700">
                  The AI examiner will guide you through the test. Listen carefully and respond naturally.
                </p>
              </div>

              <div className="min-h-[200px] rounded-lg border-2 bg-gray-50 p-6">
                <h4 className="mb-4 text-lg font-medium text-gray-700">Your Response:</h4>
                <div className="rounded-lg bg-white p-4 min-h-[120px]">
                  <p className="text-gray-800 text-lg leading-relaxed">
                    {transcript || 'Start speaking... Your voice will be transcribed here in real-time.'}
                  </p>
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={stopSession}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold px-8 py-4 rounded-full transition-colors"
                >
                  <svg className="w-6 h-6 inline mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                  </svg>
                  End Test
                </button>
              </div>
            </div>
          ) : callStatus === 'evaluating' ? (
            <div className="text-center space-y-6 py-8">
              <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <h2 className="text-2xl font-bold text-blue-600">Evaluating Your Performance</h2>
              <p className="text-gray-600">
                Our AI examiner is analyzing your responses and calculating your IELTS band score...
              </p>
            </div>
          ) : callStatus === 'evaluated' ? (
            <div className="text-center space-y-6 py-8">
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-2xl font-bold text-green-600">Evaluation Complete!</h2>
              {currentSession?.evaluation && (
                <div>
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-600 text-white text-3xl font-bold mb-4">
                    {currentSession.evaluation.overallBandScore}
                  </div>
                  <p className="text-lg text-gray-600 mb-4">Overall IELTS Band Score</p>
                </div>
              )}
              <p className="text-gray-600">Saving your results and redirecting to final results...</p>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-600">Processing...</p>
            </div>
          )}
        </div>

        {/* Info Section */}
        {callStatus === 'idle' && (
          <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
            <h3 className="text-lg font-bold text-blue-900 mb-4">📝 Test Structure</h3>
            <div className="space-y-3 text-sm text-blue-800">
              <div>
                <strong>Part 1 (4-5 min):</strong> Introduction & Interview - Questions about yourself
              </div>
              <div>
                <strong>Part 2 (3-4 min):</strong> Long Turn - Speak about a given topic for 1-2 minutes
              </div>
              <div>
                <strong>Part 3 (4-5 min):</strong> Discussion - More abstract questions related to Part 2
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
