"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LogOut, Package, Clock, CheckCircle, Truck, User, MapPin, Phone,
  Edit3, Save, X, ChevronRight, ShoppingBag, Star, AlertCircle, Loader2, MessageSquare
} from "lucide-react";
import { cn } from "@/utils/cn";

interface Order {
  id: string;
  date: string;
  cartItems: any[];
  total: number;
  paymentStatus: string;
  deliveryStatus: string;
  billingInfo: any;
  statusHistory: { status: string; time: string }[];
  subtotal: number;
  shippingFee: number;
  couponApplied: string | null;
}

const TRACKING_STEPS = [
  { label: "Placed", desc: "Order submitted", key: "Placed" },
  { label: "Verified", desc: "Payment approved", key: "Paid" },
  { label: "Confirmed", desc: "Scheduled for baking", key: "Confirmed" },
  { label: "Baking", desc: "In our kitchen", key: "Preparing" },
  { label: "Out for Delivery", desc: "On the way!", key: "Out for Delivery" },
  { label: "Delivered", desc: "Delivered!", key: "Delivered" },
];

function getStepIndex(status: string) {
  return TRACKING_STEPS.findIndex((s) => s.key === status);
}

function isOngoing(order: Order) {
  return order.deliveryStatus !== "Delivered";
}

