"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  BookOpen, 
  LayoutDashboard, 
  GraduationCap, 
  Award, 
  Heart,
  Bell,
  Settings,
  Users,
  FolderOpen,
  LineChart,
  LogOut,
  Menu,
  X,
  FileText
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
  { name: "My Learning", href: "/student/my-learning", icon: BookOpen },
  { name: "Certificates", href: "/student/certificates", icon: Award },
  { name: "Wishlist", href: "/student/wishlist", icon: Heart },
  { name: "Notes", href: "/student/notes", icon: FileText },
  { name: "Notifications", href: "/student/notifications", icon: Bell },
  { name: "Settings", href: "/student/settings", icon: Settings },
];

const instructorLinks = [
  { name: "Dashboard", href: "/instructor", icon: LayoutDashboard },
  { name: "My Courses", href: "/instructor/courses", icon: BookOpen },
  { name: "Students", href: "/instructor/students", icon: Users },
  { name: "Analytics", href: "/instructor/analytics", icon: LineChart },
  { name: "Reviews", href: "/instructor/reviews", icon: Heart },
  { name: "Settings", href: "/instructor/settings", icon: Settings },
];

const adminLinks = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Courses", href: "/admin/courses", icon: BookOpen },
  { name: "Categories", href: "/admin/categories", icon: FolderOpen },
  { name: "Certificates", href: "/admin/certificates", icon: Award },
  { name: "Analytics", href: "/admin/analytics", icon: LineChart },
  { name: "Settings", href: "/admin/settings", icon: Settings },
];

export function Sidebar({ role, user }: SidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const links = 
    role === "ADMIN" ? adminLinks : 
    role === "INSTRUCTOR" ? instructorLinks : 
    studentLinks;

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile toggle */}
      <button 
        onClick={toggleSidebar}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-background border border-border rounded-md shadow-sm"
      >
        {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border flex flex-col transition-transform duration-300 ease-in-out md:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Brand */}
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Link href="/" className="flex items-center gap-2 text-primary font-bold text-xl">
            <BookOpen className="h-6 w-6" />
            <span>Eduvia</span>
          </Link>
        </div>

        {/* User Info (Mobile) */}
        {user && (
          <div className="md:hidden p-4 border-b border-border">
            <p className="font-medium text-foreground">{user.firstName} {user.lastName}</p>
            <p className="text-sm text-muted-foreground truncate">{user.email}</p>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {links.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
            const Icon = link.icon;
            
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className={cn("h-5 w-5", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-border">
          <form action="/api/auth/logout" method="POST">
            <button 
              type="submit"
              className="flex w-full items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
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
