'use client';

import React, { useState, useRef, useEffect } from 'react';

interface VoiceRecorderProps {
  onRecordingComplete: (audioBlob: Blob, duration: number) => void;
  maxDuration?: number; // in seconds
  disabled?: boolean;
  className?: string;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  onRecordingComplete,
  maxDuration = 120, // 2 minutes default
  disabled = false,
  className = ''
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check microphone permission on component mount
    checkMicrophonePermission();
    
    return () => {
      // Cleanup
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          if (prev >= maxDuration) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording, maxDuration]);

  const checkMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setHasPermission(true);
      // Stop the stream immediately after checking permission
      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      console.error('Microphone permission denied:', error);
      setHasPermission(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });
      
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { 
          type: mediaRecorder.mimeType || 'audio/wav' 
        });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        onRecordingComplete(audioBlob, recordingTime);
      };

      mediaRecorder.start(250); // Collect data every 250ms
      setIsRecording(true);
      setRecordingTime(0);
      setAudioUrl(null);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      setHasPermission(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    const percentage = (recordingTime / maxDuration) * 100;
    if (percentage < 50) return 'text-green-600';
    if (percentage < 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (hasPermission === false) {
    return (
      <div className={`bg-red-50 border-2 border-red-200 rounded-lg p-6 text-center ${className}`}>
        <svg className="w-12 h-12 text-red-500 mx-auto mb-3" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <h3 className="text-lg font-bold text-red-800 mb-2">Microphone Access Required</h3>
        <p className="text-red-600 text-sm mb-4">
          Please allow microphone access to record your response.
        </p>
        <button 
          onClick={checkMicrophonePermission}
          className="btn-primary text-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border-2 border-gray-200 p-6 ${className}`}>
      <div className="text-center space-y-4">
        {/* Recording Timer */}
        <div className={`text-2xl font-mono font-bold ${getTimeColor()}`}>
          {formatTime(recordingTime)} / {formatTime(maxDuration)}
        </div>

        {/* Recording Button */}
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={disabled || hasPermission === null}
          className={`w-20 h-20 rounded-full flex items-center justify-center text-white transition-all duration-300 shadow-lg ${
            disabled || hasPermission === null
              ? 'bg-gray-400 cursor-not-allowed'
              : isRecording 
              ? 'bg-red-600 hover:bg-red-700 animate-pulse scale-110' 
              : 'bg-primary hover:bg-red-700 hover:scale-105'
          }`}
        >
          {isRecording ? (
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 012 0v6a1 1 0 11-2 0V7zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V7z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" />
            </svg>
          )}
        </button>

        {/* Status Text */}
        <p className="text-sm text-gray-600">
          {disabled 
            ? 'Recording disabled'
            : isRecording 
            ? 'Recording... Click to stop'
            : 'Click to start recording'
          }
        </p>

        {/* Audio Playback */}
        {audioUrl && !isRecording && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-green-800 font-medium flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Response Recorded ({formatTime(recordingTime)})
              </span>
            </div>
            <audio controls className="w-full h-8">
              <source src={audioUrl} type="audio/webm" />
              <source src={audioUrl} type="audio/mp4" />
              Your browser does not support the audio element.
            </audio>
          </div>
        )}

        {/* Recording Progress Bar */}
        {isRecording && (
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-1000 ${
                  recordingTime / maxDuration < 0.5 ? 'bg-green-500' :
                  recordingTime / maxDuration < 0.8 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${Math.min((recordingTime / maxDuration) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Tips */}
        <div className="mt-4 text-xs text-gray-500 space-y-1">
          <p>💡 Speak clearly and at a natural pace</p>
          <p>🎤 Make sure you're in a quiet environment</p>
          <p>⏱️ Use all available time to give a complete response</p>
        </div>
      </div>
    </div>
  );
};

export default VoiceRecorder;
