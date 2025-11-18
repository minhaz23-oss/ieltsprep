'use server'

import { auth, db } from '@/firebase/admin';
import { cookies } from 'next/headers';
import { QualificationExam, ExamAttempt, UserQualificationStatus } from '@/types/qualificationExam';

// Promotional period configuration
// To end the promotion manually, set PROMO_IS_ACTIVE to false
const PROMO_IS_ACTIVE = true; // Set to false to end the promotion

const PASSING_SCORE = 50; // 50% - Adjusted for better accessibility
const RETRY_COOLDOWN_DAYS = 7; // 7 days between attempts

async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;
    
    if (!sessionCookie) {
      return null;
    }

    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);
    return decodedClaims;
  } catch (error) {
    console.error('Error verifying session:', error);
    return null;
  }
}

/**
 * Check if promotional period is active
 * Returns manual control flag - no automatic expiration
 */
export async function isPromotionalPeriodActive(): Promise<{ isActive: boolean; daysRemaining: number; endDate: Date | null }> {
  return { 
    isActive: PROMO_IS_ACTIVE, 
    daysRemaining: 0, // Not used when manual control
    endDate: null // Not used when manual control
  };
}

/**
 * Get the active qualification exam
 */
export async function getQualificationExam(): Promise<QualificationExam | null> {
  try {
    const examSnapshot = await db.collection('qualificationExams')
      .where('isActive', '==', true)
      .limit(1)
      .get();
    
    if (examSnapshot.empty) {
      return null;
    }
    
    const examDoc = examSnapshot.docs[0];
    const data = examDoc.data();
    
    // Serialize Firestore timestamp to ISO string
    return {
      id: examDoc.id,
      ...data,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
    } as QualificationExam;
  } catch (error) {
    console.error('Error fetching qualification exam:', error);
    return null;
  }
}

/**
 * Get user's qualification status
 */
export async function getUserQualificationStatus(): Promise<UserQualificationStatus | null> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return null;
    }

    const userDoc = await db.collection('users').doc(user.uid).get();
    
    if (!userDoc.exists) {
      return null;
    }

    const userData = userDoc.data();
    const qualExam = userData?.qualificationExam;

    if (!qualExam) {
      return {
        userId: user.uid,
        hasPassed: false,
        attempts: 0
      };
    }

    return {
      userId: user.uid,
      hasPassed: qualExam.hasPassed || false,
      attempts: qualExam.attempts || 0,
      lastAttemptAt: qualExam.lastAttemptAt?.toDate?.()?.toISOString() || null,
      passedAt: qualExam.passedAt?.toDate?.()?.toISOString() || null,
      premiumAccessMethod: qualExam.premiumAccessMethod,
      nextAttemptAvailableAt: qualExam.nextAttemptAvailableAt?.toDate?.()?.toISOString() || null
    };
  } catch (error) {
    console.error('Error getting qualification status:', error);
    return null;
  }
}

/**
 * Check if user can take the exam
 */
export async function canTakeExam(): Promise<{ canTake: boolean; reason?: string; nextAttemptDate?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { canTake: false, reason: 'Authentication required' };
    }

    // Check promotional period
    const promoStatus = await isPromotionalPeriodActive();
    if (!promoStatus.isActive) {
      return { canTake: false, reason: 'Promotional period has ended' };
    }

    const status = await getUserQualificationStatus();
    
    // Already passed
    if (status?.hasPassed) {
      return { canTake: false, reason: 'You have already passed the qualification exam' };
    }

    // Check cooldown
    if (status?.nextAttemptAvailableAt) {
      const nextAttempt = new Date(status.nextAttemptAvailableAt);
      if (new Date() < nextAttempt) {
        return { 
          canTake: false, 
          reason: `You can retry after the cooldown period`,
          nextAttemptDate: nextAttempt.toISOString()
        };
      }
    }

    return { canTake: true };
  } catch (error) {
    console.error('Error checking exam eligibility:', error);
    return { canTake: false, reason: 'Error checking eligibility' };
  }
}

/**
 * Start a new exam attempt
 */
export async function startExamAttempt(examId: string): Promise<{ success: boolean; attemptId?: string; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Authentication required' };
    }

    const eligibility = await canTakeExam();
    if (!eligibility.canTake) {
      return { success: false, error: eligibility.reason };
    }

    const attempt: Partial<ExamAttempt> = {
      userId: user.uid,
      examId,
      startedAt: new Date(),
      answers: {},
      score: 0,
      totalPoints: 0,
      earnedPoints: 0,
      passed: false,
      timeSpent: 0,
      premiumUnlocked: false
    };

    const attemptRef = await db.collection('examAttempts').add(attempt);

    return { success: true, attemptId: attemptRef.id };
  } catch (error) {
    console.error('Error starting exam attempt:', error);
    return { success: false, error: 'Failed to start exam' };
  }
}

/**
 * Submit exam and evaluate
 */
