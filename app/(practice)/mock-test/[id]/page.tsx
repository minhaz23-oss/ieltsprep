import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { requireAuth, isPremiumUser } from '@/lib/auth/server';
import { MockTest, MockTestSession } from '@/types/mockTest';

// Server-side function to get mock test data with proper auth
async function getMockTestData(id: string) {
  try {
    // Import here to avoid issues
    const { cookies } = await import('next/headers');
    const { db } = await import('@/firebase/admin');
    
    // Get from Firebase Admin directly (server-side)
    const mockTestDoc = await db.collection('mockTests').doc(id).get();
    
    if (!mockTestDoc.exists) {
      return null;
    }
    
    const mockTestData = mockTestDoc.data();
    
    // Get user from cookies to fetch their session
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;
    
    let session = null;
    if (sessionCookie) {
      const { auth: adminAuth } = await import('@/firebase/admin');
      try {
        const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
        const userId = decodedClaims.uid;
        
        // Fetch user's session for this mock test
        const sessionSnapshot = await db
          .collection('mockTestSessions')
          .where('userId', '==', userId)
          .where('mockTestId', '==', id)
          .limit(1)
          .get();
        
        if (!sessionSnapshot.empty) {
          session = {
            id: sessionSnapshot.docs[0].id,
            ...sessionSnapshot.docs[0].data()
          };
        }
      } catch (error) {
        console.error('Error verifying session:', error);
      }
    }
    
    return {
      mockTest: {
        id: mockTestDoc.id,
        ...mockTestData
      } as MockTest,
      session: session as MockTestSession | null
    };
  } catch (error) {
    console.error('Error fetching mock test:', error);
    return null;
  }
}

export default async function MockTestOverviewPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireAuth();
  const userIsPremium = await isPremiumUser();
  
  // Await params in Next.js 15
  const { id } = await params;
  const mockTestData = await getMockTestData(id);
  
  if (!mockTestData) {
    notFound();
  }

  const { mockTest, session } = mockTestData as { mockTest: MockTest; session: MockTestSession | null };
  const isLocked = mockTest.isPremium && !userIsPremium;
  const hasInProgressSession = session?.status === 'in_progress';
  const isCompleted = session?.status === 'completed';

  const sections = [
    {
      name: 'Listening',
      icon: '🎧',
      duration: mockTest.sections.listening.duration,
      description: '4 sections with audio recordings',
      colorClasses: 'bg-blue-50 border-blue-200'
    },
    {
      name: 'Reading',
      icon: '📖',
      duration: mockTest.sections.reading.duration,
      description: '3 passages with 40 questions',
      colorClasses: 'bg-green-50 border-green-200'
    },
    {
      name: 'Writing',
      icon: '✍️',
      duration: mockTest.sections.writing.duration,
      description: 'Task 1 and Task 2',
      colorClasses: 'bg-purple-50 border-purple-200'
    },
    {
      name: 'Speaking',
      icon: '🎤',
      duration: mockTest.sections.speaking.duration,
      description: '3 parts with AI examiner',
      colorClasses: 'bg-orange-50 border-orange-200'
    }
  ];

  const totalDuration = sections.reduce((sum, section) => sum + section.duration, 0);

  return (
    <div className="min-h-screen px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-24 py-8 sm:py-12 md:py-16 bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Back Button */}
      <div className="mb-8">
        <Link href="/mock-test" className="text-primary hover:text-red-700 flex items-center space-x-2 transition-colors">
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm sm:text-base font-semibold">Back to Mock Tests</span>
        </Link>
      </div>

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <h1 className="text-3xl md:text-4xl font-black text-gray-900">
              {mockTest.title}
            </h1>
            {mockTest.isPremium && (
              <span className="px-3 py-1 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white text-xs font-bold rounded-full">
                PREMIUM
              </span>
            )}
          </div>
          <p className="text-gray-600 text-lg">{mockTest.description}</p>
        </div>

        {/* Status Banner */}
        {hasInProgressSession && (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="text-3xl">⏳</div>
              <div className="flex-1">
                <h3 className="font-bold text-yellow-900 mb-2">Test In Progress</h3>
                <p className="text-yellow-800 text-sm">
                  You have an ongoing test session. You can resume from where you left off.
                </p>
                <p className="text-yellow-700 text-xs mt-2">
                  Current section: <span className="font-semibold capitalize">{session.currentSection}</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {isCompleted && (
          <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="text-3xl">✅</div>
              <div className="flex-1">
                <h3 className="font-bold text-green-900 mb-2">Test Completed</h3>
                <p className="text-green-800 text-sm">
                  You've completed this mock test. View your results or retake to improve your score.
                </p>
                {session.overallBandScore && (
                  <p className="text-green-700 text-sm mt-2">
                    Your band score: <span className="font-bold text-xl">{session.overallBandScore}</span>
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Test Structure */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-6 sm:p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span>📋</span> Test Structure
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {sections.map((section, index) => (
              <div
                key={index}
                className={`${section.colorClasses} border-2 rounded-lg p-4`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{section.icon}</span>
                  <div>
                    <h3 className="font-bold text-gray-900">{section.name}</h3>
                    <p className="text-sm text-gray-600">{section.duration} minutes</p>
                  </div>
                </div>
                <p className="text-sm text-gray-700">{section.description}</p>
              </div>
            ))}
          </div>

          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <p className="text-gray-700">
              <span className="font-bold text-2xl text-primary">{totalDuration}</span>
              <span className="text-sm ml-2">minutes total</span>
            </p>
          </div>
        </div>

        {/* Equipment Checklist */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-6 sm:p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span>🎯</span> Before You Start
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Quiet Environment</h4>
                <p className="text-sm text-gray-600">Find a quiet place with minimal distractions</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Headphones & Microphone</h4>
                <p className="text-sm text-gray-600">Working headphones for listening and microphone for speaking</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Stable Internet</h4>
                <p className="text-sm text-gray-600">Ensure you have a reliable internet connection</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Time Availability</h4>
                <p className="text-sm text-gray-600">Allocate {totalDuration} minutes without interruptions</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          {isLocked ? (
            <Link
              href="/pricing"
              className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white font-bold rounded-lg transition-all text-center"
            >
              🔒 Upgrade to Premium to Access
            </Link>
          ) : isCompleted ? (
            <>
              <Link
                href={`/mock-test/${id}/results`}
                className="px-8 py-4 bg-primary hover:bg-red-700 text-white font-bold rounded-lg transition-colors text-center"
              >
                📊 View Results
              </Link>
              <Link
                href={`/mock-test/${id}/start`}
                className="px-8 py-4 border-2 border-primary text-primary hover:bg-primary hover:text-white font-bold rounded-lg transition-colors text-center"
              >
                🔄 Retake Test
              </Link>
            </>
          ) : hasInProgressSession ? (
            <Link
              href={`/mock-test/${id}/${session.currentSection || 'listening'}`}
              className="px-8 py-4 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-lg transition-colors text-center"
            >
              ▶️ Resume Test
            </Link>
          ) : (
            <Link
              href={`/mock-test/${id}/start`}
              className="px-8 py-4 bg-primary hover:bg-red-700 text-white font-bold rounded-lg transition-colors text-center"
            >
              🚀 Start Mock Test
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
