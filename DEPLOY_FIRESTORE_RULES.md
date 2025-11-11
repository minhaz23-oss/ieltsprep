# Deploy Firestore Security Rules

## CRITICAL: Your database is currently UNPROTECTED!

You **MUST** deploy these Firestore security rules immediately to protect your database.

## Quick Deploy (2 minutes)

### Option 1: Firebase Console (Easiest)

1. Go to https://console.firebase.google.com/
2. Select your project: `ieltsprep-a76b4`
3. Click "Firestore Database" in the left sidebar
4. Click the "Rules" tab at the top
5. Copy the entire contents of `firestore.rules` file
6. Paste into the editor
7. Click "Publish"

### Option 2: Firebase CLI

```powershell
# Install Firebase CLI (if not already installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project (if not already done)
firebase init firestore

# Deploy the rules
firebase deploy --only firestore:rules
```

## What These Rules Protect

✅ **Users Collection**
- Users can only read/write their own data
- Users CANNOT modify `subscriptionTier` or `isAdmin` fields
- Only admins can delete users

✅ **Test Results & Progress**
- Users can only access their own test results
- Complete isolation between users

✅ **Subscription Data**
- Users can READ their subscription status
- Only server/admin can WRITE subscriptions
- Prevents users from upgrading themselves to premium

✅ **Payment Records**
- Users can view their payment history
- Only server can create payment records

✅ **Public Content**
- Everyone can read test questions
- Only admins can modify

## Verify Rules Are Active

After deploying, test with:

```javascript
// Try to read another user's data (should fail)
const otherUserDoc = await getDoc(doc(db, 'users', 'OTHER_USER_ID'));
// Should throw: Missing or insufficient permissions
```

## URGENT: Deploy NOW

Without these rules, your database is **COMPLETELY OPEN** - anyone can:
- Read all user data
- Modify subscription tiers
- Delete data
- Access payment information

**Deploy these rules before doing anything else!**
