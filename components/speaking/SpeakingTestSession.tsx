'use client'

import React, { useState, useEffect, useRef } from 'react';
import VoiceRecorder from './VoiceRecorder';
import { evaluateSpeakingTest } from '@/lib/actions/speaking.actions'; // Import the server action
import { getBandColor } from '@/lib/utils/ielts-scoring'; // Import scoring utils

// Props for the component
interface SpeakingTestSessionProps {
  sessionId: string;
  callId?: string;
  fallbackMode?: boolean;
  onSessionEnd: (results: any) => void;
}

// Structure for a single question
interface CurrentQuestion {
  id: string;
  question: string;
  part: 1 | 2 | 3;
  responseTime: number;
  preparationTime?: number;
  cueCard?: { points: string[] };
}

// Structure for a single response
interface Response {
  questionId: string;
  question: string;
  part: 1 | 2 | 3;
  audioBlob: Blob;
  duration: number;
  timestamp: Date;
  transcript: string; // Added to store transcript
}

// Mock questions for fallback mode
const MOCK_QUESTIONS: CurrentQuestion[] = [
  { id: 'p1_1', part: 1, question: "Let's talk about your hometown. Where is it located?", responseTime: 30 },
  { id: 'p1_2', part: 1, question: "What is the most interesting part of your hometown?", responseTime: 30 },
  { id: 'p2_1', part: 2, question: "Describe a memorable journey you have taken.", responseTime: 120, preparationTime: 60, cueCard: { points: ['Where you went', 'Who you went with', 'What you did', 'And explain why it was so memorable'] } },
  { id: 'p3_1', part: 3, question: "Why do you think people travel?", responseTime: 45 },
  { id: 'p3_2', part: 3, question: "What are the benefits of traveling to different places?", responseTime: 45 },
];

