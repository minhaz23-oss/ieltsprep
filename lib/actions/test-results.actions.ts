'use server'

import { db } from '@/firebase/admin';
import { cookies } from 'next/headers';
import { auth } from '@/firebase/admin';

// Get current user from session
async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;
    
    if (!sessionCookie) {
      return null;
    }

    const decodedClaims = await auth.verifySessionCookie(sessionCookie);
    return decodedClaims;
  } catch (error) {
    console.error('Error verifying session:', error);
    return null;
  }
}

// Save reading test result
export async function saveReadingTestResult(params: SaveReadingTestParams) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        message: 'User not authenticated'
      };
    }

    const {
      testId,
      difficulty,
      title,
      score,
      totalQuestions,
      timeSpent,
      answers,
      skillAnalysis,
      bandScore
    } = params;

    const resultData: any = {
      userId: user.uid,
      testType: 'reading',
      testId,
      difficulty,
      title,
      score: {
        correct: score.correct,
        total: score.total,
        percentage: score.percentage
      },
      totalQuestions,
      timeSpent, // in seconds
      answers,
      bandScore,
      completedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    // Only add skillAnalysis if it's defined
    if (skillAnalysis !== undefined && skillAnalysis !== null) {
      resultData.skillAnalysis = skillAnalysis;
    }

    // Save to test_results collection
    const docRef = await db.collection('test_results').add(resultData);

    // Update user statistics
    await updateUserStats(user.uid, 'reading', score.percentage, bandScore);

    return {
      success: true,
      message: 'Reading test result saved successfully',
      resultId: docRef.id
    };
  } catch (error) {
    console.error('Error saving reading test result:', error);
    return {
      success: false,
      message: 'Failed to save test result'
    };
  }
}

// Save listening test result
export async function saveListeningTestResult(params: SaveListeningTestParams) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        message: 'User not authenticated'
      };
    }

    const {
      testId,
      difficulty,
      title,
      score,
      totalQuestions,
      timeSpent,
      answers,
      bandScore
    } = params;

    const resultData = {
      userId: user.uid,
      testType: 'listening',
      testId,
      difficulty,
      title,
      score: {
        correct: score.correct,
        total: score.total,
        percentage: score.percentage
      },
      totalQuestions,
      timeSpent, // in seconds
      answers,
      bandScore,
      completedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    // Save to test_results collection
    const docRef = await db.collection('test_results').add(resultData);

    // Update user statistics
    await updateUserStats(user.uid, 'listening', score.percentage, bandScore);

    return {
      success: true,
      message: 'Listening test result saved successfully',
      resultId: docRef.id
    };
  } catch (error) {
    console.error('Error saving listening test result:', error);
    return {
      success: false,
      message: 'Failed to save test result'
    };
  }
}

// Save writing test result
export async function saveWritingTestResult(params: SaveWritingTestParams) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        message: 'User not authenticated'
      };
    }

    const {
      testId,
      difficulty,
      task1Answer,
      task2Answer,
      evaluation,
      timeSpent,
      overallBandScore
    } = params;

    const resultData = {
      userId: user.uid,
      testType: 'writing',
      testId,
      difficulty,
      task1Answer,
      task2Answer,
      evaluation,
      timeSpent, // in seconds
      overallBandScore,
      completedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    // Save to test_results collection
    const docRef = await db.collection('test_results').add(resultData);

    // Update user statistics
    await updateUserStats(user.uid, 'writing', (overallBandScore / 9) * 100, overallBandScore);

    return {
      success: true,
      message: 'Writing test result saved successfully',
      resultId: docRef.id
    };
  } catch (error) {
    console.error('Error saving writing test result:', error);
    return {
      success: false,
      message: 'Failed to save test result'
    };
  }
}

