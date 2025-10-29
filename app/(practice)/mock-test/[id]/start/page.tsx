'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function MockTestStartPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [checklist, setChecklist] = useState({
    quietEnvironment: false,
    headphonesReady: false,
    microphoneWorking: false,
    stableInternet: false,
    timeAvailable: false,
    noInterruptions: false
  });

  const allChecked = Object.values(checklist).every(val => val);

  const handleCheckboxChange = (key: keyof typeof checklist) => {
    setChecklist(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleStartTest = async () => {
    if (!allChecked) {
      setError('Please confirm all items before starting the test.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Call API to create session
      const response = await fetch('/api/mock-tests/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ mockTestId: id }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to start mock test');
      }

      // Redirect to listening section (first section)
      router.push(`/mock-test/${id}/listening`);
    } catch (err) {
      console.error('Error starting mock test:', err);
      setError(err instanceof Error ? err.message : 'Failed to start test. Please try again.');
      setLoading(false);
    }
  };

  const checklistItems = [
    {
      key: 'quietEnvironment' as const,
      icon: '🤫',
      title: 'Quiet Environment',
      description: 'I am in a quiet place with minimal background noise and distractions'
    },
    {
      key: 'headphonesReady' as const,
      icon: '🎧',
      title: 'Headphones Ready',
      description: 'I have working headphones or speakers for the listening section'
    },
    {
      key: 'microphoneWorking' as const,
      icon: '🎤',
      title: 'Microphone Working',
      description: 'My microphone is working properly for the speaking section'
    },
    {
      key: 'stableInternet' as const,
      icon: '🌐',
      title: 'Stable Internet Connection',
      description: 'I have a reliable internet connection that won\'t disconnect during the test'
    },
    {
      key: 'timeAvailable' as const,
      icon: '⏰',
      title: '3 Hours Available',
      description: 'I have approximately 3 hours to complete all sections without rushing'
    },
    {
      key: 'noInterruptions' as const,
      icon: '🔕',
      title: 'No Interruptions',
      description: 'I have informed others not to disturb me during this time'
    }
  ];

  return (
    <div className="min-h-screen px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-24 py-8 sm:py-12 md:py-16 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Back Button */}
      <div className="mb-8">
        <Link 
          href={`/mock-test/${id}`}
          className="text-primary hover:text-red-700 flex items-center space-x-2 transition-colors"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm sm:text-base font-semibold">Back to Test Overview</span>
        </Link>
      </div>

      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <span className="text-4xl">📋</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
            Ready to Start?
          </h1>
          <p className="text-gray-600 text-lg">
            Please confirm the following before beginning your mock test
          </p>
        </div>

        {/* Important Notice */}
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="text-2xl">⚠️</div>
            <div>
              <h3 className="font-bold text-yellow-900 mb-2">Important</h3>
              <p className="text-yellow-800 text-sm">
                Once you start the test, the timer will begin immediately. Make sure you have 
                everything ready and won't be interrupted for the next 3 hours.
              </p>
            </div>
          </div>
        </div>

        {/* Checklist */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-6 sm:p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Pre-Test Checklist</h2>
          
          <div className="space-y-4">
            {checklistItems.map((item) => (
              <label
                key={item.key}
                className={`flex items-start gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  checklist[item.key]
                    ? 'bg-green-50 border-green-300'
                    : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={checklist[item.key]}
                  onChange={() => handleCheckboxChange(item.key)}
                  className="mt-1 w-5 h-5 text-primary focus:ring-primary cursor-pointer"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{item.icon}</span>
                    <h3 className="font-bold text-gray-900">{item.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 mb-6">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href={`/mock-test/${id}`}
            className="flex-1 px-8 py-4 border-2 border-gray-300 text-gray-700 hover:bg-gray-100 font-bold rounded-lg transition-colors text-center"
          >
            ← Go Back
          </Link>
          
          <button
            onClick={handleStartTest}
            disabled={!allChecked || loading}
            className={`flex-1 px-8 py-4 font-bold rounded-lg transition-all text-center ${
              allChecked && !loading
                ? 'bg-primary hover:bg-red-700 text-white cursor-pointer'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Starting Test...
              </span>
            ) : (
              '🚀 Start Mock Test →'
            )}
          </button>
        </div>

        {/* Test Structure Reminder */}
        <div className="mt-8 bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <h3 className="font-bold text-blue-900 mb-3 text-center">Test Structure</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center text-sm">
            <div>
              <div className="text-2xl mb-1">🎧</div>
              <div className="font-semibold text-blue-900">Listening</div>
              <div className="text-blue-700">30 min</div>
            </div>
            <div>
              <div className="text-2xl mb-1">📖</div>
              <div className="font-semibold text-blue-900">Reading</div>
              <div className="text-blue-700">60 min</div>
            </div>
            <div>
              <div className="text-2xl mb-1">✍️</div>
              <div className="font-semibold text-blue-900">Writing</div>
              <div className="text-blue-700">60 min</div>
            </div>
            <div>
              <div className="text-2xl mb-1">🎤</div>
              <div className="font-semibold text-blue-900">Speaking</div>
              <div className="text-blue-700">15 min</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
