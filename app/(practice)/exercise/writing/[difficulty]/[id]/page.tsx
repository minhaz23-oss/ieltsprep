'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { getWritingTestById } from '@/lib/actions/writing.actions';
import WritingFeedback from '@/components/WritingFeedback';
import { useAuth } from '@/lib/hooks/useAuth';
import AuthNotice from '@/components/AuthNotice';
import { toast } from 'sonner';


interface PromptObject {
  description?: string;
  image?: string;
  question?: string;
}

interface WritingTest {
  id: string;
  testId?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  task1?: {
    type: string;
    title: string;
    instructions: string;
    prompt: string | PromptObject;
    wordLimit: number;
  };
  task2?: {
    type: string;
    title: string;
    instructions: string;
    prompt: string | PromptObject;
    wordLimit: number;
  };
  metadata?: {
    totalTasks: number;
    taskTypes: string[];
    estimatedTimeMinutes: number;
    task1TimeMinutes: number;
    task2TimeMinutes: number;
  };
}

interface EvaluationResult {
  task1?: {
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
  };
  task2?: {
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
  };
  overallBandScore?: number;
}

function WritingTestPage() {
  const params = useParams();
  const { difficulty, id } = params;
  const { isAuthenticated, loading: authLoading } = useAuth();

  const [test, setTest] = useState<WritingTest | null>(null);
  const [loading, setLoading] = useState(true);
  const [task1Answer, setTask1Answer] = useState('');
  const [task2Answer, setTask2Answer] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionProgress, setSubmissionProgress] = useState(0);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [timerActive, setTimerActive] = useState(false);

  // Word count helpers
  const getWordCount = (text: string) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const task1WordCount = getWordCount(task1Answer);
  const task2WordCount = getWordCount(task2Answer);

  // Timer effect
  useEffect(() => {
    if (timerActive && timeRemaining && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev && prev <= 1) {
            setTimerActive(false);
            return 0;
          }
          return prev ? prev - 1 : 0;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timerActive, timeRemaining]);

  // Format time for display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Start timer
  const startTimer = () => {
    if (test?.metadata?.estimatedTimeMinutes) {
      setTimeRemaining(test.metadata.estimatedTimeMinutes * 60);
      setTimerActive(true);
    }
  };

  // Load test data
  useEffect(() => {
    const loadTest = async () => {
      setLoading(true);
      try {
        const response = await getWritingTestById(id as string);
        if (response.success && response.data) {
          setTest(response.data);
        }
      } catch (error) {
        console.error('Error loading test:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadTest();
    }
  }, [id]);

  // Handle submission and AI evaluation
  const handleSubmit = useCallback(async () => {
    if (!test || (!task1Answer.trim() && !task2Answer.trim())) {
      alert('Please provide at least one task answer before submitting.');
      return;
    }

    if ((task1Answer.trim() && task1WordCount < 30) || (task2Answer.trim() && task2WordCount < 50)) {
      toast.warning("minimum 30 words for the first answer and 50 words for the second answer is required to justify result");
      return;
    }

    setIsSubmitting(true);
    setSubmissionProgress(0);
    setTimerActive(false);

    // Simulate progress during submission
    const progressInterval = setInterval(() => {
      setSubmissionProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90; // Stop at 90% until actual completion
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    try {
      const response = await fetch('/api/evaluate-writing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          task1Answer: task1Answer.trim() || null,
          task2Answer: task2Answer.trim() || null,
          task1Prompt: test.task1?.prompt || test.task1?.instructions || '',
          task2Prompt: test.task2?.prompt || test.task2?.instructions || '',
          taskType: `${test.task1?.type || ''} / ${test.task2?.type || ''}`
        }),
      });

      const result = await response.json();

      // Complete the progress
      setSubmissionProgress(100);
      
      // Small delay to show 100% completion
      setTimeout(() => {
        if (result.success) {
          setEvaluation({
            task1: result.results?.task1,
            task2: result.results?.task2,
            overallBandScore: result.overallBandScore
          });
          setShowResults(true);
        } else {
          alert('Error evaluating your writing: ' + (result.error || 'Unknown error'));
        }
        setIsSubmitting(false);
        setSubmissionProgress(0);
      }, 500);
      
    } catch (error) {
      console.error('Error submitting writing test:', error);
      alert('Error submitting test. Please try again.');
      setIsSubmitting(false);
      setSubmissionProgress(0);
    } finally {
      clearInterval(progressInterval);
    }
  }, [test, task1Answer, task2Answer, setTimerActive]);

  const getBandScoreColor = (score: number) => {
    if (score >= 7) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 6) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 5) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getBandScoreLabel = (score: number) => {
    if (score >= 8.5) return 'Excellent';
    if (score >= 7.5) return 'Very Good';
    if (score >= 6.5) return 'Good';
    if (score >= 5.5) return 'Competent';
    if (score >= 4.5) return 'Limited';
    return 'Poor';
  };

  if (loading) {
    return (
      <div className="min-h-screen px-[100px] py-16 font-semibold flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading writing test...</p>
        </div>
      </div>
    );
  }

  if (!test) {
    return (
      <div className="min-h-screen px-[100px] py-16 font-semibold flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Test Not Found</h2>
          <p className="text-gray-600 mb-6">The writing test you're looking for doesn't exist.</p>
          <Link href="/exercise/writing" className="btn-primary">
            Back to Writing Tests
          </Link>
        </div>
      </div>
    );
  }

  if (showResults && evaluation) {
    return (
      <div className="min-h-screen px-[100px] py-16 font-semibold">
        {/* Back Button */}
        <div className="mb-8">
          <Link href="/exercise/writing" className="text-primary hover:text-red-700 flex items-center space-x-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Writing Tests</span>
          </Link>
        </div>

        {/* Results Header */}
        <div className="text-center mb-12">
          <h1 className="text-[50px] font-black mb-4">
            Your IELTS{" "}
            <span className="p-1 px-2 bg-primary rounded-md text-white -rotate-3 inline-block">Writing</span>{" "}
            Results!
          </h1>
        </div>

        {/* Use WritingFeedback Component */}
        <WritingFeedback 
          task1={evaluation.task1}
          task2={evaluation.task2}
          overallBandScore={evaluation.overallBandScore}
        />

        {/* Action Buttons */}
        <div className="flex justify-center gap-4 mt-12">
          <button
            onClick={() => {
              setShowResults(false);
              setEvaluation(null);
              setTask1Answer('');
              setTask2Answer('');
            }}
            className="btn-secondary"
          >
            Try Again
          </button>
          <Link href="/exercise/writing" className="btn-primary">
            More Writing Tests
          </Link>
        </div>

        {/* Authentication Notice for Unauthenticated Users */}
        {!authLoading && !isAuthenticated && (
          <div className="mt-8">
            <AuthNotice testType="writing" hasAI={true} />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen px-[100px] py-16 font-semibold">
      {/* Back Button */}
      <div className="mb-8">
        <Link href="/exercise/writing" className="text-primary hover:text-red-700 flex items-center space-x-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back to Writing Tests</span>
        </Link>
      </div>

      {/* Test Header */}
      <div className="text-center mb-8">
        <h1 className="text-[50px] font-black">
          IELTS Writing Test{" "}
          <span className="p-1 px-2 bg-primary rounded-md text-white -rotate-3 inline-block">#{test.testId}</span>
        </h1>
        <div className="flex justify-center items-center gap-6 mt-4">
          <div className={`px-3 py-1 rounded-full text-sm font-bold border capitalize ${
            test.difficulty === 'easy' ? 'bg-green-100 text-green-800 border-green-200' :
            test.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
            'bg-red-100 text-red-800 border-red-200'
          }`}>
            {test.difficulty} Level
          </div>
          
          {timeRemaining !== null && (
            <div className={`px-4 py-2 rounded-lg font-bold ${
              timeRemaining <= 300 ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
            }`}>
              ⏰ {formatTime(timeRemaining)}
            </div>
          )}
          
          {!timerActive && timeRemaining === null && (
            <button
              onClick={startTimer}
              className="px-4 py-2 bg-green-100 text-green-800 rounded-lg font-bold hover:bg-green-200 transition-colors"
            >
              Start Timer ({test.metadata?.estimatedTimeMinutes || 60} min)
            </button>
          )}
        </div>
      </div>

      {/* Tasks */}
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Task 1 */}
        {test.task1 && (
          <div className="bg-white rounded-xl border-2 border-blue-200 p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-blue-800">Task 1</h2>
              <div className="text-sm text-blue-600 font-semibold">
                Target: {test.task1.wordLimit || 150}+ words | Current: {task1WordCount} words
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-2">{test.task1.title}</h3>
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <p className="text-blue-800 font-semibold">{test.task1.instructions}</p>
                {test.task1.prompt && (
                  <div className="mt-4 p-4 bg-white rounded-lg border border-blue-200">
                    {typeof test.task1.prompt === 'string' ? (
                      <p className="text-gray-700">{test.task1.prompt}</p>
                    ) : (
                      <div className="space-y-3">
                        {test.task1.prompt && typeof test.task1.prompt !== 'string' && test.task1.prompt.description && (
                          <p className="text-gray-700 leading-relaxed">{test.task1.prompt.description}</p>
                        )}
                        {test.task1.prompt && typeof test.task1.prompt !== 'string' && test.task1.prompt.image && (
                          <div className="mt-4 flex justify-center">
                            <div 
                              className="relative group cursor-pointer"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                // Add click to view full size functionality
                                const imgSrc = test.task1?.prompt && typeof test.task1.prompt !== 'string' ? test.task1.prompt.image : undefined;
                                if (!imgSrc) return;
                                
                                const overlay = document.createElement('div');
                                overlay.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4';
                                overlay.style.zIndex = '9999';
                                overlay.innerHTML = `
                                  <div class="relative max-w-full max-h-full flex items-center justify-center">
                                    <img src="${imgSrc}" class="max-w-full max-h-full object-contain rounded-lg shadow-2xl" alt="Task 1 Image" />
                                    <button class="absolute top-4 right-4 text-white bg-black bg-opacity-70 hover:bg-opacity-90 rounded-full w-10 h-10 flex items-center justify-center transition-all text-xl font-bold">
                                      ×
                                    </button>
                                    <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-black bg-opacity-50 px-4 py-2 rounded text-sm">
                                      Click anywhere to close
                                    </div>
                                  </div>
                                `;
                                document.body.appendChild(overlay);
                                document.body.style.overflow = 'hidden';
                                
                                // Close on click anywhere
                                overlay.addEventListener('click', (e) => {
                                  e.preventDefault();
                                  if (document.body.contains(overlay)) {
                                    document.body.removeChild(overlay);
                                    document.body.style.overflow = 'auto';
                                  }
                                });
                                
                                // Close on escape key
                                const handleEscape = (e: KeyboardEvent) => {
                                  if (e.key === 'Escape' && document.body.contains(overlay)) {
                                    document.body.removeChild(overlay);
                                    document.body.style.overflow = 'auto';
                                    document.removeEventListener('keydown', handleEscape);
                                  }
                                };
                                document.addEventListener('keydown', handleEscape);
                              }}
                            >
                              <img 
                                src={test.task1?.prompt && typeof test.task1.prompt !== 'string' ? test.task1.prompt.image : ''}
                                alt={`Task 1 ${test.task1?.type || 'Writing'} chart`}
                                className="w-auto h-auto max-w-2xl max-h-96 rounded-lg border border-gray-200 shadow-md group-hover:shadow-lg transition-shadow duration-300"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const errorDiv = document.createElement('div');
                                  errorDiv.className = 'bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center max-w-2xl';
                                  const imgSrc = test.task1?.prompt && typeof test.task1.prompt !== 'string' ? test.task1.prompt.image : 'Unknown';
                                  errorDiv.innerHTML = `
                                    <div class="text-gray-400 mb-2">
                                      <svg class="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                                      </svg>
                                    </div>
                                    <p class="text-sm text-gray-500">
                                      Chart/Image: ${imgSrc}<br>
                                      <span class="text-xs">(Image will be available in the actual test)</span>
                                    </p>
                                  `;
                                  target.parentNode?.insertBefore(errorDiv, target);
                                }}
                              />
                              <div className="absolute inset-0 bg-blue-500 bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-opacity duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                                <span className="text-white bg-black bg-opacity-70 px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                                  🔍 Click to enlarge
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                        {test.task1.prompt && typeof test.task1.prompt !== 'string' && test.task1.prompt.question && (
                          <div className="mt-3 p-3 bg-blue-50 rounded border-l-4 border-blue-400">
                            <p className="text-gray-700 italic">{test.task1.prompt.question}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <textarea
              value={task1Answer}
              onChange={(e) => setTask1Answer(e.target.value)}
              placeholder="Write your Task 1 response here..."
              className="w-full h-64 p-4 border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:outline-none resize-none"
              disabled={isSubmitting}
            />
          </div>
        )}

        {/* Task 2 */}
        {test.task2 && (
          <div className="bg-white rounded-xl border-2 border-green-200 p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-green-800">Task 2</h2>
              <div className="text-sm text-green-600 font-semibold">
                Target: {test.task2.wordLimit || 250}+ words | Current: {task2WordCount} words
              </div>
            </div>
            
            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-2">{test.task2.title}</h3>
              <div className="bg-green-50 rounded-lg p-4 mb-4">
                <p className="text-green-800 font-semibold">{test.task2.instructions}</p>
                {test.task2.prompt && (
                  <div className="mt-4 p-4 bg-white rounded-lg border border-green-200">
                    {typeof test.task2.prompt === 'string' ? (
                      <p className="text-gray-700">{test.task2.prompt}</p>
                    ) : (
                      <div className="space-y-3">
                        {test.task2.prompt && typeof test.task2.prompt !== 'string' && test.task2.prompt.description && (
                          <p className="text-gray-700 leading-relaxed">{test.task2.prompt.description}</p>
                        )}
                        {test.task2.prompt && typeof test.task2.prompt !== 'string' && test.task2.prompt.question && (
                          <div className="mt-3 p-4 bg-green-50 rounded-lg border-l-4 border-green-400">
                            <p className="text-gray-800 font-medium leading-relaxed">{test.task2.prompt.question}</p>
                          </div>
                        )}
                        {test.task2.prompt && typeof test.task2.prompt !== 'string' && test.task2.prompt.image && (
                          <div className="mt-4 flex justify-center">
                            <div 
                              className="relative group cursor-pointer"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                // Add click to view full size functionality
                                const imgSrc = test.task2?.prompt && typeof test.task2.prompt !== 'string' ? test.task2.prompt.image : undefined;
                                if (!imgSrc) return;
                                const overlay = document.createElement('div');
                                overlay.className = 'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4';
                                overlay.style.zIndex = '9999';
                                overlay.innerHTML = `
                                  <div class="relative max-w-full max-h-full flex items-center justify-center">
                                    <img src="${imgSrc}" class="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
                                    <button class="absolute top-4 right-4 text-white bg-black bg-opacity-70 hover:bg-opacity-90 rounded-full w-10 h-10 flex items-center justify-center transition-all text-xl font-bold">
                                      ×
                                    </button>
                                    <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-black bg-opacity-50 px-4 py-2 rounded text-sm">
                                      Click anywhere to close
                                    </div>
                                  </div>
                                `;
                                document.body.appendChild(overlay);
                                document.body.style.overflow = 'hidden';
                                
                                // Close on click anywhere
                                overlay.addEventListener('click', (e) => {
                                  e.preventDefault();
                                  document.body.removeChild(overlay);
                                  document.body.style.overflow = 'auto';
                                });
                                
                                // Close on escape key
                                const handleEscape = (e: KeyboardEvent) => {
                                  if (e.key === 'Escape') {
                                    document.body.removeChild(overlay);
                                    document.body.style.overflow = 'auto';
                                    document.removeEventListener('keydown', handleEscape);
                                  }
                                };
                                document.addEventListener('keydown', handleEscape);
                              }}
                            >
                              <img 
                                src={test.task2?.prompt && typeof test.task2.prompt !== 'string' ? test.task2.prompt.image : ''} 
                                alt={`Task 2 ${test.task2?.type || 'Writing'} image`}
                                className="w-auto h-auto max-w-2xl max-h-96 rounded-lg border border-gray-200 shadow-md group-hover:shadow-lg transition-shadow duration-300"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.style.display = 'none';
                                  const errorDiv = document.createElement('div');
                                  errorDiv.className = 'bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center max-w-2xl';
                                  const imgSrc2 = test.task2?.prompt && typeof test.task2.prompt !== 'string' ? test.task2.prompt.image : 'Unknown';
                                  errorDiv.innerHTML = `
                                    <div class="text-gray-400 mb-2">
                                      <svg class="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                                        <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                                      </svg>
                                    </div>
                                    <p class="text-sm text-gray-500">
                                      Image: ${imgSrc2}<br>
                                      <span class="text-xs">(Image will be available in the actual test)</span>
                                    </p>
                                  `;
                                  target.parentNode?.insertBefore(errorDiv, target);
                                }}
                              />
                              <div className="absolute inset-0 bg-green-500 bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-opacity duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 pointer-events-none">
                                <span className="text-white bg-black bg-opacity-70 px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                                  🔍 Click to enlarge
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <textarea
              value={task2Answer}
              onChange={(e) => setTask2Answer(e.target.value)}
              placeholder="Write your Task 2 response here..."
              className="w-full h-80 p-4 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none resize-none"
              disabled={isSubmitting}
            />
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="text-center mt-12">
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || (!task1Answer.trim() && !task2Answer.trim())}
          className={`px-8 py-4 rounded-lg font-bold text-white text-lg transition-all ${
            isSubmitting || (!task1Answer.trim() && !task2Answer.trim())
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-primary hover:bg-red-700 hover:shadow-lg'
          }`}
        >
          {isSubmitting ? (
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                <span>Evaluating with AI... {Math.round(submissionProgress)}%</span>
              </div>
              {/* Progress Bar */}
              <div className="w-64 bg-white/20 rounded-full h-2">
                <div 
                  className="bg-white h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${submissionProgress}%` }}
                ></div>
              </div>
            </div>
          ) : (
            'Submit for AI Evaluation'
          )}
        </button>
        
        <p className="text-gray-600 mt-4">
          Your writing will be evaluated by advanced AI using official IELTS criteria
        </p>
      </div>

      {/* Warning for time */}
      {timeRemaining !== null && timeRemaining <= 300 && (
        <div className="fixed top-4 right-4 bg-red-100 border-2 border-red-200 rounded-lg p-4 shadow-lg">
          <div className="flex items-center text-red-800">
            <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <div className="font-bold">Time Running Out!</div>
              <div className="text-sm">{formatTime(timeRemaining)} remaining</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WritingTestPage;
