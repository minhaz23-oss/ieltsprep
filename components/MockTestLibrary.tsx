'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { MockTestWithSession } from '@/types/mockTest';

export default function MockTestLibrary({ userIsPremium }: { userIsPremium: boolean }) {
  const [mockTests, setMockTests] = useState<MockTestWithSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMockTests() {
      try {
        const response = await fetch('/api/mock-tests');
        const data = await response.json();

        if (!data.success) {
          throw new Error(data.message || 'Failed to load mock tests');
        }

        setMockTests(data.data || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchMockTests();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading mock tests...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
        <p className="text-red-600">Error: {error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 btn-primary"
        >
          Retry
        </button>
      </div>
    );
  }

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'completed':
        return <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">Completed</span>;
      case 'in_progress':
        return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">In Progress</span>;
      default:
        return <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">Not Started</span>;
    }
  };

  const getScoreBadge = (session: any) => {
    if (session?.overallBandScore) {
      return (
        <div className="mt-2 flex items-center gap-2">
          <span className="text-2xl font-bold text-primary">{session.overallBandScore}</span>
          <span className="text-sm text-gray-600">Band Score</span>
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">
          IELTS Mock Tests
        </h1>
        <p className="text-gray-600">
          Complete full-length IELTS practice tests simulating real exam conditions
        </p>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-blue-900 mb-2">Full IELTS Exam Simulation</h3>
            <p className="text-sm text-blue-800">
              Each mock test includes all 4 sections (Listening, Reading, Writing, Speaking) with authentic timing. 
              Plan for approximately 3 hours to complete the entire test.
            </p>
          </div>
        </div>
      </div>

      {/* Mock Tests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockTests.map((test) => {
          const isLocked = test.isPremium && !userIsPremium;
          const canResume = test.session?.status === 'in_progress';

          return (
            <div
              key={test.id}
              className={`bg-white rounded-xl shadow-lg border-2 transition-all ${
                isLocked
                  ? 'border-gray-200 opacity-75'
                  : 'border-blue-100 hover:border-blue-300 hover:shadow-xl'
              }`}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">{test.title}</h3>
                    <p className="text-sm text-gray-600">{test.description}</p>
                  </div>
                  {test.isPremium && (
                    <span className="ml-2 px-2 py-1 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-xs font-bold rounded">
                      PRO
                    </span>
                  )}
                </div>

                {/* Status */}
                <div className="mb-4">
                  {getStatusBadge(test.completionStatus)}
                  {getScoreBadge(test.session)}
                </div>

                {/* Sections */}
                <div className="grid grid-cols-2 gap-2 mb-6 text-xs">
                  <div className="flex items-center gap-2 text-gray-600">
                    <span>🎧</span>
                    <span>Listening ({test.sections.listening.duration}m)</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <span>📖</span>
                    <span>Reading ({test.sections.reading.duration}m)</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <span>✍️</span>
                    <span>Writing ({test.sections.writing.duration}m)</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <span>🎤</span>
                    <span>Speaking ({test.sections.speaking.duration}m)</span>
                  </div>
                </div>

                {/* Action Button */}
                {isLocked ? (
                  <Link
                    href="/qualification-exam"
                    className="block w-full text-center py-3 px-4 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white font-semibold rounded-lg transition-all"
                  >
                    🎓 Unlock Premium For Free
                  </Link>
                ) : (
                  <Link
                    href={`/mock-test/${test.id}`}
                    className="block w-full text-center py-3 px-4 bg-primary hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
                  >
                    {canResume ? '▶️ Resume Test' : '🚀 Start Test'}
                  </Link>
                )}

                {/* View Results */}
                {test.completionStatus === 'completed' && (
                  <Link
                    href={`/mock-test/${test.id}/results`}
                    className="block w-full text-center mt-2 py-2 px-4 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-lg transition-colors"
                  >
                    📊 View Results
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {mockTests.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="text-gray-500">No mock tests available at the moment.</p>
        </div>
      )}
    </div>
  );
}
