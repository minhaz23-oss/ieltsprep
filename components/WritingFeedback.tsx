"use client";

import React from "react";
import Link from "next/link";

interface Task1Feedback {
  taskAchievement: number;
  coherenceCohesion: number;
  lexicalResource: number;
  grammaticalRange: number;
  overallBand: number;
  wordCount: number;
  detailedFeedback: {
    taskAchievement: string;
    coherenceCohesion: string;
    lexicalResource: string;
    grammaticalRange: string;
  };
  strengths: string[];
  improvements: string[];
  advice: string;
}

interface Task2Feedback {
  taskResponse: number;
  coherenceCohesion: number;
  lexicalResource: number;
  grammaticalRange: number;
  overallBand: number;
  wordCount: number;
  detailedFeedback: {
    taskResponse: string;
    coherenceCohesion: string;
    lexicalResource: string;
    grammaticalRange: string;
  };
  strengths: string[];
  improvements: string[];
  advice: string;
}

interface WritingFeedbackProps {
  task1?: Task1Feedback;
  task2?: Task2Feedback;
  overallBandScore?: number;
  isPremium?: boolean;
}

function WritingFeedback({
  task1,
  task2,
  overallBandScore,
  isPremium = false,
}: WritingFeedbackProps) {
  const getBandScoreColor = (score: number) => {
    if (score >= 7) return "text-green-600 bg-green-50 border-green-200";
    if (score >= 6) return "text-blue-600 bg-blue-50 border-blue-200";
    if (score >= 5) return "text-yellow-600 bg-yellow-50 border-yellow-200";
    return "text-red-600 bg-red-50 border-red-200";
  };

  const getBandScoreLabel = (score: number) => {
    if (score >= 8.5) return "Excellent";
    if (score >= 7.5) return "Very Good";
    if (score >= 6.5) return "Good";
    if (score >= 5.5) return "Competent";
    if (score >= 4.5) return "Limited";
    return "Poor";
  };

  const getScoreIcon = (score: number) => {
    if (score >= 7) return "🟢";
    if (score >= 6) return "🔵";
    if (score >= 5) return "🟡";
    return "🔴";
  };

  return (
    <div className="space-y-8">
      {/* Overall Score */}
      {overallBandScore && (
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 max-w-md mx-auto">
          <div className="text-center">
            <div
              className={`inline-block px-6 py-3 rounded-full text-4xl font-black border-2 ${getBandScoreColor(
                overallBandScore
              )}`}
            >
              {overallBandScore}
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mt-4">
              Overall Band Score
            </h3>
            <p className="text-lg text-gray-600">
              {getBandScoreLabel(overallBandScore)}
            </p>

            {/* Score interpretation */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                {overallBandScore >= 8 &&
                  "Outstanding! You demonstrate excellent writing skills with sophisticated language use."}
                {overallBandScore >= 7 &&
                  overallBandScore < 8 &&
                  "Very good work! You show strong writing ability with minor areas for improvement."}
                {overallBandScore >= 6.5 &&
                  overallBandScore < 7 &&
                  "Good performance! You're competent with some room for enhancement."}
                {overallBandScore >= 5.5 &&
                  overallBandScore < 6.5 &&
                  "Competent writing with noticeable limitations that need attention."}
                {overallBandScore < 5.5 &&
                  "Your writing needs significant improvement. Focus on the feedback provided."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Results */}
      <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
        {/* Task 1 Results */}
        {task1 && (
          <div className="bg-white rounded-xl border-2 border-blue-200 p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-blue-800 flex items-center">
                📊 Task 1 Results
              </h2>
              <div
                className={`px-4 py-2 rounded-full text-xl font-black border-2 ${getBandScoreColor(
                  task1.overallBand
                )}`}
              >
                {task1.overallBand}
              </div>
            </div>

            {/* Criteria Scores */}
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-1 gap-3">
                <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-lg mr-2">
                      {getScoreIcon(task1.taskAchievement)}
                    </span>
                    <div>
                      <div className="font-semibold text-gray-800">
                        Task Achievement
                      </div>
                      <div className="text-xs text-gray-600">
                        Addresses task requirements
                      </div>
                    </div>
                  </div>
                  <div className="text-xl font-bold text-gray-800">
                    {task1.taskAchievement}/9
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-lg mr-2">
                      {getScoreIcon(task1.coherenceCohesion)}
                    </span>
                    <div>
                      <div className="font-semibold text-gray-800">
                        Coherence & Cohesion
                      </div>
                      <div className="text-xs text-gray-600">
                        Logical flow and linking
                      </div>
                    </div>
                  </div>
                  <div className="text-xl font-bold text-gray-800">
                    {task1.coherenceCohesion}/9
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-lg mr-2">
                      {getScoreIcon(task1.lexicalResource)}
                    </span>
                    <div>
                      <div className="font-semibold text-gray-800">
                        Lexical Resource
                      </div>
                      <div className="text-xs text-gray-600">
                        Vocabulary range & accuracy
                      </div>
                    </div>
                  </div>
                  <div className="text-xl font-bold text-gray-800">
                    {task1.lexicalResource}/9
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-lg mr-2">
                      {getScoreIcon(task1.grammaticalRange)}
                    </span>
                    <div>
                      <div className="font-semibold text-gray-800">
                        Grammatical Range
                      </div>
                      <div className="text-xs text-gray-600">
                        Grammar variety & accuracy
                      </div>
                    </div>
                  </div>
                  <div className="text-xl font-bold text-gray-800">
                    {task1.grammaticalRange}/9
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <div className="text-sm text-blue-600">Word Count</div>
                <div className="text-lg font-bold text-blue-800">
                  {task1.wordCount} words {task1.wordCount >= 150 ? "✅" : "⚠️"}
                </div>
                {task1.wordCount < 150 && (
                  <div className="text-xs text-orange-600 mt-1">
                    Target: 150+ words
                  </div>
                )}
              </div>
            </div>

            {/* Detailed Feedback */}
            <div className="space-y-4">
              {/* Strengths - Always visible */}
              <div>
                <h4 className="font-bold text-green-700 mb-2 flex items-center">
                  ✅ Strengths
                </h4>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  {(task1.strengths || []).slice(0, isPremium ? undefined : 2).map((strength, index) => (
                    <li key={index}>{strength}</li>
                  ))}
                  {!isPremium && (task1.strengths || []).length > 2 && (
                    <li className="text-gray-400 italic">+ {(task1.strengths || []).length - 2} more insights available with Premium</li>
                  )}
                </ul>
              </div>

              {/* Areas for Improvement - Premium Feature */}
              <div className={`relative ${!isPremium ? 'overflow-hidden' : ''}`}>
                <h4 className="font-bold text-orange-700 mb-2 flex items-center">
                  📈 Areas for Improvement
                  {!isPremium && (
                    <span className="ml-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                      PREMIUM
                    </span>
                  )}
                </h4>
                <div className={!isPremium ? 'filter blur-sm pointer-events-none' : ''}>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                    {(task1.improvements || []).map((improvement, index) => (
                      <li key={index}>{improvement}</li>
                    ))}
                  </ul>
                </div>
                {!isPremium && (
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent flex items-center justify-center">
                    <div className="text-center bg-white/95 backdrop-blur-sm rounded-lg p-4 border-2 border-orange-200 shadow-lg">
                      <div className="text-orange-600 font-bold text-sm mb-2">🔒 Premium Feature</div>
                      <p className="text-xs text-gray-600 mb-3">Get detailed improvement suggestions</p>
                      <Link href="/pricing" className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:shadow-lg transition-all">
                        Upgrade Now
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Expert Advice - Premium Feature */}
              <div className={`relative ${!isPremium ? 'overflow-hidden' : ''}`}>
                <h4 className="font-bold text-blue-700 mb-2 flex items-center">
                  💡 Expert Advice
                  {!isPremium && (
                    <span className="ml-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                      PREMIUM
                    </span>
                  )}
                </h4>
                <div className={`bg-blue-50 rounded-lg p-4 ${!isPremium ? 'filter blur-sm pointer-events-none' : ''}`}>
                  <p className="text-sm text-gray-700">{task1.advice}</p>
                </div>
                {!isPremium && (
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent flex items-center justify-center">
                    <div className="text-center bg-white/95 backdrop-blur-sm rounded-lg p-4 border-2 border-blue-200 shadow-lg">
                      <div className="text-blue-600 font-bold text-sm mb-2">🔒 Premium Feature</div>
                      <p className="text-xs text-gray-600 mb-3">Get personalized expert advice</p>
                      <Link href="/pricing" className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:shadow-lg transition-all">
                        Upgrade Now
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Task 2 Results */}
        {task2 && (
          <div className="bg-white rounded-xl border-2 border-green-200 p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-green-800 flex items-center">
                ✍️ Task 2 Results
              </h2>
              <div
                className={`px-4 py-2 rounded-full text-xl font-black border-2 ${getBandScoreColor(
                  task2.overallBand
                )}`}
              >
                {task2.overallBand}
              </div>
            </div>

            {/* Criteria Scores */}
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-1 gap-3">
                <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-lg mr-2">
                      {getScoreIcon(task2.taskResponse)}
                    </span>
                    <div>
                      <div className="font-semibold text-gray-800">
                        Task Response
                      </div>
                      <div className="text-xs text-gray-600">
                        Addresses all parts of task
                      </div>
                    </div>
                  </div>
                  <div className="text-xl font-bold text-gray-800">
                    {task2.taskResponse}/9
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-lg mr-2">
                      {getScoreIcon(task2.coherenceCohesion)}
                    </span>
                    <div>
                      <div className="font-semibold text-gray-800">
                        Coherence & Cohesion
                      </div>
                      <div className="text-xs text-gray-600">
                        Logical flow and linking
                      </div>
                    </div>
                  </div>
                  <div className="text-xl font-bold text-gray-800">
                    {task2.coherenceCohesion}/9
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-lg mr-2">
                      {getScoreIcon(task2.lexicalResource)}
                    </span>
                    <div>
                      <div className="font-semibold text-gray-800">
                        Lexical Resource
                      </div>
                      <div className="text-xs text-gray-600">
                        Vocabulary range & accuracy
                      </div>
                    </div>
                  </div>
                  <div className="text-xl font-bold text-gray-800">
                    {task2.lexicalResource}/9
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-lg mr-2">
                      {getScoreIcon(task2.grammaticalRange)}
                    </span>
                    <div>
                      <div className="font-semibold text-gray-800">
                        Grammatical Range
                      </div>
                      <div className="text-xs text-gray-600">
                        Grammar variety & accuracy
                      </div>
                    </div>
                  </div>
                  <div className="text-xl font-bold text-gray-800">
                    {task2.grammaticalRange}/9
                  </div>
                </div>
              </div>

              <div className="bg-green-50 rounded-lg p-3 text-center">
                <div className="text-sm text-green-600">Word Count</div>
                <div className="text-lg font-bold text-green-800">
                  {task2.wordCount} words {task2.wordCount >= 250 ? "✅" : "⚠️"}
                </div>
                {task2.wordCount < 250 && (
                  <div className="text-xs text-orange-600 mt-1">
                    Target: 250+ words
                  </div>
                )}
              </div>
            </div>

            {/* Detailed Feedback */}
            <div className="space-y-4">
              {/* Strengths - Always visible */}
              <div>
                <h4 className="font-bold text-green-700 mb-2 flex items-center">
                  ✅ Strengths
                </h4>
                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                  {(task2.strengths || []).slice(0, isPremium ? undefined : 2).map((strength, index) => (
                    <li key={index}>{strength}</li>
                  ))}
                  {!isPremium && (task2.strengths || []).length > 2 && (
                    <li className="text-gray-400 italic">+ {(task2.strengths || []).length - 2} more insights available with Premium</li>
                  )}
                </ul>
              </div>

              {/* Areas for Improvement - Premium Feature */}
              <div className={`relative ${!isPremium ? 'overflow-hidden' : ''}`}>
                <h4 className="font-bold text-orange-700 mb-2 flex items-center">
                  📈 Areas for Improvement
                  {!isPremium && (
                    <span className="ml-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                      PREMIUM
                    </span>
                  )}
                </h4>
                <div className={!isPremium ? 'filter blur-sm pointer-events-none' : ''}>
                  <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                    {(task2.improvements || []).map((improvement, index) => (
                      <li key={index}>{improvement}</li>
                    ))}
                  </ul>
                </div>
                {!isPremium && (
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent flex items-center justify-center">
                    <div className="text-center bg-white/95 backdrop-blur-sm rounded-lg p-4 border-2 border-orange-200 shadow-lg">
                      <div className="text-orange-600 font-bold text-sm mb-2">🔒 Premium Feature</div>
                      <p className="text-xs text-gray-600 mb-3">Get detailed improvement suggestions</p>
                      <Link href="/pricing" className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:shadow-lg transition-all">
                        Upgrade Now
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* Expert Advice - Premium Feature */}
              <div className={`relative ${!isPremium ? 'overflow-hidden' : ''}`}>
                <h4 className="font-bold text-green-700 mb-2 flex items-center">
                  💡 Expert Advice
                  {!isPremium && (
                    <span className="ml-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                      PREMIUM
                    </span>
                  )}
                </h4>
                <div className={`bg-green-50 rounded-lg p-4 ${!isPremium ? 'filter blur-sm pointer-events-none' : ''}`}>
                  <p className="text-sm text-gray-700">{task2.advice}</p>
                </div>
                {!isPremium && (
                  <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent flex items-center justify-center">
                    <div className="text-center bg-white/95 backdrop-blur-sm rounded-lg p-4 border-2 border-green-200 shadow-lg">
                      <div className="text-green-600 font-bold text-sm mb-2">🔒 Premium Feature</div>
                      <p className="text-xs text-gray-600 mb-3">Get personalized expert advice</p>
                      <Link href="/pricing" className="bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:shadow-lg transition-all">
                        Upgrade Now
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Performance Summary */}
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 border-2 border-gray-200">
        <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          📈 Performance Summary
        </h3>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Score Distribution */}
          <div className="bg-white rounded-lg p-6">
            <h4 className="font-bold text-gray-700 mb-4">Score Distribution</h4>
            <div className="space-y-2">
              {task1 && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Task 1:</span>
                  <span className="font-semibold">{task1.overallBand}/9</span>
                </div>
              )}
              {task2 && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Task 2:</span>
                  <span className="font-semibold">{task2.overallBand}/9</span>
                </div>
              )}
              {overallBandScore && (
                <div className="border-t pt-2 flex justify-between">
                  <span className="font-semibold text-gray-700">Overall:</span>
                  <span className="font-bold text-lg">
                    {overallBandScore}/9
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Word Count Check */}
          <div className="bg-white rounded-lg p-6">
            <h4 className="font-bold text-gray-700 mb-4">Word Count</h4>
            <div className="space-y-2">
              {task1 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Task 1:</span>
                  <div className="flex items-center">
                    <span className="font-semibold mr-1">
                      {task1.wordCount}
                    </span>
                    {task1.wordCount >= 150 ? "✅" : "❌"}
                  </div>
                </div>
              )}
              {task2 && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Task 2:</span>
                  <div className="flex items-center">
                    <span className="font-semibold mr-1">
                      {task2.wordCount}
                    </span>
                    {task2.wordCount >= 250 ? "✅" : "❌"}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-white rounded-lg p-6">
            <h4 className="font-bold text-gray-700 mb-4">Next Steps</h4>
            <div className="space-y-2 text-sm">
              {overallBandScore && overallBandScore >= 7 ? (
                <>
                  <p className="text-green-600">✅ Great work!</p>
                  <p className="text-gray-600">
                    Keep practicing to maintain consistency
                  </p>
                </>
              ) : (
                <>
                  <p className="text-orange-600">📚 Keep practicing</p>
                  <p className="text-gray-600">
                    Focus on the improvement areas highlighted
                  </p>
                </>
              )}
              <p className="text-blue-600 mt-2">
                🎯 Try more tests to track progress
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Upgrade Section for Free Users */}
      {!isPremium && (
        <div className="bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 rounded-2xl p-8 border-2 border-orange-200 shadow-lg">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full mb-4">
              <span className="text-2xl">🚀</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              Unlock Your Full Potential
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              You're seeing limited feedback. Upgrade to Premium to get comprehensive analysis, 
              detailed improvement suggestions, and personalized expert advice to achieve your target band score.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="text-center p-4 bg-white/70 rounded-lg border border-orange-200">
              <div className="text-3xl mb-2">📊</div>
              <h4 className="font-bold text-gray-800 mb-1">Detailed Analysis</h4>
              <p className="text-sm text-gray-600">Complete breakdown of all IELTS criteria with specific feedback</p>
            </div>
            <div className="text-center p-4 bg-white/70 rounded-lg border border-orange-200">
              <div className="text-3xl mb-2">💡</div>
              <h4 className="font-bold text-gray-800 mb-1">Expert Advice</h4>
              <p className="text-sm text-gray-600">Personalized recommendations from IELTS experts</p>
            </div>
            <div className="text-center p-4 bg-white/70 rounded-lg border border-orange-200">
              <div className="text-3xl mb-2">📈</div>
              <h4 className="font-bold text-gray-800 mb-1">Improvement Plan</h4>
              <p className="text-sm text-gray-600">Step-by-step guidance to reach your target score</p>
            </div>
          </div>

          <div className="text-center">
            <Link 
              href="/pricing" 
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-lg text-lg hover:shadow-xl transition-all transform hover:scale-105"
            >
              <span className="mr-2">⭐</span>
              Upgrade to Premium
              <span className="ml-2">→</span>
            </Link>
            <p className="text-sm text-gray-500 mt-3">
              Join thousands of successful IELTS candidates who chose Premium
            </p>
          </div>
        </div>
      )}

      {/* Premium Success Message */}
      {isPremium && (
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-green-500 rounded-full mb-3">
              <span className="text-xl text-white">⭐</span>
            </div>
            <h3 className="text-lg font-bold text-green-800 mb-2">
              Premium Analysis Complete!
            </h3>
            <p className="text-green-700 text-sm">
              You're getting the most comprehensive IELTS writing feedback available. 
              Keep practicing to achieve your target score!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default WritingFeedback;
