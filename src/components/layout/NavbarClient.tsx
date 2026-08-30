"use client";

import Link from "next/link";
import { Menu, X, LogIn, User, LayoutDashboard, LogOut } from "lucide-react";
import { useState } from "react";
import type { SessionUser } from "@/types";

interface NavbarClientProps {
  user: SessionUser | null;
}

export function NavbarClient({ user }: NavbarClientProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Dynamic dashboard link based on role
  const getDashboardLink = () => {
    if (!user) return "/";
    switch (user.role) {
      case "ADMIN":
        return "/admin";
      case "INSTRUCTOR":
        return "/instructor";
      case "STUDENT":
        return "/student";
      default:
        return "/";
    }
  };

  return (
    <nav className="w-full bg-white relative z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1 font-extrabold text-2xl tracking-tight">
            <span className="text-amber-500">Eduvia</span>
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
          </div>

          {/* Auth */}
          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-3">
              {!user ? (
                <>
                  <Link
                    href="/login"
                    className="text-sm font-bold text-slate-800 hover:text-amber-500 transition-colors px-2 flex items-center gap-2"
                  >
                    <LogIn className="w-4 h-4" /> Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="text-sm font-bold bg-amber-400 text-slate-900 hover:bg-amber-500 transition-colors px-6 py-2.5 rounded-full shadow-sm"
                  >
                    Register
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href={getDashboardLink()}
                    className="text-sm font-bold text-slate-800 hover:text-amber-500 transition-colors px-2 flex items-center gap-2"
                  >
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </Link>
                  <form action="/api/auth/logout" method="POST">
                    <button
                      type="submit"
                      className="text-sm font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors px-5 py-2.5 rounded-full shadow-sm flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </form>
                </>
              )}
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
            <hr className="border-slate-100 my-2" />
            
            {!user ? (
              <>
                <Link href="/login" className="flex items-center gap-2 text-slate-700 font-semibold py-2">
                  <LogIn className="h-4 w-4" /> Sign In
                </Link>
                <Link href="/register" className="flex items-center gap-2 text-amber-500 font-semibold py-2">
                  <User className="h-4 w-4" /> Register
                </Link>
              </>
            ) : (
              <>
                <Link href={getDashboardLink()} className="flex items-center gap-2 text-slate-700 font-semibold py-2">
                  <LayoutDashboard className="h-4 w-4" /> Dashboard
                </Link>
                <form action="/api/auth/logout" method="POST">
                  <button type="submit" className="flex items-center gap-2 text-red-500 font-semibold py-2 w-full text-left">
                    <LogOut className="h-4 w-4" /> Logout
                  </button>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
