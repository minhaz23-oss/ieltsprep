'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface SectionResult {
  bandScore: number;
  score?: number;
  totalQuestions?: number;
  testId?: string;
  answers?: any;
  evaluation?: any;
}

interface MockTestResults {
  mockTest: {
    id: string;
    title: string;
    sections: any;
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
  const [activeTab, setActiveTab] = useState<'overview' | 'listening' | 'reading' | 'writing' | 'speaking'>('overview');
  const [listeningDetails, setListeningDetails] = useState<any>(null);
  const [readingDetails, setReadingDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

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
      
      // Load test details for explanations
      if (session.sectionResults.listening?.testId) {
        loadListeningDetails(session.sectionResults.listening.testId, session.sectionResults.listening.answers);
      }
      if (session.sectionResults.reading?.testId) {
        loadReadingDetails(session.sectionResults.reading.testId, session.sectionResults.reading.answers);
      }
      
      setLoading(false);

    } catch (err) {
      console.error('Error loading results:', err);
      setError(err instanceof Error ? err.message : 'Failed to load results');
      setLoading(false);
    }
  };

  const loadListeningDetails = async (testId: string, userAnswers: any) => {
    try {
      const { getListeningTest } = await import('@/lib/actions/listening-tests.actions');
      const result = await getListeningTest(testId);
      if (result.success && result.data) {
        setListeningDetails({ test: result.data, userAnswers });
      }
    } catch (err) {
      console.error('Error loading listening details:', err);
    }
  };

  const loadReadingDetails = async (testId: string, userAnswers: any) => {
    try {
      const response = await fetch(`/api/reading-tests/${testId}`);
      const data = await response.json();
      if (data.test) {
        setReadingDetails({ test: data.test, userAnswers });
      }
    } catch (err) {
      console.error('Error loading reading details:', err);
    }
  };

  const isAnswerCorrect = (userAnswer: string, correctAnswer: string): boolean => {
    const userAnswerClean = (userAnswer || '').toLowerCase().trim();
    const acceptableAnswers = correctAnswer.toLowerCase().split('/').map(a => a.trim());
    return acceptableAnswers.some(acceptable => userAnswerClean === acceptable);
  };

