'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import SectionTransition from '@/components/SectionTransition';

export default function MockTestWritingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: mockTestId } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [writingTestId, setWritingTestId] = useState<string | null>(null);
  const [showTransition, setShowTransition] = useState(false);
  const [sectionResults, setSectionResults] = useState<any>(null);

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

      if (session.sectionResults?.writing) {
        setSectionResults(session.sectionResults.writing);
        setShowTransition(true);
        return;
      }

      if (session.currentSection !== 'writing') {
        router.push(`/mock-test/${mockTestId}/${session.currentSection}`);
        return;
      }

      setSessionId(session.id);
      setWritingTestId(mockTest.sections.writing.testId);
      setLoading(false);

    } catch (err) {
      console.error('Error loading mock test session:', err);
      setError(err instanceof Error ? err.message : 'Failed to load test');
      setLoading(false);
    }
  };

  const handleTestComplete = async (results: any) => {
    if (!sessionId) return;

    try {
      const response = await fetch('/api/mock-tests/save-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          section: 'writing',
          results: {
            testId: writingTestId,
            bandScore: results.bandScore,
            evaluation: {
              task1Response: results.task1Response,
              task2Response: results.task2Response,
              task1Score: results.task1Score,
              task2Score: results.task2Score
            }
          }
        }),
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.message);

      setSectionResults({
        bandScore: data.data.bandScore
      });
      setShowTransition(true);

    } catch (err) {
      console.error('Error saving section results:', err);
      alert('Failed to save your results. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading writing test...</p>
        </div>
      </div>
    );
  }

  if (error) {
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

  if (showTransition) {
    return (
      <SectionTransition
        mockTestId={mockTestId}
        completedSection={{
          name: 'Writing',
          icon: '✍️',
          bandScore: sectionResults?.bandScore
        }}
        nextSection={{
          name: 'Speaking',
          icon: '🎤',
          duration: 15
        }}
      />
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 bg-gradient-to-br from-purple-50 via-white to-pink-50">
      <div className="max-w-6xl mx-auto">
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold text-yellow-900 mb-2">
            ✍️ Writing Section - Integration Pending
          </h2>
          <p className="text-yellow-800 mb-4">Test ID: {writingTestId}</p>
          <p className="text-yellow-800 mb-4">Session ID: {sessionId}</p>
          <button
            onClick={() => handleTestComplete({
              task1Response: 'Sample Task 1 response...',
              task2Response: 'Sample Task 2 response...',
              task1Score: 7.0,
              task2Score: 8.0,
              bandScore: 7.5
            })}
            className="btn-primary"
          >
            Simulate Test Completion (Band Score: 7.5)
          </button>
        </div>
      </div>
    </div>
  );
}
