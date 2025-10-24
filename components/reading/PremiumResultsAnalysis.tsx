"use client";

import React, { useState, useEffect } from 'react';

// Types matching the reading test data structure
interface Question {
  questionNumber: number;
  questionId: string;
  questionType: string;
  correctAnswer: string | string[];
  context?: string;
  statement?: string;
  paragraph?: string;
  person?: string;
  finding?: string;
  question?: string;
  options?: string[];
  sentenceStart?: string;
  information?: string;
}

interface QuestionSection {
  sectionId: string;
  instructions: string;
  questionType: string;
  questions: Question[];
}

interface Passage {
  id: string;
  title: string;
  passageNumber: number;
  questionSections: QuestionSection[];
}

interface TestData {
  test: {
    title: string;
    type: string;
    totalTime: number;
    totalQuestions: number;
    passages: Passage[];
  };
}

interface AnswerAnalysis {
  questionNumber: number;
  userAnswer: string | string[];
  correctAnswer: string | string[];
  isCorrect: boolean;
  questionText?: string;
  questionType: string;
  passageNumber: number;
  explanation?: string;
  grammarPoint?: string;
  commonMistake?: string;
  tip?: string;
}

interface PremiumResultsAnalysisProps {
  testData: TestData;
  answers: Record<number, string | string[]>;
  isPremium: boolean;
}

