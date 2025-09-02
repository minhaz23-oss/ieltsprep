'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import { getUserStats, getUserTestResults } from '@/lib/actions/test-results.actions';
import AuthNotice from '@/components/AuthNotice';

interface UserStats {
  totalTests: number;
  testsByType: Record<string, number>;
  averageScores: Record<string, {
    percentage: number;
    bandScore: number;
    count: number;
  }>;
  bestScores: Record<string, {
    percentage: number;
    bandScore: number;
    achievedAt: string;
  }>;
  recentActivity: Array<{
    testType: string;
    percentage: number;
    bandScore: number;
    completedAt: string;
  }>;
}

interface TestResult {
  id: string;
  testType: 'reading' | 'listening' | 'writing' | 'speaking';
  testId: string;
  difficulty: string;
  title?: string;
  score?: {
    correct: number;
    total: number;
    percentage: number;
  };
  bandScore?: number;
  overallBandScore?: number;
  timeSpent: number;
  completedAt: string;
}

const DashboardPage = () => {
  const { isAuthenticated, loading: authLoading, user } = useAuth();
  const [stats, setStats] = useState<UserStats | null>(null);
  const [recentTests, setRecentTests] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTestType, setSelectedTestType] = useState<string>('all');

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Load user statistics with better error handling
      const statsResponse = await getUserStats();
      console.log('Stats response:', statsResponse); // Debug log
      
      if (statsResponse.success && statsResponse.data) {
        // Type cast and validate the DocumentData to UserStats
        const rawData = statsResponse.data as any;
        
        const validatedStats: UserStats = {
          totalTests: rawData.totalTests || 0,
          testsByType: rawData.testsByType || {},
          averageScores: rawData.averageScores || {},
          bestScores: rawData.bestScores || {},
          recentActivity: rawData.recentActivity || []
        };
        setStats(validatedStats);
      } else {
        console.error('Stats response error:', statsResponse.message || 'No data returned');
        // Set default empty stats
        setStats({
          totalTests: 0,
          testsByType: {},
          averageScores: {},
          bestScores: {},
          recentActivity: []
        });
      }

      // Load recent test results
      const testsResponse = await getUserTestResults(
        selectedTestType === 'all' ? undefined : selectedTestType,
        10
      );
      
      console.log('Tests response:', testsResponse); // Debug log
      
      if (testsResponse.success) {
        // Type cast and validate the test results data
        const validatedTests: TestResult[] = (testsResponse.data || []).map((test: any) => ({
          id: test.id,
          testType: test.testType || 'reading',
          testId: test.testId || '',
          difficulty: test.difficulty || 'easy',
          title: test.title,
          score: test.score ? {
            correct: test.score.correct || 0,
            total: test.score.total || 0,
            percentage: test.score.percentage || 0
          } : undefined,
          bandScore: test.bandScore,
          overallBandScore: test.overallBandScore,
          timeSpent: test.timeSpent || 0,
          completedAt: test.completedAt || new Date().toISOString()
        }));
        setRecentTests(validatedTests);
      } else {
        console.error('Tests response error:', testsResponse.message || 'Failed to get test results');
        setRecentTests([]);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      // Set fallback empty state
      setStats({
        totalTests: 0,
        testsByType: {},
        averageScores: {},
        bestScores: {},
        recentActivity: []
      });
      setRecentTests([]);
    } finally {
      setLoading(false);
    }
  }, [selectedTestType]);

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [isAuthenticated, authLoading, loadDashboardData]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    }
    return `${minutes}m ${seconds % 60}s`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getBandColor = (band: number) => {
    if (band >= 8) return 'text-green-600 bg-green-50 border-green-200';
    if (band >= 7) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (band >= 6) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (band >= 5) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getTestTypeIcon = (testType: string) => {
    switch (testType) {
      case 'reading': return '📖';
      case 'listening': return '🎧';
      case 'writing': return '✍️';
      case 'speaking': return '🗣️';
      default: return '📝';
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold text-sm sm:text-base">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-black mb-4">
              📊 Your IELTS <span className="p-1 px-2 bg-primary rounded-md text-white -rotate-3 inline-block">Dashboard</span>
            </h1>
            <p className="text-gray-600 text-sm sm:text-base lg:text-lg">Track your progress and improve your IELTS scores</p>
          </div>
          
          <AuthNotice testType="dashboard" hasAI={false} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-black mb-2 sm:mb-4">
            📊 Your IELTS <span className="p-1 px-2 bg-primary rounded-md text-white -rotate-3 inline-block">Dashboard</span>
          </h1>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600">
            Welcome back, {user?.displayName || user?.email}! Track your progress and improve your scores.
          </p>
        </div>

        {/* Statistics Overview */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
            <div className="bg-white rounded-xl border-2 border-blue-200 p-3 sm:p-4 lg:p-6 text-center">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-600 mb-1 sm:mb-2">
                {stats.totalTests}
              </div>
              <div className="text-blue-700 font-medium text-xs sm:text-sm lg:text-base">Total Tests</div>
            </div>
            
            <div className="bg-white rounded-xl border-2 border-green-200 p-3 sm:p-4 lg:p-6 text-center">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-green-600 mb-1 sm:mb-2">
                {stats.testsByType.reading || 0}
              </div>
              <div className="text-green-700 font-medium text-xs sm:text-sm lg:text-base">Reading Tests</div>
            </div>
            
            <div className="bg-white rounded-xl border-2 border-purple-200 p-3 sm:p-4 lg:p-6 text-center">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-purple-600 mb-1 sm:mb-2">
                {stats.testsByType.listening || 0}
              </div>
              <div className="text-purple-700 font-medium text-xs sm:text-sm lg:text-base">Listening Tests</div>
            </div>
            
            <div className="bg-white rounded-xl border-2 border-orange-200 p-3 sm:p-4 lg:p-6 text-center">
              <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-orange-600 mb-1 sm:mb-2">
                {(stats.testsByType.writing || 0) + (stats.testsByType.speaking || 0)}
              </div>
              <div className="text-orange-700 font-medium text-xs sm:text-sm lg:text-base">Writing & Speaking</div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Best Scores */}
          {stats && Object.keys(stats.bestScores).length > 0 && (
            <div className="bg-white rounded-xl border-2 border-gray-200 p-4 sm:p-6 lg:p-8">
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-black mb-4 sm:mb-6">
                🏆 Best Scores
              </h3>
              <div className="space-y-4">
                {Object.entries(stats.bestScores).map(([testType, score]) => (
                  <div key={testType} className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl sm:text-2xl">{getTestTypeIcon(testType)}</span>
                      <div>
                        <div className="font-bold text-gray-900 capitalize text-sm sm:text-base">{testType}</div>
                        <div className="text-xs sm:text-sm text-gray-600">
                          {formatDate(score.achievedAt)}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`inline-block px-2 sm:px-3 py-1 rounded-full border font-bold text-xs sm:text-sm ${getBandColor(score.bandScore)}`}>
                        Band {score.bandScore.toFixed(1)}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600 mt-1">
                        {score.percentage.toFixed(0)}% accuracy
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Average Performance */}
          {stats && Object.keys(stats.averageScores).length > 0 && (
            <div className="bg-white rounded-xl border-2 border-gray-200 p-4 sm:p-6 lg:p-8">
              <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-black mb-4 sm:mb-6">
                📈 Average Performance
              </h3>
              <div className="space-y-4">
                {Object.entries(stats.averageScores).map(([testType, average]) => (
                  <div key={testType} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg sm:text-xl">{getTestTypeIcon(testType)}</span>
                        <span className="font-bold text-gray-900 capitalize text-sm sm:text-base">{testType}</span>
                        <span className="text-xs sm:text-sm text-gray-500">({average.count} tests)</span>
                      </div>
                      <div className={`px-2 sm:px-3 py-1 rounded-full border font-bold text-xs sm:text-sm ${getBandColor(average.bandScore)}`}>
                        Band {average.bandScore.toFixed(1)}
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${average.percentage}%` }}
                      ></div>
                    </div>
                    <div className="text-xs sm:text-sm text-gray-600">
                      {average.percentage.toFixed(0)}% average accuracy
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Recent Test Results */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-4 sm:p-6 lg:p-8 mt-6 sm:mt-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-black">
              📝 Recent Test Results
            </h3>
            <select
              value={selectedTestType}
              onChange={(e) => setSelectedTestType(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:border-primary focus:outline-none text-sm"
            >
              <option value="all">All Tests</option>
              <option value="reading">Reading</option>
              <option value="listening">Listening</option>
              <option value="writing">Writing</option>
              <option value="speaking">Speaking</option>
            </select>
          </div>

          {recentTests.length > 0 ? (
            <div className="space-y-3 sm:space-y-4">
              {recentTests.map((test) => (
                <div key={test.id} className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center space-x-3">
                      <span className="text-xl sm:text-2xl">{getTestTypeIcon(test.testType)}</span>
                      <div>
                        <div className="font-bold text-gray-900 text-sm sm:text-base">
                          {test.title || `${test.testType.charAt(0).toUpperCase() + test.testType.slice(1)} Test`}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600">
                          {test.difficulty.charAt(0).toUpperCase() + test.difficulty.slice(1)} • {formatDate(test.completedAt)}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 sm:space-x-4">
                      {test.score && (
                        <div className="text-center">
                          <div className="text-sm sm:text-base font-bold text-gray-900">
                            {test.score.correct}/{test.score.total}
                          </div>
                          <div className="text-xs text-gray-600">
                            {test.score.percentage.toFixed(0)}%
                          </div>
                        </div>
                      )}
                      
                      <div className={`px-2 sm:px-3 py-1 rounded-full border font-bold text-xs sm:text-sm ${getBandColor(test.bandScore || test.overallBandScore || 0)}`}>
                        Band {(test.bandScore || test.overallBandScore || 0).toFixed(1)}
                      </div>
                      
                      <div className="text-xs sm:text-sm text-gray-600">
                        {formatTime(test.timeSpent)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 sm:py-12">
              <div className="text-4xl sm:text-6xl mb-4">📚</div>
              <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">No test results yet</h4>
              <p className="text-gray-600 mb-6 text-sm sm:text-base">
                Start taking tests to see your progress here!
              </p>
              <Link href="/exercise" className="btn-primary text-sm sm:text-base">
                Start Practicing
              </Link>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-4 sm:p-6 lg:p-8 mt-6 sm:mt-8">
          <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-black mb-4 sm:mb-6">
            🚀 Quick Actions
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <Link href="/exercise/reading" className="p-3 sm:p-4 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-center">
              <div className="text-2xl sm:text-3xl mb-2">📖</div>
              <div className="font-bold text-blue-800 text-xs sm:text-sm">Reading Practice</div>
            </Link>
            
            <Link href="/exercise/listening" className="p-3 sm:p-4 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors text-center">
              <div className="text-2xl sm:text-3xl mb-2">🎧</div>
              <div className="font-bold text-green-800 text-xs sm:text-sm">Listening Practice</div>
            </Link>
            
            <Link href="/exercise/writing" className="p-3 sm:p-4 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors text-center">
              <div className="text-2xl sm:text-3xl mb-2">✍️</div>
              <div className="font-bold text-purple-800 text-xs sm:text-sm">Writing Practice</div>
            </Link>
            
            <Link href="/exercise/speaking" className="p-3 sm:p-4 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors text-center">
              <div className="text-2xl sm:text-3xl mb-2">🗣️</div>
              <div className="font-bold text-orange-800 text-xs sm:text-sm">Speaking Practice</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;