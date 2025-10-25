'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface WritingExercise {
  id: string;
  title: string;
  totalTasks: number;
  timeLimit: number;
}

function WritingPage() {
  const [exercises, setExercises] = useState<WritingExercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedVersion, setExpandedVersion] = useState<string | null>(null);

  const colorPalette = [
    'blue',
    'emerald',
    'violet',
    'rose',
    'indigo',
    'teal'
  ];

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
        const response = await fetch('/api/writing-tests');
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

  const groupedExercises = exercises.reduce((acc, exercise) => {
    // Try multiple patterns: writing1_t1, writingTest1, writing1
    const versionMatch = exercise.id.match(/(?:writing|writingTest)(\d+)/);
    if (versionMatch) {
      const version = versionMatch[1];
      if (!acc[version]) {
        acc[version] = [];
      }
      acc[version].push(exercise);
    }
    return acc;
  }, {} as Record<string, WritingExercise[]>);

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
          <span className="p-1 px-2 bg-primary rounded-md text-white -rotate-3 inline-block">Writing</span>{" "}
          Tests!
        </h1>
        <p className="mt-3 leading-none text-center max-w-lg sm:text-xl/relaxed text-gray-600 font-semibold mx-auto">
          Practice with {loading ? '...' : exercises.length} total writing tests across {Object.keys(groupedExercises).length} IELTS version{Object.keys(groupedExercises).length !== 1 ? 's' : ''}, each containing complete practice tests to boost your IELTS score.
        </p>
      </div>

      {/* Exercises Grid */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="text-center py-16">
            <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-8 max-w-md mx-auto">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Loading exercises...</h3>
              <p className="text-gray-600">Please wait while we load the writing tests.</p>
            </div>
          </div>
        ) : exercises.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-8 max-w-md mx-auto">
              <h3 className="text-xl font-bold text-gray-800 mb-2">No exercises available</h3>
              <p className="text-gray-600">Please check back later for new writing tests.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {Object.keys(groupedExercises)
              .sort((a, b) => parseInt(b) - parseInt(a))
              .map((version, index) => {
                const versionStyle = getVersionStyle(version, index);
                return (
                  <div key={version} className={`bg-white rounded-2xl border-4 ${versionStyle.borderColor} hover:border-gray-400 transition-all duration-300 shadow-lg hover:shadow-xl overflow-hidden`}>
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
                              IELTS Writing Test {version}
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

                    {expandedVersion === version && (
                      <div className="px-4 sm:px-6 pb-4 sm:pb-6 bg-white border-t-2 border-gray-100">
                        <div className="pt-4 sm:pt-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                           {groupedExercises[version].map((exercise) => (
                             <Link
                               key={exercise.id}
                               href={`/exercise/writing/${exercise.id}`}
                               className="group block"
                             >
                               <div className="bg-gray-50 rounded-lg border border-gray-200 hover:border-primary hover:shadow-lg transition-all duration-300 p-3 sm:p-4 h-full transform hover:-translate-y-0.5">
                                 <div className="flex items-start justify-between mb-3">
                                   <div className="text-xs text-gray-400 font-medium">
                                     Test {exercise.id.split('_t')[1] || exercise.id.match(/\d+$/)?.[0] || exercise.id.match(/\d+/)?.[0] || ''}
                                   </div>
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
                                       <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                     </svg>
                                     <span>{exercise.totalTasks} tasks</span>
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

      {/* Footer Section with Instructions */}
      <section className="mt-16 sm:mt-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 sm:p-8 border-2 border-gray-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-4">
              ✍️ How to Maximize Your IELTS Writing Practice
            </h2>
            <p className="text-base sm:text-lg text-gray-600 font-semibold">
              Follow these essential guidelines to get the most out of your practice sessions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12">
            <div className="bg-white rounded-xl p-4 sm:p-6 border-2 border-blue-100 hover:border-blue-300 transition-colors">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3 sm:mr-4">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">Time Management</h3>
              </div>
              <ul className="text-gray-600 space-y-2 text-sm sm:text-base">
                <li>• Task 1: 20 minutes (150 words)</li>
                <li>• Task 2: 40 minutes (250 words)</li>
                <li>• Leave time for proofreading</li>
                <li>• Practice under timed conditions</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-4 sm:p-6 border-2 border-green-100 hover:border-green-300 transition-colors">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center mr-3 sm:mr-4">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">Writing Strategies</h3>
              </div>
              <ul className="text-gray-600 space-y-2 text-sm sm:text-base">
                <li>• Plan before you write</li>
                <li>• Use clear paragraph structure</li>
                <li>• Include examples and evidence</li>
                <li>• Use linking words effectively</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-4 sm:p-6 border-2 border-purple-100 hover:border-purple-300 transition-colors">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-full flex items-center justify-center mr-3 sm:mr-4">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">Quality Checks</h3>
              </div>
              <ul className="text-gray-600 space-y-2 text-sm sm:text-base">
                <li>• Check grammar and spelling</li>
                <li>• Ensure task achievement</li>
                <li>• Vary sentence structures</li>
                <li>• Use academic vocabulary</li>
              </ul>
            </div>
          </div>

          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="flex items-start">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600 mr-3 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <h4 className="text-base sm:text-lg font-bold text-yellow-800 mb-2">Important Reminders</h4>
                <ul className="text-yellow-700 space-y-1 text-sm sm:text-base">
                  <li>• Total test duration: 60 minutes for both tasks</li>
                  <li>• Task 2 carries more weight (66% of writing score)</li>
                  <li>• Answer both tasks completely</li>
                  <li>• Meet minimum word count requirements</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
            <Link 
              href="/exercise" 
              className="btn-secondary flex items-center space-x-2 w-full sm:w-auto sm:min-w-[200px] justify-center text-sm sm:text-base">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>All Exercises</span>
            </Link>
            
            <Link 
              href="/exercise/listening" 
              className="btn-outline flex items-center space-x-2 w-full sm:w-auto sm:min-w-[200px] justify-center text-sm sm:text-base">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.816L4.65 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.65l3.733-3.816a1 1 0 011.617.816z" clipRule="evenodd" />
              </svg>
              <span>Practice Listening</span>
            </Link>
            
            <Link 
              href="/exercise/reading" 
              className="btn-outline flex items-center space-x-2 w-full sm:w-auto sm:min-w-[200px] justify-center text-sm sm:text-base">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
              </svg>
              <span>Practice Reading</span>
            </Link>
            
            <Link 
              href="/exercise/speaking" 
              className="btn-outline flex items-center space-x-2 w-full sm:w-auto sm:min-w-[200px] justify-center text-sm sm:text-base">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
              </svg>
              <span>Practice Speaking</span>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

export default WritingPage;