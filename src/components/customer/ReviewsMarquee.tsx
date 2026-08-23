"use client";

import React from "react";
import { Star } from "lucide-react";

interface Testimonial {
  name: string;
  role: string;
  rating: number;
  review: string;
}

interface ReviewsMarqueeProps {
  testimonials: Testimonial[];
}

const ReviewCard: React.FC<{ t: Testimonial }> = ({ t }) => (
  <div className="flex-shrink-0 w-72 sm:w-80 rounded-2xl border border-primary/8 bg-white shadow-sm p-6 mx-3 flex flex-col gap-3">
    <div className="flex text-amber-400 gap-0.5">
      {Array.from({ length: t.rating }).map((_, i) => (
        <Star key={i} size={14} className="fill-current" />
      ))}
    </div>
    <p className="text-sm text-primary/75 italic leading-relaxed font-serif line-clamp-4">
      &ldquo;{t.review}&rdquo;
    </p>
    <div className="flex items-center gap-3 pt-3 border-t border-primary/5 mt-auto">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/10 text-accent text-sm font-serif font-bold flex-shrink-0">
        {t.name[0]}
      </div>
      <div>
        <h4 className="text-xs font-bold text-primary">{t.name}</h4>
        <span className="text-[10px] text-primary/45 font-semibold">{t.role}</span>
      </div>
    </div>
  </div>
);

export const ReviewsMarquee: React.FC<ReviewsMarqueeProps> = ({ testimonials }) => {
  if (!testimonials || testimonials.length === 0) return null;

  // Duplicate array so the marquee loops seamlessly
  const row1 = [...testimonials, ...testimonials, ...testimonials];
  const row2 = [...testimonials].reverse();
  const row2Full = [...row2, ...row2, ...row2];

  return (
    <div className="w-full overflow-hidden space-y-4 py-4">
      {/* Row 1 — scrolls left */}
      <div className="flex animate-marquee-left" style={{ width: "max-content" }}>
        {row1.map((t, i) => (
          <ReviewCard key={`r1-${i}`} t={t} />
        ))}
      </div>

      {/* Row 2 — scrolls right */}
      <div className="flex animate-marquee-right" style={{ width: "max-content" }}>
        {row2Full.map((t, i) => (
          <ReviewCard key={`r2-${i}`} t={t} />
        ))}
      </div>
    </div>
  );
};
