"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { calculateIELTSListeningBand, getBandColor, getPerformanceLevel, getStudyRecommendations } from '@/lib/utils/ielts-scoring';
import { saveListeningTestResult } from '@/lib/actions/test-results.actions';
import { useAuth } from '@/lib/hooks/useAuth';
import AuthNotice from '@/components/AuthNotice';
import { toast } from 'sonner';

interface Question {
  id: number | string;
  sectionId: number;
  questionNumber?: number;
  questionNumbers?: number[];
  type: string;
  question: string;
  options?: string[];
  correctAnswer: string | number | string[] | number[];
  acceptableAnswers?: string[];
  caseSensitive?: boolean;
  hasImage?: boolean;
  instructions?: string;
  context?: {
    instructions?: string;
    leftColumn?: string[];
    rightColumn?: string[];
    formTitle?: string;
    fields?: any[];
    mapTitle?: string;
    mapImageUrl?: string;
    availableLabels?: string[];
    imageDescription?: string;
  };
}

interface Section {
  id: number;
  title: string;
  description: string;
  instructions: string;
  audioUrl: string;
  questions: Question[];
}

interface ListeningData {
  id: string;
  title: string;
  difficulty: string;
  totalQuestions: number;
  timeLimit: number;
  sections: Section[];
  answers?: Record<string, string>;
}

