"use client";

import React from 'react';
import { ListeningQuestion, FormCompletionContext, TableCompletionContext, DiagramLabelingContext, MatchingContext } from '@/types/listening';

interface DynamicQuestionRendererProps {
  question: ListeningQuestion;
  answer: string | number | string[] | undefined;
  onAnswerChange: (questionId: number, answer: string | number | string[]) => void;
  disabled?: boolean;
}

const DynamicQuestionRenderer: React.FC<DynamicQuestionRendererProps> = ({
  question,
  answer,
  onAnswerChange,
  disabled = false
}) => {
  const renderMultipleChoice = () => (
    <div className="space-y-3">
      {question.options?.map((option, index) => (
        <label key={index} className="flex items-start space-x-3 cursor-pointer p-2 rounded hover:bg-gray-50">
          <input
            type="radio"
            name={`question-${question.id}`}
            value={index}
            checked={answer === index}
            onChange={() => onAnswerChange(question.id, index)}
            disabled={disabled}
            className="w-4 h-4 text-primary focus:ring-primary mt-1 flex-shrink-0"
          />
          <span className="text-gray-700 text-sm sm:text-base">{option}</span>
        </label>
      ))}
    </div>
  );

  const renderFillBlank = () => (
    <div className="space-y-2">
      {question.instructions && (
        <p className="text-sm text-gray-600 italic">{question.instructions}</p>
      )}
      <input
        type="text"
        value={answer as string || ''}
        onChange={(e) => onAnswerChange(question.id, e.target.value)}
        disabled={disabled}
        className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none text-sm sm:text-base"
        placeholder={question.wordLimit ? `Max ${question.wordLimit} words` : "Type your answer here..."}
      />
      {question.wordLimit && (
        <p className="text-xs text-gray-500">Word limit: {question.wordLimit}</p>
      )}
    </div>
  );

  const renderTrueFalse = () => (
    <div className="space-y-3">
      {['true', 'false'].map((option) => (
        <label key={option} className="flex items-center space-x-3 cursor-pointer p-2 rounded hover:bg-gray-50">
          <input
            type="radio"
            name={`question-${question.id}`}
            value={option}
            checked={answer === option}
            onChange={() => onAnswerChange(question.id, option)}
            disabled={disabled}
            className="w-4 h-4 text-primary focus:ring-primary"
          />
          <span className="text-gray-700 capitalize text-sm sm:text-base">{option}</span>
        </label>
      ))}
    </div>
  );

  const renderMatching = () => {
    const context = question.context as MatchingContext;
    if (!context) return null;

    return (
      <div className="space-y-4">
        <p className="text-sm text-gray-600">{context.instructions}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-semibold mb-2">Options:</h4>
            <div className="space-y-2">
              {context.leftColumn.map((item, index) => (
                <div key={index} className="p-2 bg-gray-50 rounded border">
                  <span className="font-medium">{String.fromCharCode(65 + index)}.</span> {item}
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Match with:</h4>
            <select
              value={answer as string || ''}
              onChange={(e) => onAnswerChange(question.id, e.target.value)}
              disabled={disabled}
              className="w-full p-2 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none"
            >
              <option value="">Select an option</option>
              {context.leftColumn.map((_, index) => (
                <option key={index} value={String.fromCharCode(65 + index)}>
                  {String.fromCharCode(65 + index)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    );
  };

  const renderFormCompletion = () => {
    const context = question.context as FormCompletionContext;
    if (!context) return renderFillBlank();

    return (
      <div className="space-y-4">
        <div className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200">
          <h3 className="font-bold text-center mb-4 text-lg">{context.formTitle}</h3>
          <div className="space-y-3">
            {context.fields.map((field) => (
              <div key={field.questionId} className="flex items-center space-x-3">
                <label className="w-1/3 text-sm font-medium">{field.label}</label>
                <div className="flex-1">
                  {field.questionId === question.id ? (
                    <input
                      type={field.type}
                      value={answer as string || ''}
                      onChange={(e) => onAnswerChange(question.id, e.target.value)}
                      disabled={disabled}
                      className="w-full p-2 border-2 border-primary rounded focus:outline-none"
                      placeholder="Your answer"
                    />
                  ) : (
                    <div className="p-2 bg-white border rounded text-gray-500">
                      [Question {field.questionId}]
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderTableCompletion = () => {
    const context = question.context as TableCompletionContext;
    if (!context) return renderFillBlank();

    return (
      <div className="space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                {context.headers.map((header, index) => (
                  <th key={index} className="border border-gray-300 p-2 text-left font-semibold">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {context.rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.cells.map((cell, cellIndex) => (
                    <td key={cellIndex} className="border border-gray-300 p-2">
                      {cell.content === null && cell.questionId === question.id ? (
                        <input
                          type="text"
                          value={answer as string || ''}
                          onChange={(e) => onAnswerChange(question.id, e.target.value)}
                          disabled={disabled}
                          className="w-full p-1 border border-primary rounded focus:outline-none"
                          placeholder="Answer"
                        />
                      ) : cell.content === null ? (
                        <span className="text-gray-500">[Q{cell.questionId}]</span>
                      ) : (
                        cell.content
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderDiagramLabeling = () => {
    const context = question.context as DiagramLabelingContext;
    if (!context) return renderFillBlank();

    return (
      <div className="space-y-4">
        <div className="relative">
          <img 
            src={context.diagramUrl} 
            alt="Diagram for labeling" 
            className="w-full max-w-2xl mx-auto border rounded"
          />
          {context.labels.map((label) => (
            label.questionId === question.id && (
              <div
                key={label.questionId}
                className="absolute transform -translate-x-1/2 -translate-y-1/2"
                style={{ 
                  left: `${label.x}%`, 
                  top: `${label.y}%` 
                }}
              >
                <input
                  type="text"
                  value={answer as string || ''}
                  onChange={(e) => onAnswerChange(question.id, e.target.value)}
                  disabled={disabled}
                  className="w-20 p-1 text-xs border-2 border-primary rounded bg-white focus:outline-none"
                  placeholder="Label"
                />
              </div>
            )
          ))}
        </div>
      </div>
    );
  };

  const renderShortAnswer = () => (
    <div className="space-y-2">
      {question.instructions && (
        <p className="text-sm text-gray-600 italic">{question.instructions}</p>
      )}
      <textarea
        value={answer as string || ''}
        onChange={(e) => onAnswerChange(question.id, e.target.value)}
        disabled={disabled}
        rows={3}
        className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-primary focus:outline-none text-sm sm:text-base resize-none"
        placeholder={question.wordLimit ? `Max ${question.wordLimit} words` : "Type your answer here..."}
      />
      {question.wordLimit && (
        <p className="text-xs text-gray-500">
          Word limit: {question.wordLimit} | 
          Current: {(answer as string || '').split(' ').filter(word => word.length > 0).length} words
        </p>
      )}
    </div>
  );

  const renderQuestion = () => {
    switch (question.type) {
      case 'multiple-choice':
        return renderMultipleChoice();
      case 'fill-blank':
        return renderFillBlank();
      case 'true-false':
        return renderTrueFalse();
      case 'matching':
        return renderMatching();
      case 'form-completion':
        return renderFormCompletion();
      case 'table-completion':
        return renderTableCompletion();
      case 'diagram-labeling':
        return renderDiagramLabeling();
      case 'short-answer':
      case 'note-completion':
      case 'sentence-completion':
      case 'summary-completion':
        return renderShortAnswer();
      default:
        return renderFillBlank();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <h3 className="text-base sm:text-lg font-semibold text-black">
          Question {question.questionNumber}
        </h3>
        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
          {question.type.replace('-', ' ').toUpperCase()}
        </span>
      </div>
      
      <div className="p-4 bg-gray-50 rounded-lg">
        <p className="text-gray-700 mb-4 text-sm sm:text-base font-medium">
          {question.question}
        </p>
        {renderQuestion()}
      </div>
    </div>
  );
};

export default DynamicQuestionRenderer;