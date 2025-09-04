'use client'

import { Button } from '@/components/ui/button'
import { ArrowLeft, StopCircle, Loader2, Mic, FileText, Ticket, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { vapi } from '@/lib/vapi.sdk'
import { VapiMessage, SpeakingSession, ConversationMessage } from '@/types/speaking'
import { speakingSessionManager, classifyMessageType, evaluateSpeakingSession } from '@/lib/actions/speaking.actions'
import { useAuth } from '@/lib/hooks/useAuth'
import { getSpeakingTicketStatus, useSpeakingTicket, TicketStatus } from '@/lib/actions/speaking-tickets.actions'
import SpeakingTicketModal from '@/components/SpeakingTicketModal'

type CallStatus = 'idle' | 'connecting' | 'active' | 'ended' | 'error' | 'evaluating' | 'evaluated'

const SpeakingPage = () => {
  const router = useRouter()
  const { user, loading: authLoading, isAuthenticated } = useAuth()
  
  // Core state
  const [callStatus, setCallStatus] = useState<CallStatus>('idle')
  const [transcript, setTranscript] = useState<string>('')
  
  // Error state
  const [error, setError] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  
  // Session and conversation state
  const [currentSession, setCurrentSession] = useState<SpeakingSession | null>(null)
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([])
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false)
  
  // Ticket management state
  const [ticketStatus, setTicketStatus] = useState<TicketStatus | null>(null)
  const [showTicketModal, setShowTicketModal] = useState<boolean>(false)
  const [ticketLoading, setTicketLoading] = useState<boolean>(false)

  // Handle start session button click
  const handleStartSession = () => {
    if (!ticketStatus) {
      setError('Unable to load ticket status. Please refresh the page.')
      return
    }

    if (!ticketStatus.hasTickets) {
      setError('No tickets remaining for today. Please come back tomorrow.')
      return
    }

    // Show confirmation modal
    setShowTicketModal(true)
  }

  // Confirm ticket usage and start session
  const confirmTicketUsage = async () => {
    setTicketLoading(true)
    setError('')

    try {
      // Use the ticket
      const result = await useSpeakingTicket()
      
      if (!result.success) {
        setError(result.message)
        setShowTicketModal(false)
        setTicketLoading(false)
        return
      }

      // Update ticket status
      if (ticketStatus) {
        setTicketStatus({
          ...ticketStatus,
          hasTickets: (result.remainingTickets || 0) > 0,
          remainingTickets: result.remainingTickets || 0
        })
      }

      // Start the actual VAPI session
      await startVapiSession()
      
      setShowTicketModal(false)
    } catch (error) {
      console.error('Error using ticket:', error)
      setError('Failed to use ticket. Please try again.')
      setShowTicketModal(false)
    } finally {
      setTicketLoading(false)
    }
  }

  // Start VAPI session (internal function)
  const startVapiSession = async () => {
    if (!vapi.isReady()) {
      setError('Voice AI is not properly configured. Please check your settings.')
      return
    }

    setIsLoading(true)
    setError('')
    
    try {
      setCallStatus('connecting')
      
      // Create new speaking session
      const session = speakingSessionManager.createSession()
      setCurrentSession(session)
      setConversationHistory([])
      
      // Simple welcome message - questions will be handled by VAPI system prompt
      const firstMessage = `Hello! Welcome to the IELTS Speaking test practice. I'm your examiner for today. Let's begin with the speaking test.`
      
      // Add the first message to conversation history
      speakingSessionManager.addMessage({
        role: 'assistant',
        content: firstMessage,
        type: 'instruction'
      })
      
      await vapi.start({
        firstMessage,
        transcriber: {
          provider: 'deepgram',
          model: 'nova-2',
          language: 'en'
        },
        model: {
          provider: 'openai',
          model: 'gpt-3.5-turbo',
          temperature: 0.7,
          maxTokens: 150,
          systemPrompt: `You are an IELTS Speaking test examiner. Conduct a proper IELTS Speaking test following these rules:

CRITICAL INSTRUCTIONS:
1. Ask ONE question at a time and WAIT for the candidate's response before asking the next question
2. Do NOT ask multiple questions in a single response
3. Listen to the candidate's full answer before proceeding
4. Keep your responses short and focused - maximum 2 sentences per response
5. Follow the IELTS Speaking test structure exactly

IELTS SPEAKING TEST STRUCTURE:

PART 1 (4-5 minutes): Introduction & Interview
- Start with: "Let's begin with Part 1. I'd like to ask you some questions about yourself."
- Ask about: home/accommodation, work/studies, hometown, hobbies, daily routine
- Ask 2-3 questions per topic, one at a time
- Example: "Where do you live?" → wait for answer → "What do you like about your home?" → wait for answer

PART 2 (3-4 minutes): Long Turn
- Give a cue card topic: "Now we'll move to Part 2. I'm going to give you a topic and I'd like you to talk about it for 1-2 minutes."
- Provide clear instructions: "You have 1 minute to think about what you're going to say. You can make notes if you wish."
- Example topics: Describe a person you admire, a memorable trip, a skill you learned

PART 3 (4-5 minutes): Discussion
- "Now let's discuss some more abstract questions related to your Part 2 topic."
- Ask deeper, analytical questions
- Encourage detailed responses

CONVERSATION RULES:
- Speak naturally and conversationally
- Give encouraging feedback like "That's interesting" or "I see"
- Ask follow-up questions based on their answers
- Keep questions clear and at appropriate difficulty level
- Maintain professional but friendly tone
- If they give short answers, encourage them to elaborate: "Can you tell me more about that?"

Remember: ONE QUESTION AT A TIME. Wait for their complete response before asking the next question.`
        },
        voice: {
          provider: 'playht',
          voiceId: 'jennifer'
        },
        endCallFunctionEnabled: false,
        recordingEnabled: false
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
      
      // End the speaking session
      speakingSessionManager.endSession()
      
      // Trigger evaluation after a short delay
      setTimeout(() => {
        handleEvaluation()
      }, 1000)
      
    } catch (error) {
      console.error('Failed to stop session:', error)
    }
  }

  // Handle evaluation of the speaking session
  const handleEvaluation = async () => {
    if (!currentSession || currentSession.messages.length < 2) {
      setError('Session too short for evaluation. Please have a longer conversation.')
      return
    }

    setIsEvaluating(true)
    setCallStatus('evaluating')

    try {
      const evaluationRequest = speakingSessionManager.getEvaluationRequest()
      if (!evaluationRequest) {
        throw new Error('No session data available for evaluation')
      }

      const result = await evaluateSpeakingSession(evaluationRequest)
      
      if (result.success && result.evaluation) {
        // Update session with evaluation results
        if (currentSession) {
          currentSession.evaluation = result.evaluation
          currentSession.status = 'evaluated'
          setCurrentSession({ ...currentSession })
        }
        setCallStatus('evaluated')
      } else {
        throw new Error(result.error || 'Evaluation failed')
      }
    } catch (error) {
      console.error('Evaluation error:', error)
      setError(`Evaluation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setCallStatus('ended')
    } finally {
      setIsEvaluating(false)
    }
  }

  // Handle VAPI events
  useEffect(() => {
    const handleCallStart = () => {
      setCallStatus('active')
    }
    
    const handleCallEnd = () => {
      setCallStatus('ended')
      setTranscript('')
    }
    
    const handleMessage = (data: VapiMessage) => {
      try {
        if (data?.type === 'transcript') {
          if (typeof data.transcript === 'string' && data.transcript.trim()) {
            setTranscript(data.transcript)
            console.log('🎤 User transcript:', data.transcript)
            
            // Add user message to conversation history
            const messageType = classifyMessageType(data.transcript, 'user')
            console.log('���� Classified user message as:', messageType)
            
            speakingSessionManager.addMessage({
              role: 'user',
              content: data.transcript,
              type: messageType
            })
            
            // Update conversation history state
            if (currentSession) {
              setConversationHistory([...speakingSessionManager.currentSession?.messages || []])
            }
          }
          return
        }
        
        const role = data?.message?.role ?? data?.role
        const text = data?.message?.content ?? data?.message?.text ?? data?.content ?? data?.text
        
        if (role === 'assistant' && typeof text === 'string' && text.trim()) {
          console.log('🤖 Assistant message:', text)
          
          // Add assistant message to conversation history
          const messageType = classifyMessageType(text, 'assistant')
          console.log('📝 Classified assistant message as:', messageType)
          
          speakingSessionManager.addMessage({
            role: 'assistant',
            content: text,
            type: messageType
          })
          
          // Update conversation history state
          if (currentSession) {
            setConversationHistory([...speakingSessionManager.currentSession?.messages || []])
          }
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
  }, [currentSession])

  // Authentication check - redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/sign-in')
    }
  }, [authLoading, isAuthenticated, router])

  // Load ticket status when user is authenticated
  useEffect(() => {
    const loadTicketStatus = async () => {
      if (isAuthenticated && user) {
        try {
          const status = await getSpeakingTicketStatus()
          setTicketStatus(status)
        } catch (error) {
          console.error('Error loading ticket status:', error)
        }
      }
    }

    loadTicketStatus()
  }, [isAuthenticated, user])

  // Load existing session on component mount
  useEffect(() => {
    if (isAuthenticated) {
      const existingSession = speakingSessionManager.loadSession()
      if (existingSession && existingSession.status === 'completed') {
        setCurrentSession(existingSession)
        setConversationHistory(existingSession.messages)
        if (existingSession.evaluation) {
          setCallStatus('evaluated')
        } else {
          setCallStatus('ended')
        }
      }
    }
  }, [isAuthenticated])

  // Reset session function
  const resetSession = () => {
    speakingSessionManager.clearSession()
    setCurrentSession(null)
    setConversationHistory([])
    setCallStatus('idle')
    setTranscript('')
    setError('')
    setIsEvaluating(false)
  }

  // Show loading screen while checking authentication
  if (authLoading) {
    return (
      <div className='min-h-screen px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-24 py-8 sm:py-12 md:py-16 font-semibold'>
        <div className='flex items-center justify-center min-h-[400px]'>
          <div className='text-center'>
            <Loader2 className='mx-auto h-6 w-6 sm:h-8 sm:w-8 animate-spin mb-4' />
            <p className='text-gray-600 dark:text-gray-400 text-sm sm:text-base'>Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  // Don't render anything if not authenticated (will redirect)
  if (!isAuthenticated) {
    return null
  }

  return (
    <div className='min-h-screen px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-24 py-8 sm:py-12 md:py-16 font-semibold'>
      <Link
        href='/exercise'
        className='mb-6 sm:mb-8 flex items-center text-gray-600 hover:underline dark:text-gray-400'
      >
        <ArrowLeft className='mr-2 h-4 w-4' />
        <span className='text-sm sm:text-base'>Back to Exercises</span>
      </Link>

      <header className='mb-8 sm:mb-12 text-center'>
        <h1 className='text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold'>
          IELTS <span className="p-1 px-2 bg-primary rounded-md text-white -rotate-3 inline-block">Speaking</span> Practice
        </h1>
        <p className='mt-3 sm:mt-4 text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400'>
          AI-Powered IELTS Speaking Test Simulation
        </p>
        
        {/* Ticket Status Display */}
        {ticketStatus && (
          <div className='mt-4 sm:mt-6 inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg'>
            <Ticket className='h-4 w-4 text-blue-600' />
            <span className='text-xs sm:text-sm text-blue-800 dark:text-blue-200'>
              {ticketStatus.hasTickets
                ? `${ticketStatus.remainingTickets} free test${ticketStatus.remainingTickets !== 1 ? 's' : ''} remaining today`
                : 'No free tests remaining today'
              }
            </span>
          </div>
        )}
      </header>

      {error && (
        <div className='mb-6 rounded-lg bg-red-50 border border-red-200 p-3 sm:p-4 text-red-700 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400'>
          <p className='font-medium text-sm sm:text-base'>Error:</p>
          <p className='text-sm sm:text-base'>{error}</p>
        </div>
      )}

      <main className='mx-auto mb-8 sm:mb-12 w-full max-w-4xl rounded-2xl bg-white p-4 sm:p-6 lg:p-8 shadow-lg dark:bg-gray-800'>
        {callStatus === 'idle' ? (
          <div className='text-center'>
            <h2 className='mb-4 text-xl sm:text-2xl font-bold'>Ready to Start Your Speaking Test?</h2>
            <p className='mb-6 sm:mb-8 text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed'>
              Connect with our AI examiner for a complete IELTS Speaking test simulation.
              The AI will guide you through all parts of the test and provide questions dynamically.
            </p>
            
            {ticketStatus && !ticketStatus.hasTickets ? (
              <div className='space-y-4'>
                <div className='bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 sm:p-6'>
                  <AlertCircle className='mx-auto h-10 w-10 sm:h-12 sm:w-12 text-orange-500 mb-4' />
                  <h3 className='text-lg sm:text-xl font-semibold text-orange-800 dark:text-orange-200 mb-2'>
                    No Tickets Remaining
                  </h3>
                  <p className='text-sm sm:text-base text-orange-700 dark:text-orange-300 mb-4'>
                    You've used your free speaking test for today. Come back tomorrow for another free AI speaking test!
                  </p>
                  <p className='text-xs sm:text-sm text-orange-600 dark:text-orange-400'>
                    Your tickets reset daily at midnight. You get 1 free AI speaking test per day.
                  </p>
                </div>
                <Button disabled size='lg' className='opacity-50 cursor-not-allowed text-sm sm:text-base'>
                  <Ticket className='mr-2 h-5 w-5 sm:h-6 sm:w-6' />
                  No Tickets Left
                </Button>
                <div className=' w-full bg-blue-100 rounded-md height-[80px]mt-3 p-3 flex justify-center items-center flex-col border border-blue-300 gap-3'>
                  <h1 className='font-semibold text-gray-600 text-center text-[20px]'>Want unlimited speaking test?</h1>
                  <Link href={'/pricing'} className='btn-primary'>Upgrade to premium</Link>
                </div>
              </div>
            ) : (
              <Button
                onClick={handleStartSession}
                size='lg'
                disabled={isLoading || callStatus !== 'idle' || !ticketStatus}
                className='btn-primary text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4'
              >
                {isLoading || callStatus !== 'idle' ? (
                  <>
                    <Loader2 className='mr-2 h-5 w-5 sm:h-6 sm:w-6 animate-spin' />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Mic className='mr-2 h-5 w-5 sm:h-6 sm:w-6' />
                    Start Speaking Test
                  </>
                )}
              </Button>
            )}
          </div>
        ) : callStatus === 'active' ? (
          <div className='space-y-4 sm:space-y-6'>
            {/* Session Status */}
            <div className='rounded-lg bg-green-50 p-3 sm:p-4 dark:bg-green-900/20'>
              <h3 className='font-bold text-green-900 dark:text-green-100 text-sm sm:text-base'>
                🎤 Speaking Test in Progress
              </h3>
              <p className='text-xs sm:text-sm text-green-700 dark:text-green-300'>
                The AI examiner will guide you through the test. Listen carefully and respond naturally.
              </p>
            </div>

            {/* Transcript Display */}
            <div className='min-h-[200px] rounded-lg border bg-gray-50 p-4 sm:p-6 dark:bg-gray-700'>
              <h4 className='mb-3 sm:mb-4 text-base sm:text-lg font-medium text-gray-700 dark:text-gray-300'>
                Your Response:
              </h4>
              <div className='rounded-lg bg-white p-3 sm:p-4 dark:bg-gray-800 min-h-[120px]'>
                <p className='text-gray-800 dark:text-gray-200 text-sm sm:text-base lg:text-lg leading-relaxed'>
                  {transcript || 'Start speaking... Your voice will be transcribed here in real-time.'}
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className='flex items-center justify-center'>
              <Button
                onClick={stopSession}
                variant='destructive'
                size='lg'
                className='rounded-full px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base'
              >
                <StopCircle className='mr-2 h-5 w-5 sm:h-6 sm:w-6' />
                End Test
              </Button>
            </div>
          </div>
        ) : callStatus === 'evaluating' ? (
          <div className='text-center space-y-4 sm:space-y-6'>
            <div className='flex items-center justify-center'>
              <Loader2 className='h-6 w-6 sm:h-8 sm:w-8 animate-spin text-blue-600' />
            </div>
            <h2 className='text-xl sm:text-2xl font-bold text-blue-600'>
              Evaluating Your Performance
            </h2>
            <p className='text-sm sm:text-base text-gray-600 dark:text-gray-400'>
              Our AI examiner is analyzing your responses and calculating your IELTS band score...
            </p>
          </div>
        ) : callStatus === 'evaluated' ? (
          <div className='space-y-4 sm:space-y-6'>
            {/* Evaluation Results */}
            {currentSession?.evaluation && (
              <div className='rounded-lg bg-green-50 border border-green-200 p-4 sm:p-6 dark:bg-green-900/20 dark:border-green-800'>
                <h2 className='text-xl sm:text-2xl font-bold text-green-800 dark:text-green-200 mb-4'>
                  🎉 Evaluation Complete!
                </h2>
                
                {/* Overall Band Score */}
                <div className='text-center mb-4 sm:mb-6'>
                  <div className='inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-green-600 text-white text-xl sm:text-2xl font-bold mb-2'>
                    {currentSession.evaluation.overallBandScore}
                  </div>
                  <p className='text-base sm:text-lg font-semibold text-green-800 dark:text-green-200'>
                    Overall IELTS Band Score
                  </p>
                </div>

                {/* Criteria Breakdown */}
                <div className='grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6'>
                  <div className='text-center'>
                    <div className='text-xl sm:text-2xl font-bold text-green-600'>
                      {currentSession.evaluation.criteria.fluencyCoherence}
                    </div>
                    <div className='text-xs sm:text-sm text-gray-600 dark:text-gray-400'>
                      Fluency & Coherence
                    </div>
                  </div>
                  <div className='text-center'>
                    <div className='text-xl sm:text-2xl font-bold text-green-600'>
                      {currentSession.evaluation.criteria.lexicalResource}
                    </div>
                    <div className='text-xs sm:text-sm text-gray-600 dark:text-gray-400'>
                      Lexical Resource
                    </div>
                  </div>
                  <div className='text-center'>
                    <div className='text-xl sm:text-2xl font-bold text-green-600'>
                      {currentSession.evaluation.criteria.grammaticalRange}
                    </div>
                    <div className='text-xs sm:text-sm text-gray-600 dark:text-gray-400'>
                      Grammar & Accuracy
                    </div>
                  </div>
                  <div className='text-center'>
                    <div className='text-xl sm:text-2xl font-bold text-green-600'>
                      {currentSession.evaluation.criteria.pronunciation}
                    </div>
                    <div className='text-xs sm:text-sm text-gray-600 dark:text-gray-400'>
                      Pronunciation
                    </div>
                  </div>
                </div>

                {/* Detailed Feedback */}
                <div className='space-y-3 sm:space-y-4'>
                  <h3 className='text-base sm:text-lg font-semibold text-green-800 dark:text-green-200'>
                    Detailed Feedback
                  </h3>
                  
                  {/* Strengths */}
                  <div>
                    <h4 className='font-medium text-green-700 dark:text-green-300 mb-2 text-sm sm:text-base'>
                      ✅ Strengths
                    </h4>
                    <ul className='list-disc list-inside space-y-1 text-xs sm:text-sm text-gray-700 dark:text-gray-300'>
                      {currentSession.evaluation.strengths.map((strength, index) => (
                        <li key={index}>{strength}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Areas for Improvement */}
                  <div>
                    <h4 className='font-medium text-orange-700 dark:text-orange-300 mb-2 text-sm sm:text-base'>
                      📈 Areas for Improvement
                    </h4>
                    <ul className='list-disc list-inside space-y-1 text-xs sm:text-sm text-gray-700 dark:text-gray-300'>
                      {currentSession.evaluation.improvements.map((improvement, index) => (
                        <li key={index}>{improvement}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Advice */}
                  <div>
                    <h4 className='font-medium text-blue-700 dark:text-blue-300 mb-2 text-sm sm:text-base'>
                      💡 Advice
                    </h4>
                    <p className='text-xs sm:text-sm text-gray-700 dark:text-gray-300'>
                      {currentSession.evaluation.advice}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className='flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4 sm:mt-6'>
                  <Button onClick={resetSession} size='lg' className='flex-1 text-sm sm:text-base'>
                    Start New Test
                  </Button>
                  <Button
                    variant='outline'
                    size='lg'
                    onClick={() => {
                      // Toggle conversation history view - safe for SSR
                      if (typeof window !== 'undefined') {
                        const historyElement = document.getElementById('conversation-history')
                        if (historyElement) {
                          historyElement.scrollIntoView({ behavior: 'smooth' })
                        }
                      }
                    }}
                    className='flex-1 text-sm sm:text-base'
                  >
                    <FileText className='mr-2 h-4 w-4' />
                    View Conversation
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : callStatus === 'ended' ? (
          <div className='text-center space-y-4 sm:space-y-6'>
            <h2 className='text-xl sm:text-2xl font-bold text-green-600'>
              Test Session Ended
            </h2>
            <p className='text-sm sm:text-base text-gray-600 dark:text-gray-400'>
              Your speaking test session has been completed. You can start a new session anytime.
            </p>
            <Button onClick={resetSession} size='lg' className='text-sm sm:text-base'>
              Start New Test
            </Button>
          </div>
        ) : (
          <div className='text-center'>
            <Loader2 className='mx-auto h-6 w-6 sm:h-8 sm:w-8 animate-spin' />
            <p className='mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400'>
              {callStatus === 'connecting' ? 'Connecting to AI examiner...' : 'Processing...'}
            </p>
          </div>
        )}
      </main>

      {/* Conversation History Section */}
      {conversationHistory.length > 0 && (
        <section id="conversation-history" className='mt-8 sm:mt-12'>
          <div className='mx-auto w-full max-w-4xl rounded-2xl bg-white p-4 sm:p-6 lg:p-8 shadow-lg dark:bg-gray-800'>
            <h2 className='mb-4 sm:mb-6 text-xl sm:text-2xl font-bold text-center'>
              📝 Conversation History
            </h2>
            <div className='space-y-3 sm:space-y-4 max-h-96 overflow-y-auto'>
              {conversationHistory.map((message, index) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[80%] rounded-lg p-3 sm:p-4 ${
                      message.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}
                  >
                    <div className='flex flex-wrap items-center gap-2 mb-2'>
                      <span className='text-xs font-medium opacity-75'>
                        {message.role === 'user' ? 'You' : 'AI Examiner'}
                      </span>
                      <span className='text-xs opacity-50'>
                        {message.timestamp.toLocaleTimeString()}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        message.type === 'question' ? 'bg-purple-100 text-purple-800' :
                        message.type === 'answer' ? 'bg-green-100 text-green-800' :
                        message.type === 'instruction' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {message.type}
                      </span>
                    </div>
                    <p className='text-xs sm:text-sm leading-relaxed'>
                      {message.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Session Summary */}
            {currentSession && (
              <div className='mt-4 sm:mt-6 pt-4 sm:pt-6 border-t border-gray-200 dark:border-gray-600'>
                <div className='grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-center'>
                  <div>
                    <div className='text-xl sm:text-2xl font-bold text-blue-600'>
                      {conversationHistory.length}
                    </div>
                    <div className='text-xs sm:text-sm text-gray-600 dark:text-gray-400'>
                      Total Messages
                    </div>
                  </div>
                  <div>
                    <div className='text-xl sm:text-2xl font-bold text-green-600'>
                      {conversationHistory.filter(m => m.type === 'question').length}
                    </div>
                    <div className='text-xs sm:text-sm text-gray-600 dark:text-gray-400'>
                      Questions Asked
                    </div>
                  </div>
                  <div>
                    <div className='text-xl sm:text-2xl font-bold text-purple-600'>
                      {conversationHistory.filter(m => m.type === 'answer').length}
                    </div>
                    <div className='text-xs sm:text-sm text-gray-600 dark:text-gray-400'>
                      Answers Given
                    </div>
                  </div>
                  <div>
                    <div className='text-xl sm:text-2xl font-bold text-orange-600'>
                      {speakingSessionManager.getSessionDuration()}s
                    </div>
                    <div className='text-xs sm:text-sm text-gray-600 dark:text-gray-400'>
                      Session Duration
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Tips Section */}
      <section className='mt-12 sm:mt-16'>
        <h2 className='mb-6 sm:mb-8 text-center text-2xl sm:text-3xl font-bold'>
          IELTS Speaking Test Guide
        </h2>
        <div className='grid gap-6 sm:gap-8 text-left md:grid-cols-3'>
          <div className='rounded-lg border border-gray-200 bg-gray-100 p-4 sm:p-6 dark:border-gray-700 dark:bg-gray-900/40'>
            <h3 className='mb-3 text-lg sm:text-xl font-bold'>Part 1: Interview (4-5 min)</h3>
            <p className='text-sm sm:text-base text-gray-600 dark:text-gray-400'>
              Answer with 2-3 sentences. Don't give short, one-word answers. Provide
              reasons and examples to extend your responses.
            </p>
          </div>
          <div className='rounded-lg border border-gray-200 bg-gray-100 p-4 sm:p-6 dark:border-gray-700 dark:bg-gray-900/40'>
            <h3 className='mb-3 text-lg sm:text-xl font-bold'>Part 2: Long Turn (3-4 min)</h3>
            <p className='text-sm sm:text-base text-gray-600 dark:text-gray-400'>
              You have 1 minute to prepare. Use the cue card to structure your talk. Aim
              to speak for the full 2 minutes.
            </p>
          </div>
          <div className='rounded-lg border border-gray-200 bg-gray-100 p-4 sm:p-6 dark:border-gray-700 dark:bg-gray-900/40'>
            <h3 className='mb-3 text-lg sm:text-xl font-bold'>Part 3: Discussion (4-5 min)</h3>
            <p className='text-sm sm:text-base text-gray-600 dark:text-gray-400'>
              Give longer, more detailed answers. Discuss the topics in a more abstract
              and general way. Show your ability to analyze and speculate.
            </p>
          </div>
        </div>
      </section>

      {/* Speaking Ticket Modal */}
      <SpeakingTicketModal
        isOpen={showTicketModal}
        onClose={() => setShowTicketModal(false)}
        onConfirm={confirmTicketUsage}
        remainingTickets={ticketStatus?.remainingTickets || 0}
        isLoading={ticketLoading}
      />
    </div>
  )
}

export default SpeakingPage