// Save speaking test result
export async function saveSpeakingTestResult(params: SaveSpeakingTestParams) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        message: 'User not authenticated'
      };
    }

    const {
      testId,
      difficulty,
      answers,
      evaluation,
      timeSpent,
      overallBandScore
    } = params;

    const resultData = {
      userId: user.uid,
      testType: 'speaking',
      testId,
      difficulty,
      answers,
      evaluation,
      timeSpent, // in seconds
      overallBandScore,
      completedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    // Save to test_results collection
    const docRef = await db.collection('test_results').add(resultData);

    // Update user statistics
    await updateUserStats(user.uid, 'speaking', (overallBandScore / 9) * 100, overallBandScore);

    return {
      success: true,
      message: 'Speaking test result saved successfully',
      resultId: docRef.id
    };
  } catch (error) {
    console.error('Error saving speaking test result:', error);
    return {
      success: false,
      message: 'Failed to save test result'
    };
  }
}

// Update user statistics
async function updateUserStats(userId: string, testType: string, percentage: number, bandScore: number) {
  try {
    const userStatsRef = db.collection('user_stats').doc(userId);
    const userStatsDoc = await userStatsRef.get();

    if (!userStatsDoc.exists) {
      // Create new user stats document
      await userStatsRef.set({
        userId,
        totalTests: 1,
        testsByType: {
          [testType]: 1
        },
        averageScores: {
          [testType]: {
            percentage,
            bandScore,
            count: 1
          }
        },
        bestScores: {
          [testType]: {
            percentage,
            bandScore,
            achievedAt: new Date().toISOString()
          }
        },
        recentActivity: [{
          testType,
          percentage,
          bandScore,
          completedAt: new Date().toISOString()
        }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
    } else {
      // Update existing user stats
      const currentStats = userStatsDoc.data();
      const currentTestCount = currentStats?.testsByType?.[testType] || 0;
      const currentAverage = currentStats?.averageScores?.[testType] || { percentage: 0, bandScore: 0, count: 0 };
      const currentBest = currentStats?.bestScores?.[testType] || { percentage: 0, bandScore: 0 };

      // Calculate new average
      const newCount = currentAverage.count + 1;
      const newAveragePercentage = ((currentAverage.percentage * currentAverage.count) + percentage) / newCount;
      const newAverageBandScore = ((currentAverage.bandScore * currentAverage.count) + bandScore) / newCount;

      // Update best scores if current is better
      const newBest = {
        percentage: Math.max(currentBest.percentage, percentage),
        bandScore: Math.max(currentBest.bandScore, bandScore),
        achievedAt: bandScore > currentBest.bandScore ? new Date().toISOString() : currentBest.achievedAt
      };

      // Update recent activity (keep last 10)
      const recentActivity = currentStats?.recentActivity || [];
      recentActivity.unshift({
        testType,
        percentage,
        bandScore,
        completedAt: new Date().toISOString()
      });
      if (recentActivity.length > 10) {
        recentActivity.pop();
      }

      await userStatsRef.update({
        totalTests: (currentStats?.totalTests || 0) + 1,
        [`testsByType.${testType}`]: currentTestCount + 1,
        [`averageScores.${testType}`]: {
          percentage: newAveragePercentage,
          bandScore: newAverageBandScore,
          count: newCount
        },
        [`bestScores.${testType}`]: newBest,
        recentActivity,
        updatedAt: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error updating user stats:', error);
  }
}

// Get user test results
export async function getUserTestResults(testType?: string, limit: number = 20) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        message: 'User not authenticated',
        data: []
      };
    }

    let query = db.collection('test_results')
      .where('userId', '==', user.uid)
      .orderBy('completedAt', 'desc')
      .limit(limit);

    if (testType) {
      query = query.where('testType', '==', testType);
    }

    const snapshot = await query.get();
    const results = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return {
      success: true,
      data: results
    };
  } catch (error) {
    console.error('Error getting user test results:', error);
    return {
      success: false,
      message: 'Failed to get test results',
      data: []
    };
  }
}

// Get user statistics
export async function getUserStats() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        message: 'User not authenticated',
        data: null
      };
    }

    const userStatsDoc = await db.collection('user_stats').doc(user.uid).get();
    
    if (!userStatsDoc.exists) {
      return {
        success: true,
        data: {
          totalTests: 0,
          testsByType: {},
          averageScores: {},
          bestScores: {},
          recentActivity: []
        }
      };
    }

    return {
      success: true,
      data: userStatsDoc.data()
    };
  } catch (error) {
    console.error('Error getting user stats:', error);
    return {
      success: false,
      message: 'Failed to get user statistics',
      data: null
    };
  }
}