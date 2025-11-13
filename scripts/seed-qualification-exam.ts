import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import { QualificationExam, QualificationQuestion } from '../types/qualificationExam';

// Load environment variables
dotenv.config({ path: '.env.local' });

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

// Qualification exam questions
const questions: QualificationQuestion[] = [
  // Grammar Questions
  {
    id: 'q1',
    type: 'multiple-choice',
    category: 'grammar',
    question: 'Choose the correct form: "She _____ to the market every Sunday."',
    options: ['go', 'goes', 'going', 'gone'],
    correctAnswer: 'goes',
    points: 5,
    explanation: 'Simple present tense with third person singular requires "-s" or "-es".'
  },
  {
    id: 'q2',
    type: 'multiple-choice',
    category: 'grammar',
    question: 'Which sentence is correct?',
    options: [
      'I have been living here since five years.',
      'I have been living here for five years.',
      'I am living here since five years.',
      'I lived here for five years.'
    ],
    correctAnswer: 'I have been living here for five years.',
    points: 5,
    explanation: 'Present perfect continuous with "for" indicates duration.'
  },
  {
    id: 'q3',
    type: 'multiple-choice',
    category: 'grammar',
    question: 'If I _____ rich, I would travel the world.',
    options: ['am', 'were', 'was', 'be'],
    correctAnswer: 'were',
    points: 5,
    explanation: 'Second conditional uses "were" for all subjects.'
  },
  {
    id: 'q4',
    type: 'multiple-choice',
    category: 'grammar',
    question: 'The book _____ by millions of people.',
    options: ['reads', 'is reading', 'was read', 'has read'],
    correctAnswer: 'was read',
    points: 5,
    explanation: 'Passive voice in past tense.'
  },
  {
    id: 'q5',
    type: 'multiple-choice',
    category: 'grammar',
    question: 'She asked me _____ I had finished my homework.',
    options: ['that', 'if', 'what', 'which'],
    correctAnswer: 'if',
    points: 5,
    explanation: 'Indirect question uses "if" or "whether".'
  },

  // Vocabulary Questions
  {
    id: 'q6',
    type: 'multiple-choice',
    category: 'vocabulary',
    question: 'The presentation was very _____; everyone stayed engaged.',
    options: ['boring', 'tedious', 'captivating', 'monotonous'],
    correctAnswer: 'captivating',
    points: 5,
    explanation: 'Captivating means holding attention; attracting and holding interest.'
  },
  {
    id: 'q7',
    type: 'multiple-choice',
    category: 'vocabulary',
    question: 'Despite the _____ weather, they decided to go hiking.',
    options: ['pleasant', 'favorable', 'inclement', 'mild'],
    correctAnswer: 'inclement',
    points: 5,
    explanation: 'Inclement means unpleasant, harsh (usually referring to weather).'
  },
  {
    id: 'q8',
    type: 'multiple-choice',
    category: 'vocabulary',
    question: 'The scientist\'s _____ led to a breakthrough discovery.',
    options: ['negligence', 'persistence', 'hesitation', 'indifference'],
    correctAnswer: 'persistence',
    points: 5,
    explanation: 'Persistence means continuing despite difficulty or opposition.'
  },
  {
    id: 'q9',
    type: 'multiple-choice',
    category: 'vocabulary',
    question: 'Her _____ remarks upset everyone at the meeting.',
    options: ['tactful', 'diplomatic', 'inappropriate', 'courteous'],
    correctAnswer: 'inappropriate',
    points: 5,
    explanation: 'Inappropriate means not suitable or proper in the circumstances.'
  },
  {
    id: 'q10',
    type: 'multiple-choice',
    category: 'vocabulary',
    question: 'The company\'s profits have been _____ over the past year.',
    options: ['declining', 'thriving', 'stagnant', 'fluctuating'],
    correctAnswer: 'fluctuating',
    points: 5,
    explanation: 'Fluctuating means varying irregularly; rising and falling.'
  },

  // Reading Comprehension Questions
  {
    id: 'q11',
    type: 'multiple-choice',
    category: 'reading-comprehension',
    question: 'Read: "Climate change poses one of the greatest challenges to humanity. Rising temperatures, extreme weather events, and sea-level rise threaten ecosystems and human livelihoods worldwide."\n\nWhat is the main idea?',
    options: [
      'Climate change causes temperature increases',
      'Climate change is a major global threat',
      'Sea levels are rising worldwide',
      'Extreme weather is becoming more common'
    ],
    correctAnswer: 'Climate change is a major global threat',
    points: 5,
    explanation: 'The passage emphasizes climate change as a major challenge affecting multiple aspects.'
  },
  {
    id: 'q12',
    type: 'multiple-choice',
    category: 'reading-comprehension',
    question: 'Read: "Renewable energy sources like solar and wind power have become increasingly cost-effective. Many countries are now investing heavily in these technologies to reduce their carbon footprint."\n\nAccording to the passage, why are countries investing in renewable energy?',
    options: [
      'To save money on electricity',
      'To reduce carbon emissions',
      'To create new jobs',
      'To become energy independent'
    ],
    correctAnswer: 'To reduce carbon emissions',
    points: 5,
    explanation: 'The passage explicitly states countries invest to "reduce their carbon footprint".'
  },
  {
    id: 'q13',
    type: 'multiple-choice',
    category: 'reading-comprehension',
    question: 'Read: "The digital revolution has transformed how we communicate, work, and access information. However, it has also raised concerns about privacy, screen time, and the digital divide."\n\nWhat is implied about the digital revolution?',
    options: [
      'It only has negative effects',
      'It has both benefits and drawbacks',
      'It mainly affects communication',
      'It has solved most social problems'
    ],
    correctAnswer: 'It has both benefits and drawbacks',
    points: 5,
    explanation: 'The passage presents both positive transformations and negative concerns.'
  },
  {
    id: 'q14',
    type: 'multiple-choice',
    category: 'reading-comprehension',
    question: 'Read: "Exercise not only improves physical health but also enhances mental well-being. Studies show that regular physical activity can reduce stress, anxiety, and depression."\n\nWhat does the passage suggest?',
    options: [
      'Exercise only benefits physical health',
      'Mental health is more important than physical health',
      'Exercise has multiple health benefits',
      'Studies about exercise are unreliable'
    ],
    correctAnswer: 'Exercise has multiple health benefits',
    points: 5,
    explanation: 'The passage mentions both physical and mental health benefits.'
  },
  {
    id: 'q15',
    type: 'true-false',
    category: 'reading-comprehension',
    question: 'Read: "Urban farming initiatives are gaining popularity in cities worldwide. These projects help communities grow fresh produce, reduce food miles, and strengthen neighborhood connections."\n\nTrue or False: Urban farming only benefits food production.',
    options: ['True', 'False'],
    correctAnswer: 'False',
    points: 5,
    explanation: 'The passage mentions multiple benefits: fresh produce, reduced food miles, AND neighborhood connections.'
  },

  // Additional Grammar Questions
  {
    id: 'q16',
    type: 'multiple-choice',
    category: 'grammar',
    question: 'Neither the students nor the teacher _____ ready for the presentation.',
    options: ['is', 'are', 'was', 'were'],
    correctAnswer: 'is',
    points: 5,
    explanation: 'With "neither...nor", the verb agrees with the subject closest to it (teacher - singular).'
  },
  {
    id: 'q17',
    type: 'multiple-choice',
    category: 'grammar',
    question: 'By the time you arrive, I _____ cooking dinner.',
    options: ['finish', 'will finish', 'will have finished', 'have finished'],
    correctAnswer: 'will have finished',
    points: 5,
    explanation: 'Future perfect tense indicates an action completed before a future point.'
  },
  {
    id: 'q18',
    type: 'multiple-choice',
    category: 'grammar',
    question: 'The company, _____ headquarters is in London, operates globally.',
    options: ['whose', 'which', 'that', 'who'],
    correctAnswer: 'whose',
    points: 5,
    explanation: 'Whose indicates possession and is used for both people and things.'
  },
  {
    id: 'q19',
    type: 'multiple-choice',
    category: 'grammar',
    question: 'I wish I _____ more time to study last night.',
    options: ['have', 'had', 'have had', 'had had'],
    correctAnswer: 'had had',
    points: 5,
    explanation: 'Past perfect after "wish" expresses regret about the past.'
  },
  {
    id: 'q20',
    type: 'multiple-choice',
    category: 'grammar',
    question: 'The car needs _____.',
    options: ['to wash', 'washing', 'washed', 'wash'],
    correctAnswer: 'washing',
    points: 5,
    explanation: 'After "need", we use gerund (washing) for passive meaning.'
  },
];

async function seedQualificationExam() {
  try {
    console.log('Starting qualification exam seed...');

    const exam: Omit<QualificationExam, 'id'> = {
      title: 'Premium Access Qualification Exam',
      description: 'Take this English proficiency exam to unlock premium features for free! You need to score 50% or higher to pass. The exam covers grammar, vocabulary, and reading comprehension.',
      duration: 30, // 30 minutes
      passingScore: 50,
      totalPoints: questions.reduce((sum, q) => sum + q.points, 0),
      questions: questions,
      isActive: true,
      createdAt: new Date()
    };

    // Add exam to Firestore
    const examRef = await db.collection('qualificationExams').add(exam);
    
    console.log('✅ Qualification exam created successfully!');
    console.log(`Exam ID: ${examRef.id}`);
    console.log(`Total questions: ${questions.length}`);
    console.log(`Total points: ${exam.totalPoints}`);
    console.log(`Passing score: ${exam.passingScore}%`);
    console.log(`Duration: ${exam.duration} minutes`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding qualification exam:', error);
    process.exit(1);
  }
}

seedQualificationExam();
