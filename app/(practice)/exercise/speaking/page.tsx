'use client'

import { Button } from '@/components/ui/button'
import { ArrowLeft, StopCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import React, { useState, useEffect } from 'react'
import { vapi } from '@/lib/vapi.sdk'

const SpeakingPage = () => {
  const [isSessionActive, setIsSessionActive] = useState(false)
  const [callStatus, setCallStatus] = useState('idle')
  const [transcript, setTranscript] = useState('')

  const startSession = () => {
    setIsSessionActive(true)
    setCallStatus('connecting')
    try {
      const firstMessage =
        "Let's begin the IELTS Speaking test. I'll guide you through the parts and ask questions one by one."
      console.log('Assistant:', firstMessage)
      vapi.start({ firstMessage })
    } catch (error) {
      console.error('Failed to start Vapi session:', error)
      setCallStatus('idle')
      setIsSessionActive(false)
    }
  }

  const stopSession = () => {
    vapi.stop()
  }

  useEffect(() => {
    const handleCallStart = () => setCallStatus('active')
    const handleCallEnd = () => {
      setCallStatus('ended')
      setIsSessionActive(false)
      setTranscript('')
    }
    const handleMessage = (data: any) => {
      try {
        if (data?.type === 'transcript') {
          if (typeof data.transcript === 'string' && data.transcript.trim()) {
            console.log('User:', data.transcript)
          }
          setTranscript(data.transcript || '')
          return
        }
        const role = data?.message?.role ?? data?.role
        const text =
          data?.message?.content ??
          data?.message?.text ??
          data?.content ??
          data?.text
        if (role === 'assistant' && typeof text === 'string' && text.trim()) {
          console.log('Assistant:', text)
        }
      } catch (e) {
        // noop
      }
    }

    vapi.on('call-start', handleCallStart)
    vapi.on('call-end', handleCallEnd)
    vapi.on('message', handleMessage)

    return () => {
      vapi.off('call-start', handleCallStart)
      vapi.off('call-end', handleCallEnd)
      vapi.off('message', handleMessage)
    }
  }, [])

  return (
    <div className='container mx-auto px-4 py-8'>
      <Link
        href='/exercise'
        className='mb-4 flex items-center text-gray-600 hover:underline dark:text-gray-400'
      >
        <ArrowLeft className='mr-2 h-4 w-4' />
        <span>Back to Exercises</span>
      </Link>

      <header className='mb-12 text-center'>
        <h1 className='text-4xl font-bold'>IELTS Speaking Practice</h1>
        <p className='mt-2 text-lg text-gray-600 dark:text-gray-400'>
          Hone your speaking skills for success.
        </p>
      </header>

      <main className='mx-auto mb-12 w-full max-w-3xl rounded-2xl bg-white p-8 shadow-lg dark:bg-gray-800'>
        {!isSessionActive ? (
          <div className='text-center'>
            <h2 className='mb-4 text-2xl font-bold'>Ready to Practice?</h2>
            <p className='mb-8 text-gray-600 dark:text-gray-400'>
              Start the test and the examiner will ask questions automatically.
            </p>
            <Button
              onClick={startSession}
              size='lg'
              disabled={callStatus === 'connecting'}
            >
              {callStatus === 'connecting' ? (
                <>
                  <Loader2 className='mr-2 h-6 w-6 animate-spin' />
                  Connecting...
                </>
              ) : (
                'Start Speaking Test'
              )}
            </Button>
          </div>
        ) : (
          <div className='text-center'>
            <div className='my-8 min-h-[100px] rounded-lg border bg-gray-50 p-4 dark:bg-gray-700'>
              <p className='text-left text-gray-800 dark:text-gray-200'>
                {transcript}
              </p>
            </div>
            <div className='mt-6 flex items-center justify-center space-x-4'>
              <Button
                onClick={stopSession}
                variant='destructive'
                className='rounded-full p-6'
              >
                <StopCircle className='h-10 w-10' />
              </Button>
            </div>
          </div>
        )}
      </main>

      <section className='mt-16'>
        <h2 className='mb-8 text-center text-3xl font-bold'>
          Tips for the IELTS Speaking Test
        </h2>
        <div className='grid gap-8 text-left md:grid-cols-3'>
          <div className='rounded-lg border border-gray-200 bg-gray-100 p-6 dark:border-gray-700 dark:bg-gray-900/40'>
            <h3 className='mb-3 text-xl font-bold'>Part 1: Interview</h3>
            <p className='text-gray-600 dark:text-gray-400'>
              Answer with 2-3 sentences. Don't give short, one-word answers. Provide
              reasons and examples to extend your responses.
            </p>
          </div>
          <div className='rounded-lg border border-gray-200 bg-gray-100 p-6 dark:border-gray-700 dark:bg-gray-900/40'>
            <h3 className='mb-3 text-xl font-bold'>Part 2: Long Turn</h3>
            <p className='text-gray-600 dark:text-gray-400'>
              You have 1 minute to prepare. Use the cue card to structure your talk. Aim
              to speak for the full 2 minutes.
            </p>
          </div>
          <div className='rounded-lg border border-gray-200 bg-gray-100 p-6 dark:border-gray-700 dark:bg-gray-900/40'>
            <h3 className='mb-3 text-xl font-bold'>Part 3: Discussion</h3>
            <p className='text-gray-600 dark:text-gray-400'>
              Give longer, more detailed answers. Discuss the topics in a more abstract
              and general way. Show your ability to analyze and speculate.
            </p>
          </div>
        </div>
        <div className='mt-8 rounded-lg border border-blue-200 bg-blue-50 p-8 dark:border-blue-800 dark:bg-blue-900/20'>
          <h3 className='mb-4 text-2xl font-bold'>General Advice</h3>
          <ul className='list-disc space-y-2 pl-5 text-gray-700 dark:text-gray-300'>
            <li>
              Speak fluently and spontaneously. It's okay to correct yourself, but don't
              memorize answers.
            </li>
            <li>
              Use a wide range of vocabulary (lexical resource) and grammatical
              structures.
            </li>
            <li>
              Pay close attention to your pronunciation, intonation, and rhythm. Be clear
              and easy to understand.
            </li>
            <li>
              Don't be afraid to ask for clarification if you don't understand a
              question. It's better than giving an irrelevant answer.
            </li>
            <li>
              Practice speaking about a wide variety of topics to build your confidence.
            </li>
          </ul>
        </div>
      </section>
    </div>
  )
}

export default SpeakingPage
