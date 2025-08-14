'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getReadingTests } from '@/lib/actions/reading.actions';

interface ReadingTest {
  id: string;
  title?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
  description?: string;
  duration?: string;
  passages?: number;
  questions?: number;
  topics?: string[];
  [key: string]: any; // Allow additional properties from Firestore
}

function ReadingPage() {
  const [readingTests, setReadingTests] = useState<ReadingTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'easy' | 'medium' | 'hard'>('all');

  const filteredTests = activeTab === 'all' 
    ? readingTests 
    : readingTests.filter(test => test.difficulty === activeTab);

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

  const groupedTests = {
    easy: readingTests.filter(test => test.difficulty === 'easy'),
    medium: readingTests.filter(test => test.difficulty === 'medium'),
    hard: readingTests.filter(test => test.difficulty === 'hard'),
  };

  const totalTests = readingTests.length;
  const easyCount = groupedTests.easy.length;
  const mediumCount = groupedTests.medium.length;
  const hardCount = groupedTests.hard.length;

  // Process the data to ensure it's safe for rendering
  const processReadingTest = (test: any): ReadingTest | null => {
    // Skip metadata document
    if (test.id === 'metadata' || !test.difficulty) {
      return null;
    }

    return {
      id: String(test.id || ''),
      title: typeof test.title === 'string' ? test.title : undefined,
      difficulty: ['easy', 'medium', 'hard'].includes(test.difficulty) ? test.difficulty : undefined,
      description: typeof test.description === 'string' ? test.description : undefined,
      duration: typeof test.duration === 'string' ? test.duration : undefined,
      passages: typeof test.passages === 'number' ? test.passages : undefined,
      // Handle questions as array or number - prioritize array length
      questions: Array.isArray(test.questions) ? test.questions.length : 
                 typeof test.questions === 'number' ? test.questions : 
                 // Try to extract from searchFields if available
                 (test.searchFields && typeof test.searchFields === 'string' && test.searchFields.includes('questions')) ? 10 :
                 // Default fallback
                 10,
      topics: Array.isArray(test.topics) && test.topics.every((t: any) => typeof t === 'string') ? test.topics : undefined,
    };
  };

  // Load reading tests on component mount
  useEffect(() => {
    const loadReadingTests = async () => {
      setLoading(true);
      try {
        const response = await getReadingTests();
        setSuccess(response.success);
        setMessage(response.message);
        
        if (response.success && Array.isArray(response.data)) {
          const processedTests = response.data
            .map(processReadingTest)
            .filter((test): test is ReadingTest => test !== null); // Filter out null values (metadata)
          setReadingTests(processedTests);
        } else {
          setReadingTests([]);
        }
      } catch (error) {
        console.error('Error loading reading tests:', error);
        setSuccess(false);
        setMessage('Failed to load reading tests');
        setReadingTests([]);
      } finally {
        setLoading(false);
      }
    };

    loadReadingTests();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen px-[100px] py-16 font-semibold flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Loading reading tests...</p>
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
          <span className="p-1 px-2 bg-primary rounded-md text-white -rotate-3 inline-block">Reading</span>{" "}
          Tests!
        </h1>
        <p className="mt-3 leading-none text-center max-w-lg sm:text-xl/relaxed text-gray-600 font-semibold mx-auto">
          {!success ? message : 
           totalTests > 0 
           ? `Practice with ${totalTests} carefully designed reading tests across all difficulty levels to boost your IELTS score.`
           : 'Reading tests will be available soon. Check back later!'}
        </p>
      </div>

      {!success ? (
        // Error State
        <div className="text-center py-16">
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8 max-w-2xl mx-auto">
            <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h2 className="text-2xl font-bold text-red-800 mb-2">Unable to Load Reading Tests</h2>
            <p className="text-red-600">{message}</p>
          </div>
        </div>
      ) : totalTests === 0 ? (
        // Empty State
        <div className="text-center py-16">
          <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-8 max-w-2xl mx-auto">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">No Reading Tests Available</h2>
            <p className="text-gray-600">Check back later for new reading practice tests!</p>
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
                  href={`/exercise/reading/${test.difficulty}/${test.id}`}
                  className="group"
                >
                  <div className="bg-white rounded-xl border-2 border-primary/20 hover:border-primary hover:shadow-xl transition-all duration-300 p-6 h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getDifficultyColor(test.difficulty || 'unknown')}`}>
                        {(test.difficulty || 'UNKNOWN').toUpperCase()}
                      </div>
                      <div className="text-sm text-gray-400">#{String(test.id).slice(-6)}</div>
                    </div>

                    <h3 className="text-xl font-bold text-black mb-3 group-hover:text-primary transition-colors">
                      {test.title || 'Untitled Test'}
                    </h3>
                    
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {test.description || 'No description available'}
                    </p>

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        <span>{test.duration || '60 min'}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                        </svg>
                        <span>{test.questions || 0} questions</span>
                      </div>
                      {test.passages && (
                        <div className="flex items-center space-x-1">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd" />
                          </svg>
                          <span>{test.passages} passages</span>
                        </div>
                      )}
                    </div>

                    {test.topics && test.topics.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-6">
                        {test.topics.slice(0, 3).map((topic, index) => (
                          <span key={index} className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            {topic}
                          </span>
                        ))}
                        {test.topics.length > 3 && (
                          <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            +{test.topics.length - 3} more
                          </span>
                        )}
                      </div>
                    )}

                    <button className="btn-primary w-full group-hover:bg-red-700 transition-colors duration-300">
                      Start Practice
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
              📚 How to Maximize Your IELTS Reading Practice
            </h2>
            <p className="text-lg text-gray-600 font-semibold">
              Follow these essential guidelines to get the most out of your practice sessions
            </p>
          </div>

          {/* Instructions Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {/* Time Management */}
            <div className="bg-white rounded-xl p-6 border-2 border-blue-100 hover:border-blue-300 transition-colors">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Time Management</h3>
              </div>
              <ul className="text-gray-600 space-y-2">
                <li>• Allocate 20 minutes per passage</li>
                <li>• Spend 2-3 minutes skimming first</li>
                <li>• Don't spend too long on one question</li>
                <li>• Review answers in final 5 minutes</li>
              </ul>
            </div>

            {/* Reading Strategies */}
            <div className="bg-white rounded-xl p-6 border-2 border-green-100 hover:border-green-300 transition-colors">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Reading Strategies</h3>
              </div>
              <ul className="text-gray-600 space-y-2">
                <li>• Skim for main ideas first</li>
                <li>• Look for keywords in questions</li>
                <li>• Use context clues for vocabulary</li>
                <li>• Practice different question types</li>
              </ul>
            </div>

            {/* Scoring Tips */}
            <div className="bg-white rounded-xl p-6 border-2 border-purple-100 hover:border-purple-300 transition-colors">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900">Scoring Tips</h3>
              </div>
              <ul className="text-gray-600 space-y-2">
                <li>• Answer all questions (no penalty)</li>
                <li>• Transfer answers carefully</li>
                <li>• Check spelling and grammar</li>
                <li>• Follow word count limits</li>
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
                <h4 className="text-lg font-bold text-yellow-800 mb-2">Important Reminders</h4>
                <ul className="text-yellow-700 space-y-1">
                  <li>• Total reading test duration: 60 minutes for 3 passages</li>
                  <li>• No extra time for transferring answers - write directly on answer sheet</li>
                  <li>• Questions become progressively harder from Passage 1 to 3</li>
                  <li>• Each passage has 13-14 questions, totaling 40 questions</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Score Band Information */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6 mb-8">
            <h4 className="text-xl font-bold text-gray-900 mb-4 text-center">📊 IELTS Reading Score Bands</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="text-2xl font-black text-red-600">6.0</div>
                <div className="text-sm text-red-700">23-26 correct</div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="text-2xl font-black text-yellow-600">7.0</div>
                <div className="text-sm text-yellow-700">30-32 correct</div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="text-2xl font-black text-blue-600">8.0</div>
                <div className="text-sm text-blue-700">35-36 correct</div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="text-2xl font-black text-green-600">9.0</div>
                <div className="text-sm text-green-700">39-40 correct</div>
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
              href="/exercise/listening" 
              className="btn-outline flex items-center space-x-2 min-w-[200px] justify-center">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.369 4.369 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
              </svg>
              <span>Practice Listening</span>
            </Link>
            
            <Link 
              href="/exercise/writing" 
              className="btn-outline flex items-center space-x-2 min-w-[200px] justify-center">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              <span>Practice Writing</span>
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
            <p className="mb-2">💡 <span className="font-semibold">Need more help?</span> Check out our comprehensive study guides and video tutorials.</p>
            <p>🎯 <span className="font-semibold">Track your progress</span> and identify weak areas to focus your practice effectively.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ReadingPage;
