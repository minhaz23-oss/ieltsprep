'use client'

import React, { useState, useEffect, useRef } from 'react';
import VoiceRecorder from './VoiceRecorder';

interface SpeakingTestSessionProps {
  sessionId: string;
  callId?: string;
  fallbackMode?: boolean;
  onSessionEnd: (results: any) => void;
}

interface CurrentQuestion {
  id: string;
  question: string;
  part: 1 | 2 | 3;
  responseTime: number;
  preparationTime?: number;
  cueCard?: {
    points: string[];
  };
}

const SpeakingTestSession: React.FC<SpeakingTestSessionProps> = ({
  sessionId,
  callId,
  fallbackMode = false,
  onSessionEnd
}) => {
  // State management
  const [isConnected, setIsConnected] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<CurrentQuestion | null>(null);
  const [currentPart, setCurrentPart] = useState<1 | 2 | 3>(1);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isPreparationTime, setIsPreparationTime] = useState(false);
  const [responses, setResponses] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Refs
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Always initialize fallback mode
    initializeFallbackMode();

    return () => {
      cleanup();
    };
  }, []);

  const initializeFallbackMode = () => {
    console.log('Initializing fallback mode...');
    setIsConnected(true);
    
    // Simulate first question
    setCurrentQuestion({
      id: 'p1_intro_1',
      question: 'Hello! Can you tell me your name and where you\'re from?',
      part: 1,
      responseTime: 60,
      preparationTime: 0
    });
    
    startResponseTimer(60);
  };


  // Timer functions
  const startPreparationTimer = (seconds: number) => {
    setTimeRemaining(seconds);
    setIsPreparationTime(true);
    
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          setIsPreparationTime(false);
          startResponseTimer(currentQuestion?.responseTime || 120);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startResponseTimer = (seconds: number) => {
    setTimeRemaining(seconds);
    setIsPreparationTime(false);
    
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          // Time's up - move to next question
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleTimeUp = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    
    // In fallback mode, simulate moving to next question
    if (fallbackMode) {
      // This would normally be handled by VAPI webhook
      console.log('Time up - moving to next question');
    }
  };

  const cleanup = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getPartTitle = (part: number): string => {
    switch (part) {
      case 1: return 'Part 1: Introduction & Interview';
      case 2: return 'Part 2: Individual Long Turn';
      case 3: return 'Part 3: Two-way Discussion';
      default: return 'Speaking Test';
    }
  };

  const handleManualRecordingComplete = (audioBlob: Blob, duration: number) => {
    // Handle manual recording in fallback mode
    console.log('Manual recording completed:', duration, 'seconds');
    
    const response = {
      questionId: currentQuestion?.id || 'unknown',
      part: currentPart,
      audioBlob,
      duration,
      timestamp: new Date()
    };
    
    setResponses(prev => [...prev, response]);
    
    // In a real implementation, you'd process the audio and move to next question
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8 max-w-md text-center">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <h3 className="text-xl font-bold text-red-800 mb-2">Connection Error</h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">
            {fallbackMode ? 'Preparing Your Test...' : 'Connecting to Speaking Test...'}
          </h3>
          <p className="text-gray-600">
            {fallbackMode 
              ? 'Setting up your speaking practice session'
              : 'Please wait while we establish the voice connection'
            }
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                IELTS Speaking Test
              </h1>
              <p className="text-gray-600 mt-1">
                {getPartTitle(currentPart)}
              </p>
            </div>
            
            <div className="text-right">
              <div className={`text-3xl font-mono font-bold ${
                isPreparationTime ? 'text-yellow-600' : 'text-primary'
              }`}>
                {formatTime(timeRemaining)}
              </div>
              <p className="text-sm text-gray-600">
                {isPreparationTime ? 'Preparation Time' : 'Response Time'}
              </p>
            </div>
          </div>
          
          {/* Connection Status */}
          <div className="flex items-center mt-4 pt-4 border-t">
            <div className={`w-3 h-3 rounded-full mr-2 ${
              isConnected 
                ? 'bg-green-500 animate-pulse' 
                : 'bg-red-500'
            }`}></div>
            <span className="text-sm font-medium">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
            
          </div>
        </div>

        {/* Current Question */}
        {currentQuestion && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-start">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold mr-4 ${
                currentPart === 1 ? 'bg-green-500' :
                currentPart === 2 ? 'bg-blue-500' : 'bg-purple-500'
              }`}>
                {currentPart}
              </div>
              
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {currentQuestion.question}
                </h3>
                
                {/* Cue Card for Part 2 */}
                {currentQuestion.cueCard && (
                  <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 mb-4">
                    <h4 className="font-bold text-yellow-800 mb-2">Points to cover:</h4>
                    <ul className="text-yellow-700 space-y-1">
                      {currentQuestion.cueCard.points.map((point, index) => (
                        <li key={index} className="flex items-start">
                          <span className="w-2 h-2 bg-yellow-600 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                          {point}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {isPreparationTime && (
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      <span className="text-blue-800 font-medium">
                        Preparation time - use this time to organize your thoughts
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Fallback Recording Component */}
        {fallbackMode && !isPreparationTime && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <VoiceRecorder 
              onRecordingComplete={handleManualRecordingComplete}
              maxDuration={currentQuestion?.responseTime || 120}
              disabled={isPreparationTime}
            />
          </div>
        )}

      </div>
    </div>
  );
};

export default SpeakingTestSession;
