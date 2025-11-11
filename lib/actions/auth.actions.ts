'use server'
import { auth,db } from '@/firebase/admin';
import { cookies } from "next/headers";

const ONE_WEEK = 60 * 60 * 24 * 7 * 1000;

export async function signUp(params: SignUpParams) {
  const { uid, email, name } = params;
  try {
    const userRecord = await db.collection("users").doc(uid).get();

    if (userRecord.exists) {
      return {
        success: false,
        message: "User already exists. please sign in instead",
      };
    }

    await db.collection("users").doc(uid).set({
      email,
      name,
      subscriptionTier: 'free',
    });

    return {
      success: true,
      message: "Account created successfully. please sign in",
    };
  } catch (e: any) {
    console.log(e);
    if (e.code === "auth/email-already-exists") {
      return {
        success: false,
        message: "Email already in use",
      };
    }
    return {
      success: false,
      message: "Failed to create an account",
    };
  }
}

export async function setSessionCookie(idToken: string) {
  const cookieStore = await cookies();
  try {
    console.log('[setSessionCookie] Creating session cookie with token length:', idToken?.length);
    const sessionCookie = await auth.createSessionCookie(idToken, {
      expiresIn: ONE_WEEK,
    });
    console.log('[setSessionCookie] Session cookie created successfully, length:', sessionCookie?.length);

    cookieStore.set("session", sessionCookie, {
      maxAge: ONE_WEEK,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
    });
    console.log('[setSessionCookie] Session cookie set in browser');
  } catch (error) {
    console.error("[setSessionCookie] Error creating session cookie:", error);
    throw error;
  }
}

export async function signIn(params: SignInParams) {
  const { email, idToken, name, uid } = params;
  
  console.log('[signIn] Starting server-side sign-in for user:', uid);
  
  try {
    // First verify the ID token
    console.log('[signIn] Verifying ID token with length:', idToken?.length);
    const decodedToken = await auth.verifyIdToken(idToken);
    console.log('[signIn] ID token verified successfully for user:', decodedToken.uid);
    
    if (decodedToken.uid !== uid) {
      console.error('[signIn] UID mismatch in token verification');
      return {
        success: false,
        message: 'Authentication token is invalid',
      };
    }
    
    console.log('[signIn] ID token verified, checking user document');
    const userRecord = await db.collection("users").doc(uid).get();

    if (!userRecord.exists) {
      console.log('[signIn] User document does not exist, creating new one');
      await db.collection("users").doc(uid).set({
        email: email || decodedToken.email,
        name: name || decodedToken.name || email?.split('@')[0] || 'User',
        subscriptionTier: 'free',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } else {
      console.log('[signIn] Updating existing user document');
      // Update last sign-in time
      await db.collection("users").doc(uid).update({
        lastSignIn: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    console.log('[signIn] Setting session cookie');
    await setSessionCookie(idToken);
    
    console.log('[signIn] Sign-in process completed successfully');
    return {
      success: true,
      message: "Sign in successful",
    };
  } catch (error: any) {
    console.error('[signIn] Error during sign-in:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to sign in';
    
    if (error?.code) {
      switch (error.code) {
        case 'auth/id-token-expired':
          errorMessage = 'Your session has expired. Please try signing in again.';
          break;
        case 'auth/id-token-revoked':
          errorMessage = 'Your authentication has been revoked. Please sign in again.';
          break;
        case 'auth/invalid-id-token':
          errorMessage = 'Invalid authentication token. Please try again.';
          break;
        case 'permission-denied':
          errorMessage = 'Access denied. Please contact support.';
          break;
        case 'unavailable':
          errorMessage = 'Service temporarily unavailable. Please try again later.';
          break;
        default:
          errorMessage = error.message || errorMessage;
      }
    }
    
    return {
      success: false,
      message: errorMessage,
    };
  }
}

export async function signOut() {
  try {
    const cookieStore = await cookies();

    cookieStore.set("session", "", {
      expires: new Date(0),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
    });

    return {
      success: true,
      message: "Logged out successfully",
    };
  } catch (error) {
    console.error("Error during logout:", error);
    return {
      success: false,
      message: "Failed to sign out",
    };
  }
}

/**
 * Clears invalid or expired session cookies
 * Used when session validation fails
 */
export async function clearInvalidSession() {
  try {
    const cookieStore = await cookies();
    
    cookieStore.set("session", "", {
      expires: new Date(0),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
    });
    
    console.log("Invalid session cookie cleared");
  } catch (error) {
    console.error("Error clearing invalid session:", error);
  }
}
