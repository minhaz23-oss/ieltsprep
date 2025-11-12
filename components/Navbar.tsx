"use client";

import { navigationLinks } from "@/constants";
import Link from "next/link";
import Loader from "./Loader";
import { useAuth } from "@/lib/hooks/useAuth";
import { signOut as firebaseSignOut } from "firebase/auth";
import { auth } from "@/firebase/client";
import { signOut } from "@/lib/actions/auth.actions";
import { useState, useRef, useEffect } from "react";
import { CgMenu, CgClose } from "react-icons/cg";
import { FaUserCircle, FaCog, FaChevronDown } from "react-icons/fa";
import { IoLogOut } from "react-icons/io5";
import { MdDashboard } from "react-icons/md";

export default function Navbar() {
  const { user, loading } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  
  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      <div className="hidden md:flex items-center gap-3">
        {loading ? (
          <Loader />
        ) : user ? (
          <>
            {/* Dashboard Button */}
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-primary text-primary hover:bg-primary hover:text-white font-semibold transition-colors"
            >
              <MdDashboard size={18} />
              <span>Dashboard</span>
            </Link>
            
            {/* User Menu Dropdown */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 px-4 py-1 rounded-lg border-2 border-gray-400 hover:border-primary transition-colors"
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white">
                  <FaUserCircle size={18} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-gray-900">{user.name || 'User'}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.subscriptionTier}</p>
                </div>
                <FaChevronDown className={`text-gray-500 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} size={12} />
              </button>
              
              {/* Dropdown Menu */}
              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                  <Link
                    href="/settings"
                    className="flex items-center gap-3 px-4 py-2 hover:bg-gray-100 transition-colors"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <FaCog className="text-gray-600" size={16} />
                    <span className="text-sm font-medium text-gray-900">Settings</span>
                  </Link>
                  
                  <hr className="my-2 border-gray-200" />
                  
                  <button
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center gap-3 px-4 py-2 hover:bg-red-50 transition-colors w-full text-left"
                  >
                    <IoLogOut className="text-red-600" size={16} />
                    <span className="text-sm font-medium text-red-600">Logout</span>
                  </button>
                </div>
              )}
            </div>
          </>
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
                <div className="flex flex-col items-center gap-4 w-full">
                  <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary text-white">
                    <FaUserCircle size={28} />
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{user.name || 'User'}</p>
                  <div className="flex flex-col gap-2 w-full">
                    <Link 
                      href="/dashboard" 
                      className="btn-secondary w-full text-center flex items-center justify-center gap-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <MdDashboard size={18} />
                      Dashboard
                    </Link>
                    <Link 
                      href="/settings" 
                      className="btn-secondary w-full text-center flex items-center justify-center gap-2"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <FaCog size={18} />
                      Settings
                    </Link>
                    <button 
                      onClick={() => {
                        setIsMenuOpen(false);
                        handleLogout();
                      }} 
                      className="btn-primary w-full flex items-center justify-center gap-2"
                    >
                      <IoLogOut size={18} />
                      Logout
                    </button>
                  </div>
                </div>
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
