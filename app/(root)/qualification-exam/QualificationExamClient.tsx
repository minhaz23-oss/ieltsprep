'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  getQualificationExam, 
  canTakeExam, 
  startExamAttempt, 
  submitExam,
  isPromotionalPeriodActive,
  getUserQualificationStatus
} from '@/lib/actions/qualification-exam.actions';
import { QualificationExam, QualificationQuestion } from '@/types/qualificationExam';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function QualificationExamClient() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState<QualificationExam | null>(null);
  const [canTake, setCanTake] = useState(false);
  const [eligibilityMessage, setEligibilityMessage] = useState('');
  const [nextAttemptDate, setNextAttemptDate] = useState<string | null>(null);
  const [promoStatus, setPromoStatus] = useState<any>(null);
  const [qualStatus, setQualStatus] = useState<any>(null);
  
  // Exam state
  const [examStarted, setExamStarted] = useState(false);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadExamData();
  }, []);

  // Timer effect
  useEffect(() => {
    if (examStarted && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleSubmitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [examStarted, timeRemaining]);

  async function loadExamData() {
    try {
      const [examData, eligibility, promo, status] = await Promise.all([
        getQualificationExam(),
        canTakeExam(),
        isPromotionalPeriodActive(),
        getUserQualificationStatus()
      ]);

      setExam(examData);
      setCanTake(eligibility.canTake);
      setEligibilityMessage(eligibility.reason || '');
      setNextAttemptDate(eligibility.nextAttemptDate || null);
      setPromoStatus(promo);
      setQualStatus(status);
    } catch (error) {
      console.error('Error loading exam:', error);
      toast.error('Failed to load exam');
    } finally {
      setLoading(false);
    }
  }

  async function handleStartExam() {
    if (!exam) return;

    try {
      setLoading(true);
      const result = await startExamAttempt(exam.id);
      
      if (!result.success || !result.attemptId) {
        toast.error(result.error || 'Failed to start exam');
        return;
      }

      setAttemptId(result.attemptId);
      setExamStarted(true);
      setTimeRemaining(exam.duration * 60); // Convert minutes to seconds
      toast.success('Exam started! Good luck!');
    } catch (error) {
      console.error('Error starting exam:', error);
      toast.error('Failed to start exam');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitExam() {
    if (!attemptId || submitting) return;

    try {
      setSubmitting(true);
      const timeSpent = exam ? (exam.duration * 60 - timeRemaining) : 0;
      
      const result = await submitExam(attemptId, answers, timeSpent);
      
      if (!result.success) {
        toast.error(result.error || 'Failed to submit exam');
        return;
      }

      if (result.result?.passed) {
        toast.success('Congratulations! You passed the exam!');
        router.push('/qualification-exam/results?attemptId=' + attemptId + '&passed=true');
      } else {
        toast.error('You did not pass this time. Try again after the cooldown period.');
        router.push('/qualification-exam/results?attemptId=' + attemptId + '&passed=false');
      }
    } catch (error) {
      console.error('Error submitting exam:', error);
      toast.error('Failed to submit exam');
    } finally {
      setSubmitting(false);
    }
  }

  function handleAnswerChange(questionId: string, answer: string) {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  }

  function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading exam...</p>
        </div>
      </div>
    );
  }

  if (!promoStatus?.isActive) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card border rounded-lg p-6 text-center">
          <h1 className="text-2xl font-bold mb-4">Promotional Period Ended</h1>
          <p className="text-muted-foreground mb-6">
            The free premium qualification exam promotion has ended. 
            Please check our pricing page for subscription options.
          </p>
          <Button onClick={() => router.push('/pricing')}>
            View Pricing
          </Button>
        </div>
      </div>
    );
  }

  if (qualStatus?.hasPassed) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card border rounded-lg p-6 text-center">
          <div className="text-green-500 text-5xl mb-4">✓</div>
          <h1 className="text-2xl font-bold mb-4">Already Qualified!</h1>
          <p className="text-muted-foreground mb-6">
            You have already passed the qualification exam and have premium access.
          </p>
          <Button onClick={() => router.push('/dashboard')}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (!canTake && nextAttemptDate) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card border rounded-lg p-6 text-center">
          <h1 className="text-2xl font-bold mb-4">Cooldown Period</h1>
          <p className="text-muted-foreground mb-4">
            You can retry the exam after: <br />
            <strong className="text-lg">
              {new Date(nextAttemptDate).toLocaleDateString()} at {new Date(nextAttemptDate).toLocaleTimeString()}
            </strong>
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Use this time to study and improve your English skills!
          </p>
          <div className="space-y-2">
            <Button onClick={() => router.push('/dashboard')} className="w-full">
              Go to Dashboard
            </Button>
            <Button onClick={() => router.push('/practice')} variant="outline" className="w-full">
              Practice Exercises
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!exam) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-card border rounded-lg p-6 text-center">
          <h1 className="text-2xl font-bold mb-4">No Exam Available</h1>
          <p className="text-muted-foreground mb-6">
            The qualification exam is currently not available.
          </p>
          <Button onClick={() => router.push('/dashboard')}>
            Go to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (!examStarted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-card border rounded-lg p-8">
          <div className="mb-6">
            <div className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-4">
              🎓 Limited Time Offer
            </div>
            <h1 className="text-3xl font-bold mb-2">{exam.title}</h1>
            <p className="text-muted-foreground">{exam.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-muted p-4 rounded-lg">
              <div className="text-2xl font-bold">{exam.questions.length}</div>
              <div className="text-sm text-muted-foreground">Questions</div>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <div className="text-2xl font-bold">{exam.duration} min</div>
              <div className="text-sm text-muted-foreground">Duration</div>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <div className="text-2xl font-bold">{exam.passingScore}%</div>
              <div className="text-sm text-muted-foreground">Passing Score</div>
            </div>
            <div className="bg-muted p-4 rounded-lg">
              <div className="text-2xl font-bold">{qualStatus?.attempts || 0}</div>
              <div className="text-sm text-muted-foreground">Your Attempts</div>
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
            <h3 className="font-semibold mb-2">📋 Exam Instructions:</h3>
            <ul className="text-sm space-y-1 list-disc list-inside text-muted-foreground">
              <li>You have {exam.duration} minutes to complete the exam</li>
              <li>You must score 50% or higher to pass</li>
              <li>Once started, the timer cannot be paused</li>
              <li>If you fail, you can retry after 7 days</li>
              <li>Passing unlocks premium features for free!</li>
            </ul>
          </div>

          <Button 
            onClick={handleStartExam} 
            disabled={loading || !canTake}
            className="w-full h-12 text-lg"
          >
            {loading ? 'Starting...' : 'Start Exam'}
          </Button>

          {!canTake && (
            <p className="text-center text-sm text-red-500 mt-4">{eligibilityMessage}</p>
          )}
        </div>
      </div>
    );
  }

  // Exam in progress
  const currentQuestion = exam.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / exam.questions.length) * 100;
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header with timer */}
      <div className="sticky top-0 z-10 bg-card border-b shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <div className="text-sm text-muted-foreground">
              Question {currentQuestionIndex + 1} of {exam.questions.length}
            </div>
            <div className="text-xs text-muted-foreground">
              {answeredCount} answered
            </div>
          </div>
          <div className={`text-2xl font-bold ${timeRemaining < 300 ? 'text-red-500' : ''}`}>
            ⏱️ {formatTime(timeRemaining)}
          </div>
        </div>
        <div className="h-1 bg-muted">
          <div 
            className="h-full bg-primary transition-all duration-300" 
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-card border rounded-lg p-6 mb-6">
          <div className="mb-4">
            <span className="inline-block bg-primary/10 text-primary px-2 py-1 rounded text-xs font-medium mb-2">
              {currentQuestion.category.replace('-', ' ').toUpperCase()}
            </span>
            <h2 className="text-xl font-semibold whitespace-pre-wrap">{currentQuestion.question}</h2>
          </div>

          <div className="space-y-3">
            {currentQuestion.options?.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerChange(currentQuestion.id, option)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                  answers[currentQuestion.id] === option
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    answers[currentQuestion.id] === option
                      ? 'border-primary bg-primary text-white'
                      : 'border-border'
                  }`}>
                    {answers[currentQuestion.id] === option && '✓'}
                  </div>
                  <span>{option}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
            disabled={currentQuestionIndex === 0}
          >
            ← Previous
          </Button>

          {currentQuestionIndex === exam.questions.length - 1 ? (
            <Button
              onClick={handleSubmitExam}
              disabled={submitting || answeredCount < exam.questions.length}
              className="min-w-32"
            >
              {submitting ? 'Submitting...' : 'Submit Exam'}
            </Button>
          ) : (
            <Button
              onClick={() => setCurrentQuestionIndex(prev => Math.min(exam.questions.length - 1, prev + 1))}
            >
              Next →
            </Button>
          )}
        </div>

        {answeredCount < exam.questions.length && currentQuestionIndex === exam.questions.length - 1 && (
          <p className="text-center text-sm text-amber-600 mt-4">
            ⚠️ Please answer all questions before submitting
          </p>
        )}
      </div>
    </div>
  );
}
