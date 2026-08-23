"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Trash2, Plus, Minus, Ticket, Check, AlertCircle, ShoppingBag, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { motion } from "framer-motion";

export default function CartPage() {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    cartSubtotal,
    shippingFee,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    cartTotal,
  } = useCart();

  const [couponInput, setCouponInput] = useState("");
  const [couponStatus, setCouponStatus] = useState<"idle" | "success" | "error">("idle");

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    const success = applyCoupon(couponInput);
    if (success) {
      setCouponStatus("success");
      setCouponInput("");
      setTimeout(() => setCouponStatus("idle"), 3000);
    } else {
      setCouponStatus("error");
      setTimeout(() => setCouponStatus("idle"), 3000);
    }
  };

  const discountAmount = appliedCoupon
    ? (cartSubtotal * appliedCoupon.discountPercentage) / 100
    : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-primary/5 pb-6">
        <h1 className="font-serif text-3xl font-bold tracking-tight text-primary">
          Your Shopping Basket
        </h1>
        <p className="text-sm text-primary/60 mt-1">
          Review and finalize your luxury selections before proceeding to boutique payment.
        </p>
      </div>

      {cartItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-20 bg-white border border-primary/5 rounded-3xl space-y-4 shadow-sm max-w-md mx-auto">
          <div className="rounded-full bg-secondary/50 p-6 text-primary/20">
            <ShoppingBag size={40} />
          </div>
          <h3 className="font-serif text-lg font-bold text-primary">Your basket is empty</h3>
          <p className="text-sm text-primary/50 max-w-[280px]">
            No boutique cake selections are currently active. Discover our best sellers.
          </p>
          <Link
            href="/cakes"
            className="rounded-full bg-primary px-8 py-3 text-xs font-bold text-white hover:bg-primary/95 transition-all shadow-md"
          >
            Browse Cake Shop
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Items Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white border border-primary/5 rounded-3xl shadow-sm overflow-hidden p-6 divide-y divide-primary/5">
              {cartItems.map((item) => (
                <div key={`${item.id}-${item.flavor}-${item.size}`} className="flex gap-4 py-5 first:pt-0 last:pb-0">
                  {/* Image */}
                  <div className="h-24 w-24 relative flex-shrink-0 overflow-hidden rounded-2xl border border-primary/5 bg-secondary/15">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h3 className="font-serif text-base font-bold text-primary truncate">
                        {item.name}
                      </h3>
                      <p className="text-xs text-primary/60 mt-0.5">
                        Flavor: <span className="font-semibold text-primary">{item.flavor}</span> &bull; Size: <span className="font-semibold text-primary">{item.size}</span>
                      </p>
                      {item.customMessage && (
                        <p className="text-xs text-accent mt-1.5 font-medium italic">
                          &ldquo;{item.customMessage}&rdquo;
                        </p>
                      )}
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center border border-primary/10 rounded-full bg-background">
                        <button
                          onClick={() => updateQuantity(item.id, item.flavor, item.size, item.quantity - 1)}
                          className="px-2.5 py-1 text-primary/50 hover:text-accent font-semibold"
                        >
                          -
                        </button>
                        <span className="px-2 text-xs font-bold text-primary min-w-[15px] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.flavor, item.size, item.quantity + 1)}
                          className="px-2.5 py-1 text-primary/50 hover:text-accent font-semibold"
                        >
                          +
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id, item.flavor, item.size)}
                        className="text-xs text-primary/35 hover:text-destructive font-bold flex items-center gap-1 transition-colors py-1 px-2 hover:bg-destructive/5 rounded-full"
                      >
                        <Trash2 size={12} /> Remove
                      </button>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-right flex-shrink-0">
                    <span className="font-serif text-lg font-bold text-primary">
                      ₹{item.price * item.quantity}
                    </span>
                    <p className="text-[10px] text-primary/45 mt-0.5">₹{item.price} each</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Summary Sidepanel */}
          <div className="space-y-4">
            <div className="bg-white border border-primary/5 rounded-3xl p-6 shadow-sm space-y-6">
              <h2 className="font-serif text-lg font-bold text-primary pb-4 border-b border-primary/5">
                Order Summary
              </h2>

              {/* Coupon inputs */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-primary/50">
                  Promo Coupon Code
                </label>
                <form onSubmit={handleApplyCoupon} className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder={appliedCoupon ? `Applied: ${appliedCoupon.code}` : "LUXURY10"}
                      disabled={!!appliedCoupon}
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="w-full rounded-full border border-primary/10 bg-background px-4 py-2.5 pl-9 text-xs text-primary focus:outline-none focus:border-accent disabled:opacity-60"
                    />
                    <Ticket size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/40" />
                  </div>
                  {appliedCoupon ? (
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="rounded-full border border-destructive/20 bg-background px-4 py-2.5 text-xs font-bold text-destructive hover:bg-destructive/5 cursor-pointer"
                    >
                      Clear
                    </button>
                  ) : (
                    <button
                      type="submit"
                      className="rounded-full bg-primary px-4 py-2.5 text-xs font-bold text-white hover:bg-primary/95 cursor-pointer"
                    >
                      Apply
                    </button>
                  )}
                </form>

                {couponStatus === "success" && (
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                    <Check size={12} /> Coupon applied successfully!
                  </div>
                )}
                {couponStatus === "error" && (
                  <div className="flex items-center gap-1 text-[11px] font-semibold text-destructive">
                    <AlertCircle size={12} /> Invalid coupon code.
                  </div>
                )}
              </div>

              {/* Math list */}
              <div className="space-y-3 text-xs text-primary/70 border-t border-primary/5 pt-4">
                <div className="flex justify-between">
                  <span>Bag Subtotal</span>
                  <span className="font-semibold text-primary">₹{cartSubtotal}</span>
                </div>

                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Coupon Discount ({appliedCoupon.discountPercentage}%)</span>
                    <span>-₹{discountAmount}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Luxury Delivery Courier</span>
                  <span className="font-semibold text-primary">
                    {shippingFee === 0 ? (
                      <span className="text-accent font-semibold">Free Delivery</span>
                    ) : (
                      `₹${shippingFee}`
                    )}
                  </span>
                </div>

                <div className="flex justify-between border-t border-primary/5 pt-4 text-sm font-bold text-primary">
                  <span>Order Total</span>
                  <span className="font-serif text-lg font-bold">₹{cartTotal}</span>
                </div>
              </div>

              {/* Checkout Trigger */}
              <Link
                href="/checkout"
                className="w-full rounded-full bg-primary py-3.5 text-center text-xs font-bold text-white hover:bg-primary/95 shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                Proceed to Checkout
                <ArrowRight size={14} />
              </Link>

              <Link
                href="/cakes"
                className="w-full rounded-full border border-primary/10 bg-transparent py-3 text-center text-xs font-bold text-primary hover:bg-primary/5 flex items-center justify-center gap-1 transition-all"
              >
                Continue Designing
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
