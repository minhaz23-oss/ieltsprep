# Qualification Exam Setup Guide

## Overview
The qualification exam system allows users to unlock premium features for free by passing an English proficiency test. This is a time-limited promotional offer (2 months from launch).

## Features
- ✅ 20-question English proficiency exam (Grammar, Vocabulary, Reading Comprehension)
- ✅ 30-minute time limit
- ✅ 50% passing score required
- ✅ 7-day cooldown between retry attempts
- ✅ Automatic premium unlock upon passing
- ✅ Time-limited promotional period (2 months)
- ✅ Secure server-side validation
- ✅ Firestore security rules to prevent cheating

## Setup Steps

### 1. Configure Promotional Period

Open `lib/actions/qualification-exam.actions.ts` and set your launch date:

```typescript
// Line 8
const PROMO_START_DATE = new Date('2025-01-13'); // Change this to your actual launch date
const PROMO_DURATION_DAYS = 60; // 2 months
```

### 2. Seed the Qualification Exam

Run the seed script to add the exam questions to Firestore:

```bash
npm run seed:qualification-exam
```

This will create:
- A qualification exam with 20 questions
- Questions covering grammar, vocabulary, and reading comprehension
- Total points: 100
- Passing score: 50%

### 3. Deploy Firestore Security Rules

The new security rules have been added to `firestore.rules`. Deploy them:

```bash
firebase deploy --only firestore:rules
```

Key security features:
- Users cannot modify their `qualificationExam` field directly
- Exam attempts are created server-side only
- Users cannot update exam attempts (prevents cheating)
- Only authenticated users can access exam data

### 4. Add Navigation Links

Add a link to the qualification exam in your navigation/dashboard. Example:

```tsx
<Link href="/qualification-exam">
  <Button>🎓 Unlock Premium Free</Button>
</Link>
```

### 5. Update Dashboard (Optional)

Show premium access source on the dashboard. The system already tracks whether premium was obtained via exam or subscription through:

```typescript
userProfile.qualificationExam?.premiumAccessMethod // 'exam' or 'subscription'
```

## User Flow

### For New Users:
1. User visits `/qualification-exam`
2. Sees exam details and promotional countdown
3. Starts exam (30-minute timer begins)
4. Answers 20 multiple-choice questions
5. Submits exam
6. If score ≥ 50%: Premium unlocked! ✅
7. If score < 50%: Must wait 7 days to retry

### For Users Who Failed:
- System shows cooldown timer
- Suggests practice resources
- Can retry after 7 days
- No limit on total attempts during promo period

### After Promotional Period Ends:
- Exam becomes unavailable
- Users who already passed keep their premium access
- New users must use paid subscription

## Admin Features

### View Exam Attempts
Query Firestore `examAttempts` collection to see all attempts:

```javascript
db.collection('examAttempts')
  .orderBy('completedAt', 'desc')
  .get()
```

### Check User Qualification Status
User profiles include qualification data:

```javascript
{
  qualificationExam: {
    hasPassed: boolean,
    attempts: number,
    lastAttemptAt: timestamp,
    passedAt: timestamp,
    premiumAccessMethod: 'exam' | 'subscription',
    nextAttemptAvailableAt: timestamp
  }
}
```

## Configuration Options

### Adjust Passing Score
In `lib/actions/qualification-exam.actions.ts`:

```typescript
const PASSING_SCORE = 50; // Change to 40, 60, etc.
```

### Adjust Retry Cooldown
```typescript
const RETRY_COOLDOWN_DAYS = 7; // Change to 3, 14, etc.
```

### Extend Promotional Period
```typescript
const PROMO_DURATION_DAYS = 60; // Change to 90, 30, etc.
```

## Testing Checklist

- [ ] Run `npm run seed:qualification-exam` successfully
- [ ] Deploy Firestore rules
- [ ] Verify promotional period is active
- [ ] Take the exam as a test user
- [ ] Verify premium unlocked on pass
- [ ] Verify cooldown on fail
- [ ] Check that timer auto-submits at 0:00
- [ ] Verify users can't cheat by modifying Firestore directly
- [ ] Test navigation between questions
- [ ] Check results page displays correctly

## Monitoring

### Key Metrics to Track:
- Exam attempts per day
- Pass rate percentage
- Average score
- Average time to complete
- Retry attempts
- Premium conversions via exam

### Firestore Queries:

**Pass Rate:**
```javascript
const attempts = await db.collection('examAttempts').get();
const passed = attempts.docs.filter(d => d.data().passed).length;
const passRate = (passed / attempts.size) * 100;
```

**Average Score:**
```javascript
const scores = attempts.docs.map(d => d.data().score);
const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
```

## Troubleshooting

### Exam Not Showing Up
- Check promotional period dates
- Verify exam was seeded: Check Firestore `qualificationExams` collection
- Ensure `isActive: true` on the exam document

### User Can't Retake Exam
- Check `nextAttemptAvailableAt` field in user profile
- Verify 7 days have passed since last attempt
- Check if user already passed (can't retake if passed)

### Premium Not Unlocking
- Verify `subscriptionTier` updated to 'premium'
- Check `isPremiumUser()` function in `lib/utils/premium.ts`
- Ensure Firestore rules allow server updates

### Timer Not Working
- Check browser console for errors
- Verify exam duration is set correctly
- Test with shorter duration for debugging

## Future Enhancements

Consider adding:
- Different difficulty levels
- Detailed answer explanations after completion
- Performance breakdown by category (grammar/vocab/reading)
- Certificates for passing users
- Leaderboard for top scorers
- Question pool randomization
- Time bonuses for fast completion

## Support

If users report issues:
1. Check Firestore `examAttempts` collection for their attempt
2. Verify their user profile `qualificationExam` field
3. Check promotional period status
4. Review browser console for client-side errors
5. Check server logs for API errors

## Marketing Suggestions

Promote the qualification exam with:
- "🎓 Unlock Premium Free - Limited Time!"
- "Prove Your English Skills, Get Premium Access"
- "Only {X} Days Left - Free Premium Offer"
- Countdown timer on homepage
- Email campaigns to existing free users
- Social media posts highlighting success stories

---

**Note:** Remember to adjust the `PROMO_START_DATE` before going live!