  const renderListeningAnalysis = () => {
    if (!listeningDetails) {
      return <div className="text-center py-8 text-gray-500"><p>Click on "Listening" tab to load detailed analysis...</p></div>;
    }

    const { test, userAnswers } = listeningDetails;
    const questions: any[] = [];

    test.sections?.forEach((section: any) => {
      section.questionGroups?.forEach((group: any) => {
        if (group.content.questions) questions.push(...group.content.questions);
        if (group.content.items) questions.push(...group.content.items);
        if (group.content.fields) {
          const extractFromFields = (fields: any[]) => {
            fields.forEach(field => {
              if (field.questionNumber && field.correctAnswer) questions.push(field);
              if (field.listItems) extractFromFields(field.listItems);
            });
          };
          extractFromFields(group.content.fields);
        }
      });
    });

    return (
      <div className="space-y-4">
        <h3 className="text-2xl font-bold mb-4">Listening Analysis</h3>
        <p className="text-gray-600 mb-4">Score: {results?.session.sectionResults.listening?.score}/{results?.session.sectionResults.listening?.totalQuestions}</p>
        {questions.map((q, index) => {
          const userAnswer = userAnswers[q.questionNumber];
          const isCorrect = isAnswerCorrect(userAnswer, q.correctAnswer);
          return (
            <div key={index} className={`border-2 rounded-lg p-4 ${isCorrect ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
              <div className="flex justify-between mb-2">
                <h4 className="font-bold">Q{q.questionNumber}</h4>
                <span className={`px-3 py-1 rounded-full font-bold text-sm ${isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                  {isCorrect ? '✓' : '✗'}
                </span>
              </div>
              {(q.question || q.label) && <p className="text-gray-700 mb-2">{q.question || q.label}</p>}
              <div className="flex gap-4 mt-2">
                <div><p className="text-sm text-gray-600">Your Answer:</p><p className="font-medium">{userAnswer || '(Not answered)'}</p></div>
                {!isCorrect && <div><p className="text-sm text-gray-600">Correct:</p><p className="font-medium text-green-700">{q.correctAnswer}</p></div>}
              </div>
              {!isCorrect && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-sm"><strong>💡 Tip:</strong> {q.explanation || 'Listen carefully for keywords and pay attention to spelling.'}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderReadingAnalysis = () => {
    if (!readingDetails) {
      return <div className="text-center py-8 text-gray-500"><p>Click on "Reading" tab to load detailed analysis...</p></div>;
    }

    const { test, userAnswers } = readingDetails;
    const questions: any[] = [];
    test.passages?.forEach((passage: any) => {
      passage.questionSections?.forEach((section: any) => {
        questions.push(...section.questions);
      });
    });

    return (
      <div className="space-y-4">
        <h3 className="text-2xl font-bold mb-4">Reading Analysis</h3>
        <p className="text-gray-600 mb-4">Score: {results?.session.sectionResults.reading?.score}/{results?.session.sectionResults.reading?.totalQuestions}</p>
        {questions.map((q, index) => {
          const userAnswer = Array.isArray(userAnswers[q.questionNumber]) ? userAnswers[q.questionNumber].join(', ') : userAnswers[q.questionNumber];
          const correctAnswer = Array.isArray(q.correctAnswer) ? q.correctAnswer.join(', ') : q.correctAnswer;
          const isCorrect = isAnswerCorrect(String(userAnswer), String(correctAnswer));
          return (
            <div key={index} className={`border-2 rounded-lg p-4 ${isCorrect ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
              <div className="flex justify-between mb-2">
                <h4 className="font-bold">Q{q.questionNumber}</h4>
                <span className={`px-3 py-1 rounded-full font-bold text-sm ${isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                  {isCorrect ? '✓' : '✗'}
                </span>
              </div>
              {(q.question || q.statement) && <p className="text-gray-700 mb-2">{q.question || q.statement}</p>}
              <div className="flex gap-4 mt-2">
                <div><p className="text-sm text-gray-600">Your Answer:</p><p className="font-medium">{userAnswer || '(Not answered)'}</p></div>
                {!isCorrect && <div><p className="text-sm text-gray-600">Correct:</p><p className="font-medium text-green-700">{correctAnswer}</p></div>}
              </div>
              {!isCorrect && (
                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-sm"><strong>💡 Tip:</strong> {q.explanation || 'Look for paraphrased information and synonyms in the passage.'}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderWritingAnalysis = () => {
    const evaluation = results?.session.sectionResults.writing?.evaluation;
    if (!evaluation) return <div className="text-center py-8 text-gray-500"><p>No writing evaluation available.</p></div>;

    return (
      <div className="space-y-6">
        <h3 className="text-2xl font-bold mb-4">Writing Analysis</h3>
        {evaluation.task1Response && (
          <div className="border-2 border-purple-200 rounded-lg p-6 bg-purple-50">
            <h4 className="text-xl font-bold mb-4">Task 1</h4>
            <div className="bg-white p-4 rounded mb-4 max-h-60 overflow-y-auto">
              <p className="whitespace-pre-wrap">{evaluation.task1Response}</p>
            </div>
            {evaluation.task1Score && (
              <div className="text-center p-4 bg-white rounded">
                <div className="text-4xl font-bold text-purple-600">{evaluation.task1Score}</div>
                <div className="text-sm text-gray-600">Band Score</div>
              </div>
            )}
          </div>
        )}
        {evaluation.task2Response && (
          <div className="border-2 border-purple-200 rounded-lg p-6 bg-purple-50">
            <h4 className="text-xl font-bold mb-4">Task 2</h4>
            <div className="bg-white p-4 rounded mb-4 max-h-60 overflow-y-auto">
              <p className="whitespace-pre-wrap">{evaluation.task2Response}</p>
            </div>
            {evaluation.task2Score && (
              <div className="text-center p-4 bg-white rounded">
                <div className="text-4xl font-bold text-purple-600">{evaluation.task2Score}</div>
                <div className="text-sm text-gray-600">Band Score</div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderSpeakingAnalysis = () => {
    const evaluation = results?.session.sectionResults.speaking?.evaluation;
    if (!evaluation) return <div className="text-center py-8 text-gray-500"><p>No speaking evaluation available.</p></div>;

    return (
      <div className="space-y-6">
        <h3 className="text-2xl font-bold mb-4">Speaking Analysis</h3>
        {evaluation.criteria && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-pink-50 border-2 border-pink-200 rounded-lg">
              <div className="text-3xl font-bold text-pink-600">{evaluation.criteria.fluencyCoherence || 'N/A'}</div>
              <div className="text-xs text-gray-600 mt-1">Fluency</div>
            </div>
            <div className="text-center p-4 bg-pink-50 border-2 border-pink-200 rounded-lg">
              <div className="text-3xl font-bold text-pink-600">{evaluation.criteria.lexicalResource || 'N/A'}</div>
              <div className="text-xs text-gray-600 mt-1">Vocabulary</div>
            </div>
            <div className="text-center p-4 bg-pink-50 border-2 border-pink-200 rounded-lg">
              <div className="text-3xl font-bold text-pink-600">{evaluation.criteria.grammaticalRange || 'N/A'}</div>
              <div className="text-xs text-gray-600 mt-1">Grammar</div>
            </div>
            <div className="text-center p-4 bg-pink-50 border-2 border-pink-200 rounded-lg">
              <div className="text-3xl font-bold text-pink-600">{evaluation.criteria.pronunciation || 'N/A'}</div>
              <div className="text-xs text-gray-600 mt-1">Pronunciation</div>
            </div>
          </div>
        )}
        {evaluation.strengths && evaluation.strengths.length > 0 && (
          <div className="border-2 border-green-200 rounded-lg p-6 bg-green-50">
            <h4 className="text-xl font-bold mb-3">✅ Strengths</h4>
            <ul className="space-y-2">
              {evaluation.strengths.map((s: string, i: number) => <li key={i} className="flex gap-2"><span>•</span><span>{s}</span></li>)}
            </ul>
          </div>
        )}
        {evaluation.improvements && evaluation.improvements.length > 0 && (
          <div className="border-2 border-orange-200 rounded-lg p-6 bg-orange-50">
            <h4 className="text-xl font-bold mb-3">📈 Improvements</h4>
            <ul className="space-y-2">
              {evaluation.improvements.map((i: string, idx: number) => <li key={idx} className="flex gap-2"><span>•</span><span>{i}</span></li>)}
            </ul>
          </div>
        )}
      </div>
    );
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

        {/* Tabbed Results */}
        <div className="bg-white rounded-2xl shadow-lg mb-6 overflow-hidden">
          <div className="flex flex-wrap border-b border-gray-200">
            <button onClick={() => setActiveTab('overview')} className={`flex-1 px-4 py-4 font-semibold ${activeTab === 'overview' ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>📊 Overview</button>
            <button onClick={() => setActiveTab('listening')} className={`flex-1 px-4 py-4 font-semibold ${activeTab === 'listening' ? 'bg-blue-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>🎧 Listening</button>
            <button onClick={() => setActiveTab('reading')} className={`flex-1 px-4 py-4 font-semibold ${activeTab === 'reading' ? 'bg-green-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>📖 Reading</button>
            <button onClick={() => setActiveTab('writing')} className={`flex-1 px-4 py-4 font-semibold ${activeTab === 'writing' ? 'bg-purple-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>✍️ Writing</button>
            <button onClick={() => setActiveTab('speaking')} className={`flex-1 px-4 py-4 font-semibold ${activeTab === 'speaking' ? 'bg-pink-500 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}>🎤 Speaking</button>
          </div>
          <div className="p-6">
            {activeTab === 'overview' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Section Breakdown</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div onClick={() => setActiveTab('listening')} className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 cursor-pointer hover:shadow-lg transition">
                    <div className="flex justify-between mb-2">
                      <div className="flex items-center gap-2"><span className="text-2xl">🎧</span><h3 className="text-lg font-bold">Listening</h3></div>
                      <div className="text-3xl font-bold text-blue-600">{session.sectionResults.listening?.bandScore.toFixed(1) || 'N/A'}</div>
                    </div>
                    {session.sectionResults.listening?.score !== undefined && <p className="text-sm text-gray-600">Score: {session.sectionResults.listening.score}/{session.sectionResults.listening.totalQuestions}</p>}
                    <p className="text-xs text-blue-600 mt-2">Click for details →</p>
                  </div>
                  <div onClick={() => setActiveTab('reading')} className="bg-green-50 border-2 border-green-200 rounded-xl p-4 cursor-pointer hover:shadow-lg transition">
                    <div className="flex justify-between mb-2">
                      <div className="flex items-center gap-2"><span className="text-2xl">📖</span><h3 className="text-lg font-bold">Reading</h3></div>
                      <div className="text-3xl font-bold text-green-600">{session.sectionResults.reading?.bandScore.toFixed(1) || 'N/A'}</div>
                    </div>
                    {session.sectionResults.reading?.score !== undefined && <p className="text-sm text-gray-600">Score: {session.sectionResults.reading.score}/{session.sectionResults.reading.totalQuestions}</p>}
                    <p className="text-xs text-green-600 mt-2">Click for details →</p>
                  </div>
                  <div onClick={() => setActiveTab('writing')} className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4 cursor-pointer hover:shadow-lg transition">
                    <div className="flex justify-between mb-2">
                      <div className="flex items-center gap-2"><span className="text-2xl">✍️</span><h3 className="text-lg font-bold">Writing</h3></div>
                      <div className="text-3xl font-bold text-purple-600">{session.sectionResults.writing?.bandScore.toFixed(1) || 'N/A'}</div>
                    </div>
                    <p className="text-sm text-gray-600">AI Evaluated</p>
                    <p className="text-xs text-purple-600 mt-2">Click for details →</p>
                  </div>
                  <div onClick={() => setActiveTab('speaking')} className="bg-pink-50 border-2 border-pink-200 rounded-xl p-4 cursor-pointer hover:shadow-lg transition">
                    <div className="flex justify-between mb-2">
                      <div className="flex items-center gap-2"><span className="text-2xl">🎤</span><h3 className="text-lg font-bold">Speaking</h3></div>
                      <div className="text-3xl font-bold text-pink-600">{session.sectionResults.speaking?.bandScore.toFixed(1) || 'N/A'}</div>
                    </div>
                    <p className="text-sm text-gray-600">AI Evaluated</p>
                    <p className="text-xs text-pink-600 mt-2">Click for details →</p>
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900">💡 Click on any section above to view detailed analysis with explanations!</p>
                </div>
              </div>
            )}
            {activeTab === 'listening' && renderListeningAnalysis()}
            {activeTab === 'reading' && renderReadingAnalysis()}
            {activeTab === 'writing' && renderWritingAnalysis()}
            {activeTab === 'speaking' && renderSpeakingAnalysis()}
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
