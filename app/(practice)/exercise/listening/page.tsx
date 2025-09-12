'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

interface ListeningExercise {
  id: string;
  title: string;
  difficulty: string;
  totalQuestions: number;
  timeLimit: number;
  metadata: {
    description: string;
    tags: string[];
  };
}

const ListeningPage = () => {
  const [exercises, setExercises] = useState<ListeningExercise[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadExercises = async () => {
      try {
        const exerciseFiles = ['listening1.json', 'listening2.json'];
        const exercisePromises = exerciseFiles.map(async (file) => {
          const response = await fetch(`/${file}`);
          if (response.ok) {
            return await response.json();
          }
          return null;
        });

        const exerciseData = await Promise.all(exercisePromises);
        const validExercises = exerciseData.filter(exercise => exercise !== null);
        setExercises(validExercises);
      } catch (error) {
        console.error('Error loading exercises:', error);
      } finally {
        setLoading(false);
      }
    };

    loadExercises();
  }, []);

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
          <span className="p-1 px-2 bg-primary rounded-md text-white -rotate-3 inline-block">Listening</span>{" "}
          Tests!
        </h1>
        <p className="mt-3 leading-none text-center max-w-lg sm:text-xl/relaxed text-gray-600 font-semibold mx-auto">
          Practice with {loading ? '...' : exercises.length} carefully designed listening exercise{exercises.length !== 1 ? 's' : ''} to boost your IELTS score.
        </p>
      </div>

      {/* Exercises Grid */}
      <div className="max-w-7xl mx-auto">
        {loading ? (
          <div className="text-center py-16">
            <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-8 max-w-md mx-auto">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Loading exercises...</h3>
              <p className="text-gray-600">Please wait while we load the listening tests.</p>
            </div>
          </div>
        ) : exercises.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-8 max-w-md mx-auto">
              <h3 className="text-xl font-bold text-gray-800 mb-2">No exercises available</h3>
              <p className="text-gray-600">Please check back later for new listening tests.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {exercises.map((exercise) => (
              <Link
                key={exercise.id}
                href={`/exercise/listening/${exercise.id}`}
                className="group block"
              >
                <div className="bg-white rounded-xl border-2 border-primary/20 hover:border-primary hover:shadow-xl transition-all duration-300 p-4 sm:p-6 h-full transform hover:-translate-y-1">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-sm text-gray-400">#{exercise.id}</div>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-black mb-3 group-hover:text-primary transition-colors">
                    {exercise.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
                    {exercise.metadata.description}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4 sm:mb-6">
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                      </svg>
                      <span>{exercise.timeLimit} min</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                      </svg>
                      <span>{exercise.totalQuestions} questions</span>
                    </div>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {exercise.metadata.tags.slice(0, 3).map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        {tag}
                      </span>
                    ))}
                    {exercise.metadata.tags.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{exercise.metadata.tags.length - 3} more
                      </span>
                    )}
                  </div>

                  <button className="btn-primary w-full group-hover:bg-red-700 transition-colors duration-300 text-sm sm:text-base">
                    Start Practice
                  </button>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Footer Section with Instructions and Navigation */}
      <section className="mt-16 sm:mt-20 bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 sm:p-8 border-2 border-gray-200">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-4">
              🎧 How to Maximize Your IELTS Listening Practice
            </h2>
            <p className="text-base sm:text-lg text-gray-600 font-semibold">
              Follow these essential guidelines to get the most out of your practice sessions
            </p>
          </div>

          {/* Instructions Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-8 sm:mb-12">
            {/* Preparation */}
            <div className="bg-white rounded-xl p-4 sm:p-6 border-2 border-blue-100 hover:border-blue-300 transition-colors">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3 sm:mr-4">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">Preparation</h3>
              </div>
              <ul className="text-gray-600 space-y-2 text-sm sm:text-base">
                <li>• Use quality headphones</li>
                <li>• Find a quiet environment</li>
                <li>• Have pen and paper ready</li>
                <li>• Check audio levels first</li>
              </ul>
            </div>

            {/* Listening Strategies */}
            <div className="bg-white rounded-xl p-4 sm:p-6 border-2 border-green-100 hover:border-green-300 transition-colors">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-green-100 rounded-full flex items-center justify-center mr-3 sm:mr-4">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.369 4.369 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">Listening Strategies</h3>
              </div>
              <ul className="text-gray-600 space-y-2 text-sm sm:text-base">
                <li>• Read questions before listening</li>
                <li>• Listen for keywords and synonyms</li>
                <li>• Take notes while listening</li>
                <li>• Don't panic if you miss something</li>
              </ul>
            </div>

            {/* Answer Techniques */}
            <div className="bg-white rounded-xl p-4 sm:p-6 border-2 border-purple-100 hover:border-purple-300 transition-colors">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-full flex items-center justify-center mr-3 sm:mr-4">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">Answer Techniques</h3>
              </div>
              <ul className="text-gray-600 space-y-2 text-sm sm:text-base">
                <li>• Follow word count limits</li>
                <li>• Check spelling carefully</li>
                <li>• Use exact words from audio</li>
                <li>• Transfer answers immediately</li>
              </ul>
            </div>
          </div>

          {/* Important Information */}
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8">
            <div className="flex items-start">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600 mr-3 mt-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <h4 className="text-base sm:text-lg font-bold text-yellow-800 mb-2">Important Reminders</h4>
                <ul className="text-yellow-700 space-y-1 text-sm sm:text-base">
                  <li>• Total listening test duration: 30 minutes + 10 minutes for transferring answers</li>
                  <li>• Audio is played only once - no repetition allowed</li>
                  <li>• Questions follow the order of information in the recording</li>
                  <li>• 4 sections with 10 questions each, totaling 40 questions</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Score Band Information */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8">
            <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 text-center">📊 IELTS Listening Score Bands</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-center">
              <div className="bg-red-50 border border-red-200 rounded-lg p-2 sm:p-3">
                <div className="text-xl sm:text-2xl font-black text-red-600">6.0</div>
                <div className="text-xs sm:text-sm text-red-700">23-26 correct</div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 sm:p-3">
                <div className="text-xl sm:text-2xl font-black text-yellow-600">7.0</div>
                <div className="text-xs sm:text-sm text-yellow-700">30-32 correct</div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 sm:p-3">
                <div className="text-xl sm:text-2xl font-black text-blue-600">8.0</div>
                <div className="text-xs sm:text-sm text-blue-700">35-36 correct</div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-2 sm:p-3">
                <div className="text-xl sm:text-2xl font-black text-green-600">9.0</div>
                <div className="text-xs sm:text-sm text-green-700">39-40 correct</div>
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
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
              href="/exercise/reading" 
              className="btn-outline flex items-center space-x-2 w-full sm:w-auto sm:min-w-[200px] justify-center text-sm sm:text-base">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Practice Reading</span>
            </Link>
            
            <Link 
              href="/exercise/writing" 
              className="btn-outline flex items-center space-x-2 w-full sm:w-auto sm:min-w-[200px] justify-center text-sm sm:text-base">
              <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              <span>Practice Writing</span>
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

          {/* Additional Resources */}
          <div className="mt-6 sm:mt-8 text-center text-gray-600">
            <p className="mb-2 text-sm sm:text-base">💡 <span className="font-semibold">Need more help?</span> Check out our comprehensive study guides and video tutorials.</p>
            <p className="text-sm sm:text-base">🎯 <span className="font-semibold">Track your progress</span> and identify weak areas to focus your practice effectively.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ListeningPage;