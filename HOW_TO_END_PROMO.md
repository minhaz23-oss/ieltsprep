# How to End the Qualification Exam Promotion

## Quick Guide (30 seconds)

When you want to end the qualification exam promotion after 2-3 months, follow these simple steps:

### Step 1: Edit the configuration file

Open: `lib/actions/qualification-exam.actions.ts`

Find line 9 (near the top):
```typescript
const PROMO_IS_ACTIVE = true; // Set to false to end the promotion
```

Change `true` to `false`:
```typescript
const PROMO_IS_ACTIVE = false; // Set to false to end the promotion
```

### Step 2: Deploy the change

```bash
# Commit and push to your git repository
git add lib/actions/qualification-exam.actions.ts
git commit -m "End qualification exam promotion"
git push

# If using Vercel, it will auto-deploy
# Or manually deploy to your hosting platform
```

## That's it! 🎉

## What happens after you end the promotion?

### ✅ Existing premium users keep their access
- Users who already passed the exam retain premium forever
- Their `subscriptionTier` stays as `'premium'`
- They can continue using all premium features

### 🚫 New users can't take the exam
- The exam page will show "Promotional Period Ended"
- They'll be redirected to `/pricing` to purchase premium
- The qualification exam becomes unavailable

### 🔄 All "Unlock Premium Free" buttons
You may want to update the CTA buttons back to point to `/pricing`:

**Option 1: Quick fix (Recommended)**
Just change the flag - the buttons will still say "Unlock Premium Free" but when users click, they'll see the promo ended message and a link to pricing.

**Option 2: Update button text (Optional)**
If you want to change the button text back to "Upgrade to Premium", edit these files:
- `components/reading/PremiumResultsAnalysis.tsx`
- `components/listening/PremiumResultsAnalysis.tsx`
- `components/writing/PremiumWritingAnalysis.tsx`
- `components/MockTestLibrary.tsx`
- `components/WritingFeedback.tsx`
- `app/(root)/dashboard/page.tsx`
- `app/(practice)/mock-test/[id]/page.tsx`

Change `href="/qualification-exam"` back to `href="/pricing"`
Change button text from "🎓 Unlock Premium For Free" back to "Upgrade to Premium"

## Testing Before Going Live

To test the end of promotion:

1. Set `PROMO_IS_ACTIVE = false` in a test environment
2. Visit `/qualification-exam` 
3. You should see "Promotional Period Ended" message
4. Verify existing premium users still have access
5. Set back to `true` when satisfied

## Restarting the Promotion Later

If you want to run the promotion again in the future:

1. Open `lib/actions/qualification-exam.actions.ts`
2. Change `const PROMO_IS_ACTIVE = false` back to `true`
3. Deploy

## Advanced: Time-based Auto-End (Optional)

If you want automatic expiration on a specific date, replace the configuration:

```typescript
// Set your end date here
const PROMO_END_DATE = new Date('2025-04-13'); // 3 months from now

// Check if before end date
const PROMO_IS_ACTIVE = new Date() < PROMO_END_DATE;
```

This way it will automatically end on April 13, 2025 without you having to manually change it.

## Summary

**Current Setup:** Manual control (no automatic expiration)

**To End Promotion:**
1. Change `PROMO_IS_ACTIVE` from `true` to `false`
2. Deploy

**File to Edit:** `lib/actions/qualification-exam.actions.ts` (line 9)

---

**Need Help?** Just search for `PROMO_IS_ACTIVE` in your codebase - there's only one place to change!
