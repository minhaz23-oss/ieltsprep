"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';

import PremiumResultsAnalysis from '@/components/reading/PremiumResultsAnalysis';
import { getPremiumStatus } from '@/lib/utils/premium';

// ==================== INTERFACES ====================

interface ReadingTestComponentProps {
  testId: string;
  mode?: 'exercise' | 'mockTest';
  onComplete?: (results: { score: number; totalQuestions: number; answers: Record<number, string | string[]>; bandScore: number; timeSpent: number }) => void;
  backLink?: string;
}

interface Question {
  questionNumber: number;
  questionId: string;
  questionType: string;
  correctAnswer: string | string[];
  context?: string;
  statement?: string;
  paragraph?: string;
  person?: string;
  finding?: string;
  question?: string;
  options?: string[];
  sentenceStart?: string;
  information?: string;
}

interface TableRow {
  section: string;
  comments: string[];
}

interface TableStructure {
  headers: string[];
  rows: TableRow[];
}

interface NotePeriod {
  period: string;
  points: string[];
}

interface QuestionSection {
  sectionId: string;
  instructions: string;
  questionType: string;
  questions: Question[];
  headingsList?: string[];
  ideaList?: string[];
  researchersList?: string[];
  companiesList?: string[];
  optionsList?: string[];
  endingsList?: string[];
  summaryTitle?: string;
  wordsList?: string[]; // Word bank for SUMMARY_COMPLETION
  tableStructure?: TableStructure;
  notesTitle?: string;
  notesStructure?: NotePeriod[];
  numberOfAnswers?: number;
  options?: string[];
  diagramImages?: string[]; // Array of image URLs for DIAGRAM_LABELING
  // Deprecated: use diagramImages instead
  images?: {
    imageUrl1?: string;
    imageUrl2?: string;
  };
}

interface Passage {
  id: string;
  title: string;
  passageNumber: number;
  recommendedTime: number;
  contentUrl: string;
  questionSections: QuestionSection[];
}

interface TestData {
  test: {
    title: string;
    type: string;
    totalTime: number;
    totalQuestions: number;
    passages: Passage[];
  };
}

