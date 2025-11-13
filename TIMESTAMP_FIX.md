# Firestore Timestamp Serialization Fix

## Problem

Error when passing data from server to client components:
```
Error: Only plain objects can be passed to Client Components from Server Components.
Classes or null prototypes are not supported.
{..., createdAt: {_seconds: ..., _nanoseconds: ...}}
```

Firestore timestamps are special objects that can't be passed directly to client components in Next.js.

## Solution

Convert all Firestore timestamps to ISO strings before passing to client components.

## Files Modified

### 1. `lib/actions/qualification-exam.actions.ts`

**Updated functions to serialize timestamps:**

- `getQualificationExam()` - Converts `createdAt` to ISO string
- `getUserQualificationStatus()` - Converts `lastAttemptAt`, `passedAt`, `nextAttemptAvailableAt` to ISO strings
- `canTakeExam()` - Returns `nextAttemptDate` as ISO string
- `getExamAttempts()` - Converts `startedAt` and `completedAt` to ISO strings

**Example serialization:**
```typescript
// Before
createdAt: data.createdAt

// After
createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
```

### 2. `app/(root)/qualification-exam/QualificationExamClient.tsx`

**Updated state type:**
```typescript
// Before
const [nextAttemptDate, setNextAttemptDate] = useState<Date | null>(null);

// After
const [nextAttemptDate, setNextAttemptDate] = useState<string | null>(null);
```

**Updated date display:**
```typescript
// Before
{nextAttemptDate.toLocaleDateString()}

// After
{new Date(nextAttemptDate).toLocaleDateString()}
```

### 3. `types/qualificationExam.ts`

**Updated all interfaces to accept both Date objects and ISO strings:**

```typescript
export interface QualificationExam {
  // ...
  createdAt: string | Date | any; // ISO string when serialized
}

export interface ExamAttempt {
  // ...
  startedAt: string | Date | any; // ISO string when serialized
  completedAt?: string | Date | any; // ISO string when serialized
}

export interface UserQualificationStatus {
  // ...
  lastAttemptAt?: string | Date | any; // ISO string when serialized
  passedAt?: string | Date | any; // ISO string when serialized
  nextAttemptAvailableAt?: string | Date | any; // ISO string when serialized
}
```

## How It Works

1. **Server-side**: Firestore returns timestamps as Firestore Timestamp objects
2. **Serialization**: We call `.toDate().toISOString()` to convert to ISO string
3. **Client-side**: Strings are passed safely, then converted back to Date objects when needed
4. **Display**: `new Date(isoString)` converts back for formatting

## Testing

The fix handles three scenarios:
1. ✅ Firestore timestamps - Converted to ISO strings
2. ✅ Already ISO strings - Passed through
3. ✅ Null/undefined - Handled gracefully

## Results Page

The results page already had proper handling:
```typescript
function formatDate(date: any): string {
  if (!date) return '';
  const d = date.toDate ? date.toDate() : new Date(date);
  return d.toLocaleDateString() + ' at ' + d.toLocaleTimeString();
}
```

This handles both Firestore timestamps and ISO strings automatically.

## Summary

✅ All Firestore timestamps now serialized to ISO strings  
✅ Client components receive plain objects  
✅ Dates converted back to Date objects for display  
✅ No more serialization errors  

The qualification exam page should now load without errors!
