"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Product } from "@/mock-data/products";

interface WishlistContextType {
  wishlistItems: Product[];
  toggleWishlist: (product: Product) => void;
  isInWishlist: (id: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [wishlistItems, setWishlistItems] = useState<Product[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load wishlist from localStorage
  useEffect(() => {
    const savedWishlist = localStorage.getItem("whisk_wishlist");
    if (savedWishlist) {
      try {
        setWishlistItems(JSON.parse(savedWishlist));
      } catch (e) {
        console.error("Error loading wishlist from localStorage", e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Save wishlist to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("whisk_wishlist", JSON.stringify(wishlistItems));
    }
  }, [wishlistItems, isLoaded]);

  const toggleWishlist = (product: Product) => {
    setWishlistItems((prevItems) => {
      const exists = prevItems.some((item) => item.id === product.id);
      if (exists) {
        return prevItems.filter((item) => item.id !== product.id);
      }
      return [...prevItems, product];
    });
  };

  const isInWishlist = (id: string): boolean => {
    return wishlistItems.some((item) => item.id === id);
  };

  return (
    <WishlistContext.Provider value={{ wishlistItems, toggleWishlist, isInWishlist }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};
