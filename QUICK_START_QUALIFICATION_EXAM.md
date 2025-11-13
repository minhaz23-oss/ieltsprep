# Quick Start: Qualification Exam

## 🚀 Ready to Launch? Follow These 3 Steps:

### Step 1: Verify Promotion is Active (10 seconds)
Check `lib/actions/qualification-exam.actions.ts` line 9:
```typescript
const PROMO_IS_ACTIVE = true; // Should be true to enable promotion
```

**Note:** The promotion runs indefinitely until you manually set this to `false`. See `HOW_TO_END_PROMO.md` for details.

### Step 2: Seed the Exam (2 mins)
```bash
npm run seed:qualification-exam
```

### Step 3: Deploy Security Rules (1 min)
```bash
firebase deploy --only firestore:rules
```

## ✅ You're Done!

Users can now visit `/qualification-exam` to unlock premium for free!

## 📊 Exam Settings

**Current Configuration:**
- **Questions:** 20 (Grammar, Vocabulary, Reading)
- **Duration:** 30 minutes
- **Passing Score:** 50%
- **Retry Cooldown:** 7 days
- **Promo Duration:** Manual control (no automatic end date)

## 🎯 What Happens Next?

### ✅ Pass (Score ≥ 50%)
- Premium access unlocked immediately
- User gets all premium features for free
- No payment required
- Access persists even after promo ends

### ❌ Fail (Score < 50%)
- Can retry after 7 days
- Unlimited attempts during promo period
- Suggested practice resources shown
- Progress tracked in user profile

## 📍 Add to Navigation

Add this link wherever you want users to see the exam:

```tsx
<Link href="/qualification-exam">
  <Button className="bg-gradient-to-r from-purple-500 to-blue-500">
    🎓 Unlock Premium Free - Limited Time!
  </Button>
</Link>
```

## 🎨 Marketing Copy Ideas

**Homepage Banner:**
```
🎓 Special Launch Offer: Pass Our English Test, Get Premium FREE!
⏰ Only 60 Days Left | No Credit Card Required
```

**Email Subject:**
```
Unlock Premium Features - No Payment Required 🎉
```

**Social Media:**
```
Think you have good English skills? Prove it and get premium access FREE! 
✅ 20-question test
✅ 30 minutes
✅ Pass = Premium forever
🔗 [your-site.com/qualification-exam]
```

## 📈 Track Performance

Monitor in Firebase Console:
- Collection: `examAttempts` - see all attempts
- Collection: `users` - check `qualificationExam` field for pass/fail stats

## 🔥 Pro Tips

1. **Test First:** Take the exam yourself to verify everything works
2. **Announce Early:** Build hype 2-3 days before launch
3. **Create FOMO:** Countdown timer on homepage
4. **Share Success:** Tweet when users pass (with permission)
5. **Collect Feedback:** Ask users about exam difficulty

## ⚡ Emergency Changes

**Make it easier:**
```typescript
const PASSING_SCORE = 40; // Lower from 50%
```

**Extend promo:**
```typescript
const PROMO_DURATION_DAYS = 90; // Extend to 3 months
```

**Reduce cooldown:**
```typescript
const RETRY_COOLDOWN_DAYS = 3; // Down from 7 days
```

## 🆘 Troubleshooting

**"Exam not showing"**
- Check date: Is PROMO_START_DATE in the past?
- Check Firestore: Does `qualificationExams` collection exist?
- Run seed script again if needed

**"Premium not unlocking"**
- Check user profile: `subscriptionTier` should be 'premium'
- Check Firestore rules: Ensure deployed correctly
- Verify user passed: Check `qualificationExam.hasPassed`

## 📚 Full Documentation

See `QUALIFICATION_EXAM_SETUP.md` for complete details.

---

**Ready to launch?** Just follow the 3 steps above and you're live! 🚀
