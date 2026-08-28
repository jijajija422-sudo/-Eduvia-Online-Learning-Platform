"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { BookOpen, GraduationCap, ShieldCheck, LogIn, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { loginSchema } from "@/schemas";

type Role = "ADMIN" | "INSTRUCTOR" | "STUDENT";

const ROLE_META: Record<Role, { title: string; subtitle: string; icon: typeof BookOpen; accent: string }> = {
  ADMIN: {
    title: "Admin Sign-In",
    subtitle: "Manage users, instructors, and course approvals.",
    icon: ShieldCheck,
    accent: "text-rose-500",
  },
  INSTRUCTOR: {
    title: "Instructor Login",
    subtitle: "Create courses, upload content, and manage your students.",
    icon: GraduationCap,
    accent: "text-violet-500",
  },
  STUDENT: {
    title: "Student Login",
    subtitle: "Continue your learning journey.",
    icon: BookOpen,
    accent: "text-primary",
  },
};

function LoginForm({ role }: { role: Role }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const meta = ROLE_META[role];
  const Icon = meta.icon;

  const returnUrl = searchParams.get("returnUrl");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberMe: false },
  });

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, expectedRole: role }),
      });
      const responseData = await response.json();
      if (!response.ok) throw new Error(responseData.error || "Failed to login");

      toast.success("Successfully logged in");
      // The API returns the correct dashboard per role. Prefer an explicit returnUrl, else the role dashboard.
      window.location.href = returnUrl && returnUrl.startsWith("/") ? returnUrl : responseData.redirectUrl;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex-1 flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-background">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Icon className={`h-6 w-6 ${meta.accent}`} />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">{meta.title}</h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">{meta.subtitle}</p>
        {role !== "STUDENT" && (
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Only accounts with the <strong>{role}</strong> role can sign in here.
          </p>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card py-8 px-4 shadow-sm border border-border sm:rounded-xl sm:px-10">
          {error && (
            <div className="mb-6 bg-destructive/10 border border-destructive/20 rounded-md p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground">Email address</label>
              <div className="mt-1">
                <input id="email" type="email" autoComplete="email"
                  className="appearance-none block w-full px-3 py-2.5 border border-input rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-background"
                  {...register("email")} />
                {errors.email && <p className="mt-2 text-sm text-destructive">{errors.email.message as string}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground">Password</label>
              <div className="mt-1">
                <input id="password" type="password" autoComplete="current-password"
                  className="appearance-none block w-full px-3 py-2.5 border border-input rounded-md shadow-sm placeholder-muted-foreground focus:outline-none focus:ring-primary focus:border-primary sm:text-sm bg-background"
                  {...register("password")} />
                {errors.password && <p className="mt-2 text-sm text-destructive">{errors.password.message as string}</p>}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input id="rememberMe" type="checkbox" className="h-4 w-4 text-primary focus:ring-primary border-input rounded" {...register("rememberMe")} />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-foreground">Remember me</label>
              </div>
              <div className="text-sm">
                <Link href="/forgot-password" className="font-medium text-primary hover:text-primary/80">Forgot your password?</Link>
              </div>
            </div>

            <div>
              <button type="submit" disabled={isLoading}
                className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                {isLoading ? "Signing in…" : (<span className="flex items-center gap-2"><LogIn className="h-4 w-4" /> Sign in</span>)}
              </button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {role === "STUDENT" ? (
              <>New here? <Link href="/register" className="font-medium text-primary hover:text-primary/80">Create a student account</Link></>
            ) : role === "INSTRUCTOR" ? (
              <>Want to teach? <Link href="/become-instructor" className="font-medium text-primary hover:text-primary/80">Apply to instruct</Link></>
            ) : (
              <Link href="/login" className="font-medium text-primary hover:text-primary/80">Student sign-in →</Link>
            )}
          </p>

          {role === "STUDENT" && (
            <div className="mt-4 flex items-center justify-center gap-4 text-xs">
              <Link href="/admin/login" className="text-muted-foreground hover:text-primary">Admin sign-in</Link>
              <span className="text-border">·</span>
              <Link href="/instructor/login" className="text-muted-foreground hover:text-primary">Instructor sign-in</Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default function RoleLoginForm({ role }: { role: Role }) {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center py-20">Loading…</div>}>
      <LoginForm role={role} />
    </Suspense>
  );
}
