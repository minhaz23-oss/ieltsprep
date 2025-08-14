'use client';

import Link from "next/link";
import React from "react";
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import FormField from "./FormField";
import { createUserWithEmailAndPassword,signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from "@/firebase/client";
import { useRouter } from "next/navigation"; 
import { signUp,signIn } from "@/lib/actions/auth.actions";

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
  const formSchema = authFormSchema(type);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: ''
    },
  })

  const  onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if(type === 'sign-up') {
        const name = `${values.firstName} ${values.lastName}`;
        const {email,password} = values;
        const userCredentials = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const result = await signUp({
          uid: userCredentials.user.uid,
          email,
          password,
          name: name!,
        });

        if (!result?.success) {
          return;
        }

        router.push("/sign-in");
       
      }else{
const { email, password } = values;
        const userCredentials = await signInWithEmailAndPassword(
          auth,
          email,
          password
        );
        const idToken = await userCredentials.user.getIdToken();

        if (!idToken) {
          console.log(`Failed to get ID token for user: ${userCredentials.user.uid}`);
          return;
        }

        const result = await signIn({
          email,
          idToken,
        });
        
        if (!result?.success) {
          console.log(result.message);
          return;
        }

        console.log("sign in successfully");
        router.push("/");
      }
    } catch (error) {
      window.alert("An error occurred. Please try again later.");
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
      <img
        src="/illustationHeader.png"
        alt="IELTS Preparation"
        className="w-[170px] h-[170px] object-contain absolute -top-[80px] -left-[76px] -z-10"
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
          
          <FormField
            control={form.control}
            name="password"
            label="Password"
            placeholder="Enter your password"
            type="password"
          />
          
          <Button type="submit" className="btn-primary w-full mt-2">
            {isSignIn ? 'Sign In' : 'Sign Up'}
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
        </form>
      </Form>
    </section>
  );
};

export default AuthForm;
