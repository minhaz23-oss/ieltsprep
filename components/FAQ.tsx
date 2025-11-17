"use client";

import { useState } from "react";

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "How is this different from other IELTS prep platforms?",
      answer: "We use advanced AI technology to provide instant, personalized feedback on your writing and speaking. Our platform also offers realistic exam simulations with accurate timing and a comprehensive question bank that's regularly updated to match current exam patterns."
    },
    {
      question: "Can I really improve my IELTS score using this platform?",
      answer: "Absolutely! Our students achieve an average band score improvement of 1.5 points. With consistent practice, AI-powered feedback, and our comprehensive study materials, you'll see measurable progress in your preparation."
    },
    {
      question: "Do you offer practice for all four IELTS modules?",
      answer: "Yes! We provide comprehensive practice materials for Listening, Reading, Writing, and Speaking. Each module includes targeted exercises, full-length tests, and detailed feedback to help you excel in every section."
    },
    {
      question: "How does the AI feedback work for Writing and Speaking?",
      answer: "Our AI analyzes your responses based on official IELTS criteria including coherence, lexical resource, grammatical range, and accuracy. You'll receive detailed feedback with specific suggestions for improvement, highlighted errors, and band score estimates."
    },
    {
      question: "Can I access the platform on mobile devices?",
      answer: "Yes! Our platform is fully responsive and works seamlessly on smartphones, tablets, and desktop computers. Practice anytime, anywhere, and your progress syncs across all devices."
    },
    {
      question: "What if I'm not satisfied with my purchase?",
      answer: "We offer a 30-day money-back guarantee. If you're not completely satisfied with our platform, simply contact our support team within 30 days of purchase for a full refund, no questions asked."
    },
    {
      question: "How often is the content updated?",
      answer: "We update our question bank and practice materials regularly to ensure they reflect the latest IELTS exam patterns. New questions and mock tests are added weekly, and our AI feedback system is continuously improved."
    },
    {
      question: "Do you provide certificates or score reports?",
      answer: "Yes! After completing mock tests, you'll receive detailed score reports with band scores for each section. Premium users also get downloadable performance certificates that track their progress over time."
    }
  ];

  return (
    <section className="w-full py-16 sm:py-20">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-black mb-4">
            Frequently Asked <span className="p-1 px-2 bg-primary rounded-md text-white -rotate-3 inline-block">Questions</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto font-semibold">
            Everything you need to know about our IELTS preparation platform
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index}
              className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden transition-all duration-300 hover:border-primary/50"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left"
              >
                <span className="text-lg font-bold text-black pr-4">
                  {faq.question}
                </span>
                <svg 
                  className={`w-6 h-6 text-primary flex-shrink-0 transition-transform duration-300 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              <div 
                className={`overflow-hidden transition-all duration-300 ${
                  openIndex === index ? 'max-h-96' : 'max-h-0'
                }`}
              >
                <div className="px-6 pb-5 text-gray-600 font-medium leading-relaxed">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Contact Support */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 font-medium mb-4">
            Still have questions? We're here to help!
          </p>
          <button className="btn-secondary">
            Contact Support
          </button>
        </div>
      </div>
    </section>
  );
}
