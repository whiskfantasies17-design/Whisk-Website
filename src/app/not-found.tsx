"use client";

import React from "react";
import Link from "next/link";
import { MoveLeft, HelpCircle } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 text-center relative overflow-hidden">
      <div className="absolute right-0 top-0 h-96 w-96 bg-accent/5 rounded-full blur-3xl" />
      <div className="absolute left-0 bottom-0 h-96 w-96 bg-secondary/30 rounded-full blur-3xl" />

      <div className="space-y-6 max-w-md relative z-10">
        <span className="text-[10px] font-bold uppercase tracking-widest text-accent flex items-center justify-center gap-1.5">
          <HelpCircle size={14} /> Error Code 404
        </span>
        <h1 className="font-serif text-5xl font-bold tracking-tight text-primary">
          Lost in Flavor?
        </h1>
        <p className="text-sm text-primary/60 leading-relaxed max-w-xs mx-auto">
          The confectioneries recipe or page you are requesting could not be located in our ovens.
        </p>

        <div className="pt-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-full bg-primary hover:bg-primary/95 text-white font-bold text-xs px-8 py-3.5 shadow-md transition-all"
          >
            <MoveLeft size={14} /> Return to Storefront
          </Link>
        </div>
      </div>
    </div>
  );
}
