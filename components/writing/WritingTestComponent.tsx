"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface WritingTestComponentProps {
  testId: string;
  mode?: 'exercise' | 'mockTest';
  onComplete?: (results: { task1Response: string; task2Response: string; bandScore: number; task1Score: number; task2Score: number }) => void;
  backLink?: string;
}

interface WritingImage {
  url: string;
  altText: string;
}

interface WritingTask {
  taskNumber: number;
  timeAllocation: string;
  instructions: string;
  description?: string;
  hasImage: boolean;
  images: WritingImage[];
  minimumWords: number;
  taskRequirements: string;
  promptIntro?: string;
  topic?: string;
  requirements?: string[];
}

interface WritingTestData {
  testTitle: string;
  testType: string;
  tasks: WritingTask[];
}

const WritingTestComponent: React.FC<WritingTestComponentProps> = ({ testId, mode = 'exercise', onComplete, backLink = '/exercise/writing' }) => {
  const router = useRouter();
  
  const [testData, setTestData] = useState<WritingTestData | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [wordCounts, setWordCounts] = useState<Record<number, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadTestData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch from Firestore via writing actions
        const { getWritingTestById } = await import('@/lib/actions/writing.actions');
        const result = await getWritingTestById(testId);
        
        if (!result.success || !result.data) {
          throw new Error(result.message || 'Failed to load test data');
        }

        const data = result.data as unknown as WritingTestData;

        if (!data.tasks || !Array.isArray(data.tasks) || data.tasks.length === 0) {
          throw new Error('Invalid test data: missing or empty tasks');
        }

        setTestData(data);
        
        // Initialize answers and word counts
        const initialAnswers: Record<number, string> = {};
        const initialWordCounts: Record<number, number> = {};
        data.tasks.forEach(task => {
          initialAnswers[task.taskNumber] = '';
          initialWordCounts[task.taskNumber] = 0;
        });
        setAnswers(initialAnswers);
        setWordCounts(initialWordCounts);

      } catch (err) {
        console.error('Error loading test data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load test');
        setTestData(null);
      } finally {
        setLoading(false);
      }
    };

    if (testId) {
      loadTestData();
    }
  }, [testId]);

  const countWords = (text: string): number => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const handleAnswerChange = (taskNumber: number, text: string) => {
    setAnswers(prev => ({ ...prev, [taskNumber]: text }));
    setWordCounts(prev => ({ ...prev, [taskNumber]: countWords(text) }));
  };

  const handleSubmit = () => {
    // Check if user has written anything
    const hasTask1Content = (answers[1] || '').trim().length > 0;
    const hasTask2Content = (answers[2] || '').trim().length > 0;
    
    if (!hasTask1Content && !hasTask2Content) {
      alert('⚠️ You must write something for at least one task before submitting.');
      return;
    }
    
    setShowSubmitConfirm(true);
  };

  const confirmSubmit = async () => {
    if (!testData) return;
    
    // Validate that at least some content exists
    const task1Answer = (answers[1] || '').trim();
    const task2Answer = (answers[2] || '').trim();
    
    if (!task1Answer && !task2Answer) {
      alert('⚠️ You must write something for at least one task before submitting.');
      setShowSubmitConfirm(false);
      return;
    }
    
    try {
      setSubmitting(true);
      setShowSubmitConfirm(false);

      // Get premium status
      const { getPremiumStatus } = await import('@/lib/utils/premium');
      const { isPremium } = await getPremiumStatus();

      // Prepare task prompts
      const task1 = testData.tasks.find(t => t.taskNumber === 1);
      const task2 = testData.tasks.find(t => t.taskNumber === 2);

      const task1Prompt = task1 ? (task1.description || task1.topic || '') : '';
      const task2Prompt = task2 ? (task2.topic || '') : '';

      // Call AI evaluation API
      const evaluationResponse = await fetch('/api/evaluate-writing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          task1Answer: task1Answer || '',
          task2Answer: task2Answer || '',
          task1Prompt,
          task2Prompt,
          isPremium
        })
      });

      const evaluationData = await evaluationResponse.json();

      if (!evaluationData.success) {
        throw new Error(evaluationData.message || 'Evaluation failed');
      }

      // Save results to Firestore
      const { saveWritingTestResult } = await import('@/lib/actions/test-results.actions');
      await saveWritingTestResult({
        testId,
        difficulty: 'standard',
        task1Answer: task1Answer,
        task2Answer: task2Answer,
        evaluation: evaluationData.results,
        timeSpent: 3600, // 60 minutes in seconds
        overallBandScore: evaluationData.overallBandScore
      });

      // If in mock test mode, call onComplete callback
      if (mode === 'mockTest' && onComplete) {
        onComplete({
          task1Response: task1Answer || '',
          task2Response: task2Answer || '',
          bandScore: evaluationData.overallBandScore || 0,
          task1Score: evaluationData.results?.task1?.bandScore || 0,
          task2Score: evaluationData.results?.task2?.bandScore || 0
        });
        // Don't set submitting to false - let parent page handle transition
        // The parent will unmount this component and show SectionTransition
        return;
      }

      // Navigate to results page with evaluation data (exercise mode)
      sessionStorage.setItem('writingEvaluation', JSON.stringify({
        results: evaluationData.results,
        overallBandScore: evaluationData.overallBandScore,
        isPremium: evaluationData.isPremium,
        testTitle: testData.testTitle,
        testId
      }));

      router.push(`/exercise/writing/${testId}/results`);

    } catch (error) {
      console.error('Error submitting writing test:', error);
      alert('Failed to submit test. Please try again.');
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading IELTS Writing Test...</p>
        </div>
      </div>
    );
  }

  if (error || !testData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 max-w-md text-center border-2 border-red-300">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error || 'Failed to load test data'}</p>
          <Link href={backLink} className="bg-primary text-white px-6 py-2 rounded hover:bg-red-700">
            Back to Tests
          </Link>
        </div>
      </div>
    );
  }

  const getWordCountColor = (taskNumber: number, minimumWords: number): string => {
    const count = wordCounts[taskNumber] || 0;
    if (count === 0) return 'text-gray-500';
    if (count < minimumWords) return 'text-red-600';
    if (count < minimumWords + 20) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href={backLink} className="text-primary hover:text-red-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">{testData.testTitle}</h1>
                <p className="text-sm text-gray-600 capitalize">{testData.testType}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Test Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Important Notice */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex items-start">
            <svg className="w-6 h-6 text-blue-600 mr-3 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <h3 className="text-lg font-bold text-blue-800 mb-2">Writing Test Instructions</h3>
              <ul className="text-blue-700 space-y-1 text-sm">
                <li>• Complete both tasks in the order presented</li>
                <li>• Task 1 should be at least 150 words (20 minutes recommended)</li>
                <li>• Task 2 should be at least 250 words (40 minutes recommended)</li>
                <li>• Task 2 carries more weight in marking (66% of total score)</li>
                <li>• Write in a formal, academic style</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Tasks */}
        {testData.tasks.map((task, index) => (
          <div key={task.taskNumber} className="mb-12">
            <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
              {/* Task Header */}
              <div className="bg-primary/10 border-b-2 border-primary/20 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-primary mb-2">
                      Writing Task {task.taskNumber}
                    </h2>
                    <p className="text-gray-700 font-semibold">{task.instructions}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600 font-semibold">Time Allocation</div>
                    <div className="text-lg font-bold text-primary">{task.timeAllocation}</div>
                  </div>
                </div>
              </div>

              {/* Task Content */}
              <div className="p-6">
                {/* Task 1 specific content */}
                {task.taskNumber === 1 && task.description && (
                  <div className="mb-6">
                    <p className="text-gray-700 font-semibold mb-4">{task.description}</p>
                    
                    {task.hasImage && task.images && task.images.length > 0 && (
                      <div className="my-6 space-y-4">
                        {task.images.map((image, idx) => (
                          <div key={idx} className="border-2 border-gray-300 rounded-lg p-4 bg-gray-50">
                            <img
                              src={image.url}
                              alt={image.altText || `Task visual ${idx + 1}`}
                              className="max-w-full h-auto mx-auto rounded-lg"
                              style={{ maxHeight: '500px' }}
                              onError={(e) => {
                                console.error('Failed to load image:', image.url);
                                e.currentTarget.style.display = 'none';
                              }}
                            />
                            {task.images.length > 1 && (
                              <p className="text-center text-sm text-gray-600 mt-2">
                                Image {idx + 1} of {task.images.length}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    
                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm font-semibold text-yellow-800">
                        Summarize the information by selecting and reporting the main features, 
                        and make comparisons where relevant.
                      </p>
                    </div>
                  </div>
                )}

                {/* Task 2 specific content */}
                {task.taskNumber === 2 && (
                  <div className="mb-6">
                    {task.promptIntro && (
                      <p className="text-gray-700 font-semibold mb-3">{task.promptIntro}</p>
                    )}
                    
                    {task.topic && (
                      <div className="p-4 bg-gray-100 border-l-4 border-primary rounded-r-lg mb-4">
                        <p className="text-gray-800 font-semibold text-lg">{task.topic}</p>
                      </div>
                    )}
                    
                    {task.requirements && task.requirements.length > 0 && (
                      <div className="space-y-2 mb-4">
                        {task.requirements.map((req, idx) => (
                          <p key={idx} className="text-gray-700">{req}</p>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Word count requirement */}
                <div className="mb-4">
                  <p className="text-sm font-bold text-gray-700">{task.taskRequirements}</p>
                </div>

                {/* Writing area */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-semibold text-gray-700">
                      Your Answer:
                    </label>
                    <div className={`text-sm font-bold ${getWordCountColor(task.taskNumber, task.minimumWords)}`}>
                      Word count: {wordCounts[task.taskNumber] || 0} / {task.minimumWords} minimum
                      {wordCounts[task.taskNumber] < task.minimumWords && wordCounts[task.taskNumber] > 0 && (
                        <span className="ml-2 text-xs">
                          ({task.minimumWords - wordCounts[task.taskNumber]} more needed)
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <textarea
                    className="w-full border-2 border-gray-300 rounded-lg p-4 font-sans text-base leading-relaxed focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[400px]"
                    value={answers[task.taskNumber] || ''}
                    onChange={(e) => handleAnswerChange(task.taskNumber, e.target.value)}
                    placeholder={`Start writing your answer for Task ${task.taskNumber} here...`}
                  />
                </div>

                {/* Progress indicator */}
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        wordCounts[task.taskNumber] >= task.minimumWords 
                          ? 'bg-green-500' 
                          : 'bg-yellow-500'
                      }`}
                      style={{ 
                        width: `${Math.min(100, (wordCounts[task.taskNumber] / task.minimumWords) * 100)}%` 
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Submit Button */}
        <div className="text-center mt-12 mb-8">
          <button
            onClick={handleSubmit}
            className="bg-green-600 text-white text-lg px-12 py-4 rounded-lg hover:bg-green-700 font-semibold shadow-lg transition-all duration-300 hover:shadow-xl"
          >
            Submit Writing Test
          </button>
          <p className="text-sm text-gray-500 mt-3">
            Make sure you've completed both tasks before submitting
          </p>
        </div>

        {/* Writing Tips Section */}
        <div className="mt-16 space-y-8">
          {/* Task 1 Tips */}
          <div className="bg-white rounded-lg p-8 border-2 border-blue-200">
            <h2 className="text-2xl font-bold text-blue-800 mb-6 flex items-center">
              <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
              Task 1 Writing Tips
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-lg mb-3 text-blue-700">Structure</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Introduction: Paraphrase the question</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Overview: Summarize main trends/features</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Body: Describe details with data</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-3 text-blue-700">Key Points</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Use appropriate vocabulary for describing trends</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Compare and contrast where relevant</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Don't give opinions or speculate</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Task 2 Tips */}
          <div className="bg-white rounded-lg p-8 border-2 border-green-200">
            <h2 className="text-2xl font-bold text-green-800 mb-6 flex items-center">
              <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 13V5a2 2 0 00-2-2H4a2 2 0 00-2 2v8a2 2 0 002 2h3l3 3 3-3h3a2 2 0 002-2zM5 7a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm1 3a1 1 0 100 2h3a1 1 0 100-2H6z" clipRule="evenodd" />
              </svg>
              Task 2 Writing Tips
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-lg mb-3 text-green-700">Essay Structure</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Introduction with clear position</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>2-3 body paragraphs with examples</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Conclusion restating your position</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-3 text-green-700">Content Tips</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Answer all parts of the question</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Support ideas with relevant examples</span>
                  </li>
                  <li className="flex items-start">
                    <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                    <span>Use cohesive devices effectively</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Assessment Criteria */}
          <div className="bg-white rounded-lg p-8 border-2 border-purple-200">
            <h2 className="text-2xl font-bold text-purple-800 mb-6 flex items-center">
              <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              IELTS Writing Assessment Criteria
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold text-purple-800 mb-2">Task Achievement / Response</h4>
                  <p className="text-sm text-gray-700">Answer all parts of the question fully and relevantly</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold text-purple-800 mb-2">Coherence and Cohesion</h4>
                  <p className="text-sm text-gray-700">Organize ideas logically with clear progression</p>
                </div>
              </div>
              <div className="space-y-4">
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold text-purple-800 mb-2">Lexical Resource</h4>
                  <p className="text-sm text-gray-700">Use a wide range of vocabulary accurately</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <h4 className="font-semibold text-purple-800 mb-2">Grammatical Range and Accuracy</h4>
                  <p className="text-sm text-gray-700">Use varied sentence structures with few errors</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-4">Submit Your Writing?</h3>
            
            {/* Warning for empty or very short answers */}
            {(wordCounts[1] === 0 || wordCounts[2] === 0 || 
              wordCounts[1] < testData.tasks.find(t => t.taskNumber === 1)!.minimumWords || 
              wordCounts[2] < testData.tasks.find(t => t.taskNumber === 2)!.minimumWords) && (
              <div className="mb-4 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-sm font-semibold text-yellow-800 mb-1">Warning:</p>
                    <p className="text-xs text-yellow-700">
                      {wordCounts[1] === 0 && wordCounts[2] === 0 
                        ? 'Both tasks are empty. Your score will be very low.'
                        : (wordCounts[1] === 0 || wordCounts[2] === 0)
                        ? 'One task is empty. This will significantly affect your score.'
                        : 'One or both tasks are below the minimum word count. This may affect your score.'}
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-3 mb-6">
              {testData.tasks.map(task => (
                <div key={task.taskNumber} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <span className="font-semibold">Task {task.taskNumber}:</span>
                  <span className={`font-bold ${
                    wordCounts[task.taskNumber] === 0
                      ? 'text-red-600'
                      : wordCounts[task.taskNumber] >= task.minimumWords 
                      ? 'text-green-600' 
                      : 'text-yellow-600'
                  }`}>
                    {wordCounts[task.taskNumber] === 0 ? 'Empty' : `${wordCounts[task.taskNumber]} words`}
                    {wordCounts[task.taskNumber] > 0 && wordCounts[task.taskNumber] < task.minimumWords && (
                      <span className="text-xs ml-1">(minimum: {task.minimumWords})</span>
                    )}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowSubmitConfirm(false)}
                className="flex-1 bg-gray-300 text-gray-800 px-6 py-3 rounded-lg hover:bg-gray-400 font-semibold"
              >
                Continue Writing
              </button>
              <button
                onClick={confirmSubmit}
                className="flex-1 bg-primary text-white px-6 py-3 rounded-lg hover:bg-red-700 font-semibold"
              >
                Submit Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Submitting Loading Overlay */}
      {submitting && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-4"></div>
            <h3 className="text-2xl font-bold mb-2">Evaluating Your Writing</h3>
            <p className="text-gray-600 mb-4">
              Our AI is analyzing your writing using IELTS assessment criteria...
            </p>
            <div className="space-y-2 text-sm text-gray-500">
              <p>✓ Checking Task Achievement/Response</p>
              <p>✓ Analyzing Coherence & Cohesion</p>
              <p>✓ Evaluating Lexical Resource</p>
              <p>✓ Assessing Grammatical Range</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WritingTestComponent;