const StructuredListeningPage = () => {
  const params = useParams();
  const id = params.id as string;
  const { user, loading: authLoading, isAuthenticated, isPremium } = useAuth();
  
  // Audio states for each section
  const [sectionAudioStates, setSectionAudioStates] = useState<{
    [key: number]: {
      isPlaying: boolean;
      currentTime: number;
      duration: number;
      hasPlayed: boolean;
      hasFinished: boolean;
    }
  }>({});
  
  const [volume, setVolume] = useState(1);
  const [answers, setAnswers] = useState<Record<string | number, string | string[]>>({});
  const [showResults, setShowResults] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(40 * 60); // 40 minutes
  const [listeningData, setListeningData] = useState<ListeningData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAudioWarning, setShowAudioWarning] = useState<number | null>(null);
  
  const audioRefs = useRef<{ [key: number]: HTMLAudioElement | null }>({});
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load listening data
  useEffect(() => {
    const loadListeningData = async () => {
      try {
        setLoading(true);
        // Try to load the specific test file based on the ID
        const response = await fetch(`/listeningTests/${id}.json`);
        
        if (!response.ok) {
          throw new Error(`Test "${id}" not found. Please check if the JSON file exists.`);
        }
        
        const data: ListeningData = await response.json();
        setListeningData(data);
        
        // Set timer based on test data (default to 40 minutes if not specified)
        const testTimeLimit = data.timeLimit || 40;
        setTimeRemaining(testTimeLimit * 60);
        
        // Initialize audio states for each section
        const initialStates: typeof sectionAudioStates = {};
        data.sections.forEach(section => {
          initialStates[section.id] = {
            isPlaying: false,
            currentTime: 0,
            duration: 0,
            hasPlayed: false,
            hasFinished: false
          };
        });
        setSectionAudioStates(initialStates);
        
      } catch (err) {
        console.error('Error loading listening test:', err);
        setError(err instanceof Error ? err.message : 'Failed to load test data');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadListeningData();
    }
  }, [id]);

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

  const startSectionAudio = (sectionId: number, audioUrl: string) => {
    if (sectionAudioStates[sectionId]?.hasPlayed) return;
    
    setShowAudioWarning(sectionId);
    setTimeout(() => {
      setShowAudioWarning(null);
      const audio = audioRefs.current[sectionId];
      if (audio) {
        audio.src = audioUrl;
        audio.load();
        audio.play();
        setSectionAudioStates(prev => ({
          ...prev,
          [sectionId]: { ...prev[sectionId], isPlaying: true, hasPlayed: true }
        }));
      }
    }, 2000);
  };

  const handleAudioTimeUpdate = (sectionId: number) => {
    const audio = audioRefs.current[sectionId];
    if (audio) {
      setSectionAudioStates(prev => ({
        ...prev,
        [sectionId]: { ...prev[sectionId], currentTime: audio.currentTime }
      }));
    }
  };

  const handleAudioLoadedMetadata = (sectionId: number) => {
    const audio = audioRefs.current[sectionId];
    if (audio) {
      setSectionAudioStates(prev => ({
        ...prev,
        [sectionId]: { ...prev[sectionId], duration: audio.duration }
      }));
    }
  };

  const handleAudioEnd = (sectionId: number) => {
    setSectionAudioStates(prev => ({
      ...prev,
      [sectionId]: { ...prev[sectionId], isPlaying: false, hasFinished: true }
    }));
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    Object.values(audioRefs.current).forEach(audio => {
      if (audio) audio.volume = vol;
    });
  };

  const handleAnswerChange = (questionId: string | number, answer: string | string[]) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = async () => {
    if (!listeningData) return;

    const score = calculateScore();
    const ieltsScore = calculateIELTSListeningBand(score.correct, score.total);
    
    const timeSpent = (40 * 60) - timeRemaining;

    if (isAuthenticated) {
      try {
        const saveResult = await saveListeningTestResult({
          testId: listeningData.id,
          difficulty: listeningData.difficulty,
          title: listeningData.title,
          score: {
            correct: score.correct,
            total: score.total,
            percentage: score.percentage
          },
          totalQuestions: listeningData.totalQuestions,
          timeSpent,
          answers,
          bandScore: ieltsScore.band
        });

        if (saveResult.success) {
          toast.success('Test result saved to your dashboard!');
        }
      } catch (error) {
        console.error('Error saving test result:', error);
      }
    }

    setShowResults(true);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const calculateScore = () => {
    if (!listeningData || !listeningData.answers) return { correct: 0, total: 0, percentage: 0 };
    
    const allQuestions = listeningData.sections.flatMap(section => section.questions);
    const correctAnswers = listeningData.answers;
    let correct = 0;
    
    allQuestions.forEach(q => {
      const userAnswer = answers[q.id];
      const questionNumber = q.questionNumber;
      
      // Handle grouped questions (multiple-choice-grouped)
      if (q.type === 'multiple-choice-grouped') {
        const questionNumbers = q.questionNumbers || [questionNumber || 0];
        
        // For grouped questions, check each question number individually
        questionNumbers.forEach(qNum => {
          const correctAnswer = correctAnswers[qNum.toString()];
          if (correctAnswer && Array.isArray(userAnswer)) {
            // Check if user's answer array contains the correct answer for this question
            if (userAnswer.includes(correctAnswer.toUpperCase())) {
              correct++;
            }
          }
        });
      }
      // Handle regular questions using question number
      else if (questionNumber && correctAnswers[questionNumber.toString()]) {
        const correctAnswer = correctAnswers[questionNumber.toString()];
        
        if (typeof userAnswer === 'string') {
          // Handle multiple choice questions (A, B, C format)
          if (q.type === 'multiple-choice' || q.type === 'matching') {
            if (userAnswer.toUpperCase() === correctAnswer.toUpperCase()) {
              correct++;
            }
          }
          // Handle text-based answers (fill-blank, form-completion, note-completion)
          else {
            const caseSensitive = q.caseSensitive !== false;
            let isCorrect = false;
            
            // Check main answer
            if (caseSensitive) {
              isCorrect = userAnswer.trim() === correctAnswer.trim();
            } else {
              isCorrect = userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
            }
            
            // Check acceptable answers if available and main answer doesn't match
            if (!isCorrect && q.acceptableAnswers) {
              isCorrect = q.acceptableAnswers.some(acceptable =>
                caseSensitive
                  ? userAnswer.trim() === acceptable.trim()
                  : userAnswer.toLowerCase().trim() === acceptable.toLowerCase().trim()
              );
            }
            
            if (isCorrect) correct++;
          }
        }
        // Handle array answers for multiple selection questions
        else if (Array.isArray(userAnswer)) {
          // For multiple selection, check if user's answers match the expected format
          const expectedAnswers = correctAnswer.split(',').map(a => a.trim().toUpperCase());
          const userAnswers = userAnswer.map(a => a.toUpperCase());
          
          if (expectedAnswers.length === userAnswers.length &&
              expectedAnswers.every(answer => userAnswers.includes(answer))) {
            correct++;
          }
        }
      }
    });
    
    return {
      correct,
      total: allQuestions.length,
      percentage: (allQuestions.length > 0 ? (correct / allQuestions.length) * 100 : 0)
    };
  };

  // Helper function to get instructions for different question types
  const getQuestionTypeInstructions = (type: string, question?: Question) => {
    switch (type) {
      case 'form-completion':
        return "Complete the form below. Write ONE WORD AND/OR A NUMBER for each answer.";
      case 'fill-blank':
        return "Complete the sentences below. Write ONE WORD AND/OR A NUMBER for each answer.";
      case 'note-completion':
        return "Complete the notes below. Write ONE WORD ONLY for each answer.";
      case 'multiple-choice':
        if (question?.options && Array.isArray(question.correctAnswer)) {
          return "Choose TWO letters from the options below.";
        } else if (question?.question?.includes('TWO')) {
          return "Choose TWO letters from the options below.";
        }
        return "Choose the correct letter, A, B or C.";
      case 'matching':
        if (question?.context?.instructions) {
          return question.context.instructions;
        }
        return "Match each item with the correct letter.";
      case 'map-labeling':
        return "Label the plan below. Write the correct letter next to each question.";
      default:
        return "Follow the instructions for each question.";
    }
  };

  // Helper function to render question type instructions
  const renderQuestionTypeInstructions = (questions: Question[], startIndex: number = 0) => {
    const questionGroups: { [key: string]: Question[] } = {};
    
    // Group questions by type
    questions.forEach(q => {
      if (!questionGroups[q.type]) {
        questionGroups[q.type] = [];
      }
      questionGroups[q.type].push(q);
    });

    return Object.entries(questionGroups).map(([type, typeQuestions]) => {
      const firstQuestion = typeQuestions[0];
      const lastQuestion = typeQuestions[typeQuestions.length - 1];
      
      // Handle grouped questions that use questionNumbers array
      let questionRange;
      if (type === 'multiple-choice-grouped' && firstQuestion.questionNumbers) {
        const allNumbers = firstQuestion.questionNumbers;
        if (allNumbers.length > 1) {
          questionRange = `Questions ${allNumbers[0]} and ${allNumbers[1]}`;
        } else {
          questionRange = `Question ${allNumbers[0]}`;
        }
      } else {
        // Handle regular questions with questionNumber property
        const firstNum = firstQuestion.questionNumber;
        const lastNum = lastQuestion.questionNumber;
        questionRange = typeQuestions.length > 1
          ? `Questions ${firstNum}-${lastNum}`
          : `Question ${firstNum}`;
      }

      return (
        <div key={type} className="mb-6 p-4 bg-indigo-50 rounded-lg border-2 border-indigo-200">
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-indigo-800 mb-1">{questionRange}</h4>
              <p className="text-indigo-700 text-sm font-medium">
                {getQuestionTypeInstructions(type, firstQuestion)}
              </p>
            </div>
          </div>
        </div>
      );
    });
  };

  // Dynamic question renderer based on question type from listening1.json
  const renderQuestion = (question: Question) => {
    const { id, type, question: questionText, options, questionNumber } = question;

    switch (type) {
      case 'form-completion':
        // Handle form completion questions with context
        return (
          <div key={id} className="mb-4">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-primary">{questionNumber}</span>
              <span className="flex-1">{questionText}:</span>
              <input
                type="text"
                className="border-b-2 border-gray-400 bg-transparent w-32 px-2 py-1"
                value={answers[id] || ''}
                onChange={(e) => handleAnswerChange(id, e.target.value)}
                placeholder="..............."
              />
            </div>
          </div>
        );

      case 'fill-blank':
        // Handle fill-in-the-blank questions
        const parts = questionText.split('______');
        return (
          <div key={id} className="mb-4">
            <div className="flex items-center space-x-2 flex-wrap">
              <span className="font-semibold text-primary">{questionNumber}</span>
              <span>{parts[0]}</span>
              <input
                type="text"
                className="border-b-2 border-gray-400 bg-transparent w-32 px-2 py-1"
                value={answers[id] || ''}
                onChange={(e) => handleAnswerChange(id, e.target.value)}
                placeholder="..............."
              />
              {parts[1] && <span>{parts[1]}</span>}
            </div>
          </div>
        );

      case 'note-completion':
        // Handle note completion questions (similar to fill-blank but with word limits)
        const noteParts = questionText.split('______');
        return (
          <div key={id} className="mb-4">
            <div className="flex items-center space-x-2 flex-wrap">
              <span className="font-semibold text-primary">{questionNumber}</span>
              <span>{noteParts[0]}</span>
              <input
                type="text"
                className="border-b-2 border-gray-400 bg-transparent w-32 px-2 py-1"
                value={answers[id] || ''}
                onChange={(e) => handleAnswerChange(id, e.target.value)}
                placeholder="..............."
              />
              {noteParts[1] && <span>{noteParts[1]}</span>}
            </div>
          </div>
        );

      case 'multiple-choice-grouped':
        // Handle grouped questions like Questions 11 and 12
        const questionNumbers = (question as any).questionNumbers || [questionNumber];
        const questionRange = questionNumbers.length > 1
          ? `Questions ${questionNumbers[0]} and ${questionNumbers[1]}`
          : `Question ${questionNumbers[0]}`;
        
        return (
          <div key={id} className="mb-8 border-2 border-indigo-200 rounded-lg p-6 bg-indigo-50">
            <div className="mb-4">
              <h4 className="font-bold text-lg text-indigo-800 mb-2">{questionRange}</h4>
              <p className="text-indigo-600 text-sm font-medium mb-3">{question.instructions}</p>
              <p className="text-gray-800 font-medium">{questionText}</p>
            </div>
            <div className="space-y-3">
              {options?.map((option, index) => (
                <label key={index} className="flex items-center space-x-3 cursor-pointer p-2 rounded hover:bg-indigo-100 transition-colors">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-indigo-600"
                    checked={Array.isArray(answers[id]) && answers[id].includes(String.fromCharCode(65 + index))}
                    onChange={(e) => {
                      const letter = String.fromCharCode(65 + index);
                      const currentAnswers = Array.isArray(answers[id]) ? answers[id] : [];
                      if (e.target.checked) {
                        if (currentAnswers.length < 2) {
                          handleAnswerChange(id, [...currentAnswers, letter]);
                        }
                      } else {
                        handleAnswerChange(id, currentAnswers.filter(a => a !== letter));
                      }
                    }}
                  />
                  <span className="font-medium">
                    <strong className="text-indigo-700">{String.fromCharCode(65 + index)}</strong>
                    <span className="ml-2">{option}</span>
                  </span>
                </label>
              ))}
            </div>
            {Array.isArray(answers[id]) && answers[id].length > 0 && (
              <div className="mt-4 p-3 bg-white rounded border border-indigo-300">
                <p className="text-sm text-indigo-700">
                  <strong>Selected:</strong> {(answers[id] as string[]).join(', ')}
                  <span className="ml-2 text-indigo-500">({(answers[id] as string[]).length}/2)</span>
                </p>
              </div>
            )}
          </div>
        );

      case 'multiple-choice':
        // Check if it's a multiple selection question
        const isMultipleSelect = Array.isArray(question.correctAnswer) ||
                                questionText.includes('TWO') ||
                                questionText.includes('Choose TWO');
        
        if (isMultipleSelect) {
          const maxSelections = questionText.includes('TWO') ? 2 :
                              questionText.includes('THREE') ? 3 :
                              questionText.includes('FOUR') ? 4 : 5;
          
          return (
            <div key={id} className="mb-6">
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Question {questionNumber}</h4>
                <p className="mb-4">{questionText}</p>
              </div>
              <div className="space-y-2">
                {options?.map((option, index) => (
                  <label key={index} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4"
                      checked={Array.isArray(answers[id]) && answers[id].includes(String.fromCharCode(65 + index))}
                      onChange={(e) => {
                        const letter = String.fromCharCode(65 + index);
                        const currentAnswers = Array.isArray(answers[id]) ? answers[id] : [];
                        if (e.target.checked) {
                          if (currentAnswers.length < maxSelections) {
                            handleAnswerChange(id, [...currentAnswers, letter]);
                          }
                        } else {
                          handleAnswerChange(id, currentAnswers.filter(a => a !== letter));
                        }
                      }}
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </div>
          );
        } else {
          // Single choice multiple choice
          return (
            <div key={id} className="mb-6 border-l-4 border-blue-400 pl-4">
              <div className="flex items-start space-x-4 mb-3">
                <span className="font-bold text-lg text-primary">{questionNumber}</span>
                <p className="flex-1">{questionText}</p>
              </div>
              <div className="ml-8 space-y-2">
                {options?.map((option, index) => (
                  <label key={index} className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name={`question-${id}`}
                      className="w-4 h-4 mt-1"
                      checked={answers[id] === String.fromCharCode(65 + index)}
                      onChange={() => handleAnswerChange(id, String.fromCharCode(65 + index))}
                    />
                    <span><strong>{String.fromCharCode(65 + index)}</strong>   {option}</span>
                  </label>
                ))}
              </div>
            </div>
          );
        }

      case 'matching':
        // Check if this is a complex matching question with context
        if (question.context && question.context.leftColumn && question.context.rightColumn) {
          return (
            <div key={id} className="mb-4">
              <div className="flex items-center space-x-4">
                <span className="w-4 text-center font-semibold text-primary">{questionNumber}</span>
                <span className="flex-1">{questionText}</span>
                <input
                  type="text"
                  className="border-b-2 border-gray-400 bg-transparent w-16 px-2 py-1 text-center"
                  value={answers[id] || ''}
                  onChange={(e) => handleAnswerChange(id, e.target.value.toUpperCase())}
                  placeholder="..........."
                  maxLength={1}
                />
              </div>
            </div>
          );
        } else {
          // Simple matching question
          return (
            <div key={id} className="mb-4">
              <div className="flex items-center space-x-4">
                <span className="w-4 text-center font-semibold text-primary">{questionNumber}</span>
                <span className="flex-1">{questionText}</span>
                <input
                  type="text"
                  className="border-b-2 border-gray-400 bg-transparent w-16 px-2 py-1 text-center"
                  value={answers[id] || ''}
                  onChange={(e) => handleAnswerChange(id, e.target.value.toUpperCase())}
                  placeholder="..........."
                  maxLength={1}
                />
              </div>
            </div>
          );
        }

      default:
        return (
          <div key={id} className="mb-4">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-primary">{questionNumber}</span>
              <span className="flex-1">{questionText}</span>
              <input
                type="text"
                className="border-b-2 border-gray-400 bg-transparent w-32 px-2 py-1"
                value={answers[id] || ''}
                onChange={(e) => handleAnswerChange(id, e.target.value)}
                placeholder="..............."
              />
            </div>
          </div>
        );
    }
  };

  const renderSectionQuestions = (section: Section) => {
    // Check if this section has matching questions with context (like section 3 in listening2)
    const hasMatchingWithContext = section.questions.some(q => 
      q.type === 'matching' && q.context && q.context.leftColumn && q.context.rightColumn
    );

    // Check if this section has map-labeling questions with images
    const hasMapWithImage = section.questions.some(q => 
      q.type === 'map-labeling' && q.hasImage === true && q.context?.mapImageUrl
    );

    
    if (hasMatchingWithContext) {
      // Find the first matching question to get the context
      const matchingQuestion = section.questions.find(q => 
        q.type === 'matching' && q.context && q.context.leftColumn && q.context.rightColumn
      );
      
      if (matchingQuestion && matchingQuestion.context) {
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              {section.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold mb-2">{section.description}</h3>
                </div>
              )}
              
              {/* Question Type Instructions */}
              {renderQuestionTypeInstructions(section.questions)}
              
              {/* Render non-matching questions first */}
              {section.questions.filter(q => q.type !== 'matching').map(question => renderQuestion(question))}
              
              {/* Special rendering for matching questions with context */}
              {matchingQuestion.context.instructions && (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-bold text-blue-800 mb-2">Instructions:</h4>
                  <p className="text-blue-700 text-sm">{matchingQuestion.context.instructions}</p>
                </div>
              )}
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
                {/* Left Column - Answer Options */}
                <div className="bg-white p-4 rounded-lg border-2 border-primary/20">
                  <h4 className="font-bold text-primary mb-4">Answer Options:</h4>
                  <div className="space-y-2">
                    {matchingQuestion.context.leftColumn?.map((option, index) => (
                      <div key={index} className="text-sm">
                        <span className="font-semibold text-primary">{option}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Right Column - Items to Match */}
                <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                  <h4 className="font-bold text-gray-800 mb-4">Match with:</h4>
                  <div className="space-y-4">
                    {section.questions.filter(q => q.type === 'matching').map(question => (
                      <div key={question.id} className="flex items-center space-x-4">
                        <span className="w-6 text-center font-semibold text-primary">{question.questionNumber}</span>
                        <span className="flex-1">{question.question}</span>
                        <input
                          type="text"
                          className="border-2 border-gray-300 rounded px-3 py-1 w-16 text-center font-semibold"
                          value={answers[question.id] || ''}
                          onChange={(e) => handleAnswerChange(question.id, e.target.value.toUpperCase())}
                          placeholder="?"
                          maxLength={1}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }
    }

    if (hasMapWithImage) {
      // Find the first map question with image
      const mapQuestion = section.questions.find(q => 
        q.type === 'map-labeling' && q.hasImage === true && q.context?.mapImageUrl
      );
      
      if (mapQuestion && mapQuestion.context) {
        return (
          <div className="space-y-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              {section.description && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold mb-2">{section.description}</h3>
                </div>
              )}
              
              {/* Question Type Instructions */}
              {renderQuestionTypeInstructions(section.questions)}
              
              {/* Render non-map questions first */}
              {section.questions.filter(q => q.type !== 'map-labeling').map(question => renderQuestion(question))}
              
              {/* Map Instructions */}
              {mapQuestion.context.instructions && (
                <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-bold text-green-800 mb-2">Map Instructions:</h4>
                  <p className="text-green-700 text-sm">{mapQuestion.context.instructions}</p>
                </div>
              )}
              
              {/* Map Image */}
              <div className="mb-6 bg-white p-4 rounded-lg border-2 border-gray-200">
                <h4 className="font-bold text-gray-800 mb-4 text-center">
                  {mapQuestion.context.mapTitle || 'Map/Plan'}
                </h4>
                <div className="flex justify-center">
                  <img 
                    src={mapQuestion.context.mapImageUrl} 
                    alt={mapQuestion.context.imageDescription || `${mapQuestion.context.mapTitle} plan`}
                    className="max-w-full h-auto rounded-lg border border-gray-300 shadow-lg"
                    style={{ maxHeight: '500px' }}
                  />
                </div>
                {mapQuestion.context.imageDescription && (
                  <p className="text-sm text-gray-600 text-center mt-2 italic">
                    {mapQuestion.context.imageDescription}
                  </p>
                )}
              </div>
              
              {/* Map Questions */}
              <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                <h4 className="font-bold text-gray-800 mb-4">Questions:</h4>
                <div className="space-y-4">
                  {section.questions.filter(q => q.type === 'map-labeling').map(question => (
                    <div key={question.id} className="flex items-center space-x-4">
                      <span className="w-6 text-center font-semibold text-primary">{question.questionNumber}</span>
                      <span className="flex-1">{question.question}</span>
                      <input
                        type="text"
                        className="border-2 border-gray-300 rounded px-3 py-1 w-16 text-center font-semibold"
                        value={answers[question.id] || ''}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value.toUpperCase())}
                        placeholder="?"
                        maxLength={1}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );
      }
    }

    // Default rendering for sections without complex matching or maps
    return (
      <div className="space-y-6">
        <div className="bg-gray-50 p-6 rounded-lg">
          {section.description && (
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-2">{section.description}</h3>
            </div>
          )}
          
          {/* Question Type Instructions */}
          {renderQuestionTypeInstructions(section.questions)}
          
          {/* Group questions by type for better rendering */}
          {section.questions.map(question => renderQuestion(question))}
        </div>
      </div>
    );
  };

  const renderAudioPlayer = (section: Section) => {
    const audioState = sectionAudioStates[section.id];
    if (!audioState) return null;

    return (
      <div className="bg-white rounded-xl border-2 border-primary/50 p-6 mb-8">
        <h3 className="text-xl font-bold mb-4 flex items-center">
          <svg className="w-6 h-6 text-primary mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.816L4.65 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.65l3.733-3.816a1 1 0 011.617.816z" clipRule="evenodd" />
          </svg>
          Section {section.id} Audio: {section.title}
        </h3>
        
        <audio
          ref={(el) => { audioRefs.current[section.id] = el; }}
          onTimeUpdate={() => handleAudioTimeUpdate(section.id)}
          onLoadedMetadata={() => handleAudioLoadedMetadata(section.id)}
          onEnded={() => handleAudioEnd(section.id)}
          className="hidden"
        >
          Your browser does not support the audio element.
        </audio>

        {/* Warning Message */}
        {showAudioWarning === section.id && (
          <div className="mb-4 p-4 bg-amber-100 border-2 border-amber-300 rounded-lg text-center">
            <div className="flex items-center justify-center mb-2">
              <svg className="w-6 h-6 text-amber-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92z" clipRule="evenodd" />
              </svg>
              <span className="text-lg font-bold text-amber-800">Section {section.id} Audio</span>
            </div>
            <p className="text-amber-800 font-medium">This audio will be played only once. Listen carefully!</p>
          </div>
        )}

        {/* Instructions */}
        <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="font-bold text-blue-800 mb-2">Instructions:</h4>
          <p className="text-blue-700 text-sm">{section.instructions}</p>
        </div>

        {/* Play Controls */}
        <div className="flex items-center justify-center space-x-4 mb-6">
          <button
            onClick={() => startSectionAudio(section.id, section.audioUrl)}
            disabled={audioState.hasPlayed}
            className={`w-16 h-16 rounded-full flex items-center justify-center text-white transition-colors ${
              audioState.hasPlayed 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-primary hover:bg-red-700'
            }`}
          >
            {audioState.hasPlayed ? (
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.816L4.65 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.65l3.733-3.816a1 1 0 011.617.816z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-8 h-8 ml-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            )}
          </button>
        </div>

        {/* Audio Status */}
        {audioState.hasPlayed && !audioState.isPlaying && (
          <div className="text-center mb-4">
            <p className="text-sm text-gray-600">Section {section.id} audio has finished</p>
          </div>
        )}

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="w-full h-2 bg-gray-200 rounded-lg relative">
            <div 
              className="h-2 bg-primary rounded-lg transition-all duration-300"
              style={{ width: `${audioState.duration ? (audioState.currentTime / audioState.duration) * 100 : 0}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm text-gray-500 mt-1">
            <span>{formatTime(Math.floor(audioState.currentTime))}</span>
            <span>{formatTime(Math.floor(audioState.duration))}</span>
          </div>
        </div>

        {/* Volume Control */}
        <div className="mb-4">
          <div className="flex items-center space-x-3">
            <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.816L4.65 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.65l3.733-3.816a1 1 0 011.617.816z" clipRule="evenodd" />
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
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading IELTS Listening Test...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
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

  if (showResults) {
    const score = calculateScore();
    const ieltsScore = calculateIELTSListeningBand(score.correct, score.total);
    const bandColorClass = getBandColor(ieltsScore.band);
    const performanceLevel = getPerformanceLevel(ieltsScore.band);

    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white rounded-xl border-2 border-primary/50 p-8 text-center">
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-3xl font-black text-black mb-6">IELTS Listening Test Completed!</h2>
            
            <div className="mb-8">
              <div className="text-7xl font-black text-primary mb-2">{ieltsScore.band}</div>
              <div className={`inline-block px-4 py-2 rounded-full border-2 font-bold text-lg mb-2 ${bandColorClass}`}>
                Band {ieltsScore.band} - {ieltsScore.description}
              </div>
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ml-2 ${bandColorClass}`}>
                {performanceLevel}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
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
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="text-2xl font-bold text-black">{formatTime((40 * 60) - timeRemaining)}</div>
                <div className="text-sm text-gray-600">Time Taken</div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/exercise/listening" className="btn-secondary">
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
        </div>
      </div>
    );
  }

  if (!listeningData) return null;

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
                <h1 className="text-2xl font-black text-black">{listeningData.title}</h1>
                <p className="text-sm text-gray-600">{listeningData.difficulty.charAt(0).toUpperCase() + listeningData.difficulty.slice(1)} Level • {listeningData.totalQuestions} Questions</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-lg font-bold text-primary">
                Time: {formatTime(timeRemaining)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Dynamic Section Rendering */}
        {listeningData.sections.map((section, index) => {
          const questionRange = section.questions.length > 0
            ? `Questions ${Math.min(...section.questions.map(q => q.questionNumber || 0))}-${Math.max(...section.questions.map(q => q.questionNumber || 0))}`
            : `Questions ${(index * 10) + 1}-${(index + 1) * 10}`;
          
          return (
            <div key={section.id} className="mb-12">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-black mb-2">SECTION {section.id}</h2>
                <p className="text-gray-600">{questionRange}</p>
              </div>
              {renderAudioPlayer(section)}
              {renderSectionQuestions(section)}
            </div>
          );
        })}

        {/* Submit Button */}
        <div className="text-center mt-12">
          <button
            onClick={handleSubmit}
            className="btn-primary text-lg px-8 py-3"
          >
            Submit Test
          </button>
        </div>

        {/* Authentication Notice */}
        {!authLoading && !isAuthenticated && (
          <div className="mt-8">
            <AuthNotice testType="listening" hasAI={false} />
          </div>
        )}
      </div>
    </div>
  );
};

export default StructuredListeningPage;