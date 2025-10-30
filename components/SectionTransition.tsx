'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface SectionTransitionProps {
  mockTestId: string;
  completedSection: {
    name: string;
    icon: string;
    score?: number;
    bandScore?: number;
  };
  nextSection: {
    name: string;
    icon: string;
    duration: number;
  };
}

export default function SectionTransition({
  mockTestId,
  completedSection,
  nextSection
}: SectionTransitionProps) {
  const router = useRouter();
  const [breakTime, setBreakTime] = useState(120); // 2 minutes in seconds
  const [onBreak, setOnBreak] = useState(false);

  useEffect(() => {
    if (!onBreak) return;

    const timer = setInterval(() => {
      setBreakTime((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleContinue();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onBreak]);

  const handleContinue = () => {
    router.push(`/mock-test/${mockTestId}/${nextSection.name.toLowerCase()}`);
  };

  const handleTakeBreak = () => {
    setOnBreak(true);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-green-50 via-white to-blue-50">
      <div className="max-w-2xl w-full">
        {/* Success Animation */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg animate-bounce">
            <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-4">
            Section Complete! 🎉
          </h1>
          <p className="text-gray-600 text-lg">
            Great job on completing the {completedSection.name} section!
          </p>
        </div>

        {/* Completed Section Results */}
        <div className="bg-white rounded-xl border-2 border-green-200 p-8 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <span className="text-5xl">{completedSection.icon}</span>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{completedSection.name}</h2>
                <p className="text-gray-600">Completed</p>
              </div>
            </div>
            {completedSection.bandScore && (
              <div className="text-right">
                <div className="text-4xl font-black text-green-600">
                  {completedSection.bandScore}
                </div>
                <div className="text-sm text-gray-600">Band Score</div>
              </div>
            )}
          </div>

          {completedSection.score !== undefined && (
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <p className="text-gray-700">
                You answered{' '}
                <span className="font-bold text-green-700">
                  {completedSection.score} questions correctly
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Next Section Info */}
        <div className="bg-white rounded-xl border-2 border-blue-200 p-8 mb-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>⏭️</span> Next Section
          </h3>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-4xl">{nextSection.icon}</span>
              <div>
                <h4 className="text-xl font-bold text-gray-900">{nextSection.name}</h4>
                <p className="text-gray-600">{nextSection.duration} minutes</p>
              </div>
            </div>
          </div>
        </div>

        {/* Break Timer (if on break) */}
        {onBreak && (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 mb-6">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-yellow-900 mb-2">Break Time</h3>
              <div className="text-6xl font-black text-yellow-600 mb-2">
                {formatTime(breakTime)}
              </div>
              <p className="text-yellow-800 text-sm">
                Relax for a moment. The next section will start automatically.
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {!onBreak && (
          <>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <button
                onClick={handleTakeBreak}
                className="flex-1 px-8 py-4 border-2 border-gray-300 text-gray-700 hover:bg-gray-100 font-bold rounded-lg transition-colors text-center"
              >
                ☕ Take a 2-Minute Break
              </button>
              
              <button
                onClick={handleContinue}
                className="flex-1 px-8 py-4 bg-primary hover:bg-red-700 text-white font-bold rounded-lg transition-colors text-center"
              >
                Continue to {nextSection.name} →
              </button>
            </div>

            {/* Info Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
              <p className="text-sm text-blue-800">
                💡 <strong>Tip:</strong> Take a short break if you need it. You can continue when you're ready!
              </p>
            </div>
          </>
        )}

        {/* Skip Break Button (during break) */}
        {onBreak && (
          <button
            onClick={handleContinue}
            className="w-full px-8 py-4 bg-primary hover:bg-red-700 text-white font-bold rounded-lg transition-colors text-center"
          >
            Skip Break & Continue →
          </button>
        )}
      </div>
    </div>
  );
}
