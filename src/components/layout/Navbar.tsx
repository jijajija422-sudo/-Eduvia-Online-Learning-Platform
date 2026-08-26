"use client";

import Link from "next/link";
import { BookOpen, Search, Menu, X, LogIn, User, Sun, Moon } from "lucide-react";
import { useState } from "react";
import { useTheme } from "../providers/ThemeProvider";

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isDark, setMode } = useTheme();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and primary navigation */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 text-primary font-bold text-xl">
              <BookOpen className="h-6 w-6" />
              <span>Eduvia</span>
            </Link>
            <div className="hidden md:flex gap-6 text-sm font-medium">
              <Link href="/courses" className="text-muted-foreground hover:text-foreground transition-colors">
                Courses
              </Link>
              <Link href="/categories" className="text-muted-foreground hover:text-foreground transition-colors">
                Categories
              </Link>
              <Link href="/instructors" className="text-muted-foreground hover:text-foreground transition-colors">
                Instructors
              </Link>
            </div>
          </div>

          {/* Search, Theme toggle, and Auth */}
          <div className="hidden md:flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search courses..."
                className="h-9 w-64 rounded-md border border-border bg-muted/50 pl-9 pr-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
              />
            </div>

            <button
              onClick={() => setMode(isDark ? "light" : "dark")}
              className="p-2 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </button>

            {/* TODO: Add auth state check here */}
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-sm font-medium text-foreground hover:text-primary transition-colors px-4 py-2"
              >
                Log in
              </Link>
              <Link
                href="/register"
                className="text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors px-4 py-2 rounded-md shadow-sm"
              >
                Sign up
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-4">
            <button
              onClick={() => setMode(isDark ? "light" : "dark")}
              className="p-2 text-muted-foreground"
            >
              {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 text-foreground"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-border bg-background p-4">
          <div className="flex flex-col gap-4">
            <div className="relative mb-2">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search courses..."
                className="h-10 w-full rounded-md border border-border bg-muted/50 pl-10 pr-4 text-sm outline-none focus:border-primary"
              />
            </div>
            <Link href="/courses" className="text-foreground font-medium py-2">
              Courses
            </Link>
            <Link href="/categories" className="text-foreground font-medium py-2">
              Categories
            </Link>
            <Link href="/instructors" className="text-foreground font-medium py-2">
              Instructors
            </Link>
            <hr className="border-border my-2" />
            <Link href="/login" className="flex items-center gap-2 text-foreground font-medium py-2">
              <LogIn className="h-4 w-4" /> Log in
            </Link>
            <Link href="/register" className="flex items-center gap-2 text-primary font-medium py-2">
              <User className="h-4 w-4" /> Sign up
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
