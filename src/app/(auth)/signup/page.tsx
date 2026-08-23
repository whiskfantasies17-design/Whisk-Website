"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, User, Mail, Lock, MapPin, Phone, CheckSquare } from "lucide-react";
import { motion } from "framer-motion";

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, address, phone }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Signup failed");
      }

      router.refresh();
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "An error occurred during registration.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute right-0 top-0 h-96 w-96 bg-accent/5 rounded-full blur-3xl" />
      <div className="absolute left-0 bottom-0 h-96 w-96 bg-secondary/30 rounded-full blur-3xl" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <Link href="/" className="inline-block">
          <span className="font-serif text-3xl font-bold tracking-widest text-primary">
            WHISK FANTASIES
          </span>
        </Link>
        <h2 className="mt-6 text-center text-2xl font-serif font-bold text-primary">
          Create Account
        </h2>
        <p className="mt-1 text-center text-xs text-primary/60">
          Join Whisk Fantasies to configure custom order tracking and check out faster.
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

          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Full Name */}
            <div className="space-y-1">
              <label htmlFor="name" className="text-xs font-bold text-primary/70 uppercase">
                Full Name *
              </label>
              <div className="relative">
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Evelyn Vance"
                  className="w-full rounded-full border border-primary/10 bg-background px-4 py-2.5 pl-10 text-sm text-primary focus:border-accent focus:outline-none"
                />
                <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary/35" />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label htmlFor="email" className="text-xs font-bold text-primary/70 uppercase">
                Email address *
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
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
              <label htmlFor="password" className="text-xs font-bold text-primary/70 uppercase">
                Password *
              </label>
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-full border border-primary/10 bg-background px-4 py-2.5 pl-10 text-sm text-primary focus:border-accent focus:outline-none"
                />
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary/35" />
              </div>
            </div>

            {/* Address */}
            <div className="space-y-1">
              <label htmlFor="address" className="text-xs font-bold text-primary/70 uppercase">
                Delivery Address
              </label>
              <div className="relative">
                <input
                  id="address"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="124 Baker St, New York, NY"
                  className="w-full rounded-full border border-primary/10 bg-background px-4 py-2.5 pl-10 text-sm text-primary focus:border-accent focus:outline-none"
                />
                <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary/35" />
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-1">
              <label htmlFor="phone" className="text-xs font-bold text-primary/70 uppercase">
                Phone Number
              </label>
              <div className="relative">
                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 987-6543"
                  className="w-full rounded-full border border-primary/10 bg-background px-4 py-2.5 pl-10 text-sm text-primary focus:border-accent focus:outline-none"
                />
                <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-primary/35" />
              </div>
            </div>

            {/* Submit */}
            <div className="pt-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 rounded-full bg-accent py-3 text-xs font-bold text-white hover:bg-accent/95 shadow-md disabled:opacity-60 transition-all cursor-pointer"
              >
                {loading ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <>
                    <CheckSquare size={14} />
                    Register Account
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center text-xs text-primary/60">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-primary hover:underline">
              Log In
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
