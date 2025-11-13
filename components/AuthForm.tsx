'use client';

import Link from "next/link";
import Image from "next/image";
import React from "react";
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import FormField from "./FormField";
import { createUserWithEmailAndPassword,signInWithEmailAndPassword,GoogleAuthProvider,signInWithPopup,sendEmailVerification } from 'firebase/auth';
import { auth } from "@/firebase/client";
import { useRouter, useSearchParams } from "next/navigation"; 
import { signUp,signIn } from "@/lib/actions/auth.actions";
import { FcGoogle } from "react-icons/fc";

const authFormSchema = (type: FormType) => z.object({
    // Sign up
    firstName: type === 'sign-in' ? z.string().optional() : z.string().min(3, { message: 'atleast 3 character' }),
    lastName: type === 'sign-in' ? z.string().optional() : z.string().min(3, { message: 'at least 3 character' }),

    // Both
    email: z.string().email({ message: 'Please enter a valid email.' }),
    password: z.string().min(8, { message: ' at least 8 characters.' }),
})

const AuthForm = ({ type }: { type: FormType }) => {
  const isSignIn = type === "sign-in";
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';
  const formSchema = authFormSchema(type);
  
  // Loading and error states
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string>('');
  const [verificationSent, setVerificationSent] = React.useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: ''
    },
  })

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setError('');
    
    try {
      if (type === 'sign-up') {
        const name = `${values.firstName} ${values.lastName}`;
        const { email, password } = values;
        
        const userCredentials = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        
        // Create user document in Firestore first
        const result = await signUp({
          uid: userCredentials.user.uid,
          email,
          password,
          name: name!,
        });

        if (!result?.success) {
          setError(result?.message || 'Failed to create account');
          return;
        }

        // Send email verification (this may fail silently if not configured)
        try {
          await sendEmailVerification(userCredentials.user);
          console.log('✅ Verification email sent successfully');
          console.log('Check your email inbox (and spam folder) for the verification link');
        } catch (emailError: any) {
          console.error('⚠️ Failed to send verification email:', emailError);
          console.error('Error details:', emailError.code, emailError.message);
          // Don't block sign-up if email fails - user can resend later
        }

        // Show success message with verification notice
        setVerificationSent(true);
        
        // Redirect to sign-in after 4 seconds (give user time to read message)
        setTimeout(() => {
          router.push("/sign-in?verified=false");
        }, 4000);
       
      } else {
        // Sign-in process
        const { email, password } = values;
        
        const userCredentials = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        
        const idToken = await userCredentials.user.getIdToken();

        if (!idToken) {
          setError('Authentication failed. Please try again.');
          return;
        }
        const result = await signIn({
          email,
          idToken,
          uid: userCredentials.user.uid,
        });
        
        if (!result?.success) {
          setError(result?.message || 'Sign in failed. Please try again.');
          return;
        }
        
        // Small delay to ensure session cookie is set
        setTimeout(() => {
          router.push(redirectTo);
        }, 100);
      }
    } catch (error: any) {
      console.error('[AuthForm] Authentication error:', error);
      
      // Handle specific Firebase errors
      let errorMessage = 'An error occurred. Please try again.';
      
      if (error?.code) {
        switch (error.code) {
          case 'auth/user-not-found':
            errorMessage = 'No account found with this email.';
            break;
          case 'auth/wrong-password':
            errorMessage = 'Incorrect password.';
            break;
          case 'auth/invalid-email':
            errorMessage = 'Invalid email address.';
            break;
          case 'auth/user-disabled':
            errorMessage = 'This account has been disabled.';
            break;
          case 'auth/email-already-in-use':
            errorMessage = 'An account with this email already exists.';
            break;
          case 'auth/weak-password':
            errorMessage = 'Password should be at least 6 characters.';
            break;
          case 'auth/network-request-failed':
            errorMessage = 'Network error. Please check your connection.';
            break;
          case 'auth/too-many-requests':
            errorMessage = 'Too many attempts. Please try again later.';
            break;
          default:
            errorMessage = error.message || errorMessage;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section
      className="w-full max-w-md mx-auto mt-20 p-6 bg-white rounded-lg shadow-md relative"
      style={{
        boxShadow:
          "0 0 20px rgba(227, 24, 55, 0.3), 0 0 40px rgba(227, 24, 55, 0.1)",
      }}
    >
      <Image
        src="/illustrationHeader.png"
        alt="IELTS Preparation"
        width={170}
        height={170}
        className="object-contain absolute -top-[80px] -left-[76px] -z-10"
      />
      <h2 className="text-[30px] font-black text-center mb-6">
        {isSignIn ? "SignIn" : "SignUp"} to{" "}
        <span className="text-white bg-primary rounded-md inline-block -rotate-3 py-1 px-2">
          IELTSPrep
        </span>
      </h2>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          {!isSignIn && (
            <div className="flex gap-4">
              <FormField
                control={form.control}
                name="firstName"
                label="First Name"
                placeholder="Enter your first name"
                className="flex-1"
              />
              <FormField
                control={form.control}
                name="lastName"
                label="Last Name"
                placeholder="Enter your last name"
                className="flex-1"
              />
            </div>
          )}
          
          <FormField
            control={form.control}
            name="email"
            label="Email"
            placeholder="Enter your email"
            type="email"
          />
          
          <div>
            <FormField
              control={form.control}
              name="password"
              label="Password"
              placeholder="Enter your password"
              type="password"
            />
            {isSignIn && (
              <div className="text-right mt-1">
                <Link href="/forgot-password" className="text-xs text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
            )}
          </div>
          
          {/* Success Message - Email Verification Sent */}
          {verificationSent && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3">
              <p className="text-green-700 text-sm font-medium">✅ Account created successfully!</p>
              <p className="text-green-600 text-xs mt-1">
                We've sent a verification email to your inbox. Please verify your email before signing in.
              </p>
            </div>
          )}
          
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>
          )}
          
          <Button type="submit" className="btn-primary w-full mt-2" disabled={isLoading}>
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                {isSignIn ? 'Signing In...' : 'Signing Up...'}
              </div>
            ) : (
              isSignIn ? 'Sign In' : 'Sign Up'
            )}
          </Button>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          
        </form>
      </Form>
      <Button 
        variant="outline" 
        className="w-full border border-gray-500 font-semibold hover:bg-gray-300 cursor-pointer" 
        disabled={isLoading}
        onClick={async() => {
          setIsLoading(true);
          setError('');
          
          const provider = new GoogleAuthProvider();
          try {
            const userCredentials = await signInWithPopup(auth, provider);
            const idToken = await userCredentials.user.getIdToken();
    
            if (!idToken) {
              setError('Google authentication failed. Please try again.');
              return;
            }
            const result = await signIn({
              email: userCredentials.user.email!,
              idToken,
              name: userCredentials.user.displayName || undefined,
              uid: userCredentials.user.uid,
            });
            
            if (!result?.success) {
              setError(result?.message || 'Google sign in failed. Please try again.');
              return;
            }
            
            // Small delay to ensure session cookie is set
            setTimeout(() => {
              router.push(redirectTo);
            }, 100);
          } catch (error: any) {
            console.error('[AuthForm] Google authentication error:', error);
            
            let errorMessage = 'Google sign-in failed. Please try again.';
            if (error?.code) {
              switch (error.code) {
                case 'auth/popup-blocked':
                  errorMessage = 'Popup was blocked. Please allow popups for this site.';
                  break;
                case 'auth/popup-closed-by-user':
                  errorMessage = 'Sign-in was cancelled.';
                  break;
                case 'auth/network-request-failed':
                  errorMessage = 'Network error. Please check your connection.';
                  break;
                default:
                  errorMessage = error.message || errorMessage;
              }
            }
            
            setError(errorMessage);
          } finally {
            setIsLoading(false);
          }
        }}>
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                Signing in...
              </div>
            ) : (
              <>
                <FcGoogle className="mr-2 h-4 w-4" />
                Google
              </>
            )}
          </Button>
          
          {isSignIn ? (
            <p className="text-center text-sm mt-4">
              Don't have an account?{" "}
              <Link href="/sign-up" className="text-primary underline">
                Sign Up
              </Link>
            </p>
          ) : (
            <p className="text-center text-sm mt-4">
              Already have an account?{" "}
              <Link href="/sign-in" className="text-primary underline">
                Sign In
              </Link>
            </p>
          )}
    </section>
  );
};

export default AuthForm;
