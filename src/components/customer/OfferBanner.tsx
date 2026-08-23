"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, Clock, X } from "lucide-react";

interface Offer {
  text: string;
  discountPercentage: number;
  durationHours: number;
  isActive: boolean;
  startedAt: string;
}

export const OfferBanner: React.FC = () => {
  const [offer, setOffer] = useState<Offer | null>(null);
  const [timeLeft, setTimeLeft] = useState("");
  const [isVisible, setIsVisible] = useState(true);

  const fetchActiveOffer = async () => {
    try {
      const res = await fetch("/api/settings", { cache: "no-store" });
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
    if (!offer || !offer.isActive || !offer.startedAt) return;

    const calculateTime = () => {
      const startTime = new Date(offer.startedAt).getTime();
      const durationMs = offer.durationHours * 60 * 60 * 1000;
      const endTime = startTime + durationMs;
      const now = new Date().getTime();
      const diff = endTime - now;

      if (diff <= 0) {
        setTimeLeft("");
        return;
      }

      const hrs = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);

      const pad = (num: number) => String(num).padStart(2, "0");
      setTimeLeft(`${pad(hrs)}h : ${pad(mins)}m : ${pad(secs)}s`);
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);

    return () => clearInterval(interval);
  }, [offer]);

  if (!offer || !offer.isActive || !timeLeft || !isVisible) return null;

  return (
    <div className="bg-accent text-white py-2 px-4 relative z-50 text-center flex items-center justify-center gap-4 text-xs font-semibold shadow-md animate-fade-in">
      <div className="flex items-center gap-1.5 justify-center flex-wrap">
        <Sparkles size={14} className="text-white fill-current animate-pulse" />
        <span>{offer.text}</span>
        <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px] font-bold">
          {offer.discountPercentage}% OFF
        </span>
      </div>

      <div className="flex items-center gap-1 bg-black/25 px-3 py-1 rounded-full font-mono text-[11px]">
        <Clock size={12} className="text-white/80" />
        <span>{timeLeft}</span>
      </div>

      <button
        onClick={() => setIsVisible(false)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
        aria-label="Dismiss banner"
      >
        <X size={14} />
      </button>
    </div>
  );
};
