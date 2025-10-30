'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';

interface SectionResult {
  bandScore: number;
  score?: number;
  totalQuestions?: number;
}

interface MockTestResults {
  mockTest: {
    id: string;
    name: string;
  };
  session: {
    id: string;
    status: string;
    overallBandScore: number;
    sectionResults: {
      listening?: SectionResult;
      reading?: SectionResult;
      writing?: SectionResult;
      speaking?: SectionResult;
    };
    completedAt: any;
  };
}

export default function MockTestResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: mockTestId } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<MockTestResults | null>(null);

  useEffect(() => {
    loadResults();
  }, [mockTestId]);

  const loadResults = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/mock-tests/${mockTestId}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to load results');
      }

      const { mockTest, session } = data.data;

      if (!session || session.status !== 'completed') {
        router.push(`/mock-test/${mockTestId}`);
        return;
      }

      setResults({ mockTest, session });
      setLoading(false);

    } catch (err) {
      console.error('Error loading results:', err);
      setError(err instanceof Error ? err.message : 'Failed to load results');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading results...</p>
        </div>
      </div>
    );
  }

  if (error || !results) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-red-50 border-2 border-red-200 rounded-xl p-8 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-900 mb-2">Error</h2>
          <p className="text-red-800 mb-6">{error || 'Failed to load results'}</p>
          <button onClick={() => router.push('/mock-tests')} className="btn-primary">
            Back to Mock Tests
          </button>
        </div>
      </div>
    );
  }

  const { mockTest, session } = results;

  return (
    <div className="min-h-screen px-4 py-8 bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Test Completed!
          </h1>
          <p className="text-xl text-gray-600">{mockTest.name}</p>
        </div>

        {/* Overall Band Score */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-6 text-center border-4 border-primary">
          <p className="text-gray-600 font-semibold mb-2">Overall Band Score</p>
          <div className="text-7xl font-bold text-primary mb-2">
            {session.overallBandScore.toFixed(1)}
          </div>
          <p className="text-gray-500">
            {session.overallBandScore >= 8.0 ? 'Excellent!' :
             session.overallBandScore >= 7.0 ? 'Very Good!' :
             session.overallBandScore >= 6.0 ? 'Good!' :
             session.overallBandScore >= 5.0 ? 'Competent' : 'Keep Practicing!'}
          </p>
        </div>

        {/* Section Breakdown */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Section Breakdown</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Listening */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🎧</span>
                  <h3 className="text-lg font-bold text-gray-900">Listening</h3>
                </div>
                <div className="text-3xl font-bold text-blue-600">
                  {session.sectionResults.listening?.bandScore.toFixed(1) || 'N/A'}
                </div>
              </div>
              {session.sectionResults.listening?.score !== undefined && (
                <p className="text-sm text-gray-600">
                  Score: {session.sectionResults.listening.score}/{session.sectionResults.listening.totalQuestions}
                </p>
              )}
            </div>

            {/* Reading */}
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">📖</span>
                  <h3 className="text-lg font-bold text-gray-900">Reading</h3>
                </div>
                <div className="text-3xl font-bold text-green-600">
                  {session.sectionResults.reading?.bandScore.toFixed(1) || 'N/A'}
                </div>
              </div>
              {session.sectionResults.reading?.score !== undefined && (
                <p className="text-sm text-gray-600">
                  Score: {session.sectionResults.reading.score}/{session.sectionResults.reading.totalQuestions}
                </p>
              )}
            </div>

            {/* Writing */}
            <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">✍️</span>
                  <h3 className="text-lg font-bold text-gray-900">Writing</h3>
                </div>
                <div className="text-3xl font-bold text-purple-600">
                  {session.sectionResults.writing?.bandScore.toFixed(1) || 'N/A'}
                </div>
              </div>
              <p className="text-sm text-gray-600">AI Evaluated</p>
            </div>

            {/* Speaking */}
            <div className="bg-pink-50 border-2 border-pink-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🎤</span>
                  <h3 className="text-lg font-bold text-gray-900">Speaking</h3>
                </div>
                <div className="text-3xl font-bold text-pink-600">
                  {session.sectionResults.speaking?.bandScore.toFixed(1) || 'N/A'}
                </div>
              </div>
              <p className="text-sm text-gray-600">AI Evaluated</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.push(`/mock-test/${mockTestId}`)}
            className="btn-secondary"
          >
            View Test Details
          </button>
          <button
            onClick={() => router.push('/mock-tests')}
            className="btn-primary"
          >
            Back to Mock Tests
          </button>
        </div>

        {/* Completion Info */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>Completed on {new Date(session.completedAt?.toDate?.() || session.completedAt).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  );
}
