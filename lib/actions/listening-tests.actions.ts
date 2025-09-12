"use server";

import { db } from '@/firebase/admin';
import { ListeningTest, ListeningTestResult } from '@/types/listening';

// Create a new listening test
export async function createListeningTest(testData: ListeningTest) {
  try {
    const testRef = db.collection('listening-tests').doc(testData.id);
    await testRef.set({
      ...testData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    return { success: true, message: 'Test created successfully' };
  } catch (error) {
    console.error('Error creating listening test:', error);
    return { success: false, message: 'Failed to create test' };
  }
}

// Get all listening tests
export async function getListeningTests(difficulty?: string) {
  try {
    let query = db.collection('listening-tests');
    
    if (difficulty) {
      query = query.where('difficulty', '==', difficulty);
    }

    const snapshot = await query.orderBy('createdAt', 'desc').get();
    const tests: ListeningTest[] = [];

    snapshot.forEach(doc => {
      tests.push({ id: doc.id, ...doc.data() } as ListeningTest);
    });

    return { success: true, data: tests };
  } catch (error) {
    console.error('Error fetching listening tests:', error);
    return { success: false, message: 'Failed to fetch tests', data: [] };
  }
}

// Get a specific listening test
export async function getListeningTest(testId: string) {
  try {
    const testDoc = await db.collection('listening-tests').doc(testId).get();
    
    if (!testDoc.exists) {
      return { success: false, message: 'Test not found', data: null };
    }

    const testData = { id: testDoc.id, ...testDoc.data() } as ListeningTest;
    return { success: true, data: testData };
  } catch (error) {
    console.error('Error fetching listening test:', error);
    return { success: false, message: 'Failed to fetch test', data: null };
  }
}

// Save listening test result
export async function saveListeningTestResult(
  userId: string,
  testResult: Omit<ListeningTestResult, 'id' | 'userId' | 'completedAt'>
) {
  try {
    const resultRef = db.collection('listening-test-results').doc();
    const resultData: ListeningTestResult = {
      id: resultRef.id,
      userId,
      ...testResult,
      completedAt: new Date().toISOString()
    };

    await resultRef.set(resultData);

    // Update user statistics
    await updateUserListeningStats(userId, testResult);

    return { success: true, message: 'Test result saved successfully', data: resultData };
  } catch (error) {
    console.error('Error saving listening test result:', error);
    return { success: false, message: 'Failed to save test result' };
  }
}

// Get user's listening test results
export async function getUserListeningResults(userId: string, limit: number = 10) {
  try {
    const snapshot = await db
      .collection('listening-test-results')
      .where('userId', '==', userId)
      .orderBy('completedAt', 'desc')
      .limit(limit)
      .get();

    const results: ListeningTestResult[] = [];
    snapshot.forEach(doc => {
      results.push(doc.data() as ListeningTestResult);
    });

    return { success: true, data: results };
  } catch (error) {
    console.error('Error fetching user listening results:', error);
    return { success: false, message: 'Failed to fetch results', data: [] };
  }
}

// Update user listening statistics
async function updateUserListeningStats(
  userId: string,
  testResult: Omit<ListeningTestResult, 'id' | 'userId' | 'completedAt'>
) {
  try {
    const userStatsRef = db.collection('user-stats').doc(userId);
    const userStatsDoc = await userStatsRef.get();

    if (!userStatsDoc.exists) {
      // Create new stats document
      await userStatsRef.set({
        listening: {
          testsCompleted: 1,
          totalQuestions: testResult.score.total,
          totalCorrect: testResult.score.correct,
          averageBandScore: testResult.bandScore,
          bestBandScore: testResult.bandScore,
          totalTimeSpent: testResult.timeSpent,
          difficultyStats: {
            [testResult.testId.split('-')[0]]: {
              testsCompleted: 1,
              averageScore: testResult.score.percentage
            }
          },
          lastTestDate: new Date().toISOString()
        }
      });
    } else {
      // Update existing stats
      const currentStats = userStatsDoc.data()?.listening || {};
      const testsCompleted = (currentStats.testsCompleted || 0) + 1;
      const totalQuestions = (currentStats.totalQuestions || 0) + testResult.score.total;
      const totalCorrect = (currentStats.totalCorrect || 0) + testResult.score.correct;
      const totalTimeSpent = (currentStats.totalTimeSpent || 0) + testResult.timeSpent;
      
      // Calculate new average band score
      const currentAverage = currentStats.averageBandScore || 0;
      const newAverage = ((currentAverage * (testsCompleted - 1)) + testResult.bandScore) / testsCompleted;
      
      const difficulty = testResult.testId.split('-')[0];
      const difficultyStats = currentStats.difficultyStats || {};
      const currentDifficultyStats = difficultyStats[difficulty] || { testsCompleted: 0, averageScore: 0 };
      
      await userStatsRef.update({
        'listening.testsCompleted': testsCompleted,
        'listening.totalQuestions': totalQuestions,
        'listening.totalCorrect': totalCorrect,
        'listening.averageBandScore': Math.round(newAverage * 10) / 10,
        'listening.bestBandScore': Math.max(currentStats.bestBandScore || 0, testResult.bandScore),
        'listening.totalTimeSpent': totalTimeSpent,
        [`listening.difficultyStats.${difficulty}`]: {
          testsCompleted: currentDifficultyStats.testsCompleted + 1,
          averageScore: Math.round(
            ((currentDifficultyStats.averageScore * currentDifficultyStats.testsCompleted) + testResult.score.percentage) 
            / (currentDifficultyStats.testsCompleted + 1) * 10
          ) / 10
        },
        'listening.lastTestDate': new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error updating user listening stats:', error);
  }
}

// Get listening test analytics
export async function getListeningTestAnalytics(testId: string) {
  try {
    const snapshot = await db
      .collection('listening-test-results')
      .where('testId', '==', testId)
      .get();

    const results: ListeningTestResult[] = [];
    snapshot.forEach(doc => {
      results.push(doc.data() as ListeningTestResult);
    });

    if (results.length === 0) {
      return { 
        success: true, 
        data: {
          totalAttempts: 0,
          averageScore: 0,
          averageBandScore: 0,
          averageTimeSpent: 0,
          difficultyDistribution: {},
          commonMistakes: []
        }
      };
    }

    const totalAttempts = results.length;
    const averageScore = results.reduce((sum, result) => sum + result.score.percentage, 0) / totalAttempts;
    const averageBandScore = results.reduce((sum, result) => sum + result.bandScore, 0) / totalAttempts;
    const averageTimeSpent = results.reduce((sum, result) => sum + result.timeSpent, 0) / totalAttempts;

    // Analyze common mistakes (questions with low success rates)
    const questionStats: Record<number, { correct: number, total: number }> = {};
    
    results.forEach(result => {
      Object.entries(result.answers).forEach(([questionId, answer]) => {
        const qId = parseInt(questionId);
        if (!questionStats[qId]) {
          questionStats[qId] = { correct: 0, total: 0 };
        }
        questionStats[qId].total++;
        // This would need to be enhanced to check if the answer is correct
        // based on the test data
      });
    });

    return {
      success: true,
      data: {
        totalAttempts,
        averageScore: Math.round(averageScore * 10) / 10,
        averageBandScore: Math.round(averageBandScore * 10) / 10,
        averageTimeSpent: Math.round(averageTimeSpent),
        questionStats
      }
    };
  } catch (error) {
    console.error('Error fetching listening test analytics:', error);
    return { success: false, message: 'Failed to fetch analytics' };
  }
}

// Search listening tests
export async function searchListeningTests(searchTerm: string, difficulty?: string) {
  try {
    let query = db.collection('listening-tests');
    
    if (difficulty) {
      query = query.where('difficulty', '==', difficulty);
    }

    const snapshot = await query.get();
    const tests: ListeningTest[] = [];

    snapshot.forEach(doc => {
      const testData = { id: doc.id, ...doc.data() } as ListeningTest;
      
      // Simple text search in title, description, and tags
      const searchableText = [
        testData.title,
        testData.metadata.description,
        ...testData.metadata.tags
      ].join(' ').toLowerCase();

      if (searchableText.includes(searchTerm.toLowerCase())) {
        tests.push(testData);
      }
    });

    return { success: true, data: tests };
  } catch (error) {
    console.error('Error searching listening tests:', error);
    return { success: false, message: 'Failed to search tests', data: [] };
  }
}