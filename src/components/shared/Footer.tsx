"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MapPin, Phone, Mail, ArrowRight, Heart } from "lucide-react";

export const Footer: React.FC = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
      setTimeout(() => setSubscribed(false), 5000);
    }
  };

  const categories = [
    { name: "Birthday Cakes", href: "/cakes?category=Birthday%20Cakes" },
    { name: "Anniversary Cakes", href: "/cakes?category=Anniversary%20Cakes" },
    { name: "Wedding Cakes", href: "/cakes?category=Wedding%20Cakes" },
    { name: "Chocolate Cakes", href: "/cakes?category=Chocolate%20Cakes" },
    { name: "Cheesecakes", href: "/cakes?category=Cheesecakes" },
    { name: "Healthy Cakes", href: "/cakes?category=Healthy%20Cakes" },
    { name: "Customized Cakes", href: "/cakes?category=Custom%20Cakes" },
  ];

  const quickLinks = [
    { name: "Shop All Cakes", href: "/cakes" },
    { name: "Wishlist Favorites", href: "/wishlist" },
    { name: "Track Your Order", href: "/dashboard" },
    { name: "Cart Overview", href: "/cart" },
  ];

  return (
    <footer className="bg-primary text-primary-foreground/90 border-t border-primary/10">
      {/* Newsletter Promotional Banner */}
      <div className="border-b border-primary-foreground/10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-md">
            <h3 className="font-serif text-2xl font-bold tracking-wide text-white">
              Join Our Sweet Newsletter
            </h3>
            <p className="text-sm text-primary-foreground/60 mt-1">
              Be the first to hear about seasonal flavors, custom design releases, and luxury promotions.
            </p>
          </div>
          <form onSubmit={handleSubscribe} className="w-full max-w-md flex gap-2">
            <input
              type="email"
              placeholder="Your email address..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-full border border-primary-foreground/20 bg-primary-foreground/5 px-5 py-3 text-sm text-white placeholder-primary-foreground/40 focus:border-white focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-full bg-accent px-6 py-3 text-xs font-bold text-white hover:bg-accent/90 flex items-center gap-1 flex-shrink-0 transition-all"
            >
              {subscribed ? "Subscribed!" : "Subscribe"}
              {!subscribed && <ArrowRight size={14} />}
            </button>
          </form>
        </div>
      </div>

      {/* Footer Main Content Grid */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand Column */}
        <div className="space-y-4">
          <h4 className="font-serif text-xl font-bold tracking-wider text-white">
            WHISK FANTASIES
          </h4>
          <p className="text-sm text-primary-foreground/60 leading-relaxed">
            Whisking your wildest confectionery fantasies into luxurious, mouthwatering realities. Handcrafted cakes designed for the most beautiful moments of life.
          </p>
          <div className="flex gap-4 pt-2">
            <a href="#" className="text-primary-foreground/60 hover:text-white transition-colors" aria-label="Instagram">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
            <a href="#" className="text-primary-foreground/60 hover:text-white transition-colors" aria-label="Facebook">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
              </svg>
            </a>
            <a href="#" className="text-primary-foreground/60 hover:text-white transition-colors" aria-label="Twitter">
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
              </svg>
            </a>
          </div>
        </div>

        {/* Categories Column */}
        <div>
          <h4 className="font-serif text-sm font-semibold tracking-wider text-white uppercase mb-4">
            Boutique Cakes
          </h4>
          <ul className="space-y-2 text-sm text-primary-foreground/60">
            {categories.map((cat) => (
              <li key={cat.name}>
                <Link href={cat.href} className="hover:text-white transition-colors">
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Quick Links Column */}
        <div>
          <h4 className="font-serif text-sm font-semibold tracking-wider text-white uppercase mb-4">
            Services
          </h4>
          <ul className="space-y-2 text-sm text-primary-foreground/60">
            {quickLinks.map((link) => (
              <li key={link.name}>
                <Link href={link.href} className="hover:text-white transition-colors">
                  {link.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact Info Column */}
        <div className="space-y-3 text-sm text-primary-foreground/60">
          <h4 className="font-serif text-sm font-semibold tracking-wider text-white uppercase mb-4">
            Boutique Details
          </h4>
          <div className="flex items-start gap-2.5">
            <MapPin size={18} className="flex-shrink-0 text-accent" />
            <span>Karm Stambh, LBS Marg, Vikhroli, Mumbai</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Phone size={18} className="flex-shrink-0 text-accent" />
            <span>+91 8424 016 876<br />+91 8424 976 876</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Mail size={18} className="flex-shrink-0 text-accent" />
            <span>contact@whiskfantasies.com</span>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-primary-foreground/10 py-6 px-4 sm:px-6 lg:px-8 text-center text-xs text-primary-foreground/40 flex flex-col sm:flex-row items-center justify-between gap-4 mx-auto max-w-7xl">
        <p>&copy; {new Date().getFullYear()} Whisk Fantasies Co. All rights reserved.</p>
        <p className="flex items-center gap-1">
          Crafted with <Heart size={10} className="text-accent fill-accent animate-pulse" /> for luxury culinary lovers.
        </p>
      </div>
    </footer>
  );
};
