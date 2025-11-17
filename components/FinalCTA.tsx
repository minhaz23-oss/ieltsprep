import Image from "next/image";
import Link from "next/link";

export default function FinalCTA() {
  return (
    <section className="w-full py-16 sm:py-24 bg-gradient-to-br from-primary via-red-600 to-red-700 text-white relative overflow-hidden rounded-2xl">
      {/* Background Decorations */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
        {/* Icon/Image */}
        <div className="mb-8 flex justify-center">
          <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>

        {/* Heading */}
        <h2 className="text-4xl sm:text-5xl font-black mb-6">
          Ready to Ace Your IELTS Exam?
        </h2>
        
        {/* Launch Offer Badge */}
        <div className="inline-block mb-6">
          <span className="bg-white text-primary px-6 py-3 rounded-full font-black text-lg animate-pulse">
            🎉 LAUNCH OFFER: Premium Features FREE!
          </span>
        </div>

        {/* Description */}
        <p className="text-xl sm:text-2xl text-red-100 font-semibold mb-8 max-w-2xl mx-auto leading-relaxed">
          Join early, give a simple test and get full Premium access at no cost. Start your IELTS journey with all features unlocked!
        </p>

        {/* Features List */}
        <div className="flex flex-wrap justify-center gap-6 mb-10">
          <div className="flex items-center gap-2">
            <svg className="w-6 h-6 text-green-300" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="font-bold">100% Free Premium</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-6 h-6 text-green-300" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="font-bold">No credit card required</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-6 h-6 text-green-300" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            <span className="font-bold">All features unlocked</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
          <Link href={'/sign-up'} className="bg-white text-primary hover:bg-gray-100 px-8 py-4 rounded-md font-bold text-lg shadow-xl transition-all duration-300 hover:scale-105">
            Get Started Now
          </Link>
          
        </div>

        {/* Alternative Path - Qualification Exam */}
        <div className="mt-8 pt-8 pb-4 border-t border-white/20">
          <p className="text-lg text-red-100 mb-4 font-semibold">
            Or unlock Premium instantly by showing your skills
          </p>
          <a href="/qualification-exam" className="inline-block bg-white text-primary  px-8 py-4 rounded-md font-bold text-lg shadow-xl transition-all duration-300 hover:scale-105">
            🎯 Take Qualification Exam & Get Premium Free
          </a>
        </div>

        {/* Trust Indicators */}
        <div className="flex flex-wrap justify-center items-center gap-8 pt-8 border-t border-white/20">
          <div className="text-center">
            <div className="text-3xl font-black mb-1">4.9/5</div>
            <div className="text-sm text-red-100">User Rating</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black mb-1">10K+</div>
            <div className="text-sm text-red-100">Active Users</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-black mb-1">95%</div>
            <div className="text-sm text-red-100">Success Rate</div>
          </div>
        </div>
      </div>
    </section>
  );
}
