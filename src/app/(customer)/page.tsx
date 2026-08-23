"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { MessageCircle, Star, ArrowRight, Camera, ChevronRight, Award, Truck, ShieldCheck, Heart, Clock, Phone, MapPin } from "lucide-react";
import { Hero } from "@/components/customer/Hero";
import { ProductCard } from "@/components/customer/ProductCard";
import { HomepageFlashSale } from "@/components/customer/HomepageFlashSale";
import { MOCK_PRODUCTS, MOCK_CATEGORIES, MOCK_TESTIMONIALS, MOCK_INSTAGRAM } from "@/mock-data/products";
import { motion } from "framer-motion";
import { ReviewsMarquee } from "@/components/customer/ReviewsMarquee";

export default function HomePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loaded, setLoaded] = useState(false);

  const fetchHomeDetails = async () => {
    try {
      const pRes = await fetch("/api/products");
      const pData = await pRes.json();
      if (pRes.ok) setProducts(pData.products || []);

      const cRes = await fetch("/api/categories");
      const cData = await cRes.json();
      if (cRes.ok) setCategories(cData.categories || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoaded(true);
    }
  };

  useEffect(() => {
    fetchHomeDetails();
  }, []);

  const activeProducts = loaded ? products : MOCK_PRODUCTS;
  const activeCategories = loaded ? categories : MOCK_CATEGORIES;
  const signatureCakes = activeProducts.filter((p: any) => p.isSignature).length > 0
    ? activeProducts.filter((p: any) => p.isSignature).slice(0, 8)
    : activeProducts.slice(0, 8);

  const customCakeProcess = [
    { step: "1", title: "Share your idea", desc: "Send us a picture, sketch, theme, or description of your dream cake." },
    { step: "2", title: "Discuss design & flavour", desc: "Our chefs guide you on flavor combinations and decorations." },
    { step: "3", title: "Confirm order", desc: "Select delivery slot and confirm with secure bank screenshot receipt." },
    { step: "4", title: "Freshly baked", desc: "We bake the cake fresh in our Vikhroli kitchen using organic details." },
    { step: "5", title: "Delivered with care", desc: "Bespoke courier delivery in cold-chain vans across Mumbai." }
  ];

  return (
    <div className="space-y-20 pb-20">
      {/* 1. Hero Carousel Banner */}
      <Hero />

      {/* 1.5. Dynamic Flash Sale Countdown Card */}
      <HomepageFlashSale />

      {/* 2. Special Notes Badges Panel */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap justify-center gap-3">
          <span className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 text-xs font-bold text-emerald-800">
            🌱 Vegetarian Only
          </span>
          <span className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 text-xs font-bold text-primary">
            🚚 Home Delivery
          </span>
          <span className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 text-xs font-bold text-primary">
            🥡 Takeaway Available
          </span>
          <span className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 text-xs font-bold text-primary">
            🎂 Custom Cakes
          </span>
          <span className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 text-xs font-bold text-accent">
            💝 Eggless Options
          </span>
          <span className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 text-xs font-bold text-primary">
            🌾 Healthy Cakes Available
          </span>
        </div>
      </section>

      {/* 3. About Whisk Fantasies */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
        <div className="space-y-6">
          <span className="text-[10px] font-bold uppercase tracking-widest text-accent">
            Our Story
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-primary leading-tight">
            About Whisk Fantasies
          </h2>
          <p className="text-sm text-primary/75 leading-relaxed">
            Whisk Fantasies is a premium vegetarian bakery located in Vikhroli, Mumbai, specializing in handcrafted cakes, cheesecakes, brownies, cupcakes, desserts, and customized celebration cakes. Every dessert is freshly prepared with premium ingredients to make every celebration memorable. The menu and contact details come from your menu and our Zomato listing.
          </p>

          {/* Store Coordinates */}
          <div className="bg-secondary/15 rounded-3xl p-6 border border-primary/5 space-y-4 text-xs text-primary/80">
            <h4 className="font-serif text-sm font-bold text-primary">Store Coordinates</h4>
            <div className="flex items-start gap-2.5">
              <MapPin size={16} className="text-accent flex-shrink-0 mt-0.5" />
              <span>Karm Stambh, LBS Marg, Vikhroli, Mumbai</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Phone size={16} className="text-accent flex-shrink-0" />
              <span>+91 8424 016 876 &bull; +91 8424 976 876</span>
            </div>
            <div className="flex items-center gap-2.5">
              <Clock size={16} className="text-accent flex-shrink-0" />
              <span>Opening Hours: 11:00 AM – Until Closing</span>
            </div>
          </div>
        </div>
        <div className="relative aspect-square rounded-3xl overflow-hidden border border-primary/5 bg-secondary/35">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80"
            alt="Baking gourmet cake in Vikhroli"
            className="h-full w-full object-cover"
          />
        </div>
      </section>

      {/* 4. Why Choose Us */}
      <section className="bg-secondary/25 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-3">
            <h2 className="font-serif text-3xl font-bold tracking-tight text-primary">
              Why Choose Whisk Fantasies
            </h2>
            <p className="text-sm text-primary/60">
              Confectioneries baked to absolute perfection in our clean, vegetarian-only kitchen.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white border border-primary/5 p-6 rounded-2xl shadow-sm space-y-2">
              <h3 className="font-serif text-base font-bold text-primary">Freshly Baked Daily</h3>
              <p className="text-xs text-primary/60 leading-relaxed">Every cake is prepared fresh using premium ingredients.</p>
            </div>
            <div className="bg-white border border-primary/5 p-6 rounded-2xl shadow-sm space-y-2">
              <h3 className="font-serif text-base font-bold text-primary">100% Vegetarian</h3>
              <p className="text-xs text-primary/60 leading-relaxed">Wide range of delicious vegetarian cakes and desserts.</p>
            </div>
            <div className="bg-white border border-primary/5 p-6 rounded-2xl shadow-sm space-y-2">
              <h3 className="font-serif text-base font-bold text-primary">Custom Designs</h3>
              <p className="text-xs text-primary/60 leading-relaxed">Photo cakes, theme cakes, wedding cakes and special celebration cakes.</p>
            </div>
            <div className="bg-white border border-primary/5 p-6 rounded-2xl shadow-sm space-y-2">
              <h3 className="font-serif text-base font-bold text-primary">Premium Ingredients</h3>
              <p className="text-xs text-primary/60 leading-relaxed">Rich chocolate, fresh fruits, premium cream and imported ingredients.</p>
            </div>
            <div className="bg-white border border-primary/5 p-6 rounded-2xl shadow-sm space-y-2">
              <h3 className="font-serif text-base font-bold text-primary">Healthy Choices</h3>
              <p className="text-xs text-primary/60 leading-relaxed">Whole wheat and jaggery cake options are available.</p>
            </div>
            <div className="bg-white border border-primary/5 p-6 rounded-2xl shadow-sm space-y-2">
              <h3 className="font-serif text-base font-bold text-primary">Home Delivery</h3>
              <p className="text-xs text-primary/60 leading-relaxed">Fresh cakes delivered across Mumbai.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Shop by Category */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto space-y-3">
          <h2 className="font-serif text-3xl font-bold tracking-tight text-primary">
            Curated Collections
          </h2>
          <p className="text-sm text-primary/60">
            Browse our beautiful catalog of signature themes crafted for every personality.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mt-10">
          {activeCategories.map((cat, idx) => (
            <motion.div
              key={cat.slug || cat.name}
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
            >
              <Link
                href={`/cakes?category=${encodeURIComponent(cat.name)}`}
                className="group relative flex aspect-square flex-col justify-end overflow-hidden rounded-2xl border border-primary/5 bg-secondary/25 p-4 sm:p-5"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cat.image}
                  alt={cat.name}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent" />
                <div className="relative z-10 text-white">
                  <h3 className="font-serif text-sm sm:text-base font-bold tracking-wide">
                    {cat.name}
                  </h3>
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold text-accent mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    Explore <ChevronRight size={10} />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 6. Signature Cakes Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto space-y-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-accent">
            Featured Bestsellers
          </span>
          <h2 className="font-serif text-3xl font-bold tracking-tight text-primary">
            Our Signature Cakes
          </h2>
          <p className="text-sm text-primary/60">
            A selection of our most requested creations, designed with love and baked fresh daily in Mumbai.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-10">
          {signatureCakes.map((cake) => (
            <ProductCard key={cake.id} product={cake} />
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/cakes"
            className="inline-flex items-center gap-2 rounded-full border-2 border-primary px-8 py-3 text-xs font-bold text-primary hover:bg-primary hover:text-white transition-all duration-300"
          >
            Explore All Creations
            <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* 7. Cheesecakes Promotional Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-secondary/20 p-8 sm:p-12 border border-primary/5 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-accent">
              Boutique Cheesecakes
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-primary mt-1">
              Lotus Biscoff & Baked Cheesecakes
            </h2>
            <p className="text-xs text-primary/65 mt-2 max-w-md leading-relaxed">
              Indulge in our premium Baked New York Cheesecake, Lotus Biscoff, Tiramisu Espresso, or Frozen delicacies. Each cheesecake crust is pressed to perfection.
            </p>
            <span className="inline-block mt-4 bg-accent/10 border border-accent/20 text-accent font-bold text-[10px] px-3 py-1.5 rounded-full uppercase tracking-wider">
              ⚠️ Please place cheesecake orders at least 24 hours in advance.
            </span>
          </div>
          <Link
            href="/cakes?category=Cheesecakes"
            className="rounded-full bg-primary hover:bg-primary/95 text-white font-bold text-xs px-8 py-3.5 shadow-md flex items-center gap-1.5 flex-shrink-0"
          >
            Browse Cheesecakes <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* 8. Customized Cakes (WhatsApp Promo) */}
      <section id="custom-cakes" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-primary text-white p-8 sm:p-12 lg:p-16 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="absolute right-0 top-0 h-40 w-40 bg-accent/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 h-60 w-60 bg-secondary/5 rounded-full blur-3xl" />

          {/* Form and steps */}
          <div className="space-y-8 relative z-10">
            <div className="space-y-4">
              <span className="text-[10px] font-bold uppercase tracking-widest text-accent">
                Bespoke Couture Cakes
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight">
                Design Your Dream Cake
              </h2>
              <p className="text-sm text-primary-foreground/70 leading-relaxed max-w-md">
                Whether it&rsquo;s a birthday, anniversary, wedding, baby shower, corporate event or any special occasion, we&rsquo;ll create a cake that&rsquo;s uniquely yours.
              </p>
            </div>

            {/* Customization steps */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {customCakeProcess.map((step) => (
                <div key={step.step} className="flex gap-3 items-start">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent text-xs font-bold text-white flex-shrink-0">
                    {step.step}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold">{step.title}</h4>
                    <p className="text-xs text-primary-foreground/60 mt-1 leading-relaxed">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <a
                href="https://wa.me/918424016876?text=Hi%20Whisk%20Fantasies,%20I%20would%20like%20to%20order%20a%20customized%20eggless%20cake%20in%20Mumbai!"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-emerald-600 hover:bg-emerald-700 px-8 py-4 text-xs font-bold text-white shadow-lg transition-all"
              >
                <MessageCircle size={18} className="fill-current" />
                Customize on WhatsApp
              </a>
            </div>
          </div>

          {/* Image */}
          <div className="relative aspect-video lg:aspect-square w-full rounded-2xl overflow-hidden border border-white/10 shadow-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="https://images.unsplash.com/photo-1535141192574-5d4897c13636?auto=format&fit=crop&w=800&q=80"
              alt="Custom wedding design illustration"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      {/* 9. Testimonials — Animated Marquee */}
      <section className="space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-3 px-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-accent">
            ★ Customer Reviews
          </span>
          <h2 className="font-serif text-3xl font-bold tracking-tight text-primary">
            Loved By Thousands
          </h2>
          <p className="text-sm text-primary/60">
            Real celebrations. Real smiles. Hover over any card to pause and read.
          </p>
        </div>

        {/* Masked marquee container */}
        <div
          className="relative w-full"
          style={{
            maskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)",
          }}
        >
          <ReviewsMarquee testimonials={MOCK_TESTIMONIALS} />
        </div>
      </section>

      {/* 10. Instagram Gallery Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center space-y-8">
        <div className="space-y-3">
          <span className="text-[10px] font-bold uppercase tracking-widest text-accent flex items-center justify-center gap-1">
            #WhiskFantasies
          </span>
          <h2 className="font-serif text-3xl font-bold tracking-tight text-primary">
            Moments on Instagram
          </h2>
          <p className="text-sm text-primary/60 max-w-md mx-auto">
            Tag us to showcase your celebration layout. Join our premium visual aesthetic community.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {MOCK_INSTAGRAM.map((url, idx) => (
            <a
              key={idx}
              href="#"
              className="group relative aspect-square overflow-hidden rounded-xl border border-primary/5 shadow-sm block"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`Instagram gallery block ${idx + 1}`}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </div>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
