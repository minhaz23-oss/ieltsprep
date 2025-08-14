"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { calculateIELTSListeningBand, getBandColor, getPerformanceLevel, getStudyRecommendations } from '@/lib/utils/ielts-scoring';

interface Question {
  id: number;
  type: 'multiple-choice' | 'fill-blank' | 'true-false' | 'matching';
  question: string;
  options?: string[];
  correctAnswer: string | number;
  userAnswer?: string | number;
}

interface ListeningData {
  id: string;
  title: string;
  difficulty: string;
  transcript: string;
  questions: Question[];
}

const ListeningExamPage = () => {
  const params = useParams();
  const difficulty = params.difficulty as string;
  const id = params.id as string;
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string | number>>({});
  const [showResults, setShowResults] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(10 * 60); // 10 minutes
  const [audioPlayed, setAudioPlayed] = useState(false);
  const [audioFinished, setAudioFinished] = useState(false);
  const [showAudioWarning, setShowAudioWarning] = useState(false);
  const [listeningData, setListeningData] = useState<ListeningData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load listening data from JSON file
  useEffect(() => {
    const loadListeningData = async () => {
      try {
        setLoading(true);
        const fileName = `${difficulty}${id}`;
        const response = await fetch(`/audio/listening-${difficulty}/${fileName}.json`);
        
        if (!response.ok) {
          throw new Error(`Failed to load exercise data: ${response.statusText}`);
        }
        
        const data: ListeningData = await response.json();
        setListeningData(data);
      } catch (err) {
        console.error('Error loading listening data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load exercise data');
      } finally {
        setLoading(false);
      }
    };

    if (difficulty && id) {
      loadListeningData();
    }
  }, [difficulty, id]);

  // Timer effect
  useEffect(() => {
    if (timeRemaining > 0 && !loading && !error) {
      timerRef.current = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0) {
      handleSubmit();
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timeRemaining, loading, error]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else if (!audioPlayed) {
        // Show warning message first
        setShowAudioWarning(true);
        setTimeout(() => {
          setShowAudioWarning(false);
          audioRef.current?.play();
          setIsPlaying(true);
          setAudioPlayed(true);
        }, 2000); // Show warning for 2 seconds
      }
    }
  };

  // Handle audio end event to prevent replay
  const handleAudioEnd = () => {
    setIsPlaying(false);
    setAudioFinished(true);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (audioRef.current) {
      audioRef.current.volume = vol;
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (audioRef.current) {
      audioRef.current.playbackRate = speed;
    }
  };

  const handleAnswerChange = (questionId: number, answer: string | number) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = () => {
    setShowResults(true);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const calculateScore = () => {
    if (!listeningData) return { correct: 0, total: 0, percentage: 0 };
    
    let correct = 0;
    listeningData.questions.forEach(q => {
      if (answers[q.id] === q.correctAnswer) correct++;
    });
    return { 
      correct, 
      total: listeningData.questions.length, 
      percentage: (correct / listeningData.questions.length) * 100 
    };
  };

  const renderQuestion = (question: Question) => {
    switch (question.type) {
      case 'multiple-choice':
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <label key={index} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={index}
                  checked={answers[question.id] === index}
                  onChange={() => handleAnswerChange(question.id, index)}
                  className="w-4 h-4 text-primary focus:ring-primary"
                />
                <span className="text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        );
      case 'fill-blank':
        return (
          <input
            type="text"
            value={answers[question.id] || ''}
            onChange={(e) => handleAnswerChange(question.id, e.target.value)}
            className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none"
            placeholder="Type your answer here..."
          />
        );
      case 'true-false':
        return (
          <div className="space-y-3">
            {['true', 'false'].map((option) => (
              <label key={option} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name={`question-${question.id}`}
                  value={option}
                  checked={answers[question.id] === option}
                  onChange={() => handleAnswerChange(question.id, option)}
                  className="w-4 h-4 text-primary focus:ring-primary"
                />
                <span className="text-gray-700 capitalize">{option}</span>
              </label>
            ))}
          </div>
        );
      default:
        return null;
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading exercise...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl border-2 border-red-300 p-8 max-w-md mx-auto text-center">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <h2 className="text-2xl font-bold text-black mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link href="/exercise/listening" className="btn-primary">
            Return to Exercises
          </Link>
        </div>
      </div>
    );
  }

  const questions = listeningData?.questions || [];
  const audioFileName = `${difficulty}${id}`;
  const audioPath = `/audio/listening-${difficulty}/${audioFileName}.mp3`;

  if (showResults) {
    const score = calculateScore();
    const ieltsScore = calculateIELTSListeningBand(score.correct, score.total);
    const bandColorClass = getBandColor(ieltsScore.band);
    const performanceLevel = getPerformanceLevel(ieltsScore.band);
    const recommendations = getStudyRecommendations(ieltsScore.band);

    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="space-y-6">
            {/* Main Results Card */}
            <div className="bg-white rounded-xl border-2 border-primary/50 p-8 text-center">
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <h2 className="text-3xl font-black text-black mb-6">Test Completed!</h2>
              
              {/* IELTS Band Score Display */}
              <div className="mb-8">
                <div className="text-7xl font-black text-primary mb-2">{ieltsScore.band}</div>
                <div className={`inline-block px-4 py-2 rounded-full border-2 font-bold text-lg mb-2 ${bandColorClass}`}>
                  Band {ieltsScore.band} - {ieltsScore.description}
                </div>
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ml-2 ${bandColorClass}`}>
                  {performanceLevel}
                </div>
              </div>

              {/* Score Breakdown */}
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-black">{score.correct}/{score.total}</div>
                  <div className="text-sm text-gray-600">Correct Answers</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-black">{score.percentage.toFixed(0)}%</div>
                  <div className="text-sm text-gray-600">Accuracy</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="text-2xl font-bold text-black">{Math.round((score.correct / score.total) * 40)}/40</div>
                  <div className="text-sm text-gray-600">IELTS Scale</div>
                </div>
              </div>

              <p className="text-lg text-gray-600 mb-6">
                {ieltsScore.performance}
              </p>

              <div className="flex gap-4 justify-center">
                <Link href="/exercise" className="btn-secondary">
                  Back to Exercises
                </Link>
                <button 
                  onClick={() => window.location.reload()} 
                  className="btn-primary"
                >
                  Try Again
                </button>
              </div>
            </div>

            {/* Study Recommendations */}
            <div className="bg-white rounded-xl border-2 border-blue-200 p-6">
              <h3 className="text-xl font-bold text-black mb-4 flex items-center">
                <svg className="w-6 h-6 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Study Recommendations
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-700 text-sm">{recommendation}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* IELTS Band Scale Reference */}
            <div className="bg-white rounded-xl border-2 border-gray-200 p-6">
              <h3 className="text-xl font-bold text-black mb-4 flex items-center">
                <svg className="w-6 h-6 text-gray-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                IELTS Listening Band Scale
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 text-sm">
                <div className="p-2 rounded border bg-green-50 border-green-200 text-center">
                  <div className="font-bold text-green-800">Band 9</div>
                  <div className="text-green-600">Expert</div>
                </div>
                <div className="p-2 rounded border bg-green-50 border-green-200 text-center">
                  <div className="font-bold text-green-800">Band 8</div>
                  <div className="text-green-600">Very Good</div>
                </div>
                <div className="p-2 rounded border bg-blue-50 border-blue-200 text-center">
                  <div className="font-bold text-blue-800">Band 7</div>
                  <div className="text-blue-600">Good</div>
                </div>
                <div className="p-2 rounded border bg-yellow-50 border-yellow-200 text-center">
                  <div className="font-bold text-yellow-800">Band 6</div>
                  <div className="text-yellow-600">Competent</div>
                </div>
                <div className="p-2 rounded border bg-orange-50 border-orange-200 text-center">
                  <div className="font-bold text-orange-800">Band 5</div>
                  <div className="text-orange-600">Modest</div>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                * Scores are calculated based on official IELTS listening band descriptors, scaled to match your test length.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b-2 border-primary/20 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/exercise/listening" className="text-primary hover:text-red-700">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div>
                <h1 className="text-2xl font-black text-black">{listeningData?.title || 'Listening Practice'}</h1>
                <p className="text-sm text-gray-600">{difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Level • Exercise {id}</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-lg font-bold text-primary">
                Time: {formatTime(timeRemaining)}
              </div>
              <div className="text-sm text-gray-600">
                Question {currentQuestion + 1} of {questions.length}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Audio Player Section */}
          <div className="bg-white rounded-xl border-2 border-primary/50 p-6 relative">
            <h2 className="text-xl font-bold text-black mb-6 flex items-center">
              <svg className="w-6 h-6 text-primary mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.816L4.65 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.65l3.733-3.816a1 1 0 011.617.816zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.983 5.983 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.984 3.984 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
              </svg>
              Audio Player
            </h2>
            
            {/* Audio Element */}
            <audio
              ref={audioRef}
              onTimeUpdate={handleTimeUpdate}
              onLoadedMetadata={handleLoadedMetadata}
              onEnded={handleAudioEnd}
              className="hidden"
            >
              <source src={audioPath} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>

            {/* Warning Message - Absolute positioned */}
            {showAudioWarning && (
              <div className="absolute top-0 left-0 right-0 z-50 p-4 bg-amber-100 border-2 border-amber-300 rounded-lg text-center mx-6 mt-6">
                <div className="flex items-center justify-center mb-2">
                  <svg className="w-6 h-6 text-amber-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="text-lg font-bold text-amber-800">Important Notice</span>
                </div>
                <p className="text-amber-800 font-medium">The audio will be played only once. Listen carefully!</p>
              </div>
            )}

            {/* Play Controls */}
            <div className="flex items-center justify-center space-x-4 mb-6">
              <button
                onClick={togglePlay}
                disabled={audioPlayed && !isPlaying}
                className={`w-16 h-16 rounded-full flex items-center justify-center text-white transition-colors ${
                  audioPlayed && !isPlaying 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-primary hover:bg-red-700'
                }`}
              >
                {isPlaying ? (
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            </div>

            {/* Audio Status */}
            {audioPlayed && !isPlaying && (
              <div className="text-center mb-6">
                <p className="text-sm text-gray-600">Audio has finished playing</p>
              </div>
            )}

            {/* Progress Bar - Display Only */}
            <div className="mb-4">
              <div className="w-full h-2 bg-gray-200 rounded-lg relative">
                <div 
                  className="h-2 bg-primary rounded-lg transition-all duration-300"
                  style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-sm text-gray-500 mt-1">
                <span>{formatTime(Math.floor(currentTime))}</span>
                <span>{formatTime(Math.floor(duration))}</span>
              </div>
            </div>

            {/* Volume Control Only */}
            <div className="mb-4">
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.816L4.65 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.65l3.733-3.816a1 1 0 011.617.816zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
                <span className="text-sm text-gray-600 w-10">{Math.round(volume * 100)}%</span>
              </div>
            </div>

            {/* Instructions */}
            <div className="mt-6 p-4 bg-red-50 rounded-lg border border-primary/20">
              <h3 className="font-bold text-black mb-2">Instructions:</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• You will hear the audio only once</li>
                <li>• Answer all questions as you listen</li>
                <li>• You have 10 minutes to complete this section</li>
                <li>• Check your answers before submitting</li>
              </ul>
            </div>
          </div>

          {/* Questions Section */}
          <div className={`bg-white rounded-xl border-2 border-primary/50 p-6 ${!audioFinished ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-black">
                Questions {!audioFinished && <span className="text-sm font-normal text-gray-500">(Available after audio completes)</span>}
              </h2>
              <div className="flex space-x-2">
                {questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestion(index)}
                    className={`w-8 h-8 rounded-full text-sm font-bold ${
                      index === currentQuestion
                        ? 'bg-primary text-white'
                        : answers[questions[index].id]
                        ? 'bg-green-100 text-green-600 border-2 border-green-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
            </div>

            {/* Current Question */}
            {questions.length > 0 ? (
              <div className="space-y-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-lg font-semibold text-black mb-4">
                    Question {currentQuestion + 1}
                  </h3>
                  <p className="text-gray-700 mb-4">{questions[currentQuestion]?.question}</p>
                  {questions[currentQuestion] && renderQuestion(questions[currentQuestion])}
                </div>

                {/* Navigation */}
                <div className="flex justify-between">
                  <button
                    onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                    disabled={currentQuestion === 0}
                    className="px-4 py-2 border-2 border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  {currentQuestion === questions.length - 1 ? (
                    <button
                      onClick={handleSubmit}
                      className="btn-primary"
                    >
                      Submit Test
                    </button>
                  ) : (
                    <button
                      onClick={() => setCurrentQuestion(Math.min(questions.length - 1, currentQuestion + 1))}
                      className="btn-primary"
                    >
                      Next
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-6 bg-gray-50 rounded-lg text-center">
                <p className="text-gray-600">No questions available for this exercise.</p>
              </div>
            )}

            {/* Progress */}
            <div className="mt-6">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span>{Object.keys(answers).length} of {questions.length} answered</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(Object.keys(answers).length / questions.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListeningExamPage;
