import { db } from '../firebase/admin';
import speakingQuestionsData from '../data/speaking-questions.json';

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

async function seedSpeakingQuestions() {
  try {
    console.log('🌱 Starting to seed speaking questions...');
    
    const data = speakingQuestionsData as SpeakingQuestionsData;
    
    // Seed questions for each part
    const parts = ['part1', 'part2', 'part3'] as const;
    
    for (const partKey of parts) {
      const part = data[partKey];
      console.log(`📝 Seeding ${partKey} questions...`);
      
      // Create part document with metadata
      await db.collection('speakingQuestions').doc(partKey).set({
        title: part.title,
        description: part.description,
        timeLimit: part.timeLimit,
        preparationTime: part.preparationTime || 0,
        totalQuestions: part.questions.length,
        lastUpdated: new Date()
      });
      
      // Seed individual questions
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
      console.log(`✅ Seeded ${part.questions.length} questions for ${partKey}`);
    }
    
    // Seed greetings and conversation templates
    console.log('💬 Seeding greetings and conversation templates...');
    await db.collection('speakingQuestions').doc('greetings').set({
      ...data.greetings,
      lastUpdated: new Date()
    });
    
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
        }
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
        }
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
        }
      }
    ];
    
    for (const test of testCombinations) {
      await db.collection('speakingTests').doc(test.id).set({
        ...test,
        createdAt: new Date(),
        isActive: true,
        estimatedDuration: 900 // 15 minutes
      });
    }
    
    console.log('✅ Seeded predefined test combinations');
    
    // Create metadata document
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
    console.log('🎉 Successfully seeded all speaking questions!');
    
    // Print summary
    console.log('\n📈 Seeding Summary:');
    console.log(`Part 1: ${data.part1.questions.length} questions`);
    console.log(`Part 2: ${data.part2.questions.length} questions`);
    console.log(`Part 3: ${data.part3.questions.length} questions`);
    console.log(`Total: ${data.part1.questions.length + data.part2.questions.length + data.part3.questions.length} questions`);
    console.log(`Test combinations: ${testCombinations.length}`);
    
  } catch (error) {
    console.error('❌ Error seeding speaking questions:', error);
    throw error;
  }
}

// Function to create a random test session
export async function generateRandomTestSession(difficulty: 'easy' | 'medium' | 'hard' | 'mixed' = 'mixed'): Promise<{
  sessionId: string;
  questions: {
    part1: SpeakingQuestion[];
    part2: SpeakingQuestion[];
    part3: SpeakingQuestion[];
  };
  totalEstimatedTime: number;
}> {
  try {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Get questions from database
    const part1Questions: SpeakingQuestion[] = [];
    const part2Questions: SpeakingQuestion[] = [];
    const part3Questions: SpeakingQuestion[] = [];
    
    // Fetch questions for each part
    for (const part of ['part1', 'part2', 'part3']) {
      const questionsSnapshot = await db.collection('speakingQuestions').doc(part).collection('questions').get();
      const questions = questionsSnapshot.docs.map(doc => doc.data() as SpeakingQuestion);
      
      // Filter by difficulty if specified
      const filteredQuestions = difficulty === 'mixed' 
        ? questions 
        : questions.filter(q => q.difficulty === difficulty);
      
      if (part === 'part1') {
        // Select 4-5 questions for Part 1
        const selected = selectRandomQuestions(filteredQuestions, 5);
        part1Questions.push(...selected);
      } else if (part === 'part2') {
        // Select 1 question for Part 2
        const selected = selectRandomQuestions(filteredQuestions, 1);
        part2Questions.push(...selected);
      } else if (part === 'part3') {
        // Select 2-3 questions for Part 3
        const selected = selectRandomQuestions(filteredQuestions, 3);
        part3Questions.push(...selected);
      }
    }
    
    // Calculate total estimated time
    const totalEstimatedTime = [
      ...part1Questions,
      ...part2Questions, 
      ...part3Questions
    ].reduce((total, q) => total + q.responseTime + q.preparationTime, 0);
    
    return {
      sessionId,
      questions: {
        part1: part1Questions,
        part2: part2Questions,
        part3: part3Questions
      },
      totalEstimatedTime
    };
    
  } catch (error) {
    console.error('Error generating random test session:', error);
    throw error;
  }
}

function selectRandomQuestions(questions: SpeakingQuestion[], count: number): SpeakingQuestion[] {
  const shuffled = [...questions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, questions.length));
}

// Run the seeding if this file is executed directly
if (require.main === module) {
  seedSpeakingQuestions()
    .then(() => {
      console.log('✅ Database seeding completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Database seeding failed:', error);
      process.exit(1);
    });
}

export default seedSpeakingQuestions;
