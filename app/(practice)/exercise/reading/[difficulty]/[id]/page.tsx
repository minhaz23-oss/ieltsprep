'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getReadingTestById } from '@/lib/actions/reading.actions';

interface Question {
  id: number;
  type: string;
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  explanation?: string;
  skillArea?: string; // e.g., 'Main Ideas', 'Detail Recognition', 'Inference'
}

interface ReadingTest {
  id: string;
  title: string;
  difficulty: string;
  passage: string;
  questions: Question[];
  metadata: {
    totalQuestions: number;
    wordCount: number;
    estimatedTimeMinutes: number;
  };
}

const ReadingTestPage = () => {
  const params = useParams();
  const router = useRouter();
  const [test, setTest] = useState<ReadingTest | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<{ [key: number]: string | string[] }>({});
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [score, setScore] = useState<{ correct: number; total: number } | null>(null);

  useEffect(() => {
    if (params.id) {
      fetchTest(params.id as string);
    }
  }, [params.id]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsTimerActive(false);
            submitTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timeRemaining]);

  const fetchTest = async (testId: string) => {
    try {
      const response = await getReadingTestById(testId);
      
      if (response.success && response.data) {
        const testData = response.data as ReadingTest;
        setTest(testData);
        // Set timer based on metadata or default to 60 minutes
        const timeInMinutes = testData.metadata?.estimatedTimeMinutes || 60;
        setTimeRemaining(timeInMinutes * 60); // Convert to seconds
      } else {
        console.error('Test not found:', response.message);
        router.push('/exercise/reading');
      }
    } catch (error) {
      console.error('Error fetching test:', error);
      router.push('/exercise/reading');
    } finally {
      setLoading(false);
    }
  };

  const startTimer = () => {
    setIsTimerActive(true);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (questionId: number, answer: string | string[]) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const submitTest = useCallback(() => {
    if (!test) return;

    let correct = 0;
    test.questions.forEach((question) => {
      const userAnswer = answers[question.id];
      const correctAnswer = question.correctAnswer;

      if (Array.isArray(correctAnswer) && Array.isArray(userAnswer)) {
        // For fill-in-the-blanks with multiple answers
        const isCorrect = correctAnswer.every((ans, index) => 
          userAnswer[index]?.toLowerCase().trim() === ans.toLowerCase().trim()
        );
        if (isCorrect) correct++;
      } else if (typeof correctAnswer === 'string' && typeof userAnswer === 'string') {
        if (question.type.includes('multiple') || question.type.includes('mcq')) {
          // For multiple choice questions - compare as strings
          if (userAnswer === correctAnswer) correct++;
        } else {
          // For text-based answers
          if (userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim()) correct++;
        }
      } else if (typeof correctAnswer === 'number' && typeof userAnswer === 'string') {
        // For multiple choice questions where correctAnswer is a number
        if (parseInt(userAnswer) === correctAnswer) correct++;
      }
    });

    setScore({ correct, total: test.questions.length });
    setShowResults(true);
    setIsTimerActive(false);
  }, [test, answers]);

  const renderQuestion = (question: Question) => {
    const userAnswer = answers[question.id];

    switch (question.type) {
      case 'multiple-choice':
      case 'mcq':
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <label key={index} className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={index.toString()}
                  checked={userAnswer === index.toString()}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  className="mr-3 text-primary"
                />
                <span className="font-medium">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'true-false':
      case 'true/false':
      case 'true-false-not-given':
        const options = question.type === 'true-false-not-given' 
          ? ['TRUE', 'FALSE', 'NOT GIVEN'] 
          : ['true', 'false'];
        
        return (
          <div className="space-y-3">
            {options.map((option, index) => (
              <label key={index} className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer">
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option}
                  checked={userAnswer === option}
                  onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                  className="mr-3 text-primary"
                />
                <span className="font-medium">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'fill-blank':
      case 'fill-in-the-blanks':
      case 'fill-in-gaps':
        return (
          <div className="space-y-3">
            <input
              type="text"
              value={(userAnswer as string) || ''}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              placeholder="Enter your answer..."
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none font-medium"
            />
          </div>
        );

      case 'short-answer':
      case 'description':
      case 'inference':
      case 'logical-reasoning':
      case 'prediction':
        return (
          <div className="space-y-3">
            <textarea
              value={(userAnswer as string) || ''}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              placeholder="Enter your answer..."
              rows={3}
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none font-medium resize-none"
            />
          </div>
        );

      default:
        return (
          <div className="space-y-3">
            <input
              type="text"
              value={(userAnswer as string) || ''}
              onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              placeholder="Enter your answer..."
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-primary focus:outline-none font-medium"
            />
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading test...</p>
        </div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-black mb-4">Test Not Found</h2>
          <Link href="/exercise/reading">
            <button className="btn-primary">Back to Reading Tests</button>
          </Link>
        </div>
      </div>
    );
  }

  if (showResults) {
    const percentage = Math.round((score!.correct / score!.total) * 100);
    const getBandScore = (percentage: number) => {
      if (percentage >= 90) return 9;
      if (percentage >= 80) return 8;
      if (percentage >= 70) return 7;
      if (percentage >= 60) return 6;
      if (percentage >= 50) return 5;
      return 4;
    };

    // Helper function to check if answer is correct
    const isAnswerCorrect = (question: Question, userAnswer: string | string[]) => {
      const correctAnswer = question.correctAnswer;
      
      if (Array.isArray(correctAnswer) && Array.isArray(userAnswer)) {
        return correctAnswer.every((ans, index) => 
          userAnswer[index]?.toLowerCase().trim() === ans.toLowerCase().trim()
        );
      } else if (typeof correctAnswer === 'string' && typeof userAnswer === 'string') {
        if (question.type.includes('multiple') || question.type.includes('mcq')) {
          return userAnswer === correctAnswer;
        } else {
          return userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
        }
      } else if (typeof correctAnswer === 'number' && typeof userAnswer === 'string') {
        return parseInt(userAnswer) === correctAnswer;
      }
      return false;
    };

    // Calculate skill area performance
    const skillAnalysis: Record<string, { correct: number; total: number }> = {};
    const wrongAnswers: Array<{
      question: Question;
      userAnswer: string | string[];
      questionNumber: number;
    }> = [];

    test.questions.forEach((question, index) => {
      const userAnswer = answers[question.id];
      const skillArea = question.skillArea || 'General Reading';
      const isCorrect = isAnswerCorrect(question, userAnswer);
      
      if (!skillAnalysis[skillArea]) {
        skillAnalysis[skillArea] = { correct: 0, total: 0 };
      }
      skillAnalysis[skillArea].total++;
      
      if (isCorrect) {
        skillAnalysis[skillArea].correct++;
      } else {
        wrongAnswers.push({
          question,
          userAnswer,
          questionNumber: index + 1
        });
      }
    });

    // Generate improvement suggestions
    const getImprovementSuggestions = () => {
      const suggestions = [];
      
      if (percentage < 60) {
        suggestions.push({
          area: "Overall Reading Strategy",
          tips: [
            "Practice skimming and scanning techniques daily",
            "Read academic articles regularly to improve vocabulary",
            "Time yourself while reading to build speed and comprehension"
          ]
        });
      }

      Object.entries(skillAnalysis).forEach(([skill, data]) => {
        const skillPercentage = (data.correct / data.total) * 100;
        if (skillPercentage < 70) {
          let tips = [];
          switch (skill) {
            case 'Main Ideas':
              tips = [
                "Focus on topic sentences and concluding sentences",
                "Practice identifying the central theme of paragraphs",
                "Look for repeated keywords and concepts"
              ];
              break;
            case 'Detail Recognition':
              tips = [
                "Practice scanning for specific information",
                "Pay attention to numbers, dates, and proper nouns",
                "Use keywords from questions to locate relevant text sections"
              ];
              break;
            case 'Inference':
              tips = [
                "Practice reading between the lines",
                "Look for implied meanings and logical conclusions",
                "Consider what the author suggests without stating directly"
              ];
              break;
            default:
              tips = [
                "Practice more questions of this type",
                "Review question strategies for this skill area",
                "Focus on understanding the passage structure"
              ];
          }
          suggestions.push({ area: skill, tips });
        }
      });

      return suggestions;
    };

    const improvementSuggestions = getImprovementSuggestions();

    return (
      <div className="min-h-screen px-4 py-8 font-semibold bg-gray-50">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-black text-black mb-4">
              📊 Test <span className="p-1 px-2 bg-primary rounded-md text-white -rotate-3 inline-block">Results</span>
            </h1>
            <p className="text-lg text-gray-600">Detailed analysis of your performance</p>
          </div>

          {/* Score Overview */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl border-2 border-blue-200 p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{score!.correct}/{score!.total}</div>
              <div className="text-blue-700 font-medium">Correct Answers</div>
            </div>
            <div className="bg-white rounded-xl border-2 border-green-200 p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{percentage}%</div>
              <div className="text-green-700 font-medium">Accuracy</div>
            </div>
            <div className="bg-white rounded-xl border-2 border-purple-200 p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">Band {getBandScore(percentage)}</div>
              <div className="text-purple-700 font-medium">IELTS Score</div>
            </div>
            <div className="bg-white rounded-xl border-2 border-orange-200 p-6 text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">{wrongAnswers.length}</div>
              <div className="text-orange-700 font-medium">Mistakes</div>
            </div>
          </div>

          {/* Skill Area Performance */}
          {Object.keys(skillAnalysis).length > 0 && (
            <div className="bg-white rounded-xl border-2 border-gray-200 p-8 mb-8">
              <h3 className="text-2xl font-bold text-black mb-6">📈 Skill Area Performance</h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Object.entries(skillAnalysis).map(([skill, data]) => {
                  const skillPercentage = Math.round((data.correct / data.total) * 100);
                  return (
                    <div key={skill} className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-bold text-gray-900 mb-3">{skill}</h4>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">{data.correct}/{data.total} correct</span>
                        <span className={`text-sm font-bold ${
                          skillPercentage >= 80 ? 'text-green-600' :
                          skillPercentage >= 60 ? 'text-yellow-600' : 'text-red-600'
                        }`}>{skillPercentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full transition-all duration-500 ${
                            skillPercentage >= 80 ? 'bg-green-500' :
                            skillPercentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${skillPercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Question-by-Question Analysis */}
          {wrongAnswers.length > 0 && (
            <div className="bg-white rounded-xl border-2 border-gray-200 p-8 mb-8">
              <h3 className="text-2xl font-bold text-black mb-6">❌ Mistakes Analysis</h3>
              <div className="space-y-6">
                {wrongAnswers.map(({ question, userAnswer, questionNumber }) => {
                  const correctAnswer = question.correctAnswer;
                  const displayCorrectAnswer = Array.isArray(correctAnswer) 
                    ? correctAnswer.join(', ') 
                    : question.options && typeof correctAnswer === 'number' 
                      ? question.options[correctAnswer]
                      : correctAnswer;
                  
                  const displayUserAnswer = Array.isArray(userAnswer) 
                    ? userAnswer.join(', ') 
                    : question.options && typeof userAnswer === 'string' && !isNaN(parseInt(userAnswer))
                      ? question.options[parseInt(userAnswer)] || userAnswer
                      : userAnswer || 'Not answered';

                  return (
                    <div key={question.id} className="border-l-4 border-red-400 bg-red-50 p-4 rounded-r-lg">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-bold text-red-800">Question {questionNumber}</h4>
                        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">
                          {question.skillArea || 'General Reading'}
                        </span>
                      </div>
                      
                      <p className="text-gray-800 mb-4 font-medium">{question.question}</p>
                      
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div className="bg-white rounded-lg p-3 border border-red-200">
                          <span className="text-sm font-semibold text-red-700">Your Answer:</span>
                          <p className="text-red-800 mt-1">{displayUserAnswer}</p>
                        </div>
                        <div className="bg-white rounded-lg p-3 border border-green-200">
                          <span className="text-sm font-semibold text-green-700">Correct Answer:</span>
                          <p className="text-green-800 mt-1">{displayCorrectAnswer}</p>
                        </div>
                      </div>
                      
                      {question.explanation && (
                        <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                          <span className="text-sm font-semibold text-blue-700">Explanation:</span>
                          <p className="text-blue-800 mt-1">{question.explanation}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Improvement Suggestions */}
          {improvementSuggestions.length > 0 && (
            <div className="bg-white rounded-xl border-2 border-gray-200 p-8 mb-8">
              <h3 className="text-2xl font-bold text-black mb-6">💡 Areas for Improvement</h3>
              <div className="space-y-6">
                {improvementSuggestions.map((suggestion, index) => (
                  <div key={index} className="bg-yellow-50 rounded-lg p-6 border-l-4 border-yellow-400">
                    <h4 className="font-bold text-yellow-800 mb-3">{suggestion.area}</h4>
                    <ul className="space-y-2">
                      {suggestion.tips.map((tip, tipIndex) => (
                        <li key={tipIndex} className="text-yellow-700 flex items-start">
                          <span className="text-yellow-500 mr-2 mt-1">•</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Overall Feedback */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-8 mb-8">
            <h3 className="text-2xl font-bold text-black mb-6">🎯 Overall Feedback</h3>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
              <div className="text-lg font-semibold text-gray-800 mb-4">
                {percentage >= 90 ? '🌟 Outstanding Performance!' :
                 percentage >= 80 ? '🎉 Excellent Work!' :
                 percentage >= 70 ? '👍 Good Job!' :
                 percentage >= 60 ? '📈 Keep Improving!' :
                 '💪 Focus on Fundamentals'}
              </div>
              <p className="text-gray-700 leading-relaxed">
                {percentage >= 80 ? 
                  'You have demonstrated strong reading comprehension skills. Continue practicing with challenging texts to maintain your performance level. Focus on time management during the actual exam.' :
                 percentage >= 60 ? 
                  'You have a good foundation but there\'s room for improvement. Focus on the skill areas where you lost points and practice regularly with timed tests.' :
                  'Your reading skills need significant development. Focus on building vocabulary, improving reading speed, and practicing different question types daily.'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/exercise/reading">
              <button className="btn-primary">Try Another Test</button>
            </Link>
            <Link href="/exercise">
              <button className="btn-secondary">Practice Other Skills</button>
            </Link>
            <button 
              onClick={() => {
                setShowResults(false);
                setAnswers({});
                setCurrentQuestion(0);
                setScore(null);
                const timeInMinutes = test.metadata?.estimatedTimeMinutes || 60;
                setTimeRemaining(timeInMinutes * 60);
              }}
              className="btn-outline"
            >
              Retake This Test
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 font-semibold bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl border-2 border-primary/20 p-4 mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-black">
                📖 {test.title} - <span className="text-primary capitalize">{test.difficulty}</span>
              </h1>
              <p className="text-gray-600">{test.metadata.totalQuestions} questions • {test.metadata.wordCount} words</p>
            </div>
            
            <div className="flex items-center gap-4">
              {!isTimerActive && (
                <button
                  onClick={startTimer}
                  className="btn-secondary"
                >
                  ⏱️ Start Timer
                </button>
              )}
              
              <div className={`text-xl font-bold px-4 py-2 rounded-lg ${
                timeRemaining < 300 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
              }`}>
                ⏰ {formatTime(timeRemaining)}
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Reading Passage */}
          <div className="bg-white rounded-xl border-2 border-primary/20 p-6">
            <h2 className="text-xl font-bold text-black mb-4 border-b border-gray-200 pb-2">
              📄 Reading Passage
            </h2>
            <div className="prose max-w-none">
              <div className="text-gray-700 leading-relaxed whitespace-pre-line text-justify">
                {test.passage}
              </div>
            </div>
          </div>

          {/* Questions Panel */}
          <div className="bg-white rounded-xl border-2 border-primary/20 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-black">
                ❓ Questions
              </h2>
              <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                {currentQuestion + 1} of {test.questions.length}
              </div>
            </div>

            {/* Question Navigation */}
            <div className="grid grid-cols-5 gap-2 mb-6">
              {test.questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestion(index)}
                  className={`p-2 text-sm font-bold rounded transition-colors ${
                    currentQuestion === index
                      ? 'bg-primary text-white'
                      : answers[test.questions[index].id]
                      ? 'bg-green-100 text-green-700 border border-green-300'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            {/* Current Question */}
            <div className="space-y-4">
              <div className="bg-primary/10 rounded-lg p-4">
                <h3 className="font-bold text-black mb-3">
                  Question {currentQuestion + 1}
                </h3>
                <p className="text-gray-700">{test.questions[currentQuestion].question}</p>
              </div>

              {renderQuestion(test.questions[currentQuestion])}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                  disabled={currentQuestion === 0}
                  className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Previous
                </button>
                
                {currentQuestion === test.questions.length - 1 ? (
                  <button
                    onClick={submitTest}
                    className="btn-primary bg-green-600 hover:bg-green-700"
                  >
                    Submit Test ✓
                  </button>
                ) : (
                  <button
                    onClick={() => setCurrentQuestion(Math.min(test.questions.length - 1, currentQuestion + 1))}
                    className="btn-primary"
                  >
                    Next →
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-xl border-2 border-primary/20 p-4 mt-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">Progress</span>
            <span className="text-sm font-medium text-gray-600">
              {Object.keys(answers).length} / {test.questions.length} answered
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${(Object.keys(answers).length / test.questions.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReadingTestPage;
