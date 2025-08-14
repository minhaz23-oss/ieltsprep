"use client";

import React from 'react';
import Link from 'next/link';

interface ListeningExercise {
  id: number;
  difficulty: 'easy' | 'medium' | 'hard';
  title: string;
  description: string;
  duration: string;
  questions: number;
}

const ListeningPage = () => {
  // Generate all 20 listening exercises based on your file structure
  const exercises: ListeningExercise[] = [
    // Easy exercises (7 total)
    { id: 1, difficulty: 'easy', title: 'Library Information', description: 'Basic conversation about library services and rules', duration: '3-4 min', questions: 10 },
    { id: 2, difficulty: 'easy', title: 'University Orientation', description: 'Introduction to university facilities and services', duration: '3-4 min', questions: 10 },
    { id: 3, difficulty: 'easy', title: 'Shopping Center', description: 'Conversation about shopping and store locations', duration: '3-4 min', questions: 10 },
    { id: 4, difficulty: 'easy', title: 'Restaurant Booking', description: 'Making a reservation at a restaurant', duration: '3-4 min', questions: 10 },
    { id: 5, difficulty: 'easy', title: 'Travel Information', description: 'Getting travel advice and booking tickets', duration: '3-4 min', questions: 10 },
    { id: 6, difficulty: 'easy', title: 'Housing Search', description: 'Looking for accommodation and rental information', duration: '3-4 min', questions: 10 },
    { id: 7, difficulty: 'easy', title: 'Course Registration', description: 'Enrolling in courses and academic planning', duration: '3-4 min', questions: 10 },
    
    // Medium exercises (7 total)
    { id: 1, difficulty: 'medium', title: 'Academic Lecture', description: 'University lecture on environmental science', duration: '5-6 min', questions: 10 },
    { id: 2, difficulty: 'medium', title: 'Research Project', description: 'Discussion about research methodology and findings', duration: '5-6 min', questions: 10 },
    { id: 3, difficulty: 'medium', title: 'Job Interview', description: 'Professional job interview scenario', duration: '5-6 min', questions: 10 },
    { id: 4, difficulty: 'medium', title: 'Conference Presentation', description: 'Academic presentation on technology trends', duration: '5-6 min', questions: 10 },
    { id: 5, difficulty: 'medium', title: 'Business Meeting', description: 'Corporate meeting discussing quarterly results', duration: '5-6 min', questions: 10 },
    { id: 6, difficulty: 'medium', title: 'Medical Consultation', description: 'Doctor-patient consultation about health issues', duration: '5-6 min', questions: 10 },
    { id: 7, difficulty: 'medium', title: 'Cultural Discussion', description: 'Conversation about cultural differences and traditions', duration: '5-6 min', questions: 10 },
    
    // Hard exercises (6 total)
    { id: 1, difficulty: 'hard', title: 'Scientific Debate', description: 'Complex academic debate on climate change', duration: '7-8 min', questions: 10 },
    { id: 2, difficulty: 'hard', title: 'Legal Proceedings', description: 'Court hearing and legal arguments', duration: '7-8 min', questions: 10 },
    { id: 3, difficulty: 'hard', title: 'Technical Workshop', description: 'Advanced technical training session', duration: '7-8 min', questions: 10 },
    { id: 4, difficulty: 'hard', title: 'Policy Discussion', description: 'Government policy analysis and debate', duration: '7-8 min', questions: 10 },
    { id: 5, difficulty: 'hard', title: 'Academic Symposium', description: 'Multi-speaker academic symposium', duration: '7-8 min', questions: 10 },
    { id: 6, difficulty: 'hard', title: 'International Relations', description: 'Complex discussion on global politics', duration: '7-8 min', questions: 10 },
  ];

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

  const groupedExercises = {
    easy: exercises.filter(ex => ex.difficulty === 'easy'),
    medium: exercises.filter(ex => ex.difficulty === 'medium'),
    hard: exercises.filter(ex => ex.difficulty === 'hard'),
  };

  return (
    <div className="min-h-screen bg-gray-50 font-semibold">
      {/* Header */}
      <div className="bg-white border-b-2 border-primary/20">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/exercise" className="text-primary hover:text-red-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div>
                <h1 className="text-3xl font-black text-black">Listening Practice</h1>
                <p className="text-gray-600 mt-1">Choose from 20 listening exercises across three difficulty levels</p>
              </div>
            </div>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Easy (7)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span>Medium (7)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Hard (6)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Overview Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl border-2 border-green-500 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-black">Easy Level</h3>
                <p className="text-gray-600 text-sm">Perfect for beginners</p>
              </div>
              <div className="text-3xl font-black text-green-600">7</div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <p>• 3-4 minute recordings</p>
              <p>• Basic vocabulary</p>
              <p>• Clear pronunciation</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border-2 border-yellow-500 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-black">Medium Level</h3>
                <p className="text-gray-600 text-sm">Intermediate practice</p>
              </div>
              <div className="text-3xl font-black text-yellow-600">7</div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <p>• 5-6 minute recordings</p>
              <p>• Academic vocabulary</p>
              <p>• Moderate complexity</p>
            </div>
          </div>

          <div className="bg-white rounded-xl border-2 border-red-500 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-black">Hard Level</h3>
                <p className="text-gray-600 text-sm">Advanced challenges</p>
              </div>
              <div className="text-3xl font-black text-red-600">6</div>
            </div>
            <div className="mt-4 text-sm text-gray-600">
              <p>• 7-8 minute recordings</p>
              <p>• Complex vocabulary</p>
              <p>• Multiple speakers</p>
            </div>
          </div>
        </div>

        {/* Exercise Sections */}
        {Object.entries(groupedExercises).map(([difficulty, exerciseList]) => (
          <div key={difficulty} className="mb-10">
            <div className="flex items-center space-x-3 mb-6">
              {getDifficultyIcon(difficulty)}
              <h2 className="text-2xl font-bold text-black capitalize">{difficulty} Level</h2>
              <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getDifficultyColor(difficulty)}`}>
                {exerciseList.length} exercises
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {exerciseList.map((exercise) => (
                <Link
                  key={`${exercise.difficulty}-${exercise.id}`}
                  href={`/exercise/listening/${exercise.difficulty}/${exercise.id}`}
                  className="group"
                >
                  <div className="bg-white rounded-xl border-2 border-gray-500 hover:border-green-500 hover:shadow-lg transition-all duration-300 p-6 h-full">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`px-3 py-1 rounded-full text-xs font-bold border ${getDifficultyColor(exercise.difficulty)}`}>
                        {exercise.difficulty.toUpperCase()}
                      </div>
                      <div className="text-sm text-gray-500">#{exercise.id}</div>
                    </div>

                    <h3 className="text-lg font-bold text-black mb-2 ">
                      {exercise.title}
                    </h3>
                    
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {exercise.description}
                    </p>

                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <div className="flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        <span>{exercise.duration}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                        </svg>
                        <span>{exercise.questions} questions</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-primary font-semibold group-hover:underline">
                        Start Practice →
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M15 14h.01M21 12c0 4.418-3.582 8-8 8s-8-3.582-8-8 3.582-8 8-8 8 3.582 8 8z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}

        {/* Instructions */}
        <div className="mt-12 bg-white rounded-xl border-2 border-primary/50 p-6">
          <h2 className="text-xl font-bold text-black mb-4 flex items-center">
            <svg className="w-6 h-6 text-primary mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            How to Use Listening Practice
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-black mb-2">Before You Start:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Find a quiet environment</li>
                <li>• Use good quality headphones</li>
                <li>• Have a pen and paper ready</li>
                <li>• Choose your difficulty level</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-black mb-2">During the Test:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• You can only play audio once</li>
                <li>• Answer questions while listening</li>
                <li>• Use the timer to manage time</li>
                <li>• Review answers before submitting</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListeningPage;
