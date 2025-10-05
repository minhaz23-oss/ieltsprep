'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface ReadingExercise {
  id: string;
  title: string;
  totalQuestions: number;
  timeLimit: number;
}

function ReadingPage() {
  const [exercises, setExercises] = useState<ReadingExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedVersion, setExpandedVersion] = useState<string | null>(null);

  // Color palette for version cards
  const colorPalette = [
    'blue',
    'emerald',
    'violet',
    'rose',
    'indigo',
    'teal'
  ];

  // Function to get color style for each version
  const getVersionStyle = (version: string, index: number) => {
    const colorIndex = index % colorPalette.length;
    const borderColors = [
      'border-blue-300',
      'border-green-300',
      'border-purple-300',
      'border-pink-300',
      'border-indigo-300',
      'border-teal-300'
    ];

    return {
      borderColor: borderColors[colorIndex]
    };
  };

  useEffect(() => {
    const loadExercises = async () => {
      try {
        // Fetch all available reading tests from API
        const response = await fetch('/api/reading-tests');
        const result = await response.json();
        
        if (result.success && result.data) {
          setExercises(result.data);
        } else {
          console.error('Failed to load tests:', result.message);
          setExercises([]);
        }
      } catch (error) {
        console.error('Error loading exercises:', error);
        setExercises([]);
      } finally {
        setLoading(false);
      }
    };

    loadExercises();
  }, []);

  // Group exercises by IELTS version
  const groupedExercises = exercises.reduce((acc, exercise) => {
    const versionMatch = exercise.id.match(/reading(\d+)_t/);
    if (versionMatch) {
      const version = versionMatch[1];
      if (!acc[version]) {
        acc[version] = [];
      }
      acc[version].push(exercise);
    }
    return acc;
  }, {} as Record<string, ReadingExercise[]>);

  const toggleVersion = (version: string) => {
    setExpandedVersion(expandedVersion === version ? null : version);
  };

  return (
    <div className="min-h-screen px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-24 py-8 sm:py-12 md:py-16 font-semibold">
      {/* Back Button */}
      <div className="mb-8">
        <Link href="/exercise" className="text-primary hover:text-red-700 flex items-center space-x-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span>Back to Exercises</span>
        </Link>
      </div>

      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[50px] font-black">
          Master IELTS{" "}
          <span className="p-1 px-2 bg-primary rounded-md text-white -rotate-3 inline-block">Reading</span>{" "}
          Tests!
        </h1>
        <p className="mt-3 leading-none text-center max-w-lg sm:text-xl/relaxed text-gray-600 font-semibold mx-auto">
          Practice with {loading ? '...' : exercises.length} total reading tests across {Object.keys(groupedExercises).length} IELTS version{Object.keys(groupedExercises).length !== 1 ? 's' : ''}, each containing complete practice tests to boost your IELTS score.
        </p>
      </div>

      {/* Exercises Grid */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="text-center py-16">
            <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-8 max-w-md mx-auto">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Loading exercises...</h3>
              <p className="text-gray-600">Please wait while we load the reading tests.</p>
            </div>
          </div>
        ) : exercises.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-8 max-w-md mx-auto">
              <h3 className="text-xl font-bold text-gray-800 mb-2">No exercises available</h3>
              <p className="text-gray-600">Please check back later for new reading tests.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {Object.keys(groupedExercises)
              .sort((a, b) => parseInt(b) - parseInt(a)) // Sort versions in descending order
              .map((version, index) => {
                const versionStyle = getVersionStyle(version, index);
                return (
                  <div key={version} className={`bg-white rounded-2xl border-4 ${versionStyle.borderColor} hover:border-gray-400 transition-all duration-300 shadow-lg hover:shadow-xl overflow-hidden`}>
                    {/* Version Card */}
                    <button
                      onClick={() => toggleVersion(version)}
                      className="w-full p-4 sm:p-6 text-left focus:outline-none focus:ring-2 focus:ring-gray-300 rounded-2xl relative group overflow-hidden"
                    >
                      <div className="relative flex items-center justify-between z-10">
                        <div className="flex items-center space-x-3 sm:space-x-4">
                          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-primary/10 rounded-2xl border border-primary flex items-center justify-center shadow-md">
                            <span className="text-lg sm:text-xl font-bold text-primary">#{version}</span>
                          </div>
                          <div>
                            <h3 className="text-lg sm:text-xl font-bold text-black group-hover:text-primary/80 transition-colors">
                              IELTS Reading Test {version}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {groupedExercises[version].length} practice test{groupedExercises[version].length !== 1 ? 's' : ''} available
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center shadow-sm">
                            <svg
                              className={`w-4 h-4 text-gray-600 transform transition-transform duration-200 ${expandedVersion === version ? 'rotate-180' : ''}`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </button>

                    {/* Expandable Tests */}
                    {expandedVersion === version && (
                      <div className="px-4 sm:px-6 pb-4 sm:pb-6 bg-white border-t-2 border-gray-100">
                        <div className="pt-4 sm:pt-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                           {groupedExercises[version].map((exercise) => (
                             <Link
                               key={exercise.id}
                               href={`/exercise/reading/${exercise.id}`}
                               className="group block"
                             >
                               <div className="bg-gray-50 rounded-lg border border-gray-200 hover:border-primary hover:shadow-lg transition-all duration-300 p-3 sm:p-4 h-full transform hover:-translate-y-0.5">
                                 <div className="flex items-start justify-between mb-3">
                                   <div className="text-xs text-gray-400 font-medium">Test {exercise.id.split('_t')[1]}</div>
                                 </div>

                                 <h4 className="text-base sm:text-lg font-bold text-black mb-2 group-hover:text-primary transition-colors">
                                   {exercise.title}
                                 </h4>

                                 <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                                   <div className="flex items-center space-x-1">
                                     <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                       <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                     </svg>
                                     <span>{exercise.timeLimit} min</span>
                                   </div>
                                   <div className="flex items-center space-x-1">
                                     <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                       <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                                     </svg>
                                     <span>{exercise.totalQuestions} questions</span>
                                   </div>
                                 </div>

                                 <button className="btn-primary w-full text-xs sm:text-sm py-2 group-hover:bg-red-700 transition-colors duration-300">
                                   Start Practice
                                 </button>
                               </div>
                             </Link>
                           ))}
                         </div>
                       </div>
                     </div>
                   )}
                 </div>
                  );
                })}
          </div>
        )}
      </div>

      {/* Footer Section with Instructions and Navigation */}
      <section className="mt-16 sm:mt-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-3 sm:p-4 lg:p-6 xl:p-8 border-2 border-gray-200">
        <div className="max-w-full mx-auto">
          {/* Section Header */}
          <div className="text-center mb-6 sm:mb-8 lg:mb-10">
            <h2 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-black text-gray-900 mb-2 sm:mb-3 lg:mb-4">
              📚 How to Maximize Your IELTS Reading Practice
            </h2>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 font-semibold">
              Follow these essential guidelines to get the most out of your practice sessions
            </p>
          </div>

          {/* Instructions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8 lg:mb-10">
            {/* Time Management */}
            <div className="bg-white rounded-xl p-3 sm:p-4 lg:p-5 border-2 border-blue-100 hover:border-blue-300 transition-colors">
              <div className="flex items-center mb-3 sm:mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-blue-100 rounded-full flex items-center justify-center mr-2 sm:mr-3 lg:mr-4">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">Time Management</h3>
              </div>
              <ul className="text-gray-600 space-y-1 sm:space-y-2 text-xs sm:text-sm lg:text-base">
                <li>• Allocate 20 minutes per passage</li>
                <li>• Spend 2-3 minutes skimming first</li>
                <li>• Don't spend too long on one question</li>
                <li>• Review answers in final 5 minutes</li>
              </ul>
            </div>

            {/* Reading Strategies */}
            <div className="bg-white rounded-xl p-3 sm:p-4 lg:p-5 border-2 border-green-100 hover:border-green-300 transition-colors">
              <div className="flex items-center mb-3 sm:mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-green-100 rounded-full flex items-center justify-center mr-2 sm:mr-3 lg:mr-4">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">Reading Strategies</h3>
              </div>
              <ul className="text-gray-600 space-y-1 sm:space-y-2 text-xs sm:text-sm lg:text-base">
                <li>• Skim for main ideas first</li>
                <li>• Look for keywords in questions</li>
                <li>• Use context clues for vocabulary</li>
                <li>• Practice different question types</li>
              </ul>
            </div>

            {/* Scoring Tips */}
            <div className="bg-white rounded-xl p-3 sm:p-4 lg:p-5 border-2 border-purple-100 hover:border-purple-300 transition-colors">
              <div className="flex items-center mb-3 sm:mb-4">
                <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 bg-purple-100 rounded-full flex items-center justify-center mr-2 sm:mr-3 lg:mr-4">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <h3 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900">Scoring Tips</h3>
              </div>
              <ul className="text-gray-600 space-y-1 sm:space-y-2 text-xs sm:text-sm lg:text-base">
                <li>• Answer all questions (no penalty)</li>
                <li>• Transfer answers carefully</li>
                <li>• Check spelling and grammar</li>
                <li>• Follow word count limits</li>
              </ul>
            </div>
          </div>

          {/* Important Information */}
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-3 sm:p-4 lg:p-5 mb-4 sm:mb-6 lg:mb-8">
            <div className="flex items-start">
              <svg className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-yellow-600 mr-2 sm:mr-3 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <h4 className="text-sm sm:text-base lg:text-lg font-bold text-yellow-800 mb-2">Important Reminders</h4>
                <ul className="text-yellow-700 space-y-1 text-xs sm:text-sm lg:text-base">
                  <li>• Total reading test duration: 60 minutes for 3 passages</li>
                  <li>• No extra time for transferring answers - write directly on answer sheet</li>
                  <li>• Questions become progressively harder from Passage 1 to 3</li>
                  <li>• Each passage has 13-14 questions, totaling 40 questions</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Score Band Information */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-3 sm:p-4 lg:p-5 mb-4 sm:mb-6 lg:mb-8">
            <h4 className="text-base sm:text-lg lg:text-xl font-bold text-gray-900 mb-3 sm:mb-4 text-center">📊 IELTS Reading Score Bands</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 text-center">
              <div className="bg-red-50 border border-red-200 rounded-lg p-2 sm:p-3">
                <div className="text-lg sm:text-xl lg:text-2xl font-black text-red-600">6.0</div>
                <div className="text-xs sm:text-sm text-red-700">23-26 correct</div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 sm:p-3">
                <div className="text-lg sm:text-xl lg:text-2xl font-black text-yellow-600">7.0</div>
                <div className="text-xs sm:text-sm text-yellow-700">30-32 correct</div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 sm:p-3">
                <div className="text-lg sm:text-xl lg:text-2xl font-black text-blue-600">8.0</div>
                <div className="text-xs sm:text-sm text-blue-700">35-36 correct</div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-2 sm:p-3">
                <div className="text-lg sm:text-xl lg:text-2xl font-black text-green-600">9.0</div>
                <div className="text-xs sm:text-sm text-green-700">39-40 correct</div>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 lg:gap-4 justify-center items-center">
            <Link 
              href="/exercise" 
              className="btn-secondary flex items-center space-x-2 min-w-[180px] sm:min-w-[200px] justify-center text-sm sm:text-base">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>All Exercises</span>
            </Link>
            
            <Link 
              href="/exercise/listening" 
              className="btn-outline flex items-center space-x-2 min-w-[180px] sm:min-w-[200px] justify-center text-sm sm:text-base">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.369 4.369 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
              </svg>
              <span>Practice Listening</span>
            </Link>
            
            <Link 
              href="/exercise/writing" 
              className="btn-outline flex items-center space-x-2 min-w-[180px] sm:min-w-[200px] justify-center text-sm sm:text-base">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              <span>Practice Writing</span>
            </Link>
            
            <Link 
              href="/exercise/speaking" 
              className="btn-outline flex items-center space-x-2 min-w-[180px] sm:min-w-[200px] justify-center text-sm sm:text-base">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
              </svg>
              <span>Practice Speaking</span>
            </Link>
          </div>

          {/* Additional Resources */}
          <div className="mt-4 sm:mt-6 lg:mt-8 text-center text-gray-600">
            <p className="mb-1 sm:mb-2 text-xs sm:text-sm lg:text-base">💡 <span className="font-semibold">Need more help?</span> Check out our comprehensive study guides and video tutorials.</p>
            <p className="text-xs sm:text-sm lg:text-base">🎯 <span className="font-semibold">Track your progress</span> and identify weak areas to focus your practice effectively.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ReadingPage;