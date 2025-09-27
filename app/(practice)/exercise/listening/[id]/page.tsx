"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import PremiumResultsAnalysis from '@/components/listening/PremiumResultsAnalysis';
import { getPremiumStatus } from '@/lib/utils/premium';
import { ListeningTest, ListeningSection, QuestionGroup } from '@/types/listening';

// ==================== INTERFACES ====================

// Use the proper types from types/listening.d.ts
type TestData = ListeningTest;
type Section = ListeningSection;

// Local interfaces for form fields (matching the actual data structure)
interface FormField {
  label?: string;
  value?: string;
  prefix?: string;
  suffix?: string;
  questionNumber?: number;
  inputType?: string;
  correctAnswer?: string | string[];
  inputPlaceholder?: string;
  isStatic?: boolean;
  isExample?: boolean;
  isSection?: boolean;
  sectionTitle?: string;
  isList?: boolean;
  listItems?: FormField[];
  isBullet?: boolean;
  text?: string;
}

// ==================== MAIN COMPONENT ====================
const IELTSListeningTest = () => {
  const params = useParams();
  const testId = params.id as string;
  
  // States
  const [testData, setTestData] = useState<TestData | null>(null);
  const [answers, setAnswers] = useState<Record<number, string | string[]>>({});
  const [showResults, setShowResults] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(40 * 60);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [audioStates, setAudioStates] = useState<Record<number, 'loading' | 'ready' | 'error'>>({});
  const [isPremium, setIsPremium] = useState(false);
  const [premiumLoading, setPremiumLoading] = useState(true);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // ==================== DATA LOADING ====================
  useEffect(() => {
    const loadTestData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Use server action instead of API route
        const { getListeningTest } = await import('@/lib/actions/listening-tests.actions');
        const result = await getListeningTest(testId);

        if (!result.success) {
          throw new Error(result.message || 'Failed to load test data');
        }

        if (!result.data) {
          throw new Error('No test data received');
        }

        const data: TestData = result.data as TestData;

        // Validate test data structure
        if (!data.sections || !Array.isArray(data.sections) || data.sections.length === 0) {
          throw new Error('Invalid test data: missing or empty sections');
        }

        setTestData(data);
        setTimeRemaining((data.timeLimit || 40) * 60);

        // Initialize audio states
        const initialAudioStates: Record<number, 'loading' | 'ready' | 'error'> = {};
        data.sections.forEach(section => {
          if (section.id && section.audioUrl) {
            initialAudioStates[section.id] = 'loading';
          }
        });
        setAudioStates(initialAudioStates);

      } catch (err) {
        console.error('Error loading test data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load test');
        setTestData(null);
      } finally {
        setLoading(false);
      }
    };

    const loadPremiumStatus = async () => {
      try {
        setPremiumLoading(true);
        const { isPremium: premiumStatus } = await getPremiumStatus();
        setIsPremium(premiumStatus);
      } catch (err) {
        console.error('Error loading premium status:', err);
        setIsPremium(false);
      } finally {
        setPremiumLoading(false);
      }
    };

    if (testId) {
      loadTestData();
      loadPremiumStatus();
    }
  }, [testId]);

  // ==================== HELPER FUNCTIONS ====================
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (questionNumber: number, answer: string | string[]) => {
    setAnswers(prev => ({ ...prev, [questionNumber]: answer }));
  };

  const handleSubmit = useCallback(() => {
    setShowResults(true);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  // ==================== TIMER ====================
  useEffect(() => {
    if (timeRemaining > 0 && !loading && !error && !showResults) {
      timerRef.current = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0 && !showResults) {
      handleSubmit();
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [timeRemaining, loading, error, showResults, handleSubmit]);

  const calculateScore = () => {
    if (!testData) return { correct: 0, total: 0, percentage: 0 };

    let correct = 0;
    let total = 0;

    try {
      testData.sections.forEach(section => {
        if (!section.questionGroups || !Array.isArray(section.questionGroups)) {
          console.warn('Invalid section structure:', section);
          return;
        }

        section.questionGroups.forEach(group => {
          if (!group.content) {
            console.warn('Invalid group structure:', group);
            return;
          }

          // Handle questions array
          if (group.content.questions && Array.isArray(group.content.questions)) {
            group.content.questions.forEach(q => {
              if (!q.questionNumber || !q.correctAnswer) {
                console.warn('Invalid question structure:', q);
                return;
              }

              total++;
              const userAnswer = answers[q.questionNumber];
              const correctAnswer = q.correctAnswer;

              if (Array.isArray(correctAnswer) && Array.isArray(userAnswer)) {
                const userSet = new Set(userAnswer.map(a => a.toUpperCase()));
                const correctSet = new Set(correctAnswer.map(a => a.toUpperCase()));
                if (userSet.size === correctSet.size && [...correctSet].every(a => userSet.has(a))) {
                  correct++;
                }
              } else if (typeof userAnswer === 'string' && typeof correctAnswer === 'string') {
                if (userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim()) {
                  correct++;
                }
              }
            });
          }

          // Handle items array (for matching questions)
          if (group.content.items && Array.isArray(group.content.items)) {
            group.content.items.forEach(item => {
              if (!item.questionNumber || !item.correctAnswer) {
                console.warn('Invalid item structure:', item);
                return;
              }

              total++;
              const userAnswer = answers[item.questionNumber];
              if (typeof userAnswer === 'string' && userAnswer.toUpperCase().trim() === item.correctAnswer.toUpperCase().trim()) {
                correct++;
              }
            });
          }

          // Handle form fields
          if (group.content.fields && Array.isArray(group.content.fields)) {
            const countQuestions = (fields: FormField[]) => {
              fields.forEach(field => {
                if (field.questionNumber && field.correctAnswer) {
                  total++;
                  const userAnswer = answers[field.questionNumber];
                  if (typeof userAnswer === 'string' && typeof field.correctAnswer === 'string' &&
                      userAnswer.toLowerCase().trim() === field.correctAnswer.toLowerCase().trim()) {
                    correct++;
                  }
                }
                if (field.listItems && Array.isArray(field.listItems)) {
                  countQuestions(field.listItems);
                }
              });
            };
            countQuestions(group.content.fields);
          }

          // Handle sections with content (for notes completion)
          if (group.content.sections && Array.isArray(group.content.sections)) {
            group.content.sections.forEach(section => {
              if (section.content && Array.isArray(section.content)) {
                section.content.forEach(item => {
                  if (item.questionNumber && item.correctAnswer) {
                    total++;
                    const userAnswer = answers[item.questionNumber];
                    if (typeof userAnswer === 'string' &&
                        userAnswer.toLowerCase().trim() === item.correctAnswer.toLowerCase().trim()) {
                      correct++;
                    }
                  }
                });
              }
            });
          }
        });
      });
    } catch (error) {
      console.error('Error calculating score:', error);
      return { correct: 0, total: 0, percentage: 0 };
    }

    return {
      correct,
      total,
      percentage: total > 0 ? (correct / total) * 100 : 0
    };
  };

  // ==================== RENDERING FUNCTIONS ====================
  const renderInput = (
    questionNumber: number,
    inputType: string = 'text',
    placeholder?: string,
    options?: Array<{ letter: string; text: string }>
  ) => {
    if (inputType === 'select') {
      return (
        <select
          className="inline-block border-2 border-primary bg-yellow-50 px-3 py-1 mx-1 min-w-[80px] rounded font-sans text-base"
          value={answers[questionNumber] as string || ''}
          onChange={(e) => handleAnswerChange(questionNumber, e.target.value)}
        >
          <option value="">{questionNumber}</option>
          {options?.map(option => (
            <option key={option.letter} value={option.letter}>{option.letter}</option>
          )) || ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].slice(0, 10).map(letter => (
            <option key={letter} value={letter}>{letter}</option>
          ))}
        </select>
      );
    } else if (inputType === 'multiselect') {
      return (
        <input
          type="text"
          className="inline-block border-2 border-primary bg-yellow-50 px-3 py-1 mx-1 min-w-[120px] rounded font-sans text-base"
          value={Array.isArray(answers[questionNumber]) ? (answers[questionNumber] as string[]).join(',') : answers[questionNumber] || ''}
          onChange={(e) => {
            const value = e.target.value.toUpperCase();
            const letters = value.split(',').map(s => s.trim()).filter(s => /^[A-H]$/.test(s));
            handleAnswerChange(questionNumber, letters);
          }}
          placeholder={placeholder || `${questionNumber} (e.g., A,C)`}
        />
      );
    } else {
      return (
        <input
          type="text"
          className="inline-block border-2 border-primary bg-yellow-50 px-3 py-1 mx-1 min-w-[150px] rounded font-sans text-base"
          value={answers[questionNumber] as string || ''}
          onChange={(e) => handleAnswerChange(questionNumber, e.target.value)}
          placeholder={placeholder || `${questionNumber}`}
        />
      );
    }
  };

  const renderFormField = (field: FormField): React.JSX.Element => {
    if (field.isSection) {
      return <div className="mt-6 mb-3 font-bold text-lg">{field.sectionTitle}</div>;
    }
    
    if (field.isExample) {
      return (
        <div className="bg-gray-50 p-2 rounded mb-2">
          <span className="text-gray-600 italic">Example: </span>
          {field.label && <span className="font-semibold">{field.label}: </span>}
          {field.value} {field.suffix}
        </div>
      );
    }
    
    if (field.isList && field.listItems) {
      return (
        <div className="ml-4 space-y-2">
          {field.label && <div className="font-semibold">{field.label}:</div>}
          {field.listItems.map((item, idx) => (
            <div key={idx} className="flex items-center">
              {item.prefix}
              {item.questionNumber && renderInput(item.questionNumber, item.inputType, item.inputPlaceholder)}
              {item.suffix}
              {item.value && !item.questionNumber && <span>{item.value}</span>}
            </div>
          ))}
        </div>
      );
    }
    
    return (
      <div className="flex items-center space-x-2 mb-3">
        {field.label && (
          <span className="font-semibold min-w-[150px]">{field.label}:</span>
        )}
        {field.value}
        {field.prefix}
        {field.questionNumber && renderInput(field.questionNumber, field.inputType, field.inputPlaceholder)}
        {field.suffix}
      </div>
    );
  };

  const renderQuestionGroup = (group: QuestionGroup, section: Section) => {
    const { content, instructions, displayType, imageUrl } = group;

    return (
      <div className="mb-8 bg-white rounded-lg p-6 border-2 border-gray-200">
        <div className="mb-4 text-primary font-semibold">{instructions}</div>

        {/* Render image if imageUrl is provided */}
        {imageUrl && (
          <div className="mb-6 text-center">
            <img
              src={imageUrl}
              alt="Question visual aid"
              className="max-w-full h-auto mx-auto rounded-lg border-2 border-gray-300 shadow-md"
              style={{ maxHeight: '400px' }}
              onError={(e) => {
                console.error('Failed to load image:', imageUrl);
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}

        {displayType === 'form' && content.fields && (
          <div className="bg-gray-50 p-6 rounded">
            {content.title && <h3 className="text-xl font-bold mb-4 text-center">{content.title}</h3>}
            {content.fields.map((field, idx) => (
              <div key={idx}>{renderFormField(field)}</div>
            ))}
          </div>
        )}

        {displayType === 'multiple-answer' && content.questions && (
          <div>
            {content.questionText && <div className="mb-4 font-semibold">{content.questionText}</div>}
            {content.options && (
              <div className="bg-gray-50 p-4 rounded mb-4">
                {content.options.map((opt) => (
                  <div key={opt.letter} className="mb-2">
                    <span className="font-bold mr-2">{opt.letter}</span>
                    {opt.text}
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-4">
              {content.questions.map(q => (
                <div key={q.questionNumber} className="flex items-center">
                  <span className="mr-2 font-semibold">{q.questionNumber}:</span>
                  {renderInput(q.questionNumber, 'multiselect', undefined, content.options)}
                </div>
              ))}
            </div>
          </div>
        )}

        {displayType === 'single-choice' && content.questions && (
          <div className="space-y-6">
            {content.questions.map(q => (
              <div key={q.questionNumber} className="border-l-4 border-primary pl-4">
                <div className="mb-3">
                  <span className="font-bold text-primary mr-2">{q.questionNumber}.</span>
                  <span className="font-semibold">{q.questionText || `Question ${q.questionNumber}`}</span>
                </div>
                {q.options && (
                  <div className="ml-8 space-y-2">
                    {q.options.map((opt) => (
                      <div key={opt.letter} className="flex items-start">
                        <span className="font-bold mr-2 text-gray-600">{opt.letter}</span>
                        <span>{opt.text}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div className="mt-3 ml-8">
                  Answer: {renderInput(q.questionNumber, 'select', undefined, q.options)}
                </div>
              </div>
            ))}
          </div>
        )}

        {displayType === 'matching' && content.items && (
          <div>
            {content.matchingOptions && (
              <div className="bg-primary/10 p-4 rounded mb-4 border border-primary/20">
                <div className="font-bold mb-2">{content.title || 'Options'}</div>
                {content.matchingOptions.map((opt) => (
                  <div key={opt.letter} className="mb-1">
                    <span className="font-bold mr-2">{opt.letter}</span>
                    {opt.text}
                  </div>
                ))}
              </div>
            )}
            {content.sectionTitle && <div className="font-bold mb-3">{content.sectionTitle}</div>}
            <div className="space-y-3">
              {content.items.map(item => (
                <div key={item.questionNumber} className="flex items-center">
                  <span className="font-semibold mr-3 min-w-[30px]">{item.questionNumber}</span>
                  <span className="flex-1">{item.text}</span>
                  {renderInput(item.questionNumber, 'select', undefined, content.matchingOptions)}
                </div>
              ))}
            </div>
          </div>
        )}

        {displayType === 'notes' && content.sections && (
          <div className="bg-gray-50 p-6 rounded">
            {content.title && <h3 className="text-xl font-bold mb-4 text-center">{content.title}</h3>}
            {content.sections.map((section, idx) => (
              <div key={idx} className="mb-6">
                {section.sectionTitle && (
                  <h4 className="font-bold text-lg mb-3 text-primary">{section.sectionTitle}</h4>
                )}
                {section.content.map((item, itemIdx) => (
                  <div key={itemIdx} className={`${item.isBullet ? 'ml-4' : ''} mb-2`}>
                    {item.isBullet && <span className="mr-2">•</span>}
                    {item.text}
                    {item.questionNumber && renderInput(item.questionNumber, item.inputType || 'text')}
                    {item.suffix}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const renderAudioPlayer = (section: Section) => {
    const audioState = audioStates[section.id] || 'loading';
    
    return (
      <div className="bg-primary/10 rounded-lg p-4 mb-6 border-2 border-primary/20">
        <h3 className="text-lg font-bold mb-3 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.816L4.65 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.65l3.733-3.816a1 1 0 011.617.816z" clipRule="evenodd" />
          </svg>
          Audio for Section {section.id}
        </h3>
        
        {audioState === 'loading' && (
          <div className="text-center py-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-600 mt-2">Loading audio...</p>
          </div>
        )}
        
        {audioState === 'error' && (
          <div className="bg-red-50 p-3 rounded text-red-700 text-sm">
            Audio unavailable. Please continue with the test.
          </div>
        )}
        
        <audio 
          controls 
          className="w-full"
          preload="metadata"
          onLoadedData={() => setAudioStates(prev => ({ ...prev, [section.id]: 'ready' }))}
          onError={() => setAudioStates(prev => ({ ...prev, [section.id]: 'error' }))}
        >
          <source src={section.audioUrl} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
        
        <p className="text-sm text-gray-600 mt-2">
          You can play the audio as many times as needed during the test.
        </p>
      </div>
    );
  };

  // ==================== LOADING & ERROR STATES ====================
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading IELTS Listening Test...</p>
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
          <Link href="/exercise/listening" className="bg-primary text-white px-6 py-2 rounded hover:bg-primary">
            Back to Tests
          </Link>
        </div>
      </div>
    );
  }

  // ==================== RESULTS VIEW ====================
  if (showResults) {
    const score = calculateScore();
    const band = Math.min(9, Math.max(0, Math.round((score.correct / score.total) * 9 * 10) / 10));
    
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white rounded-lg p-8 text-center border-2 border-green-300 mb-8">
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
            
            <h2 className="text-3xl font-bold mb-6">Test Completed!</h2>

            <div className="text-6xl font-bold text-primary mb-2">Band {band}</div>
            
            <div className="grid grid-cols-3 gap-4 mb-8 mt-6">
              <div className="bg-gray-50 rounded p-4">
                <div className="text-2xl font-bold">{score.correct}/{score.total}</div>
                <div className="text-sm text-gray-600">Correct Answers</div>
              </div>
              <div className="bg-gray-50 rounded p-4">
                <div className="text-2xl font-bold">{score.percentage.toFixed(0)}%</div>
                <div className="text-sm text-gray-600">Accuracy</div>
              </div>
              <div className="bg-gray-50 rounded p-4">
                <div className="text-2xl font-bold">{formatTime((testData.timeLimit * 60) - timeRemaining)}</div>
                <div className="text-sm text-gray-600">Time Taken</div>
              </div>
            </div>
            
            <div className="flex gap-4 justify-center">
              <Link href="/exercise/listening" className="bg-gray-500 text-white px-6 py-2 rounded hover:bg-gray-600">
                Back to Tests
              </Link>
              <button
                onClick={() => window.location.reload()}
                className="bg-primary text-white px-6 py-2 rounded hover:bg-primary"
              >
                Try Again
              </button>
            </div>
          </div>

          {/* Premium Results Analysis */}
          {!premiumLoading && testData && (
            <PremiumResultsAnalysis
              testData={testData}
              answers={answers}
              isPremium={isPremium}
            />
          )}
          
          {premiumLoading && (
            <div className="bg-white rounded-lg p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Loading analysis...</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==================== MAIN TEST VIEW ====================
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/exercise/listening" className="text-primary hover:text-primary">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">{testData.title}</h1>
                <p className="text-sm text-gray-600">
                  {testData.difficulty} • {testData.totalQuestions} Questions
                </p>
              </div>
            </div>
            <div className="text-lg font-bold text-primary">
              Time: {formatTime(timeRemaining)}
            </div>
          </div>
        </div>
      </div>

      {/* Test Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {testData.sections.map((section) => (
          <div key={section.id} className="mb-12">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">SECTION {section.id}</h2>
              <p className="text-gray-600">{section.title}</p>
            </div>
            
            {renderAudioPlayer(section)}
            
            {section.questionGroups.map((group, idx) => (
              <div key={idx}>
                {renderQuestionGroup(group, section)}
              </div>
            ))}
          </div>
        ))}

        {/* Submit Button */}
        <div className="text-center mt-12 mb-8">
          <button
            onClick={handleSubmit}
            className="bg-green-600 text-white text-lg px-8 py-3 rounded hover:bg-green-700 font-semibold"
          >
            Submit Test
          </button>
        </div>

        {/* IELTS Listening Instructions, Tips & Scoring Guide */}
        <div className="mt-16 space-y-8">
          {/* Instructions Section */}
          <div className="bg-white rounded-lg p-8 border-2 border-blue-200">
            <h2 className="text-2xl font-bold text-blue-800 mb-6 flex items-center">
              <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              IELTS Listening Test Instructions
            </h2>
            <div className="space-y-4 text-gray-700">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-lg mb-3 text-blue-700">Test Format</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span><strong>4 sections</strong> with 10 questions each (40 total)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span><strong>30 minutes</strong> listening time + 10 minutes transfer time</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>Audio is played <strong>only once</strong></span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span>Variety of accents: British, American, Canadian, Australian</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-3 text-blue-700">Section Types</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span><strong>Section 1:</strong> Social conversation (2 people)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span><strong>Section 2:</strong> Monologue in social context</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-orange-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span><strong>Section 3:</strong> Academic conversation (up to 4 people)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="w-2 h-2 bg-red-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                      <span><strong>Section 4:</strong> Academic lecture/monologue</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Pro Tips Section */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-8 border-2 border-green-200">
            <h2 className="text-2xl font-bold text-green-800 mb-6 flex items-center">
              <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Pro Tips for Higher Scores
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-lg mb-4 text-green-700">Before Listening</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Read questions carefully and predict possible answers</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Underline key words in questions</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Check word limits (e.g., "NO MORE THAN TWO WORDS")</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Look at any diagrams, maps, or forms provided</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-4 text-green-700">While Listening</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Listen for signpost words (first, next, however, finally)</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Write exactly what you hear (don't change words)</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Don't panic if you miss an answer - move on</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-green-600 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span>Be aware of distractors (wrong information mentioned first)</span>
                  </li>
                </ul>
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-yellow-100 rounded-lg border border-yellow-300">
              <h4 className="font-semibold text-yellow-800 mb-2">⚡ Quick Success Strategies</h4>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <strong>Spelling:</strong> Practice common IELTS vocabulary spelling
                </div>
                <div>
                  <strong>Numbers:</strong> Know how to write dates, times, phone numbers
                </div>
                <div>
                  <strong>Synonyms:</strong> Listen for paraphrasing of question words
                </div>
              </div>
            </div>
          </div>

          {/* Scoring Guide Section */}
          <div className="bg-white rounded-lg p-8 border-2 border-purple-200">
            <h2 className="text-2xl font-bold text-purple-800 mb-6 flex items-center">
              <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
              IELTS Listening Band Score Guide
            </h2>
            
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300 text-sm">
                <thead>
                  <tr className="bg-purple-100">
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Band Score</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Raw Score (out of 40)</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-green-50">
                    <td className="border border-gray-300 px-4 py-3 font-bold text-green-700">9.0</td>
                    <td className="border border-gray-300 px-4 py-3">39-40</td>
                    <td className="border border-gray-300 px-4 py-3">Expert user - fully operational command</td>
                  </tr>
                  <tr className="bg-green-50">
                    <td className="border border-gray-300 px-4 py-3 font-bold text-green-700">8.5</td>
                    <td className="border border-gray-300 px-4 py-3">37-38</td>
                    <td className="border border-gray-300 px-4 py-3">Very good user - very occasional inaccuracies</td>
                  </tr>
                  <tr className="bg-blue-50">
                    <td className="border border-gray-300 px-4 py-3 font-bold text-blue-700">8.0</td>
                    <td className="border border-gray-300 px-4 py-3">35-36</td>
                    <td className="border border-gray-300 px-4 py-3">Very good user - occasional inaccuracies</td>
                  </tr>
                  <tr className="bg-blue-50">
                    <td className="border border-gray-300 px-4 py-3 font-bold text-blue-700">7.5</td>
                    <td className="border border-gray-300 px-4 py-3">32-34</td>
                    <td className="border border-gray-300 px-4 py-3">Good user - occasional inaccuracies</td>
                  </tr>
                  <tr className="bg-blue-50">
                    <td className="border border-gray-300 px-4 py-3 font-bold text-blue-700">7.0</td>
                    <td className="border border-gray-300 px-4 py-3">30-31</td>
                    <td className="border border-gray-300 px-4 py-3">Good user - some inaccuracies</td>
                  </tr>
                  <tr className="bg-yellow-50">
                    <td className="border border-gray-300 px-4 py-3 font-bold text-yellow-700">6.5</td>
                    <td className="border border-gray-300 px-4 py-3">26-29</td>
                    <td className="border border-gray-300 px-4 py-3">Competent user - some inaccuracies</td>
                  </tr>
                  <tr className="bg-yellow-50">
                    <td className="border border-gray-300 px-4 py-3 font-bold text-yellow-700">6.0</td>
                    <td className="border border-gray-300 px-4 py-3">23-25</td>
                    <td className="border border-gray-300 px-4 py-3">Competent user - generally effective</td>
                  </tr>
                  <tr className="bg-orange-50">
                    <td className="border border-gray-300 px-4 py-3 font-bold text-orange-700">5.5</td>
                    <td className="border border-gray-300 px-4 py-3">18-22</td>
                    <td className="border border-gray-300 px-4 py-3">Modest user - partial command</td>
                  </tr>
                  <tr className="bg-orange-50">
                    <td className="border border-gray-300 px-4 py-3 font-bold text-orange-700">5.0</td>
                    <td className="border border-gray-300 px-4 py-3">16-17</td>
                    <td className="border border-gray-300 px-4 py-3">Modest user - limited command</td>
                  </tr>
                  <tr className="bg-red-50">
                    <td className="border border-gray-300 px-4 py-3 font-bold text-red-700">4.5</td>
                    <td className="border border-gray-300 px-4 py-3">13-15</td>
                    <td className="border border-gray-300 px-4 py-3">Limited user - basic competence</td>
                  </tr>
                  <tr className="bg-red-50">
                    <td className="border border-gray-300 px-4 py-3 font-bold text-red-700">4.0</td>
                    <td className="border border-gray-300 px-4 py-3">10-12</td>
                    <td className="border border-gray-300 px-4 py-3">Limited user - basic competence in familiar situations</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-6 grid md:grid-cols-2 gap-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-3">🎯 Target Band 7+ Tips</h4>
                <ul className="space-y-2 text-sm">
                  <li>• Aim for 30+ correct answers</li>
                  <li>• Focus on accuracy in spelling and grammar</li>
                  <li>• Practice with various English accents</li>
                  <li>• Develop note-taking skills</li>
                  <li>• Master different question types</li>
                </ul>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-3">📈 Improvement Strategies</h4>
                <ul className="space-y-2 text-sm">
                  <li>• Listen to English podcasts daily</li>
                  <li>• Watch English news and documentaries</li>
                  <li>• Practice with IELTS listening materials</li>
                  <li>• Focus on weak question types</li>
                  <li>• Time yourself during practice</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Common Mistakes Section */}
          <div className="bg-red-50 rounded-lg p-8 border-2 border-red-200">
            <h2 className="text-2xl font-bold text-red-800 mb-6 flex items-center">
              <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              Common Mistakes to Avoid
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-lg mb-3 text-red-700">Writing Errors</h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">✗</span>
                    <span>Exceeding word limits</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">✗</span>
                    <span>Spelling mistakes</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">✗</span>
                    <span>Using abbreviations (write "and" not "&")</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">✗</span>
                    <span>Incorrect capitalization</span>
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-3 text-red-700">Listening Errors</h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">✗</span>
                    <span>Not reading questions beforehand</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">✗</span>
                    <span>Getting stuck on one question</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">✗</span>
                    <span>Ignoring grammar in answers</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-red-500 mr-2">✗</span>
                    <span>Not checking answers at the end</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default IELTSListeningTest;