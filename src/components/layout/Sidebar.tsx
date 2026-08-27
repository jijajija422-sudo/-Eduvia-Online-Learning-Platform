"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  BookOpen, 
  LayoutDashboard, 
  CheckSquare, 
  Award, 
  MessageSquare,
  CalendarDays,
  Bookmark,
  FileText,
  Users,
  BarChart,
  UserPlus,
  Settings,
  Headphones,
  Send,
  Menu,
  X,
  LogOut,
  Calendar,
  Layers
} from "lucide-react";
import { useState } from "react";

export type SidebarRole = "ADMIN" | "INSTRUCTOR" | "STUDENT";

interface SidebarProps {
  role: SidebarRole;
  user?: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

const studentLinks = [
  { name: "Dashboard", href: "/student", icon: LayoutDashboard },
  { name: "My Courses", href: "/student/my-learning", icon: BookOpen },
  { name: "Study Plan", href: "/student/plan", icon: Calendar },
  { name: "Assignments", href: "/student/assignments", icon: FileText },
  { name: "Quizzes", href: "/student/quizzes", icon: CheckSquare },
  { name: "Certificates", href: "/student/certificates", icon: Award },
  { name: "Messages", href: "/student/messages", icon: MessageSquare },
  { name: "Calendar", href: "/student/calendar", icon: CalendarDays },
  { name: "Bookmarks", href: "/student/bookmarks", icon: Bookmark },
  { name: "Notes", href: "/student/notes", icon: FileText },
];

const teachingLinks = [
  { name: "My Classes", href: "/instructor/courses", icon: BookOpen },
  { name: "Students", href: "/instructor/students", icon: Users },
  { name: "Assignments", href: "/instructor/assignments", icon: FileText },
  { name: "Reports", href: "/instructor/analytics", icon: BarChart },
];

const adminLinks = [
  { name: "Users", href: "/admin/users", icon: UserPlus },
  { name: "Courses", href: "/admin/courses", icon: BookOpen },
  { name: "Invite Instructors", href: "/admin/instructor-invites", icon: Send },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export function Sidebar({ role, user }: SidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  const renderLinks = (links: any[]) => {
    return links.map((link) => {
      const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
      const Icon = link.icon;
      
      return (
        <Link
          key={link.name}
          href={link.href}
          onClick={() => setIsOpen(false)}
          className={cn(
            "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors mb-1",
            isActive 
              ? "bg-[#6c5dd3] text-white" 
              : "text-[#a0a4ab] hover:bg-[#252836] hover:text-white"
          )}
        >
          <Icon className={cn("h-5 w-5", isActive ? "text-white" : "text-[#a0a4ab]")} />
          {link.name}
        </Link>
      );
    });
  }

  return (
    <>
      {/* Mobile toggle */}
      <button 
        onClick={toggleSidebar}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-[#1f2128] border border-[#2d303e] rounded-md shadow-sm text-white"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-[260px] bg-[#1a1c24] text-white flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0 overflow-hidden",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Brand */}
        <div className="h-[80px] flex items-center px-6 mt-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="bg-[#6c5dd3] p-2 rounded-xl flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl tracking-wide text-white leading-tight">Eduvia</span>
              <span className="text-[10px] text-[#a0a4ab] font-semibold tracking-wider">LMS</span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-[#2d303e] scrollbar-track-transparent py-4 px-4 custom-scrollbar">
          
          <div className="mb-6">
            {renderLinks(studentLinks)}
          </div>

          {(role === "INSTRUCTOR" || role === "ADMIN") && (
            <div className="mb-6">
              <p className="text-[11px] font-bold text-[#808191] uppercase tracking-wider mb-3 px-4">Teaching</p>
              {renderLinks(teachingLinks)}
            </div>
          )}

          {role === "ADMIN" && (
            <div className="mb-6">
              <p className="text-[11px] font-bold text-[#808191] uppercase tracking-wider mb-3 px-4">Admin</p>
              {renderLinks(adminLinks)}
            </div>
          )}

        </div>

        {/* Footer actions */}
        <div className="p-4 mt-auto">
          <Link
            href="/help"
            className="flex items-center gap-3 px-4 py-3 mb-2 rounded-lg text-sm font-medium text-[#a0a4ab] hover:bg-[#252836] hover:text-white transition-colors border border-[#2d303e]"
          >
            <Headphones className="h-5 w-5" />
            Help & Support
          </Link>
          
          <form action="/api/auth/logout" method="POST">
            <button 
              type="submit"
              className="flex w-full items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-[#a0a4ab] hover:bg-destructive/10 hover:text-destructive transition-colors"
            >
              <LogOut className="h-5 w-5" />
              Log out
            </button>
          </form>
        </div>
      </aside>
    </>
  );
}
