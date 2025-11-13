'use client'

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getExamAttempts, getUserQualificationStatus, getExamAttemptWithDetails } from '@/lib/actions/qualification-exam.actions';
import { ExamAttempt, QualificationExam, QualificationQuestion } from '@/types/qualificationExam';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function QualificationExamResults() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState<ExamAttempt | null>(null);
  const [exam, setExam] = useState<QualificationExam | null>(null);
  const [qualStatus, setQualStatus] = useState<any>(null);

  useEffect(() => {
    loadResults();
  }, []);

  async function loadResults() {
    try {
      const attemptId = searchParams.get('attemptId');
      console.log('Loading results for attemptId:', attemptId);
      
      if (attemptId) {
        // If we have an attemptId, get full details including questions
        const [details, status] = await Promise.all([
          getExamAttemptWithDetails(attemptId),
          getUserQualificationStatus()
        ]);

        if (details) {
          console.log('Loaded attempt with exam details');
          setAttempt(details.attempt);
          setExam(details.exam);
        } else {
          console.log('Failed to load attempt details, falling back to list');
          const attempts = await getExamAttempts();
          setAttempt(attempts[0]);
        }
        setQualStatus(status);
      } else {
        // Fallback to list if no attemptId
        const [attempts, status] = await Promise.all([
          getExamAttempts(),
          getUserQualificationStatus()
        ]);
        console.log('No attemptId, using first attempt from list');
        setAttempt(attempts[0]);
        setQualStatus(status);
      }
    } catch (error) {
      console.error('Error loading results:', error);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(date: any): string {
    if (!date) return '';
    const d = date.toDate ? date.toDate() : new Date(date);
    return d.toLocaleDateString() + ' at ' + d.toLocaleTimeString();
  }

  function formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading results...</p>
        </div>
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card border rounded-lg p-6 text-center">
          <h1 className="text-2xl font-bold mb-4">No Results Found</h1>
          <p className="text-muted-foreground mb-6">
            You haven't taken the qualification exam yet.
          </p>
          <Button onClick={() => router.push('/qualification-exam')}>
            Take Exam
          </Button>
        </div>
      </div>
    );
  }

  const passed = attempt.passed;
  const nextAttemptAvailable = qualStatus?.nextAttemptAvailableAt 
    ? new Date(qualStatus.nextAttemptAvailableAt) 
    : null;

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Result Header */}
        <div className={`text-center mb-8 p-8 rounded-lg border-2 ${
          passed 
            ? 'bg-green-50 dark:bg-green-950 border-green-500' 
            : 'bg-red-50 dark:bg-red-950 border-red-500'
        }`}>
          <div className="text-6xl mb-4">
            {passed ? '🎉' : '😔'}
          </div>
          <h1 className="text-4xl font-bold mb-2">
            {passed ? 'Congratulations!' : 'Not Quite There'}
          </h1>
          <p className="text-lg text-muted-foreground mb-4">
            {passed 
              ? 'You passed the qualification exam!'
              : 'You didn\'t pass this time, but you can try again!'}
          </p>
          <div className="text-5xl font-bold">
            {attempt.score}%
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Passing score: 50%
          </p>
        </div>

        {/* Premium Unlock Message */}
        {passed && (
          <div className="bg-primary/10 border border-primary rounded-lg p-6 mb-6 text-center">
            <h2 className="text-2xl font-bold mb-2">🔓 Premium Unlocked!</h2>
            <p className="text-muted-foreground mb-4">
              You now have full access to all premium features
            </p>
            <Link href="/dashboard">
              <Button size="lg">
                Go to Dashboard
              </Button>
            </Link>
          </div>
        )}

        {/* Score Details */}
        <div className="bg-card border rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Exam Details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted p-4 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Score</div>
              <div className="text-2xl font-bold">{attempt.score}%</div>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Points</div>
              <div className="text-2xl font-bold">{attempt.earnedPoints}/{attempt.totalPoints}</div>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Time Taken</div>
              <div className="text-2xl font-bold">{formatDuration(attempt.timeSpent)}</div>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <div className="text-sm text-muted-foreground mb-1">Completed</div>
              <div className="text-sm font-medium">{formatDate(attempt.completedAt)}</div>
            </div>
          </div>
        </div>

        {/* Retry Information */}
        {!passed && (
          <div className="bg-card border rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Next Steps</h2>
            <div className="space-y-4">
              {nextAttemptAvailable && (
                <div className="bg-amber-50 dark:bg-amber-950 border border-amber-500 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">⏳</span>
                    <div>
                      <h3 className="font-semibold mb-1">Cooldown Period</h3>
                      <p className="text-sm text-muted-foreground">
                        You can retry the exam on:
                        <br />
                        <strong className="text-base">
                          {nextAttemptAvailable.toLocaleDateString()} at {nextAttemptAvailable.toLocaleTimeString()}
                        </strong>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-blue-50 dark:bg-blue-950 border border-blue-500 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <span className="text-2xl">📚</span>
                  <div>
                    <h3 className="font-semibold mb-1">Improve Your Skills</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Use this time to practice and improve your English proficiency.
                    </p>
                    <div className="flex gap-2 flex-wrap">
                      <Link href="/exercise/reading">
                        <Button variant="outline" size="sm">Reading Practice</Button>
                      </Link>
                      <Link href="/exercise/listening">
                        <Button variant="outline" size="sm">Listening Practice</Button>
                      </Link>
                      <Link href="/exercise/writing">
                        <Button variant="outline" size="sm">Writing Practice</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Question Breakdown */}
        {exam && attempt.answers && (
          <div className="bg-card border rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Question Breakdown</h2>
            <div className="space-y-3">
              {exam.questions.map((question, index) => {
                const userAnswer = attempt.answers[question.id];
                const correctAnswer = Array.isArray(question.correctAnswer)
                  ? question.correctAnswer
                  : [question.correctAnswer];
                const userAnswerArray = Array.isArray(userAnswer)
                  ? userAnswer
                  : [userAnswer];
                
                // Check if correct
                const normalizedCorrect = correctAnswer.map(a => String(a).toLowerCase().trim());
                const normalizedUser = userAnswerArray.map(a => String(a).toLowerCase().trim());
                const isCorrect = normalizedCorrect.length === normalizedUser.length &&
                  normalizedCorrect.every(a => normalizedUser.includes(a));

                return (
                  <div
                    key={question.id}
                    className={`p-4 rounded-lg border-2 ${
                      isCorrect
                        ? 'bg-green-50 dark:bg-green-950 border-green-500'
                        : 'bg-red-50 dark:bg-red-950 border-red-500'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`text-xl ${
                            isCorrect ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {isCorrect ? '✓' : '✗'}
                          </span>
                          <span className="font-semibold text-sm">
                            Question {index + 1}
                          </span>
                          <span className="text-xs bg-muted px-2 py-0.5 rounded">
                            {question.category.replace('-', ' ')}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {question.question}
                        </p>
                      </div>
                      <span className={`font-bold ${
                        isCorrect ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {isCorrect ? `+${question.points}` : '0'}
                      </span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="font-medium text-muted-foreground">Your Answer:</span>
                        <div className={`mt-1 p-2 rounded ${
                          isCorrect
                            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                            : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                        }`}>
                          {userAnswer || '(no answer)'}
                        </div>
                      </div>
                      {!isCorrect && (
                        <div>
                          <span className="font-medium text-muted-foreground">Correct Answer:</span>
                          <div className="mt-1 p-2 rounded bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                            {correctAnswer.join(' or ')}
                          </div>
                        </div>
                      )}
                    </div>

                    {!isCorrect && question.explanation && (
                      <div className="mt-3 pt-3 border-t border-muted">
                        <span className="text-xs font-medium text-muted-foreground">Explanation:</span>
                        <p className="text-sm mt-1 text-muted-foreground">
                          {question.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Attempt History */}
        {qualStatus && (
          <div className="bg-card border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Your Attempts</h2>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold">{qualStatus.attempts}</div>
                <div className="text-sm text-muted-foreground">Total Attempts</div>
              </div>
              <div>
                <div className="text-3xl font-bold">
                  {qualStatus.hasPassed ? '1' : '0'}
                </div>
                <div className="text-sm text-muted-foreground">Passed</div>
              </div>
              <div>
                <div className="text-3xl font-bold">
                  {qualStatus.attempts - (qualStatus.hasPassed ? 1 : 0)}
                </div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex gap-4 justify-center">
          <Link href="/dashboard">
            <Button variant="outline">
              Go to Dashboard
            </Button>
          </Link>
          {!passed && !nextAttemptAvailable && (
            <Link href="/qualification-exam">
              <Button>
                Try Again
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
