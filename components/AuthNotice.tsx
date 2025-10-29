"use client";

import React, { useState } from "react";
import Link from "next/link";

interface AuthNoticeProps {
  testType: "listening" | "reading" | "writing"| 'dashboard';
  hasAI?: boolean;
}

const AuthNotice: React.FC<AuthNoticeProps> = ({ testType, hasAI = false }) => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) {
    return null;
  }

  const getTestTypeIcon = () => {
    switch (testType) {
      case "listening":
        return "🎧";
      case "reading":
        return "📖";
      case "writing":
        return "✍️";
      default:
        return "📝";
    }
  };

  const getTestTypeColor = () => {
    switch (testType) {
      case "listening":
        return "border-blue-200 bg-blue-50";
      case "reading":
        return "border-green-200 bg-green-50";
      case "writing":
        return "border-purple-200 bg-purple-50";
      default:
        return "border-gray-200 bg-gray-50";
    }
  };

  const getButtonColor = () => {
    switch (testType) {
      case "listening":
        return "bg-blue-600 hover:bg-blue-700";
      case "reading":
        return "bg-green-600 hover:bg-green-700";
      case "writing":
        return "bg-purple-600 hover:bg-purple-700";
      default:
        return "bg-primary hover:bg-red-700";
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50 p-4">
      <div
        className={`relative rounded-xl border-2 p-8 text-center max-w-3xl w-full ${getTestTypeColor()}`}
      >
        <button
          onClick={() => setIsVisible(false)}
          className="absolute cursor-pointer top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M6 18L18 6M6 6l12 12"
            ></path>
          </svg>
        </button>
        <div className="w-20 h-20 mx-auto mb-6 bg-white rounded-full flex items-center justify-center shadow-lg">
          <span className="text-4xl">{getTestTypeIcon()}</span>
        </div>

        <h3 className="text-2xl font-bold text-gray-900 mb-4">
          Want to Track Your Progress?
        </h3>

        <div className="max-w-md mx-auto mb-6">
          <p className="text-gray-700 leading-relaxed">
            Please sign in to see your full test overview, track progress across
            all your tests, and get
            {hasAI
              ? " personalized AI-powered recommendations"
              : " expert recommendations"}{" "}
            to improve rapidly.
          </p>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-sm">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-2xl mb-2">📊</div>
              <div className="font-semibold text-gray-800">Full Overview</div>
              <div className="text-gray-600">
                Detailed performance analytics
              </div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-2xl mb-2">📈</div>
              <div className="font-semibold text-gray-800">
                Progress Tracking
              </div>
              <div className="text-gray-600">Monitor improvement over time</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <div className="text-2xl mb-2">{hasAI ? "🤖" : "👨‍🏫"}</div>
              <div className="font-semibold text-gray-800">
                {hasAI ? "AI" : "Expert"} Recommendations
              </div>
              <div className="text-gray-600">Personalized study guidance</div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Link 
              href="/sign-in"
              className={`block w-full text-center px-8 py-4 text-white font-bold rounded-lg transition-all duration-200 hover:scale-105 shadow-lg ${getButtonColor()}`}
            >
              Sign In to Unlock Full Features
            </Link>

            <div className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                href="/sign-up"
                className="text-primary hover:text-red-700 font-semibold underline"
              >
                Sign up for free
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthNotice;
