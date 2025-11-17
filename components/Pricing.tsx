export default function Pricing() {
  const plans = {
    free: {
      name: 'Free',
      price: 0,
      description: 'Perfect for getting started with IELTS preparation',
      features: [
        'Unlimited Reading Practice',
        'Unlimited Listening Practice', 
        'Unlimited Writing Practice',
        'AI Writing Evaluation',
        'Progress Dashboard',
        'Performance Analytics',
        'Study Recommendations',
        'Band Score Tracking'
      ],
      limitations: [
        'No Speaking Practice',
        'No Full Mock Tests',
        'Limited AI Feedback Detail'
      ],
      buttonText: 'Get Started Free',
      buttonStyle: 'btn-secondary',
      popular: false
    },
    premium: {
      name: 'Premium',
      price: 19.99,
      description: 'Complete IELTS preparation with all features unlocked',
      features: [
        'Everything in Free Plan',
        '🎤 Full Speaking Practice',
        'AI Speaking Evaluation',
        '📝 Complete Mock Tests',
        'Detailed Performance Reports',
        'Advanced Study Plans',
        'Priority Support',
        'Offline Practice Materials',
        'Expert Tips & Strategies',
        'Unlimited AI Feedback',
        'Custom Study Schedules',
        'Certificate of Completion'
      ],
      limitations: [],
      buttonText: 'Upgrade to Premium',
      buttonStyle: 'btn-primary',
      popular: true
    }
  };

  return (
    <section className="w-full py-16 sm:py-20 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-black mb-4">
            Choose Your <span className="p-1 px-2 bg-primary rounded-md text-white -rotate-3 inline-block">Plan</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto font-semibold">
            Start free, upgrade when you're ready for complete IELTS mastery
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
          
          {/* Free Plan */}
          <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 relative">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{plans.free.name}</h3>
              <div className="text-4xl font-black text-gray-900 mb-2">
                ${plans.free.price}
                <span className="text-lg font-normal text-gray-500">/month</span>
              </div>
              <p className="text-gray-600">{plans.free.description}</p>
            </div>

            <div className="mb-8">
              <h4 className="font-bold text-gray-900 mb-4">✅ What's Included:</h4>
              <ul className="space-y-3">
                {plans.free.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mb-8">
              <h4 className="font-bold text-gray-900 mb-4">❌ Not Included:</h4>
              <ul className="space-y-3">
                {plans.free.limitations.map((limitation, index) => (
                  <li key={index} className="flex items-start">
                    <svg className="w-5 h-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-500">{limitation}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button className={`${plans.free.buttonStyle} w-full text-center`}>
              {plans.free.buttonText}
            </button>
          </div>

          {/* Premium Plan */}
          <div className="bg-white rounded-2xl border-2 border-primary p-8 relative shadow-2xl transform lg:scale-105">
            {plans.premium.popular && (
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <span className="bg-primary text-white px-6 py-2 rounded-full font-bold text-sm">
                  🔥 Most Popular
                </span>
              </div>
            )}

            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">{plans.premium.name}</h3>
              <div className="text-4xl font-black text-primary mb-2">
                ${plans.premium.price}
                <span className="text-lg font-normal text-gray-500">/month</span>
              </div>
              <p className="text-gray-600">{plans.premium.description}</p>
            </div>

            <div className="mb-8">
              <h4 className="font-bold text-gray-900 mb-4">🚀 Everything Included:</h4>
              <ul className="space-y-3">
                {plans.premium.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <svg className="w-5 h-5 text-primary mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className={`${feature.includes('🎤') || feature.includes('📝') ? 'text-primary font-semibold' : 'text-gray-700'}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <button className={`${plans.premium.buttonStyle} w-full`}>
              {plans.premium.buttonText}
            </button>
          </div>
        </div>

        {/* Money Back Guarantee */}
        <div className="mt-12 text-center">
          <div className="inline-flex items-center gap-2 bg-green-50 border-2 border-green-200 rounded-full px-6 py-3">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="font-bold text-green-800">7-Day Money-Back Guarantee</span>
          </div>
        </div>
      </div>
    </section>
  );
}
