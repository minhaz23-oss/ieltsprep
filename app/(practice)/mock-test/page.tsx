import React from 'react'
import Link from 'next/link'

const MockTestPage = () => {
  return (
    <div className="min-h-screen px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-24 py-8 sm:py-12 md:py-16 font-semibold bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Back Button */}
      <div className="mb-8">
        <Link href="/exercise" className="text-primary hover:text-red-700 flex items-center space-x-2 transition-colors">
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm sm:text-base">Back to Exercises</span>
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
        {/* Icon/Illustration */}
        <div className="mb-8 sm:mb-12">
          <div className="relative">
            {/* Main Circle */}
            <div className="w-32 h-32 sm:w-40 sm:h-40 lg:w-48 lg:h-48 bg-gradient-to-br from-primary to-red-600 rounded-full flex items-center justify-center shadow-2xl animate-pulse">
              <svg className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            
            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-8 h-8 sm:w-10 sm:h-10 bg-yellow-400 rounded-full animate-bounce delay-100"></div>
            <div className="absolute -bottom-2 -left-6 w-6 h-6 sm:w-8 sm:h-8 bg-green-400 rounded-full animate-bounce delay-300"></div>
            <div className="absolute top-1/2 -right-8 w-4 h-4 sm:w-6 sm:h-6 bg-purple-400 rounded-full animate-bounce delay-500"></div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 sm:mb-6">
          Full IELTS{" "}
          <span className="p-1 px-2 bg-primary rounded-md text-white -rotate-3 inline-block">Mock Test</span>{" "}
          Coming Soon!
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-8 sm:mb-12 max-w-2xl leading-relaxed">
          We're working hard to bring you the most comprehensive IELTS mock test experience. 
          Get ready for a complete 3-hour simulation with AI-powered evaluation!
        </p>

        {/* Features Preview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12 max-w-4xl w-full">
          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border-2 border-blue-100 hover:border-blue-300 transition-colors">
            <div className="text-2xl sm:text-3xl mb-3">🎧</div>
            <h3 className="text-sm sm:text-base font-bold text-blue-800 mb-2">Full Listening Test</h3>
            <p className="text-xs sm:text-sm text-gray-600">30 minutes with authentic audio</p>
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border-2 border-green-100 hover:border-green-300 transition-colors">
            <div className="text-2xl sm:text-3xl mb-3">📖</div>
            <h3 className="text-sm sm:text-base font-bold text-green-800 mb-2">Complete Reading</h3>
            <p className="text-xs sm:text-sm text-gray-600">60 minutes, 3 passages</p>
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border-2 border-purple-100 hover:border-purple-300 transition-colors">
            <div className="text-2xl sm:text-3xl mb-3">✍️</div>
            <h3 className="text-sm sm:text-base font-bold text-purple-800 mb-2">Full Writing Tasks</h3>
            <p className="text-xs sm:text-sm text-gray-600">60 minutes, Task 1 & 2</p>
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg border-2 border-orange-100 hover:border-orange-300 transition-colors">
            <div className="text-2xl sm:text-3xl mb-3">🎤</div>
            <h3 className="text-sm sm:text-base font-bold text-orange-800 mb-2">Speaking Test</h3>
            <p className="text-xs sm:text-sm text-gray-600">11-14 minutes with AI</p>
          </div>
        </div>

        {/* What to Expect */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 lg:p-10 shadow-xl border-2 border-gray-200 mb-8 sm:mb-12 max-w-3xl w-full">
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">
            🚀 What to Expect
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 text-left">
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Real Exam Conditions</h4>
                  <p className="text-xs sm:text-sm text-gray-600">Exact timing and format as the actual IELTS test</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm sm:text-base">AI-Powered Evaluation</h4>
                  <p className="text-xs sm:text-sm text-gray-600">Detailed feedback and band score prediction</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Comprehensive Report</h4>
                  <p className="text-xs sm:text-sm text-gray-600">Detailed analysis of strengths and weaknesses</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Progress Tracking</h4>
                  <p className="text-xs sm:text-sm text-gray-600">Monitor your improvement over time</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Flexible Scheduling</h4>
                  <p className="text-xs sm:text-sm text-gray-600">Take the test at your own pace and time</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm sm:text-base">Unlimited Retakes</h4>
                  <p className="text-xs sm:text-sm text-gray-600">Practice as many times as you need</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Apology Message */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 sm:p-8 border-2 border-yellow-200 mb-8 sm:mb-12 max-w-2xl w-full">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-yellow-400 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-800" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-yellow-800 mb-3 text-center">
            We Apologize for Any Inconvenience
          </h3>
          <p className="text-sm sm:text-base text-yellow-700 text-center leading-relaxed">
            Our development team is working around the clock to deliver the best possible mock test experience. 
            We appreciate your patience and promise it will be worth the wait!
          </p>
        </div>

        {/* Call to Action */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
          <Link 
            href="/exercise" 
            className="btn-primary text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4 inline-flex items-center justify-center"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z"/>
            </svg>
            Practice Individual Skills
          </Link>
          
          <Link 
            href="/tips-resources" 
            className="btn-secondary text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4 inline-flex items-center justify-center"
          >
            <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            View IELTS Tips & Resources
          </Link>
        </div>

        {/* Progress Indicator */}
        <div className="mt-8 sm:mt-12">
          <div className="flex items-center justify-center space-x-2 text-sm sm:text-base text-gray-600">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-100"></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-200"></div>
            </div>
            <span className="font-medium">Development in Progress</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MockTestPage