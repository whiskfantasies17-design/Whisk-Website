"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard, ShoppingBag, FolderHeart, Clock, Image, ShoppingCart,
  Users, MessageSquare, Ticket, Map, Landmark, MessageSquareText, Globe,
  BrainCircuit, TrendingUp, LogOut, Plus, Edit, Trash2, Eye, ShieldCheck,
  CheckCircle2, Loader2, Sparkles, Lock
} from "lucide-react";
import { cn } from "@/utils/cn";

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  description: string;
  isSignature?: boolean;
  isCustomizable?: boolean;
  rating?: number;
  reviewsCount?: number;
  occasions?: string[];
  flavors?: string[];
  sizes?: string[];
}

export default function OwnerPage() {
  const router = useRouter();

  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [orderSubTab, setOrderSubTab] = useState<"ongoing" | "past">("ongoing");

  // Owner Login Credentials
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminLoginError, setAdminLoginError] = useState("");
  const [adminSubmitting, setAdminSubmitting] = useState(false);

  // Shared state pools
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [deliveryZones, setDeliveryZones] = useState<any[]>([]);

  // Delivery Zone CRUD states
  const [zoneFormOpen, setZoneFormOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState<any | null>(null);
  const [zoneName, setZoneName] = useState("");
  const [zonePincodes, setZonePincodes] = useState("");
  const [zoneFee, setZoneFee] = useState(0);
  const [zoneDuration, setZoneDuration] = useState("");

  // Form manipulation states
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productFormOpen, setProductFormOpen] = useState(false);
  const [pName, setPName] = useState("");
  const [pPrice, setPPrice] = useState(0);
  const [pCategory, setPCategory] = useState("Chocolate Cakes");
  const [pImage, setPImage] = useState("");
  const [pDesc, setPDesc] = useState("");
  const [pSignature, setPSignature] = useState(false);
  const [pCustomizable, setPCustomizable] = useState(false);
  const [pFlavors, setPFlavors] = useState("");
  const [pSizes, setPSizes] = useState("");

  // Coupon state
  const [couponFormOpen, setCouponFormOpen] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState<any | null>(null);
  const [cCode, setCCode] = useState("");
  const [cDiscount, setCDiscount] = useState(10);
  const [cActive, setCActive] = useState(true);

  // Category state
  const [categoryFormOpen, setCategoryFormOpen] = useState(false);
  const [catName, setCatName] = useState("");
  const [catImage, setCatImage] = useState("");
  const [catSlug, setCatSlug] = useState("");

  // Banner state
  const [bannerFormOpen, setBannerFormOpen] = useState(false);
  const [bTitle, setBTitle] = useState("");
  const [bSubtitle, setBSubtitle] = useState("");
  const [bImage, setBImage] = useState("");

  // Inspecting Order state
  const [inspectingOrder, setInspectingOrder] = useState<any | null>(null);

  const fetchAllData = async () => {
    try {
      // 1. Session check
      const sRes = await fetch("/api/auth/session");
      const sData = await sRes.json();
      if (sRes.ok && sData.session && (sData.session.role === "admin" || sData.session.role === "super-admin")) {
        setSession(sData.session);
      } else {
        setSession(null);
        setLoading(false);
        return;
      }

      // 2. Fetch products
      const pRes = await fetch("/api/products");
      const pData = await pRes.json();
      if (pRes.ok) setProducts(pData.products);

      // 3. Fetch orders
      const oRes = await fetch("/api/orders");
      const oData = await oRes.json();
      if (oRes.ok) setOrders(oData.orders);

      // 4. Fetch categories
      const cRes = await fetch("/api/categories");
      const cData = await cRes.json();
      if (cRes.ok) setCategories(cData.categories);

      // 5. Fetch banners
      const bRes = await fetch("/api/banners");
      const bData = await bRes.json();
      if (bRes.ok) setBanners(bData.banners);

      // 6. Fetch coupons
      const cpRes = await fetch("/api/coupons");
      const cpData = await cpRes.json();
      if (cpRes.ok) setCoupons(cpData.coupons);

      // 7. Fetch settings
      const stRes = await fetch("/api/settings");
      const stData = await stRes.json();
      if (stRes.ok) setSettings(stData.settings);

      // 8. Fetch delivery zones
      const dzRes = await fetch("/api/delivery");
      const dzData = await dzRes.json();
      if (dzRes.ok) setDeliveryZones(dzData.zones);

    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminSubmitting(true);
    setAdminLoginError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: adminEmail, password: adminPassword }),
      });
      const data = await res.json();
      const loggedUser = data.user || data.session;
      if (res.ok && loggedUser && (loggedUser.role === "admin" || loggedUser.role === "super-admin")) {
        setSession(loggedUser);
        setLoading(true);
        await fetchAllData();
      } else {
        setAdminLoginError(data.error || "Access denied. Only store owners and administrators can access this panel.");
      }
    } catch (err: any) {
      setAdminLoginError("Something went wrong. Please try again.");
    } finally {
      setAdminSubmitting(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setSession(null);
      setAdminEmail("");
      setAdminPassword("");
    } catch (e) {}
  };

  // Base64 file converter helper
  const handleFileChangeHelper = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setter(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // ── Handlers for CRUD ──
  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to remove this product?")) return;
    try {
      const res = await fetch(`/api/products?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchAllData();
    } catch (e) {}
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      id: selectedProduct ? selectedProduct.id : `prod-${Date.now()}`,
      name: pName,
      price: Number(pPrice),
      category: pCategory,
      image: pImage || "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80",
      description: pDesc,
      isSignature: pSignature,
      isCustomizable: pCustomizable,
      flavors: pFlavors ? pFlavors.split(",").map((s) => s.trim()) : ["Standard"],
      sizes: pSizes ? pSizes.split(",").map((s) => s.trim()) : ["0.5 kg", "1 kg"],
    };

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setProductFormOpen(false);
        fetchAllData();
      }
    } catch (e) {}
  };

  const openProductForm = (prod?: Product) => {
    if (prod) {
      setSelectedProduct(prod);
      setPName(prod.name);
      setPPrice(prod.price);
      setPCategory(prod.category);
      setPImage(prod.image);
      setPDesc(prod.description);
      setPSignature(prod.isSignature || false);
      setPCustomizable(prod.isCustomizable || false);
      setPFlavors(prod.flavors ? prod.flavors.join(", ") : "");
      setPSizes(prod.sizes ? prod.sizes.join(", ") : "");
    } else {
      setSelectedProduct(null);
      setPName(""); setPPrice(599); setPCategory("Chocolate Cakes"); setPImage(""); setPDesc("");
      setPSignature(false); setPCustomizable(false); setPFlavors("Chocolate, Nutella"); setPSizes("0.5 kg, 1 kg");
    }
    setProductFormOpen(true);
  };

  const handleSaveCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { code: cCode.toUpperCase(), discountPercentage: Number(cDiscount), active: cActive };
    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setCouponFormOpen(false);
        fetchAllData();
      }
    } catch (e) {}
  };

  const openCouponForm = (cp?: any) => {
    if (cp) {
      setSelectedCoupon(cp);
      setCCode(cp.code);
      setCDiscount(cp.discountPercentage);
      setCActive(cp.active);
    } else {
      setSelectedCoupon(null);
      setCCode(""); setCDiscount(15); setCActive(true);
    }
    setCouponFormOpen(true);
  };

  const handleDeleteCoupon = async (code: string) => {
    if (!confirm(`Delete coupon ${code}?`)) return;
    try {
      const res = await fetch(`/api/coupons?code=${code}`, { method: "DELETE" });
      if (res.ok) fetchAllData();
    } catch (e) {}
  };

  const handleVerifyOrderPayment = async (orderId: string) => {
    try {
      const res = await fetch("/api/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, paymentStatus: "Verified", deliveryStatus: "Paid" })
      });
      if (res.ok) {
        if (inspectingOrder && inspectingOrder.id === orderId) {
          setInspectingOrder({ ...inspectingOrder, paymentStatus: "Verified", deliveryStatus: "Paid" });
        }
        fetchAllData();
      }
    } catch (e) {}
  };

  const handleUpdateDeliveryStep = async (orderId: string, step: string) => {
    try {
      const res = await fetch("/api/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, deliveryStatus: step })
      });
      if (res.ok) {
        if (inspectingOrder && inspectingOrder.id === orderId) {
          setInspectingOrder({ ...inspectingOrder, deliveryStatus: step });
        }
        fetchAllData();
      }
    } catch (e) {}
  };

  const handleSaveSettings = async (updatedSettings: any) => {
    setSettings(updatedSettings);
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedSettings)
      });
      if (res.ok) fetchAllData();
    } catch (e) {}
  };

  // Sidebar Menu mapping
  const adminMenu = [
    { name: "Dashboard", icon: LayoutDashboard },
    { name: "Products", icon: ShoppingBag },
    { name: "Categories", icon: FolderHeart },
    { name: "Offers Manager", icon: Clock },
    { name: "Hero Banners", icon: Image },
    { name: "Orders list", icon: ShoppingCart },
    { name: "Customers base", icon: Users },
    { name: "Reviews base", icon: MessageSquare },
    { name: "Coupons list", icon: Ticket },
    { name: "Delivery Zones", icon: Map },
    { name: "Payment Settings", icon: Landmark },
    { name: "WhatsApp Rules", icon: MessageSquareText },
    { name: "Website config", icon: Globe },
    { name: "AI Chatbot rules", icon: BrainCircuit },
    { name: "Analytics view", icon: TrendingUp },
  ];

  // Dashboard Stats calculations
  const totalRevenue = orders.reduce((sum, o) => sum + (o.paymentStatus === "Verified" ? o.total : 0), 0);
  const totalQuantityCakes = orders.reduce((sum, o) => sum + o.cartItems.reduce((acc: number, item: any) => acc + item.quantity, 0), 0);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-primary text-white">
        <Loader2 size={40} className="animate-spin text-accent" />
      </div>
    );
  }

  // ── Standalone Owner Login Screen ──
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary text-white p-4">
        <div className="w-full max-w-md bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-accent/20 border border-accent/40 flex items-center justify-center text-accent">
              <Lock size={24} />
            </div>
            <span className="text-[10px] font-bold tracking-widest text-accent uppercase block pt-2">
              Whisk Fantasies Owner Portal
            </span>
            <h1 className="font-serif text-3xl font-bold tracking-wider">
              OWNER LOGIN
            </h1>
            <p className="text-xs text-white/60">
              Enter your owner credentials to access administration & store controls.
            </p>
          </div>

          {adminLoginError && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold p-4 rounded-2xl">
              {adminLoginError}
            </div>
          )}

          <form onSubmit={handleAdminLoginSubmit} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-white/70 uppercase tracking-wider text-[10px]">
                Owner Email
              </label>
              <input
                type="email"
                required
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="whiskfantasies17@gmail.com"
                className="w-full rounded-full border border-white/10 bg-white/5 px-5 py-3 text-white focus:outline-none focus:border-accent"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-white/70 uppercase tracking-wider text-[10px]">
                Password
              </label>
              <input
                type="password"
                required
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-full border border-white/10 bg-white/5 px-5 py-3 text-white focus:outline-none focus:border-accent"
              />
            </div>

            <button
              type="submit"
              disabled={adminSubmitting}
              className="w-full rounded-full bg-accent text-white py-3.5 font-bold hover:bg-accent/90 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg disabled:opacity-60 text-xs"
            >
              {adminSubmitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  <Sparkles size={14} /> Log In to Owner Portal
                </>
              )}
            </button>
          </form>

          <div className="pt-2 text-center border-t border-white/5">
            <a href="/" className="text-[11px] text-white/40 hover:text-white transition-colors">
              ← Return to Main Storefront
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ── Authenticated Owner Panel ──
  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row text-primary">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-primary text-white p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-primary/10">
        <div className="space-y-8">
          <div>
            <span className="text-[9px] uppercase tracking-widest text-accent font-bold">Store Administration</span>
            <h1 className="font-serif text-xl font-bold tracking-tight mt-0.5">Whisk Owner</h1>
          </div>

          <nav className="space-y-1 text-xs">
            {adminMenu.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.name;
              return (
                <button
                  key={item.name}
                  onClick={() => setActiveTab(item.name)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-2.5 rounded-2xl font-semibold transition-all cursor-pointer text-left",
                    isActive ? "bg-accent text-white shadow-md" : "text-white/70 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <Icon size={16} />
                  {item.name}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="pt-6 border-t border-white/10 mt-6">
          <div className="flex items-center justify-between text-xs">
            <div>
              <p className="font-bold">{session?.name}</p>
              <p className="text-[10px] text-white/50">{session?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-xl hover:bg-red-500/20 text-white/60 hover:text-red-400 transition-colors cursor-pointer"
              title="Logout"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto max-h-screen">
        <div className="flex justify-between items-center border-b border-primary/5 pb-4">
          <div>
            <h2 className="font-serif text-2xl font-bold text-primary">{activeTab}</h2>
            <p className="text-xs text-primary/50 mt-0.5">Manage live parameters and store confections</p>
          </div>
        </div>

        {/* 1. Dashboard Overview Tab */}
        {activeTab === "Dashboard" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white border border-primary/5 rounded-3xl p-6 shadow-sm space-y-1">
                <span className="text-[10px] font-bold text-primary/45 uppercase tracking-wider">Total Orders Cleared</span>
                <p className="font-serif text-3xl font-bold text-primary">{orders.length}</p>
              </div>
              <div className="bg-white border border-primary/5 rounded-3xl p-6 shadow-sm space-y-1">
                <span className="text-[10px] font-bold text-primary/45 uppercase tracking-wider">Total Verified Revenue</span>
                <p className="font-serif text-3xl font-bold text-emerald-600">₹{totalRevenue.toLocaleString("en-IN")}</p>
              </div>
              <div className="bg-white border border-primary/5 rounded-3xl p-6 shadow-sm space-y-1">
                <span className="text-[10px] font-bold text-primary/45 uppercase tracking-wider">Total Confections Baked</span>
                <p className="font-serif text-3xl font-bold text-accent">{totalQuantityCakes}</p>
              </div>
            </div>

            <div className="bg-white border border-primary/5 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="font-serif text-base font-bold text-primary">Recent Orders Overview</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-primary/10 text-primary/45 uppercase font-bold">
                      <th className="pb-3">Order ID</th>
                      <th className="pb-3">Customer</th>
                      <th className="pb-3">Amount</th>
                      <th className="pb-3">Payment</th>
                      <th className="pb-3">Delivery Step</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 5).map((o) => (
                      <tr key={o.id} className="border-b border-primary/5 last:border-b-0 hover:bg-secondary/10">
                        <td className="py-3 font-mono font-bold text-accent">{o.id.slice(0, 15)}...</td>
                        <td className="py-3 font-semibold">{o.userName}</td>
                        <td className="py-3 font-bold">₹{o.total}</td>
                        <td className="py-3">
                          <span className={cn(
                            "px-2 py-0.5 rounded-full text-[9px] font-bold uppercase",
                            o.paymentStatus === "Verified" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                          )}>
                            {o.paymentStatus}
                          </span>
                        </td>
                        <td className="py-3 font-semibold text-primary/70">{o.deliveryStatus}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 2. Products Tab */}
        {activeTab === "Products" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <span className="text-xs text-primary/60">Total Products: {products.length}</span>
              <button
                onClick={() => openProductForm()}
                className="rounded-full bg-primary px-5 py-2.5 text-xs font-bold text-white hover:bg-primary/95 flex items-center gap-1 shadow-md cursor-pointer"
              >
                <Plus size={16} /> Add Product
              </button>
            </div>

            {/* Product Form Modal */}
            {productFormOpen && (
              <div className="fixed inset-0 z-50 bg-black/45 flex items-center justify-center p-4">
                <div className="bg-white border border-primary/5 rounded-3xl p-6 shadow-2xl w-full max-w-lg space-y-5 max-h-[90vh] overflow-y-auto">
                  <h2 className="font-serif text-lg font-bold text-primary border-b border-primary/5 pb-3">
                    {selectedProduct ? "Edit Confection" : "Add New Confection"}
                  </h2>
                  <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
                    <div className="space-y-1">
                      <label className="font-bold text-primary/60 uppercase">Product Name</label>
                      <input type="text" required value={pName} onChange={(e) => setPName(e.target.value)}
                        className="w-full rounded-full border border-primary/10 bg-background px-4 py-2.5 text-primary" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="font-bold text-primary/60 uppercase">Price (₹)</label>
                        <input type="number" required value={pPrice} onChange={(e) => setPPrice(Number(e.target.value))}
                          className="w-full rounded-full border border-primary/10 bg-background px-4 py-2.5 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-primary/60 uppercase">Category</label>
                        <select value={pCategory} onChange={(e) => setPCategory(e.target.value)}
                          className="w-full rounded-full border border-primary/10 bg-background px-4 py-2.5 text-primary">
                          <option value="Chocolate Cakes">Chocolate Cakes</option>
                          <option value="Non-Chocolate Cakes">Non-Chocolate Cakes</option>
                          <option value="Fusion Cakes">Fusion Cakes</option>
                          <option value="Cheesecakes">Cheesecakes</option>
                          <option value="Tea Cakes">Tea Cakes</option>
                          <option value="Cupcakes">Cupcakes</option>
                          <option value="Brownies">Brownies</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-primary/60 uppercase">Image URL</label>
                      <input type="text" value={pImage} onChange={(e) => setPImage(e.target.value)}
                        placeholder="https://..." className="w-full rounded-full border border-primary/10 bg-background px-4 py-2.5 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-primary/60 uppercase">Description</label>
                      <textarea value={pDesc} onChange={(e) => setPDesc(e.target.value)} rows={3}
                        className="w-full rounded-2xl border border-primary/10 bg-background px-4 py-2.5 text-primary resize-none" />
                    </div>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={pSignature} onChange={(e) => setPSignature(e.target.checked)} />
                        <span>Signature Selection</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={pCustomizable} onChange={(e) => setPCustomizable(e.target.checked)} />
                        <span>Customizable</span>
                      </label>
                    </div>
                    <div className="flex gap-3 pt-2 justify-end">
                      <button type="button" onClick={() => setProductFormOpen(false)}
                        className="rounded-full border border-primary/15 px-5 py-2 text-xs font-bold hover:bg-secondary cursor-pointer">Cancel</button>
                      <button type="submit"
                        className="rounded-full bg-primary text-white px-5 py-2 text-xs font-bold hover:bg-primary/95 cursor-pointer">Save Confection</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div className="bg-white border border-primary/5 rounded-3xl p-6 shadow-sm overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-primary/10 text-primary/45 uppercase font-bold">
                    <th className="pb-3">Name</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3">Price</th>
                    <th className="pb-3">Rating</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id} className="border-b border-primary/5 last:border-b-0 hover:bg-secondary/10">
                      <td className="py-4 font-bold text-primary">{p.name}</td>
                      <td className="py-4 text-primary/60">{p.category}</td>
                      <td className="py-4 font-bold">₹{p.price}</td>
                      <td className="py-4 text-amber-500 font-bold">★ {p.rating}</td>
                      <td className="py-4 text-right space-x-1">
                        <button onClick={() => openProductForm(p)} className="p-1.5 text-primary/50 hover:text-accent cursor-pointer"><Edit size={14} /></button>
                        <button onClick={() => handleDeleteProduct(p.id)} className="p-1.5 text-primary/50 hover:text-red-500 cursor-pointer"><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 6. Orders Inspection workspace — split Ongoing / Past */}
        {activeTab === "Orders list" && (
          <div className="space-y-6">
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setOrderSubTab("ongoing")}
                className={cn("flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold border transition-all cursor-pointer",
                  orderSubTab === "ongoing" ? "bg-amber-500 text-white border-amber-500 shadow" : "bg-white text-primary/70 border-primary/10 hover:border-amber-400"
                )}
              >
                🟠 Ongoing Orders ({orders.filter((o: any) => o.deliveryStatus !== "Delivered").length})
              </button>
              <button
                onClick={() => setOrderSubTab("past")}
                className={cn("flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold border transition-all cursor-pointer",
                  orderSubTab === "past" ? "bg-emerald-600 text-white border-emerald-600 shadow" : "bg-white text-primary/70 border-primary/10 hover:border-emerald-400"
                )}
              >
                ✅ Past Orders ({orders.filter((o: any) => o.deliveryStatus === "Delivered").length})
              </button>
            </div>

            <div className="bg-white border border-primary/5 rounded-3xl p-6 shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-primary/10 text-primary/45 uppercase font-bold">
                      <th className="pb-3">Order ID</th>
                      <th className="pb-3">Date</th>
                      <th className="pb-3">Customer</th>
                      <th className="pb-3">Total Amount</th>
                      <th className="pb-3">Payment verification</th>
                      <th className="pb-3">Delivery step</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const displayOrders = orders.filter((o: any) =>
                        orderSubTab === "ongoing" ? o.deliveryStatus !== "Delivered" : o.deliveryStatus === "Delivered"
                      );
                      if (displayOrders.length === 0) {
                        return (
                          <tr><td colSpan={7} className="py-10 text-center text-xs text-primary/40">
                            {orderSubTab === "ongoing" ? "No ongoing orders." : "No delivered orders yet."}
                          </td></tr>
                        );
                      }
                      return displayOrders.map((o: any) => (
                        <tr key={o.id} className="border-b border-primary/5 last:border-b-0 hover:bg-secondary/10">
                          <td className="py-4 font-mono font-bold text-accent">{o.id.slice(0, 15)}...</td>
                          <td className="py-4 text-primary/60">{new Date(o.date).toLocaleDateString("en-IN")}</td>
                          <td className="py-4 font-semibold">{o.userName}</td>
                          <td className="py-4 font-bold">₹{o.total}</td>
                          <td className="py-4">
                            <span className={cn(
                              "px-2.5 py-0.5 rounded-full font-bold uppercase text-[9px]",
                              o.paymentStatus === "Verified" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                            )}>
                              {o.paymentStatus}
                            </span>
                          </td>
                          <td className="py-4">
                            <span className={cn(
                              "font-semibold rounded-full px-2.5 py-0.5 text-[9px] uppercase",
                              o.deliveryStatus === "Delivered" ? "bg-emerald-100 text-emerald-800"
                              : o.deliveryStatus === "Out for Delivery" ? "bg-blue-100 text-blue-800"
                              : o.deliveryStatus === "Preparing" ? "bg-orange-100 text-orange-800"
                              : "bg-secondary/30 text-primary/75"
                            )}>{o.deliveryStatus}</span>
                          </td>
                          <td className="py-4 text-right">
                            <button
                              onClick={() => setInspectingOrder(o)}
                              className="rounded-full bg-secondary/80 hover:bg-primary hover:text-white px-3 py-1.5 font-bold transition-all flex items-center gap-1 text-[10px] ml-auto cursor-pointer"
                            >
                              <Eye size={12} /> Inspect
                            </button>
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </div>

            {inspectingOrder && (
              <div className="fixed inset-0 z-50 bg-black/45 flex items-center justify-center p-4">
                <div className="bg-white border border-primary/5 rounded-3xl p-6 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto space-y-6">
                  <div className="flex justify-between items-baseline border-b border-primary/5 pb-3">
                    <h2 className="font-serif text-lg font-bold text-primary">
                      Order Details: <span className="font-mono text-accent">{inspectingOrder.id}</span>
                    </h2>
                    <button onClick={() => setInspectingOrder(null)} className="text-xs text-primary/45 font-bold hover:text-primary">Close</button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-bold text-xs uppercase tracking-wider text-primary/60">Confectioneries</h3>
                      <div className="space-y-2">
                        {inspectingOrder.cartItems.map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between text-xs border-b border-primary/5 pb-2">
                            <div>
                              <span className="font-semibold">{item.name}</span>
                              <span className="block text-[10px] text-primary/45">{item.flavor} &bull; {item.size} &bull; Qty {item.quantity}</span>
                            </div>
                            <span className="font-bold">₹{item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-2 pt-2">
                        <h3 className="font-bold text-xs uppercase tracking-wider text-primary/60">Receipt Screenshot</h3>
                        {inspectingOrder.paymentScreenshot ? (
                          <div className="relative aspect-video rounded-xl overflow-hidden border border-primary/5 bg-secondary/15">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={inspectingOrder.paymentScreenshot} alt="Payment Receipt Screenshot" className="h-full w-full object-contain" />
                          </div>
                        ) : (
                          <div className="p-4 text-center border border-dashed border-primary/10 rounded-xl text-primary/45 text-xs">No screenshot uploaded.</div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="space-y-2">
                        <h3 className="font-bold text-xs uppercase tracking-wider text-primary/60">Recipient Address</h3>
                        <div className="bg-secondary/15 rounded-2xl p-4 border border-primary/5 text-xs space-y-1.5">
                          <div>Name: <span className="font-semibold">{inspectingOrder.billingInfo?.name}</span></div>
                          <div>Phone: <span className="font-semibold">{inspectingOrder.billingInfo?.phone}</span></div>
                          <div>Address: <span className="font-semibold">{inspectingOrder.billingInfo?.address}, {inspectingOrder.billingInfo?.zip}</span></div>
                        </div>
                      </div>

                      <div className="space-y-3 bg-secondary/10 p-5 rounded-2xl border border-primary/5 text-xs">
                        <h4 className="font-bold uppercase tracking-wider text-primary/60 border-b border-primary/5 pb-2">Admin Actions</h4>
                        
                        {inspectingOrder.paymentStatus !== "Verified" ? (
                          <button
                            onClick={() => handleVerifyOrderPayment(inspectingOrder.id)}
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-full flex items-center justify-center gap-1 transition-all cursor-pointer"
                          >
                            <ShieldCheck size={14} /> Approve Payment Clearances
                          </button>
                        ) : (
                          <div className="text-emerald-700 font-bold flex items-center gap-1.5 py-1.5">
                            <CheckCircle2 size={16} /> Payment Verified & Cleared!
                          </div>
                        )}

                        <div className="space-y-1.5 pt-2">
                           <label className="font-bold uppercase text-[10px] text-primary/50">Update Delivery Step</label>
                           <div className="grid grid-cols-2 gap-1.5">
                             {["Placed", "Paid", "Confirmed", "Preparing", "Out for Delivery", "Delivered"].map((step) => (
                               <button
                                 key={step}
                                 onClick={() => handleUpdateDeliveryStep(inspectingOrder.id, step)}
                                 className={cn(
                                   "py-2 rounded-full font-bold transition-all cursor-pointer text-[10px]",
                                   inspectingOrder.deliveryStatus === step
                                     ? "bg-accent text-white shadow-md"
                                     : "bg-white border border-primary/10 text-primary hover:border-accent"
                                 )}
                               >
                                 {step === "Out for Delivery" ? "🛵 Out for Delivery" : step === "Delivered" ? "✅ Delivered" : step}
                               </button>
                             ))}
                           </div>
                         </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 10. Delivery Zones CRUD */}
        {activeTab === "Delivery Zones" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-serif text-lg font-bold text-primary">Delivery Zones</h3>
                <p className="text-xs text-primary/50 mt-1">Add pincodes and delivery fees. Customers entering a pincode at checkout will be auto-charged the correct delivery fee.</p>
              </div>
              <button
                onClick={() => {
                  setSelectedZone(null);
                  setZoneName(""); setZonePincodes(""); setZoneFee(0); setZoneDuration("");
                  setZoneFormOpen(true);
                }}
                className="rounded-full bg-primary px-5 py-2.5 text-xs font-bold text-white hover:bg-primary/95 flex items-center gap-1 shadow-md cursor-pointer"
              >
                <Plus size={16} /> Add Zone
              </button>
            </div>

            {zoneFormOpen && (
              <div className="fixed inset-0 z-50 bg-black/45 flex items-center justify-center p-4">
                <div className="bg-white border border-primary/5 rounded-3xl p-6 shadow-2xl w-full max-w-lg space-y-5">
                  <h2 className="font-serif text-lg font-bold text-primary border-b border-primary/5 pb-3">
                    {selectedZone ? "Edit Delivery Zone" : "Add New Zone"}
                  </h2>
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const pincodeArray = zonePincodes.split(",").map((p) => p.trim()).filter(Boolean);
                      const payload = selectedZone
                        ? deliveryZones.map((z) => z.id === selectedZone.id
                          ? { ...z, name: zoneName, pincodes: pincodeArray, fee: Number(zoneFee), minDuration: zoneDuration }
                          : z)
                        : [...deliveryZones, { id: `zone-${Date.now()}`, name: zoneName, pincodes: pincodeArray, fee: Number(zoneFee), minDuration: zoneDuration }];
                      try {
                        const res = await fetch("/api/delivery", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify(payload),
                        });
                        if (res.ok) { setZoneFormOpen(false); fetchAllData(); }
                      } catch (err) {}
                    }}
                    className="space-y-4 text-xs"
                  >
                    <div className="space-y-1">
                      <label className="font-bold text-primary/60 uppercase">Zone Name</label>
                      <input type="text" required value={zoneName} onChange={(e) => setZoneName(e.target.value)}
                        placeholder="e.g. Thane West" className="w-full rounded-full border border-primary/10 bg-background px-4 py-2.5 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-primary/60 uppercase">Pincodes (comma-separated)</label>
                      <textarea required value={zonePincodes} onChange={(e) => setZonePincodes(e.target.value)}
                        rows={3} placeholder="400079, 400083, 400601"
                        className="w-full rounded-2xl border border-primary/10 bg-background px-4 py-2.5 text-primary resize-none" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="font-bold text-primary/60 uppercase">Delivery Fee (₹)</label>
                        <input type="number" min={0} required value={zoneFee} onChange={(e) => setZoneFee(Number(e.target.value))}
                          className="w-full rounded-full border border-primary/10 bg-background px-4 py-2.5 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-primary/60 uppercase">Est. Duration</label>
                        <input type="text" required value={zoneDuration} onChange={(e) => setZoneDuration(e.target.value)}
                          placeholder="e.g. 2–3 hours" className="w-full rounded-full border border-primary/10 bg-background px-4 py-2.5 text-primary" />
                      </div>
                    </div>
                    <div className="flex gap-3 pt-2 justify-end">
                      <button type="button" onClick={() => setZoneFormOpen(false)}
                        className="rounded-full border border-primary/15 px-5 py-2 text-xs font-bold hover:bg-secondary cursor-pointer">Cancel</button>
                      <button type="submit"
                        className="rounded-full bg-primary text-white px-5 py-2 text-xs font-bold hover:bg-primary/95 cursor-pointer">
                        {selectedZone ? "Update Zone" : "Save Zone"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div className="bg-white border border-primary/5 rounded-3xl p-6 shadow-sm overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-primary/10 text-primary/45 uppercase font-bold text-[10px] tracking-wider">
                    <th className="pb-3">Zone Name</th>
                    <th className="pb-3">Pincodes</th>
                    <th className="pb-3">Delivery Fee</th>
                    <th className="pb-3">Est. Duration</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveryZones.map((zone) => (
                    <tr key={zone.id} className="border-b border-primary/5 last:border-b-0 hover:bg-secondary/10">
                      <td className="py-4 font-bold text-primary">{zone.name}</td>
                      <td className="py-4 max-w-[220px]">
                        <div className="flex flex-wrap gap-1">
                          {(zone.pincodes || []).slice(0, 4).map((pin: string) => (
                            <span key={pin} className="px-2 py-0.5 bg-primary/5 rounded-full font-mono text-[10px] text-primary">{pin}</span>
                          ))}
                        </div>
                      </td>
                      <td className="py-4 font-bold">
                        {zone.fee === 0 ? <span className="text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">Free</span> : <span className="text-primary">₹{zone.fee}</span>}
                      </td>
                      <td className="py-4 text-primary/60">{zone.minDuration}</td>
                      <td className="py-4 text-right space-x-1">
                        <button
                          onClick={() => {
                            setSelectedZone(zone); setZoneName(zone.name); setZonePincodes((zone.pincodes || []).join(", ")); setZoneFee(zone.fee); setZoneDuration(zone.minDuration); setZoneFormOpen(true);
                          }}
                          className="p-1.5 text-primary/50 hover:text-accent transition-colors cursor-pointer"
                        ><Edit size={14} /></button>
                        <button
                          onClick={async () => {
                            if (!confirm("Delete zone?")) return;
                            const updated = deliveryZones.filter((z) => z.id !== zone.id);
                            const res = await fetch("/api/delivery", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(updated) });
                            if (res.ok) fetchAllData();
                          }}
                          className="p-1.5 text-primary/50 hover:text-red-500 transition-colors cursor-pointer"
                        ><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 8. Reviews base tab */}
        {activeTab === "Reviews base" && (
          <OwnerReviewsTab fetchAllData={fetchAllData} />
        )}
      </main>
    </div>
  );
}

function OwnerReviewsTab({ fetchAllData }: { fetchAllData: () => void }) {
  const [allReviews, setAllReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

  useEffect(() => {
    fetch("/api/reviews")
      .then((r) => r.json())
      .then((d) => {
        setAllReviews(d.reviews || []);
        setLoadingReviews(false);
      })
      .catch(() => setLoadingReviews(false));
  }, []);

  const handleClearAll = async () => {
    if (!confirm("Are you sure you want to permanently delete ALL customer reviews? This cannot be undone.")) return;
    try {
      const res = await fetch("/api/reviews", { method: "DELETE" });
      if (res.ok) {
        setAllReviews([]);
        alert("All reviews cleared successfully.");
        fetchAllData();
      }
    } catch (e) {}
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-serif text-lg font-bold text-primary">Customer Reviews</h3>
          <p className="text-xs text-primary/50 mt-1">All submitted customer feedback from delivered orders.</p>
        </div>
        <button
          onClick={handleClearAll}
          className="flex items-center gap-1.5 rounded-full bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 text-xs font-bold shadow-md cursor-pointer transition-all"
        >
          <Trash2 size={14} /> Clear All Reviews
        </button>
      </div>

      {loadingReviews ? (
        <div className="text-xs text-primary/40 text-center py-8">Loading reviews...</div>
      ) : allReviews.length === 0 ? (
        <div className="bg-white border border-primary/5 rounded-3xl p-10 text-center shadow-sm">
          <p className="text-xs text-primary/40">No reviews submitted yet.</p>
        </div>
      ) : (
        <div className="bg-white border border-primary/5 rounded-3xl p-6 shadow-sm space-y-4">
          {allReviews.map((rv: any) => (
            <div key={rv.id} className="border-b border-primary/5 pb-4 last:border-b-0">
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-primary">{rv.userName}</span>
                    <span className="text-[10px] text-primary/40">{new Date(rv.date).toLocaleDateString("en-IN")}</span>
                  </div>
                  <p className="text-xs text-primary/70 italic">&ldquo;{rv.review}&rdquo;</p>
                  <p className="text-[10px] text-primary/40">Product: {rv.productId}</p>
                </div>
                <button
                  onClick={async () => {
                    const updated = allReviews.filter((r: any) => r.id !== rv.id);
                    await fetch("/api/reviews", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ _overwrite: updated }),
                    });
                    setAllReviews(updated);
                  }}
                  className="p-1.5 text-primary/30 hover:text-red-500 transition-colors cursor-pointer flex-shrink-0"
                  title="Remove this review"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
