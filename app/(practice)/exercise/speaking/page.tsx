'use client'

import React, { useState } from 'react';
import VapiSpeakingSession from '@/components/speaking/VapiSpeakingSession';
import SpeakingTestSession from '@/components/speaking/SpeakingTestSession';

export default function SpeakingPage() {
  const [sessionId] = useState(`session_${Date.now()}`);
  const [useVapi, setUseVapi] = useState(true);
  const [sessionResults, setSessionResults] = useState<any>(null);

  const handleSessionEnd = (results: any) => {
    setSessionResults(results);
    console.log('Session ended with results:', results);
  };

  return (
    <div className="min-h-[70vh] px-6 py-10">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">IELTS Speaking Practice</h1>
        <p className="text-gray-600 mb-6">
          Choose your preferred speaking test mode. VAPI mode provides real-time AI conversation, while Practice mode offers structured questions.
        </p>

        {/* Mode Selection */}
        <div className="mb-6">
          <div className="flex gap-4 mb-4">
            <button
              onClick={() => setUseVapi(true)}
              className={`px-4 py-2 rounded-lg font-medium ${
                useVapi 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              VAPI AI Conversation
            </button>
            <button
              onClick={() => setUseVapi(false)}
              className={`px-4 py-2 rounded-lg font-medium ${
                !useVapi 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Practice Mode
            </button>
          </div>
          
          <div className="text-sm text-gray-600">
            {useVapi ? (
              <p>Real-time conversation with AI examiner using VAPI. The AI will ask questions and guide you through all three parts of the IELTS speaking test.</p>
            ) : (
              <p>Structured practice with predefined questions and timers. Record your responses and get AI-powered feedback.</p>
            )}
          </div>
        </div>

        {/* Session Component */}
        {useVapi ? (
          <VapiSpeakingSession
            sessionId={sessionId}
            onSessionEnd={handleSessionEnd}
          />
        ) : (
          <SpeakingTestSession
            sessionId={sessionId}
            onSessionEnd={handleSessionEnd}
          />
        )}

        {/* Session Results Summary */}
        {sessionResults && (
          <div className="mt-8 p-6 bg-white rounded-xl shadow-lg">
            <h2 className="text-xl font-bold mb-4 text-center">Session Summary</h2>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                Overall Band: {sessionResults.overallBand?.toFixed(1) || 'N/A'}
              </div>
              <p className="text-gray-600">
                {sessionResults.responses?.length || 0} questions evaluated
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}