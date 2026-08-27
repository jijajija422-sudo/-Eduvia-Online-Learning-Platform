"use client";

import Link from "next/link";
import { Search, ShoppingCart, Menu, X, LogIn, User } from "lucide-react";
import { useState } from "react";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="w-full bg-white relative z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1 font-extrabold text-2xl tracking-tight">
            <span className="text-amber-400">e</span>
            <span className="text-slate-800">-learn</span>
          </Link>
          
          {/* Primary Navigation */}
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-500">
            <Link href="/about" className="hover:text-amber-500 transition-colors">
              About
            </Link>
            <Link href="/courses" className="hover:text-amber-500 transition-colors">
              Courses
            </Link>
            <Link href="/blog" className="hover:text-amber-500 transition-colors">
              Blog
            </Link>
            <Link href="/reviews" className="hover:text-amber-500 transition-colors">
              Reviews
            </Link>
            <Link href="/instructors" className="hover:text-amber-500 transition-colors">
              Instructor
            </Link>
          </div>

          {/* Icons and Auth */}
          <div className="hidden md:flex items-center gap-6">
            <button className="text-slate-800 hover:text-amber-500 transition-colors">
              <Search className="h-5 w-5" />
            </button>
            <button className="text-slate-800 hover:text-amber-500 transition-colors">
              <ShoppingCart className="h-5 w-5" />
            </button>
            
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="text-sm font-bold text-slate-800 hover:text-amber-500 transition-colors px-2"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                className="text-sm font-bold bg-amber-400 text-slate-900 hover:bg-amber-500 transition-colors px-6 py-2.5 rounded-full shadow-sm"
              >
                Register
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-4">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-slate-800"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white p-4 absolute top-full left-0 right-0 shadow-lg">
          <div className="flex flex-col gap-4">
            <Link href="/about" className="text-slate-700 font-semibold py-2">
              About
            </Link>
            <Link href="/courses" className="text-slate-700 font-semibold py-2">
              Courses
            </Link>
            <Link href="/blog" className="text-slate-700 font-semibold py-2">
              Blog
            </Link>
            <Link href="/reviews" className="text-slate-700 font-semibold py-2">
              Reviews
            </Link>
            <Link href="/instructors" className="text-slate-700 font-semibold py-2">
              Instructor
            </Link>
            <hr className="border-slate-100 my-2" />
            <Link href="/login" className="flex items-center gap-2 text-slate-700 font-semibold py-2">
              <LogIn className="h-4 w-4" /> Sign In
            </Link>
            <Link href="/register" className="flex items-center gap-2 text-amber-500 font-semibold py-2">
              <User className="h-4 w-4" /> Register
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