export async function submitExam(
  attemptId: string,
  answers: Record<string, string | string[]>,
  timeSpent: number
): Promise<{ success: boolean; result?: ExamAttempt; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Authentication required' };
    }

    // Get attempt
    const attemptDoc = await db.collection('examAttempts').doc(attemptId).get();
    if (!attemptDoc.exists) {
      return { success: false, error: 'Attempt not found' };
    }

    const attempt = attemptDoc.data() as ExamAttempt;
    
    // Verify ownership
    if (attempt.userId !== user.uid) {
      return { success: false, error: 'Unauthorized' };
    }

    // Get exam
    const examDoc = await db.collection('qualificationExams').doc(attempt.examId).get();
    if (!examDoc.exists) {
      return { success: false, error: 'Exam not found' };
    }

    const exam = examDoc.data() as QualificationExam;

    // Calculate score
    let earnedPoints = 0;
    let totalPoints = 0;

    exam.questions.forEach(question => {
      totalPoints += question.points;
      const userAnswer = answers[question.id];
      
      if (userAnswer) {
        // Normalize answers for comparison
        const correctAnswer = Array.isArray(question.correctAnswer) 
          ? question.correctAnswer.map(a => a.toLowerCase().trim())
          : [question.correctAnswer.toLowerCase().trim()];
        
        const userAnswerArray = Array.isArray(userAnswer)
          ? userAnswer.map(a => a.toLowerCase().trim())
          : [userAnswer.toLowerCase().trim()];

        // Check if answers match
        const isCorrect = correctAnswer.length === userAnswerArray.length &&
          correctAnswer.every(a => userAnswerArray.includes(a));

        if (isCorrect) {
          earnedPoints += question.points;
        }
      }
    });

    const scorePercentage = Math.round((earnedPoints / totalPoints) * 100);
    const passed = scorePercentage >= PASSING_SCORE;

    // Save to Firestore
    const completedAt = new Date();
    await db.collection('examAttempts').doc(attemptId).update({
      answers,
      completedAt,
      timeSpent,
      totalPoints,
      earnedPoints,
      score: scorePercentage,
      passed,
      premiumUnlocked: passed
    });

    // Update user profile
    const userRef = db.collection('users').doc(user.uid);
    const userDoc = await userRef.get();
    const userData = userDoc.data() || {};
    
    const currentAttempts = userData.qualificationExam?.attempts || 0;
    const nextAttemptDate = new Date();
    nextAttemptDate.setDate(nextAttemptDate.getDate() + RETRY_COOLDOWN_DAYS);

    const updateData: any = {
      'qualificationExam.attempts': currentAttempts + 1,
      'qualificationExam.lastAttemptAt': new Date()
    };

    if (passed) {
      updateData['qualificationExam.hasPassed'] = true;
      updateData['qualificationExam.passedAt'] = new Date();
      updateData['qualificationExam.premiumAccessMethod'] = 'exam';
      updateData['subscriptionTier'] = 'premium';
    } else {
      updateData['qualificationExam.nextAttemptAvailableAt'] = nextAttemptDate;
    }

    await userRef.update(updateData);

    // Return serialized result
    const serializedResult: ExamAttempt = {
      id: attemptId,
      userId: attempt.userId,
      examId: attempt.examId,
      startedAt: attempt.startedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      completedAt: completedAt.toISOString(),
      answers,
      score: scorePercentage,
      totalPoints,
      earnedPoints,
      passed,
      timeSpent,
      premiumUnlocked: passed
    };

    return { success: true, result: serializedResult };
  } catch (error) {
    console.error('Error submitting exam:', error);
    return { success: false, error: 'Failed to submit exam' };
  }
}

/**
 * Get a specific exam attempt with full exam details
 */
export async function getExamAttemptWithDetails(attemptId: string): Promise<{ attempt: ExamAttempt; exam: QualificationExam } | null> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return null;
    }

    // Get attempt
    const attemptDoc = await db.collection('examAttempts').doc(attemptId).get();
    if (!attemptDoc.exists) {
      return null;
    }

    const attemptData = attemptDoc.data();
    
    // Verify ownership
    if (attemptData?.userId !== user.uid) {
      return null;
    }

    // Get exam
    const examDoc = await db.collection('qualificationExams').doc(attemptData.examId).get();
    if (!examDoc.exists) {
      return null;
    }

    const examData = examDoc.data();
    
    if (!examData) {
      return null;
    }

    const attempt: ExamAttempt = {
      id: attemptDoc.id,
      ...attemptData,
      startedAt: attemptData.startedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      completedAt: attemptData.completedAt?.toDate?.()?.toISOString() || null
    } as ExamAttempt;

    const exam: QualificationExam = {
      id: examDoc.id,
      ...examData,
      createdAt: examData.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
    } as QualificationExam;

    return { attempt, exam };
  } catch (error) {
    console.error('Error fetching exam attempt with details:', error);
    return null;
  }
}

/**
 * Get user's exam attempts history
 */
export async function getExamAttempts(): Promise<ExamAttempt[]> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      console.log('No user found in getExamAttempts');
      return [];
    }

    const attemptsSnapshot = await db.collection('examAttempts')
      .where('userId', '==', user.uid)
      .get();

    const attempts = attemptsSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        startedAt: data.startedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        completedAt: data.completedAt?.toDate?.()?.toISOString() || null
      } as ExamAttempt;
    });

    // Sort client-side instead of database-side to avoid index requirement
    attempts.sort((a, b) => {
      const dateA = new Date(a.startedAt).getTime();
      const dateB = new Date(b.startedAt).getTime();
      return dateB - dateA; // descending order
    });

    console.log(`Found ${attempts.length} exam attempts for user ${user.uid}`);
    return attempts;
  } catch (error) {
    console.error('Error fetching exam attempts:', error);
    return [];
  }
}
