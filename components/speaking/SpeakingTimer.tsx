'use client';

import React, { useEffect, useState } from 'react';

interface SpeakingTimerProps {
  duration: number; // in seconds
  isActive: boolean;
  onTimeUp: () => void;
  title?: string;
  color?: 'blue' | 'green' | 'red' | 'yellow';
  className?: string;
}

const SpeakingTimer: React.FC<SpeakingTimerProps> = ({
  duration,
  isActive,
  onTimeUp,
  title = 'Timer',
  color = 'blue',
  className = ''
}) => {
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    setTimeLeft(duration);
  }, [duration]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            onTimeUp();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, timeLeft, onTimeUp]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    return ((duration - timeLeft) / duration) * 100;
  };

  const getColorClasses = () => {
    switch (color) {
      case 'blue':
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-200',
          text: 'text-blue-600',
          progress: 'bg-blue-500'
        };
      case 'green':
        return {
          bg: 'bg-green-50',
          border: 'border-green-200',
          text: 'text-green-600',
          progress: 'bg-green-500'
        };
      case 'red':
        return {
          bg: 'bg-red-50',
          border: 'border-red-200',
          text: 'text-red-600',
          progress: 'bg-red-500'
        };
      case 'yellow':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-200',
          text: 'text-yellow-600',
          progress: 'bg-yellow-500'
        };
      default:
        return {
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          text: 'text-gray-600',
          progress: 'bg-gray-500'
        };
    }
  };

  const colors = getColorClasses();
  const isLowTime = timeLeft <= 30 && timeLeft > 0; // Last 30 seconds
  const isCriticalTime = timeLeft <= 10 && timeLeft > 0; // Last 10 seconds

  return (
    <div className={`${colors.bg} ${colors.border} border-2 rounded-lg p-4 ${className}`}>
      <div className="text-center">
        <h3 className={`text-sm font-semibold ${colors.text} mb-2`}>
          {title}
        </h3>
        
        <div className={`text-3xl font-mono font-bold mb-3 transition-all duration-300 ${
          isCriticalTime 
            ? 'text-red-600 animate-pulse scale-110' 
            : isLowTime 
            ? 'text-yellow-600' 
            : colors.text
        }`}>
          {formatTime(timeLeft)}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
          <div 
            className={`h-2 rounded-full transition-all duration-1000 ${
              isCriticalTime ? 'bg-red-500' :
              isLowTime ? 'bg-yellow-500' : colors.progress
            }`}
            style={{ width: `${Math.min(getProgressPercentage(), 100)}%` }}
          />
        </div>

        {/* Status */}
        <p className={`text-xs ${colors.text} ${isActive ? 'font-medium' : 'opacity-60'}`}>
          {timeLeft === 0 ? 'Time\'s up!' : 
           !isActive ? 'Paused' : 
           isCriticalTime ? 'Final moments!' :
           isLowTime ? 'Wrap up soon' : 
           'Keep going'}
        </p>

        {/* Warning indicators */}
        {isLowTime && timeLeft > 0 && (
          <div className="mt-2 flex items-center justify-center">
            <svg className={`w-4 h-4 mr-1 ${isCriticalTime ? 'text-red-500' : 'text-yellow-500'}`} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span className={`text-xs font-medium ${isCriticalTime ? 'text-red-600' : 'text-yellow-600'}`}>
              {isCriticalTime ? 'Finish now!' : 'Almost done'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default SpeakingTimer;
