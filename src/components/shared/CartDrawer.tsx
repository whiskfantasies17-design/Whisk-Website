"use client";

import React, { useState } from "react";
import Link from "next/link";
import { X, Trash2, Plus, Minus, Ticket, Check, AlertCircle } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { motion, AnimatePresence } from "framer-motion";

export const CartDrawer: React.FC = () => {
  const {
    cartItems,
    isCartOpen,
    setCartOpen,
    updateQuantity,
    removeFromCart,
    cartSubtotal,
    shippingFee,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    cartTotal,
  } = useCart();

  const [couponCode, setCouponCode] = useState("");
  const [couponStatus, setCouponStatus] = useState<"idle" | "success" | "error">("idle");

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    const success = await applyCoupon(couponCode);
    if (success) {
      setCouponStatus("success");
      setCouponCode("");
      setTimeout(() => setCouponStatus("idle"), 3000);
    } else {
      setCouponStatus("error");
      setTimeout(() => setCouponStatus("idle"), 3000);
    }
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
            className="fixed inset-0 z-50 bg-black"
          />

          {/* Sliding Panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed bottom-0 right-0 top-0 z-50 flex h-full w-full flex-col bg-background shadow-2xl sm:max-w-md border-l border-primary/5"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-primary/5 px-6 py-5">
              <h2 className="font-serif text-lg font-bold text-primary flex items-center gap-2">
                Your Selection
                <span className="text-sm font-sans font-medium text-accent">
                  ({cartItems.length} {cartItems.length === 1 ? "cake" : "cakes"})
                </span>
              </h2>
              <button
                onClick={() => setCartOpen(false)}
                className="rounded-full p-2 text-primary/50 hover:bg-primary/5 hover:text-primary transition-all"
                aria-label="Close drawer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {cartItems.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center space-y-4">
                  <div className="rounded-full bg-secondary/50 p-6 text-primary/30">
                    <Trash2 size={40} />
                  </div>
                  <h3 className="font-serif text-lg font-semibold text-primary">Your cart is empty</h3>
                  <p className="text-sm text-primary/60 max-w-[250px]">
                    Indulge your sweet fantasies. Explore our boutique cakes.
                  </p>
                  <Link
                    href="/cakes"
                    onClick={() => setCartOpen(false)}
                    className="rounded-full bg-primary px-6 py-2.5 text-xs font-semibold text-white hover:bg-primary/90 transition-all shadow-sm"
                  >
                    Browse Collection
                  </Link>
                </div>
              ) : (
                cartItems.map((item, index) => (
                  <motion.div
                    key={`${item.id}-${item.flavor}-${item.size}`}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex gap-4 border-b border-primary/5 pb-4 last:border-b-0"
                  >
                    {/* Cake Image */}
                    <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl border border-primary/5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    {/* Cake details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-serif text-sm font-semibold text-primary truncate">
                        {item.name}
                      </h4>
                      <p className="text-xs text-primary/60 mt-0.5">
                        {item.flavor} &bull; {item.size}
                      </p>

                      {item.customMessage && (
                        <p className="text-[11px] text-accent font-medium mt-1 truncate">
                          &ldquo;{item.customMessage}&rdquo;
                        </p>
                      )}

                      {/* Quantity Controller & Delete */}
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center border border-primary/10 rounded-full bg-background">
                          <button
                            onClick={() => updateQuantity(item.id, item.flavor, item.size, item.quantity - 1)}
                            className="p-1.5 text-primary/60 hover:text-accent"
                          >
                            <Minus size={12} />
                          </button>
                          <span className="px-2 text-xs font-semibold text-primary">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.flavor, item.size, item.quantity + 1)}
                            className="p-1.5 text-primary/60 hover:text-accent"
                          >
                            <Plus size={12} />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.id, item.flavor, item.size)}
                          className="text-primary/30 hover:text-destructive transition-colors p-1"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>

                    {/* Pricing */}
                    <div className="text-right flex-shrink-0">
                      <span className="text-sm font-semibold text-primary">
                        ₹{item.price * item.quantity}
                      </span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer Summary (Only visible when items are present) */}
            {cartItems.length > 0 && (
              <div className="border-t border-primary/5 bg-secondary/10 px-6 py-6 space-y-4">
                {/* Coupon Code Input */}
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder={appliedCoupon ? `Applied: ${appliedCoupon.code}` : "Promo code (LUXURY10)"}
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      disabled={!!appliedCoupon}
                      className="w-full rounded-full border border-primary/10 bg-background px-4 py-2 pl-9 text-xs text-primary focus:border-accent focus:outline-none disabled:opacity-60 transition-all"
                    />
                    <Ticket size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/40" />
                  </div>
                  {appliedCoupon ? (
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="rounded-full border border-destructive/20 bg-background px-4 py-2 text-xs font-semibold text-destructive hover:bg-destructive/5 transition-all"
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary/90 transition-all"
                    >
                      Apply
                    </button>
                  )}
                </form>

                {/* Coupon applied banner feedback */}
                {couponStatus === "success" && (
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
                    <Check size={14} /> Coupon applied successfully!
                  </div>
                )}
                {couponStatus === "error" && (
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-destructive">
                    <AlertCircle size={14} /> Invalid coupon code.
                  </div>
                )}

                {/* Subtotals block */}
                <div className="text-xs space-y-2 text-primary/70">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold text-primary">₹{cartSubtotal}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount ({appliedCoupon.discountPercentage}%)</span>
                      <span className="font-semibold">-₹{(cartSubtotal * appliedCoupon.discountPercentage) / 100}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Shipping</span>
                    <span className="font-semibold text-primary">
                      {shippingFee === 0 ? (
                        <span className="text-accent font-semibold">Free Delivery</span>
                      ) : (
                        `₹${shippingFee}`
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between border-t border-primary/10 pt-3 text-sm font-bold text-primary">
                    <span>Total Estimated</span>
                    <span>₹{cartTotal}</span>
                  </div>
                </div>

                {/* CTA actions */}
                <div className="grid grid-cols-1 gap-2 pt-2">
                  <Link
                    href="/cart"
                    onClick={() => setCartOpen(false)}
                    className="w-full rounded-full bg-primary py-3 text-center text-xs font-bold text-white hover:bg-primary/90 shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    View Cart & Checkout
                  </Link>
                  <button
                    onClick={() => setCartOpen(false)}
                    className="w-full rounded-full border border-primary/10 bg-background py-3 text-center text-xs font-bold text-primary hover:bg-primary/5 transition-all"
                  >
                    Continue Customizing
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
