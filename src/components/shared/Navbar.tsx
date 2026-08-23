"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, ShoppingBag, Heart, Menu, X, ChevronRight, User, Sun, Moon } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { cn } from "@/utils/cn";

export const Navbar: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { cartCount, setCartOpen } = useCart();
  const { wishlistItems } = useWishlist();
  
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [theme, setTheme] = useState("light");
  const [session, setSession] = useState<any>(null);

  // Fetch the current session dynamically
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch("/api/auth/session");
        const data = await res.json();
        if (res.ok && data.session) {
          setSession(data.session);
        }
      } catch (e) {}
    };
    fetchSession();
  }, []);

  // Load and apply the stored theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("whisk_theme") || "light";
    setTheme(savedTheme);
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    localStorage.setItem("whisk_theme", nextTheme);
    if (nextTheme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/cakes?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/cakes");
    }
  };

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "All Cakes", href: "/cakes" },
    { name: "Birthday Cakes", href: "/cakes?category=Birthday%20Cakes" },
    { name: "Anniversary Cakes", href: "/cakes?category=Anniversary%20Cakes" },
    { name: "Wedding Cakes", href: "/cakes?category=Wedding%20Cakes" },
    { name: "Custom Cakes", href: "/cakes?category=Custom%20Cakes" },
  ];

  // Dynamic user profile routing path
  const profileHref = session
    ? (session.role === "admin" || session.role === "super-admin" ? "/owner" : "/user")
    : "/user";

  return (
    <header className="sticky top-0 z-40 w-full transition-all duration-300 glass border-b border-primary/5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <span className="font-serif text-2xl font-bold tracking-wider text-primary sm:text-3xl">
              WHISK FANTASIES
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-primary/80 hover:text-accent transition-colors duration-200"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Search Bar */}
          <div className="hidden md:flex items-center gap-4 flex-1 max-w-xs justify-end">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                placeholder="Search premium cakes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-full border border-primary/10 bg-background/50 px-4 py-2 pr-10 text-sm text-primary placeholder-primary/45 focus:border-accent focus:outline-none transition-all duration-300"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-primary/50 hover:text-accent"
              >
                <Search size={18} />
              </button>
            </form>
          </div>

          {/* Actions panel */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Theme Switcher Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-primary/85 hover:text-accent transition-colors cursor-pointer"
              aria-label="Toggle Theme Mode"
            >
              {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
            </button>

            {/* Wishlist Link */}
            <Link
              href="/wishlist"
              className="relative p-2 text-primary/85 hover:text-accent transition-colors"
              aria-label="Wishlist"
            >
              <Heart size={22} />
              {wishlistItems.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-white shadow-sm animate-pulse">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* Cart Trigger */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2 text-primary/85 hover:text-accent transition-colors"
              aria-label="Shopping Cart"
            >
              <ShoppingBag size={22} />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white shadow-sm">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Customer profile Dashboard Icon (replaces Sign In/Sign Up text) */}
            <Link
              href={profileHref}
              className="p-2 text-primary/85 hover:text-accent transition-colors"
              aria-label="User Account"
            >
              <User size={22} />
            </Link>

            {/* Mobile hamburger button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-primary lg:hidden hover:text-accent transition-colors cursor-pointer"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation Menu */}
      <div
        className={cn(
          "fixed inset-x-0 top-20 z-30 w-full bg-background border-b border-primary/10 shadow-lg lg:hidden transition-all duration-300 ease-in-out transform origin-top",
          isMobileMenuOpen ? "opacity-100 scale-y-100" : "opacity-0 scale-y-0 pointer-events-none"
        )}
      >
        <div className="flex flex-col p-6 gap-6 max-h-[calc(100vh-5rem)] overflow-y-auto">
          {/* Mobile search */}
          <form onSubmit={handleSearchSubmit} className="relative w-full md:hidden">
            <input
              type="text"
              placeholder="Search premium cakes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-full border border-primary/10 bg-background/50 px-4 py-3 pr-10 text-sm text-primary placeholder-primary/45 focus:border-accent focus:outline-none"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-primary/50"
            >
              <Search size={18} />
            </button>
          </form>

          {/* Links list */}
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center justify-between text-base font-medium text-primary py-2 border-b border-primary/5 hover:text-accent transition-colors"
              >
                {link.name}
                <ChevronRight size={16} className="text-primary/30" />
              </Link>
            ))}
          </div>

          {/* Mobile Theme and User dashboard links */}
          <div className="flex flex-col gap-2 mt-2">
            <Link
              href={profileHref}
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full rounded-full border border-primary/20 py-3 text-center text-sm font-semibold text-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-1.5"
            >
              <User size={16} /> {session ? "My Account Dashboard" : "Sign In / Sign Up"}
            </Link>
            <button
              onClick={() => {
                toggleTheme();
                setIsMobileMenuOpen(false);
              }}
              className="w-full rounded-full bg-primary py-3 text-center text-sm font-semibold text-white hover:bg-accent/90 shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
              {theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