// ==================== MAIN COMPONENT ====================
const ReadingTestComponent: React.FC<ReadingTestComponentProps> = ({ testId, mode = 'exercise', onComplete, backLink = '/exercise/reading' }) => {
  
  // States
  const [testData, setTestData] = useState<TestData | null>(null);
  const [answers, setAnswers] = useState<Record<number, string | string[]>>({});
  const [showResults, setShowResults] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(60 * 60);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [premiumLoading, setPremiumLoading] = useState(true);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // ==================== DATA LOADING ====================
  useEffect(() => {
    const loadTestData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Load from Firestore via API
        const response = await fetch(`/api/reading-tests/${testId}`);
        
        if (!response.ok) {
          throw new Error('Failed to load test data');
        }

        const data: TestData = await response.json();

        // Validate test data structure
        if (!data.test || !data.test.passages || !Array.isArray(data.test.passages) || data.test.passages.length === 0) {
          throw new Error('Invalid test data: missing or empty passages');
        }

        setTestData(data);
        setTimeRemaining((data.test.totalTime || 60) * 60);

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

  // Helper function to check if user answer matches any acceptable answer
  const isAnswerCorrect = (userAnswer: string, correctAnswer: string): boolean => {
    const userAnswerClean = userAnswer.toLowerCase().trim();
    
    // Split correct answer by '/' to get all acceptable variations
    const acceptableAnswers = correctAnswer.toLowerCase().split('/').map(a => a.trim());
    
    // Check if user answer matches any of the acceptable answers
    return acceptableAnswers.some(acceptable => userAnswerClean === acceptable);
  };

  const handleAnswerChange = (questionNumber: number, answer: string | string[]) => {
    setAnswers(prev => ({ ...prev, [questionNumber]: answer }));
  };

  const handleSubmit = useCallback(async () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    
    const score = calculateScore();
    const bandScore = Math.min(9, Math.max(0, Math.round((score.correct / score.total) * 9 * 10) / 10));
    const timeSpent = (testData!.test.totalTime * 60) - timeRemaining;
    
    console.log('Reading handleSubmit - mode:', mode, 'onComplete:', !!onComplete);
    
    // If in mock test mode, call onComplete callback
    if (mode === 'mockTest' && onComplete) {
      console.log('Calling onComplete for mock test with results:', { score: score.correct, bandScore });
      onComplete({
        score: score.correct,
        totalQuestions: score.total,
        answers: answers,
        bandScore: bandScore,
        timeSpent: timeSpent
      });
      return;
    }
    
    console.log('Exercise mode - showing results screen');
    
    // For exercise mode, show results and save to Firestore
    setShowResults(true);
    
    try {
      const { saveReadingTestResult } = await import('@/lib/actions/test-results.actions');
      const saveResult = await saveReadingTestResult({
        testId: testId,
        title: testData!.test.title,
        difficulty: testData!.test.type || 'standard',
        totalQuestions: testData!.test.totalQuestions,
        answers: answers,
        score: score,
        bandScore: bandScore,
        timeSpent: timeSpent
      });
      
      if (saveResult.success) {
        console.log('Reading test result saved successfully');
      } else {
        console.error('Failed to save reading test result:', saveResult.message);
      }
    } catch (saveError) {
      console.error('Error saving reading test result:', saveError);
      // Don't fail the test if save fails - user still sees results
    }
  }, [testData, answers, timeRemaining, testId, mode, onComplete]);

  // Quick fill for testing - fills 70% correct, 30% wrong
  const handleQuickFill = useCallback(() => {
    if (!testData) return;
    
    const newAnswers: Record<number, string | string[]> = {};
    let questionIndex = 0;
    
    testData.test.passages.forEach(passage => {
      passage.questionSections.forEach(section => {
        section.questions.forEach(q => {
          questionIndex++;
          // Make every 3rd or 4th answer wrong for testing
          const shouldBeWrong = questionIndex % 3 === 0 || questionIndex % 7 === 0;
          
          if (shouldBeWrong) {
            // Provide wrong answer
            if (typeof q.correctAnswer === 'string') {
              const correctAnswerStr = q.correctAnswer as string;
              if (correctAnswerStr.length <= 3 && /^[A-Z]+$/i.test(correctAnswerStr)) {
                // For letter answers, pick a different letter
                const wrongLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].filter(l => l !== correctAnswerStr.toUpperCase());
                newAnswers[q.questionNumber] = wrongLetters[Math.floor(Math.random() * wrongLetters.length)];
              } else if (['TRUE', 'FALSE', 'NOT GIVEN'].includes(correctAnswerStr.toUpperCase())) {
                const options = ['TRUE', 'FALSE', 'NOT GIVEN'].filter(o => o !== correctAnswerStr.toUpperCase());
                newAnswers[q.questionNumber] = options[Math.floor(Math.random() * options.length)];
              } else if (['YES', 'NO', 'NOT GIVEN'].includes(correctAnswerStr.toUpperCase())) {
                const options = ['YES', 'NO', 'NOT GIVEN'].filter(o => o !== correctAnswerStr.toUpperCase());
                newAnswers[q.questionNumber] = options[Math.floor(Math.random() * options.length)];
              } else {
                // For text answers, provide a plausible wrong answer
                newAnswers[q.questionNumber] = 'wrong answer';
              }
            }
          } else {
            // Provide correct answer
            if (Array.isArray(q.correctAnswer)) {
              newAnswers[q.questionNumber] = q.correctAnswer;
            } else if (typeof q.correctAnswer === 'string') {
              // Handle multiple acceptable answers separated by '/'
              const acceptableAnswers = q.correctAnswer.split('/');
              newAnswers[q.questionNumber] = acceptableAnswers[0].trim();
            }
          }
        });
      });
    });
    
    setAnswers(newAnswers);
  }, [testData]);

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
      testData.test.passages.forEach(passage => {
        passage.questionSections.forEach(section => {
          section.questions.forEach(q => {
            if (!q.questionNumber || !q.correctAnswer) {
              return;
            }

            total++;
            const userAnswer = answers[q.questionNumber];
            const correctAnswer = q.correctAnswer;

            if (typeof userAnswer === 'string' && typeof correctAnswer === 'string') {
              // For letter answers (A, B, C, etc.), use exact match
              if (correctAnswer.length <= 3 && /^[A-Z]+$/i.test(correctAnswer)) {
                if (userAnswer.toUpperCase().trim() === correctAnswer.toUpperCase().trim()) {
                  correct++;
                }
              } else {
                // For text answers, check against multiple acceptable answers
                if (isAnswerCorrect(userAnswer, correctAnswer)) {
                  correct++;
                }
              }
            } else if (Array.isArray(correctAnswer) && Array.isArray(userAnswer)) {
              const userSet = new Set(userAnswer.map(a => a.toUpperCase()));
              const correctSet = new Set(correctAnswer.map(a => a.toUpperCase()));
              if (userSet.size === correctSet.size && [...correctSet].every(a => userSet.has(a))) {
                correct++;
              }
            }
          });
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
    options?: string[]
  ) => {
    if (inputType === 'select' || inputType === 'HEADING_MATCHING' || inputType === 'FEATURE_MATCHING' || inputType === 'SENTENCE_COMPLETION') {
      return (
        <select
          className="inline-block border-2 border-primary bg-yellow-50 px-3 py-1 mx-1 min-w-[80px] rounded font-sans text-base"
          value={answers[questionNumber] as string || ''}
          onChange={(e) => handleAnswerChange(questionNumber, e.target.value)}
        >
          <option value="">{questionNumber}</option>
          {options?.map((option, idx) => {
            // Extract just the letter/number if it's in format "A - text"
            const value = option.split(' - ')[0].trim();
            return (
              <option key={idx} value={value}>{value}</option>
            );
          }) || ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'].slice(0, 10).map(letter => (
            <option key={letter} value={letter}>{letter}</option>
          ))}
        </select>
      );
    } else if (inputType === 'TRUE_FALSE_NOT_GIVEN' || inputType === 'YES_NO_NOT_GIVEN') {
      const options = inputType === 'YES_NO_NOT_GIVEN' 
        ? ['YES', 'NO', 'NOT GIVEN'] 
        : ['TRUE', 'FALSE', 'NOT GIVEN'];
      
      return (
        <select
          className="inline-block border-2 border-primary bg-yellow-50 px-3 py-1 mx-1 min-w-[120px] rounded font-sans text-base"
          value={answers[questionNumber] as string || ''}
          onChange={(e) => handleAnswerChange(questionNumber, e.target.value)}
        >
          <option value="">{questionNumber}</option>
          {options.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
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

  const renderQuestionSection = (section: QuestionSection, passageContent: string) => {
    return (
      <div className="mb-8 bg-white rounded-lg p-6 border-2 border-gray-200">
        <div className="mb-4 text-primary font-semibold">{section.instructions}</div>

        {/* Images - Display before questions */}
        {section.images && (
          <div className="mb-6 space-y-4">
            {section.images.imageUrl1 && (
              <div className="flex justify-center">
                <img 
                  src={section.images.imageUrl1} 
                  alt="Diagram 1" 
                  className="max-w-full h-auto rounded border-2 border-gray-300"
                />
              </div>
            )}
            {section.images.imageUrl2 && (
              <div className="flex justify-center">
                <img 
                  src={section.images.imageUrl2} 
                  alt="Diagram 2" 
                  className="max-w-full h-auto rounded border-2 border-gray-300"
                />
              </div>
            )}
          </div>
        )}

        {/* TABLE_COMPLETION */}
        {section.questionType === 'TABLE_COMPLETION' && section.tableStructure && (
          <div className="bg-gray-50 p-6 rounded overflow-x-auto">
            <table className="w-full border-collapse border-2 border-gray-300">
              <thead>
                <tr className="bg-primary/10">
                  {section.tableStructure.headers?.map((header, idx) => (
                    <th key={idx} className="border-2 border-gray-300 px-4 py-3 text-left font-bold">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {section.tableStructure.rows?.map((row: any, rowIdx) => {
                  // Handle different row formats
                  const cells = row.section && row.comments 
                    ? [row.section, ...row.comments]
                    : Object.values(row);
                  
                  return (
                    <tr key={rowIdx} className="border-2 border-gray-300">
                      {cells.map((cell: any, cellIdx) => {
                        // If cell is an array (like uses field), process each item
                        const cellContent = Array.isArray(cell) ? cell : [cell];
                        
                        return (
                          <td key={cellIdx} className="border-2 border-gray-300 px-4 py-3 align-top">
                            {cellContent.map((content: string, contentIdx) => {
                              if (!content) return null;
                              
                              const parts: string[] = [];
                              const questionNums: number[] = [];
                              let lastIndex = 0;
                              const regex = /(\d+)_____/g;
                              let match;
                              
                              while ((match = regex.exec(content)) !== null) {
                                parts.push(content.substring(lastIndex, match.index));
                                questionNums.push(parseInt(match[1]));
                                lastIndex = regex.lastIndex;
                              }
                              parts.push(content.substring(lastIndex));
                              
                              return (
                                <div key={contentIdx} className="mb-1">
                                  {parts.map((part, partIdx) => (
                                    <span key={partIdx}>
                                      {part}
                                      {questionNums[partIdx] && (
                                        <span className="inline-flex items-center gap-1 ml-1">
                                          <span className="font-bold text-primary">{questionNums[partIdx]}</span>
                                          {renderInput(questionNums[partIdx], 'FILL_IN_BLANK')}
                                        </span>
                                      )}
                                    </span>
                                  ))}
                                </div>
                              );
                            })}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* NOTE_COMPLETION */}
        {section.questionType === 'NOTE_COMPLETION' && section.notesStructure && (
          <div className="bg-gray-50 p-6 rounded">
            {section.notesTitle && <h3 className="text-xl font-bold mb-4 text-center">{section.notesTitle}</h3>}
            <div className="space-y-4">
              {section.notesStructure.map((period, periodIdx) => (
                <div key={periodIdx} className="mb-4">
                  <h4 className="font-bold text-lg mb-2">{period.period}</h4>
                  <ul className="ml-6 space-y-2">
                    {period.points.map((point, pointIdx) => {
                      const parts: string[] = [];
                      const questionNums: number[] = [];
                      let lastIndex = 0;
                      const regex = /(\d+)_____/g;
                      let match;
                      
                      while ((match = regex.exec(point)) !== null) {
                        parts.push(point.substring(lastIndex, match.index));
                        questionNums.push(parseInt(match[1]));
                        lastIndex = regex.lastIndex;
                      }
                      parts.push(point.substring(lastIndex));
                      
                      return (
                        <li key={pointIdx} className="flex items-baseline flex-wrap gap-1">
                          <span className="mr-1">•</span>
                          {parts.map((part, partIdx) => (
                            <span key={partIdx}>
                              {part}
                              {questionNums[partIdx] && (
                                <span className="inline-flex items-center gap-1 ml-1">
                                  <span className="font-bold text-primary">{questionNums[partIdx]}</span>
                                  {renderInput(questionNums[partIdx], 'FILL_IN_BLANK')}
                                </span>
                              )}
                            </span>
                          ))}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PARAGRAPH_MATCHING */}
        {section.questionType === 'PARAGRAPH_MATCHING' && (
          <div className="space-y-4">
            {section.questions.map(q => {
              // Extract paragraph range from instructions (e.g., "A-E" from "Write the correct letter, A-E")
              const match = section.instructions.match(/\b([A-Z])-([A-Z])\b/);
              let paragraphOptions = ['A', 'B', 'C', 'D', 'E', 'F'];
              
              if (match) {
                const startChar = match[1].charCodeAt(0);
                const endChar = match[2].charCodeAt(0);
                paragraphOptions = [];
                for (let i = startChar; i <= endChar; i++) {
                  paragraphOptions.push(String.fromCharCode(i));
                }
              }
              
              return (
                <div key={q.questionNumber} className="bg-gray-50 p-4 rounded">
                  <div className="flex items-start gap-3">
                    <span className="font-bold text-primary">{q.questionNumber}.</span>
                    <div className="flex-1">
                      <p className="mb-2">{q.information}</p>
                      <select
                        className="border-2 border-primary bg-yellow-50 px-3 py-2 rounded font-sans text-base"
                        value={answers[q.questionNumber] as string || ''}
                        onChange={(e) => handleAnswerChange(q.questionNumber, e.target.value)}
                      >
                        <option value="">Select</option>
                        {paragraphOptions.map(letter => (
                          <option key={letter} value={letter}>{letter}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TRUE_FALSE_NOT_GIVEN */}
        {section.questionType === 'TRUE_FALSE_NOT_GIVEN' && (
          <div className="space-y-4">
            {section.questions.map(q => (
              <div key={q.questionNumber} className="bg-gray-50 p-4 rounded">
                <div className="flex items-start gap-3">
                  <span className="font-bold text-primary">{q.questionNumber}.</span>
                  <div className="flex-1">
                    <p className="mb-2">{q.statement}</p>
                    {renderInput(q.questionNumber, 'TRUE_FALSE_NOT_GIVEN')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* YES_NO_NOT_GIVEN */}
        {section.questionType === 'YES_NO_NOT_GIVEN' && (
          <div className="space-y-4">
            {section.questions.map(q => (
              <div key={q.questionNumber} className="bg-gray-50 p-4 rounded">
                <div className="flex items-start gap-3">
                  <span className="font-bold text-primary">{q.questionNumber}.</span>
                  <div className="flex-1">
                    <p className="mb-2">{q.statement}</p>
                    {renderInput(q.questionNumber, 'YES_NO_NOT_GIVEN')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* HEADING_MATCHING */}
        {section.questionType === 'HEADING_MATCHING' && (section.optionsList || section.headingsList) && (
          <div>
            <div className="bg-primary/10 p-4 rounded mb-4 border border-primary/20">
              <div className="font-bold mb-2">List of Headings</div>
              {(section.optionsList || section.headingsList)?.map((heading, idx) => (
                <div key={idx} className="mb-1">
                  {heading}
                </div>
              ))}
            </div>
            <div className="space-y-3">
              {section.questions.map(q => (
                <div key={q.questionNumber} className="flex items-center gap-2 bg-gray-50 p-3 rounded">
                  <span className="font-semibold min-w-[100px]">{q.questionNumber}. {q.paragraph}</span>
                  {renderInput(q.questionNumber, 'HEADING_MATCHING', undefined, section.optionsList || section.headingsList)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FEATURE_MATCHING */}
        {section.questionType === 'FEATURE_MATCHING' && (
          <div>
            {/* Display the options list */}
            {(() => {
              const listToShow = section.optionsList || section.ideaList || section.researchersList || section.companiesList;
              const listTitle = section.optionsList ? 'List of Options' :
                               section.ideaList ? 'List of Ideas' :
                               section.researchersList ? 'List of Researchers' :
                               section.companiesList ? 'List of Companies' : '';

              return listToShow && Array.isArray(listToShow) && (
                <div className="bg-primary/10 p-4 rounded mb-4 border border-primary/20">
                  <div className="font-bold mb-2">{listTitle}</div>
                  {listToShow.map((item: string, idx: number) => (
                    <div key={idx} className="mb-1">
                      {item}
                    </div>
                  ))}
                </div>
              );
            })()}
            <div className="space-y-3">
              {section.questions.map(q => {
                // Updated with better fallback - now includes all possible field names
                const displayText = q.statement || q.person || q.finding || q.context || '';
                const optionsList = section.optionsList || section.ideaList || section.researchersList || section.companiesList || [];

                // Log warning if no text found
                if (!displayText && typeof window !== 'undefined') {
                  console.warn(`FEATURE_MATCHING: Missing text for question ${q.questionNumber}`);
                }

                return (
                  <div key={q.questionNumber} className="flex items-start gap-2 bg-gray-50 p-3 rounded">
                    <span className="font-semibold min-w-[40px]">{q.questionNumber}.</span>
                    <div className="flex-1">
                      <span>{displayText || `[Question ${q.questionNumber} text missing]`}</span>
                    </div>
                    {renderInput(q.questionNumber, 'FEATURE_MATCHING', undefined, optionsList)}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SUMMARY_COMPLETION */}
        {section.questionType === 'SUMMARY_COMPLETION' && (
          <div className="bg-gray-50 p-6 rounded">
            {section.summaryTitle && <h3 className="text-xl font-bold mb-4 text-center">{section.summaryTitle}</h3>}
            
            {/* Show word bank if available */}
            {section.wordsList && section.wordsList.length > 0 && (
              <div className="bg-primary/10 p-4 rounded mb-4 border border-primary/20">
                <div className="font-bold mb-2">Choose words from the list:</div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {section.wordsList.map((word: string, idx: number) => (
                    <div key={idx} className="text-sm">
                      {word}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="space-y-3 text-gray-800 leading-relaxed">
              {section.questions.map(q => {
                // Split context to get text before and after the blank
                const parts = q.context?.split('_____') || [q.context || ''];
                const beforeText = parts[0];
                const afterText = parts[1];
                
                return (
                  <div key={q.questionNumber} className="flex items-baseline flex-wrap gap-1">
                    <span>{beforeText}</span>
                    <span className="inline-flex items-center gap-1">
                      <span className="font-bold text-primary">{q.questionNumber}</span>
                      {renderInput(q.questionNumber, 'FILL_IN_BLANK')}
                    </span>
                    {afterText && <span>{afterText}</span>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* MULTIPLE_CHOICE */}
        {section.questionType === 'MULTIPLE_CHOICE' && (
          <div className="space-y-6">
            {section.questions.map(q => (
              <div key={q.questionNumber} className="border-l-4 border-primary pl-4">
                <div className="mb-3">
                  <span className="font-bold text-primary mr-2">{q.questionNumber}.</span>
                  <span className="font-semibold">{q.question}</span>
                </div>
                {q.options && (
                  <div className="ml-8 space-y-2">
                    {q.options.map((opt, idx) => (
                      <div key={idx} className="flex items-start">
                        <span className="font-bold mr-2 text-gray-600">{opt.charAt(0)}</span>
                        <span>{opt.substring(4)}</span>
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

        {/* SENTENCE_COMPLETION - with endings list */}
        {section.questionType === 'SENTENCE_COMPLETION' && section.endingsList && (
          <div>
            <div className="bg-primary/10 p-4 rounded mb-4 border border-primary/20">
              <div className="font-bold mb-2">Sentence Endings</div>
              {section.endingsList.map((ending, idx) => (
                <div key={idx} className="mb-1">
                  {ending}
                </div>
              ))}
            </div>
            <div className="space-y-3">
              {section.questions.map(q => {
                // Better error handling for sentence start
                const sentenceText = q.sentenceStart || q.context || '';
                if (!sentenceText && typeof window !== 'undefined') {
                  console.warn(`SENTENCE_COMPLETION: Missing sentenceStart for question ${q.questionNumber}`);
                }
                
                return (
                  <div key={q.questionNumber} className="flex items-start gap-2 bg-gray-50 p-3 rounded">
                    <span className="font-semibold">{q.questionNumber}.</span>
                    <div className="flex-1">
                      <span>{sentenceText || `[Question ${q.questionNumber} text missing]`}</span>
                      {renderInput(q.questionNumber, 'SENTENCE_COMPLETION', undefined, section.endingsList)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* SENTENCE_COMPLETION - fill in the blank style */}
        {section.questionType === 'SENTENCE_COMPLETION' && !section.endingsList && (
          <div className="space-y-3">
            {section.questions.map(q => {
              // Better fallback for context
              const contextText = q.context || q.sentenceStart || '';
              
              if (!contextText && typeof window !== 'undefined') {
                console.warn(`SENTENCE_COMPLETION: Missing context for question ${q.questionNumber}`);
              }
              
              // Split context to get text before and after the blank
              const parts = contextText.split('_____');
              const beforeText = parts[0] || contextText;
              const afterText = parts[1] || '';
              
              return (
                <div key={q.questionNumber} className="flex items-baseline flex-wrap gap-1 bg-gray-50 p-3 rounded">
                  <span className="font-semibold min-w-[40px]">{q.questionNumber}.</span>
                  <span>{beforeText || `[Question ${q.questionNumber} text missing]`}</span>
                  {renderInput(q.questionNumber, 'FILL_IN_BLANK')}
                  {afterText && <span>{afterText}</span>}
                </div>
              );
            })}
          </div>
        )}

        {/* MULTIPLE_CHOICE_MULTIPLE_ANSWERS */}
        {section.questionType === 'MULTIPLE_CHOICE_MULTIPLE_ANSWERS' && section.options && (
          <div>
            {section.options && (
              <div className="bg-gray-50 p-4 rounded mb-4">
                {section.options.map((opt, idx) => {
                  // Extract letter from format "A - text"
                  const parts = opt.split(' - ');
                  const letter = parts[0].trim();
                  const text = parts.slice(1).join(' - ').trim();
                  return (
                    <div key={idx} className="mb-2">
                      <span className="font-bold mr-2">{letter}</span>
                      {text}
                    </div>
                  );
                })}
              </div>
            )}
            <div className="flex gap-4 flex-wrap">
              {section.questions.map(q => (
                <div key={q.questionNumber} className="flex items-center gap-2">
                  <span className="font-bold text-primary">{q.questionNumber}.</span>
                  {renderInput(q.questionNumber, 'select', undefined, section.options)}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DIAGRAM_LABELING */}
        {section.questionType === 'DIAGRAM_LABELING' && (
          <div className="space-y-4">
            {/* Display diagram images if available */}
            {section.diagramImages && section.diagramImages.length > 0 && (
              <div className="space-y-4 mb-6">
                {section.diagramImages.map((imageUrl, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-lg border border-gray-200">
                    <img 
                      src={imageUrl} 
                      alt={`Diagram ${idx + 1}`}
                      className="max-w-full h-auto mx-auto rounded"
                      style={{ maxHeight: '500px' }}
                    />
                  </div>
                ))}
              </div>
            )}
            
            {/* Question inputs */}
            <div className="space-y-3">
              {section.questions.map(q => (
                <div key={q.questionNumber} className="flex items-center gap-3 bg-gray-50 p-3 rounded">
                  <span className="font-bold text-primary min-w-[40px]">{q.questionNumber}.</span>
                  <div className="flex-1">
                    <span className="text-gray-700">{q.context}</span>
                  </div>
                  {renderInput(q.questionNumber, 'FILL_IN_BLANK')}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SHORT_ANSWER - for questions that need short text answers */}
        {section.questionType === 'SHORT_ANSWER' && (
          <div className="space-y-4">
            {section.questions.map(q => (
              <div key={q.questionNumber} className="bg-gray-50 p-4 rounded">
                <div className="flex items-start gap-3">
                  <span className="font-bold text-primary">{q.questionNumber}.</span>
                  <div className="flex-1">
                    <p className="mb-2">{q.question}</p>
                    {renderInput(q.questionNumber, 'FILL_IN_BLANK')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  // ==================== LOADING & ERROR STATES ====================
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading IELTS Reading Test...</p>
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
                <div className="text-2xl font-bold">{formatTime((testData.test.totalTime * 60) - timeRemaining)}</div>
                <div className="text-sm text-gray-600">Time Taken</div>
              </div>
            </div>
            
            {/* Save Confirmation Notice */}
            <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800 text-center">
                ✅ Your results have been saved to your dashboard
              </p>
            </div>
            
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href={backLink} className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 font-semibold">
                Back to Tests
              </Link>
              {mode === 'exercise' && (
                <Link href="/exercise/writing" className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-semibold">
                  Continue to Writing →
                </Link>
              )}
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
              <Link href={backLink} className="text-primary hover:text-primary">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <div>
                <h1 className="text-2xl font-bold">{testData.test.title}</h1>
                <p className="text-sm text-gray-600">
                  {testData.test.totalQuestions} Questions
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
        {testData.test.passages.map((passage) => (
          <div key={passage.id} className="mb-12">
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-2">{passage.title}</h2>
              <p className="text-gray-600">Recommended time: {passage.recommendedTime} minutes</p>
            </div>
            
            {/* Passage Content */}
            <div className="bg-white rounded-lg p-6 mb-6 border-2 border-gray-200">
              <div className="prose max-w-none">
                <div className="text-black leading-relaxed whitespace-pre-line">
                  {passage.contentUrl}
                </div>
              </div>
            </div>

            {/* Questions */}
            {passage.questionSections.map((section, idx) => (
              <div key={idx}>
                {renderQuestionSection(section, passage.contentUrl)}
              </div>
            ))}
          </div>
        ))}

        {/* Submit Button */}
        <div className="text-center mt-12 mb-8">
          <div className="flex gap-4 justify-center items-center">          {mode === 'exercise' && (
            <button
              onClick={handleQuickFill}
              className="bg-blue-600 text-white text-lg px-8 py-3 rounded hover:bg-blue-700 font-semibold"
            >
              🚀 Quick Fill (Test)
            </button>)}
            <button
              onClick={handleSubmit}
              className="bg-green-600 text-white text-lg px-8 py-3 rounded hover:bg-green-700 font-semibold"
            >
              Submit Test
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-2">Quick Fill auto-answers questions for testing (70% correct, 30% wrong)</p>
        </div>
      </div>
    </div>
  );
};

export default ReadingTestComponent;
