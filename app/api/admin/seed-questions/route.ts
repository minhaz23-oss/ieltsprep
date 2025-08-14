import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/firebase/admin';
import speakingQuestionsData from '@/data/speaking-questions.json';

interface SpeakingQuestion {
  id: string;
  question: string;
  category: string;
  preparationTime: number;
  responseTime: number;
  difficulty: 'easy' | 'medium' | 'hard';
  cueCard?: {
    points: string[];
  };
}

interface SpeakingPart {
  title: string;
  description: string;
  timeLimit: number;
  preparationTime?: number;
  questions: SpeakingQuestion[];
}

interface SpeakingQuestionsData {
  part1: SpeakingPart;
  part2: SpeakingPart;
  part3: SpeakingPart;
  greetings: {
    initial: string[];
    transitions: {
      part1ToPart2: string;
      part2ToPart3: string;
    };
    conclusion: string[];
  };
}

export async function POST(request: NextRequest) {
  try {
    console.log('🌱 Starting to seed speaking questions...');
    
    const data = speakingQuestionsData as SpeakingQuestionsData;
    
    // Seed questions for each part
    const parts = ['part1', 'part2', 'part3'] as const;
    let totalSeeded = 0;
    
    for (const partKey of parts) {
      const part = data[partKey];
      console.log(`📝 Seeding ${partKey} questions...`);
      
      try {
        // Create part document with metadata
        await db.collection('speakingQuestions').doc(partKey).set({
          title: part.title,
          description: part.description,
          timeLimit: part.timeLimit,
          preparationTime: part.preparationTime || 0,
          totalQuestions: part.questions.length,
          lastUpdated: new Date()
        });
        
        // Create a batch to seed individual questions
        const batch = db.batch();
        
        for (const question of part.questions) {
          const questionRef = db.collection('speakingQuestions').doc(partKey).collection('questions').doc(question.id);
          batch.set(questionRef, {
            ...question,
            createdAt: new Date(),
            isActive: true
          });
        }
        
        await batch.commit();
        totalSeeded += part.questions.length;
        console.log(`✅ Seeded ${part.questions.length} questions for ${partKey}`);
        
      } catch (partError) {
        console.error(`Error seeding ${partKey}:`, partError);
        return NextResponse.json({
          success: false,
          message: `Failed to seed ${partKey}: ${partError instanceof Error ? partError.message : 'Unknown error'}`,
          progress: { completed: partKey, totalSeeded }
        }, { status: 500 });
      }
    }
    
    // Seed greetings and conversation templates
    console.log('💬 Seeding greetings and conversation templates...');
    try {
      await db.collection('speakingQuestions').doc('greetings').set({
        ...data.greetings,
        lastUpdated: new Date()
      });
      console.log('✅ Seeded greetings successfully');
    } catch (greetingsError) {
      console.error('Error seeding greetings:', greetingsError);
      return NextResponse.json({
        success: false,
        message: `Failed to seed greetings: ${greetingsError instanceof Error ? greetingsError.message : 'Unknown error'}`,
        progress: { totalSeeded }
      }, { status: 500 });
    }
    
    // Create some predefined test combinations
    console.log('🎯 Creating predefined test combinations...');
    const testCombinations = [
      {
        id: 'balanced_test_1',
        difficulty: 'mixed',
        title: 'Balanced Practice Test 1',
        description: 'A well-balanced test covering all difficulty levels',
        questions: {
          part1: ['p1_intro_1', 'p1_work_1', 'p1_hobbies_1', 'p1_food_1'],
          part2: ['p2_person_1'],
          part3: ['p3_education_1', 'p3_technology_1']
        },
        createdAt: new Date(),
        isActive: true,
        estimatedDuration: 900 // 15 minutes
      },
      {
        id: 'beginner_test_1',
        difficulty: 'easy',
        title: 'Beginner-Friendly Test 1', 
        description: 'Perfect for those starting their IELTS preparation',
        questions: {
          part1: ['p1_intro_1', 'p1_work_1', 'p1_home_1', 'p1_food_1'],
          part2: ['p2_place_1'],
          part3: ['p3_travel_1']
        },
        createdAt: new Date(),
        isActive: true,
        estimatedDuration: 900
      },
      {
        id: 'advanced_test_1',
        difficulty: 'hard',
        title: 'Advanced Practice Test 1',
        description: 'Challenging questions for advanced learners',
        questions: {
          part1: ['p1_hobbies_2', 'p1_technology_1'],
          part2: ['p2_achievement_1'],
          part3: ['p3_globalization_1', 'p3_society_1', 'p3_innovation_1']
        },
        createdAt: new Date(),
        isActive: true,
        estimatedDuration: 900
      }
    ];
    
    try {
      for (const test of testCombinations) {
        await db.collection('speakingTests').doc(test.id).set(test);
      }
      console.log('✅ Seeded predefined test combinations');
    } catch (testsError) {
      console.error('Error seeding test combinations:', testsError);
      return NextResponse.json({
        success: false,
        message: `Failed to seed test combinations: ${testsError instanceof Error ? testsError.message : 'Unknown error'}`,
        progress: { totalSeeded }
      }, { status: 500 });
    }
    
    // Create metadata document
    console.log('📊 Creating metadata document...');
    try {
      await db.collection('speakingQuestions').doc('metadata').set({
        totalQuestions: {
          part1: data.part1.questions.length,
          part2: data.part2.questions.length,
          part3: data.part3.questions.length
        },
        categories: {
          part1: [...new Set(data.part1.questions.map(q => q.category))],
          part2: [...new Set(data.part2.questions.map(q => q.category))],
          part3: [...new Set(data.part3.questions.map(q => q.category))]
        },
        difficulties: ['easy', 'medium', 'hard'],
        lastSeeded: new Date(),
        version: '1.0.0'
      });
      console.log('📊 Created metadata document');
    } catch (metadataError) {
      console.error('Error creating metadata:', metadataError);
      return NextResponse.json({
        success: false,
        message: `Failed to create metadata: ${metadataError instanceof Error ? metadataError.message : 'Unknown error'}`,
        progress: { totalSeeded }
      }, { status: 500 });
    }
    
    console.log('🎉 Successfully seeded all speaking questions!');
    
    return NextResponse.json({
      success: true,
      message: 'Speaking questions database seeded successfully!',
      data: {
        totalQuestions: totalSeeded,
        breakdown: {
          part1: data.part1.questions.length,
          part2: data.part2.questions.length,
          part3: data.part3.questions.length
        },
        testCombinations: testCombinations.length,
        categories: {
          part1: [...new Set(data.part1.questions.map(q => q.category))],
          part2: [...new Set(data.part2.questions.map(q => q.category))],
          part3: [...new Set(data.part3.questions.map(q => q.category))]
        }
      }
    });

  } catch (error) {
    console.error('❌ Error seeding speaking questions:', error);
    return NextResponse.json({
      success: false,
      message: `Database seeding failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Check if questions are already seeded
    const metadataDoc = await db.collection('speakingQuestions').doc('metadata').get();
    
    if (metadataDoc.exists) {
      const metadata = metadataDoc.data();
      return NextResponse.json({
        success: true,
        message: 'Questions database already exists',
        data: {
          seeded: true,
          lastSeeded: metadata?.lastSeeded,
          totalQuestions: metadata?.totalQuestions,
          version: metadata?.version
        }
      });
    } else {
      return NextResponse.json({
        success: true,
        message: 'Questions database not seeded yet',
        data: {
          seeded: false,
          ready: true
        }
      });
    }

  } catch (error) {
    console.error('Error checking database status:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to check database status',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
