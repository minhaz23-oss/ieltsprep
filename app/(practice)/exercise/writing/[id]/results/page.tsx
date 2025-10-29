"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import PremiumWritingAnalysis from '@/components/writing/PremiumWritingAnalysis';

const WritingResultsPage = () => {
  const params = useParams();
  const testId = params.id as string;
  
  const [evaluationData, setEvaluationData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const getBandColor = (band: number): string => {
    if (band >= 7) return 'text-green-600';
    if (band >= 5.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  useEffect(() => {
    // Get evaluation data from sessionStorage
    const data = sessionStorage.getItem('writingEvaluation');
    if (data) {
      try {
        const parsed = JSON.parse(data);
        setEvaluationData(parsed);
      } catch (error) {
        console.error('Error parsing evaluation data:', error);
      }
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  if (!evaluationData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 max-w-md text-center border-2 border-red-300">
          <h2 className="text-2xl font-bold text-red-600 mb-4">No Results Found</h2>
          <p className="text-gray-600 mb-6">Please complete a test first.</p>
          <Link href="/exercise/writing" className="bg-primary text-white px-6 py-2 rounded hover:bg-red-700">
            Back to Tests
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link href="/exercise/writing" className="text-primary hover:text-red-700 flex items-center space-x-2 mb-4">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Writing Tests</span>
          </Link>
        </div>

        {/* Results Card */}
        <div className="bg-white rounded-lg p-8 text-center border-2 border-green-300 mb-8 shadow-lg">
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          
          <h2 className="text-3xl font-bold mb-2">{evaluationData.testTitle}</h2>
          <p className="text-gray-600 mb-6">Test Completed!</p>

          <div className={`text-7xl font-bold ${getBandColor(evaluationData.overallBandScore)} mb-6`}>
            Band {evaluationData.overallBandScore}
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8 max-w-md mx-auto">
            {evaluationData.results.task1 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className={`text-3xl font-bold ${getBandColor(evaluationData.results.task1.overallBand)}`}>
                  {evaluationData.results.task1.overallBand}
                </div>
                <div className="text-sm text-gray-600">Task 1</div>
                <div className="text-xs text-gray-500 mt-1">{evaluationData.results.task1.wordCount} words</div>
              </div>
            )}
            {evaluationData.results.task2 && (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className={`text-3xl font-bold ${getBandColor(evaluationData.results.task2.overallBand)}`}>
                  {evaluationData.results.task2.overallBand}
                </div>
                <div className="text-sm text-gray-600">Task 2</div>
                <div className="text-xs text-gray-500 mt-1">{evaluationData.results.task2.wordCount} words</div>
              </div>
            )}
          </div>

          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/exercise/writing" className="bg-gray-500 text-white px-6 py-3 rounded-lg hover:bg-gray-600 font-semibold">
              Back to Tests
            </Link>
            <Link 
              href={`/exercise/writing/${testId}`}
              className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-red-700 font-semibold"
            >
              Try Again
            </Link>
            <Link href="/dashboard" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold">
              View Dashboard
            </Link>
          </div>
        </div>

        {/* Premium Analysis */}
        <PremiumWritingAnalysis
          evaluationResult={evaluationData.results}
          overallBandScore={evaluationData.overallBandScore}
          isPremium={evaluationData.isPremium}
        />
      </div>
    </div>
  );
};

export default WritingResultsPage;
