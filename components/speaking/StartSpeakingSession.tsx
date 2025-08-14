'use client'

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface StartSpeakingSessionProps {
  testId: string;
  testTitle: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'mixed';
  description: string;
  estimatedDuration: number;
  isDynamic?: boolean;
  disabled?: boolean;
  onSessionStart?: (sessionData: any) => void;
}

const StartSpeakingSession: React.FC<StartSpeakingSessionProps> = ({
  testId,
  testTitle,
  difficulty,
  description,
  estimatedDuration,
  isDynamic = false,
  disabled = false,
  onSessionStart
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const router = useRouter();

  const handleStartSession = async () => {
    try {
      setLoading(true);
      setError('');

      // Create speaking session
      const response = await fetch('/api/speaking/start-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          difficulty: isDynamic ? difficulty : 'mixed',
          testType: isDynamic ? 'random' : 'predefined',
          testId: !isDynamic ? testId : undefined
        })
      });

      const result = await response.json();

      if (result.success) {
        console.log('Session started successfully:', result.data);
        
        if (onSessionStart) {
          onSessionStart(result.data);
        }

        // Navigate to the speaking session page
        router.push(`/speaking-session/${result.data.sessionId}?callId=${result.data.callId || ''}&fallback=${result.data.fallbackMode || false}`);

      } else {
        setError(result.message || 'Failed to start speaking session');
      }

    } catch (error) {
      console.error('Error starting session:', error);
      setError('Failed to connect to the server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'; 
      case 'hard': return 'bg-red-100 text-red-800 border-red-200';
      case 'mixed': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDifficultyIcon = (diff: string) => {
    switch (diff) {
      case 'easy':
        return (
          <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'medium':
        return (
          <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'hard':
        return (
          <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'mixed':
        return (
          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white rounded-xl border-2 border-primary/20 hover:border-primary hover:shadow-xl transition-all duration-300 p-6 h-full">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center space-x-1 ${getDifficultyColor(difficulty)}`}>
          {getDifficultyIcon(difficulty)}
          <span>{difficulty.toUpperCase()}</span>
        </div>
        
        {isDynamic && (
          <div className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
            RANDOM
          </div>
        )}
      </div>

      {/* Content */}
      <div className="mb-6">
        <h3 className="text-xl font-bold text-black mb-3 group-hover:text-primary transition-colors">
          {testTitle}
        </h3>
        
        <p className="text-gray-600 mb-4 leading-relaxed">
          {description}
        </p>

        {/* Test Info */}
        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <div className="flex items-center space-x-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
            </svg>
            <span>{Math.ceil(estimatedDuration / 60)} min</span>
          </div>
          <div className="flex items-center space-x-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
            </svg>
            <span>3 parts</span>
          </div>
        </div>

        {/* Features for dynamic tests */}
        {isDynamic && (
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <h4 className="text-sm font-semibold text-gray-800 mb-2">What you'll get:</h4>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Randomly selected questions</li>
              <li>• Voice interaction with AI examiner</li>
              <li>• Real-time IELTS scoring</li>
              <li>• Detailed feedback and improvement tips</li>
            </ul>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm font-medium">{error}</p>
        </div>
      )}

      {/* Action Button */}
      <button 
        onClick={handleStartSession}
        disabled={loading || disabled}
        className={`w-full font-bold py-3 px-6 rounded-lg transition-all duration-300 ${
          loading || disabled
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-primary text-white hover:bg-red-700 hover:shadow-lg'
        }`}
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Starting Session...
          </div>
        ) : disabled ? (
          'Daily Limit Reached'
        ) : (
          'Start Speaking Test'
        )}
      </button>

      {/* Voice Connection Info */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start">
          <svg className="w-4 h-4 text-blue-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div>
            <p className="text-blue-800 text-xs font-medium mb-1">Voice-Enabled Test</p>
            <p className="text-blue-700 text-xs">
              This test uses AI voice interaction. Make sure your microphone is enabled and you're in a quiet environment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartSpeakingSession;
