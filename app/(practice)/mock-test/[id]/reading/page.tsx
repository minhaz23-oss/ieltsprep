'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import SectionTransition from '@/components/SectionTransition';
import ReadingTestComponent from '@/components/reading/ReadingTestComponent';

export default function MockTestReadingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: mockTestId } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [readingTestId, setReadingTestId] = useState<string | null>(null);
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

      if (session.sectionResults?.reading) {
        setSectionResults(session.sectionResults.reading);
        setShowTransition(true);
        return;
      }

      if (session.currentSection !== 'reading') {
        router.push(`/mock-test/${mockTestId}/${session.currentSection}`);
        return;
      }

      setSessionId(session.id);
      setReadingTestId(mockTest.sections.reading.testId);
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
          section: 'reading',
          results: {
            testId: readingTestId,
            score: results.score,
            totalQuestions: results.totalQuestions,
            answers: results.answers,
            bandScore: results.bandScore
          }
        }),
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.message);

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
          <p className="text-gray-600 font-semibold">Loading reading test...</p>
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
          name: 'Reading',
          icon: '📖',
          score: sectionResults?.score,
          bandScore: sectionResults?.bandScore
        }}
        nextSection={{
          name: 'Writing',
          icon: '✍️',
          duration: 60
        }}
      />
    );
  }

  return (
    <ReadingTestComponent
      testId={readingTestId!}
      mode="mockTest"
      onComplete={handleTestComplete}
      backLink={`/mock-test/${mockTestId}`}
    />
  );
}
