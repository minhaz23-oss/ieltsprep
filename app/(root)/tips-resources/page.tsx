import React from 'react'
import Link from 'next/link'

const TipsResourcesPage = () => {
  return (
    <div className="min-h-screen px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-24 py-8 sm:py-12 md:py-16 font-semibold">
      {/* Hero Section */}
      <div className="text-center mb-12 sm:mb-16">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 sm:mb-6">
          IELTS{" "}
          <span className="p-1 px-2 bg-primary rounded-md text-white -rotate-3 inline-block">Tips</span>{" "}
          & Resources
        </h1>
        <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
          Master the IELTS exam with our comprehensive collection of expert tips, strategies, and resources 
          designed to boost your band score across all four skills.
        </p>
      </div>

      {/* Quick Navigation */}
      <div className="mb-12 sm:mb-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto">
          <a href="#listening-tips" className="bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 rounded-xl p-3 sm:p-4 text-center transition-colors">
            <div className="text-2xl sm:text-3xl mb-2">🎧</div>
            <div className="text-sm sm:text-base font-bold text-blue-800">Listening Tips</div>
          </a>
          <a href="#reading-tips" className="bg-green-50 hover:bg-green-100 border-2 border-green-200 rounded-xl p-3 sm:p-4 text-center transition-colors">
            <div className="text-2xl sm:text-3xl mb-2">📖</div>
            <div className="text-sm sm:text-base font-bold text-green-800">Reading Tips</div>
          </a>
          <a href="#writing-tips" className="bg-purple-50 hover:bg-purple-100 border-2 border-purple-200 rounded-xl p-3 sm:p-4 text-center transition-colors">
            <div className="text-2xl sm:text-3xl mb-2">✍️</div>
            <div className="text-sm sm:text-base font-bold text-purple-800">Writing Tips</div>
          </a>
          <a href="#speaking-tips" className="bg-orange-50 hover:bg-orange-100 border-2 border-orange-200 rounded-xl p-3 sm:p-4 text-center transition-colors">
            <div className="text-2xl sm:text-3xl mb-2">🎤</div>
            <div className="text-sm sm:text-base font-bold text-orange-800">Speaking Tips</div>
          </a>
        </div>
      </div>

      {/* General IELTS Tips */}
      <section className="mb-12 sm:mb-16">
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4 sm:p-6 lg:p-8 border-2 border-gray-200">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-center mb-6 sm:mb-8">
            🎯 General IELTS Success Strategies
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            <div className="bg-white rounded-xl p-4 sm:p-5 lg:p-6 border-2 border-blue-100">
              <h3 className="text-lg sm:text-xl font-bold text-blue-800 mb-3 sm:mb-4">📅 Test Preparation Timeline</h3>
              <ul className="text-gray-700 space-y-2 text-sm sm:text-base">
                <li>• <strong>3+ months:</strong> Comprehensive preparation for beginners</li>
                <li>• <strong>2 months:</strong> Intensive practice for intermediate learners</li>
                <li>• <strong>1 month:</strong> Final review and mock tests</li>
                <li>• <strong>1 week:</strong> Light practice and relaxation</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-4 sm:p-5 lg:p-6 border-2 border-green-100">
              <h3 className="text-lg sm:text-xl font-bold text-green-800 mb-3 sm:mb-4">⏰ Time Management</h3>
              <ul className="text-gray-700 space-y-2 text-sm sm:text-base">
                <li>• Practice with strict time limits</li>
                <li>• Learn to pace yourself effectively</li>
                <li>• Don't spend too long on difficult questions</li>
                <li>• Always finish all sections</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-4 sm:p-5 lg:p-6 border-2 border-purple-100">
              <h3 className="text-lg sm:text-xl font-bold text-purple-800 mb-3 sm:mb-4">📚 Study Materials</h3>
              <ul className="text-gray-700 space-y-2 text-sm sm:text-base">
                <li>• Official IELTS practice materials</li>
                <li>• Cambridge IELTS books (1-17)</li>
                <li>• Online practice platforms</li>
                <li>• English newspapers and podcasts</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Listening Tips */}
      <section id="listening-tips" className="mb-12 sm:mb-16">
        <div className="bg-blue-50 rounded-2xl p-4 sm:p-6 lg:p-8 border-2 border-blue-200">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-blue-900 text-center mb-6 sm:mb-8">
            🎧 IELTS Listening Mastery
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-white rounded-xl p-4 sm:p-5 lg:p-6 border-2 border-blue-100">
                <h3 className="text-lg sm:text-xl font-bold text-blue-800 mb-3">🎯 Key Strategies</h3>
                <ul className="text-gray-700 space-y-2 text-sm sm:text-base">
                  <li>• Read questions before listening begins</li>
                  <li>• Predict possible answers</li>
                  <li>• Listen for keywords and synonyms</li>
                  <li>• Don't panic if you miss an answer</li>
                  <li>• Use the 10-minute transfer time wisely</li>
                </ul>
              </div>

              <div className="bg-white rounded-xl p-4 sm:p-5 lg:p-6 border-2 border-blue-100">
                <h3 className="text-lg sm:text-xl font-bold text-blue-800 mb-3">📝 Question Types</h3>
                <ul className="text-gray-700 space-y-2 text-sm sm:text-base">
                  <li>• <strong>Multiple Choice:</strong> Eliminate wrong options</li>
                  <li>• <strong>Form Completion:</strong> Check word limits</li>
                  <li>• <strong>Map/Diagram:</strong> Follow directions carefully</li>
                  <li>• <strong>Matching:</strong> Listen for specific details</li>
                </ul>
              </div>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <div className="bg-white rounded-xl p-4 sm:p-5 lg:p-6 border-2 border-blue-100">
                <h3 className="text-lg sm:text-xl font-bold text-blue-800 mb-3">🏋️ Practice Exercises</h3>
                <ul className="text-gray-700 space-y-2 text-sm sm:text-base">
                  <li>• Listen to BBC News daily (10-15 minutes)</li>
                  <li>• Practice with different English accents</li>
                  <li>• Use TED Talks for academic listening</li>
                  <li>• Try dictation exercises</li>
                  <li>• Watch English movies with subtitles</li>
                </ul>
              </div>

              <div className="bg-white rounded-xl p-4 sm:p-5 lg:p-6 border-2 border-blue-100">
                <h3 className="text-lg sm:text-xl font-bold text-blue-800 mb-3">⚠️ Common Mistakes</h3>
                <ul className="text-gray-700 space-y-2 text-sm sm:text-base">
                  <li>• Writing more than the word limit</li>
                  <li>• Spelling errors in answers</li>
                  <li>• Not following instructions exactly</li>
                  <li>• Focusing too much on one question</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reading Tips */}
      <section id="reading-tips" className="mb-12 sm:mb-16">
        <div className="bg-green-50 rounded-2xl p-4 sm:p-6 lg:p-8 border-2 border-green-200">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-green-900 text-center mb-6 sm:mb-8">
            📖 IELTS Reading Excellence
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-white rounded-xl p-4 sm:p-5 lg:p-6 border-2 border-green-100">
                <h3 className="text-lg sm:text-xl font-bold text-green-800 mb-3">⚡ Speed Reading Techniques</h3>
                <ul className="text-gray-700 space-y-2 text-sm sm:text-base">
                  <li>• <strong>Skimming:</strong> Get the main idea quickly</li>
                  <li>• <strong>Scanning:</strong> Find specific information</li>
                  <li>• <strong>Detailed Reading:</strong> For complex questions</li>
                  <li>• Don't read every word</li>
                  <li>• Focus on topic sentences</li>
                </ul>
              </div>

              <div className="bg-white rounded-xl p-4 sm:p-5 lg:p-6 border-2 border-green-100">
                <h3 className="text-lg sm:text-xl font-bold text-green-800 mb-3">🎯 Question Strategies</h3>
                <ul className="text-gray-700 space-y-2 text-sm sm:text-base">
                  <li>• Read questions before the passage</li>
                  <li>• Identify keywords in questions</li>
                  <li>• Look for paraphrases in the text</li>
                  <li>• Use context clues for vocabulary</li>
                </ul>
              </div>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <div className="bg-white rounded-xl p-4 sm:p-5 lg:p-6 border-2 border-green-100">
                <h3 className="text-lg sm:text-xl font-bold text-green-800 mb-3">📊 Time Allocation</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-2 bg-green-100 rounded">
                    <span className="text-sm sm:text-base font-medium">Passage 1</span>
                    <span className="text-sm sm:text-base font-bold text-green-700">15-17 minutes</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-green-100 rounded">
                    <span className="text-sm sm:text-base font-medium">Passage 2</span>
                    <span className="text-sm sm:text-base font-bold text-green-700">18-20 minutes</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-green-100 rounded">
                    <span className="text-sm sm:text-base font-medium">Passage 3</span>
                    <span className="text-sm sm:text-base font-bold text-green-700">20-22 minutes</span>
                  </div>
                  <div className="flex justify-between items-center p-2 bg-green-200 rounded">
                    <span className="text-sm sm:text-base font-medium">Review</span>
                    <span className="text-sm sm:text-base font-bold text-green-700">3-5 minutes</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 sm:p-5 lg:p-6 border-2 border-green-100">
                <h3 className="text-lg sm:text-xl font-bold text-green-800 mb-3">📚 Reading Practice</h3>
                <ul className="text-gray-700 space-y-2 text-sm sm:text-base">
                  <li>• Read academic articles daily</li>
                  <li>• Practice with The Guardian, BBC</li>
                  <li>• Use National Geographic for science</li>
                  <li>• Read different text types</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Writing Tips */}
      <section id="writing-tips" className="mb-12 sm:mb-16">
        <div className="bg-purple-50 rounded-2xl p-4 sm:p-6 lg:p-8 border-2 border-purple-200">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-purple-900 text-center mb-6 sm:mb-8">
            ✍️ IELTS Writing Mastery
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-6 sm:mb-8">
            <div className="bg-white rounded-xl p-4 sm:p-5 lg:p-6 border-2 border-purple-100">
              <h3 className="text-lg sm:text-xl font-bold text-purple-800 mb-4">📊 Task 1 (Academic) - Data Description</h3>
              <div className="space-y-3">
                <div className="bg-purple-50 p-3 rounded-lg">
                  <h4 className="font-semibold text-purple-700 mb-2">Structure (150+ words):</h4>
                  <ol className="text-sm sm:text-base text-gray-700 space-y-1">
                    <li>1. Introduction (paraphrase the question)</li>
                    <li>2. Overview (main trends/features)</li>
                    <li>3. Body 1 (specific details)</li>
                    <li>4. Body 2 (more specific details)</li>
                  </ol>
                </div>
                <div className="text-sm sm:text-base text-gray-700">
                  <strong>Key Vocabulary:</strong> increase, decrease, fluctuate, peak, plateau, 
                  significant, gradual, dramatic, steady
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 sm:p-5 lg:p-6 border-2 border-purple-100">
              <h3 className="text-lg sm:text-xl font-bold text-purple-800 mb-4">📝 Task 2 - Essay Writing</h3>
              <div className="space-y-3">
                <div className="bg-purple-50 p-3 rounded-lg">
                  <h4 className="font-semibold text-purple-700 mb-2">Structure (250+ words):</h4>
                  <ol className="text-sm sm:text-base text-gray-700 space-y-1">
                    <li>1. Introduction (background + thesis)</li>
                    <li>2. Body 1 (main argument + examples)</li>
                    <li>3. Body 2 (second argument + examples)</li>
                    <li>4. Conclusion (summarize + opinion)</li>
                  </ol>
                </div>
                <div className="text-sm sm:text-base text-gray-700">
                  <strong>Essay Types:</strong> Opinion, Discussion, Problem-Solution, 
                  Advantages-Disadvantages
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-white rounded-xl p-4 sm:p-5 border-2 border-purple-100">
              <h4 className="text-base sm:text-lg font-bold text-purple-800 mb-3">⏱️ Time Management</h4>
              <ul className="text-sm sm:text-base text-gray-700 space-y-1">
                <li>• Task 1: 20 minutes max</li>
                <li>• Task 2: 40 minutes</li>
                <li>• Planning: 5 minutes</li>
                <li>• Checking: 3-5 minutes</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-4 sm:p-5 border-2 border-purple-100">
              <h4 className="text-base sm:text-lg font-bold text-purple-800 mb-3">🔗 Linking Words</h4>
              <ul className="text-sm sm:text-base text-gray-700 space-y-1">
                <li>• However, Nevertheless</li>
                <li>• Furthermore, Moreover</li>
                <li>• In contrast, On the other hand</li>
                <li>• Consequently, Therefore</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-4 sm:p-5 border-2 border-purple-100">
              <h4 className="text-base sm:text-lg font-bold text-purple-800 mb-3">✅ Assessment Criteria</h4>
              <ul className="text-sm sm:text-base text-gray-700 space-y-1">
                <li>• Task Achievement (25%)</li>
                <li>• Coherence & Cohesion (25%)</li>
                <li>• Lexical Resource (25%)</li>
                <li>• Grammar & Accuracy (25%)</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Speaking Tips */}
      <section id="speaking-tips" className="mb-12 sm:mb-16">
        <div className="bg-orange-50 rounded-2xl p-4 sm:p-6 lg:p-8 border-2 border-orange-200">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-orange-900 text-center mb-6 sm:mb-8">
            🎤 IELTS Speaking Confidence
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className="bg-white rounded-xl p-4 sm:p-5 lg:p-6 border-2 border-orange-100">
              <h3 className="text-lg sm:text-xl font-bold text-orange-800 mb-3">Part 1: Interview (4-5 min)</h3>
              <ul className="text-sm sm:text-base text-gray-700 space-y-2">
                <li>• Answer in 2-3 sentences</li>
                <li>• Give reasons and examples</li>
                <li>• Be natural and friendly</li>
                <li>• Don't memorize answers</li>
              </ul>
              <div className="mt-3 p-2 bg-orange-100 rounded text-xs sm:text-sm text-orange-800">
                <strong>Topics:</strong> Home, work, studies, hobbies, food, travel
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 sm:p-5 lg:p-6 border-2 border-orange-100">
              <h3 className="text-lg sm:text-xl font-bold text-orange-800 mb-3">Part 2: Long Turn (3-4 min)</h3>
              <ul className="text-sm sm:text-base text-gray-700 space-y-2">
                <li>• 1 minute to prepare</li>
                <li>• Speak for 1-2 minutes</li>
                <li>• Cover all bullet points</li>
                <li>• Use the preparation time wisely</li>
              </ul>
              <div className="mt-3 p-2 bg-orange-100 rounded text-xs sm:text-sm text-orange-800">
                <strong>Structure:</strong> Introduction → Main points → Personal experience → Conclusion
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 sm:p-5 lg:p-6 border-2 border-orange-100">
              <h3 className="text-lg sm:text-xl font-bold text-orange-800 mb-3">Part 3: Discussion (4-5 min)</h3>
              <ul className="text-sm sm:text-base text-gray-700 space-y-2">
                <li>• Give detailed answers</li>
                <li>• Express and justify opinions</li>
                <li>• Compare and contrast</li>
                <li>• Speculate about future</li>
              </ul>
              <div className="mt-3 p-2 bg-orange-100 rounded text-xs sm:text-sm text-orange-800">
                <strong>Skills:</strong> Analysis, evaluation, hypothesis, comparison
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            <div className="bg-white rounded-xl p-4 sm:p-5 lg:p-6 border-2 border-orange-100">
              <h4 className="text-lg sm:text-xl font-bold text-orange-800 mb-4">🗣️ Fluency & Pronunciation Tips</h4>
              <ul className="text-sm sm:text-base text-gray-700 space-y-2">
                <li>• Speak at a natural pace</li>
                <li>• Use fillers appropriately (well, actually, you know)</li>
                <li>• Practice word stress and intonation</li>
                <li>• Don't worry about perfect accent</li>
                <li>• Self-correct when you make mistakes</li>
                <li>• Use pausing effectively</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-4 sm:p-5 lg:p-6 border-2 border-orange-100">
              <h4 className="text-lg sm:text-xl font-bold text-orange-800 mb-4">📈 Vocabulary & Grammar</h4>
              <ul className="text-sm sm:text-base text-gray-700 space-y-2">
                <li>• Use a range of vocabulary</li>
                <li>• Try complex sentence structures</li>
                <li>• Use idiomatic expressions naturally</li>
                <li>• Avoid repetition</li>
                <li>• Practice collocations</li>
                <li>• Use appropriate register</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Band Score Guide */}
      <section className="mb-12 sm:mb-16">
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-4 sm:p-6 lg:p-8 border-2 border-indigo-200">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-center mb-6 sm:mb-8 text-indigo-900">
            🎯 IELTS Band Score Guide
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white rounded-xl p-4 sm:p-5 border-2 border-red-200">
              <div className="text-center mb-3">
                <div className="text-3xl sm:text-4xl font-black text-red-600">6.0</div>
                <div className="text-sm sm:text-base font-semibold text-red-700">Competent User</div>
              </div>
              <ul className="text-xs sm:text-sm text-gray-700 space-y-1">
                <li>• Generally effective command</li>
                <li>• Some inaccuracies and misunderstandings</li>
                <li>• Can use fairly complex language</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-4 sm:p-5 border-2 border-yellow-200">
              <div className="text-center mb-3">
                <div className="text-3xl sm:text-4xl font-black text-yellow-600">7.0</div>
                <div className="text-sm sm:text-base font-semibold text-yellow-700">Good User</div>
              </div>
              <ul className="text-xs sm:text-sm text-gray-700 space-y-1">
                <li>• Good operational command</li>
                <li>• Occasional inaccuracies</li>
                <li>• Handles complex language well</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-4 sm:p-5 border-2 border-blue-200">
              <div className="text-center mb-3">
                <div className="text-3xl sm:text-4xl font-black text-blue-600">8.0</div>
                <div className="text-sm sm:text-base font-semibold text-blue-700">Very Good User</div>
              </div>
              <ul className="text-xs sm:text-sm text-gray-700 space-y-1">
                <li>• Very good command</li>
                <li>• Few unsystematic inaccuracies</li>
                <li>• Handles complex detailed argumentation</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-4 sm:p-5 border-2 border-green-200">
              <div className="text-center mb-3">
                <div className="text-3xl sm:text-4xl font-black text-green-600">9.0</div>
                <div className="text-sm sm:text-base font-semibold text-green-700">Expert User</div>
              </div>
              <ul className="text-xs sm:text-sm text-gray-700 space-y-1">
                <li>• Full operational command</li>
                <li>• Appropriate, accurate and fluent</li>
                <li>• Complete understanding</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Test Day Tips */}
      <section className="mb-12 sm:mb-16">
        <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl p-4 sm:p-6 lg:p-8 border-2 border-red-200">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-center mb-6 sm:mb-8 text-red-900">
            📅 Test Day Success Tips
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-white rounded-xl p-4 sm:p-5 lg:p-6 border-2 border-red-100">
                <h3 className="text-lg sm:text-xl font-bold text-red-800 mb-3">🌅 Before the Test</h3>
                <ul className="text-sm sm:text-base text-gray-700 space-y-2">
                  <li>• Get a good night's sleep (7-8 hours)</li>
                  <li>• Eat a healthy breakfast</li>
                  <li>• Arrive 30 minutes early</li>
                  <li>• Bring required identification</li>
                  <li>• Review test format briefly</li>
                  <li>• Stay calm and confident</li>
                </ul>
              </div>

              <div className="bg-white rounded-xl p-4 sm:p-5 lg:p-6 border-2 border-red-100">
                <h3 className="text-lg sm:text-xl font-bold text-red-800 mb-3">📝 During the Test</h3>
                <ul className="text-sm sm:text-base text-gray-700 space-y-2">
                  <li>• Read all instructions carefully</li>
                  <li>• Manage your time effectively</li>
                  <li>• Don't panic if you don't know an answer</li>
                  <li>• Check your answers if time permits</li>
                  <li>• Stay focused throughout</li>
                </ul>
              </div>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <div className="bg-white rounded-xl p-4 sm:p-5 lg:p-6 border-2 border-red-100">
                <h3 className="text-lg sm:text-xl font-bold text-red-800 mb-3">🎒 What to Bring</h3>
                <ul className="text-sm sm:text-base text-gray-700 space-y-2">
                  <li>• Valid passport or ID</li>
                  <li>• Test confirmation email</li>
                  <li>• Pencils (for Listening & Reading)</li>
                  <li>• Pen (for Writing)</li>
                  <li>• Water bottle (if allowed)</li>
                  <li>• Comfortable clothes</li>
                </ul>
              </div>

              <div className="bg-white rounded-xl p-4 sm:p-5 lg:p-6 border-2 border-red-100">
                <h3 className="text-lg sm:text-xl font-bold text-red-800 mb-3">🚫 What NOT to Bring</h3>
                <ul className="text-sm sm:text-base text-gray-700 space-y-2">
                  <li>• Mobile phones or electronic devices</li>
                  <li>• Watches (analog or digital)</li>
                  <li>• Food or drinks (except water)</li>
                  <li>• Bags or personal items</li>
                  <li>• Study materials</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Useful Resources */}
      <section className="mb-12 sm:mb-16">
        <div className="bg-gradient-to-br from-teal-50 to-cyan-50 rounded-2xl p-4 sm:p-6 lg:p-8 border-2 border-teal-200">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-center mb-6 sm:mb-8 text-teal-900">
            📚 Recommended Resources
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-white rounded-xl p-4 sm:p-5 lg:p-6 border-2 border-teal-100">
              <h3 className="text-lg sm:text-xl font-bold text-teal-800 mb-3">📖 Official Materials</h3>
              <ul className="text-sm sm:text-base text-gray-700 space-y-2">
                <li>• IELTS.org official website</li>
                <li>• Cambridge IELTS books 1-17</li>
                <li>• IELTS Trainer books</li>
                <li>• Official IELTS app</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-4 sm:p-5 lg:p-6 border-2 border-teal-100">
              <h3 className="text-lg sm:text-xl font-bold text-teal-800 mb-3">🌐 Online Platforms</h3>
              <ul className="text-sm sm:text-base text-gray-700 space-y-2">
                <li>• British Council IELTS</li>
                <li>• IDP IELTS preparation</li>
                <li>• IELTS Liz (free tips)</li>
                <li>• IELTS Simon blog</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-4 sm:p-5 lg:p-6 border-2 border-teal-100">
              <h3 className="text-lg sm:text-xl font-bold text-teal-800 mb-3">🎧 Listening Practice</h3>
              <ul className="text-sm sm:text-base text-gray-700 space-y-2">
                <li>• BBC Learning English</li>
                <li>• TED Talks</li>
                <li>• Podcasts (BBC, NPR)</li>
                <li>• YouTube IELTS channels</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-4 sm:p-5 lg:p-6 border-2 border-teal-100">
              <h3 className="text-lg sm:text-xl font-bold text-teal-800 mb-3">📰 Reading Practice</h3>
              <ul className="text-sm sm:text-base text-gray-700 space-y-2">
                <li>• The Guardian</li>
                <li>• BBC News</li>
                <li>• National Geographic</li>
                <li>• Scientific American</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-4 sm:p-5 lg:p-6 border-2 border-teal-100">
              <h3 className="text-lg sm:text-xl font-bold text-teal-800 mb-3">✍️ Writing Tools</h3>
              <ul className="text-sm sm:text-base text-gray-700 space-y-2">
                <li>• Grammarly (grammar check)</li>
                <li>• Hemingway Editor</li>
                <li>• Cambridge Dictionary</li>
                <li>• Thesaurus.com</li>
              </ul>
            </div>

            <div className="bg-white rounded-xl p-4 sm:p-5 lg:p-6 border-2 border-teal-100">
              <h3 className="text-lg sm:text-xl font-bold text-teal-800 mb-3">🎤 Speaking Practice</h3>
              <ul className="text-sm sm:text-base text-gray-700 space-y-2">
                <li>• ELSA Speak app</li>
                <li>• Pronunciation apps</li>
                <li>• Language exchange platforms</li>
                <li>• Record yourself speaking</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="text-center">
        <div className="bg-gradient-to-br from-primary/10 to-red-100 rounded-2xl p-6 sm:p-8 lg:p-12 border-2 border-primary/20">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black mb-4 sm:mb-6">
            Ready to Start Your IELTS Journey? 🚀
          </h2>
          <p className="text-base sm:text-lg text-gray-700 mb-6 sm:mb-8 max-w-2xl mx-auto">
            Put these tips into practice with our comprehensive IELTS preparation platform. 
            Take mock tests, get AI feedback, and track your progress.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/exercise" className="btn-primary text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4">
              Start Practice Tests
            </Link>
            <Link href="/mock-test" className="btn-secondary text-sm sm:text-base px-6 sm:px-8 py-3 sm:py-4">
              Take Full Mock Test
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

export default TipsResourcesPage