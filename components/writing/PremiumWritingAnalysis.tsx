"use client";

import React from 'react';
import Link from 'next/link';

interface TaskEvaluation {
  taskAchievement?: number;
  taskResponse?: number;
  coherenceCohesion: number;
  lexicalResource: number;
  grammaticalRange: number;
  overallBand: number;
  wordCount: number;
  detailedFeedback?: {
    taskAchievement?: string;
    taskResponse?: string;
    coherenceCohesion: string;
    lexicalResource: string;
    grammaticalRange: string;
  };
  strengths?: string[];
  improvements?: string[];
  advice?: string;
}

interface WritingEvaluationResult {
  task1?: TaskEvaluation;
  task2?: TaskEvaluation;
}

interface PremiumWritingAnalysisProps {
  evaluationResult: WritingEvaluationResult;
  overallBandScore: number;
  isPremium: boolean;
}

const PremiumWritingAnalysis: React.FC<PremiumWritingAnalysisProps> = ({
  evaluationResult,
  overallBandScore,
  isPremium
}) => {
  const getBandColor = (band: number): string => {
    if (band >= 7) return 'text-green-600';
    if (band >= 5.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCriteriaColor = (score: number): string => {
    if (score >= 7) return 'bg-green-100 text-green-800 border-green-300';
    if (score >= 5.5) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  if (!isPremium) {
    return (
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-8 border-2 border-amber-200">
        <div className="text-center">
          <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-amber-800 mb-3">Unlock Premium Writing Analysis</h3>
          <p className="text-amber-700 mb-6 max-w-2xl mx-auto">
            Get detailed AI-powered feedback on your writing to dramatically improve your IELTS score!
          </p>
          
          <div className="bg-white rounded-lg p-6 mb-6 max-w-2xl mx-auto">
            <h4 className="font-bold text-gray-800 mb-4 text-lg">Premium features include:</h4>
            <div className="grid md:grid-cols-2 gap-4 text-left">
              <div className="space-y-2">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Detailed feedback for each criterion</span>
                </div>
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Spelling and grammar corrections</span>
                </div>
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Vocabulary enhancement suggestions</span>
                </div>
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Structure and organization tips</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Personalized improvement recommendations</span>
                </div>
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Task-specific strategies and examples</span>
                </div>
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">AI-powered insights for better scores</span>
                </div>
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">Cohesion and coherence analysis</span>
                </div>
              </div>
            </div>
          </div>
          
          <Link 
            href="/pricing" 
            className="inline-block bg-amber-500 text-white px-8 py-3 rounded-lg hover:bg-amber-600 font-bold text-lg transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Upgrade to Premium Now
          </Link>
        </div>
      </div>
    );
  }

  // Premium user - show detailed analysis
  return (
    <div className="space-y-6">
      {/* Task 1 Analysis */}
      {evaluationResult.task1 && (
        <div className="bg-white rounded-lg p-6 border-2 border-blue-200">
          <h3 className="text-2xl font-bold text-blue-800 mb-4 flex items-center">
            <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
            </svg>
            Task 1 Analysis - Band {evaluationResult.task1.overallBand}
          </h3>

          {/* Criteria Scores */}
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div className={`p-4 rounded-lg border-2 ${getCriteriaColor(evaluationResult.task1.taskAchievement || 0)}`}>
              <div className="text-sm font-semibold mb-1">Task Achievement</div>
              <div className="text-2xl font-bold">{evaluationResult.task1.taskAchievement}</div>
            </div>
            <div className={`p-4 rounded-lg border-2 ${getCriteriaColor(evaluationResult.task1.coherenceCohesion)}`}>
              <div className="text-sm font-semibold mb-1">Coherence & Cohesion</div>
              <div className="text-2xl font-bold">{evaluationResult.task1.coherenceCohesion}</div>
            </div>
            <div className={`p-4 rounded-lg border-2 ${getCriteriaColor(evaluationResult.task1.lexicalResource)}`}>
              <div className="text-sm font-semibold mb-1">Lexical Resource</div>
              <div className="text-2xl font-bold">{evaluationResult.task1.lexicalResource}</div>
            </div>
            <div className={`p-4 rounded-lg border-2 ${getCriteriaColor(evaluationResult.task1.grammaticalRange)}`}>
              <div className="text-sm font-semibold mb-1">Grammar Range</div>
              <div className="text-2xl font-bold">{evaluationResult.task1.grammaticalRange}</div>
            </div>
          </div>

          {/* Word Count */}
          <div className="mb-6 p-3 bg-gray-50 rounded">
            <span className="font-semibold">Word Count:</span> {evaluationResult.task1.wordCount} words
            {evaluationResult.task1.wordCount < 150 && (
              <span className="ml-2 text-red-600 text-sm">⚠️ Below minimum (150 words)</span>
            )}
          </div>

          {/* Detailed Feedback */}
          {evaluationResult.task1.detailedFeedback && (
            <div className="space-y-4">
              {evaluationResult.task1.detailedFeedback.taskAchievement && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-bold text-blue-900 mb-2">Task Achievement</h4>
                  <p className="text-gray-700">{evaluationResult.task1.detailedFeedback.taskAchievement}</p>
                </div>
              )}
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-bold text-purple-900 mb-2">Coherence & Cohesion</h4>
                <p className="text-gray-700">{evaluationResult.task1.detailedFeedback.coherenceCohesion}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-bold text-green-900 mb-2">Lexical Resource</h4>
                <p className="text-gray-700">{evaluationResult.task1.detailedFeedback.lexicalResource}</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <h4 className="font-bold text-orange-900 mb-2">Grammatical Range & Accuracy</h4>
                <p className="text-gray-700">{evaluationResult.task1.detailedFeedback.grammaticalRange}</p>
              </div>
            </div>
          )}

          {/* Strengths and Improvements */}
          {(evaluationResult.task1.strengths || evaluationResult.task1.improvements) && (
            <div className="grid md:grid-cols-2 gap-4 mt-6">
              {evaluationResult.task1.strengths && evaluationResult.task1.strengths.length > 0 && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-bold text-green-900 mb-3 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Strengths
                  </h4>
                  <ul className="space-y-1">
                    {evaluationResult.task1.strengths.map((strength, idx) => (
                      <li key={idx} className="text-sm text-gray-700">• {strength}</li>
                    ))}
                  </ul>
                </div>
              )}
              {evaluationResult.task1.improvements && evaluationResult.task1.improvements.length > 0 && (
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h4 className="font-bold text-yellow-900 mb-3 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Areas for Improvement
                  </h4>
                  <ul className="space-y-1">
                    {evaluationResult.task1.improvements.map((improvement, idx) => (
                      <li key={idx} className="text-sm text-gray-700">• {improvement}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Overall Advice */}
          {evaluationResult.task1.advice && (
            <div className="mt-6 bg-indigo-50 p-4 rounded-lg border border-indigo-200">
              <h4 className="font-bold text-indigo-900 mb-2">Examiner's Advice</h4>
              <p className="text-gray-700">{evaluationResult.task1.advice}</p>
            </div>
          )}
        </div>
      )}

      {/* Task 2 Analysis */}
      {evaluationResult.task2 && (
        <div className="bg-white rounded-lg p-6 border-2 border-green-200">
          <h3 className="text-2xl font-bold text-green-800 mb-4 flex items-center">
            <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
            </svg>
            Task 2 Analysis - Band {evaluationResult.task2.overallBand}
          </h3>

          {/* Criteria Scores */}
          <div className="grid md:grid-cols-4 gap-4 mb-6">
            <div className={`p-4 rounded-lg border-2 ${getCriteriaColor(evaluationResult.task2.taskResponse || 0)}`}>
              <div className="text-sm font-semibold mb-1">Task Response</div>
              <div className="text-2xl font-bold">{evaluationResult.task2.taskResponse}</div>
            </div>
            <div className={`p-4 rounded-lg border-2 ${getCriteriaColor(evaluationResult.task2.coherenceCohesion)}`}>
              <div className="text-sm font-semibold mb-1">Coherence & Cohesion</div>
              <div className="text-2xl font-bold">{evaluationResult.task2.coherenceCohesion}</div>
            </div>
            <div className={`p-4 rounded-lg border-2 ${getCriteriaColor(evaluationResult.task2.lexicalResource)}`}>
              <div className="text-sm font-semibold mb-1">Lexical Resource</div>
              <div className="text-2xl font-bold">{evaluationResult.task2.lexicalResource}</div>
            </div>
            <div className={`p-4 rounded-lg border-2 ${getCriteriaColor(evaluationResult.task2.grammaticalRange)}`}>
              <div className="text-sm font-semibold mb-1">Grammar Range</div>
              <div className="text-2xl font-bold">{evaluationResult.task2.grammaticalRange}</div>
            </div>
          </div>

          {/* Word Count */}
          <div className="mb-6 p-3 bg-gray-50 rounded">
            <span className="font-semibold">Word Count:</span> {evaluationResult.task2.wordCount} words
            {evaluationResult.task2.wordCount < 250 && (
              <span className="ml-2 text-red-600 text-sm">⚠️ Below minimum (250 words)</span>
            )}
          </div>

          {/* Detailed Feedback */}
          {evaluationResult.task2.detailedFeedback && (
            <div className="space-y-4">
              {evaluationResult.task2.detailedFeedback.taskResponse && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h4 className="font-bold text-blue-900 mb-2">Task Response</h4>
                  <p className="text-gray-700">{evaluationResult.task2.detailedFeedback.taskResponse}</p>
                </div>
              )}
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-bold text-purple-900 mb-2">Coherence & Cohesion</h4>
                <p className="text-gray-700">{evaluationResult.task2.detailedFeedback.coherenceCohesion}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h4 className="font-bold text-green-900 mb-2">Lexical Resource</h4>
                <p className="text-gray-700">{evaluationResult.task2.detailedFeedback.lexicalResource}</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <h4 className="font-bold text-orange-900 mb-2">Grammatical Range & Accuracy</h4>
                <p className="text-gray-700">{evaluationResult.task2.detailedFeedback.grammaticalRange}</p>
              </div>
            </div>
          )}

          {/* Strengths and Improvements */}
          {(evaluationResult.task2.strengths || evaluationResult.task2.improvements) && (
            <div className="grid md:grid-cols-2 gap-4 mt-6">
              {evaluationResult.task2.strengths && evaluationResult.task2.strengths.length > 0 && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <h4 className="font-bold text-green-900 mb-3 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Strengths
                  </h4>
                  <ul className="space-y-1">
                    {evaluationResult.task2.strengths.map((strength, idx) => (
                      <li key={idx} className="text-sm text-gray-700">• {strength}</li>
                    ))}
                  </ul>
                </div>
              )}
              {evaluationResult.task2.improvements && evaluationResult.task2.improvements.length > 0 && (
                <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                  <h4 className="font-bold text-yellow-900 mb-3 flex items-center">
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    Areas for Improvement
                  </h4>
                  <ul className="space-y-1">
                    {evaluationResult.task2.improvements.map((improvement, idx) => (
                      <li key={idx} className="text-sm text-gray-700">• {improvement}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Overall Advice */}
          {evaluationResult.task2.advice && (
            <div className="mt-6 bg-indigo-50 p-4 rounded-lg border border-indigo-200">
              <h4 className="font-bold text-indigo-900 mb-2">Examiner's Advice</h4>
              <p className="text-gray-700">{evaluationResult.task2.advice}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PremiumWritingAnalysis;
