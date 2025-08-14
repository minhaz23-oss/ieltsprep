'use client'

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Vapi from '@vapi-ai/web';

interface AnswerEntry {
  part: 1 | 2 | 3;
  text: string;
  at: string; // ISO timestamp
}

export default function SpeakingPage() {
  const [isStarting, setIsStarting] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [callId, setCallId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<AnswerEntry[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const currentPartRef = useRef<1 | 2 | 3>(1);
  const currentTranscriptRef = useRef<string>('');
  const vapiRef = useRef<any>(null);

  const appendLog = useCallback((line: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${line}`]);
    console.log(line);
  }, []);

  // Infer current part changes by inspecting workflow node messages
  const detectPartFromText = useCallback((text: string): 1 | 2 | 3 => {
    const t = text.toLowerCase();
    if (t.includes('part 3') || t.includes('two-way discussion')) return 3;
    if (t.includes('part 2') || t.includes('individual long turn')) return 2;
    if (t.includes('part 1') || t.includes('introduction')) return 1;
    return currentPartRef.current;
  }, []);

  // Initialize Vapi instance
  useEffect(() => {
    if (!vapiRef.current) {
      vapiRef.current = new Vapi(process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN!);
      console.log('Vapi instance created');
    }
  }, []);

  // Setup Vapi event listeners
  useEffect(() => {
    const vapiInstance = vapiRef.current;
    if (!vapiInstance) return;

    // Log available methods for debugging
    console.log('Vapi instance methods:', Object.getOwnPropertyNames(Object.getPrototypeOf(vapiInstance)));

    // Set up event handlers using the instance
    const setupListeners = () => {
      // Handle connection events
      vapiInstance.on('call-started', () => {
        console.log('Call started event');
        setIsRunning(true);
        setIsConnected(true);
        appendLog('Call connected and started');
      });

      vapiInstance.on('call-ended', () => {
        console.log('Call ended event');
        setIsRunning(false);
        setIsConnected(false);
        appendLog('Call ended');
        
        // Save any remaining transcript
        if (currentTranscriptRef.current) {
          setAnswers(prev => [...prev, { 
            part: currentPartRef.current, 
            text: currentTranscriptRef.current, 
            at: new Date().toISOString() 
          }]);
          currentTranscriptRef.current = '';
        }
      });

      // Handle speech events
      vapiInstance.on('speech-started', () => {
        appendLog('User started speaking');
        currentTranscriptRef.current = '';
      });

      vapiInstance.on('speech-ended', () => {
        appendLog('User stopped speaking');
        if (currentTranscriptRef.current.trim()) {
          const part = currentPartRef.current;
          setAnswers(prev => [...prev, { 
            part, 
            text: currentTranscriptRef.current, 
            at: new Date().toISOString() 
          }]);
          appendLog(`Answer captured for Part ${part}`);
        }
      });

      // Handle messages
      vapiInstance.on('message', (message: any) => {
        console.log('Message received:', message);
        if (message?.role === 'assistant' && message?.content) {
          appendLog(`AI: ${message.content}`);
          
          // Detect part changes
          const newPart = detectPartFromText(message.content);
          if (newPart !== currentPartRef.current) {
            currentPartRef.current = newPart;
            appendLog(`Moved to Part ${newPart}`);
          }
        }
      });

      // Handle transcripts  
      vapiInstance.on('transcript', (data: any) => {
        console.log('Transcript:', data);
        const text = data?.text || data?.transcript || '';
        if (text) {
          currentTranscriptRef.current = text;
          appendLog(`You said: ${text}`);
        }
      });

      // Handle errors
      vapiInstance.on('error', (error: any) => {
        console.error('Vapi error:', error);
        setError(error?.message || error?.error || 'Connection error occurred');
        appendLog(`Error: ${error?.message || 'Unknown error'}`);
      });
    };

    setupListeners();

    // No cleanup needed as listeners persist
  }, [appendLog, detectPartFromText]);

  const startTest = useCallback(async () => {
    try {
      setIsStarting(true);
      setError(null);
      setAnswers([]);
      setLogs([]);
      currentPartRef.current = 1;
      currentTranscriptRef.current = '';

      const vapiInstance = vapiRef.current;
      if (!vapiInstance) {
        throw new Error('Vapi not initialized');
      }

      // Check for microphone availability first
      appendLog('Checking microphone availability...');
      
      // Check if we're in a secure context (HTTPS or localhost)
      if (!window.isSecureContext) {
        throw new Error('This feature requires HTTPS. Please access the site using https:// or localhost.');
      }
      
      // Check if mediaDevices API is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        // Try to provide more specific error for mobile
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        if (isMobile) {
          throw new Error('Microphone access not available. Please ensure you are using a modern browser (Chrome, Safari, Firefox) and the site is accessed via HTTPS.');
        } else {
          throw new Error('Your browser does not support microphone access. Please use a modern browser like Chrome, Firefox, or Edge.');
        }
      }
      
      try {
        // Request microphone permission
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // If we got here, microphone is available
        appendLog('Microphone access granted');
        
        // Stop the test stream (we just wanted to check permission)
        stream.getTracks().forEach(track => track.stop());
        
      } catch (micError: any) {
        // Microphone error handling
        console.error('Microphone error:', micError);
        
        if (micError.name === 'NotFoundError' || micError.name === 'DevicesNotFoundError') {
          throw new Error('No microphone found. Please connect a microphone and try again.');
        } else if (micError.name === 'NotAllowedError' || micError.name === 'PermissionDeniedError') {
          throw new Error('Microphone permission denied. Please allow microphone access in your browser settings and try again.');
        } else if (micError.name === 'NotReadableError' || micError.name === 'TrackStartError') {
          throw new Error('Microphone is being used by another application. Please close other apps and try again.');
        } else if (micError.name === 'SecurityError') {
          throw new Error('Security error: Please ensure you are accessing the site via HTTPS.');
        } else {
          throw new Error(`Microphone error: ${micError.message || 'Unknown error'}`);
        }
      }

      appendLog('Starting Vapi call...');
      
      // Since Vapi workflows aren't directly supported in web SDK,
      // we'll create an inline assistant that mimics your workflow behavior
      const assistantConfig = {
        name: 'IELTS Speaking Examiner',
        model: {
          provider: 'google',  // Match your workflow config
          model: 'gemini-2.0-flash',  // Match your workflow config
          temperature: 0.3,  // Match your workflow config
          maxTokens: 250
        },
        voice: {
          provider: 'azure',  // Or use 'elevenlabs' or 'playht' if you prefer
          voiceId: 'en-US-JennyNeural'  // Professional female voice
        },
        transcriber: {
          provider: 'deepgram',
          model: 'nova-2',
          language: 'en'
        },
        firstMessage: "Good morning! My name is Sarah, and I'll be your examiner for today's IELTS speaking test. The test will take between 11 to 14 minutes and is divided into three parts. Before we begin, could you please state your full name for the recording?",
        // Instructions matching your workflow prompts
        instructions: `You are a professional IELTS speaking examiner named Sarah. You must be warm but professional, speak clearly at a moderate pace.

The test has three parts:

PART 1 (4-5 minutes) - Introduction & Interview:
- Wait for the candidate's full name
- Once they give their name, acknowledge it and introduce Part 1
- Ask questions about familiar topics one at a time:
  * Where are you from? Can you describe your hometown?
  * Do you work or are you a student?
  * What do you enjoy about your job/studies?
  * What do you like to do in your free time?
  * Do you prefer mornings or evenings?
  * Do you spend much time with your family?
- Use natural follow-ups like "That's interesting", "Why is that?"
- After 4-5 minutes, transition: "Thank you. That's the end of Part 1. Now we'll move on to Part 2."

PART 2 (3-4 minutes) - Individual Long Turn:
- Say: "In this part, I'm going to give you a topic and I'd like you to talk about it for 1 to 2 minutes. Before you talk, you'll have one minute to think about what you're going to say."
- Give ONE topic from these options:
  * Describe a memorable journey you have taken
  * Describe a person who has influenced you
  * Describe a skill you would like to learn
  * Describe a memorable meal you have had
  * Describe a place you visited that was particularly beautiful
- Say: "Here's your topic card. You have one minute to prepare. Your preparation time starts now."
- Wait 60 seconds in silence
- Say: "Your preparation time is up. Please start speaking about your topic."
- Let them speak for 1-2 minutes
- After 2 minutes say: "Thank you. That's the end of Part 2."

PART 3 (4-5 minutes) - Two-way Discussion:
- Say: "Now we'll move on to Part 3. In this part, I'll ask you some more general questions related to the topic you just spoke about."
- Ask analytical questions based on their Part 2 topic
- Encourage elaboration with "Why do you think that is?" or "Can you give me an example?"
- After 4-5 minutes, conclude: "That's the end of the speaking test. Thank you very much for your time today."

Be professional and encouraging throughout. Track the time for each part.`
      };
      
      // Start the call with the assistant configuration
      const response = await vapiInstance.start(assistantConfig);
      
      console.log('Start response:', response);
      if (response?.id) {
        setCallId(response.id);
      }
      
      appendLog('Call started successfully');
    } catch (e: any) {
      console.error('Start test error:', e);
      setError(e?.message || 'Unable to start the speaking test. Please check your microphone permissions.');
      setIsRunning(false);
      appendLog(`Failed to start: ${e?.message}`);
    } finally {
      setIsStarting(false);
    }
  }, [appendLog]);

  const stopTest = useCallback(async () => {
    try {
      const vapiInstance = vapiRef.current;
      if (!vapiInstance) return;
      
      appendLog('Stopping call...');
      vapiInstance.stop();
    } catch (e: any) {
      console.error('Stop error:', e);
      appendLog(`Stop error: ${e?.message}`);
    }
  }, [appendLog]);

  const saveAnswers = useCallback(async () => {
    // Placeholder: send answers to your backend for DB save and later evaluation
    try {
      const res = await fetch('/api/speaking/save-answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callId, answers })
      });
      if (!res.ok) throw new Error('Failed to save answers');
      appendLog('Answers sent to backend');
      alert('Answers saved successfully');
    } catch (e: any) {
      appendLog(`Save failed: ${e?.message || 'Unknown error'}`);
      alert('Saving failed (endpoint not implemented yet). Check console/logs.');
    }
  }, [answers, appendLog, callId]);

  const disabled = useMemo(() => isStarting || isRunning, [isStarting, isRunning]);

  return (
    <div className="min-h-[70vh] px-6 py-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-2">IELTS Speaking Practice</h1>
        <p className="text-gray-600 mb-6">
          Click the button below to start the AI-conducted speaking test. Ensure your microphone is enabled.
        </p>

        <div className="flex gap-3 mb-6">
          <button
            onClick={startTest}
            disabled={disabled}
            className={`px-5 py-3 rounded-lg font-semibold text-white ${disabled ? 'bg-gray-300 cursor-not-allowed' : 'bg-primary hover:brightness-110'}`}
          >
            {isStarting ? 'Starting…' : isRunning ? 'Test Running…' : 'Start Speaking Test'}
          </button>

          <button
            onClick={stopTest}
            disabled={!isRunning}
            className={`px-5 py-3 rounded-lg font-semibold border ${!isRunning ? 'text-gray-400 border-gray-200 cursor-not-allowed' : 'text-gray-800 border-gray-300 hover:bg-gray-50'}`}
          >
            Stop
          </button>

          <button
            onClick={saveAnswers}
            disabled={!answers.length}
            className={`px-5 py-3 rounded-lg font-semibold ${!answers.length ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
          >
            Save Answers
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg border border-red-200 bg-red-50 text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 border rounded-lg">
            <h2 className="font-semibold mb-2">Session</h2>
            <div className="text-sm text-gray-600 space-y-1">
              <p><span className="font-medium text-gray-800">Status:</span> {isRunning ? 'Running' : 'Idle'}</p>
              <p><span className="font-medium text-gray-800">Call ID:</span> {callId || '-'}</p>
              <p><span className="font-medium text-gray-800">Captured answers:</span> {answers.length}</p>
            </div>
          </div>

          <div className="p-4 border rounded-lg max-h-64 overflow-auto">
            <h2 className="font-semibold mb-2">Logs</h2>
            <ul className="text-sm text-gray-700 space-y-1">
              {logs.map((l, i) => (
                <li key={i} className="font-mono whitespace-pre-wrap">{l}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-6 p-4 border rounded-lg">
          <h2 className="font-semibold mb-3">Answers (for DB)</h2>
          {answers.length === 0 ? (
            <p className="text-gray-500 text-sm">No answers captured yet.</p>
          ) : (
            <ul className="space-y-3">
              {answers.map((a, idx) => (
                <li key={idx} className="p-3 rounded border">
                  <div className="text-xs text-gray-500">Part {a.part} • {new Date(a.at).toLocaleString()}</div>
                  <div className="mt-1 text-gray-800">{a.text}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}