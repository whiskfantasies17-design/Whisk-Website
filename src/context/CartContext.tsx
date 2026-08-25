"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  flavor: string;
  size: string;
  quantity: number;
  customMessage?: string;
}

interface Coupon {
  code: string;
  discountPercentage: number;
}

interface CartContextType {
  cartItems: CartItem[];
  isCartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  addToCart: (item: Omit<CartItem, "quantity"> & { quantity?: number }) => void;
  removeFromCart: (id: string, flavor: string, size: string) => void;
  updateQuantity: (id: string, flavor: string, size: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartSubtotal: number;
  shippingFee: number;
  appliedCoupon: Coupon | null;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const AVAILABLE_COUPONS: Coupon[] = [
  { code: "LUXURY10", discountPercentage: 10 },
  { code: "WELCOME15", discountPercentage: 15 },
  { code: "WHISK20", discountPercentage: 20 },
];

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setCartOpen] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem("whisk_cart");
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        console.error("Error loading cart from localStorage", e);
      }
    }
    const savedCoupon = localStorage.getItem("whisk_coupon");
    if (savedCoupon) {
      try {
        setAppliedCoupon(JSON.parse(savedCoupon));
      } catch (e) {}
    }
    setIsLoaded(true);
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("whisk_cart", JSON.stringify(cartItems));
    }
  }, [cartItems, isLoaded]);

  // Save coupon to localStorage
  useEffect(() => {
    if (isLoaded) {
      if (appliedCoupon) {
        localStorage.setItem("whisk_coupon", JSON.stringify(appliedCoupon));
      } else {
        localStorage.removeItem("whisk_coupon");
      }
    }
  }, [appliedCoupon, isLoaded]);

  const addToCart = (newItem: Omit<CartItem, "quantity"> & { quantity?: number }) => {
    const quantity = newItem.quantity ?? 1;
    setCartItems((prevItems) => {
      const existingItemIndex = prevItems.findIndex(
        (item) =>
          item.id === newItem.id &&
          item.flavor === newItem.flavor &&
          item.size === newItem.size
      );

      if (existingItemIndex > -1) {
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += quantity;
        return updatedItems;
      }

      return [...prevItems, { ...newItem, quantity }];
    });
    setCartOpen(true); // Proactively slide open the drawer
  };

  const removeFromCart = (id: string, flavor: string, size: string) => {
    setCartItems((prevItems) =>
      prevItems.filter(
        (item) => !(item.id === id && item.flavor === flavor && item.size === size)
      )
    );
  };

  const updateQuantity = (id: string, flavor: string, size: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id, flavor, size);
      return;
    }
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id && item.flavor === flavor && item.size === size
          ? { ...item, quantity }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    setAppliedCoupon(null);
  };

  const applyCoupon = async (code: string): Promise<boolean> => {
    const normalizedCode = code.trim().toUpperCase();
    if (!normalizedCode) return false;

    // 1. Fetch dynamic coupons from backend API
    try {
      const res = await fetch("/api/coupons", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        const serverCoupons = data.coupons || [];
        const matched = serverCoupons.find(
          (c: any) => (c.code || "").trim().toUpperCase() === normalizedCode
        );
        if (matched) {
          setAppliedCoupon({
            code: matched.code,
            discountPercentage: Number(matched.discountPercentage || matched.discount || 10),
          });
          return true;
        }
      }
    } catch (e) {
      console.error("Error checking server coupons", e);
    }

    // 2. Fallback check built-in coupons
    const fallbackCoupon = AVAILABLE_COUPONS.find(
      (c) => c.code.toUpperCase() === normalizedCode
    );
    if (fallbackCoupon) {
      setAppliedCoupon(fallbackCoupon);
      return true;
    }
    return false;
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const cartSubtotal = cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
  
  // Custom luxury logic: Free delivery over ₹1000, else ₹150 flat
  const shippingFee = cartSubtotal > 1000 || cartSubtotal === 0 ? 0 : 150;
  
  const discountAmount = appliedCoupon
    ? (cartSubtotal * appliedCoupon.discountPercentage) / 100
    : 0;

  const cartTotal = Math.max(0, cartSubtotal - discountAmount + shippingFee);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isCartOpen,
        setCartOpen,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartCount,
        cartSubtotal,
        shippingFee,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
