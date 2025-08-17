'use client'

import React, { useState, useEffect, useRef } from 'react';
import { vapi } from '@/lib/vapi.sdk';

// Props for the component
interface VapiSpeakingSessionProps {
  sessionId: string;
  onSessionEnd: (results: any) => void;
}

// Structure for a conversation turn
interface ConversationTurn {
  id: string;
  timestamp: Date;
  speaker: 'examiner' | 'candidate';
  message: string;
  audioUrl?: string;
  transcript?: string;
}

// Structure for the final evaluation data
interface EvaluationData {
  question: string;
  transcript: string;
  audioUrl?: string;
}

const VapiSpeakingSession: React.FC<VapiSpeakingSessionProps> = ({
  sessionId,
  onSessionEnd
}) => {
  // State management
  const [isConnected, setIsConnected] = useState(false);
  const [isCallActive, setIsCallActive] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<ConversationTurn[]>([]);
  const [currentStatus, setCurrentStatus] = useState<string>('Initializing...');
  const [error, setError] = useState<string | null>(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<any | null>(null);
  
  const callRef = useRef<any>(null);

  useEffect(() => {
    initializeVapi();
    return () => cleanup();
  }, []);

  const initializeVapi = () => {
    try {
      // Set up VAPI event listeners
      vapi.on('call-start', () => {
        console.log('Call started');
        setIsCallActive(true);
        setCurrentStatus('Call in progress...');
        addConversationTurn('examiner', 'Call started. Examiner is connecting...');
      });

      vapi.on('call-end', () => {
        console.log('Call ended');
        setIsCallActive(false);
        setCurrentStatus('Call ended');
        addConversationTurn('examiner', 'Call ended');
        handleCallEnd();
      });

      vapi.on('speech-start', () => {
        console.log('Speech started');
        setCurrentStatus('Listening...');
      });

      vapi.on('speech-end', () => {
        console.log('Speech ended');
        setCurrentStatus('Processing...');
      });

      vapi.on('volume-level', (volume: number) => {
        // Handle volume level updates if needed
      });

      vapi.on('message', (message: any) => {
        console.log('Message received:', message);
        if (message.role === 'assistant') {
          addConversationTurn('examiner', message.content);
        } else if (message.role === 'user') {
          addConversationTurn('candidate', message.content);
        }
      });

      vapi.on('error', (error: any) => {
        console.error('VAPI error:', error);
        setError(`VAPI Error: ${error.message}`);
      });

      setIsConnected(true);
      setCurrentStatus('Ready to start call');
    } catch (error) {
      console.error('Error initializing VAPI:', error);
      setError('Failed to initialize VAPI');
    }
  };

  const startCall = async () => {
    try {
      setError(null);
      setCurrentStatus('Starting call...');
      
      // Start the call with the VAPI assistant
      const assistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID || 'your-assistant-id';
      callRef.current = await vapi.start(assistantId);

      setCurrentStatus('Call started successfully');
    } catch (error) {
      console.error('Error starting call:', error);
      setError('Failed to start call');
      setCurrentStatus('Failed to start call');
    }
  };

  const stopCall = async () => {
    try {
      if (callRef.current) {
        await vapi.stop();
        callRef.current = null;
        setCurrentStatus('Call stopped');
      }
    } catch (error) {
      console.error('Error stopping call:', error);
    }
  };

  const addConversationTurn = (speaker: 'examiner' | 'candidate', message: string, audioUrl?: string, transcript?: string) => {
    const turn: ConversationTurn = {
      id: Date.now().toString(),
      timestamp: new Date(),
      speaker,
      message,
      audioUrl,
      transcript,
    };
    
    setConversationHistory(prev => [...prev, turn]);
  };

  const handleCallEnd = () => {
    // Process conversation history to extract Q&A pairs
    const qaPairs = extractQAPairs(conversationHistory);
    
    if (qaPairs.length > 0) {
      setCurrentStatus('Call ended. Ready to evaluate.');
    } else {
      setCurrentStatus('Call ended. No responses to evaluate.');
    }
  };

  const extractQAPairs = (history: ConversationTurn[]): EvaluationData[] => {
    const qaPairs: EvaluationData[] = [];
    let currentQuestion = '';
    
    for (const turn of history) {
      if (turn.speaker === 'examiner') {
        // Extract questions from examiner messages
        if (turn.message.includes('?') || 
            turn.message.toLowerCase().includes('describe') ||
            turn.message.toLowerCase().includes('tell me') ||
            turn.message.toLowerCase().includes('what') ||
            turn.message.toLowerCase().includes('how') ||
            turn.message.toLowerCase().includes('why')) {
          currentQuestion = turn.message;
        }
      } else if (turn.speaker === 'candidate' && currentQuestion) {
        // Extract candidate responses
        qaPairs.push({
          question: currentQuestion,
          transcript: turn.transcript || turn.message,
          audioUrl: turn.audioUrl,
        });
        currentQuestion = ''; // Reset for next Q&A pair
      }
    }
    
    return qaPairs;
  };

  const handleEvaluate = async () => {
    setIsEvaluating(true);
    setError(null);

    try {
      const qaPairs = extractQAPairs(conversationHistory);
      
      if (qaPairs.length === 0) {
        setError('No question-answer pairs found to evaluate');
        return;
      }

      // Call the evaluation API
      const response = await fetch('/api/evaluate-speaking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ responses: qaPairs }),
      });

      if (!response.ok) {
        throw new Error(`Evaluation failed: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        setEvaluationResult(result.data);
        onSessionEnd(result.data);
      } else {
        setError(result.error || 'Evaluation failed');
      }
    } catch (error) {
      console.error('Evaluation error:', error);
      setError('Failed to evaluate speaking test');
    } finally {
      setIsEvaluating(false);
    }
  };

  const cleanup = () => {
    if (callRef.current) {
      vapi.stop();
    }
  };

  // Render states
  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <h2 className="text-red-500 text-xl mb-4">Error</h2>
        <p className="text-gray-600 mb-4">{error}</p>
        <button 
          onClick={() => setError(null)} 
          className="btn-primary"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (evaluationResult) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <h2 className="text-2xl font-bold mb-6 text-center">Speaking Test Results</h2>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="text-center mb-6">
            <h3 className="text-xl font-semibold mb-2">Overall Band Score</h3>
            <div className="text-4xl font-bold text-blue-600">
              {evaluationResult.overallBand.toFixed(1)}
            </div>
          </div>
          
          {evaluationResult.responses?.map((response: any, index: number) => (
            <div key={index} className="mb-6 p-4 border rounded-lg">
              <h4 className="font-semibold mb-2">Question {index + 1}</h4>
              <p className="text-gray-700 mb-2">{response.question}</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><strong>Fluency:</strong> {response.fluency}</div>
                <div><strong>Coherence:</strong> {response.coherence}</div>
                <div><strong>Vocabulary:</strong> {response.lexicalResource}</div>
                <div><strong>Grammar:</strong> {response.grammaticalRange}</div>
                <div><strong>Pronunciation:</strong> {response.pronunciation}</div>
                <div><strong>Overall:</strong> {response.overallBand}</div>
              </div>
              <p className="text-sm text-gray-600 mt-2">{response.feedback}</p>
            </div>
          ))}
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-2">Overall Feedback</h4>
            <p className="text-gray-700 mb-2">{evaluationResult.advice}</p>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h5 className="font-medium text-green-700">Strengths</h5>
                <ul className="text-sm text-gray-600">
                  {evaluationResult.overallStrengths?.map((strength: string, index: number) => (
                    <li key={index}>• {strength}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-orange-700">Areas for Improvement</h5>
                <ul className="text-sm text-gray-600">
                  {evaluationResult.overallImprovements?.map((improvement: string, index: number) => (
                    <li key={index}>• {improvement}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">IELTS Speaking Test - VAPI Session</h1>
          <p className="text-gray-600 mb-4">Status: {currentStatus}</p>
          
          <div className="flex gap-4 mb-4">
            {!isCallActive ? (
              <button 
                onClick={startCall} 
                disabled={!isConnected}
                className="btn-primary"
              >
                Start Speaking Test
              </button>
            ) : (
              <button 
                onClick={stopCall} 
                className="btn-danger"
              >
                End Test
              </button>
            )}
            
            {conversationHistory.length > 0 && !isCallActive && (
              <button 
                onClick={handleEvaluate} 
                disabled={isEvaluating}
                className="btn-secondary"
              >
                {isEvaluating ? 'Evaluating...' : 'Evaluate Test'}
              </button>
            )}
          </div>
        </div>

        {/* Conversation History */}
        {conversationHistory.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Conversation History</h2>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {conversationHistory.map((turn) => (
                <div 
                  key={turn.id} 
                  className={`p-3 rounded-lg ${
                    turn.speaker === 'examiner' 
                      ? 'bg-blue-50 border-l-4 border-blue-400' 
                      : 'bg-green-50 border-l-4 border-green-400'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-medium px-2 py-1 rounded ${
                      turn.speaker === 'examiner' 
                        ? 'bg-blue-200 text-blue-800' 
                        : 'bg-green-200 text-green-800'
                    }`}>
                      {turn.speaker === 'examiner' ? 'Examiner' : 'You'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {turn.timestamp.toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-gray-800">{turn.message}</p>
                  {turn.transcript && turn.transcript !== turn.message && (
                    <p className="text-sm text-gray-600 mt-1">
                      <em>Transcript: {turn.transcript}</em>
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-3">Instructions</h3>
          <ul className="text-gray-700 space-y-2">
            <li>• Click "Start Speaking Test" to begin your IELTS speaking test</li>
            <li>• The AI examiner will guide you through all three parts of the test</li>
            <li>• Speak clearly and naturally as you would in a real IELTS test</li>
            <li>• The test will automatically record your responses</li>
            <li>• Click "End Test" when you're finished or if you need to stop</li>
            <li>• Click "Evaluate Test" to get your detailed results and feedback</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default VapiSpeakingSession;
