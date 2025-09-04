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
    const sessionCookie = await auth.createSessionCookie(idToken, {
      expiresIn: ONE_WEEK,
    });

    cookieStore.set("session", sessionCookie, {
      maxAge: ONE_WEEK,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
    });
  } catch (error) {
    console.error("Error creating session cookie:", error);
    throw error;
  }
}

export async function signIn(params: SignInParams) {
  const { email, idToken, name, uid } = params;
  try {
    const userRecord = await db.collection("users").doc(uid).get();

    if (!userRecord.exists) {
      await db.collection("users").doc(uid).set({
        email,
        name,
        subscriptionTier: 'free',
      });
    }

    await setSessionCookie(idToken);
    
    return {
      success: true,
      message: "Sign in successful",
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      message: "Failed to sign in",
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