// ─── Review Form Component ──────────────────────────────────────────────────
function ReviewForm({ order, onReviewed }: { order: Order; onReviewed: () => void }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [selectedProductId, setSelectedProductId] = useState(order.cartItems[0]?.id || "");
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMsg("");
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProductId,
          rating,
          review: reviewText,
          orderId: order.id,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg("✓ Review submitted! Thank you.");
        setReviewText("");
        setTimeout(() => { setOpen(false); onReviewed(); }, 1500);
      } else {
        setMsg(data.error || "Failed to submit review.");
      }
    } catch {
      setMsg("Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-accent/10 text-accent hover:bg-accent hover:text-white transition-all cursor-pointer"
      >
        <Star size={12} /> Leave a Review
      </button>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-md space-y-5">
            <div className="flex justify-between items-center border-b border-primary/5 pb-3">
              <h3 className="font-serif text-lg font-bold text-primary flex items-center gap-2">
                <MessageSquare size={18} className="text-accent" /> Rate Your Order
              </h3>
              <button onClick={() => setOpen(false)} className="text-primary/40 hover:text-primary cursor-pointer"><X size={18} /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Product selector */}
              {order.cartItems.length > 1 && (
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase text-primary/50">Select Product to Review</label>
                  <select
                    value={selectedProductId}
                    onChange={(e) => setSelectedProductId(e.target.value)}
                    className="w-full rounded-full border border-primary/10 bg-background px-4 py-2.5 text-sm text-primary"
                  >
                    {order.cartItems.map((item: any, i: number) => (
                      <option key={i} value={item.id}>{item.name}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Star rating */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-primary/50">Your Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="cursor-pointer transition-transform hover:scale-110"
                    >
                      <Star
                        size={28}
                        className={cn(
                          "transition-colors",
                          star <= (hoverRating || rating) ? "fill-amber-400 text-amber-400" : "text-primary/20"
                        )}
                      />
                    </button>
                  ))}
                  <span className="ml-2 text-sm font-bold text-primary self-center">{rating}/5</span>
                </div>
              </div>

              {/* Review text */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase text-primary/50">Your Review</label>
                <textarea
                  required
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  rows={4}
                  placeholder="Share your experience with this order..."
                  className="w-full rounded-2xl border border-primary/10 bg-background px-4 py-3 text-sm text-primary resize-none focus:outline-none focus:border-accent"
                />
              </div>

              {msg && (
                <p className={cn("text-xs font-semibold px-3 py-2 rounded-xl",
                  msg.startsWith("✓") ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-600 border border-red-100"
                )}>{msg}</p>
              )}

              <div className="flex gap-3">
                <button type="button" onClick={() => setOpen(false)}
                  className="flex-1 py-3 rounded-full border border-primary/10 text-xs font-bold hover:bg-secondary cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="flex-1 py-3 rounded-full bg-accent text-white text-xs font-bold hover:bg-accent/90 cursor-pointer disabled:opacity-60 flex items-center justify-center gap-1.5">
                  {submitting ? <Loader2 size={14} className="animate-spin" /> : <Star size={14} />}
                  {submitting ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Order Card ─────────────────────────────────────────────────────────────
function OrderCard({ order, ongoing, onTrack, onReviewed }: {
  order: Order; ongoing: boolean; onTrack: () => void; onReviewed: () => void;
}) {
  return (
    <div className={cn(
      "bg-white border rounded-2xl p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between shadow-sm",
      ongoing ? "border-amber-100" : "border-emerald-100"
    )}>
      <div className="space-y-1 flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-xs font-bold text-primary">{order.id.slice(0, 20)}...</span>
          <span className={cn(
            "px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase",
            ongoing ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
          )}>
            {ongoing ? "🟠 Ongoing" : "✅ Delivered"}
          </span>
          {order.deliveryStatus === "Out for Delivery" && (
            <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-blue-100 text-blue-700">🛵 Out for Delivery</span>
          )}
        </div>
        <p className="text-xs text-primary/50">{new Date(order.date).toLocaleDateString("en-IN")} · {order.cartItems.length} item(s) · ₹{order.total}</p>
        <p className="text-xs text-primary/60">Status: <span className="font-semibold text-primary">{order.deliveryStatus}</span></p>
      </div>
      <div className="flex items-center gap-2 flex-wrap">
        {!ongoing && <ReviewForm order={order} onReviewed={onReviewed} />}
        <button
          onClick={onTrack}
          className={cn(
            "flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap",
            ongoing
              ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
              : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
          )}
        >
          <Truck size={12} /> {ongoing ? "Track Live" : "View Details"}
        </button>
      </div>
    </div>
  );
}

// ─── Main Dashboard Page ─────────────────────────────────────────────────────
export default function CustomerDashboardPage() {
  const router = useRouter();

  const [session, setSession] = useState<any>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"profile" | "orders" | "track">("profile");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Profile edit state
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");

  const fetchData = async () => {
    try {
      const sRes = await fetch("/api/auth/session");
      const sData = await sRes.json();
      if (sRes.ok && sData.session) {
        setSession(sData.session);
        setEditName(sData.session.name || "");
        setEditPhone(sData.session.phone || "");
        setEditAddress(sData.session.address || "");
      } else {
        router.push("/login");
        return;
      }
      const oRes = await fetch("/api/orders");
      const oData = await oRes.json();
      if (oRes.ok) setOrders(oData.orders);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (e) {}
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    setSaveMsg("");
    try {
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName, phone: editPhone, address: editAddress }),
      });
      if (res.ok) {
        setSession((prev: any) => ({ ...prev, name: editName, phone: editPhone, address: editAddress }));
        setEditing(false);
        setSaveMsg("Profile updated successfully!");
        setTimeout(() => setSaveMsg(""), 3000);
      }
    } catch (e) {
      setSaveMsg("Failed to save. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const ongoingOrders = orders.filter(isOngoing);
  const deliveredOrders = orders.filter((o) => !isOngoing(o));

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 size={36} className="animate-spin text-accent" />
      </div>
    );
  }

  const tabs = [
    { key: "profile", label: "My Profile", icon: User },
    { key: "orders", label: `Orders (${orders.length})`, icon: Package },
    { key: "track", label: "Track Order", icon: Truck },
  ] as const;

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-primary/5 pb-6">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-primary">My Account</h1>
          <p className="text-sm text-primary/55 mt-1">
            Welcome back, <span className="font-semibold text-accent">{session?.name}</span>
          </p>
        </div>
        <button onClick={handleLogout}
          className="flex items-center gap-1.5 rounded-full border border-red-200 px-5 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50 transition-all cursor-pointer">
          <LogOut size={14} /> Log Out
        </button>
      </div>

      {/* Tab Bar */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map((tab) => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all cursor-pointer border",
              activeTab === tab.key
                ? "bg-primary text-white border-primary shadow-md"
                : "bg-white text-primary/70 border-primary/10 hover:border-accent hover:text-accent"
            )}>
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ===== TAB: PROFILE ===== */}
      {activeTab === "profile" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Card */}
          <div className="bg-white border border-primary/5 rounded-3xl p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-lg font-bold text-primary flex items-center gap-2">
                <User size={18} className="text-accent" /> Profile Details
              </h2>
              {!editing ? (
                <button onClick={() => setEditing(true)}
                  className="flex items-center gap-1.5 text-xs font-semibold text-accent hover:underline cursor-pointer">
                  <Edit3 size={13} /> Edit
                </button>
              ) : (
                <button onClick={() => { setEditing(false); setEditName(session?.name || ""); setEditPhone(session?.phone || ""); setEditAddress(session?.address || ""); }}
                  className="flex items-center gap-1.5 text-xs font-semibold text-primary/50 hover:underline cursor-pointer">
                  <X size={13} /> Cancel
                </button>
              )}
            </div>

            {saveMsg && (
              <div className={cn("text-xs font-semibold px-4 py-3 rounded-2xl",
                saveMsg.includes("success") ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-600 border border-red-100")}>
                {saveMsg}
              </div>
            )}

            <div className="space-y-5 text-sm">
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-primary/40">Email</label>
                <p className="font-medium text-primary bg-primary/3 rounded-xl px-4 py-3 border border-primary/5">{session?.email}</p>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-primary/40">Full Name</label>
                {editing ? (
                  <input value={editName} onChange={(e) => setEditName(e.target.value)}
                    className="w-full rounded-xl border border-accent/30 bg-white px-4 py-3 text-sm text-primary focus:outline-none focus:border-accent" />
                ) : (
                  <p className="font-medium text-primary bg-primary/3 rounded-xl px-4 py-3 border border-primary/5">{session?.name || "—"}</p>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-primary/40 flex items-center gap-1"><Phone size={10} /> Phone</label>
                {editing ? (
                  <input value={editPhone} onChange={(e) => setEditPhone(e.target.value)}
                    className="w-full rounded-xl border border-accent/30 bg-white px-4 py-3 text-sm text-primary focus:outline-none focus:border-accent"
                    placeholder="+91 98765 43210" />
                ) : (
                  <p className="font-medium text-primary bg-primary/3 rounded-xl px-4 py-3 border border-primary/5">{session?.phone || "Not set"}</p>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-primary/40 flex items-center gap-1"><MapPin size={10} /> Delivery Address</label>
                {editing ? (
                  <textarea value={editAddress} onChange={(e) => setEditAddress(e.target.value)} rows={3}
                    className="w-full rounded-xl border border-accent/30 bg-white px-4 py-3 text-sm text-primary focus:outline-none focus:border-accent resize-none"
                    placeholder="Flat no, Building, Area, City - Pincode" />
                ) : (
                  <p className="font-medium text-primary bg-primary/3 rounded-xl px-4 py-3 border border-primary/5 leading-relaxed">{session?.address || "Not set"}</p>
                )}
              </div>
              {editing && (
                <button onClick={handleSaveProfile} disabled={saving}
                  className="w-full flex items-center justify-center gap-2 bg-accent hover:bg-accent/90 text-white font-bold py-3.5 rounded-full transition-all text-xs cursor-pointer disabled:opacity-60">
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="space-y-4">
            <div className="bg-white border border-primary/5 rounded-3xl p-6 shadow-sm grid grid-cols-2 gap-4">
              <div className="bg-accent/5 rounded-2xl p-4 text-center space-y-1 border border-accent/10">
                <ShoppingBag size={20} className="mx-auto text-accent" />
                <p className="font-serif text-2xl font-bold text-primary">{orders.length}</p>
                <p className="text-[10px] text-primary/50 font-semibold uppercase">Total Orders</p>
              </div>
              <div className="bg-emerald-50 rounded-2xl p-4 text-center space-y-1 border border-emerald-100">
                <CheckCircle size={20} className="mx-auto text-emerald-600" />
                <p className="font-serif text-2xl font-bold text-emerald-700">{deliveredOrders.length}</p>
                <p className="text-[10px] text-emerald-600 font-semibold uppercase">Delivered</p>
              </div>
              <div className="bg-amber-50 rounded-2xl p-4 text-center space-y-1 border border-amber-100">
                <Clock size={20} className="mx-auto text-amber-600" />
                <p className="font-serif text-2xl font-bold text-amber-700">{ongoingOrders.length}</p>
                <p className="text-[10px] text-amber-600 font-semibold uppercase">Ongoing</p>
              </div>
              <div className="bg-primary/5 rounded-2xl p-4 text-center space-y-1 border border-primary/10">
                <Star size={20} className="mx-auto text-primary" />
                <p className="font-serif text-2xl font-bold text-primary">
                  ₹{orders.reduce((s, o) => s + o.total, 0).toLocaleString("en-IN")}
                </p>
                <p className="text-[10px] text-primary/50 font-semibold uppercase">Total Spent</p>
              </div>
            </div>
            {ongoingOrders.length > 0 && (
              <div className="bg-amber-50 border border-amber-100 rounded-3xl p-5 space-y-3">
                <h3 className="font-serif text-sm font-bold text-amber-800 flex items-center gap-2">
                  <AlertCircle size={16} /> Active Order
                </h3>
                <p className="text-xs text-amber-700">
                  You have <strong>{ongoingOrders.length}</strong> ongoing order(s). Track real-time status below.
                </p>
                <button
                  onClick={() => { setSelectedOrder(ongoingOrders[0]); setActiveTab("track"); }}
                  className="flex items-center gap-1.5 text-xs font-bold text-amber-800 hover:underline cursor-pointer">
                  View Live Status <ChevronRight size={13} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== TAB: ORDERS ===== */}
      {activeTab === "orders" && (
        <div className="space-y-6">
          {orders.length === 0 ? (
            <div className="text-center py-20 bg-white border border-primary/5 rounded-3xl">
              <Package size={40} className="mx-auto text-primary/20 mb-4" />
              <h3 className="font-serif text-lg font-bold text-primary">No Orders Yet</h3>
              <p className="text-sm text-primary/50 mt-2">Browse our cake collection and place your first order!</p>
            </div>
          ) : (
            <>
              {ongoingOrders.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-amber-600 flex items-center gap-2">
                    <Clock size={12} /> Ongoing Orders ({ongoingOrders.length})
                  </h3>
                  {ongoingOrders.map((order) => (
                    <OrderCard key={order.id} order={order} ongoing
                      onTrack={() => { setSelectedOrder(order); setActiveTab("track"); }}
                      onReviewed={fetchData}
                    />
                  ))}
                </div>
              )}
              {deliveredOrders.length > 0 && (
                <div className="space-y-3 mt-6">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-700 flex items-center gap-2">
                    <CheckCircle size={12} /> Previous Orders ({deliveredOrders.length})
                  </h3>
                  {deliveredOrders.map((order) => (
                    <OrderCard key={order.id} order={order} ongoing={false}
                      onTrack={() => { setSelectedOrder(order); setActiveTab("track"); }}
                      onReviewed={fetchData}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ===== TAB: TRACK ORDER ===== */}
      {activeTab === "track" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Order selector */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-primary/50">Select Order</h3>
            {orders.length === 0 ? (
              <p className="text-xs text-primary/40 py-6">No orders to track yet.</p>
            ) : (
              <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
                {orders.map((order) => (
                  <button key={order.id} onClick={() => setSelectedOrder(order)}
                    className={cn(
                      "w-full text-left p-4 rounded-2xl border text-xs transition-all cursor-pointer",
                      selectedOrder?.id === order.id ? "bg-primary border-primary text-white" : "bg-white border-primary/8 text-primary hover:border-accent"
                    )}>
                    <div className="flex justify-between items-start">
                      <span className="font-mono font-bold text-[11px]">{order.id.slice(0, 16)}...</span>
                      <span className={cn(
                        "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase",
                        isOngoing(order) ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                      )}>
                        {isOngoing(order) ? "Ongoing" : "Delivered"}
                      </span>
                    </div>
                    <p className={cn("mt-1", selectedOrder?.id === order.id ? "text-white/60" : "text-primary/45")}>
                      {new Date(order.date).toLocaleDateString("en-IN")} · ₹{order.total}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Tracking detail */}
          <div className="lg:col-span-2">
            {selectedOrder ? (
              <div className="bg-white border border-primary/5 rounded-3xl p-6 sm:p-8 shadow-sm space-y-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-3 border-b border-primary/5 pb-5">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary/40">Order ID</span>
                    <h2 className="font-mono text-sm font-bold text-accent mt-0.5">{selectedOrder.id}</h2>
                    <p className="text-xs text-primary/50 mt-1">Placed: {new Date(selectedOrder.date).toLocaleString("en-IN")}</p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <span className={cn(
                      "px-3 py-1.5 rounded-full text-[10px] font-bold uppercase",
                      isOngoing(selectedOrder) ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"
                    )}>
                      {isOngoing(selectedOrder) ? "🟠 Ongoing" : "✅ Delivered"}
                    </span>
                    <span className={cn(
                      "px-3 py-1.5 rounded-full text-[10px] font-bold uppercase",
                      selectedOrder.paymentStatus === "Verified" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                    )}>
                      Payment: {selectedOrder.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Stepper */}
                <div className="space-y-4 bg-secondary/10 border border-primary/5 rounded-3xl p-6">
                  <h3 className="font-serif text-sm font-bold text-primary flex items-center gap-2">
                    <Truck size={16} className="text-accent" /> Delivery Tracking
                  </h3>
                  <div className="relative flex flex-col md:flex-row justify-between gap-4 mt-4">
                    <div className="absolute top-[18px] left-0 right-0 h-[2px] bg-primary/8 hidden md:block z-0" />
                    {TRACKING_STEPS.map((step, idx) => {
                      const currentIdx = getStepIndex(selectedOrder.deliveryStatus);
                      const done = idx < currentIdx;
                      const active = idx === currentIdx;
                      return (
                        <div key={step.key} className="flex md:flex-col items-center gap-3 md:gap-2 flex-1 relative z-10">
                          <div className={cn(
                            "flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold border shadow-sm transition-all",
                            done ? "bg-emerald-600 border-emerald-600 text-white"
                              : active ? "bg-accent border-accent text-white animate-pulse"
                                : "bg-white border-primary/10 text-primary/40"
                          )}>
                            {done ? "✓" : idx + 1}
                          </div>
                          <div className="text-left md:text-center">
                            <h4 className={cn("text-xs font-bold", active ? "text-accent" : done ? "text-emerald-700" : "text-primary/60")}>{step.label}</h4>
                            <p className="text-[10px] text-primary/40 mt-0.5 md:max-w-[80px] md:mx-auto leading-tight">{step.desc}</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Items + Billing */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-primary border-b border-primary/5 pb-2">Items Ordered</h3>
                    {selectedOrder.cartItems.map((item: any, i: number) => (
                      <div key={i} className="flex gap-3 text-xs">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.image} alt={item.name} className="h-12 w-12 object-cover rounded-xl border border-primary/5 flex-shrink-0" />
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-primary truncate">{item.name}</h4>
                          <p className="text-[10px] text-primary/50">{item.flavor} · {item.size} · Qty {item.quantity}</p>
                        </div>
                        <span className="font-bold text-primary">₹{item.price * item.quantity}</span>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-sm font-bold text-primary border-b border-primary/5 pb-2">Delivery Info</h3>
                    <div className="bg-secondary/10 rounded-2xl p-4 text-xs space-y-2 text-primary/75">
                      <div className="flex justify-between"><span className="text-primary/40 font-semibold uppercase text-[10px]">Recipient</span><span className="font-bold text-primary">{selectedOrder.billingInfo?.name}</span></div>
                      <div className="flex justify-between"><span className="text-primary/40 font-semibold uppercase text-[10px]">Phone</span><span>{selectedOrder.billingInfo?.phone}</span></div>
                      <div><span className="text-primary/40 font-semibold uppercase text-[10px] block mb-1">Address</span><span className="leading-relaxed">{selectedOrder.billingInfo?.address}, {selectedOrder.billingInfo?.zip}</span></div>
                    </div>
                    <div className="text-xs space-y-1.5 pt-1">
                      <div className="flex justify-between"><span className="text-primary/60">Subtotal</span><span className="font-semibold">₹{selectedOrder.subtotal}</span></div>
                      <div className="flex justify-between"><span className="text-primary/60">Delivery</span><span className="font-semibold">₹{selectedOrder.shippingFee}</span></div>
                      {selectedOrder.couponApplied && <div className="flex justify-between text-emerald-600 font-semibold"><span>Coupon ({selectedOrder.couponApplied})</span><span>Applied</span></div>}
                      <div className="flex justify-between font-bold text-primary border-t border-primary/10 pt-2 text-sm"><span>Total Paid</span><span className="font-serif">₹{selectedOrder.total}</span></div>
                    </div>

                    {/* Review button for delivered orders */}
                    {!isOngoing(selectedOrder) && (
                      <div className="pt-3 border-t border-primary/5">
                        <ReviewForm order={selectedOrder} onReviewed={fetchData} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-20 bg-white border border-primary/5 rounded-3xl">
                <Truck size={40} className="text-primary/20 mb-4" />
                <h3 className="font-serif text-lg font-bold text-primary">Select an Order</h3>
                <p className="text-sm text-primary/50 mt-2 max-w-xs">Choose an order from the list to view its real-time delivery tracking.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
