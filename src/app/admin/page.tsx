"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard, ShoppingBag, FolderHeart, Clock, Ticket, Map, Landmark,
  MessageSquareText, BrainCircuit, UserCheck, LogOut, Loader2, Plus, Edit, Trash2, UploadCloud
} from "lucide-react";
import { Product } from "@/mock-data/products";
import { cn } from "@/utils/cn";

const DEFAULT_SETTINGS = {
  storeName: "Whisk Fantasies",
  bankName: "Reserve Bank of Mumbai",
  accountName: "Whisk Fantasies Mumbai",
  accountNumber: "8424-0168-7697-8890",
  ifscCode: "IFSC-WHISK0008424",
  whatsappNumber: "+918424016876",
  whatsappDefaultMessage: "Hi Whisk Fantasies, I would like to design a customized eggless cake in Mumbai!",
  groqApiKey: "",
  aiShopContext: "You are Whisk AI, a virtual assistant for Whisk Fantasies bakery in Vikhroli, Mumbai...",
  aiRules: [
    { keywords: ["eggless", "vegan"], response: "Yes! All our signature cakes can be prepared 100% eggless upon request." },
    { keywords: ["custom", "photo"], response: "We love custom orders! Share your design idea on WhatsApp at +91 8424016876." }
  ],
  activeOffer: {
    text: "🎉 Flash Celebration Offer: Flat 15% Off all confections!",
    discountPercentage: 15,
    durationHours: 2,
    isActive: true,
    startedAt: new Date().toISOString(),
  }
};

