"use client";

import { navigationLinks } from "@/constants";
import Link from "next/link";
import Loader from "./Loader";
import { useAuth } from "@/lib/hooks/useAuth";
import { signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "@/firebase/client";
import { signOut } from "@/lib/actions/auth.actions";

export default function Navbar() {
  
 const { user, loading } = useAuth();

 const handleLogout = async () => {
    try {
      // Sign out from Firebase Auth (client-side)
      await firebaseSignOut(auth);
      
      // Clear server-side session
      const result = await signOut();
      
      if (result.success) {
        // Redirect to home page after successful logout
        window.location.href = "/";
      } else {
        console.error("Server sign out failed:", result.message);
        // Even if server signout fails, client signout succeeded, so redirect anyway
        window.location.href = "/";
      }
    } catch (error) {
      console.error("Error signing out:", error);
      // Even if there's an error, try to redirect to clear the state
      window.location.href = "/";
    }
  };
  return (
    <nav className=" w-full h-[60px] border-2 border-primary rounded-lg mt-2  sticky top-0 z-50 flex items-center     justify-between px-4 bg-white shadow-md">
      <div className="flex-shrink-0">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-lg">I</span>
          </div>
          <span className="text-xl font-black text-gray-900">IELTSPrep</span>
        </div>
      </div>
      <div>
        {navigationLinks.map((link,index) => (
          <Link
            key={index}
            href={link.href}
            className=" hover:bg-primary hover:text-white px-3 py-2 rounded-md text-[16px] font-semibold transition-colors duration-200"
          >
            {link.name}
          </Link>
        ))}
      </div>
      {loading ? (<Loader /> ): user ? (
        <button onClick={handleLogout} className="btn-primary">Logout</button>
      ): (

      <div className=" flex items-center gap-2">
        <Link href={'/sign-in'} className="btn-secondary">Signin</Link>
        <Link href={'/sign-up'} className="btn-primary">Get started</Link>
      </div>
      )}
    </nav>
  );
}
