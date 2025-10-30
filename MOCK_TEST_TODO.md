# IELTS Mock Test - Remaining Work

## ✅ Completed
1. ✅ Firestore collections (mockTests, mockTestSessions) with security rules
2. ✅ Populated 32 mock tests in Firestore
3. ✅ Band score calculation utilities
4. ✅ API routes (fetch tests, create session, save section results)
5. ✅ Mock Test Library page (/mock-test) with premium controls
6. ✅ Test Overview page (/mock-test/[id])
7. ✅ Pre-test Checklist page (/mock-test/[id]/start)
8. ✅ Section wrapper pages (listening, reading, writing, speaking) with navigation
9. ✅ Section Transition component
10. ✅ Results page (/mock-test/[id]/results)
11. ✅ Session flow logic (create, resume, complete)

## 🔨 TODO - Integration Work

### 1. **Integrate Actual Test Components**
Currently all section pages show placeholder "Integration Pending" UIs. Need to:

#### A. Listening Section Integration
- **File**: `app/(practice)/mock-test/[id]/listening/page.tsx`
- **Task**: Replace placeholder with actual `ListeningTest` component
- **What to do**:
  - Import your existing `ListeningTest` component
  - Pass `testId` from `listeningTestId` state
  - Connect the component's completion callback to `handleTestComplete`
  - Ensure answers are captured and sent to API

#### B. Reading Section Integration
- **File**: `app/(practice)/mock-test/[id]/reading/page.tsx`
- **Task**: Replace placeholder with actual `ReadingTest` component
- **What to do**:
  - Import your existing `ReadingTest` component
  - Pass `testId` from `readingTestId` state
  - Connect the component's completion callback to `handleTestComplete`
  - Ensure answers are captured and sent to API

#### C. Writing Section Integration
- **File**: `app/(practice)/mock-test/[id]/writing/page.tsx`
- **Task**: Replace placeholder with actual `WritingTest` component
- **What to do**:
  - Import your existing `WritingTest` component
  - Pass `testId` from `writingTestId` state
  - Capture both Task 1 and Task 2 responses
  - Send responses to AI for evaluation (get band scores)
  - Connect completion callback to `handleTestComplete`

#### D. Speaking Section Integration
- **File**: `app/(practice)/mock-test/[id]/speaking/page.tsx`
- **Task**: Replace placeholder with VAPI integration
- **What to do**:
  - Import VAPI SDK/component
  - Use `speakingTestId` (VAPI Assistant ID) to start call
  - Record call ID and transcript
  - Get band score from VAPI or your AI evaluation
  - Connect completion callback to `handleTestComplete`

### 2. **Enhanced Results Page**
- **File**: `app/(practice)/mock-test/[id]/results/page.tsx`
- **Optional enhancements**:
  - Show detailed breakdown for each section (e.g., which questions wrong in L/R)
  - Display writing Task 1/Task 2 responses with AI feedback
  - Show speaking transcript with feedback
  - Add performance graphs/charts
  - Export results as PDF
  - Share results functionality

### 3. **Session Management Improvements**
- **Files**: Various API routes
- **Tasks**:
  - Add session timeout logic (auto-fail if user leaves for too long)
  - Add pause/resume functionality with timer preservation
  - Handle browser refresh gracefully (save progress periodically)
  - Add "Exit Test" functionality with confirmation

### 4. **Timer Implementation**
- **All section pages need timers**
- **What to do**:
  - Add countdown timer for each section
  - Auto-submit when time runs out
  - Show warnings (e.g., 5 minutes remaining)
  - Store time spent on each section

### 5. **Answer Review Page** (Optional but useful)
- **New page**: `/mock-test/[id]/review`
- **What to do**:
  - Show all questions with user's answers
  - Highlight correct/incorrect answers (for L/R)
  - Show explanations for answers
  - Compare user's writing/speaking with model answers

### 6. **Mock Test History Page**
- **New page**: `/mock-test/history` or `/dashboard`
- **What to do**:
  - List all completed mock tests
  - Show score trends over time
  - Performance analytics (strengths/weaknesses)
  - Progress tracking toward target band score

### 7. **Firestore Security Rules Refinement**
- **File**: Firestore Rules in Firebase Console
- **Current**: Basic rules in place
- **TODO**:
  - Add rules to prevent session tampering
  - Ensure users can only access their own sessions
  - Add rate limiting for session creation
  - Validate data structure on write

### 8. **Testing & Bug Fixes**
- Test complete flow from start to finish with real components
- Test resume functionality thoroughly
- Test with different user types (free vs premium)
- Test error handling (network failures, timeout, etc.)
- Mobile responsiveness testing
- Cross-browser testing

### 9. **UI/UX Polish**
- Add loading states for all async operations
- Better error messages for users
- Add animations/transitions for better UX
- Accessibility improvements (keyboard navigation, screen readers)
- Add help tooltips/instructions throughout

### 10. **Analytics & Tracking**
- Track mock test starts
- Track completion rates
- Track drop-off points
- Track average scores
- Track time spent per section

## 🚨 Known Issues to Fix

1. **Session state bug**: When session has `currentSection: null` but `status: in_progress`, it breaks resume. (Already fixed in code, but existing sessions in DB need cleanup)
2. **Browser back button**: Navigating back during test might cause issues
3. **Multiple tabs**: User opening test in multiple tabs could cause conflicts

## 📝 Nice-to-Have Features

1. **Practice Mode**: Allow users to practice individual sections without full test
2. **Custom Mock Tests**: Let users create custom tests by selecting specific L/R/W tests
3. **Leaderboard**: Show top scores (with user consent)
4. **Study Reminders**: Email/notifications to remind users to practice
5. **Mock Test Scheduling**: Let users schedule tests for specific times
6. **Mock Test Bundles**: Group related tests (e.g., "Beginner Bundle")
7. **AI Tutor Integration**: Personalized recommendations based on results

## 🔑 Priority Order

**HIGH PRIORITY** (Must do):
1. Integrate actual test components (Listening, Reading, Writing, Speaking)
2. Add timers to all sections
3. Fix session state bug in existing Firestore sessions
4. Test complete flow end-to-end

**MEDIUM PRIORITY** (Should do):
5. Enhanced results page with detailed feedback
6. Session management improvements
7. Mock test history/dashboard
8. UI/UX polish

**LOW PRIORITY** (Nice to have):
9. Answer review page
10. Analytics & tracking
11. Nice-to-have features

---

## 📞 Integration Notes

### Data Flow
```
1. User clicks "Start Test" → Create session in Firestore
2. Navigate to /mock-test/[id]/listening
3. Load actual test component with testId
4. User completes test → Send results to API
5. API saves results, calculates band score
6. Show transition screen
7. Navigate to next section
8. Repeat for all 4 sections
9. After speaking → Calculate overall band score
10. Mark session as completed
11. Redirect to results page
```

### API Endpoints
- `GET /api/mock-tests` - List all tests
- `GET /api/mock-tests/[id]` - Get single test + user's session
- `POST /api/mock-tests/create-session` - Create new session
- `POST /api/mock-tests/save-section` - Save section results

### Firestore Structure
```
mockTests/{testId}
  - title, description, isPremium
  - sections: { listening, reading, writing, speaking }

mockTestSessions/{sessionId}
  - userId, mockTestId
  - status: 'in_progress' | 'completed'
  - currentSection: 'listening' | 'reading' | 'writing' | 'speaking' | null
  - sectionResults: { listening, reading, writing, speaking }
  - overallBandScore
  - createdAt, updatedAt, completedAt
```

Good luck with the remaining work! The skeleton is solid. 🚀
