# IELTS PREP PLATFORM - COMPLETE FUNCTIONALITY DOCUMENTATION

> **Last Updated:** November 17, 2025  
> **Purpose:** Comprehensive guide for testing every functionality in the IELTS Prep platform

---

## Table of Contents

1. [Authentication System](#1-authentication-system)
2. [Homepage & Landing](#2-homepage--landing)
3. [Dashboard](#3-dashboard)
4. [Exercise Modules](#4-exercise-modules)
5. [Mock Tests](#5-mock-tests)
6. [Admin Panel](#6-admin-panel)
7. [Settings](#7-settings)
8. [Pricing Page](#8-pricing-page)
9. [Qualification Exam](#9-qualification-exam)
10. [Tips & Resources](#10-tips--resources)
11. [API Endpoints](#11-api-endpoints)
12. [Special Features](#12-special-features)
13. [User Flows](#13-user-flows)
14. [Testing Checklist](#14-testing-checklist)

---

## 1. AUTHENTICATION SYSTEM

### Sign Up (`/sign-up`)
**Functionality:**
- User registration with email and password
- Form validation using Zod schemas
- Email verification requirement
- Automatic session creation with cookies
- Redirects authenticated users to dashboard

**Test Cases:**
- Valid email and strong password
- Invalid email format
- Weak password
- Duplicate email registration
- Form validation errors

---

### Sign In (`/sign-in`)
**Functionality:**
- Email/password login
- Session management with secure cookies
- Remember me functionality
- Redirect to original page after login
- Forgot password link

**Test Cases:**
- Correct credentials
- Incorrect password
- Non-existent email
- Already authenticated user
- Redirect parameter handling

---

### Forgot Password (`/forgot-password`)
**Functionality:**
- Email-based password reset
- Firebase password reset email
- Success/error messaging
- Email validation
- Rate limiting for security

**Test Cases:**
- Valid registered email
- Non-existent email
- Invalid email format
- Multiple rapid requests
- Email delivery confirmation

---

### Session Management
**Functionality:**
- Server-side session validation
- Cookie-based authentication
- Auto-refresh mechanisms
- Session expiry handling
- Middleware protection for routes

**Protected Routes:**
- `/dashboard`
- `/admin`
- `/exercise/speaking`
- `/mock-test`

---

## 2. HOMEPAGE & LANDING (`/`)

### Sections

#### Hero Section
- Main value proposition display
- Primary CTA buttons (Sign Up / Get Started)
- Visual branding and imagery

#### Practice Mode Section
- Overview of 4 test modules:
  - 📖 Reading Practice
  - 🎧 Listening Practice
  - ✍️ Writing Practice
  - 🗣️ Speaking Practice
- Feature highlights for each module

#### Features Section
- Platform benefits showcase
- Key differentiators
- Social proof elements

#### How It Works
- Step-by-step user journey
- Visual process guide
- Clear next steps

#### Stats Section
- Success metrics
- User achievements
- Performance indicators

#### Pricing Overview
- Plan comparison preview
- Free vs Premium features
- CTA to pricing page

#### FAQ Section
- Common questions about platform
- Detailed answers
- Expandable/collapsible format

#### Final CTA
- Conversion-focused section
- Multiple action buttons
- Trust indicators

**Test Cases:**
- All navigation links work
- CTAs redirect correctly
- Responsive design on all devices
- Images load properly
- Animations function smoothly

---

## 3. DASHBOARD (`/dashboard`)

### User Statistics Display

#### Overview Cards
- **Total Tests**: Aggregate count across all modules
- **Reading Tests**: Count of completed reading tests
- **Listening Tests**: Count of completed listening tests
- **Writing & Speaking**: Combined count

#### Performance Metrics
- **Average Scores** per skill type:
  - Percentage accuracy
  - Band score
  - Number of attempts
- **Best Scores** with:
  - Highest band achieved
  - Percentage accuracy
  - Date achieved

#### Recent Activity
- Timeline of recent test completions
- Test type, score, and timestamp
- Quick access to test details

---

### Premium Status Display

#### Premium Users See:
- ⭐ Premium Member badge
- "Active" status indicator
- Green gradient banner
- Access to all features message

#### Free Users See:
- 🚀 Free Plan indicator
- Upgrade benefits list
- "Unlock Premium Free" CTA
- Link to qualification exam
- Premium feature limitations

---

### Progress Analytics

#### Test History (All Users)
- Filter by test type dropdown
- Recent tests display (limited to 5 for free users)
- Test details: title, difficulty, date, score
- Time spent on each test
- Band score badges with color coding

#### Advanced Analytics (Premium Only)
- **Progress Trends Card:**
  - Overall improvement percentage
  - 30-day performance graph
  - Consistent practice indicators
  
- **Strongest Skill Card:**
  - Best performing module
  - Average band score
  - Difficulty level mastery

- **Focus Area Card:**
  - Weakest skill identification
  - Recommended practice areas
  - Improvement suggestions

- **AI Study Plan:**
  - Weekly focus tasks
  - Target band score tracker
  - Progress percentage to goal
  - Personalized recommendations

#### Limited View (Free Users)
- Shows only first 2 best scores
- Shows only first 2 average scores
- Shows only 5 recent tests
- Upgrade prompts for full access

---

### Quick Actions Grid
Direct links to:
- 📖 Reading Practice
- 🎧 Listening Practice
- ✍️ Writing Practice
- 🗣️ Speaking Practice

---

### Email Verification Banner
**Shown for unverified accounts:**
- Warning message
- "Verify Email" button
- Resend verification email option
- Explanation of limitations

---

## 4. EXERCISE MODULES

### Exercise Hub (`/exercise`)

**Functionality:**
- Module selection interface
- 4 practice categories display
- Feature highlights for each
- "Take Placement Test" option (placeholder)
- Back to homepage button

**Test Cases:**
- All 4 module cards display
- Links navigate correctly
- Responsive layout
- Feature lists accurate

---

## 4.1 READING PRACTICE

### Reading Tests List (`/exercise/reading`)

**Functionality:**
- Multiple IELTS versions (e.g., Reading Test 1, 2, 3...)
- Grouped and collapsible by version
- Individual test cards showing:
  - Test title
  - Time limit (60 minutes)
  - Total questions (40)
  - Test number

**UI Features:**
- Expandable version cards with colored borders
- Hover effects on test cards
- Version badges (#1, #2, etc.)
- Responsive grid layout

**Instructions Section:**
- Time Management tips
- Reading Strategies
- Scoring Tips
- Important Reminders
- Score Band Information (6.0, 7.0, 8.0, 9.0)
- Navigation buttons to other modules

---

### Individual Reading Test (`/exercise/reading/[id]`)

**Functionality:**
- **3 Passages** with increasing difficulty
- **40 Questions Total** (typically 13-14 per passage)
- **60-Minute Timer** (or custom per test)
- **Question Types:**
  - Multiple Choice
  - True/False/Not Given
  - Yes/No/Not Given
  - Matching headings
  - Sentence completion
  - Summary completion
  - Short answer questions

**Test Interface:**
- Passage text display
- Question panel
- Answer input fields
- Timer countdown
- Submit button
- Navigation between passages

**Scoring & Results:**
- Automatic scoring upon submission
- Band score calculation (0-9 scale)
- Percentage accuracy
- Correct/incorrect answer breakdown
- Answer explanations
- Time spent tracking
- Save to dashboard/history

**Band Score Conversion:**
- 39-40 correct = Band 9.0
- 35-36 correct = Band 8.0
- 30-32 correct = Band 7.0
- 23-26 correct = Band 6.0

---

## 4.2 LISTENING PRACTICE

### Listening Tests List (`/exercise/listening`)

**Functionality:**
- Multiple IELTS versions grouped
- Test descriptions and tags
- Audio indicator icons
- 40 questions per test
- 30-minute duration + 10 min transfer time

**Test Card Display:**
- Version grouping
- Test metadata (time, questions)
- Descriptive tags
- Expandable sections

---

### Individual Listening Test (`/exercise/listening/[id]`)

**Functionality:**
- **4 Sections** (10 questions each)
- **Audio Player** with controls:
  - Play/Pause
  - Volume control
  - Progress bar
  - Replay section (if allowed)

**Section Types:**
- **Section 1:** Social conversation (2 speakers)
- **Section 2:** Monologue in social context
- **Section 3:** Academic conversation (up to 4 speakers)
- **Section 4:** Academic monologue

**Question Types:**
- Form completion
- Multiple choice
- Map/Plan/Diagram labeling
- Matching
- Sentence completion
- Short answer

**Test Flow:**
1. Audio plays once for each section
2. Questions follow audio order
3. 10 minutes at end to transfer answers
4. Auto-submission after time expires

**Scoring:**
- Automatic evaluation
- Band score calculation
- Detailed results page
- Performance analytics
- Save to dashboard

**Band Score Conversion:**
- 39-40 correct = Band 9.0
- 35-36 correct = Band 8.0
- 30-32 correct = Band 7.0
- 23-26 correct = Band 6.0

---

## 4.3 WRITING PRACTICE

### Writing Tests List (`/exercise/writing`)

**Functionality:**
- Grouped by IELTS version
- Shows Task 1 and Task 2 combined
- Time allocation display (60 minutes total)
- Test selection interface

---

### Individual Writing Test (`/exercise/writing/[id]`)

**Functionality:**

#### Task 1 (20 minutes, 150+ words)
**Academic:**
- Describe visual information (graphs, charts, diagrams)
- Process description
- Map/Plan comparison

**General Training:**
- Letter writing (formal, semi-formal, informal)

**Features:**
- Task prompt display
- Visual/image display (if applicable)
- Rich text editor
- Word counter (live)
- Timer countdown
- Save draft option

#### Task 2 (40 minutes, 250+ words)
**Essay Types:**
- Opinion essays
- Discussion essays
- Problem-solution essays
- Advantages-disadvantages essays
- Two-part questions

**Features:**
- Essay prompt
- Rich text editor
- Word counter
- Timer
- Save draft

**Submission:**
- Both tasks must be completed
- Warning if word count too low
- Submit button
- Redirect to evaluation/results

---

### Writing Results (`/exercise/writing/[id]/results`)

**AI Evaluation Display:**

#### Overall Score
- **Overall Band Score** (average of Task 1 & 2)
- Visual band indicator

#### Task 1 Score Breakdown
- Band score (0-9)
- **Task Achievement** (0-9)
- **Coherence & Cohesion** (0-9)
- **Lexical Resource** (0-9)
- **Grammatical Range & Accuracy** (0-9)

#### Task 2 Score Breakdown
- Band score (0-9)
- **Task Response** (0-9)
- **Coherence & Cohesion** (0-9)
- **Lexical Resource** (0-9)
- **Grammatical Range & Accuracy** (0-9)

#### Detailed Feedback
- **Strengths:** List of positive aspects
- **Areas for Improvement:** Specific suggestions
- **Grammar Issues:** Common mistakes identified
- **Vocabulary Usage:** Assessment and suggestions
- **Structure Comments:** Organization feedback
- **Overall Advice:** Personalized tips

#### Sample Improvement Text
- Suggested revisions
- Better alternatives for phrases
- Example sentences

**Actions:**
- View original submission
- Download results as PDF
- Retake test
- View dashboard

---

## 4.4 SPEAKING PRACTICE

### Speaking Practice Page (`/exercise/speaking`)

**Requirements:**
- ✅ User must be authenticated
- ✅ Email must be verified
- ✅ Ticket available (or premium user)

**Ticket System:**
- **Free Users:** 1 test per day
- **Premium Users:** Unlimited tests
- Resets at midnight daily
- Ticket counter display

---

### Speaking Test Flow

#### Pre-Test
- Ticket status display
- Confirmation modal (uses 1 ticket)
- System requirements check
- Microphone permission request

#### During Test
**AI-Powered Conversation via VAPI:**
- Real-time voice recognition (Deepgram)
- AI examiner voice (PlayHT - Jennifer)
- Natural conversation flow
- GPT-3.5-turbo for responses

**Part 1: Introduction & Interview (4-5 minutes)**
- Personal questions about:
  - Home/Accommodation
  - Work/Studies
  - Hometown
  - Hobbies
  - Daily routine
- 2-3 sentences per answer expected

**Part 2: Long Turn (3-4 minutes)**
- Cue card topic given
- 1 minute preparation time
- Speak for 1-2 minutes
- Cover all bullet points
- Topics: Describe a person, place, event, object, experience

**Part 3: Discussion (4-5 minutes)**
- Abstract questions related to Part 2
- More analytical responses
- Deeper discussion
- Opinion and speculation

**Test Interface:**
- Live transcription display
- Voice activity indicator
- Timer
- "End Test" button
- Real-time conversation display

---

### Speaking Evaluation

**Scoring Criteria (0-9 each):**
1. **Fluency & Coherence**
   - Speech flow
   - Logical sequencing
   - Use of discourse markers

2. **Lexical Resource**
   - Vocabulary range
   - Appropriate word choice
   - Collocations

3. **Grammatical Range & Accuracy**
   - Sentence structures
   - Grammar accuracy
   - Complex structures usage

4. **Pronunciation**
   - Clarity
   - Word stress
   - Intonation patterns

**Overall Band Score:** Average of 4 criteria

**Results Display:**
- Overall band score (prominent)
- Individual criteria scores
- Strengths list
- Improvements list
- Personalized advice
- Conversation history with timestamps
- Session statistics:
  - Total messages
  - Questions asked
  - Answers given
  - Session duration

**Actions:**
- Start new test (uses another ticket)
- View dashboard
- View conversation transcript
- Download results

---

## 5. MOCK TESTS

### Mock Test Library (`/mock-test`)

**Functionality:**
- Full IELTS simulation tests
- Combines all 4 skills (Listening, Reading, Writing, Speaking)
- Test card display with:
  - Test title
  - Total duration
  - Number of questions
  - Difficulty level
  - Premium badge (if required)

**Access Control:**
- Authentication required
- Premium users: Full access
- Free users: Limited or no access

**Test Cards Show:**
- Test thumbnail
- Description
- Skills covered
- Estimated completion time
- "Start Test" button

---

### Individual Mock Test (`/mock-test/[id]`)

#### Start Page (`/mock-test/[id]/start`)
**Functionality:**
- Test overview
- Total duration breakdown:
  - Listening: 30 minutes
  - Reading: 60 minutes
  - Writing: 60 minutes
  - Speaking: 11-14 minutes
- Instructions and rules
- "Begin Test" button
- Session initialization

---

#### Mock Test Sections

**Section 1: Listening** (`/mock-test/[id]/listening`)
- 4 sections, 40 questions
- 30 minutes + 10 minutes transfer
- Same functionality as individual listening test
- Progress saves automatically
- "Next: Reading" button

**Section 2: Reading** (`/mock-test/[id]/reading`)
- 3 passages, 40 questions
- 60 minutes
- Same functionality as individual reading test
- Progress saves
- "Next: Writing" button

**Section 3: Writing** (`/mock-test/[id]/writing`)
- Task 1 and Task 2
- 60 minutes total
- Same functionality as individual writing test
- Progress saves
- "Next: Speaking" button

**Section 4: Speaking** (`/mock-test/[id]/speaking`)
- AI-powered conversation
- 11-14 minutes
- All 3 parts
- Same functionality as individual speaking test
- "Finish Test" button

---

### Mock Test Results (`/mock-test/[id]/results`)

**Overall Score Display:**
- **Overall Band Score** (average of 4 modules)
- Visual score indicator
- Percentile ranking (if available)

**Individual Module Scores:**
1. **Listening**
   - Band score
   - Correct/Total questions
   - Percentage

2. **Reading**
   - Band score
   - Correct/Total questions
   - Percentage

3. **Writing**
   - Band score
   - Task 1 & 2 scores
   - Criteria breakdown

4. **Speaking**
   - Band score
   - 4 criteria scores
   - Detailed feedback

**Performance Analysis:**
- Strengths across all modules
- Weaknesses identification
- Comparison to target score
- Improvement recommendations
- Study plan suggestions

**Actions:**
- View detailed feedback for each section
- Download full report (PDF)
- Retake test
- Start new mock test
- View dashboard

---

## 6. ADMIN PANEL

### Admin Dashboard (`/admin`)

**Access Control:**
- Requires admin role in Firebase
- Server-side authentication check
- Redirects non-admins

**Functionality:**
- Content management overview
- User statistics
- System health checks
- Migration tools status
- Quick actions menu

**Dashboard Sections:**
- Total users count
- Total tests created
- Recent activity log
- System alerts
- Navigation to sub-pages

---

### Listening Tests Management (`/admin/listening`)

**Functionality:**
- **View All Tests:**
  - List of all listening tests
  - Test metadata display
  - Search and filter
  - Sort by date, difficulty, version

- **Add New Test:**
  - Upload audio file
  - Create 4 sections
  - Add 10 questions per section
  - Question type selection
  - Answer key input
  - Test metadata (title, description, tags)

- **Edit Test:**
  - Modify audio file
  - Edit questions
  - Update answer keys
  - Change metadata

- **Delete Test:**
  - Confirmation modal
  - Permanent deletion
  - Archive option

**Question Management:**
- Multiple choice questions
- Fill-in-the-blank
- Matching questions
- Map/Diagram labeling
- Short answer

---

### Reading Tests Management (`/admin/reading`)

**Functionality:**
- **View All Tests:**
  - List of reading tests
  - Passage previews
  - Question count
  - Difficulty indicators

- **Add New Test:**
  - Add 3 passages
  - Rich text editor for passages
  - Create 40 questions total
  - Question type selection
  - Answer key configuration
  - Explanations for each answer

- **Edit Test:**
  - Modify passages
  - Edit questions
  - Update answer keys
  - Add/remove questions

- **Delete Test:**
  - Confirmation required
  - Cascade deletion warning

**Passage Editor:**
- Rich text formatting
- Image upload support
- Word count
- Preview mode

---

### Writing Tests Management (`/admin/writing`)

**Functionality:**
- **View All Tests:**
  - List of writing prompts
  - Task 1 and Task 2 for each test
  - Preview prompts

- **Add New Test:**
  - Create Task 1 prompt
  - Upload visual (if Academic)
  - Create Task 2 essay question
  - Add sample answers
  - Set evaluation criteria

- **Edit Test:**
  - Modify prompts
  - Update visuals
  - Edit sample answers

- **Delete Test:**
  - Confirmation modal
  - Remove from database

---

### Migration Tools

**Listening Tests Migration** (`/api/admin/migrate-listening-tests`)
- Migrate old format to new structure
- Data validation
- Progress tracking
- Error handling

**Writing Tests Migration** (`/api/admin/migrate-writing-tests`)
- Convert legacy data
- Preserve user results
- Update references

---

## 7. SETTINGS (`/settings`)

### Account Settings

**Personal Information:**
- **Display Name:**
  - Edit name field
  - Save button
  - Validation (min 2 chars)

- **Email Address:**
  - Display current email
  - Change email option
  - Re-verification required
  - Update in Firebase Auth

**Password Management:**
- **Change Password:**
  - Current password field
  - New password field
  - Confirm password field
  - Password strength indicator
  - Submit button

**Email Verification:**
- Verification status badge
- "Verify Email" button (if not verified)
- Resend verification email option
- Countdown timer for resend

**Account Actions:**
- Delete account option (with confirmation)
- Export user data
- Sign out all devices

---

### Preferences (if implemented)
- Theme selection (Light/Dark/Auto)
- Notification preferences
- Language selection
- Time zone settings

---

## 8. PRICING PAGE (`/pricing`)

### Plan Comparison Section

**Billing Toggle:**
- Monthly billing
- Yearly billing (with savings badge)
- Dynamic price display
- Savings calculation

---

### Free Plan Card

**Price:** $0/month

**Features Included:**
- ✅ Unlimited Reading Practice
- ✅ Unlimited Listening Practice
- ✅ Unlimited Writing Practice
- ✅ AI Writing Evaluation
- ✅ Progress Dashboard
- ✅ Performance Analytics
- ✅ Study Recommendations
- ✅ Band Score Tracking

**Limitations:**
- ❌ No Speaking Practice
- ❌ No Full Mock Tests
- ❌ Limited AI Feedback Detail

**CTA:** "Get Started Free"

---

### Premium Plan Card

**Price:** 
- $19.99/month (monthly)
- $199.99/year (yearly - save 17%)

**Features Included:**
- ✅ Everything in Free Plan
- ✅ 🎤 Full Speaking Practice
- ✅ AI Speaking Evaluation
- ✅ 📝 Complete Mock Tests
- ✅ Detailed Performance Reports
- ✅ Advanced Study Plans
- ✅ Priority Support
- ✅ Offline Practice Materials
- ✅ Expert Tips & Strategies
- ✅ Unlimited AI Feedback
- ✅ Custom Study Schedules
- ✅ Certificate of Completion

**Badge:** "🔥 Most Popular"

**CTA:** "Upgrade to Premium"

---

### Feature Comparison Table

**Free Features (Detailed):**
- 📖 **Reading Practice:** Unlimited access to reading comprehension exercises
- 🎧 **Listening Practice:** Complete listening test practice
- ✍️ **Writing Practice:** Task 1 & Task 2 with AI evaluation
- 📊 **Progress Tracking:** Dashboard with analytics

**Premium Exclusive Features:**
- 🎤 **Speaking Practice:** AI-powered speaking simulation
- 📝 **Full Mock Tests:** Complete IELTS simulation
- 🤖 **Advanced AI Feedback:** Detailed analysis with suggestions
- 🎯 **Custom Study Plans:** Personalized schedules

---

### Testimonials Section
- User success stories
- Band scores achieved
- Time taken to improve
- Photos/avatars
- Verified badges

---

### FAQ Section

**Common Questions:**
- What's the difference between Free and Premium?
- Can I cancel my Premium subscription anytime?
- Is the AI evaluation accurate?
- Do you offer refunds?
- How many mock tests are included?
- How does the qualification exam work?

---

### Qualification Exam Banner
**For Non-Premium Users:**
- "Get Premium for FREE!"
- "Take our qualification exam"
- Link to `/qualification-exam`
- Prominent yellow banner at top

---

## 9. QUALIFICATION EXAM (`/qualification-exam`)

### Exam Purpose
- **Goal:** Unlock premium features for free
- **One-time opportunity**
- **Passing score:** 70% or higher
- **Duration:** 30-45 minutes

---

### Exam Structure

**Section 1: Reading Comprehension (40%)**
- 2-3 short passages
- 15-20 questions
- Multiple choice
- True/False/Not Given

**Section 2: Grammar (30%)**
- Sentence correction
- Fill in the blanks
- Error identification
- 15-20 questions

**Section 3: Vocabulary (30%)**
- Synonym/Antonym matching
- Context-based word selection
- Collocation questions
- 15-20 questions

**Total Questions:** 45-60
**Time Limit:** 45 minutes
**Passing Score:** 70% (varies by admin config)

---

### Exam Interface
- Question navigator
- Timer countdown
- Progress bar
- Flag for review
- Submit exam button
- Confirmation before submit

---

### Results Page (`/qualification-exam/results`)

**Pass Result:**
- ✅ Congratulations message
- Final score percentage
- Section breakdown
- "Premium Unlocked!" badge
- Benefits reminder
- Redirect to dashboard

**Fail Result:**
- ❌ Try again message
- Final score percentage
- Section breakdown
- Passing score requirement
- Study recommendations
- "Retake Available In:" timer (24-48 hours)

**Actions After Pass:**
- Automatic premium activation
- Email confirmation
- Dashboard update
- Access to all premium features

---

## 10. TIPS & RESOURCES (`/tips-resources`)

### General IELTS Success Strategies

**Test Preparation Timeline:**
- 3+ months: Comprehensive preparation for beginners
- 2 months: Intensive practice for intermediate
- 1 month: Final review and mock tests
- 1 week: Light practice and relaxation

**Time Management:**
- Practice with strict time limits
- Learn to pace yourself
- Don't spend too long on difficult questions
- Always finish all sections

**Study Materials:**
- Official IELTS practice materials
- Cambridge IELTS books (1-17)
- Online practice platforms
- English newspapers and podcasts

---

### Listening Tips Section

**Key Strategies:**
- Read questions before listening
- Predict possible answers
- Listen for keywords and synonyms
- Don't panic if you miss an answer
- Use the 10-minute transfer time wisely

**Question Types:**
- Multiple Choice: Eliminate wrong options
- Form Completion: Check word limits
- Map/Diagram: Follow directions carefully
- Matching: Listen for specific details

**Practice Exercises:**
- Listen to BBC News daily (10-15 minutes)
- Practice with different English accents
- Use TED Talks for academic listening
- Try dictation exercises
- Watch English movies with subtitles

**Common Mistakes:**
- Writing more than the word limit
- Spelling errors in answers
- Not following instructions exactly
- Focusing too much on one question

---

### Reading Tips Section

**Speed Reading Techniques:**
- **Skimming:** Get the main idea quickly
- **Scanning:** Find specific information
- **Detailed Reading:** For complex questions
- Don't read every word
- Focus on topic sentences

**Question Strategies:**
- Read questions before the passage
- Identify keywords in questions
- Look for paraphrases in the text
- Use context clues for vocabulary

**Time Allocation:**
- Passage 1: 15-17 minutes
- Passage 2: 18-20 minutes
- Passage 3: 20-22 minutes
- Review: 3-5 minutes

**Reading Practice:**
- Read academic articles daily
- Practice with The Guardian, BBC
- Use National Geographic for science
- Read different text types

---

### Writing Tips Section

**Task 1 Structure (Academic - 150+ words):**
1. Introduction (paraphrase the question)
2. Overview (main trends/features)
3. Body 1 (specific details)
4. Body 2 (more specific details)

**Key Vocabulary:** increase, decrease, fluctuate, peak, plateau, significant, gradual, dramatic, steady

**Task 2 Structure (250+ words):**
1. Introduction (background + thesis)
2. Body 1 (main argument + examples)
3. Body 2 (second argument + examples)
4. Conclusion (summarize + opinion)

**Essay Types:** Opinion, Discussion, Problem-Solution, Advantages-Disadvantages

**Time Management:**
- Task 1: 20 minutes max
- Task 2: 40 minutes
- Planning: 5 minutes
- Checking: 3-5 minutes

**Linking Words:**
- However, Nevertheless
- Furthermore, Moreover
- In contrast, On the other hand
- Consequently, Therefore

**Assessment Criteria:**
- Task Achievement (25%)
- Coherence & Cohesion (25%)
- Lexical Resource (25%)
- Grammar & Accuracy (25%)

---

### Speaking Tips Section

**Part 1: Interview (4-5 min)**
- Answer in 2-3 sentences
- Give reasons and examples
- Be natural and friendly
- Don't memorize answers
- **Topics:** Home, work, studies, hobbies, food, travel

**Part 2: Long Turn (3-4 min)**
- 1 minute to prepare
- Speak for 1-2 minutes
- Cover all bullet points
- Use the preparation time wisely
- **Structure:** Introduction → Main points → Experience → Conclusion

**Part 3: Discussion (4-5 min)**
- Give detailed answers
- Express and justify opinions
- Compare and contrast
- Speculate about future
- **Skills:** Analysis, evaluation, hypothesis, comparison

**Fluency & Pronunciation Tips:**
- Speak at a natural pace
- Use fillers appropriately (well, actually, you know)
- Practice word stress and intonation
- Don't worry about perfect accent
- Self-correct when you make mistakes
- Use pausing effectively

**Vocabulary & Grammar:**
- Use a range of vocabulary
- Try complex sentence structures
- Use idiomatic expressions naturally
- Avoid repetition
- Practice collocations
- Use appropriate register

---

### Band Score Guide

**Band 6.0 - Competent User:**
- Generally effective command
- Some inaccuracies and misunderstandings
- Can use fairly complex language

**Band 7.0 - Good User:**
- Good operational command
- Occasional inaccuracies
- Handles complex language well

**Band 8.0 - Very Good User:**
- Very good command
- Few unsystematic inaccuracies
- Handles complex detailed argumentation

**Band 9.0 - Expert User:**
- Full operational command
- Appropriate, accurate and fluent
- Complete understanding

---

### Test Day Success Tips

**Before the Test:**
- Get a good night's sleep (7-8 hours)
- Eat a healthy breakfast
- Arrive 30 minutes early
- Bring required identification
- Review test format briefly
- Stay calm and confident

**During the Test:**
- Read all instructions carefully
- Manage your time effectively
- Don't panic if you don't know an answer
- Check your answers if time permits
- Stay focused throughout

**What to Bring:**
- Valid passport or ID
- Test confirmation email
- Pencils (for Listening & Reading)
- Pen (for Writing)
- Water bottle (if allowed)
- Comfortable clothes

**What NOT to Bring:**
- Mobile phones or electronic devices
- Watches (analog or digital)
- Food or drinks (except water)
- Bags or personal items
- Study materials

---

### Recommended Resources

**Official Materials:**
- IELTS.org official website
- Cambridge IELTS books 1-17
- IELTS Trainer books
- Official IELTS app

**Online Platforms:**
- British Council IELTS
- IDP IELTS preparation
- IELTS Liz (free tips)
- IELTS Simon blog

**Listening Practice:**
- BBC Learning English
- TED Talks
- Podcasts (BBC, NPR)
- YouTube IELTS channels

**Reading Practice:**
- The Guardian
- BBC News
- National Geographic
- Scientific American

**Writing Tools:**
- Grammarly (grammar check)
- Hemingway Editor
- Cambridge Dictionary
- Thesaurus.com

**Speaking Practice:**
- ELSA Speak app
- Pronunciation apps
- Language exchange platforms
- Record yourself speaking

---

## 11. API ENDPOINTS

### Authentication APIs

**`POST /api/auth/refresh-session`**
- Refresh user session token
- Extends session expiry
- Returns new session cookie

**`POST /api/validate-session`**
- Validate current session token
- Returns user data if valid
- Used for protected routes

**`POST /api/clear-session`**
- Logout user
- Clear session cookies
- Invalidate tokens

**`GET /api/check-admin`**
- Verify if user has admin role
- Returns boolean
- Used for admin panel access

---

### Test Management APIs

**`GET /api/reading-tests`**
- Fetch all available reading tests
- Returns array of test metadata
- Public access

**`GET /api/reading-tests/[id]`**
- Fetch specific reading test
- Returns complete test data
- Questions, passages, answers
- Requires authentication

**`GET /api/writing-tests`**
- Fetch all writing tests
- Returns test prompts
- Public access

**`POST /api/analyze-reading-answers`**
- Evaluate reading test submission
- Calculate band score
- Return correct/incorrect breakdown
- Requires authentication

**`POST /api/analyze-listening-answers`**
- Evaluate listening test submission
- Calculate band score
- Return results
- Requires authentication

**`POST /api/evaluate-writing`**
- AI evaluation of writing tasks
- Uses Google AI (Gemini)
- Returns detailed feedback
- Band score for each criteria
- Requires authentication

**`POST /api/evaluate-speaking`**
- AI evaluation of speaking test
- Uses OpenAI GPT
- Returns 4 criteria scores
- Overall band score
- Detailed feedback
- Requires authentication

---

### Mock Test APIs

**`GET /api/mock-tests`**
- Get all mock tests
- Returns test list
- Premium status check

**`GET /api/mock-tests/[id]`**
- Get specific mock test details
- Returns complete test structure
- Requires authentication

**`POST /api/mock-tests/start`**
- Initialize mock test session
- Create progress document
- Return session ID

**`POST /api/mock-tests/save-section`**
- Save progress for a section
- Update Firestore document
- Return success status

---

### Admin APIs

**`GET /api/admin/listening-tests`**
- List all listening tests (admin only)
- Returns complete test data
- Requires admin role

**`POST /api/admin/listening-tests`**
- Create new listening test
- Upload audio
- Add questions
- Requires admin role

**`PUT /api/admin/listening-tests/[id]`**
- Update existing test
- Modify questions, audio
- Requires admin role

**`DELETE /api/admin/listening-tests/[id]`**
- Delete listening test
- Cascade deletion
- Requires admin role

**`POST /api/admin/migrate-listening-tests`**
- Migrate old test format
- Data transformation
- Requires admin role

**`POST /api/admin/migrate-writing-tests`**
- Migrate writing tests
- Update structure
- Requires admin role

---

### Utility APIs

**`GET /api/test-firebase`**
- Test Firebase connection
- Health check endpoint
- Returns connection status

---

## 12. SPECIAL FEATURES

### AI Integration

**Google AI (Gemini) - Writing Evaluation:**
- Task 1 analysis
- Task 2 essay evaluation
- Criteria-based scoring
- Detailed feedback generation
- Grammar and vocabulary assessment

**OpenAI GPT - Speaking Evaluation:**
- Conversation analysis
- Fluency assessment
- Coherence scoring
- Lexical resource evaluation
- Grammatical range analysis
- Pronunciation feedback

**Deepgram - Speech Transcription:**
- Real-time speech-to-text
- Nova-2 model
- English language support
- High accuracy
- Low latency

**PlayHT - Voice Synthesis:**
- AI examiner voice
- Natural-sounding speech
- "Jennifer" voice profile
- Real-time generation

---

### Band Score Calculation System

**Reading & Listening:**
- Direct conversion table
- 40 questions to 9-band scale
- Precise thresholds

**Writing:**
- 4 criteria average
- Task 1 and Task 2 weighted
- Task 2 worth 66% of total
- Half-band increments

**Speaking:**
- 4 criteria scores
- Equal weighting
- Averaged to half-band
- Pronunciation considered

**Overall (Mock Tests):**
- Average of 4 skills
- Rounded to nearest half-band
- Displayed prominently

---

### Progress Tracking System

**Firestore Collections:**
- `users/{userId}/testResults` - All test results
- `users/{userId}/progress` - Statistics
- `users/{userId}/speakingTickets` - Daily tickets
- `mockTestSessions/{sessionId}` - Mock test progress

**Data Stored:**
- Test type and ID
- Completion date/time
- Scores and band scores
- Time spent
- Answers (encrypted)
- Evaluation feedback

**Statistics Calculated:**
- Total tests by type
- Average scores
- Best scores
- Recent activity
- Improvement trends
- Weak areas

---

### Email Verification System

**Firebase Email Verification:**
- Sent on sign-up
- Required for premium features
- Required for speaking tests
- Verification link expires in 1 hour

**Verification Flow:**
1. User signs up
2. Verification email sent
3. User clicks link
4. Email verified in Firebase
5. User can access protected features

**Resend Functionality:**
- Available in settings
- Cooldown period (1 minute)
- Rate limited

**Verification Banners:**
- Dashboard warning
- Settings page reminder
- Speaking page blocker

---

### Speaking Ticket System

**Free Users:**
- 1 ticket per day
- Resets at midnight (user timezone)
- Used when starting speaking test
- No rollover

**Premium Users:**
- Unlimited tickets
- No restrictions
- Instant access

**Ticket Management:**
- Firestore document: `users/{userId}/speakingTickets/daily`
- Fields: `date`, `ticketsUsed`, `maxTickets`
- Automatic reset logic
- Real-time updates

**Ticket Display:**
- Counter on speaking page
- Modal confirmation before use
- Upgrade prompt when depleted

---

### Middleware & Route Protection

**Protected Routes:**
- `/dashboard` - Requires authentication
- `/admin/*` - Requires admin role
- `/exercise/speaking` - Requires authentication + email verification
- `/mock-test` - Requires authentication
- `/settings` - Requires authentication

**Middleware Logic:**
1. Check for session cookie
2. Validate session with Firebase
3. Check user role (if admin route)
4. Check email verification (if required)
5. Redirect or allow access

**Server-Side Checks:**
- `requireAuth()` - Ensures authenticated
- `requireAdmin()` - Ensures admin role
- `isPremiumUser()` - Checks premium status
- `isEmailVerified()` - Checks verification

---

## 13. USER FLOWS

### New User Journey

1. **Land on Homepage** (`/`)
   - View features and benefits
   - Click "Get Started" or "Sign Up"

2. **Sign Up** (`/sign-up`)
   - Enter email and password
   - Submit form
   - Receive verification email

3. **Verify Email**
   - Click link in email
   - Account activated

4. **Dashboard Access** (`/dashboard`)
   - See welcome message
   - View empty statistics
   - See qualification exam prompt

5. **Take Qualification Exam** (`/qualification-exam`) (Optional)
   - Complete exam
   - Pass with 70%+
   - Unlock premium for free

6. **Choose Practice Module** (`/exercise`)
   - Select skill to practice
   - View available tests

7. **Take First Test**
   - Complete test
   - Submit answers
   - View results

8. **View Progress** (`/dashboard`)
   - See updated statistics
   - Track band scores
   - Plan next steps

---

### Premium Upgrade Flow

**Option 1: Paid Upgrade**
1. Free user hits limitation
2. Sees upgrade prompt
3. Clicks "Upgrade to Premium"
4. Views pricing page
5. Selects plan (monthly/yearly)
6. Completes payment
7. Premium activated instantly

**Option 2: Qualification Exam**
1. User sees "Unlock Premium Free" banner
2. Clicks on qualification exam link
3. Reads exam information
4. Takes exam
5. Scores 70%+ to pass
6. Premium automatically activated
7. Receives congratulations email
8. Full access granted

---

### Test Taking Flow

**Individual Test:**
1. Navigate to test category (e.g., `/exercise/reading`)
2. Browse available tests
3. Click on specific test
4. Read instructions
5. Click "Start Test"
6. Timer begins
7. Answer questions
8. Submit answers
9. View instant results
10. Read AI feedback
11. Results saved to dashboard
12. Option to retake or try new test

**Mock Test:**
1. Navigate to `/mock-test`
2. Select mock test
3. Click "Start Test"
4. Complete Listening section (30 min)
5. Complete Reading section (60 min)
6. Complete Writing section (60 min)
7. Complete Speaking section (11-14 min)
8. View overall results
9. Download report
10. Saved to dashboard history

---

## 14. TESTING CHECKLIST

### Authentication Testing

**Sign Up:**
- [ ] Valid email and password creates account
- [ ] Invalid email shows error
- [ ] Weak password rejected
- [ ] Duplicate email shows error
- [ ] Verification email sent
- [ ] Session created after sign up
- [ ] Redirect to dashboard works

**Sign In:**
- [ ] Correct credentials log in successfully
- [ ] Incorrect password shows error
- [ ] Non-existent email shows error
- [ ] Session cookie set correctly
- [ ] Remember me functionality works
- [ ] Redirect to original page works
- [ ] Already logged-in users redirected

**Password Reset:**
- [ ] Valid email sends reset link
- [ ] Non-existent email handled gracefully
- [ ] Reset link expires after time
- [ ] Password successfully updated
- [ ] Can log in with new password

**Session Management:**
- [ ] Session persists across page refreshes
- [ ] Session expires after inactivity
- [ ] Logout clears session
- [ ] Protected routes redirect when not authenticated
- [ ] Middleware blocks unauthorized access

---

### Dashboard Testing

**Statistics Display:**
- [ ] Total tests count correct
- [ ] Tests by type accurate
- [ ] Average scores calculated correctly
- [ ] Best scores show proper data
- [ ] Recent activity displays

**Premium vs Free:**
- [ ] Premium badge shows for premium users
- [ ] Free users see upgrade prompts
- [ ] Limited data for free users (5 tests, 2 scores)
- [ ] Premium users see all data
- [ ] Unlock premium button works

**Analytics:**
- [ ] Progress trends calculate
- [ ] Strongest skill identified
- [ ] Focus areas suggested
- [ ] AI study plan generates
- [ ] Charts/graphs render

**Quick Actions:**
- [ ] All 4 module links work
- [ ] Navigate to correct pages

**Email Verification:**
- [ ] Banner shows for unverified users
- [ ] Resend email works
- [ ] Banner hides after verification

---

### Reading Tests

**Test List:**
- [ ] All tests load
- [ ] Version grouping works
- [ ] Expand/collapse functionality
- [ ] Test cards display correctly
- [ ] Time and question counts accurate

**Individual Test:**
- [ ] All 3 passages load
- [ ] All 40 questions display
- [ ] Question types render correctly
- [ ] Timer counts down
- [ ] Can navigate between passages
- [ ] Submit button works
- [ ] Answers save before submission

**Scoring:**
- [ ] Answers evaluated correctly
- [ ] Band score calculated accurately
- [ ] Percentage correct
- [ ] Results page displays
- [ ] Saved to dashboard
- [ ] Time spent tracked

---

### Listening Tests

**Test List:**
- [ ] All tests load
- [ ] Descriptions and tags show
- [ ] Grouped by version

**Individual Test:**
- [ ] Audio loads and plays
- [ ] Audio controls work (play, pause, volume)
- [ ] Progress bar accurate
- [ ] Questions display per section
- [ ] Timer counts down
- [ ] 10-minute transfer time works
- [ ] Answers save

**Scoring:**
- [ ] Correct answer checking works
- [ ] Band score accurate
- [ ] Results display
- [ ] Saved to dashboard

---

### Writing Tests

**Test List:**
- [ ] All tests load
- [ ] Task details display

**Individual Test:**
- [ ] Task 1 prompt loads
- [ ] Task 2 prompt loads
- [ ] Images display (if applicable)
- [ ] Word counter works in real-time
- [ ] Timer counts down
- [ ] Text editor functional
- [ ] Save draft works
- [ ] Submit button works

**AI Evaluation:**
- [ ] Evaluation processes successfully
- [ ] Band scores accurate
- [ ] Criteria breakdown shows
- [ ] Feedback is relevant and specific
- [ ] Strengths listed
- [ ] Improvements listed
- [ ] Overall advice provided

**Results:**
- [ ] Results page displays
- [ ] Can view original submission
- [ ] Saved to dashboard
- [ ] Retake option works

---

### Speaking Tests

**Pre-Test:**
- [ ] Ticket counter displays
- [ ] Email verification checked
- [ ] Modal confirmation shows
- [ ] Ticket deducted after confirmation
- [ ] Microphone permission requested

**During Test:**
- [ ] AI examiner responds
- [ ] Voice recognition works
- [ ] Transcription displays in real-time
- [ ] All 3 parts covered
- [ ] Questions make sense
- [ ] Timer visible
- [ ] Can end test early

**Evaluation:**
- [ ] Evaluation processes
- [ ] All 4 criteria scores show
- [ ] Overall band score accurate
- [ ] Feedback detailed and relevant
- [ ] Strengths and improvements listed
- [ ] Advice specific

**Post-Test:**
- [ ] Conversation history displays
- [ ] Session stats accurate
- [ ] Results saved to dashboard
- [ ] Can start new test (if tickets available)
- [ ] Premium users have unlimited access

---

### Mock Tests

**Test List:**
- [ ] All mock tests display
- [ ] Premium badge shows correctly
- [ ] Free users see access restrictions
- [ ] Premium users can access

**Full Test Flow:**
- [ ] All 4 sections accessible in order
- [ ] Progress saves between sections
- [ ] Timer for each section correct
- [ ] Cannot skip sections
- [ ] All section functionalities work

**Results:**
- [ ] Overall band score calculated
- [ ] All 4 module scores show
- [ ] Detailed breakdown per section
- [ ] Comparison to target score
- [ ] Recommendations provided
- [ ] Can download report
- [ ] Saved to dashboard

---

### Admin Panel

**Access Control:**
- [ ] Non-admins redirected
- [ ] Admin users can access
- [ ] Server-side check works

**Listening Management:**
- [ ] Can view all tests
- [ ] Can add new test
- [ ] Audio upload works
- [ ] Question creation works
- [ ] Can edit existing test
- [ ] Can delete test
- [ ] Changes reflect immediately

**Reading Management:**
- [ ] Can view all tests
- [ ] Can add passages
- [ ] Rich text editor works
- [ ] Can add questions
- [ ] Answer keys save correctly
- [ ] Can edit/delete

**Writing Management:**
- [ ] Can view all prompts
- [ ] Can create new prompts
- [ ] Image upload works (Task 1)
- [ ] Can edit/delete

**Migration Tools:**
- [ ] Listening migration works
- [ ] Writing migration works
- [ ] Data preserved
- [ ] No data loss

---

### Settings

**Account Settings:**
- [ ] Display name updates
- [ ] Email change works (requires re-verification)
- [ ] Password change works
- [ ] Current password validation
- [ ] Verification status displays
- [ ] Resend verification email works

**Preferences:**
- [ ] Theme selection works (if implemented)
- [ ] Settings save correctly
- [ ] Changes apply immediately

---

### Pricing Page

**Display:**
- [ ] Both plans show correctly
- [ ] Billing toggle works (monthly/yearly)
- [ ] Prices update dynamically
- [ ] Savings calculated correctly
- [ ] Features listed accurately
- [ ] Testimonials display
- [ ] FAQ section works

**CTAs:**
- [ ] Free plan button works
- [ ] Premium upgrade button works
- [ ] Qualification exam link works

---

### Qualification Exam

**Exam Flow:**
- [ ] All questions load
- [ ] Timer works
- [ ] Can navigate between questions
- [ ] Can flag questions for review
- [ ] Submit confirmation modal
- [ ] Cannot go back after submit

**Scoring:**
- [ ] Answers evaluated correctly
- [ ] Percentage calculated
- [ ] Pass/fail determined correctly (70% threshold)

**Results:**
- [ ] Pass result shows congratulations
- [ ] Premium activated automatically
- [ ] Fail result shows retry information
- [ ] Section breakdown displays
- [ ] Retake cooldown enforced

---

### Tips & Resources

**Content:**
- [ ] All sections display
- [ ] Navigation links work
- [ ] Jump to section works (anchor links)
- [ ] Responsive on mobile
- [ ] Images load (if any)
- [ ] External links work

---

### General Testing

**Responsive Design:**
- [ ] Mobile view (< 640px)
- [ ] Tablet view (640-1024px)
- [ ] Desktop view (> 1024px)
- [ ] All elements visible
- [ ] No layout breaks
- [ ] Touch targets adequate on mobile

**Performance:**
- [ ] Pages load quickly (< 3s)
- [ ] Images optimized
- [ ] No console errors
- [ ] API calls efficient
- [ ] Lazy loading works

**Accessibility:**
- [ ] Keyboard navigation works
- [ ] Screen reader compatible
- [ ] Color contrast sufficient
- [ ] Form labels present
- [ ] Error messages clear

**Browser Compatibility:**
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile browsers

**Error Handling:**
- [ ] Network errors handled
- [ ] Invalid data rejected
- [ ] User-friendly error messages
- [ ] Fallback UI shows
- [ ] Can recover from errors

---

## NOTES FOR TESTERS

### Important Test Scenarios

1. **Email Verification Flow:**
   - Sign up → Receive email → Click link → Verify → Access features

2. **Ticket System:**
   - Use free speaking test → Ticket depleted → Wait for reset → New ticket available

3. **Qualification Exam:**
   - Take exam → Pass → Premium activated → Access all features

4. **Mock Test Session:**
   - Start mock test → Complete all 4 sections → View combined results

5. **Admin Functions:**
   - Add test → Verify in user view → Edit test → Delete test

### Edge Cases to Test

- Very long essay submissions (2000+ words)
- Audio playback on slow connections
- Multiple concurrent sessions
- Session expiry during test
- Browser back button during test
- Submit with unanswered questions
- Network disconnection and reconnection
- Multiple devices simultaneously

### Performance Benchmarks

- Page load: < 3 seconds
- API response: < 2 seconds
- AI evaluation: < 30 seconds
- Audio streaming: < 5 second buffer

---

## CONCLUSION

This documentation covers every functionality in the IELTS Prep platform. Use this as your comprehensive testing guide to ensure all features work correctly before deployment.

**Recommended Testing Order:**
1. Authentication (Foundation)
2. Dashboard (Core UI)
3. Individual Test Modules (Reading, Listening, Writing, Speaking)
4. Mock Tests (Integration)
5. Admin Panel (Management)
6. Settings & Qualification Exam (Additional)
7. Edge Cases & Performance

**Good luck with testing!** 🚀
