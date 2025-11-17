"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import PremiumResultsAnalysis from '@/components/listening/PremiumResultsAnalysis';
import { ListeningTest, ListeningSection, QuestionGroup } from '@/types/listening';

// ==================== INTERFACES ====================

type TestData = ListeningTest;
type Section = ListeningSection;

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

interface ListeningTestComponentProps {
  testId: string;
  mode?: 'exercise' | 'mockTest';
  onComplete?: (results: {
    score: number;
    totalQuestions: number;
    answers: Record<number, string | string[]>;
    bandScore: number;
    timeSpent: number;
  }) => void;
  backLink?: string;
}

// ==================== MAIN COMPONENT ====================
const ListeningTestComponent: React.FC<ListeningTestComponentProps> = ({
  testId,
  mode = 'exercise',
  onComplete,
  backLink = '/exercise/listening'
}) => {
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

        const { getListeningTest } = await import('@/lib/actions/listening-tests.actions');
        const result = await getListeningTest(testId);

        if (!result.success) {
          throw new Error(result.message || 'Failed to load test data');
        }

        if (!result.data) {
          throw new Error('No test data received');
        }

        const data: TestData = result.data as TestData;

        if (!data.sections || !Array.isArray(data.sections) || data.sections.length === 0) {
          throw new Error('Invalid test data: missing or empty sections');
        }

        setTestData(data);
        setTimeRemaining((data.timeLimit || 40) * 60);

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
        const { getPremiumStatus } = await import('@/lib/utils/premium');
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

  const isAnswerCorrect = (userAnswer: string, correctAnswer: string): boolean => {
    const userAnswerClean = userAnswer.toLowerCase().trim();
    const acceptableAnswers = correctAnswer.toLowerCase().split('/').map(a => a.trim());
    return acceptableAnswers.some(acceptable => userAnswerClean === acceptable);
  };

  const handleAnswerChange = (questionNumber: number, answer: string | string[]) => {
    setAnswers(prev => ({ ...prev, [questionNumber]: answer }));
  };

  const calculateScore = () => {
    if (!testData) return { correct: 0, total: 0, percentage: 0 };

    let correct = 0;
    let total = 0;

    try {
      testData.sections.forEach(section => {
        if (!section.questionGroups || !Array.isArray(section.questionGroups)) {
          return;
        }

        section.questionGroups.forEach(group => {
          if (!group.content) return;

          // Handle questions array
          if (group.content.questions && Array.isArray(group.content.questions)) {
            group.content.questions.forEach(q => {
              if (!q.questionNumber || !q.correctAnswer) return;

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
                if (isAnswerCorrect(userAnswer, correctAnswer)) {
                  correct++;
                }
              }
            });
          }

          // Handle items array (for matching questions)
          if (group.content.items && Array.isArray(group.content.items)) {
            group.content.items.forEach(item => {
              if (!item.questionNumber || !item.correctAnswer) return;

              total++;
              const userAnswer = answers[item.questionNumber];
              if (typeof userAnswer === 'string' && typeof item.correctAnswer === 'string') {
                if (item.correctAnswer.length === 1 && /^[A-Z]$/i.test(item.correctAnswer)) {
                  if (userAnswer.toUpperCase().trim() === item.correctAnswer.toUpperCase().trim()) {
                    correct++;
                  }
                } else {
                  if (isAnswerCorrect(userAnswer, item.correctAnswer)) {
                    correct++;
                  }
                }
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
                  if (typeof userAnswer === 'string' && typeof field.correctAnswer === 'string') {
                    if (isAnswerCorrect(userAnswer, field.correctAnswer)) {
                      correct++;
                    }
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
                    if (typeof userAnswer === 'string' && typeof item.correctAnswer === 'string') {
                      if (isAnswerCorrect(userAnswer, item.correctAnswer)) {
                        correct++;
                      }
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

  const handleSubmit = useCallback(async () => {
    setShowResults(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    
    const score = calculateScore();
    const bandScore = Math.min(9, Math.max(0, Math.round((score.correct / score.total) * 9 * 10) / 10));
    const timeSpent = (testData!.timeLimit * 60) - timeRemaining;

    // If in mock test mode, call the onComplete callback
    if (mode === 'mockTest' && onComplete) {
      onComplete({
        score: score.correct,
        totalQuestions: score.total,
        answers,
        bandScore,
        timeSpent
      });
      return;
    }

    // If in exercise mode, save to Firestore
    try {
      const { saveListeningTestResult } = await import('@/lib/actions/test-results.actions');
      const saveResult = await saveListeningTestResult({
        testId: testId,
        title: testData!.title,
        difficulty: testData!.difficulty || 'standard',
        totalQuestions: testData!.totalQuestions,
        answers: answers,
        score: score,
        bandScore: bandScore,
        timeSpent: timeSpent
      });
      
      if (saveResult.success) {
        console.log('Listening test result saved successfully');
      } else {
        console.error('Failed to save listening test result:', saveResult.message);
      }
    } catch (saveError) {
      console.error('Error saving listening test result:', saveError);
    }
  }, [testData, answers, timeRemaining, testId, mode, onComplete]);

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

  // Quick fill for testing
  const handleQuickFill = useCallback(() => {
    if (!testData) return;
    
    const newAnswers: Record<number, string | string[]> = {};
    let questionIndex = 0;
    
    const processFields = (fields: FormField[]) => {
      fields.forEach(field => {
        if (field.questionNumber && field.correctAnswer) {
          questionIndex++;
          const shouldBeWrong = questionIndex % 3 === 0 || questionIndex % 7 === 0;
          
          if (shouldBeWrong) {
            if (typeof field.correctAnswer === 'string') {
              const correctAnswerStr = field.correctAnswer as string;
              if (correctAnswerStr.length === 1 && /^[A-Z]$/i.test(correctAnswerStr)) {
                const wrongLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].filter(l => l !== correctAnswerStr.toUpperCase());
                newAnswers[field.questionNumber] = wrongLetters[Math.floor(Math.random() * wrongLetters.length)];
              } else {
                newAnswers[field.questionNumber] = 'wrong answer';
              }
            }
          } else {
            if (typeof field.correctAnswer === 'string') {
              const acceptableAnswers = (field.correctAnswer as string).split('/');
              newAnswers[field.questionNumber] = acceptableAnswers[0].trim();
            } else {
              newAnswers[field.questionNumber] = field.correctAnswer;
            }
          }
        }
        if (field.listItems) {
          processFields(field.listItems);
        }
      });
    };
    
    testData.sections.forEach(section => {
      section.questionGroups.forEach(group => {
        if (group.content.questions && Array.isArray(group.content.questions)) {
          group.content.questions.forEach(q => {
            questionIndex++;
            const shouldBeWrong = questionIndex % 3 === 0 || questionIndex % 7 === 0;
            
            if (shouldBeWrong) {
              if (typeof q.correctAnswer === 'string') {
                if (q.correctAnswer.length === 1 && /^[A-Z]$/i.test(q.correctAnswer)) {
                  const wrongLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].filter(l => l !== q.correctAnswer.toUpperCase());
                  newAnswers[q.questionNumber] = wrongLetters[Math.floor(Math.random() * wrongLetters.length)];
                } else {
                  newAnswers[q.questionNumber] = 'wrong answer';
                }
              } else if (Array.isArray(q.correctAnswer)) {
                newAnswers[q.questionNumber] = ['A', 'B'];
              }
            } else {
              if (Array.isArray(q.correctAnswer)) {
                newAnswers[q.questionNumber] = q.correctAnswer;
              } else if (typeof q.correctAnswer === 'string') {
                const acceptableAnswers = q.correctAnswer.split('/');
                newAnswers[q.questionNumber] = acceptableAnswers[0].trim();
              }
            }
          });
        }
        
        if (group.content.items && Array.isArray(group.content.items)) {
          group.content.items.forEach(item => {
            questionIndex++;
            const shouldBeWrong = questionIndex % 3 === 0 || questionIndex % 7 === 0;
            
            if (shouldBeWrong) {
              if (item.correctAnswer.length === 1 && /^[A-Z]$/i.test(item.correctAnswer)) {
                const wrongLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].filter(l => l !== item.correctAnswer.toUpperCase());
                newAnswers[item.questionNumber] = wrongLetters[Math.floor(Math.random() * wrongLetters.length)];
              } else {
                newAnswers[item.questionNumber] = 'wrong answer';
              }
            } else {
              const acceptableAnswers = item.correctAnswer.split('/');
              newAnswers[item.questionNumber] = acceptableAnswers[0].trim();
            }
          });
        }
        
        if (group.content.fields && Array.isArray(group.content.fields)) {
          processFields(group.content.fields);
        }
        
        if (group.content.sections && Array.isArray(group.content.sections)) {
          group.content.sections.forEach(section => {
            section.content.forEach(item => {
              if (item.questionNumber && item.correctAnswer) {
                questionIndex++;
                const shouldBeWrong = questionIndex % 3 === 0 || questionIndex % 7 === 0;
                
                if (shouldBeWrong) {
                  newAnswers[item.questionNumber] = 'wrong answer';
                } else {
                  const acceptableAnswers = item.correctAnswer.split('/');
                  newAnswers[item.questionNumber] = acceptableAnswers[0].trim();
                }
              }
            });
          });
        }
      });
    });
    
    setAnswers(newAnswers);
  }, [testData]);

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
          placeholder={placeholder || ""}
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
            <div key={idx} className="flex items-center gap-1">
              {item.value && !item.questionNumber && <span>{item.value}</span>}
              {item.prefix && <span>{item.prefix}</span>}
              {item.questionNumber && (
                <>
                  <span className="font-bold text-primary">{item.questionNumber}.</span>
                  {renderInput(item.questionNumber, item.inputType, item.inputPlaceholder)}
                </>
              )}
              {item.suffix && <span>{item.suffix}</span>}
            </div>
          ))}
        </div>
      );
    }
    
    return (
      <div className="flex items-center gap-2 mb-3">
        {field.label && (
          <span className="font-semibold">{field.label}</span>
        )}
        {field.value && <span>{field.value}</span>}
        {field.prefix && <span>{field.prefix}</span>}
        {field.questionNumber && (
          <>
            <span className="font-bold text-primary">{field.questionNumber}.</span>
            {renderInput(field.questionNumber, field.inputType, field.inputPlaceholder)}
          </>
        )}
        {field.suffix && <span>{field.suffix}</span>}
      </div>
    );
  };

  const renderQuestionGroup = (group: QuestionGroup, section: Section) => {
    const { content, instructions, displayType, imageUrl } = group;

    return (
      <div className="mb-8 bg-white rounded-lg p-6 border-2 border-gray-200">
        <div className="mb-4 text-primary font-semibold">{instructions}</div>

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
                <div key={q.questionNumber} className="flex items-center gap-2">
                  <span className="font-bold text-primary">{q.questionNumber}.</span>
                  {renderInput(q.questionNumber, 'select', undefined, content.options)}
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
                    {item.questionNumber && (
                      <>
                        <span className="font-semibold text-primary mr-2">[{item.questionNumber}]</span>
                        {renderInput(item.questionNumber, item.inputType || 'text')}
                      </>
                    )}
                    {item.suffix}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {displayType === 'table' && content.rows && (
          <div className="bg-gray-50 p-6 rounded">
            {content.title && <h3 className="text-xl font-bold mb-4 text-center">{content.title}</h3>}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                {content.headers && content.headers.length > 0 && (
                  <thead>
                    <tr className="bg-primary/10">
                      {content.headers.map((header, idx) => (
                        <th key={idx} className="border border-gray-300 px-4 py-3 text-left font-semibold text-primary">
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                )}
                <tbody>
                  {content.rows.map((row, rowIdx) => (
                    <tr key={rowIdx} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      {row.cells.map((cell, cellIdx) => (
                        <td key={cellIdx} className="border border-gray-300 px-4 py-3 align-top">
                          <div className="flex flex-col space-y-2">
                            {cell.text && <span>{cell.text}</span>}
                            {cell.questionNumber && (
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-primary">{cell.questionNumber}.</span>
                                {renderInput(cell.questionNumber, cell.inputType || 'text')}
                                {cell.suffix && <span className="ml-1">{cell.suffix}</span>}
                              </div>
                            )}
                          </div>
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
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
          <Link href={backLink} className="bg-primary text-white px-6 py-2 rounded hover:bg-primary">
            Back to Tests
          </Link>
        </div>
      </div>
    );
  }

  // ==================== RESULTS VIEW ====================
  if (showResults && mode === 'exercise') {
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
            
            <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800 text-center">
                ✅ Your results have been saved to your dashboard
              </p>
            </div>
            
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href={backLink} className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 font-semibold">
                Back to Tests
              </Link>
              <Link href="/dashboard" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold">
                View Dashboard
              </Link>
              <button
                onClick={() => window.location.reload()}
                className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-red-700 font-semibold"
              >
                Try Again
              </button>
            </div>
          </div>

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

  // If in mock test mode and results shown, component is unmounted (transition shown instead)
  if (showResults && mode === 'mockTest') {
    return null;
  }

  // ==================== MAIN TEST VIEW ====================
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href={backLink} className="text-primary hover:text-primary">
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
          <div className="flex gap-4 justify-center items-center">
            {/* {mode === 'exercise' && (
              <button
                onClick={handleQuickFill}
                className="bg-blue-600 text-white text-lg px-8 py-3 rounded hover:bg-blue-700 font-semibold"
              >
                🚀 Quick Fill (Test)
              </button>
            )} */}
            <button
              onClick={handleSubmit}
              className="bg-green-600 text-white text-lg px-8 py-3 rounded hover:bg-green-700 font-semibold"
            >
              Submit Test
            </button>
          </div>
          {mode === 'exercise' && (
            <p className="text-sm text-gray-500 mt-2">Quick Fill auto-answers questions for testing (70% correct, 30% wrong)</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListeningTestComponent;
