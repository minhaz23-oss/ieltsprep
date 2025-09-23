"use client";

import React from 'react';

// Types matching the actual data structure from the listening test
interface FormField {
  label?: string;
  value?: string;
  prefix?: string;
  suffix?: string;
  questionNumber?: number;
  inputType?: 'text' | 'select' | 'multiselect';
  correctAnswer?: string | string[];
  inputPlaceholder?: string;
  isStatic?: boolean;
  isExample?: boolean;
  isSection?: boolean;
  sectionTitle?: string;
  isList?: boolean;
  listItems?: FormField[];
}

interface QuestionGroupContent {
  type: 'form' | 'multiple-choice' | 'multiple-choice-individual' | 'matching' | 'note-completion';
  title?: string;
  questionText?: string;
  options?: Array<{ letter: string; text: string }>;
  questions?: Array<{
    questionNumber: number;
    questionText?: string;
    text?: string;
    correctAnswer: string | string[];
    options?: Array<{ letter: string; text: string }>;
  }>;
  matchingOptions?: Array<{ letter: string; text: string }>;
  sectionTitle?: string;
  items?: Array<{
    questionNumber: number;
    text: string;
    correctAnswer: string;
  }>;
  fields?: FormField[];
  sections?: Array<{
    sectionTitle: string;
    content: Array<{
      text?: string;
      questionNumber?: number;
      inputType?: string;
      correctAnswer?: string;
      prefix?: string;
      suffix?: string;
      isStatic?: boolean;
      isBullet?: boolean;
    }>;
  }>;
}

interface QuestionGroup {
  groupId: string;
  instructions: string;
  displayType: 'form' | 'multiple-answer' | 'single-choice' | 'matching' | 'notes';
  imageUrl?: string;
  content: QuestionGroupContent;
}

interface Section {
  id: number;
  title: string;
  audioUrl: string;
  imageUrl?: string;
  questionGroups: QuestionGroup[];
}

interface TestData {
  id: string;
  title: string;
  difficulty: string;
  totalQuestions: number;
  timeLimit: number;
  metadata: {
    tags: string[];
    description: string;
  };
  sections: Section[];
}

interface AnswerAnalysis {
  questionNumber: number;
  userAnswer: string | string[];
  correctAnswer: string | string[];
  isCorrect: boolean;
  questionText?: string;
  questionType: string;
  explanation: string;
  grammarPoint?: string;
}

interface PremiumResultsAnalysisProps {
  testData: TestData;
  answers: Record<number, string | string[]>;
  isPremium: boolean;
}