const PremiumResultsAnalysis: React.FC<PremiumResultsAnalysisProps> = ({
  testData,
  answers,
  isPremium
}) => {
  const [aiAnalyses, setAiAnalyses] = useState<Record<number, {
    explanation: string;
    grammarPoint: string;
    commonMistake: string;
    tip: string;
  }>>({});
  const [isLoadingAI, setIsLoadingAI] = useState(false);

  // Helper to format acceptable answers
  const formatAcceptableAnswers = (answer: string | string[]): string => {
    if (Array.isArray(answer)) {
      return answer.join(', ');
    }
    // If answer contains '/' separator, show all options with 'or'
    if (answer.includes('/')) {
      const options = answer.split('/').map(opt => `"${opt.trim()}"`);
      return options.join(' or ');
    }
    return `"${answer}"`;
  };

  // Helper function to check if user answer matches any acceptable answer
  const isAnswerCorrect = (userAnswer: string, correctAnswer: string): boolean => {
    const userAnswerClean = userAnswer.toLowerCase().trim();
    
    // Split correct answer by '/' to get all acceptable variations
    const acceptableAnswers = correctAnswer.toLowerCase().split('/').map(a => a.trim());
    
    // Check if user answer matches any of the acceptable answers
    return acceptableAnswers.some(acceptable => userAnswerClean === acceptable);
  };

  // Check if answer is correct
  const checkAnswer = (userAnswer: string | string[] | undefined, correctAnswer: string | string[]): boolean => {
    if (!userAnswer) return false;
    
    if (Array.isArray(correctAnswer) && Array.isArray(userAnswer)) {
      const userSet = new Set(userAnswer.map(a => a.toUpperCase()));
      const correctSet = new Set(correctAnswer.map(a => a.toUpperCase()));
      return userSet.size === correctSet.size && [...correctSet].every(a => userSet.has(a));
    } else if (typeof userAnswer === 'string' && typeof correctAnswer === 'string') {
      // Check for single letter answers (A, B, C, etc.) - use exact match
      if (correctAnswer.length <= 3 && /^[A-Z]+$/i.test(correctAnswer)) {
        return userAnswer.toUpperCase().trim() === correctAnswer.toUpperCase().trim();
      }
      // For text answers, check against multiple acceptable answers separated by '/'
      return isAnswerCorrect(userAnswer, correctAnswer);
    }
    return false;
  };

  // Get question text for display
  const getQuestionText = (q: Question): string => {
    return q.statement || q.question || q.information || q.context || q.sentenceStart || 
           q.finding || q.person || `Question ${q.questionNumber}`;
  };

  // Analyze all answers
  const analyzeAnswers = (): AnswerAnalysis[] => {
    const analyses: AnswerAnalysis[] = [];
    
    testData.test.passages.forEach(passage => {
      passage.questionSections.forEach(section => {
        section.questions.forEach(q => {
          const userAnswer = answers[q.questionNumber];
          const isCorrect = checkAnswer(userAnswer, q.correctAnswer);
          
          analyses.push({
            questionNumber: q.questionNumber,
            userAnswer: userAnswer || '',
            correctAnswer: q.correctAnswer,
            isCorrect,
            questionText: getQuestionText(q),
            questionType: section.questionType,
            passageNumber: passage.passageNumber
          });
        });
      });
    });
    
    return analyses.sort((a, b) => a.questionNumber - b.questionNumber);
  };

  const analyses = analyzeAnswers();
  const incorrectAnswers = analyses.filter(a => !a.isCorrect);

  // Fetch AI analysis for incorrect answers when user is premium
  useEffect(() => {
    const fetchAIAnalysis = async () => {
      if (!isPremium || incorrectAnswers.length === 0 || isLoadingAI) return;

      setIsLoadingAI(true);

      try {
        const response = await fetch('/api/analyze-reading-answers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            incorrectAnswers: incorrectAnswers.map(ans => ({
              questionNumber: ans.questionNumber,
              userAnswer: typeof ans.userAnswer === 'string' ? ans.userAnswer : ans.userAnswer.join(', '),
              correctAnswer: typeof ans.correctAnswer === 'string' ? ans.correctAnswer : ans.correctAnswer.join(', '),
              questionText: ans.questionText,
              questionType: ans.questionType,
              passageNumber: ans.passageNumber
            })),
            testTitle: testData.test.title
          })
        });

        const data = await response.json();

        if (data.success && data.analyses) {
          const analysesMap: Record<number, any> = {};
          data.analyses.forEach((analysis: any) => {
            analysesMap[analysis.questionNumber] = {
              explanation: analysis.explanation,
              grammarPoint: analysis.grammarPoint,
              commonMistake: analysis.commonMistake,
              tip: analysis.tip
            };
          });
          setAiAnalyses(analysesMap);
        }
      } catch (error) {
        console.error('Error fetching AI analysis:', error);
      } finally {
        setIsLoadingAI(false);
      }
    };

    fetchAIAnalysis();
  }, [isPremium, incorrectAnswers.length, testData.test.title]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!isPremium) {
    return (
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-6 border-2 border-amber-200">
        <div className="text-center">
          <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-amber-800 mb-2">Premium Feature</h3>
          <p className="text-amber-700 mb-4">
            Unlock detailed answer analysis with AI-powered explanations to improve your IELTS score!
          </p>
          <div className="bg-white rounded-lg p-4 mb-4">
            <h4 className="font-semibold text-gray-800 mb-2">Premium features include:</h4>
            <ul className="text-left text-sm text-gray-600 space-y-1">
              <li>✓ Detailed explanations for incorrect answers</li>
              <li>✓ Reading comprehension analysis</li>
              <li>✓ Question-type specific strategies</li>
              <li>✓ Personalized improvement recommendations</li>
              <li>✓ AI-powered insights for better understanding</li>
            </ul>
          </div>
          <button className="bg-amber-500 text-white px-6 py-2 rounded-lg hover:bg-amber-600 font-semibold">
            Upgrade to Premium
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border-2 border-blue-200">
        <h3 className="text-xl font-bold text-blue-800 mb-4 flex items-center">
          <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
          Premium Answer Analysis
        </h3>
        
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-100 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-700">{analyses.filter(a => a.isCorrect).length}</div>
            <div className="text-sm text-green-600">Correct Answers</div>
          </div>
          <div className="bg-red-100 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-700">{incorrectAnswers.length}</div>
            <div className="text-sm text-red-600">Incorrect Answers</div>
          </div>
          <div className="bg-blue-100 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-700">{analyses.length}</div>
            <div className="text-sm text-blue-600">Total Questions</div>
          </div>
        </div>
      </div>

      {incorrectAnswers.length > 0 && (
        <div className="bg-white rounded-lg p-6 border-2 border-red-200">
          <h4 className="text-lg font-bold text-red-800 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            AI-Powered Analysis of Incorrect Answers
            {isLoadingAI && (
              <span className="ml-3 text-sm font-normal text-gray-600">
                <span className="animate-pulse">🤖 Analyzing...</span>
              </span>
            )}
          </h4>
          
          {isLoadingAI ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
              <p className="text-gray-600">AI is analyzing your answers to provide personalized feedback...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {incorrectAnswers.map((analysis) => {
                const aiAnalysis = aiAnalyses[analysis.questionNumber];
                
                return (
                  <div key={analysis.questionNumber} className="border-l-4 border-red-400 pl-4 py-3 bg-red-50 rounded-r-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h5 className="font-semibold text-red-800">
                        Question {analysis.questionNumber}
                        {analysis.questionText && (
                          <span className="text-sm text-gray-600 font-normal ml-2">
                            ({analysis.questionText.substring(0, 50)}{analysis.questionText.length > 50 ? '...' : ''})
                          </span>
                        )}
                      </h5>
                      <span className="text-xs bg-red-200 text-red-700 px-2 py-1 rounded">
                        Passage {analysis.passageNumber} • {analysis.questionType}
                      </span>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <span className="text-sm font-medium text-gray-700">Your Answer:</span>
                        <div className="bg-red-100 p-2 rounded text-red-800 font-mono">
                          {Array.isArray(analysis.userAnswer) 
                            ? analysis.userAnswer.join(', ') || '(blank)'
                            : analysis.userAnswer || '(blank)'
                          }
                        </div>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-700">Correct Answer:</span>
                        <div className="bg-green-100 p-2 rounded text-green-800 font-mono">
                          {formatAcceptableAnswers(analysis.correctAnswer)}
                        </div>
                      </div>
                    </div>
                    
                    {aiAnalysis && (
                      <>
                        <div className="mb-3">
                          <span className="text-sm font-medium text-gray-700">📝 Explanation:</span>
                          <p className="text-gray-800 mt-1">{aiAnalysis.explanation}</p>
                        </div>
                        
                        <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-400 mb-3">
                          <span className="text-sm font-medium text-blue-700">📚 Reading Skill Point:</span>
                          <p className="text-blue-800 mt-1 text-sm">{aiAnalysis.grammarPoint}</p>
                        </div>

                        <div className="bg-orange-50 p-3 rounded border-l-4 border-orange-400 mb-3">
                          <span className="text-sm font-medium text-orange-700">⚠️ Common Mistake:</span>
                          <p className="text-orange-800 mt-1 text-sm">{aiAnalysis.commonMistake}</p>
                        </div>

                        <div className="bg-green-50 p-3 rounded border-l-4 border-green-400">
                          <span className="text-sm font-medium text-green-700">💡 Pro Tip:</span>
                          <p className="text-green-800 mt-1 text-sm">{aiAnalysis.tip}</p>
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {incorrectAnswers.length === 0 && (
        <div className="bg-green-50 rounded-lg p-6 border-2 border-green-200 text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h4 className="text-xl font-bold text-green-800 mb-2">Perfect Score!</h4>
          <p className="text-green-700">
            Congratulations! You answered all questions correctly. Keep up the excellent work!
          </p>
        </div>
      )}

      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border-2 border-purple-200">
        <h4 className="text-lg font-bold text-purple-800 mb-4">📚 Study Recommendations</h4>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h5 className="font-semibold text-purple-700 mb-2">Focus Areas:</h5>
            <ul className="text-sm text-purple-600 space-y-1">
              {incorrectAnswers.length > 0 ? (
                <>
                  <li>• Practice {[...new Set(incorrectAnswers.map(a => a.questionType))].join(', ')} questions</li>
                  <li>• Improve reading comprehension skills</li>
                  <li>• Work on time management</li>
                  <li>• Practice skimming and scanning techniques</li>
                </>
              ) : (
                <>
                  <li>• Maintain current performance level</li>
                  <li>• Practice with more challenging tests</li>
                  <li>• Focus on reducing time per passage</li>
                </>
              )}
            </ul>
          </div>
          <div>
            <h5 className="font-semibold text-purple-700 mb-2">Next Steps:</h5>
            <ul className="text-sm text-purple-600 space-y-1">
              <li>• Review passages for missed questions</li>
              <li>• Practice similar question types</li>
              <li>• Take another practice test</li>
              <li>• Build vocabulary related to common IELTS topics</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumResultsAnalysis;
