"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, Clock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

interface Offer {
  text: string;
  discountPercentage: number;
  durationHours: number;
  isActive: boolean;
  startedAt: string;
}

export const HomepageFlashSale: React.FC = () => {
  const [offer, setOffer] = useState<Offer | null>(null);
  const [timeLeft, setTimeLeft] = useState({ hours: "00", minutes: "00", seconds: "00" });
  const [active, setActive] = useState(false);

  const fetchActiveOffer = async () => {
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      if (res.ok && data.settings && data.settings.activeOffer) {
        setOffer(data.settings.activeOffer);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchActiveOffer();
  }, []);

  useEffect(() => {
    if (!offer || !offer.isActive || !offer.startedAt) {
      setActive(false);
      return;
    }

    const calculateTime = () => {
      const startTime = new Date(offer.startedAt).getTime();
      const durationMs = offer.durationHours * 60 * 60 * 1000;
      const endTime = startTime + durationMs;
      const now = new Date().getTime();
      const diff = endTime - now;

      if (diff <= 0) {
        setActive(false);
        return;
      }

      const hrs = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      const pad = (num: number) => String(num).padStart(2, "0");
      setTimeLeft({
        hours: pad(hrs),
        minutes: pad(mins),
        seconds: pad(secs)
      });
      setActive(true);
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);

    return () => clearInterval(interval);
  }, [offer]);

  if (!offer || !offer.isActive || !active) return null;

  return (
    <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 mt-8">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary to-accent p-8 text-white shadow-2xl border border-white/5 flex flex-col md:flex-row items-center justify-between gap-8"
      >
        {/* Glow overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.08),transparent)]" />
        
        {/* Detail text */}
        <div className="space-y-4 max-w-lg relative z-10 text-center md:text-left">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3.5 py-1.5 text-[10px] font-extrabold uppercase tracking-widest text-accent mb-1 border border-white/10">
            <Sparkles size={12} className="fill-current" />
            Limited-Time Special Offer
          </div>
          <h2 className="font-serif text-3xl font-bold leading-tight tracking-tight">
            {offer.text}
          </h2>
          <p className="text-sm text-white/80 leading-relaxed">
            Hurry! This premium discount is available for a limited duration. Order fresh confections before the timer runs out.
          </p>
        </div>

        {/* Timer countdown blocks */}
        <div className="flex flex-col items-center gap-4 relative z-10 w-full md:w-auto">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Hours block */}
            <div className="flex flex-col items-center">
              <div className="bg-black/35 rounded-2xl w-14 h-16 sm:w-16 sm:h-18 flex items-center justify-center font-mono text-2xl sm:text-3xl font-extrabold border border-white/10">
                {timeLeft.hours}
              </div>
              <span className="text-[9px] font-bold text-white/60 uppercase tracking-widest mt-1">Hrs</span>
            </div>
            
            <span className="text-xl font-bold pb-4">:</span>

            {/* Minutes block */}
            <div className="flex flex-col items-center">
              <div className="bg-black/35 rounded-2xl w-14 h-16 sm:w-16 sm:h-18 flex items-center justify-center font-mono text-2xl sm:text-3xl font-extrabold border border-white/10">
                {timeLeft.minutes}
              </div>
              <span className="text-[9px] font-bold text-white/60 uppercase tracking-widest mt-1">Mins</span>
            </div>

            <span className="text-xl font-bold pb-4">:</span>

            {/* Seconds block */}
            <div className="flex flex-col items-center">
              <div className="bg-black/35 rounded-2xl w-14 h-16 sm:w-16 sm:h-18 flex items-center justify-center font-mono text-2xl sm:text-3xl font-extrabold border border-white/10 text-white animate-pulse">
                {timeLeft.seconds}
              </div>
              <span className="text-[9px] font-bold text-white/60 uppercase tracking-widest mt-1">Secs</span>
            </div>
          </div>

          <Link
            href="/cakes"
            className="w-full sm:w-auto bg-white text-primary hover:bg-accent hover:text-white px-8 py-3 rounded-full text-xs font-bold transition-all duration-300 shadow-md flex items-center justify-center gap-1.5 group cursor-pointer"
          >
            Claim Flash Deal
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </motion.div>
    </section>
  );
};