const PremiumResultsAnalysis: React.FC<PremiumResultsAnalysisProps> = ({
  testData,
  answers,
  isPremium
}) => {
  // Generate grammatical explanations for different question types
  const generateExplanation = (
    questionNumber: number,
    userAnswer: string | string[],
    correctAnswer: string | string[],
    questionType: string,
    questionText?: string
  ): { explanation: string; grammarPoint?: string } => {
    const userStr = Array.isArray(userAnswer) ? userAnswer.join(', ') : (userAnswer || '');
    const correctStr = Array.isArray(correctAnswer) ? correctAnswer.join(', ') : correctAnswer;
    
    // Common grammatical explanations based on question types
    switch (questionType) {
      case 'fill-blank':
      case 'note-completion':
        if (userStr.toLowerCase() !== correctStr.toLowerCase()) {
          return {
            explanation: `The correct answer is "${correctStr}". This type of question requires exact word matching from the audio. Listen for specific vocabulary and ensure proper spelling.`,
            grammarPoint: 'Word Form & Spelling: In IELTS listening, answers must match exactly what is heard. Pay attention to singular/plural forms, verb tenses, and exact spelling.'
          };
        }
        break;
        
      case 'multiple-choice':
        return {
          explanation: `The correct answer is "${correctStr}". Multiple choice questions test your ability to identify specific information and distinguish between similar options.`,
          grammarPoint: 'Comprehension: Listen for key phrases and synonyms. The correct answer may be paraphrased differently from what you hear.'
        };
        
      case 'matching':
        return {
          explanation: `The correct match is "${correctStr}". Matching questions require you to connect related information from different parts of the audio.`,
          grammarPoint: 'Information Linking: Pay attention to connecting words, pronouns, and references that link different pieces of information together.'
        };
        
      case 'form-completion':
        if (userStr.toLowerCase() !== correctStr.toLowerCase()) {
          // Analyze common form completion errors
          if (userStr.length === 0) {
            return {
              explanation: `You left this blank. The correct answer is "${correctStr}". Form completion requires listening for specific details like names, dates, numbers, or descriptive words.`,
              grammarPoint: 'Detail Recognition: Focus on factual information such as proper nouns, numbers, and specific descriptive terms.'
            };
          } else if (userStr.toLowerCase().includes(correctStr.toLowerCase()) || correctStr.toLowerCase().includes(userStr.toLowerCase())) {
            return {
              explanation: `Close, but not exact. You wrote "${userStr}" but the correct answer is "${correctStr}". Word limits and exact forms matter in IELTS.`,
              grammarPoint: 'Precision: IELTS requires exact answers. Check word limits (e.g., "ONE WORD ONLY") and ensure you use the exact form heard.'
            };
          } else {
            return {
              explanation: `The correct answer is "${correctStr}". You may have misheard or confused this with similar-sounding information.`,
              grammarPoint: 'Active Listening: Practice distinguishing between similar sounds and words. Context clues can help verify your answer.'
            };
          }
        }
        break;
        
      default:
        return {
          explanation: `The correct answer is "${correctStr}". Review the audio section and practice identifying key information for this question type.`,
          grammarPoint: 'General Strategy: Always read questions before listening, underline key words, and listen for synonyms and paraphrasing.'
        };
    }
    
    return {
      explanation: `Correct! You answered "${userStr}" which matches the expected answer.`,
      grammarPoint: 'Well done! Continue practicing to maintain this level of accuracy.'
    };
  };

  // Analyze all answers
  const analyzeAnswers = (): AnswerAnalysis[] => {
    const analyses: AnswerAnalysis[] = [];
    
    testData.sections.forEach(section => {
      section.questionGroups.forEach(group => {
        // Handle different content types
        if (group.content.questions) {
          group.content.questions.forEach(q => {
            const userAnswer = answers[q.questionNumber];
            const isCorrect = checkAnswer(userAnswer, q.correctAnswer);
            const { explanation, grammarPoint } = generateExplanation(
              q.questionNumber,
              userAnswer,
              q.correctAnswer,
              group.displayType,
              q.questionText || q.text
            );
            
            analyses.push({
              questionNumber: q.questionNumber,
              userAnswer: userAnswer || '',
              correctAnswer: q.correctAnswer,
              isCorrect,
              questionText: q.questionText || q.text,
              questionType: group.displayType,
              explanation,
              grammarPoint
            });
          });
        }
        
        if (group.content.items) {
          group.content.items.forEach(item => {
            const userAnswer = answers[item.questionNumber];
            const isCorrect = checkAnswer(userAnswer, item.correctAnswer);
            const { explanation, grammarPoint } = generateExplanation(
              item.questionNumber,
              userAnswer,
              item.correctAnswer,
              group.displayType,
              item.text
            );
            
            analyses.push({
              questionNumber: item.questionNumber,
              userAnswer: userAnswer || '',
              correctAnswer: item.correctAnswer,
              isCorrect,
              questionText: item.text,
              questionType: group.displayType,
              explanation,
              grammarPoint
            });
          });
        }
        
        if (group.content.fields) {
          const processFields = (fields: FormField[]) => {
            fields.forEach(field => {
              if (field.questionNumber && field.correctAnswer) {
                const userAnswer = answers[field.questionNumber];
                const isCorrect = checkAnswer(userAnswer, field.correctAnswer);
                const { explanation, grammarPoint } = generateExplanation(
                  field.questionNumber,
                  userAnswer,
                  field.correctAnswer,
                  group.displayType,
                  field.label
                );
                
                analyses.push({
                  questionNumber: field.questionNumber,
                  userAnswer: userAnswer || '',
                  correctAnswer: field.correctAnswer,
                  isCorrect,
                  questionText: field.label,
                  questionType: group.displayType,
                  explanation,
                  grammarPoint
                });
              }
              if (field.listItems) {
                processFields(field.listItems);
              }
            });
          };
          processFields(group.content.fields);
        }
        
        if (group.content.sections) {
          group.content.sections.forEach(section => {
            section.content.forEach(item => {
              if (item.questionNumber && item.correctAnswer) {
                const userAnswer = answers[item.questionNumber];
                const isCorrect = checkAnswer(userAnswer, item.correctAnswer);
                const { explanation, grammarPoint } = generateExplanation(
                  item.questionNumber,
                  userAnswer,
                  item.correctAnswer,
                  group.displayType,
                  item.text
                );
                
                analyses.push({
                  questionNumber: item.questionNumber,
                  userAnswer: userAnswer || '',
                  correctAnswer: item.correctAnswer,
                  isCorrect,
                  questionText: item.text,
                  questionType: group.displayType,
                  explanation,
                  grammarPoint
                });
              }
            });
          });
        }
      });
    });
    
    return analyses.sort((a, b) => a.questionNumber - b.questionNumber);
  };

  // Check if answer is correct
  const checkAnswer = (userAnswer: string | string[] | undefined, correctAnswer: string | string[]): boolean => {
    if (!userAnswer) return false;
    
    if (Array.isArray(correctAnswer) && Array.isArray(userAnswer)) {
      const userSet = new Set(userAnswer.map(a => a.toUpperCase()));
      const correctSet = new Set(correctAnswer.map(a => a.toUpperCase()));
      return userSet.size === correctSet.size && [...correctSet].every(a => userSet.has(a));
    } else if (typeof userAnswer === 'string' && typeof correctAnswer === 'string') {
      return userAnswer.toLowerCase().trim() === correctAnswer.toLowerCase().trim();
    }
    return false;
  };

  const analyses = analyzeAnswers();
  const incorrectAnswers = analyses.filter(a => !a.isCorrect);

  if (!isPremium) {
    return (
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-6 border-2 border-amber-200">
        <div className="text-center">
          <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-amber-800 mb-2">Premium Feature</h3>
          <p className="text-amber-700 mb-4">
            Unlock detailed answer analysis with grammatical explanations to improve your IELTS score!
          </p>
          <div className="bg-white rounded-lg p-4 mb-4">
            <h4 className="font-semibold text-gray-800 mb-2">Premium features include:</h4>
            <ul className="text-left text-sm text-gray-600 space-y-1">
              <li>✓ Detailed explanations for incorrect answers</li>
              <li>✓ Grammatical analysis and learning points</li>
              <li>✓ Question-type specific strategies</li>
              <li>✓ Personalized improvement recommendations</li>
            </ul>
          </div>
          <button className="bg-amber-500 text-white px-6 py-2 rounded-lg hover:bg-amber-600 font-semibold">
            Upgrade to Premium
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border-2 border-blue-200">
        <h3 className="text-xl font-bold text-blue-800 mb-4 flex items-center">
          <svg className="w-6 h-6 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
          Premium Answer Analysis
        </h3>
        
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-green-100 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-700">{analyses.filter(a => a.isCorrect).length}</div>
            <div className="text-sm text-green-600">Correct Answers</div>
          </div>
          <div className="bg-red-100 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-700">{incorrectAnswers.length}</div>
            <div className="text-sm text-red-600">Incorrect Answers</div>
          </div>
          <div className="bg-blue-100 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-700">{analyses.length}</div>
            <div className="text-sm text-blue-600">Total Questions</div>
          </div>
        </div>
      </div>

      {incorrectAnswers.length > 0 && (
        <div className="bg-white rounded-lg p-6 border-2 border-red-200">
          <h4 className="text-lg font-bold text-red-800 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            Detailed Analysis of Incorrect Answers
          </h4>
          
          <div className="space-y-4">
            {incorrectAnswers.map((analysis, index) => (
              <div key={analysis.questionNumber} className="border-l-4 border-red-400 pl-4 py-3 bg-red-50 rounded-r-lg">
                <div className="flex items-start justify-between mb-2">
                  <h5 className="font-semibold text-red-800">
                    Question {analysis.questionNumber}
                    {analysis.questionText && (
                      <span className="text-sm text-gray-600 font-normal ml-2">
                        ({analysis.questionText})
                      </span>
                    )}
                  </h5>
                  <span className="text-xs bg-red-200 text-red-700 px-2 py-1 rounded">
                    {analysis.questionType}
                  </span>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4 mb-3">
                  <div>
                    <span className="text-sm font-medium text-gray-700">Your Answer:</span>
                    <div className="bg-red-100 p-2 rounded text-red-800 font-mono">
                      {Array.isArray(analysis.userAnswer) 
                        ? analysis.userAnswer.join(', ') || '(blank)'
                        : analysis.userAnswer || '(blank)'
                      }
                    </div>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-700">Correct Answer:</span>
                    <div className="bg-green-100 p-2 rounded text-green-800 font-mono">
                      {Array.isArray(analysis.correctAnswer) 
                        ? analysis.correctAnswer.join(', ')
                        : analysis.correctAnswer
                      }
                    </div>
                  </div>
                </div>
                
                <div className="mb-3">
                  <span className="text-sm font-medium text-gray-700">Explanation:</span>
                  <p className="text-gray-800 mt-1">{analysis.explanation}</p>
                </div>
                
                {analysis.grammarPoint && (
                  <div className="bg-blue-50 p-3 rounded border-l-4 border-blue-400">
                    <span className="text-sm font-medium text-blue-700">Grammar Point:</span>
                    <p className="text-blue-800 mt-1 text-sm">{analysis.grammarPoint}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {incorrectAnswers.length === 0 && (
        <div className="bg-green-50 rounded-lg p-6 border-2 border-green-200 text-center">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h4 className="text-xl font-bold text-green-800 mb-2">Perfect Score!</h4>
          <p className="text-green-700">
            Congratulations! You answered all questions correctly. Keep up the excellent work!
          </p>
        </div>
      )}

      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border-2 border-purple-200">
        <h4 className="text-lg font-bold text-purple-800 mb-4">📚 Study Recommendations</h4>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <h5 className="font-semibold text-purple-700 mb-2">Focus Areas:</h5>
            <ul className="text-sm text-purple-600 space-y-1">
              {incorrectAnswers.length > 0 ? (
                <>
                  <li>• Practice {[...new Set(incorrectAnswers.map(a => a.questionType))].join(', ')} questions</li>
                  <li>• Work on spelling accuracy and word forms</li>
                  <li>• Improve listening for specific details</li>
                </>
              ) : (
                <>
                  <li>• Maintain current performance level</li>
                  <li>• Practice with more challenging tests</li>
                  <li>• Focus on time management</li>
                </>
              )}
            </ul>
          </div>
          <div>
            <h5 className="font-semibold text-purple-700 mb-2">Next Steps:</h5>
            <ul className="text-sm text-purple-600 space-y-1">
              <li>• Review audio sections for missed questions</li>
              <li>• Practice similar question types</li>
              <li>• Take another practice test</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PremiumResultsAnalysis;