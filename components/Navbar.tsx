"use client";

import { navigationLinks } from "@/constants";
import Link from "next/link";
import Loader from "./Loader";
import { useAuth } from "@/lib/hooks/useAuth";
import { signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "@/firebase/client";
import { signOut } from "@/lib/actions/auth.actions";
import { useState } from "react";
import { CgMenu, CgClose } from "react-icons/cg";

export default function Navbar() {
  const { user, loading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
    <nav className="w-full h-[60px] border-2 border-primary rounded-lg mt-2 sticky top-0 z-50 flex items-center justify-between px-4 bg-white shadow-md">
      {/* Logo */}
      <div className="flex-shrink-0">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-lg">I</span>
          </div>
          <span className="text-xl font-black text-gray-900">IELTSPrep</span>
        </Link>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:flex items-center space-x-2">
        {navigationLinks.map((link, index) => (
          <Link
            key={index}
            href={link.href}
            className="hover:bg-primary hover:text-white px-3 py-2 rounded-md text-[16px] font-semibold transition-colors duration-200"
          >
            {link.name}
          </Link>
        ))}
      </div>

      {/* Desktop Auth Buttons */}
      <div className="hidden md:flex items-center gap-2">
        {loading ? (
          <Loader />
        ) : user ? (
          <button onClick={handleLogout} className="btn-primary">
            Logout
          </button>
        ) : (
          <>
            <Link href={"/sign-in"} className="btn-secondary">
              Signin
            </Link>
            <Link href={"/sign-up"} className="btn-primary">
              Get started
            </Link>
          </>
        )}
      </div>

      {/* Mobile Menu Button */}
      <div
        className="md:hidden flex items-center cursor-pointer"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        {isMenuOpen ? (
          <CgClose size={24} />
        ) : (
          <CgMenu size={24} />
        )}
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden absolute top-[60px] left-0 w-full bg-white shadow-lg rounded-b-lg flex flex-col items-center space-y-4 py-4 transition-all duration-300 ease-in-out transform ${
          isMenuOpen ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
        }`}
      >
        {isMenuOpen && (
          <>
            {navigationLinks.map((link, index) => (
              <Link
                key={index}
              href={link.href}
              className="hover:bg-primary hover:text-white px-3 py-2 rounded-md text-[16px] font-semibold transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              {link.name}
            </Link>
            ))}
            <div className="flex flex-col items-center gap-4 w-full px-4">
              {loading ? (
                <Loader />
              ) : user ? (
                <button onClick={handleLogout} className="btn-primary w-full">
                  Logout
                </button>
              ) : (
                <>
                  <Link
                    href={"/sign-in"}
                    className="btn-secondary w-full text-center"
                  >
                    Signin
                  </Link>
                  <Link
                    href={"/sign-up"}
                    className="btn-primary w-full text-center"
                  >
                    Get started
                  </Link>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </nav>
  );
}
