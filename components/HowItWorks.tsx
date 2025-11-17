export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Create Your Account",
      description: "Sign up in seconds and get instant access to our comprehensive IELTS preparation materials",
      color: "bg-blue-500"
    },
    {
      number: "02",
      title: "Choose Your Path",
      description: "Select from practice exercises or full mock tests based on your preparation needs",
      color: "bg-purple-500"
    },
    {
      number: "03",
      title: "Practice & Improve",
      description: "Get AI-powered feedback, track your progress, and watch your scores improve steadily",
      color: "bg-primary"
    }
  ];

  return (
    <section className="w-full py-16 sm:py-20">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-black text-black mb-4">
            How It <span className="p-1 px-2 bg-primary rounded-md text-white -rotate-3 inline-block">Works</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto font-semibold">
            Get started with your IELTS preparation in just three simple steps
          </p>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connection Lines (hidden on mobile) */}
          <div className="hidden md:block absolute top-1/4 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-primary -z-10" 
               style={{ width: '75%', left: '12.5%' }}
          />

          {steps.map((step, index) => (
            <div key={index} className="relative">
              <div className="bg-white rounded-xl p-8 border-2 border-gray-200 hover:border-primary/50 transition-all duration-300 hover:shadow-xl">
                {/* Step Number */}
                <div className={`w-16 h-16 ${step.color} rounded-full flex items-center justify-center text-white font-black text-2xl mb-6 mx-auto`}>
                  {step.number}
                </div>
                
                {/* Content */}
                <h3 className="text-2xl font-bold text-black mb-3 text-center">
                  {step.title}
                </h3>
                <p className="text-gray-600 font-medium leading-relaxed text-center">
                  {step.description}
                </p>
              </div>

              {/* Arrow (hidden on mobile and last item) */}
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/4 -right-4 text-gray-300">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
