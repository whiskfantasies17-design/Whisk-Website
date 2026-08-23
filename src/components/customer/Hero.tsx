"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Slide {
  id: number;
  image: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
}

const HERO_SLIDES: Slide[] = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1600&q=80",
    title: "Handcrafted Cakes for Every Celebration",
    subtitle: "From elegant birthday cakes to luxurious wedding creations, Whisk Fantasies crafts fresh, eggless delights with premium ingredients and personalized designs.",
    ctaText: "Order Now",
    ctaLink: "/cakes",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1535141192574-5d4897c13636?auto=format&fit=crop&w=1600&q=80",
    title: "Unforgettable Wedding Details",
    subtitle: "Bespoke multi-tiered couture cakes tailored to celebrate your eternal love stories in Mumbai.",
    ctaText: "Explore Bridal Couture",
    ctaLink: "/cakes?category=Wedding%20Cakes",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=1600&q=80",
    title: "100% Vegetarian Cheesecakes",
    subtitle: "Rich Lotus Biscoff, Baked New York, and espresso tiramisu cheesecakes. Please order 24h in advance.",
    ctaText: "Order Cheesecakes",
    ctaLink: "/cakes?category=Cheesecakes",
  },
];

export const Hero: React.FC = () => {
  const [heroSlides, setHeroSlides] = useState<Slide[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const fetchBanners = async () => {
    try {
      const res = await fetch("/api/banners", { cache: "no-store" });
      const data = await res.json();
      if (res.ok && Array.isArray(data.banners) && data.banners.length > 0) {
        setHeroSlides(data.banners);
      } else {
        // Fall back to built-in default slides if admin hasn't added any
        setHeroSlides(HERO_SLIDES);
      }
    } catch (e) {
      console.error(e);
      setHeroSlides(HERO_SLIDES);
    } finally {
      setLoaded(true);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // Reset to slide 0 whenever the slide list changes to avoid out-of-bounds
  const activeSlides = heroSlides.length > 0 ? heroSlides : HERO_SLIDES;

  useEffect(() => {
    setCurrentSlide(0);
  }, [activeSlides.length]);

  useEffect(() => {
    if (activeSlides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [activeSlides]);

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev - 1 + activeSlides.length) % activeSlides.length);
  };

  const handleNext = () => {
    setCurrentSlide((prev) => (prev + 1) % activeSlides.length);
  };

  if (!loaded) return (
    <section className="relative w-full h-[70vh] sm:h-[80vh] bg-primary animate-pulse" />
  );

  return (
    <section className="relative w-full h-[70vh] sm:h-[80vh] overflow-hidden bg-primary">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentSlide}
          initial={{ opacity: 0.6 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0.6 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 w-full h-full"
        >
          {/* Background image */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={activeSlides[currentSlide].image}
            alt={activeSlides[currentSlide].title}
            className="w-full h-full object-cover object-center"
          />
          {/* Dark Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/50 to-transparent" />
        </motion.div>
      </AnimatePresence>

      {/* Main Content Block */}
      <div className="relative mx-auto max-w-7xl h-full px-4 sm:px-6 lg:px-8 flex items-center z-10">
        <div className="max-w-2xl text-left text-white">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-1.5 rounded-full bg-accent/25 px-3 py-1.5 text-xs font-semibold text-accent mb-4 border border-accent/10"
          >
            <Sparkles size={12} />
            Bespoke Confectionery Art
          </motion.div>

          <motion.h1
            key={`title-${currentSlide}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight"
          >
            {activeSlides[currentSlide].title}
          </motion.h1>

          <motion.p
            key={`desc-${currentSlide}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg text-primary-foreground/75 mt-4 leading-relaxed max-w-lg"
          >
            {activeSlides[currentSlide].subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap gap-3 mt-8"
          >
            <Link
              href={activeSlides[currentSlide].ctaLink}
              className="rounded-full bg-accent px-6 py-3 text-xs sm:text-sm font-bold text-white hover:bg-accent/90 shadow-lg hover:shadow-accent/20 transition-all duration-300"
            >
              {activeSlides[currentSlide].ctaText}
            </Link>
            <Link
              href="#custom-cakes"
              className="rounded-full border border-white/20 bg-white/5 backdrop-blur-sm px-6 py-3 text-xs sm:text-sm font-bold text-white hover:bg-white/10 transition-all duration-300"
            >
              Customize Cake
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Slide Navigation Arrows */}
      {activeSlides.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full border border-white/15 bg-black/10 backdrop-blur-sm text-white hover:bg-white hover:text-primary transition-all duration-300"
            aria-label="Previous slide"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full border border-white/15 bg-black/10 backdrop-blur-sm text-white hover:bg-white hover:text-primary transition-all duration-300"
            aria-label="Next slide"
          >
            <ChevronRight size={20} />
          </button>

          {/* Pagination indicators */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
            {activeSlides.map((slide, idx) => (
              <button
                key={slide.id}
                onClick={() => setCurrentSlide(idx)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  currentSlide === idx ? "w-6 bg-accent" : "w-2 bg-white/40"
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
};
