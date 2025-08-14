import React from 'react'
import Link from 'next/link'
import { testModules } from '@/constants'

const page = () => {
  return (
    <div className="min-h-screen px-4 py-16 font-semibold">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-black text-black mb-6">
            Choose Your <span className="p-1 px-2 bg-primary rounded-md text-white -rotate-3 inline-block">Practice</span> Module
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto font-semibold leading-relaxed">
            Select from our comprehensive IELTS practice modules. Each section is designed to mirror 
            the actual test format and help you build confidence in every skill area.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {testModules.map((module, index) => (
            <div 
              key={index}
              className="bg-white rounded-xl  border-2 border-primary/50 p-8 hover:border-primary hover:shadow-xl transition-shadow duration-300 group cursor-pointer"
              
            >
              <div className="text-center">
                {/* Module Icon/Title */}
                <div className="mb-6">
                  <h3 className="text-3xl font-bold text-black mb-3 group-hover:text-primary transition-colors duration-300">
                    {module.title}
                  </h3>
                </div>
                
                {/* Description */}
                <p className="text-gray-600 mb-8 font-medium leading-relaxed text-base">
                  {module.desc}
                </p>
                
                {/* Features */}
                <div className="mb-8">
                  {module.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-center justify-center text-sm text-gray-500 mb-4">
                      <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {feature}
                    </div>
                  ))}
                </div>
                
                {/* Button */}
                <Link href={module.href}>
                  <button className="btn-primary w-full group-hover:bg-red-700 transition-colors duration-300">
                    Start Practice
                  </button>
                </Link>
              </div>
            </div>
          ))}
        </div>
        
        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-gray-500 mb-6 font-medium">
            Not sure where to start? Take our placement test to get personalized recommendations.
          </p>
          <Link href="/placement-test">
            <button className="btn-secondary">
              Take Placement Test
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default page
