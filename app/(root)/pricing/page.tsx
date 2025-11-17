'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';

const PricingPage = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const { isAuthenticated, user, isPremium } = useAuth();

  const plans = {
    free: {
      name: 'Free',
      price: { monthly: 0, yearly: 0 },
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
      price: { monthly: 19.99, yearly: 199.99 },
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
      popular: true,
      savings: Math.round(((19.99 * 12) - 199.99) / (19.99 * 12) * 100)
    }
  };

  const freeFeatures = [
    {
      icon: '📖',
      title: 'Reading Practice',
      description: 'Unlimited access to reading comprehension exercises across all difficulty levels'
    },
    {
      icon: '🎧',
      title: 'Listening Practice', 
      description: 'Complete listening test practice with authentic IELTS-style audio materials'
    },
    {
      icon: '✍️',
      title: 'Writing Practice',
      description: 'Task 1 & Task 2 writing practice with AI-powered evaluation and feedback'
    },
    {
      icon: '📊',
      title: 'Progress Tracking',
      description: 'Detailed dashboard showing your improvement and performance analytics'
    }
  ];

  const premiumFeatures = [
    {
      icon: '🎤',
      title: 'Speaking Practice',
      description: 'Complete speaking test simulation with AI evaluation and pronunciation feedback',
      premium: true
    },
    {
      icon: '📝',
      title: 'Full Mock Tests',
      description: 'Complete IELTS simulation tests covering all four skills in exam conditions',
      premium: true
    },
    {
      icon: '🤖',
      title: 'Advanced AI Feedback',
      description: 'Detailed AI analysis with personalized improvement suggestions',
      premium: true
    },
    {
      icon: '🎯',
      title: 'Custom Study Plans',
      description: 'Personalized study schedules based on your target score and timeline',
      premium: true
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      score: 'Band 8.5',
      text: 'The speaking practice was a game-changer! I went from Band 6 to 8.5 in just 2 months.',
      avatar: '👩‍🎓'
    },
    {
      name: 'Ahmed Hassan',
      score: 'Band 7.5',
      text: 'Mock tests helped me understand the real exam format. Premium was worth every penny!',
      avatar: '👨‍💼'
    },
    {
      name: 'Maria Rodriguez',
      score: 'Band 8.0',
      text: 'The AI feedback is incredibly detailed. It\'s like having a personal IELTS tutor.',
      avatar: '👩‍🔬'
    }
  ];

  const faqs = [
    {
      question: 'What\'s the difference between Free and Premium?',
      answer: 'Free includes Reading, Listening, and Writing practice with basic AI feedback. Premium adds Speaking practice, Full Mock Tests, advanced AI analysis, and personalized study plans.'
    },
    {
      question: 'Can I cancel my Premium subscription anytime?',
      answer: 'Yes! You can cancel your subscription at any time. You\'ll continue to have Premium access until the end of your billing period.'
    },
    {
      question: 'Is the AI evaluation accurate?',
      answer: 'Our AI is trained on thousands of IELTS responses and closely matches human examiner scores. It provides detailed feedback on grammar, vocabulary, coherence, and task achievement.'
    },
    {
      question: 'Do you offer refunds?',
      answer: 'We offer a 7-day money-back guarantee. If you\'re not satisfied with Premium features, contact us for a full refund.'
    },
    {
      question: 'How many mock tests are included?',
      answer: 'Premium users get unlimited access to our complete mock test library, with new tests added regularly.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* News headline banner for non-premium users */}
      {!isPremium && (
        <div className=" bg-yellow-100 border border-yellow-200 mt-2 rounded-md hover:bg-yellow-400 transition-colors">
          <Link href="/qualification-exam" className="max-w-7xl mx-auto px-4 sm:px-6 py-2 block text-center text-sm sm:text-base font-semibold text-yellow-900 hover:underline">
            you can get the premium for free by giving a simple exam and showing your skill level — Take the qualification exam →
          </Link>
        </div>
      )}
      {/* Hero Section */}
      <section className=" text-black py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-6">
            Choose Your IELTS{" "}
            <span className="bg-primary text-white px-3 py-1 rounded-lg -rotate-2 inline-block">Success</span>{" "}
            Plan
          </h1>
          <p className="text-xl font-semibold sm:text-2xl text-primary mb-8 max-w-3xl mx-auto">
            Start free, upgrade when you're ready for complete IELTS mastery
          </p>
          
          {/* Billing Toggle - FIXED */}
          <div className="flex items-center justify-center mb-12">
            <div className="bg-white/10 backdrop-blur-sm rounded-full p-1 flex">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2 rounded-full font-semibold transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-primary text-white shadow-lg'
                    : 'bg-white text-primary'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-2 rounded-full font-semibold transition-all relative ${
                  billingCycle === 'yearly'
                    ? 'bg-primary text-white shadow-lg'
                    : 'bg-white text-primary'
                }`}
              >
                Yearly
                <span className="absolute -top-2 -right-2 bg-yellow-400 text-primary text-xs font-bold px-2 py-1 rounded-full">
                  Save {plans.premium.savings}%
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
            
            {/* Free Plan */}
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 relative">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plans.free.name}</h3>
                <div className="text-4xl font-black text-gray-900 mb-2">
                  ${plans.free.price[billingCycle]}
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

              <Link href={isAuthenticated ? "/exercise" : "/sign-up"} className={`${plans.free.buttonStyle} w-full text-center block`}>
                {plans.free.buttonText}
              </Link>
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
                  ${plans.premium.price[billingCycle]}
                  <span className="text-lg font-normal text-gray-500">
                    /{billingCycle === 'yearly' ? 'year' : 'month'}
                  </span>
                </div>
                {billingCycle === 'yearly' && (
                  <div className="text-green-600 font-semibold text-sm mb-2">
                    Save ${(plans.premium.price.monthly * 12 - plans.premium.price.yearly).toFixed(2)} per year!
                  </div>
                )}
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
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
              What You Get With Each Plan
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Compare features and see why Premium unlocks your full IELTS potential
            </p>
          </div>

          {/* Free Features */}
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
              🆓 Free Plan Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {freeFeatures.map((feature, index) => (
                <div key={index} className="text-center p-6 bg-gray-50 rounded-xl">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h4 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h4>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Premium Features */}
          <div>
            <h3 className="text-2xl font-bold text-primary mb-8 text-center">
              ⭐ Premium Exclusive Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {premiumFeatures.map((feature, index) => (
                <div key={index} className="text-center p-6 bg-gradient-to-br from-primary/5 to-red-50 rounded-xl border-2 border-primary/20">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h4 className="text-lg font-bold text-primary mb-2">{feature.title}</h4>
                  <p className="text-gray-700 text-sm">{feature.description}</p>
                  <div className="mt-3">
                    <span className="bg-primary text-white text-xs font-bold px-2 py-1 rounded-full">
                      Premium Only
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
              Success Stories from Premium Users
            </h2>
            <p className="text-xl text-gray-600">
              See how Premium features helped students achieve their target scores
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center mb-4">
                  <div className="text-3xl mr-3">{testimonial.avatar}</div>
                  <div>
                    <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                    <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-semibold">
                      {testimonial.score}
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 italic">"{testimonial.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to know about our pricing plans
            </p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">{faq.question}</h3>
                <p className="text-gray-700">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 bg-primary text-white rounded-xl">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-black mb-6">
            Ready to Achieve Your Target IELTS Score?
          </h2>
          <p className="text-xl text-red-100 mb-8">
            Join thousands of successful students who chose Premium for complete IELTS preparation
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={isAuthenticated ? "/exercise" : "/sign-up"} className="bg-white text-primary px-8 py-4 rounded-lg font-bold text-lg hover:bg-gray-100 transition-colors">
              Start Free Today
            </Link>
            <button className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg font-bold text-lg hover:bg-white hover:text-primary transition-colors">
              Upgrade to Premium
            </button>
          </div>

          <div className="mt-8 text-red-100 text-sm">
            ✅ 7-day money-back guarantee • ✅ Cancel anytime • ✅ No hidden fees
          </div>
        </div>
      </section>
    </div>
  );
};

export default PricingPage;