export default function AdminDashboard() {
  const router = useRouter();
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("Dashboard");

  // Admin Login Credentials
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [adminLoginError, setAdminLoginError] = useState("");
  const [adminSubmitting, setAdminSubmitting] = useState(false);

  // Shared state pools
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [deliveryZones, setDeliveryZones] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(DEFAULT_SETTINGS);

  // Delivery Zone CRUD states
  const [zoneFormOpen, setZoneFormOpen] = useState(false);
  const [selectedZone, setSelectedZone] = useState<any | null>(null);
  const [zoneName, setZoneName] = useState("");
  const [zonePincodes, setZonePincodes] = useState("");
  const [zoneFee, setZoneFee] = useState(0);
  const [zoneDuration, setZoneDuration] = useState("");

  // Product CRUD states
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productFormOpen, setProductFormOpen] = useState(false);
  const [pName, setPName] = useState("");
  const [pPrice, setPPrice] = useState(0);
  const [pCategory, setPCategory] = useState("");
  const [pDescription, setPDescription] = useState("");
  const [pOccasions, setPOccasions] = useState("");
  const [pFlavors, setPFlavors] = useState("");
  const [pSizes, setPSizes] = useState("");
  const [pSignature, setPSignature] = useState(false);
  const [pCustomizable, setPCustomizable] = useState(false);
  const [pImage, setPImage] = useState("");

  // Category CRUD states
  const [selectedCategoryItem, setSelectedCategoryItem] = useState<any | null>(null);
  const [categoryFormOpen, setCategoryFormOpen] = useState(false);
  const [catName, setCatName] = useState("");
  const [catImage, setCatImage] = useState("");

  // Coupon CRUD states
  const [selectedCouponItem, setSelectedCouponItem] = useState<any | null>(null);
  const [couponFormOpen, setCouponFormOpen] = useState(false);
  const [couponCodeText, setCouponCodeText] = useState("");
  const [couponDiscountPercent, setCouponDiscountPercent] = useState(10);

  // AI Knowledge rule addition
  const [aiKeyword, setAiKeyword] = useState("");
  const [aiResponse, setAiResponse] = useState("");

  // Load Session and master databases
  const fetchAllData = async (activeUser?: any) => {
    try {
      const currentSession = activeUser || session;
      if (!currentSession) {
        const sRes = await fetch("/api/auth/session");
        const sData = await sRes.json();
        if (sRes.ok && sData.session && (sData.session.role === "admin" || sData.session.role === "super-admin")) {
          setSession(sData.session);
        } else {
          setSession(null);
          setLoading(false);
          return;
        }
      }

      // Fetch products
      const pRes = await fetch("/api/products", { cache: "no-store" });
      const pData = await pRes.json();
      if (pRes.ok) setProducts(pData.products || []);

      // Fetch categories
      const cRes = await fetch("/api/categories", { cache: "no-store" });
      const cData = await cRes.json();
      if (cRes.ok) setCategories(cData.categories || []);

      // Fetch coupons
      const cpRes = await fetch("/api/coupons", { cache: "no-store" });
      const cpData = await cpRes.json();
      if (cpRes.ok) setCoupons(cpData.coupons || []);

      // Fetch delivery zones
      const dzRes = await fetch("/api/delivery", { cache: "no-store" });
      const dzData = await dzRes.json();
      if (dzRes.ok) setDeliveryZones(dzData.zones || []);

      // Fetch settings
      const stRes = await fetch("/api/settings", { cache: "no-store" });
      const stData = await stRes.json();
      if (stRes.ok && stData.settings) {
        setSettings({
          ...DEFAULT_SETTINGS,
          ...stData.settings,
          activeOffer: { ...DEFAULT_SETTINGS.activeOffer, ...(stData.settings.activeOffer || {}) }
        });
      }

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
        await fetchAllData(loggedUser);
      } else {
        setAdminLoginError(data.error || "Access denied. Only store administrators can access this panel.");
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
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setter(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // 1. PRODUCTS WORKSPACE ACTIONS
  const openProductForm = (product?: Product) => {
    if (product) {
      setSelectedProduct(product);
      setPName(product.name);
      setPPrice(product.price);
      setPCategory(product.category);
      setPDescription(product.description || "");
      setPOccasions((product.occasions || []).join(", "));
      setPFlavors((product.flavors || []).join(", "));
      setPSizes((product.sizes || []).join(", "));
      setPSignature(!!product.isSignature);
      setPCustomizable(!!product.isCustomizable);
      setPImage(product.image || "");
    } else {
      setSelectedProduct(null);
      setPName("");
      setPPrice(1200);
      setPCategory(categories.length > 0 ? categories[0].name : "Chocolate Cakes");
      setPDescription("");
      setPOccasions("Birthday, Anniversary");
      setPFlavors("Classic Vanilla, Belgian Chocolate");
      setPSizes("0.5 kg, 1 kg, 2 kg");
      setPSignature(false);
      setPCustomizable(false);
      setPImage("https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80");
    }
    setProductFormOpen(true);
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      id: selectedProduct?.id || `cake-${Date.now()}`,
      name: pName,
      price: Number(pPrice),
      category: pCategory || (categories.length > 0 ? categories[0].name : "Custom Cakes"),
      description: pDescription,
      occasions: pOccasions.split(",").map((s) => s.trim()).filter(Boolean),
      flavors: pFlavors.split(",").map((s) => s.trim()).filter(Boolean),
      sizes: pSizes.split(",").map((s) => s.trim()).filter(Boolean),
      isSignature: pSignature,
      isCustomizable: pCustomizable,
      image: pImage,
      rating: selectedProduct?.rating || 5.0,
      reviewsCount: selectedProduct?.reviewsCount || 1,
    };

    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setProductFormOpen(false);
        fetchAllData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to remove this product?")) return;
    try {
      const res = await fetch(`/api/products?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchAllData();
      }
    } catch (e) {}
  };

  // 2. CATEGORIES CRUD ACTIONS
  const openCategoryForm = (item?: any) => {
    if (item) {
      setSelectedCategoryItem(item);
      setCatName(item.name);
      setCatImage(item.image || "");
    } else {
      setSelectedCategoryItem(null);
      setCatName("");
      setCatImage("https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=500&q=80");
    }
    setCategoryFormOpen(true);
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName) return;

    let updatedList = [...categories];
    const categoryPayload = {
      name: catName,
      slug: catName.toLowerCase().replace(/\s+/g, "-"),
      image: catImage
    };

    if (selectedCategoryItem) {
      updatedList = updatedList.map((c) =>
        c.name === selectedCategoryItem.name ? categoryPayload : c
      );
    } else {
      updatedList.push(categoryPayload);
    }

    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedList)
      });
      if (res.ok) {
        setCategoryFormOpen(false);
        fetchAllData();
      }
    } catch (e) {}
  };

  const handleDeleteCategory = async (nameToDelete: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    const updatedList = categories.filter((c) => c.name !== nameToDelete);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedList)
      });
      if (res.ok) fetchAllData();
    } catch (e) {}
  };

  // 3. FLASH SALES ACTIONS
  const handleOfferToggleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings || !settings.activeOffer) return;

    const offerData = settings.activeOffer;
    const updatedSettings = {
      ...settings,
      activeOffer: {
        ...offerData,
        startedAt: offerData.isActive ? new Date().toISOString() : ""
      }
    };

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedSettings)
      });
      if (res.ok) {
        alert("Flash Sales offer updated successfully!");
        fetchAllData();
      }
    } catch (e) {}
  };

  // 4. COUPON CRUD ACTIONS
  const openCouponForm = (item?: any) => {
    if (item) {
      setSelectedCouponItem(item);
      setCouponCodeText(item.code);
      setCouponDiscountPercent(item.discountPercentage);
    } else {
      setSelectedCouponItem(null);
      setCouponCodeText("");
      setCouponDiscountPercent(10);
    }
    setCouponFormOpen(true);
  };

  const handleCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCodeText) return;

    let updatedList = [...coupons];
    const couponPayload = {
      code: couponCodeText.toUpperCase(),
      discountPercentage: Number(couponDiscountPercent),
      isActive: true
    };

    if (selectedCouponItem) {
      updatedList = updatedList.map((c) =>
        c.code === selectedCouponItem.code ? couponPayload : c
      );
    } else {
      updatedList.push(couponPayload);
    }

    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedList)
      });
      if (res.ok) {
        setCouponFormOpen(false);
        fetchAllData();
      }
    } catch (e) {}
  };

  const handleDeleteCoupon = async (codeToDelete: string) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;
    const updatedList = coupons.filter((c) => c.code !== codeToDelete);
    try {
      const res = await fetch("/api/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedList)
      });
      if (res.ok) fetchAllData();
    } catch (e) {}
  };

  // 5. WHATSAPP MESSAGING ACTIONS
  const handleWhatsAppSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings)
      });
      if (res.ok) {
        alert("WhatsApp messaging options saved successfully!");
        fetchAllData();
      }
    } catch (e) {}
  };

  // 6. AI CHATBOT RULES ACTIONS
  const handleAddAiRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiKeyword || !aiResponse || !settings) return;
    const updatedRules = [...(settings.aiRules || []), {
      keywords: aiKeyword.split(",").map((k) => k.trim().toLowerCase()),
      response: aiResponse
    }];
    const updatedSettings = { ...settings, aiRules: updatedRules };
    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedSettings)
      });
      if (res.ok) {
        setAiKeyword("");
        setAiResponse("");
        fetchAllData();
      }
    } catch (e) {}
  };

  const handleDeleteAiRule = async (idxToDelete: number) => {
    if (!confirm("Remove this chatbot rule?")) return;
    const updatedRules = (settings.aiRules || []).filter((_: any, i: number) => i !== idxToDelete);
    const updatedSettings = { ...settings, aiRules: updatedRules };
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
    { name: "Categories", icon: FolderHeart },
    { name: "Products", icon: ShoppingBag },
    { name: "Flash Sales", icon: Clock },
    { name: "Coupon Manager", icon: Ticket },
    { name: "Delivery Zones", icon: Map },
    { name: "Bank IFSC Details", icon: Landmark },
    { name: "WhatsApp Messaging", icon: MessageSquareText },
    { name: "Chatbot Rules", icon: BrainCircuit },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-primary text-white">
        <Loader2 size={40} className="animate-spin text-accent" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary text-white p-4">
        <div className="w-full max-w-md bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <span className="text-[10px] font-bold tracking-widest text-accent uppercase">
              Admin Portal
            </span>
            <h1 className="font-serif text-3xl font-bold tracking-wider">
              WHISK ADMIN
            </h1>
            <p className="text-xs text-white/60">
              Enter your administrator credentials to access management options.
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
                Admin Email
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
              className="w-full bg-accent hover:bg-accent/90 text-white font-bold py-3.5 rounded-full flex items-center justify-center gap-2 text-xs tracking-wider shadow-lg hover:shadow-accent/20 cursor-pointer disabled:opacity-60 transition-all font-sans"
            >
              {adminSubmitting ? (
                <Loader2 className="animate-spin" size={16} />
              ) : (
                "Unlock Dashboard"
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background text-primary">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-primary text-white flex-shrink-0 flex flex-col justify-between p-5 border-r border-white/5">
        <div className="space-y-8">
          <div className="flex items-center gap-2 border-b border-white/10 pb-4">
            <span className="font-serif text-xl font-bold tracking-widest">
              WHISK ADMIN
            </span>
          </div>
          
          <nav className="flex flex-col gap-1.5 max-h-[70vh] overflow-y-auto pr-1">
            {adminMenu.map((menu) => (
              <button
                key={menu.name}
                onClick={() => setActiveTab(menu.name)}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-full text-xs font-semibold tracking-wide transition-all text-left cursor-pointer",
                  activeTab === menu.name
                    ? "bg-accent text-white shadow-md shadow-accent/20 font-bold"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                )}
              >
                <menu.icon size={16} />
                {menu.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="space-y-4 border-t border-white/10 pt-4">
          <div className="flex items-center gap-2 text-xs font-bold text-white/60">
            <UserCheck size={14} /> {session?.name}
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-full text-xs font-bold text-red-400 hover:bg-red-950/20 transition-all text-left cursor-pointer"
          >
            <LogOut size={16} /> Log Out
          </button>
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 p-8 overflow-y-auto max-h-screen">
        {/* Title */}
        <div className="border-b border-primary/5 pb-5 mb-8 flex justify-between items-center">
          <div>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold">{activeTab}</h1>
            <p className="text-xs text-primary/50 mt-1">Admin control panel for Whisk Fantasies operations.</p>
          </div>
        </div>

        {/* 1. Dashboard Overview */}
        {activeTab === "Dashboard" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white border border-primary/5 p-6 rounded-3xl shadow-sm space-y-1">
                <span className="text-[10px] font-bold text-primary/45 uppercase tracking-wide">Categories</span>
                <h3 className="font-serif text-3xl font-bold text-primary">{categories.length}</h3>
                <span className="text-[10px] text-accent font-semibold block">Active collections</span>
              </div>
              <div className="bg-white border border-primary/5 p-6 rounded-3xl shadow-sm space-y-1">
                <span className="text-[10px] font-bold text-primary/45 uppercase tracking-wide">Products</span>
                <h3 className="font-serif text-3xl font-bold text-primary">{products.length}</h3>
                <span className="text-[10px] text-emerald-600 font-semibold block">Catalog items</span>
              </div>
              <div className="bg-white border border-primary/5 p-6 rounded-3xl shadow-sm space-y-1">
                <span className="text-[10px] font-bold text-primary/45 uppercase tracking-wide">Active Coupons</span>
                <h3 className="font-serif text-3xl font-bold text-primary">{coupons.length}</h3>
                <span className="text-[10px] text-primary/60 block">Discount codes</span>
              </div>
              <div className="bg-white border border-primary/5 p-6 rounded-3xl shadow-sm space-y-1">
                <span className="text-[10px] font-bold text-primary/45 uppercase tracking-wide">Delivery Zones</span>
                <h3 className="font-serif text-3xl font-bold text-primary">{deliveryZones.length}</h3>
                <span className="text-[10px] text-primary/60 block">Configured zones</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white border border-primary/5 p-6 rounded-3xl shadow-sm space-y-4">
              <h3 className="font-serif text-lg font-bold text-primary">Management Tools</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => setActiveTab("Categories")}
                  className="p-5 rounded-2xl border border-primary/10 hover:border-accent hover:bg-secondary/15 transition-all text-left space-y-2 cursor-pointer"
                >
                  <FolderHeart className="text-accent" size={24} />
                  <h4 className="font-bold text-sm">Categories CRUD</h4>
                  <p className="text-xs text-primary/60">Create, edit, or delete store categories.</p>
                </button>
                <button
                  onClick={() => setActiveTab("Products")}
                  className="p-5 rounded-2xl border border-primary/10 hover:border-accent hover:bg-secondary/15 transition-all text-left space-y-2 cursor-pointer"
                >
                  <ShoppingBag className="text-accent" size={24} />
                  <h4 className="font-bold text-sm">Products CRUD</h4>
                  <p className="text-xs text-primary/60">Add, edit pricing, images, and cake options.</p>
                </button>
                <button
                  onClick={() => setActiveTab("Coupon Manager")}
                  className="p-5 rounded-2xl border border-primary/10 hover:border-accent hover:bg-secondary/15 transition-all text-left space-y-2 cursor-pointer"
                >
                  <Ticket className="text-accent" size={24} />
                  <h4 className="font-bold text-sm">Coupon Manager</h4>
                  <p className="text-xs text-primary/60">Manage promo codes and discount offers.</p>
                </button>
                <button
                  onClick={() => setActiveTab("Delivery Zones")}
                  className="p-5 rounded-2xl border border-primary/10 hover:border-accent hover:bg-secondary/15 transition-all text-left space-y-2 cursor-pointer"
                >
                  <Map className="text-accent" size={24} />
                  <h4 className="font-bold text-sm">Delivery Zones</h4>
                  <p className="text-xs text-primary/60">Set pincodes and custom delivery fees.</p>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2. Categories CRUD */}
        {activeTab === "Categories" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-serif text-lg font-bold text-primary">Store Categories</h3>
                <p className="text-xs text-primary/50 mt-1">Manage categories displayed on the website.</p>
              </div>
              <button
                onClick={() => openCategoryForm()}
                className="rounded-full bg-primary px-5 py-2.5 text-xs font-bold text-white hover:bg-primary/95 flex items-center gap-1 shadow-md cursor-pointer"
              >
                <Plus size={16} /> Add Category
              </button>
            </div>

            {/* Category Form Modal */}
            {categoryFormOpen && (
              <div className="fixed inset-0 z-50 bg-black/45 flex items-center justify-center p-4">
                <div className="bg-white border border-primary/5 rounded-3xl p-6 shadow-2xl w-full max-w-md space-y-6">
                  <h2 className="font-serif text-lg font-bold text-primary border-b border-primary/5 pb-3">
                    {selectedCategoryItem ? "Edit Category" : "Add Category"}
                  </h2>
                  <form onSubmit={handleCategorySubmit} className="space-y-4 text-xs">
                    <div className="space-y-1">
                      <label className="font-bold text-primary/60 uppercase">Category Name</label>
                      <input type="text" required value={catName} onChange={(e) => setCatName(e.target.value)} placeholder="E.g., Number Cakes" className="w-full rounded-full border border-primary/10 bg-background px-4 py-2.5 text-primary" />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-primary/60 uppercase">Category Cover Image</label>
                      <div className="relative border border-primary/10 rounded-full bg-background px-4 py-2.5 flex items-center justify-between">
                        <span className="text-[10px] text-primary/50 truncate max-w-[250px]">
                          {catImage ? "Image loaded" : "Upload Cover Image..."}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChangeHelper(e, setCatImage)}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                        <UploadCloud size={14} className="text-primary/50" />
                      </div>
                    </div>

                    {catImage && (
                      <div className="h-20 w-32 overflow-hidden rounded-xl border border-primary/5 bg-secondary/15">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={catImage} alt="Category preview" className="h-full w-full object-cover" />
                      </div>
                    )}

                    <div className="flex justify-end gap-2 pt-2">
                      <button type="button" onClick={() => setCategoryFormOpen(false)} className="rounded-full border border-primary/15 bg-transparent px-5 py-2 font-bold hover:bg-secondary cursor-pointer">Cancel</button>
                      <button type="submit" className="rounded-full bg-primary text-white px-5 py-2 font-bold hover:bg-primary/95 cursor-pointer">Save Category</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div className="bg-white border border-primary/5 rounded-3xl p-6 shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-primary/10 text-primary/45 uppercase font-bold">
                      <th className="pb-3">Image</th>
                      <th className="pb-3">Category Title</th>
                      <th className="pb-3">Slug</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((c) => (
                      <tr key={c.name} className="border-b border-primary/5 last:border-b-0 hover:bg-secondary/10">
                        <td className="py-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={c.image} alt={c.name} className="h-10 w-16 object-cover rounded-lg border border-primary/5" />
                        </td>
                        <td className="py-3 font-semibold text-primary">{c.name}</td>
                        <td className="py-3 font-mono text-accent">{c.slug}</td>
                        <td className="py-3 text-right space-x-1">
                          <button
                            onClick={() => openCategoryForm(c)}
                            className="p-1.5 text-primary/50 hover:text-accent transition-colors cursor-pointer"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(c.name)}
                            className="p-1.5 text-primary/50 hover:text-destructive transition-colors cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 3. Products CRUD */}
        {activeTab === "Products" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-serif text-lg font-bold text-primary">Products Catalog</h3>
                <p className="text-xs text-primary/50 mt-1">Create, edit, or remove products in your bakery store.</p>
              </div>
              <button
                onClick={() => openProductForm()}
                className="rounded-full bg-primary px-5 py-2.5 text-xs font-bold text-white hover:bg-primary/95 flex items-center gap-1 shadow-md cursor-pointer"
              >
                <Plus size={16} /> Add Product
              </button>
            </div>

            {/* Product Forms Modal Overlay */}
            {productFormOpen && (
              <div className="fixed inset-0 z-50 bg-black/45 flex items-center justify-center p-4">
                <div className="bg-white border border-primary/5 rounded-3xl p-6 shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto space-y-6">
                  <h2 className="font-serif text-lg font-bold text-primary border-b border-primary/5 pb-3">
                    {selectedProduct ? "Edit Product" : "Create Product"}
                  </h2>
                  <form onSubmit={handleProductSubmit} className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="font-bold text-primary/60 uppercase">Cake Name</label>
                        <input type="text" required value={pName} onChange={(e) => setPName(e.target.value)} className="w-full rounded-full border border-primary/10 bg-background px-4 py-2.5 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-primary/60 uppercase">Base Price (₹)</label>
                        <input type="number" required value={pPrice} onChange={(e) => setPPrice(Number(e.target.value))} className="w-full rounded-full border border-primary/10 bg-background px-4 py-2.5 text-primary" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="font-bold text-primary/60 uppercase">Category</label>
                        <select value={pCategory} onChange={(e) => setPCategory(e.target.value)} className="w-full rounded-full border border-primary/10 bg-background px-4 py-2.5 text-primary">
                          {categories.map((c) => (
                            <option key={c.name} value={c.name}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="space-y-1">
                        <label className="font-bold text-primary/60 uppercase">Upload Cake Image</label>
                        <div className="relative border border-primary/10 rounded-full bg-background px-4 py-2.5 flex items-center justify-between">
                          <span className="text-[10px] text-primary/50 truncate max-w-[200px]">
                            {pImage ? "Image loaded" : "Select file..."}
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleFileChangeHelper(e, setPImage)}
                            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                          />
                          <UploadCloud size={14} className="text-primary/50" />
                        </div>
                      </div>
                    </div>

                    {pImage && (
                      <div className="space-y-1">
                        <span className="font-bold text-primary/60 uppercase block">Image Preview</span>
                        <div className="h-28 w-40 overflow-hidden rounded-xl border border-primary/5 relative bg-secondary/15">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={pImage} alt="Cake uploader preview" className="h-full w-full object-cover" />
                        </div>
                      </div>
                    )}

                    <div className="space-y-1">
                      <label className="font-bold text-primary/60 uppercase">Description</label>
                      <textarea rows={3} value={pDescription} onChange={(e) => setPDescription(e.target.value)} className="w-full rounded-2xl border border-primary/10 bg-background px-4 py-2.5 text-primary" />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="font-bold text-primary/60 uppercase">Occasions (csv)</label>
                        <input type="text" value={pOccasions} onChange={(e) => setPOccasions(e.target.value)} className="w-full rounded-full border border-primary/10 bg-background px-4 py-2.5 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-primary/60 uppercase">Flavors (csv)</label>
                        <input type="text" value={pFlavors} onChange={(e) => setPFlavors(e.target.value)} className="w-full rounded-full border border-primary/10 bg-background px-4 py-2.5 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-primary/60 uppercase">Sizes (csv)</label>
                        <input type="text" value={pSizes} onChange={(e) => setPSizes(e.target.value)} className="w-full rounded-full border border-primary/10 bg-background px-4 py-2.5 text-primary" />
                      </div>
                    </div>

                    <div className="flex gap-6 border-t border-primary/5 pt-4">
                      <label className="flex items-center gap-2 font-bold cursor-pointer">
                        <input type="checkbox" checked={pSignature} onChange={(e) => setPSignature(e.target.checked)} className="rounded accent-accent h-4 w-4" />
                        Signature Spotlight
                      </label>
                      <label className="flex items-center gap-2 font-bold cursor-pointer">
                        <input type="checkbox" checked={pCustomizable} onChange={(e) => setPCustomizable(e.target.checked)} className="rounded accent-accent h-4 w-4" />
                        Customizable Design
                      </label>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                      <button type="button" onClick={() => setProductFormOpen(false)} className="rounded-full border border-primary/15 bg-transparent px-5 py-2.5 font-bold hover:bg-secondary cursor-pointer">Cancel</button>
                      <button type="submit" className="rounded-full bg-primary text-white px-6 py-2.5 font-bold hover:bg-primary/95 cursor-pointer">Save Product</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Products List Table */}
            <div className="bg-white border border-primary/5 rounded-3xl p-6 shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-primary/10 text-primary/45 uppercase font-bold">
                      <th className="pb-3">Cake</th>
                      <th className="pb-3">Category</th>
                      <th className="pb-3">Price</th>
                      <th className="pb-3">Spotlight</th>
                      <th className="pb-3">Custom</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.id} className="border-b border-primary/5 last:border-b-0 hover:bg-secondary/10">
                        <td className="py-4 flex items-center gap-3">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={p.image} alt={p.name} className="h-10 w-10 object-cover rounded-lg border border-primary/5" />
                          <span className="font-semibold text-primary">{p.name}</span>
                        </td>
                        <td className="py-4 font-semibold text-primary/60">{p.category}</td>
                        <td className="py-4 font-bold">₹{p.price}</td>
                        <td className="py-4 font-semibold">{p.isSignature ? "Signature" : "Standard"}</td>
                        <td className="py-4 font-semibold">{p.isCustomizable ? "Customizable" : "Fixed"}</td>
                        <td className="py-4 text-right space-x-1">
                          <button
                            onClick={() => openProductForm(p)}
                            className="p-2 text-primary/50 hover:text-accent transition-colors cursor-pointer"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-2 text-primary/50 hover:text-destructive transition-colors cursor-pointer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 4. Flash Sales CRUD */}
        {activeTab === "Flash Sales" && (
          <div className="bg-white border border-primary/5 rounded-3xl p-6 shadow-sm space-y-6">
            <div>
              <h3 className="font-serif text-lg font-bold text-primary">Flash Sales Configuration</h3>
              <p className="text-xs text-primary/50 mt-1">Configure limited-time flash sale banners, discounts, and active timer.</p>
            </div>
            <form onSubmit={handleOfferToggleSubmit} className="space-y-4 text-xs max-w-md pt-2 border-t border-primary/5">
              <div className="space-y-1">
                <label className="font-bold text-primary/60 uppercase">Offer Text / Banner Headline</label>
                <input
                  type="text"
                  required
                  value={settings.activeOffer?.text || ""}
                  onChange={(e) => setSettings({
                    ...settings,
                    activeOffer: { ...settings.activeOffer, text: e.target.value }
                  })}
                  className="w-full rounded-full border border-primary/10 bg-background px-4 py-2.5 text-primary font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-primary/60 uppercase">Discount (%)</label>
                  <input
                    type="number"
                    required
                    value={settings.activeOffer?.discountPercentage || 0}
                    onChange={(e) => setSettings({
                      ...settings,
                      activeOffer: { ...settings.activeOffer, discountPercentage: Number(e.target.value) }
                    })}
                    className="w-full rounded-full border border-primary/10 bg-background px-4 py-2.5 text-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-primary/60 uppercase">Duration (Hours)</label>
                  <input
                    type="number"
                    required
                    value={settings.activeOffer?.durationHours || 2}
                    onChange={(e) => setSettings({
                      ...settings,
                      activeOffer: { ...settings.activeOffer, durationHours: Number(e.target.value) }
                    })}
                    className="w-full rounded-full border border-primary/10 bg-background px-4 py-2.5 text-primary"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 font-bold cursor-pointer text-sm">
                  <input
                    type="checkbox"
                    checked={!!settings.activeOffer?.isActive}
                    onChange={(e) => setSettings({
                      ...settings,
                      activeOffer: { ...settings.activeOffer, isActive: e.target.checked }
                    })}
                    className="rounded accent-accent h-5 w-5 cursor-pointer"
                  />
                  Run Flash Sale Live
                </label>
              </div>

              <button
                type="submit"
                className="rounded-full bg-primary text-white px-8 py-3 font-bold hover:bg-primary/95 cursor-pointer shadow-md"
              >
                Save Flash Sale Settings
              </button>
            </form>
          </div>
        )}

        {/* 5. Coupon Manager */}
        {activeTab === "Coupon Manager" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-serif text-lg font-bold text-primary">Coupon Manager</h3>
                <p className="text-xs text-primary/50 mt-1">Create and manage discount codes for checkout.</p>
              </div>
              <button
                onClick={() => openCouponForm()}
                className="rounded-full bg-primary px-5 py-2.5 text-xs font-bold text-white hover:bg-primary/95 flex items-center gap-1 shadow-md cursor-pointer"
              >
                <Plus size={16} /> Add Coupon
              </button>
            </div>

            {/* Coupon Form modal */}
            {couponFormOpen && (
              <div className="fixed inset-0 z-50 bg-black/45 flex items-center justify-center p-4">
                <div className="bg-white border border-primary/5 rounded-3xl p-6 shadow-2xl w-full max-w-md space-y-6">
                  <h2 className="font-serif text-lg font-bold text-primary border-b border-primary/5 pb-3">
                    {selectedCouponItem ? "Edit Coupon" : "Add Coupon"}
                  </h2>
                  <form onSubmit={handleCouponSubmit} className="space-y-4 text-xs">
                    <div className="space-y-1">
                      <label className="font-bold text-primary/60 uppercase">Coupon Code</label>
                      <input type="text" required value={couponCodeText} onChange={(e) => setCouponCodeText(e.target.value)} placeholder="E.g., FESTIVE15" className="w-full rounded-full border border-primary/10 bg-background px-4 py-2.5 text-primary" />
                    </div>
                    <div className="space-y-1">
                      <label className="font-bold text-primary/60 uppercase">Discount Percentage (%)</label>
                      <input type="number" required value={couponDiscountPercent} onChange={(e) => setCouponDiscountPercent(Number(e.target.value))} placeholder="15" className="w-full rounded-full border border-primary/10 bg-background px-4 py-2.5 text-primary" />
                    </div>

                    <div className="flex justify-end gap-2 pt-2">
                      <button type="button" onClick={() => setCouponFormOpen(false)} className="rounded-full border border-primary/15 bg-transparent px-5 py-2 font-bold hover:bg-secondary cursor-pointer">Cancel</button>
                      <button type="submit" className="rounded-full bg-primary text-white px-5 py-2 font-bold hover:bg-primary/95 cursor-pointer">Save Coupon</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div className="bg-white border border-primary/5 rounded-3xl p-6 shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-primary/10 text-primary/45 uppercase font-bold">
                      <th className="pb-3">Coupon Code</th>
                      <th className="pb-3">Discount</th>
                      <th className="pb-3">Status</th>
                      <th className="pb-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coupons.map((c) => (
                      <tr key={c.code} className="border-b border-primary/5 last:border-b-0 hover:bg-secondary/10">
                        <td className="py-4 font-mono font-bold text-accent text-sm">{c.code}</td>
                        <td className="py-4 font-semibold">{c.discountPercentage}% discount</td>
                        <td className="py-4">
                          <span className="text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-full uppercase text-[9px]">Active</span>
                        </td>
                        <td className="py-4 text-right space-x-1">
                          <button
                            onClick={() => openCouponForm(c)}
                            className="p-1.5 text-primary/50 hover:text-accent transition-colors cursor-pointer"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteCoupon(c.code)}
                            className="p-1.5 text-primary/50 hover:text-destructive transition-colors cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 6. Delivery Zones Table */}
        {activeTab === "Delivery Zones" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-serif text-lg font-bold text-primary">Delivery Zones Table</h3>
                <p className="text-xs text-primary/50 mt-1">Configure delivery pincodes and delivery fees for customers.</p>
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

            {/* Zone Form Modal */}
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

            {/* Zones Table */}
            <div className="bg-white border border-primary/5 rounded-3xl p-6 shadow-sm overflow-x-auto">
              {deliveryZones.length === 0 ? (
                <p className="text-xs text-primary/40 py-8 text-center">No delivery zones configured yet.</p>
              ) : (
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
                            {(zone.pincodes || []).length > 4 && (
                              <span className="px-2 py-0.5 bg-primary/5 rounded-full text-[10px] text-primary/50">+{zone.pincodes.length - 4} more</span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 font-bold">
                          {zone.fee === 0
                            ? <span className="text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">Free</span>
                            : <span className="text-primary">₹{zone.fee}</span>
                          }
                        </td>
                        <td className="py-4 text-primary/60">{zone.minDuration}</td>
                        <td className="py-4 text-right space-x-1">
                          <button
                            onClick={() => {
                              setSelectedZone(zone);
                              setZoneName(zone.name);
                              setZonePincodes((zone.pincodes || []).join(", "));
                              setZoneFee(zone.fee);
                              setZoneDuration(zone.minDuration);
                              setZoneFormOpen(true);
                            }}
                            className="p-1.5 text-primary/50 hover:text-accent transition-colors cursor-pointer"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={async () => {
                              if (!confirm("Delete this delivery zone?")) return;
                              const updated = deliveryZones.filter((z) => z.id !== zone.id);
                              try {
                                const res = await fetch("/api/delivery", {
                                  method: "POST",
                                  headers: { "Content-Type": "application/json" },
                                  body: JSON.stringify(updated),
                                });
                                if (res.ok) fetchAllData();
                              } catch (err) {}
                            }}
                            className="p-1.5 text-primary/50 hover:text-destructive transition-colors cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {/* 7. Bank IFSC Details */}
        {activeTab === "Bank IFSC Details" && (
          <div className="bg-white border border-primary/5 rounded-3xl p-6 shadow-sm space-y-6">
            <div>
              <h3 className="font-serif text-lg font-bold text-primary">Bank IFSC & Merchant Payment Details</h3>
              <p className="text-xs text-primary/50 mt-1">Manage bank account details, IFSC code, and merchant QR code image for manual UPI transfers.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs max-w-2xl pt-2 border-t border-primary/5">
              <div className="space-y-1">
                <label className="font-bold text-primary/60 uppercase">Bank Name</label>
                <input
                  type="text"
                  value={settings.bankName || ""}
                  onChange={(e) => setSettings({ ...settings, bankName: e.target.value })}
                  className="w-full rounded-full border border-primary/10 bg-background px-4 py-2.5 text-primary"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-primary/60 uppercase">Account Name</label>
                <input
                  type="text"
                  value={settings.accountName || ""}
                  onChange={(e) => setSettings({ ...settings, accountName: e.target.value })}
                  className="w-full rounded-full border border-primary/10 bg-background px-4 py-2.5 text-primary"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-primary/60 uppercase">Account Number</label>
                <input
                  type="text"
                  value={settings.accountNumber || ""}
                  onChange={(e) => setSettings({ ...settings, accountNumber: e.target.value })}
                  className="w-full rounded-full border border-primary/10 bg-background px-4 py-2.5 text-primary font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-primary/60 uppercase">IFSC Routing Code</label>
                <input
                  type="text"
                  value={settings.ifscCode || ""}
                  onChange={(e) => setSettings({ ...settings, ifscCode: e.target.value })}
                  className="w-full rounded-full border border-primary/10 bg-background px-4 py-2.5 text-primary font-mono"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="font-bold text-primary/60 uppercase">Upload Merchant UPI QR Code Image</label>
                <div className="relative border border-primary/10 rounded-full bg-background px-4 py-2.5 flex items-center justify-between">
                  <span className="text-[10px] text-primary/50 truncate max-w-[400px]">
                    {settings.qrImageUrl ? "QR image loaded" : "Select merchant QR file..."}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChangeHelper(e, (val) => setSettings({ ...settings, qrImageUrl: val }))}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  <UploadCloud size={14} className="text-primary/50" />
                </div>
              </div>
            </div>

            {settings.qrImageUrl && (
              <div className="space-y-1 text-xs">
                <span className="font-bold text-primary/60 uppercase block">Active QR Code Preview</span>
                <div className="h-32 w-32 border border-primary/15 rounded-xl overflow-hidden p-1 bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={settings.qrImageUrl} alt="UPI QR Code preview" className="h-full w-full object-contain" />
                </div>
              </div>
            )}
            
            <button
              onClick={async () => {
                const res = await fetch("/api/settings", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(settings)
                });
                if (res.ok) alert("Bank details and IFSC saved successfully!");
              }}
              className="rounded-full bg-primary text-white px-6 py-2.5 font-bold hover:bg-primary/95 text-xs block cursor-pointer shadow-md"
            >
              Save Bank Details
            </button>
          </div>
        )}

        {/* 8. WhatsApp Messaging */}
        {activeTab === "WhatsApp Messaging" && (
          <div className="bg-white border border-primary/5 rounded-3xl p-6 shadow-sm space-y-6">
            <div>
              <h3 className="font-serif text-lg font-bold text-primary">WhatsApp Messaging Configuration</h3>
              <p className="text-xs text-primary/50 mt-1">Set support phone number and pre-filled inquiry message for custom cake orders.</p>
            </div>
            <form onSubmit={handleWhatsAppSubmit} className="text-xs space-y-4 max-w-md pt-2 border-t border-primary/5">
              <div className="space-y-1">
                <label className="font-bold text-primary/60 uppercase">WhatsApp Support Phone Number</label>
                <input
                  type="text"
                  required
                  value={settings.whatsappNumber || ""}
                  onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                  placeholder="+918424016876"
                  className="w-full rounded-full border border-primary/10 bg-background px-4 py-2.5 text-primary"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-primary/60 uppercase">Pre-filled Order Message</label>
                <textarea
                  rows={3}
                  required
                  value={settings.whatsappDefaultMessage || ""}
                  onChange={(e) => setSettings({ ...settings, whatsappDefaultMessage: e.target.value })}
                  className="w-full rounded-2xl border border-primary/10 bg-background px-4 py-2.5 text-primary"
                />
              </div>
              <button
                type="submit"
                className="rounded-full bg-primary text-white px-6 py-2.5 font-bold hover:bg-primary/95 cursor-pointer shadow-md"
              >
                Save WhatsApp Details
              </button>
            </form>
          </div>
        )}

        {/* 9. Chatbot Rules */}
        {activeTab === "Chatbot Rules" && (
          <div className="space-y-8">
            <div className="bg-white border border-primary/5 rounded-3xl p-6 shadow-sm space-y-6">
              <h3 className="font-serif text-lg font-bold text-primary pb-3 border-b border-primary/5">
                Groq LLM Chatbot Settings
              </h3>
              <div className="space-y-4 text-xs max-w-2xl">
                <div className="space-y-1">
                  <label className="font-bold text-primary/60 uppercase">Groq API Key (from groq.com)</label>
                  <input
                    type="password"
                    placeholder="gsk_..."
                    value={settings.groqApiKey || ""}
                    onChange={(e) => setSettings({ ...settings, groqApiKey: e.target.value })}
                    className="w-full rounded-full border border-primary/10 bg-background px-4 py-2.5 text-primary font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-primary/60 uppercase">Shop Context Description (for AI Assistant)</label>
                  <textarea
                    rows={4}
                    placeholder="Enter detailed facts about the shop (location, delivery fee, menu, timings, rules)..."
                    value={settings.aiShopContext || ""}
                    onChange={(e) => setSettings({ ...settings, aiShopContext: e.target.value })}
                    className="w-full rounded-2xl border border-primary/10 bg-background px-4 py-3 text-primary leading-relaxed"
                  />
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    const res = await fetch("/api/settings", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(settings)
                    });
                    if (res.ok) alert("Groq API parameters saved successfully!");
                  }}
                  className="rounded-full bg-primary text-white px-6 py-2.5 font-bold hover:bg-primary/95 cursor-pointer shadow-md"
                >
                  Save Groq Config
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 bg-white border border-primary/5 rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="font-serif text-base font-bold text-primary">Add Chatbot Answer Rule</h3>
                <form onSubmit={handleAddAiRule} className="space-y-4 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-primary/60 uppercase">Keywords (comma-separated)</label>
                    <input type="text" required value={aiKeyword} onChange={(e) => setAiKeyword(e.target.value)} placeholder="E.g., eggless, vegan" className="w-full rounded-full border border-primary/10 bg-background px-4 py-2.5 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-primary/60 uppercase">Automated Answer</label>
                    <textarea required rows={4} value={aiResponse} onChange={(e) => setAiResponse(e.target.value)} placeholder="E.g., Yes! We support vegan cakes..." className="w-full rounded-2xl border border-primary/10 bg-background px-4 py-3 text-primary" />
                  </div>
                  <button type="submit" className="w-full rounded-full bg-primary text-white py-2.5 font-bold hover:bg-primary/95 cursor-pointer">Save Rule</button>
                </form>
              </div>

              <div className="lg:col-span-2 bg-white border border-primary/5 rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="font-serif text-base font-bold text-primary">Current Chatbot Fallback Rules</h3>
                <div className="space-y-3">
                  {(settings.aiRules || []).map((rule: any, idx: number) => (
                    <div key={idx} className="bg-secondary/15 border border-primary/5 p-4 rounded-2xl text-xs space-y-2 relative">
                      <button
                        onClick={() => handleDeleteAiRule(idx)}
                        className="absolute right-3 top-3 text-primary/35 hover:text-destructive transition-colors cursor-pointer"
                        title="Delete rule"
                      >
                        <Trash2 size={14} />
                      </button>
                      <div>
                        <span className="font-bold text-primary/45 uppercase text-[9px] block">Keywords</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {rule.keywords.map((k: string) => (
                            <span key={k} className="bg-white border border-primary/5 px-2 py-0.5 rounded-md font-mono text-[9px] text-accent font-bold">{k}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="font-bold text-primary/45 uppercase text-[9px] block">Response</span>
                        <p className="text-primary/80 mt-1 leading-relaxed">{rule.response}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
