"use client";

import React from "react";
import Link from "next/link";
import { Heart, Star, ShoppingCart } from "lucide-react";
import { Product } from "@/mock-data/products";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { cn } from "@/utils/cn";

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const isWishlisted = isInWishlist(product.id);

  const handleQuickAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Choose default configurations (first size, first flavor)
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      flavor: product.flavors[0] || "Signature Vanilla",
      size: product.sizes[0] || "1 kg",
    });
  };

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl bg-white border border-primary/5 shadow-sm hover:shadow-md transition-all duration-300">
      {/* Product Image Link */}
      <Link href={`/cakes/${product.id}`} className="relative block aspect-square w-full overflow-hidden bg-secondary/30">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Favorite heart icon */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product);
          }}
          className={cn(
            "absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full shadow-md transition-all duration-300",
            isWishlisted
              ? "bg-accent text-white"
              : "bg-white/80 text-primary/80 hover:bg-white hover:text-accent"
          )}
          aria-label="Add to favorites"
        >
          <Heart size={16} className={cn("transition-transform duration-300 active:scale-125", isWishlisted && "fill-current")} />
        </button>

        {/* Signature Badge */}
        {product.isSignature && (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-primary/90 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
            Signature
          </span>
        )}
      </Link>

      {/* Description & details */}
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-primary/40 mb-1">
          {product.category}
        </span>
        <Link href={`/cakes/${product.id}`} className="hover:text-accent transition-colors">
          <h3 className="font-serif text-sm sm:text-base font-semibold text-primary line-clamp-1">
            {product.name}
          </h3>
        </Link>
        <p className="text-xs text-primary/60 mt-1 line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        {/* Rating and price line */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-1">
            <div className="flex text-amber-400">
              <Star size={14} className="fill-current" />
            </div>
            <span className="text-xs font-bold text-primary">{product.rating}</span>
            <span className="text-[10px] text-primary/45">({product.reviewsCount})</span>
          </div>
          <span className="font-serif text-base sm:text-lg font-bold text-primary">
            ₹{product.price}
          </span>
        </div>

        {/* Quick Add to Cart */}
        <button
          onClick={handleQuickAdd}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-secondary/80 py-2.5 text-xs font-bold text-primary hover:bg-primary hover:text-white transition-all duration-300"
        >
          <ShoppingCart size={14} />
          Add to Cart
        </button>
      </div>
    </div>
  );
};
