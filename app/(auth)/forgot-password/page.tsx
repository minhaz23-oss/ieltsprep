'use client'

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/firebase/client';
import { Button } from '@/components/ui/button';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import FormField from '@/components/FormField';
import { Form } from '@/components/ui/form';

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
});

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof forgotPasswordSchema>) => {
    setIsLoading(true);
    setError('');
    setSuccess(false);

    try {
      await sendPasswordResetEmail(auth, values.email);
      setSuccess(true);
      form.reset();
    } catch (error: any) {
      let errorMessage = 'Failed to send reset email. Please try again.';

      if (error?.code) {
        switch (error.code) {
          case 'auth/user-not-found':
            errorMessage = 'No account found with this email address.';
            break;
          case 'auth/invalid-email':
            errorMessage = 'Invalid email address.';
            break;
          case 'auth/too-many-requests':
            errorMessage = 'Too many requests. Please try again later.';
            break;
          default:
            errorMessage = error.message || errorMessage;
        }
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

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
        className="object-contain absolute -top-[80px] -left-[76px] z-0 pointer-events-none"
      />
      
      <h2 className="text-[30px] font-black text-center mb-2 relative z-10">
        Reset Your{" "}
        <span className="text-white bg-primary rounded-md inline-block -rotate-3 py-1 px-2">
          Password
        </span>
      </h2>
      
      <p className="text-center text-gray-600 text-sm mb-6">
        Enter your email address and we'll send you a link to reset your password.
      </p>

      {success ? (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <p className="text-green-700 text-sm font-medium">✅ Reset Link Sent!</p>
            <p className="text-green-600 text-xs mt-2">
              If an account exists with this email, you'll receive password reset instructions shortly.
            </p>
            <p className="text-green-600 text-xs mt-1">
              Don't see it? Check your spam folder or verify you entered the correct email.
            </p>
          </div>
          
          <Link href="/sign-in" className="block">
            <Button className="btn-primary w-full">
              Back to Sign In
            </Button>
          </Link>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              label="Email Address"
              placeholder="Enter your email"
              type="email"
            />

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </div>
            )}

            <Button 
              type="submit" 
              className="btn-primary w-full" 
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Sending...
                </div>
              ) : (
                'Send Reset Link'
              )}
            </Button>

            <div className="text-center">
              <Link 
                href="/sign-in" 
                className="text-sm text-primary hover:underline"
              >
                Back to Sign In
              </Link>
            </div>
          </form>
        </Form>
      )}
    </section>
  );
}
