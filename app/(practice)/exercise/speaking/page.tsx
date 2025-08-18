'use client'

import { Button } from '@/components/ui/button'
import { ArrowLeft, StopCircle, Loader2, Play, Pause, SkipForward, Clock, Mic } from 'lucide-react'
import Link from 'next/link'
import React, { useState, useEffect, useCallback, useRef } from 'react'
import { vapi } from '@/lib/vapi.sdk'
import { speakingTestManager } from '@/lib/actions/speaking.actions'
import { SpeakingSession, VapiMessage, SpeakingFeedback } from '@/types/speaking'

type CallStatus = 'idle' | 'connecting' | 'active' | 'ended' | 'error'
type TestPhase = 'intro' | 'part1' | 'part2-prep' | 'part2-speak' | 'part3' | 'completed' | 'feedback'

const SpeakingPage = () => {
  // Core state
  const [session, setSession] = useState<SpeakingSession | null>(null)
  const [callStatus, setCallStatus] = useState<CallStatus>('idle')
  const [testPhase, setTestPhase] = useState<TestPhase>('intro')
  const [currentQuestion, setCurrentQuestion] = useState<string>('')
  const [transcript, setTranscript] = useState<string>('')
  const [feedback, setFeedback] = useState<SpeakingFeedback | null>(null)
  
  // Timer state
  const [timeRemaining, setTimeRemaining] = useState<number>(0)
  const [isTimerActive, setIsTimerActive] = useState<boolean>(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  
  // Error state
  const [error, setError] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)

  // Initialize timer
  const startTimer = useCallback((seconds: number) => {
    setTimeRemaining(seconds)
    setIsTimerActive(true)
    
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsTimerActive(false)
          if (testPhase === 'part2-prep') {
            setTestPhase('part2-speak')
            startTimer(120) // 2 minutes for speaking
          } else if (testPhase === 'part2-speak') {
            moveToNextQuestion()
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }, [testPhase])

  // Format time display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Initialize speaking test
  const initializeTest = useCallback(() => {
    try {
      const newSession = speakingTestManager.initializeSession()
      setSession(newSession)
      
      // Start with introduction
      const introMessage = speakingTestManager.getIntroductionMessage()
      setCurrentQuestion(introMessage)
      setTestPhase('intro')
      
      return newSession
    } catch (err) {
      setError('Failed to initialize speaking test')
      console.error('Test initialization error:', err)
      return null
    }
  }, [])

  // Start VAPI session
  const startSession = async () => {
    if (!vapi.isReady()) {
      setError('Voice AI is not properly configured. Please check your settings.')
      return
    }

    setIsLoading(true)
    setError('')
    
    try {
      const testSession = initializeTest()
      if (!testSession) return

      setCallStatus('connecting')
      
      const firstMessage = `Hello! Welcome to the IELTS Speaking test practice. I'm your examiner for today. ${currentQuestion}`
      
      await vapi.start({ 
        firstMessage,
        transcriber: {
          provider: 'deepgram',
          model: 'nova-2',
          language: 'en'
        }
      })
      
    } catch (error) {
      console.error('Failed to start VAPI session:', error)
      setCallStatus('error')
      setError('Failed to start voice session. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Stop session
  const stopSession = async () => {
    try {
      await vapi.stop()
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      setIsTimerActive(false)
    } catch (error) {
      console.error('Failed to stop session:', error)
    }
  }

  // Move to next question
  const moveToNextQuestion = useCallback(() => {
    if (!session) return

    const hasNext = speakingTestManager.moveToNextQuestion()
    const updatedSession = speakingTestManager.getCurrentSession()
    
    if (updatedSession) {
      setSession({ ...updatedSession })
      
      if (!hasNext) {
        // Test completed
        setTestPhase('completed')
        const testFeedback = speakingTestManager.generateFeedback()
        setFeedback(testFeedback)
        stopSession()
        return
      }

      const nextQuestion = speakingTestManager.getCurrentQuestion()
      if (nextQuestion) {
        setCurrentQuestion(nextQuestion)
        
        // Handle phase transitions
        if (updatedSession.currentPart === 2 && testPhase !== 'part2-prep') {
          setTestPhase('part2-prep')
          startTimer(60) // 1 minute preparation
        } else if (updatedSession.currentPart === 3) {
          setTestPhase('part3')
        } else if (updatedSession.currentPart === 1) {
          setTestPhase('part1')
        }
      }
    }
  }, [session, testPhase, startTimer])

  // Skip to next question
  const skipQuestion = () => {
    if (transcript.trim()) {
      speakingTestManager.recordResponse(currentQuestion, transcript)
    }
    moveToNextQuestion()
    setTranscript('')
  }

  // Handle VAPI events
  useEffect(() => {
    const handleCallStart = () => {
      setCallStatus('active')
      if (testPhase === 'intro') {
        setTestPhase('part1')
      }
    }
    
    const handleCallEnd = () => {
      setCallStatus('ended')
      setTranscript('')
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
      setIsTimerActive(false)
    }
    
    const handleMessage = (data: VapiMessage) => {
      try {
        if (data?.type === 'transcript') {
          if (typeof data.transcript === 'string' && data.transcript.trim()) {
            setTranscript(data.transcript)
            console.log('User:', data.transcript)
          }
          return
        }
        
        const role = data?.message?.role ?? data?.role
        const text = data?.message?.content ?? data?.message?.text ?? data?.content ?? data?.text
        
        if (role === 'assistant' && typeof text === 'string' && text.trim()) {
          console.log('Assistant:', text)
        }
      } catch (e) {
        console.error('Message handling error:', e)
      }
    }

    const handleError = (error: any) => {
      console.error('VAPI Error:', error)
      setCallStatus('error')
      setError('Voice session encountered an error. Please try again.')
    }

    if (vapi.isReady()) {
      vapi.on('call-start', handleCallStart)
      vapi.on('call-end', handleCallEnd)
      vapi.on('message', handleMessage)
      vapi.on('error', handleError)
    }

    return () => {
      if (vapi.isReady()) {
        vapi.off('call-start', handleCallStart)
        vapi.off('call-end', handleCallEnd)
        vapi.off('message', handleMessage)
        vapi.off('error', handleError)
      }
    }
  }, [testPhase])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  // Get current part info
  const currentPartInfo = session ? speakingTestManager.getCurrentPartInfo() : null
  const testProgress = session ? speakingTestManager.getTestProgress() : { currentPart: 0, totalParts: 3, progress: 0 }

  return (
    <div className='container mx-auto px-4 py-8 font-semibold'>
      <Link
        href='/exercise'
        className='mb-4 flex items-center text-gray-600 hover:underline dark:text-gray-400'
      >
        <ArrowLeft className='mr-2 h-4 w-4' />
        <span>Back to Exercises</span>
      </Link>

      <header className='mb-8 text-center'>
        <h1 className='text-4xl font-bold'>IELTS Speaking Practice</h1>
        <p className='mt-2 text-lg text-gray-600 dark:text-gray-400'>
          Complete IELTS Speaking Test Simulation
        </p>
        
        {session && (
          <div className='mt-4'>
            <div className='mx-auto max-w-md rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20'>
              <div className='flex items-center justify-between'>
                <span className='text-sm font-medium'>
                  Part {testProgress.currentPart} of {testProgress.totalParts}
                </span>
                <span className='text-sm text-gray-600 dark:text-gray-400'>
                  {Math.round(testProgress.progress)}% Complete
                </span>
              </div>
              <div className='mt-2 h-2 rounded-full bg-gray-200 dark:bg-gray-700'>
                <div 
                  className='h-2 rounded-full bg-blue-500 transition-all duration-300'
                  style={{ width: `${testProgress.progress}%` }}
                />
              </div>
            </div>
          </div>
        )}
      </header>

      {error && (
        <div className='mb-6 rounded-lg bg-red-50 border border-red-200 p-4 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'>
          <p className='font-medium'>Error:</p>
          <p>{error}</p>
        </div>
      )}

      <main className='mx-auto mb-12 w-full max-w-4xl rounded-2xl bg-white p-8 shadow-lg dark:bg-gray-800'>
        {callStatus === 'idle' ? (
          <div className='text-center'>
            <h2 className='mb-4 text-2xl font-bold'>Ready to Start Your Speaking Test?</h2>
            <p className='mb-8 text-gray-600 dark:text-gray-400'>
              This is a complete IELTS Speaking test simulation with all three parts. 
              The AI examiner will guide you through each section.
            </p>
            <Button
              onClick={startSession}
              size='lg'
              disabled={isLoading || callStatus !== 'idle'}
              className='btn-primary'
            >
              {isLoading || callStatus !== 'idle' ? (
                <>
                  <Loader2 className='mr-2 h-6 w-6 animate-spin' />
                  Connecting...
                </>
              ) : (
                <>
                  <Mic className='mr-2 h-6 w-6' />
                  Start Speaking Test
                </>
              )}
            </Button>
          </div>
        ) : callStatus === 'active' ? (
          <div className='space-y-6'>
            {/* Current Part Info */}
            {currentPartInfo && (
              <div className='rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20'>
                <h3 className='font-bold text-blue-900 dark:text-blue-100'>
                  {currentPartInfo.title}
                </h3>
                <p className='text-sm text-blue-700 dark:text-blue-300'>
                  {currentPartInfo.description}
                </p>
                <p className='text-xs text-blue-600 dark:text-blue-400 mt-1'>
                  Duration: {currentPartInfo.duration} minutes
                </p>
              </div>
            )}

            {/* Timer for Part 2 */}
            {(testPhase === 'part2-prep' || testPhase === 'part2-speak') && (
              <div className='rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20'>
                <div className='flex items-center justify-between'>
                  <span className='font-medium text-yellow-900 dark:text-yellow-100'>
                    {testPhase === 'part2-prep' ? 'Preparation Time' : 'Speaking Time'}
                  </span>
                  <div className='flex items-center space-x-2'>
                    <Clock className='h-4 w-4 text-yellow-600' />
                    <span className='font-mono text-lg font-bold text-yellow-900 dark:text-yellow-100'>
                      {formatTime(timeRemaining)}
                    </span>
                  </div>
                </div>
                {testPhase === 'part2-prep' && (
                  <p className='text-sm text-yellow-700 dark:text-yellow-300 mt-2'>
                    Use this time to prepare your response. You can make notes.
                  </p>
                )}
              </div>
            )}

            {/* Current Question */}
            <div className='rounded-lg border-2 border-gray-200 p-6 dark:border-gray-700'>
              <h4 className='mb-3 font-semibold text-gray-900 dark:text-gray-100'>
                Current Question:
              </h4>
              <p className='text-gray-800 dark:text-gray-200 whitespace-pre-line'>
                {currentQuestion}
              </p>
            </div>

            {/* Transcript Display */}
            <div className='min-h-[120px] rounded-lg border bg-gray-50 p-4 dark:bg-gray-700'>
              <h4 className='mb-2 text-sm font-medium text-gray-700 dark:text-gray-300'>
                Your Response:
              </h4>
              <p className='text-gray-800 dark:text-gray-200'>
                {transcript || 'Start speaking...'}
              </p>
            </div>

            {/* Controls */}
            <div className='flex items-center justify-center space-x-4'>
              <Button
                onClick={skipQuestion}
                variant='outline'
                disabled={testPhase === 'part2-prep'}
              >
                <SkipForward className='mr-2 h-4 w-4' />
                Next Question
              </Button>
              
              <Button
                onClick={stopSession}
                variant='destructive'
                className='rounded-full p-4'
              >
                <StopCircle className='h-6 w-6' />
              </Button>
            </div>
          </div>
        ) : testPhase === 'completed' && feedback ? (
          <div className='space-y-6'>
            <div className='text-center'>
              <h2 className='mb-4 text-2xl font-bold text-green-600'>
                Test Completed! 🎉
              </h2>
              <p className='text-gray-600 dark:text-gray-400'>
                Here's your speaking assessment:
              </p>
            </div>

            {/* Feedback Display */}
            <div className='grid gap-4 md:grid-cols-2'>
              <div className='rounded-lg bg-green-50 p-4 dark:bg-green-900/20'>
                <h3 className='font-bold text-green-900 dark:text-green-100'>
                  Overall Score
                </h3>
                <p className='text-2xl font-bold text-green-600'>
                  {feedback.overallScore}/9
                </p>
              </div>
              
              <div className='space-y-2'>
                <div className='flex justify-between'>
                  <span>Fluency & Coherence:</span>
                  <span className='font-bold'>{feedback.fluencyCoherence}/9</span>
                </div>
                <div className='flex justify-between'>
                  <span>Lexical Resource:</span>
                  <span className='font-bold'>{feedback.lexicalResource}/9</span>
                </div>
                <div className='flex justify-between'>
                  <span>Grammatical Range:</span>
                  <span className='font-bold'>{feedback.grammaticalRange}/9</span>
                </div>
                <div className='flex justify-between'>
                  <span>Pronunciation:</span>
                  <span className='font-bold'>{feedback.pronunciation}/9</span>
                </div>
              </div>
            </div>

            <div className='rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20'>
              <h3 className='mb-2 font-bold text-blue-900 dark:text-blue-100'>
                Feedback
              </h3>
              <p className='text-blue-800 dark:text-blue-200'>
                {feedback.feedback}
              </p>
            </div>

            <div className='rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20'>
              <h3 className='mb-2 font-bold text-yellow-900 dark:text-yellow-100'>
                Suggestions for Improvement
              </h3>
              <ul className='list-disc list-inside space-y-1 text-yellow-800 dark:text-yellow-200'>
                {feedback.suggestions.map((suggestion, index) => (
                  <li key={index}>{suggestion}</li>
                ))}
              </ul>
            </div>

            <div className='text-center'>
              <Button
                onClick={() => {
                  setSession(null)
                  setTestPhase('intro')
                  setCallStatus('idle')
                  setFeedback(null)
                  setCurrentQuestion('')
                  setTranscript('')
                  setError('')
                }}
                size='lg'
              >
                Take Another Test
              </Button>
            </div>
          </div>
        ) : (
          <div className='text-center'>
            <Loader2 className='mx-auto h-8 w-8 animate-spin' />
            <p className='mt-2 text-gray-600 dark:text-gray-400'>
              {callStatus === 'connecting' ? 'Connecting...' : 'Processing...'}
            </p>
          </div>
        )}
      </main>

      {/* Tips Section */}
      <section className='mt-16'>
        <h2 className='mb-8 text-center text-3xl font-bold'>
          IELTS Speaking Test Guide
        </h2>
        <div className='grid gap-8 text-left md:grid-cols-3'>
          <div className='rounded-lg border border-gray-200 bg-gray-100 p-6 dark:border-gray-700 dark:bg-gray-900/40'>
            <h3 className='mb-3 text-xl font-bold'>Part 1: Interview (4-5 min)</h3>
            <p className='text-gray-600 dark:text-gray-400'>
              Answer with 2-3 sentences. Don't give short, one-word answers. Provide
              reasons and examples to extend your responses.
            </p>
          </div>
          <div className='rounded-lg border border-gray-200 bg-gray-100 p-6 dark:border-gray-700 dark:bg-gray-900/40'>
            <h3 className='mb-3 text-xl font-bold'>Part 2: Long Turn (3-4 min)</h3>
            <p className='text-gray-600 dark:text-gray-400'>
              You have 1 minute to prepare. Use the cue card to structure your talk. Aim
              to speak for the full 2 minutes.
            </p>
          </div>
          <div className='rounded-lg border border-gray-200 bg-gray-100 p-6 dark:border-gray-700 dark:bg-gray-900/40'>
            <h3 className='mb-3 text-xl font-bold'>Part 3: Discussion (4-5 min)</h3>
            <p className='text-gray-600 dark:text-gray-400'>
              Give longer, more detailed answers. Discuss the topics in a more abstract
              and general way. Show your ability to analyze and speculate.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default SpeakingPage
