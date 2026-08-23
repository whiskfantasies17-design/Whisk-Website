"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { QrCode, UploadCloud, Loader2, Sparkles, ShieldCheck, CheckCircle } from "lucide-react";
import { useCart } from "@/context/CartContext";

interface Settings {
  qrImageUrl: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
  routingNumber: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { cartItems, cartSubtotal, shippingFee, appliedCoupon, cartTotal, clearCart } = useCart();

  // Settings state (QR details)
  const [settings, setSettings] = useState<Settings | null>(null);
  const [session, setSession] = useState<any>(null);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [deliveryZones, setDeliveryZones] = useState<any[]>([]);
  const [detectedZone, setDetectedZone] = useState<any | null>(null);

  // Form inputs
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [zip, setZip] = useState("");
  
  // Screenshot upload state
  const [screenshotBase64, setScreenshotBase64] = useState("");
  const [uploadName, setUploadName] = useState("");
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Load session & settings
  useEffect(() => {
    // Redirect if cart is empty
    if (cartItems.length === 0) {
      router.push("/cart");
      return;
    }

    const loadData = async () => {
      try {
        // Fetch session
        const sessRes = await fetch("/api/auth/session");
        const sessData = await sessRes.json();
        if (sessRes.ok && sessData.session) {
          setSession(sessData.session);
          setName(sessData.session.name || "");
          setPhone(sessData.session.phone || "");
          setAddress(sessData.session.address || "");
        }

        // Fetch settings
        const setRes = await fetch("/api/settings", { cache: "no-store" });
        const setData = await setRes.json();
        if (setRes.ok && setData.settings) {
          setSettings(setData.settings);
        }

        // Fetch delivery zones
        const dzRes = await fetch("/api/delivery", { cache: "no-store" });
        const dzData = await dzRes.json();
        if (dzRes.ok) setDeliveryZones(dzData.zones || []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingSettings(false);
      }
    };

    loadData();
  }, [cartItems, router]);

  // Auto-detect delivery zone from pincode
  useEffect(() => {
    if (!zip || zip.length < 5 || deliveryZones.length === 0) {
      setDetectedZone(null);
      return;
    }
    const matched = deliveryZones.find((z) =>
      (z.pincodes || []).some((pin: string) => pin.trim() === zip.trim())
    );
    setDetectedZone(matched || null);
  }, [zip, deliveryZones]);

  // File Upload base64 converter
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadName(file.name);
    const reader = new FileReader();
    reader.onloadend = () => {
      setScreenshotBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !address || !screenshotBase64) {
      setError("Please complete all shipping fields and upload your transfer screenshot.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartItems,
          billingInfo: { name, phone, address, zip },
          couponApplied: appliedCoupon ? appliedCoupon.code : null,
          subtotal: cartSubtotal,
          shippingFee,
          total: cartTotal,
          paymentScreenshot: screenshotBase64,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Order creation failed.");
      }

      setSuccess(true);
      clearCart();
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingSettings) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 size={40} className="animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-primary/5 pb-6">
        <h1 className="font-serif text-3xl font-bold tracking-tight text-primary">
          Bespoke Checkout
        </h1>
        <p className="text-sm text-primary/60 mt-1">
          Provide delivery coordinates, transfer funds, and upload your screenshot receipt.
        </p>
      </div>

      {success ? (
        <div className="flex flex-col items-center justify-center text-center py-20 bg-white border border-primary/5 rounded-3xl space-y-4 shadow-sm max-w-md mx-auto">
          <div className="rounded-full bg-emerald-50 p-6 text-emerald-600">
            <CheckCircle size={48} className="animate-bounce" />
          </div>
          <h3 className="font-serif text-xl font-bold text-primary">Order Created!</h3>
          <p className="text-sm text-primary/50 max-w-[280px]">
            Your payment is now pending review. Redirecting to your tracking dashboard...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          {/* Shipping Form & Manual Payment QR */}
          <div className="space-y-6">
            <form onSubmit={handlePlaceOrder} className="bg-white border border-primary/5 rounded-3xl p-6 shadow-sm space-y-5">
              <h2 className="font-serif text-lg font-bold text-primary border-b border-primary/5 pb-3">
                1. Delivery Coordinates
              </h2>

              {error && (
                <div className="bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold p-3.5 rounded-xl">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-primary/60">
                    Recipient Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Evelyn Vance"
                    className="w-full rounded-full border border-primary/10 bg-background px-4 py-2.5 text-xs text-primary focus:outline-none focus:border-accent"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-primary/60">
                    Contact Phone *
                  </label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1 (555) 987-6543"
                    className="w-full rounded-full border border-primary/10 bg-background px-4 py-2.5 text-xs text-primary focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-primary/60">
                    Delivery Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="124 Baker St, New York, NY"
                    className="w-full rounded-full border border-primary/10 bg-background px-4 py-2.5 text-xs text-primary focus:outline-none focus:border-accent"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-primary/60">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    required
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    placeholder="400079"
                    maxLength={6}
                    className="w-full rounded-full border border-primary/10 bg-background px-4 py-2.5 text-xs text-primary focus:outline-none focus:border-accent"
                  />
                  {zip.length >= 5 && (
                    detectedZone ? (
                      <p className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 mt-1">
                        ✓ {detectedZone.name} — {detectedZone.fee === 0 ? "Free delivery" : `₹${detectedZone.fee} delivery fee`} · {detectedZone.minDuration}
                      </p>
                    ) : (
                      <p className="text-[10px] text-amber-600 font-semibold mt-1">
                        ⚠ Pincode not in our delivery zones. We may not deliver here.
                      </p>
                    )
                  )}
                </div>
              </div>

              {/* QR payment details */}
              <div className="space-y-5 pt-4 border-t border-primary/5">
                <h2 className="font-serif text-lg font-bold text-primary flex items-center gap-1.5">
                  <QrCode size={20} className="text-accent" />
                  2. Scan & Transfer
                </h2>
                <p className="text-xs text-primary/60 leading-relaxed">
                  Whisk Fantasies uses a secure manual bank clearance protocol. Transfer the total amount to the accounts details below or scan the bank QR code.
                </p>

                {settings && (
                  <div className="flex flex-col sm:flex-row gap-6 items-center bg-secondary/15 rounded-2xl p-4 border border-primary/5">
                    {/* QR Code image */}
                    <div className="h-32 w-32 relative overflow-hidden rounded-xl border border-primary/5 bg-white p-1">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={settings.qrImageUrl}
                        alt="Bank payment QR code"
                        className="h-full w-full object-contain"
                      />
                    </div>
                    {/* Account Info */}
                    <div className="text-xs space-y-1.5 text-primary/80">
                      <div>
                        Bank Name: <span className="font-bold text-primary">{settings.bankName}</span>
                      </div>
                      <div>
                        Account Name: <span className="font-bold text-primary">{settings.accountName}</span>
                      </div>
                      <div>
                        Account No: <span className="font-bold text-primary font-mono">{settings.accountNumber}</span>
                      </div>
                      <div>
                        Routing Code: <span className="font-bold text-primary font-mono">{settings.routingNumber}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Screenshot file upload */}
              <div className="space-y-2 pt-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-primary/60">
                  Upload Payment Receipt Screenshot *
                </label>
                <div className="relative border-2 border-dashed border-primary/10 rounded-2xl bg-secondary/5 hover:bg-secondary/10 transition-colors p-6 text-center cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    required
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center gap-2">
                    <UploadCloud size={32} className="text-accent" />
                    <span className="text-xs font-bold text-primary">
                      {uploadName ? `Receipt: ${uploadName}` : "Click or drag transfer receipt screenshot"}
                    </span>
                    <span className="text-[10px] text-primary/45">PNG, JPG, JPEG up to 5MB</span>
                  </div>
                </div>
                {screenshotBase64 && (
                  <div className="mt-2 relative h-32 w-48 overflow-hidden rounded-xl border border-primary/5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={screenshotBase64}
                      alt="Uploaded transfer receipt thumbnail"
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 rounded-full bg-primary py-4 text-xs font-bold text-white hover:bg-primary/95 shadow-md cursor-pointer disabled:opacity-60"
              >
                {submitting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <>
                    <Sparkles size={14} />
                    Submit Custom Order for Verification
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Checkout billing details right sidebar */}
          <div className="space-y-4">
            <div className="bg-white border border-primary/5 rounded-3xl p-6 shadow-sm space-y-6">
              <h2 className="font-serif text-lg font-bold text-primary border-b border-primary/5 pb-3">
                Couture Selection
              </h2>

              <div className="max-h-60 overflow-y-auto space-y-3">
                {cartItems.map((item) => (
                  <div key={`${item.id}-${item.flavor}-${item.size}`} className="flex gap-3 text-xs">
                    {/* Thumbnail */}
                    <div className="h-12 w-12 relative overflow-hidden rounded-lg border border-primary/5 bg-secondary/15 flex-shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    {/* details */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-primary truncate">{item.name}</h4>
                      <p className="text-[10px] text-primary/50">
                        {item.flavor} &bull; {item.size} &bull; Qty {item.quantity}
                      </p>
                    </div>
                    <span className="font-semibold text-primary text-right">₹{item.price * item.quantity}</span>
                  </div>
                ))}
              </div>

              {/* Math summaries */}
              <div className="border-t border-primary/5 pt-4 space-y-2 text-xs text-primary/70">
                <div className="flex justify-between">
                  <span>Bag Subtotal</span>
                  <span className="font-semibold text-primary">₹{cartSubtotal}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-emerald-600 font-semibold">
                    <span>Discount Coupon ({appliedCoupon.discountPercentage}%)</span>
                    <span>-₹{(cartSubtotal * appliedCoupon.discountPercentage) / 100}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Luxury Delivery Courier</span>
                  <span className="font-semibold text-primary">
                    {shippingFee === 0 ? "Free" : `₹${shippingFee}`}
                  </span>
                </div>
                <div className="flex justify-between border-t border-primary/10 pt-3 text-sm font-bold text-primary">
                  <span>Total Amount Due</span>
                  <span className="font-serif text-lg font-bold text-primary">₹{cartTotal}</span>
                </div>
              </div>

              <div className="bg-secondary/15 border border-primary/5 p-4 rounded-2xl flex gap-2.5 items-start">
                <ShieldCheck size={20} className="text-accent flex-shrink-0 mt-0.5" />
                <p className="text-[10px] text-primary/65 leading-relaxed">
                  Clearance review is completed within 2 hours. Active order updates are tracked in real time on your dashboard.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
