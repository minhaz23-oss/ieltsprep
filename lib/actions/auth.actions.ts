'use server'
import { auth,db } from '@/firebase/admin';
import { cookies } from "next/headers";

// Session duration: 7 days in milliseconds
const ONE_WEEK = 60 * 60 * 24 * 7 * 1000;
// Session duration: 7 days in seconds (for maxAge)
const ONE_WEEK_SECONDS = 60 * 60 * 24 * 7;

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
    // Create session cookie via Firebase Admin (server-side validation)
    const sessionCookie = await auth.createSessionCookie(idToken, {
      expiresIn: ONE_WEEK,
    });

    // Set HTTP-only cookie (cannot be accessed by JavaScript)
    cookieStore.set("session", sessionCookie, {
      maxAge: ONE_WEEK_SECONDS,
      httpOnly: true,  // XSS protection: cookie cannot be accessed by JavaScript
      secure: process.env.NODE_ENV === "production",  // HTTPS only in production
      path: "/",  // Available site-wide
      sameSite: "lax",  // CSRF protection: cookie sent on same-site requests and top-level navigation
      // Note: "strict" would be more secure but would break OAuth redirects
    });
  } catch (error) {
    console.error("[setSessionCookie] Error creating session cookie:", error);
    throw error;
  }
}

export async function signIn(params: SignInParams) {
  const { email, idToken, name, uid } = params;
  
  try {
    // Verify the Firebase ID token
    const decodedToken = await auth.verifyIdToken(idToken);
    
    if (decodedToken.uid !== uid) {
      return {
        success: false,
        message: 'Authentication token is invalid',
      };
    }
    
    // Get or create user document
    const userRecord = await db.collection("users").doc(uid).get();

    if (!userRecord.exists) {
      // Create new user document
      await db.collection("users").doc(uid).set({
        email: email || decodedToken.email,
        name: name || decodedToken.name || email?.split('@')[0] || 'User',
        subscriptionTier: 'free',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    } else {
      // Update last sign-in time
      await db.collection("users").doc(uid).update({
        lastSignIn: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    // Create and set session cookie
    await setSessionCookie(idToken);
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
