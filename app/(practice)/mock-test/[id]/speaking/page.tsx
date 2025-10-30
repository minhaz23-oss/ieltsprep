'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';

export default function MockTestSpeakingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: mockTestId } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [speakingTestId, setSpeakingTestId] = useState<string | null>(null);

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

      if (session.sectionResults?.speaking) {
        router.push(`/mock-test/${mockTestId}/results`);
        return;
      }

      if (session.currentSection !== 'speaking') {
        router.push(`/mock-test/${mockTestId}/${session.currentSection}`);
        return;
      }

      setSessionId(session.id);
      setSpeakingTestId(mockTest.sections.speaking.vapiAssistantId || 'vapi-assistant');
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
          section: 'speaking',
          results: {
            testId: speakingTestId,
            bandScore: results.bandScore,
            evaluation: {
              vapiCallId: results.vapiCallId,
              transcript: results.transcript
            }
          }
        }),
      });

      const data = await response.json();
      if (!data.success) throw new Error(data.message);

      router.push(`/mock-test/${mockTestId}/results`);

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
          <p className="text-gray-600 font-semibold">Loading speaking test...</p>
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

  return (
    <div className="min-h-screen px-4 py-8 bg-gradient-to-br from-pink-50 via-white to-orange-50">
      <div className="max-w-6xl mx-auto">
        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 mb-6">
          <h2 className="text-xl font-bold text-yellow-900 mb-2">
            🎤 Speaking Section - Integration Pending
          </h2>
          <p className="text-yellow-800 mb-4">VAPI Assistant ID: {speakingTestId}</p>
          <p className="text-yellow-800 mb-4">Session ID: {sessionId}</p>
          <button
            onClick={() => handleTestComplete({
              vapiCallId: 'mock-call-id-' + Date.now(),
              bandScore: 8.0,
              transcript: 'Sample speaking transcript...'
            })}
            className="btn-primary"
          >
            Simulate Test Completion (Band Score: 8.0)
          </button>
        </div>
      </div>
    </div>
  );
}