const SpeakingTestSession: React.FC<SpeakingTestSessionProps> = ({
  sessionId,
  fallbackMode = true, // Defaulting to true for easy testing
  onSessionEnd
}) => {
  // State management
  const [isConnected, setIsConnected] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState<CurrentQuestion | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isPreparationTime, setIsPreparationTime] = useState(false);
  const [responses, setResponses] = useState<Response[]>([]);
  const [isTestFinished, setIsTestFinished] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    initializeFallbackMode();
    return () => cleanup();
  }, []);

  useEffect(() => {
    if (isTestFinished || currentQuestionIndex >= MOCK_QUESTIONS.length) {
      handleTestFinish();
    } else {
      const question = MOCK_QUESTIONS[currentQuestionIndex];
      setCurrentQuestion(question);
      if (question.preparationTime) {
        startPreparationTimer(question.preparationTime);
      } else {
        startResponseTimer(question.responseTime);
      }
    }
  }, [currentQuestionIndex]);

  const initializeFallbackMode = () => {
    setIsConnected(true);
    setCurrentQuestionIndex(0);
  };

  const cleanup = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const startPreparationTimer = (seconds: number) => {
    cleanup();
    setTimeRemaining(seconds);
    setIsPreparationTime(true);
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          cleanup();
          startResponseTimer(currentQuestion?.responseTime || 120);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startResponseTimer = (seconds: number) => {
    cleanup();
    setTimeRemaining(seconds);
    setIsPreparationTime(false);
    timerRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          cleanup();
          // Automatically move to next question when time is up
          handleNextQuestion();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleManualRecordingComplete = (audioBlob: Blob, duration: number) => {
    if (!currentQuestion) return;

    const response: Response = {
      questionId: currentQuestion.id,
      question: currentQuestion.question,
      part: currentQuestion.part,
      audioBlob,
      duration,
      timestamp: new Date(),
      // In a real scenario, this would come from a speech-to-text API.
      transcript: `(User audio recorded for ${duration.toFixed(1)}s) This is a placeholder transcript for the question about ${currentQuestion.question.toLowerCase().substring(0, 20)}...`
    };
    setResponses(prev => [...prev, response]);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < MOCK_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleTestFinish();
    }
  };

  const handleTestFinish = () => {
    cleanup();
    setIsTestFinished(true);
    setCurrentQuestion(null);
  };

  const handleSeeResult = async () => {
    setIsEvaluating(true);
    setError(null);

    // We need to upload the audio blobs to a server and get URLs,
    // but for now, we'll proceed with placeholder transcripts.
    const evaluationData = responses.map(r => ({
      question: r.question,
      transcript: r.transcript,
      // audioUrl: await uploadAudio(r.audioBlob) // Example of future implementation
    }));

    const result = await evaluateSpeakingTest(evaluationData);

    if (result.success) {
      setEvaluationResult(result.data);
      onSessionEnd(result.data); // Callback for parent component
    } else {
      setError(result.message || "Failed to evaluate the test. Please try again.");
    }
    setIsEvaluating(false);
  };

  const formatTime = (seconds: number) => `${Math.floor(seconds / 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`;
  const getPartTitle = (part: number) => {
    if (isTestFinished) return "Test Completed";
    switch (part) {
      case 1: return 'Part 1: Introduction & Interview';
      case 2: return 'Part 2: Individual Long Turn';
      case 3: return 'Part 3: Two-way Discussion';
      default: return 'Speaking Test';
    }
  };

  // Render states: Error, Loading, Test Finished, Evaluation Result, Active Test
  if (error) return <div className="text-center p-8"><h2 className="text-red-500">{error}</h2></div>;
  if (!isConnected) return <div className="text-center p-8"><h2>Preparing your test...</h2></div>;

  if (isTestFinished) {
    return (
      <div className="max-w-4xl mx-auto p-6 text-center">
        <h1 className="text-3xl font-bold mb-4">Test Completed!</h1>
        <p className="mb-6">You have answered {responses.length} questions.</p>
        {!evaluationResult && (
          <button onClick={handleSeeResult} disabled={isEvaluating} className="btn-primary btn-lg">
            {isEvaluating ? 'Evaluating...' : 'See Your Results'}
          </button>
        )}
        {evaluationResult && (
          <div className="bg-white rounded-xl shadow-lg p-8 text-left">
            <h2 className="text-2xl font-bold mb-6 text-center">Your Speaking Evaluation</h2>
            <div className={`text-center mb-8 p-4 rounded-lg ${getBandColor(evaluationResult.overallBand)}`}>
              <p className="text-lg">Overall Band Score</p>
              <p className="text-5xl font-bold">{evaluationResult.overallBand.toFixed(1)}</p>
            </div>
            {evaluationResult.results.map((res: any, index: number) => (
              <div key={index} className="mb-6 pb-6 border-b last:border-b-0">
                <p className="font-semibold text-gray-800">Q: {res.question}</p>
                <div className={`font-bold my-2 ${getBandColor(res.overallBand)} p-2 rounded-md inline-block`}>Band: {res.overallBand.toFixed(1)}</div>
                <div className="space-y-2 text-sm text-gray-700">
                  <p><strong>Fluency:</strong> {res.feedback.fluency}</p>
                  <p><strong>Vocabulary:</strong> {res.feedback.lexicalResource}</p>
                  <p><strong>Grammar:</strong> {res.feedback.grammar}</p>
                  <p><strong>Pronunciation:</strong> {res.feedback.pronunciation}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">IELTS Speaking Test</h1>
              <p className="text-gray-600 mt-1">{getPartTitle(currentQuestion?.part || 1)}</p>
            </div>
            <div className="text-right">
              <div className={`text-3xl font-mono font-bold ${isPreparationTime ? 'text-yellow-600' : 'text-primary'}`}>
                {formatTime(timeRemaining)}
              </div>
              <p className="text-sm text-gray-600">{isPreparationTime ? 'Preparation Time' : 'Response Time'}</p>
            </div>
          </div>
        </div>

        {currentQuestion && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">{currentQuestion.question}</h3>
            {currentQuestion.cueCard && (
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4 mb-4">
                <ul className="text-yellow-700 space-y-1">
                  {currentQuestion.cueCard.points.map((point, index) => <li key={index}>{point}</li>)}
                </ul>
              </div>
            )}
          </div>
        )}

        {fallbackMode && !isPreparationTime && currentQuestion && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <VoiceRecorder 
              onRecordingComplete={handleManualRecordingComplete}
              maxDuration={currentQuestion.responseTime}
              disabled={isPreparationTime}
            />
          </div>
        )}

        <div className="mt-6 flex justify-between items-center">
            <p className="text-sm text-gray-600">Question {currentQuestionIndex + 1} of {MOCK_QUESTIONS.length}</p>
            <div>
                <button onClick={handleNextQuestion} className="btn-secondary mr-2">Skip Question</button>
                <button onClick={handleTestFinish} className="btn-danger">Finish Test</button>
            </div>
        </div>

      </div>
    </div>
  );
};

export default SpeakingTestSession;
