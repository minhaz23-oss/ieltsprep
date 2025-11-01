'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import SectionTransition from '@/components/SectionTransition';
import WritingTestComponent from '@/components/writing/WritingTestComponent';

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
      if (!data.success) throw new Error(data.message || 'Failed to save results');

      // Successfully saved - show transition
      setSectionResults({
        bandScore: data.data.bandScore
      });
      setShowTransition(true);

    } catch (err) {
      console.error('Error saving section results:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to save your results';
      alert(`${errorMessage}. Your results may not be saved, but you can continue to the next section.`);
      
      // Even on error, show transition with the results we have
      // This prevents users from getting stuck
      setSectionResults({
        bandScore: results.bandScore
      });
      setShowTransition(true);
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

  if (!writingTestId) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-600 font-semibold">Writing test ID not found</p>
        </div>
      </div>
    );
  }

  return (
    <WritingTestComponent
      testId={writingTestId}
      mode="mockTest"
      onComplete={handleTestComplete}
      backLink={`/mock-test/${mockTestId}`}
    />
  );
}
