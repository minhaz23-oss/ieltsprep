'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getWritingTests } from '@/lib/actions/writing.actions';

interface WritingTest {
  id: string;
  testId?: number;
  difficulty?: 'easy' | 'medium' | 'hard';
  task1?: {
    type: string;
    title: string;
    instructions: string;
    prompt: any;
    wordLimit: number;
  };
  task2?: {
    type: string;
    title: string;
    instructions: string;
    prompt: any;
    wordLimit: number;
  };
  metadata?: {
    totalTasks: number;
    taskTypes: string[];
    estimatedTimeMinutes: number;
    task1TimeMinutes: number;
    task2TimeMinutes: number;
  };
  [key: string]: any; // Allow additional properties from Firestore
}

function WritingPage() {
  const [writingTests, setWritingTests] = useState<WritingTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');

  const filteredTests = activeTab === 'all' 
    ? writingTests 
    : writingTests.filter(test => test.difficulty === activeTab);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'hard': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return (
          <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'medium':
        return (
          <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'hard':
        return (
          <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getTaskTypeIcon = (taskType: string) => {
    if (taskType.includes('chart') || taskType.includes('graph')) {
      return '📊';
    } else if (taskType.includes('table')) {
      return '📋';
    } else if (taskType.includes('process')) {
      return '🔄';
    } else if (taskType.includes('map')) {
      return '🗺️';
    } else if (taskType.includes('mixed')) {
      return '📈';
    } else if (taskType.includes('opinion')) {
      return '💭';
    } else if (taskType.includes('discussion')) {
      return '🤝';
    } else if (taskType.includes('problem')) {
      return '🎯';
    } else if (taskType.includes('advantages')) {
      return '⚖️';
    } else if (taskType.includes('double')) {
      return '❓';
    }
    return '✍️';
  };

  const groupedTests = {
    easy: writingTests.filter(test => test.difficulty === 'easy'),
    medium: writingTests.filter(test => test.difficulty === 'medium'),
    hard: writingTests.filter(test => test.difficulty === 'hard'),
  };

  const totalTests = writingTests.length;
  const easyCount = groupedTests.easy.length;
  const mediumCount = groupedTests.medium.length;
  const hardCount = groupedTests.hard.length;

  // Process the data to ensure it's safe for rendering
  const processWritingTest = (test: any): WritingTest | null => {
    // Skip metadata document
    if (test.id === '_metadata' || !test.difficulty) {
      return null;
    }

    return {
      id: String(test.id || ''),
      testId: typeof test.testId === 'number' ? test.testId : undefined,
      difficulty: ['easy', 'medium', 'hard'].includes(test.difficulty) ? test.difficulty : undefined,
      task1: test.task1,
      task2: test.task2,
      metadata: test.metadata,
    };
  };

  // Load writing tests on component mount
  useEffect(() => {
    const loadWritingTests = async () => {
      setLoading(true);
      try {
        const response = await getWritingTests();
        setSuccess(response.success);
        setMessage(response.message);
        
        if (response.success && Array.isArray(response.data)) {
          const processedTests = response.data
            .map(processWritingTest)
            .filter((test): test is WritingTest => test !== null); // Filter out null values (metadata)
          setWritingTests(processedTests);
        } else {
          setWritingTests([]);
        }
      } catch (error) {
        console.error('Error loading writing tests:', error);
        setSuccess(false);
        setMessage('Failed to load writing tests');
        setWritingTests([]);
      } finally {
        setLoading(false);
      }
    };

    loadWritingTests();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen px-[100px] py-16 font-semibold flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading writing tests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-[100px] py-16 font-semibold">
      {/* Back Button */}
      <div className="mb-8">
        <Link href="/exercise" className="text-primary hover:text-red-700 flex items-center space-x-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back to Exercises</span>
        </Link>
      </div>

      {/* Hero Section - Homepage Style */}
      <div className="text-center mb-12">
        <h1 className="text-[50px] font-black">
          Master IELTS{" "}
          <span className="p-1 px-2 bg-primary rounded-md text-white -rotate-3 inline-block">Writing</span>{" "}
          Tests!
        </h1>
        <p className="mt-3 leading-none text-center max-w-lg sm:text-xl/relaxed text-gray-600 font-semibold mx-auto">
          {!success ? message : 
           totalTests > 0 
           ? `Practice with ${totalTests} carefully designed writing tests across all difficulty levels to boost your IELTS score.`
           : 'Writing tests will be available soon. Check back later!'}
        </p>
      </div>

      {!success ? (
        // Error State
        <div className="text-center py-16">
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8 max-w-2xl mx-auto">
            <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h2 className="text-2xl font-bold text-red-800 mb-2">Unable to Load Writing Tests</h2>
            <p className="text-red-600">{message}</p>
          </div>
        </div>
      ) : totalTests === 0 ? (
        // Empty State
        <div className="text-center py-16">
          <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-8 max-w-2xl mx-auto">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No Writing Tests Available</h2>
            <p className="text-gray-600">Check back later for new writing practice tests!</p>
          </div>
        </div>
      ) : (
        <>
          {/* Tabs */}
          <div className="flex justify-center mb-8">
            <div className="flex bg-white rounded-xl border-2 border-primary/20 p-2">
              {[
                { id: 'all', label: 'All Practice', count: totalTests },
                { id: 'easy', label: 'Easy', count: easyCount },
                { id: 'medium', label: 'Medium', count: mediumCount },
                { id: 'hard', label: 'Hard', count: hardCount }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-6 py-3 rounded-lg font-bold cursor-pointer transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-primary text-white shadow-lg'
                      : 'text-gray-600 hover:text-primary hover:bg-primary/5'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>
          </div>

          {/* Tests Grid */}
          {filteredTests.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-8 max-w-md mx-auto">
                <h3 className="text-xl font-bold text-gray-800 mb-2">No {activeTab === 'all' ? '' : activeTab} tests available</h3>
                <p className="text-gray-600">Try selecting a different difficulty level.</p>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
              {filteredTests.map((test) => (
                <Link
                  key={test.id}
                  href={`/exercise/writing/${test.difficulty}/${test.id}`}
                  className="group"
                >
                  <div className="bg-white rounded-xl border-2 border-primary/20 hover:border-primary hover:shadow-xl transition-all duration-300 p-6 h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getDifficultyColor(test.difficulty || 'unknown')}`}>
                        {(test.difficulty || 'UNKNOWN').toUpperCase()}
                      </div>
                      <div className="text-sm text-gray-400">Test #{test.testId || 'N/A'}</div>
                    </div>

                    <h3 className="text-xl font-bold text-black mb-3 group-hover:text-primary transition-colors">
                      IELTS Writing Test {test.testId || 'Practice'}
                    </h3>
                    
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      Complete Task 1 and Task 2 writing exercises designed to match real IELTS exam standards.
                    </p>

                    {/* Task Information */}
                    <div className="space-y-3 mb-6">
                      {test.task1 && (
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{getTaskTypeIcon(test.task1.type)}</span>
                            <span className="text-gray-600">Task 1:</span>
                            <span className="font-semibold text-gray-800 capitalize">{test.task1.type.replace('_', ' ')}</span>
                          </div>
                          <span className="text-xs text-gray-500">150+ words</span>
                        </div>
                      )}
                      
                      {test.task2 && (
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{getTaskTypeIcon(test.task2.type)}</span>
                            <span className="text-gray-600">Task 2:</span>
                            <span className="font-semibold text-gray-800 capitalize">{test.task2.type.replace('_', ' ')}</span>
                          </div>
                          <span className="text-xs text-gray-500">250+ words</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
                      <div className="flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        <span>{test.metadata?.estimatedTimeMinutes || 60} min</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                        <span>{test.metadata?.totalTasks || 2} tasks</span>
                      </div>
                    </div>

                    <button className="btn-primary w-full group-hover:bg-red-700 transition-colors duration-300">
                      Start Writing Practice
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </>
      )}

      {/* Footer Section with Instructions and Navigation */}
      <section className="mt-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 border-2 border-gray-200">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 mb-4">
              ✍️ How to Excel in IELTS Writing
            </h2>
            <p className="text-lg text-gray-600 font-semibold">
              Master both Task 1 and Task 2 with these proven strategies and tips
            </p>
          </div>

          {/* Instructions Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {/* Task 1 Strategy */}
            <div className="bg-white rounded-xl p-6 border-2 border-blue-100 hover:border-blue-300 transition-colors">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Task 1 Strategy</h3>
              </div>
              <ul className="text-gray-600 space-y-2">
                <li>• Analyze the visual data carefully</li>
                <li>• Write 150+ words (aim for 170-190)</li>
                <li>• Use varied vocabulary for data</li>
                <li>• Include overview paragraph</li>
              </ul>
            </div>

            {/* Task 2 Strategy */}
            <div className="bg-white rounded-xl p-6 border-2 border-green-100 hover:border-green-300 transition-colors">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Task 2 Strategy</h3>
              </div>
              <ul className="text-gray-600 space-y-2">
                <li>• Write 250+ words (aim for 270-290)</li>
                <li>• Plan your essay structure</li>
                <li>• Use linking words effectively</li>
                <li>• Support ideas with examples</li>
              </ul>
            </div>

            {/* Time Management */}
            <div className="bg-white rounded-xl p-6 border-2 border-purple-100 hover:border-purple-300 transition-colors">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Time Management</h3>
              </div>
              <ul className="text-gray-600 space-y-2">
                <li>• Task 1: 20 minutes maximum</li>
                <li>• Task 2: 40 minutes (worth more)</li>
                <li>• Spend 2-3 minutes planning</li>
                <li>• Leave 2-3 minutes for checking</li>
              </ul>
            </div>
          </div>

          {/* Important Information */}
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 mb-8">
            <div className="flex items-start">
              <svg className="w-6 h-6 text-yellow-600 mr-3 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <h4 className="text-lg font-bold text-yellow-800 mb-2">Important Writing Tips</h4>
                <ul className="text-yellow-700 space-y-1">
                  <li>• Task 2 is worth twice as much as Task 1 - prioritize accordingly</li>
                  <li>• Always address all parts of the question completely</li>
                  <li>• Use formal language and avoid contractions</li>
                  <li>• Check grammar, spelling, and punctuation carefully</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Score Band Information */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6 mb-8">
            <h4 className="text-xl font-bold text-gray-900 mb-4 text-center">📊 IELTS Writing Assessment Criteria</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="text-lg font-black text-blue-600">Task Achievement</div>
                <div className="text-sm text-blue-700">25% of score</div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="text-lg font-black text-green-600">Coherence</div>
                <div className="text-sm text-green-700">25% of score</div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="text-lg font-black text-yellow-600">Vocabulary</div>
                <div className="text-sm text-yellow-700">25% of score</div>
              </div>
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <div className="text-lg font-black text-purple-600">Grammar</div>
                <div className="text-sm text-purple-700">25% of score</div>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/exercise" 
              className="btn-secondary flex items-center space-x-2 min-w-[200px] justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>All Exercises</span>
            </Link>
            
            <Link 
              href="/exercise/reading" 
              className="btn-outline flex items-center space-x-2 min-w-[200px] justify-center">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Practice Reading</span>
            </Link>
            
            <Link 
              href="/exercise/listening" 
              className="btn-outline flex items-center space-x-2 min-w-[200px] justify-center">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.369 4.369 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
              </svg>
              <span>Practice Listening</span>
            </Link>
            
            <Link 
              href="/exercise/speaking" 
              className="btn-outline flex items-center space-x-2 min-w-[200px] justify-center">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
              </svg>
              <span>Practice Speaking</span>
            </Link>
          </div>

          {/* Additional Resources */}
          <div className="mt-8 text-center text-gray-600">
            <p className="mb-2">💡 <span className="font-semibold">Need more help?</span> Check out our comprehensive writing guides and sample essays.</p>
            <p>🎯 <span className="font-semibold">Track your progress</span> and get detailed feedback on your writing performance.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default WritingPage;
