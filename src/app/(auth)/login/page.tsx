"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, KeyRound, Mail, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Successful login
      router.refresh();
      if (data.user?.role === "admin" || data.user?.role === "super-admin") {
        router.push("/owner");
      } else {
        router.push(redirect !== "/" ? redirect : "/user");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Visual background accents */}
      <div className="absolute right-0 top-0 h-96 w-96 bg-accent/5 rounded-full blur-3xl" />
      <div className="absolute left-0 bottom-0 h-96 w-96 bg-secondary/30 rounded-full blur-3xl" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <Link href="/" className="inline-block">
          <span className="font-serif text-3xl font-bold tracking-widest text-primary">
            WHISK FANTASIES
          </span>
        </Link>
        <h2 className="mt-6 text-center text-2xl font-serif font-bold text-primary">
          Welcome Back
        </h2>
        <p className="mt-1 text-center text-xs text-primary/60">
          Enter your credentials to access your luxury confectionery order tracker.
        </p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10"
      >
        <div className="bg-white py-8 px-4 border border-primary/5 shadow-xl rounded-3xl sm:px-10">
          {error && (
            <div className="mb-4 bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold p-3.5 rounded-xl">
              {error}
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Email Address */}
            <div className="space-y-1">
              <label htmlFor="email" className="text-xs font-bold text-primary/70 uppercase">
                Email address
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@domain.com"
                  className="w-full rounded-full border border-primary/10 bg-background px-4 py-2.5 pl-10 text-sm text-primary focus:border-accent focus:outline-none"
                />
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary/35" />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-xs font-bold text-primary/70 uppercase">
                  Password
                </label>
                <Link
                  href="#"
                  className="text-[10px] font-bold text-accent hover:underline"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-full border border-primary/10 bg-background px-4 py-2.5 pl-10 pr-10 text-sm text-primary focus:border-accent focus:outline-none"
                />
                <KeyRound size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary/35" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-primary/35 hover:text-primary"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 rounded-full bg-primary py-3 text-xs font-bold text-white hover:bg-primary/95 shadow-md disabled:opacity-60 transition-all cursor-pointer"
              >
                {loading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <>
                    <Sparkles size={14} />
                    Sign In
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-xs text-primary/60">
            Don&rsquo;t have a Whisk account?{" "}
            <Link href="/signup" className="font-bold text-accent hover:underline">
              Sign Up
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 size={40} className="animate-spin text-accent" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
