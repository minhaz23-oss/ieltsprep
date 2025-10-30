import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/firebase/admin';
import { getUserFromToken } from '@/lib/auth/server';
import { convertListeningScoreToBand, convertReadingScoreToBand } from '@/lib/utils/bandScore';

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromToken(request);
    
    if (!user) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized'
      }, { status: 401 });
    }

    const { sessionId, section, results } = await request.json();

    if (!sessionId || !section || !results) {
      return NextResponse.json({
        success: false,
        message: 'Missing required fields'
      }, { status: 400 });
    }

    // Verify session belongs to user
    const sessionRef = db.collection('mockTestSessions').doc(sessionId);
    const sessionDoc = await sessionRef.get();

    if (!sessionDoc.exists) {
      return NextResponse.json({
        success: false,
        message: 'Session not found'
      }, { status: 404 });
    }

    const sessionData = sessionDoc.data();
    if (sessionData?.userId !== user.uid) {
      return NextResponse.json({
        success: false,
        message: 'Unauthorized access to session'
      }, { status: 403 });
    }

    // Calculate band score based on section type
    let bandScore = results.bandScore;
    if (!bandScore && results.score !== undefined && results.totalQuestions) {
      if (section === 'listening') {
        bandScore = convertListeningScoreToBand(results.score);
      } else if (section === 'reading') {
        bandScore = convertReadingScoreToBand(results.score, true); // true for Academic
      } else {
        // For writing and speaking, use provided bandScore from AI evaluation
        bandScore = results.bandScore;
      }
    }

    // Prepare section result data
    const sectionResult: any = {
      bandScore: bandScore,
      completedAt: new Date()
    };

    // Only add testId if it exists
    if (results.testId) {
      sectionResult.testId = results.testId;
    }

    // Only add fields that are defined
    if (results.score !== undefined) {
      sectionResult.score = results.score;
    }
    if (results.totalQuestions !== undefined) {
      sectionResult.totalQuestions = results.totalQuestions;
    }
    if (results.answers) {
      sectionResult.answers = results.answers;
    }
    if (results.evaluation) {
      sectionResult.evaluation = results.evaluation;
    }
    if (results.startedAt) {
      sectionResult.startedAt = results.startedAt;
    } else {
      sectionResult.startedAt = new Date();
    }

    // Determine next section
    const sectionOrder = ['listening', 'reading', 'writing', 'speaking'];
    const currentIndex = sectionOrder.indexOf(section);
    const nextSection = currentIndex < sectionOrder.length - 1 
      ? sectionOrder[currentIndex + 1] 
      : null;

    // Prepare update data
    const updateData: any = {
      [`sectionResults.${section}`]: sectionResult,
      currentSection: nextSection,
      updatedAt: new Date()
    };

    // If this is the last section, calculate overall band score and mark as completed
    if (!nextSection) {
      // Use current session data with the new section result
      const sectionResults = {
        ...sessionData?.sectionResults,
        [section]: sectionResult
      };

      // Calculate overall band score (average of all 4 sections)
      const scores = [
        sectionResults.listening?.bandScore,
        sectionResults.reading?.bandScore,
        sectionResults.writing?.bandScore,
        sectionResults.speaking?.bandScore
      ].filter(score => score !== undefined);

      const overallBandScore = scores.length === 4
        ? Math.round((scores.reduce((sum, score) => sum + score, 0) / 4) * 2) / 2 // Round to nearest 0.5
        : 0;

      updateData.status = 'completed';
      updateData.overallBandScore = overallBandScore;
      updateData.completedAt = new Date();
    }

    // Update session with section results
    await sessionRef.update(updateData);

    return NextResponse.json({
      success: true,
      message: 'Section results saved successfully',
      data: {
        bandScore,
        nextSection
      }
    });

  } catch (error) {
    console.error('Error saving section results:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to save section results',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
