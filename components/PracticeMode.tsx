import Link from 'next/link';

export default function PracticeMode() {
  return (
    <section className="w-full py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black text-black mb-4">
            Practice Makes <span className=" p-1 px-2 bg-primary rounded-md text-white -rotate-3 inline-block">Perfect</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto font-semibold">
            Sharpen your skills with our comprehensive practice exercises and full-length mock tests. 
            Track your progress and identify areas for improvement.
          </p>
        </div>

        {/* Cards Container */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          
          {/* Practice Exercises Card */}
          <div className="bg-white rounded-xl  border-2 border-primary/50 p-8 hover:border-primary hover:shadow-xl transition-shadow duration-300" >
            <div className="text-center">
              {/* Icon */}
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg 
                  className="w-8 h-8 text-primary" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
              </div>
              
              {/* Content */}
              <h3 className="text-2xl font-bold text-black mb-4">
                Practice Exercises
              </h3>
              <p className="text-gray-600 mb-6 font-medium leading-relaxed">
                Access targeted exercises for each IELTS section. Build confidence with 
                Reading, Writing, Listening, and Speaking practice questions.
              </p>
              
              {/* Features List */}
              <ul className="text-sm text-gray-500 mb-8 space-y-2">
                <li className="flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Section-wise practice
                </li>
                <li className="flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Instant feedback
                </li>
                <li className="flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Progress tracking
                </li>
              </ul>
              
              {/* Button */}
              <Link href="/exercise">
                <button className="btn-primary w-full">
                  Start Practicing
                </button>
              </Link>
            </div>
          </div>

          {/* Full Mock Test Card */}
          <div className="bg-white rounded-xl  border-2 border-primary/50 p-8 hover:border-primary hover:shadow-xl transition-shadow duration-300" >
            <div className="text-center">
              {/* Icon */}
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg 
                  className="w-8 h-8 text-primary" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              
              {/* Content */}
              <h3 className="text-2xl font-bold text-black mb-4">
                Full Mock Tests
              </h3>
              <p className="text-gray-600 mb-6 font-medium leading-relaxed">
                Experience the real IELTS exam with our comprehensive mock tests. 
                Complete with timing, scoring, and detailed performance analysis.
              </p>
              
              {/* Features List */}
              <ul className="text-sm text-gray-500 mb-8 space-y-2">
                <li className="flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Real exam simulation
                </li>
                <li className="flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Accurate timing
                </li>
                <li className="flex items-center justify-center">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Detailed analysis
                </li>
              </ul>
              
              {/* Button */}
              <Link href="/mock-test">
                <button className="btn-secondary w-full">
                  Take Mock Test
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
