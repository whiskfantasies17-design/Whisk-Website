"use client";

import React from "react";
import Link from "next/link";
import { Heart, ShoppingBag } from "lucide-react";
import { useWishlist } from "@/context/WishlistContext";
import { ProductCard } from "@/components/customer/ProductCard";

export default function WishlistPage() {
  const { wishlistItems } = useWishlist();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-primary/5 pb-6">
        <h1 className="font-serif text-3xl font-bold tracking-tight text-primary">
          Your Favorites
        </h1>
        <p className="text-sm text-primary/60 mt-1">
          Keep track of the bespoke cake designs you love most.
        </p>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-20 bg-white border border-primary/5 rounded-3xl space-y-4 shadow-sm max-w-md mx-auto">
          <div className="rounded-full bg-secondary/50 p-6 text-primary/20">
            <Heart size={40} />
          </div>
          <h3 className="font-serif text-lg font-bold text-primary">Your wishlist is empty</h3>
          <p className="text-sm text-primary/50 max-w-[280px]">
            No favorited designs are currently active. Explore our boutique gallery.
          </p>
          <Link
            href="/cakes"
            className="rounded-full bg-primary px-8 py-3 text-xs font-bold text-white hover:bg-primary/95 transition-all shadow-md"
          >
            Browse Cake Shop
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {wishlistItems.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
