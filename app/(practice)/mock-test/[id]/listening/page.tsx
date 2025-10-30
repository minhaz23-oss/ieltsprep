'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import SectionTransition from '@/components/SectionTransition';
import ListeningTestComponent from '@/components/listening/ListeningTestComponent';

export default function MockTestListeningPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: mockTestId } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [listeningTestId, setListeningTestId] = useState<string | null>(null);
  const [showTransition, setShowTransition] = useState(false);
  const [sectionResults, setSectionResults] = useState<any>(null);

  useEffect(() => {
    loadMockTestSession();
  }, [mockTestId]);

  const loadMockTestSession = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch mock test and session data
      const response = await fetch(`/api/mock-tests/${mockTestId}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to load mock test');
      }

      const { mockTest, session } = data.data;

      if (!session) {
        // No session exists - redirect to start page
        router.push(`/mock-test/${mockTestId}/start`);
        return;
      }

      // Check if this section is already completed
      if (session.sectionResults?.listening) {
        // Already completed - show transition or redirect
        setSectionResults(session.sectionResults.listening);
        setShowTransition(true);
        return;
      }

      // Verify user is on correct section
      if (session.currentSection !== 'listening') {
        // User is on wrong section - redirect to correct one
        router.push(`/mock-test/${mockTestId}/${session.currentSection}`);
        return;
      }

      // Set session and test IDs
      setSessionId(session.id);
      setListeningTestId(mockTest.sections.listening.testId);
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
      return;
    }

    try {
      // Save results to mock test session
      const response = await fetch('/api/mock-tests/save-section', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          section: 'listening',
          results: {
            testId: listeningTestId,
            score: results.score,
            totalQuestions: results.totalQuestions,
            answers: results.answers,
            bandScore: results.bandScore
          }
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || 'Failed to save results');
      }

      // Show transition to next section
      setSectionResults({
        score: results.score,
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
          <p className="text-gray-600 font-semibold">Loading listening test...</p>
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
          <button
            onClick={() => router.push(`/mock-test/${mockTestId}`)}
            className="btn-primary"
          >
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
          name: 'Listening',
          icon: '🎧',
          score: sectionResults?.score,
          bandScore: sectionResults?.bandScore
        }}
        nextSection={{
          name: 'Reading',
          icon: '📖',
          duration: 60
        }}
      />
    );
  }

  // Render the actual listening test component
  return (
    <ListeningTestComponent
      testId={listeningTestId!}
      mode="mockTest"
      onComplete={handleTestComplete}
      backLink={`/mock-test/${mockTestId}`}
    />
  );
}
