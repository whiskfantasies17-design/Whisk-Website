"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard, ShoppingBag, FolderHeart, LayoutTemplate, Image, Sparkles, ShoppingCart,
  Users, MessageSquare, Ticket, Map, Landmark, MessageSquareText, Globe, BrainCircuit,
  TrendingUp, UserCheck, LogOut, Loader2, Plus, Edit, Trash2, CheckCircle2, ShieldCheck, Check, Eye, Star, UploadCloud, Clock
} from "lucide-react";
import { Product } from "@/mock-data/products";
import { cn } from "@/utils/cn";

const DEFAULT_SETTINGS = {
  storeName: "Whisk Fantasies",
  websiteName: "Whisk Fantasies",
  announcementText: "✨ Free Delivery on all Orders above ₹999 across Mumbai & Thane! ✨",
  qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=upi://pay?pa=whiskfantasies@upi&pn=Whisk%20Fantasies",
  bankName: "Reserve Bank of Mumbai",
  accountName: "Whisk Fantasies Mumbai",
  accountNumber: "8424-0168-7697-8890",
  ifscCode: "IFSC-WHISK0008424",
  whatsappNumber: "+918424016876",
  whatsappDefaultMessage: "Hi Whisk Fantasies, I would like to design a customized eggless cake in Mumbai!",
  groqApiKey: "",
  aiShopContext: "You are Whisk AI, a virtual assistant for Whisk Fantasies bakery...",
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
  const [orderSubTab, setOrderSubTab] = useState<"ongoing" | "past">("ongoing");

  // Admin Login Credentials
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
  const [settings, setSettings] = useState<any>(DEFAULT_SETTINGS);
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
  const [pCategory, setPCategory] = useState("");
  const [pDescription, setPDescription] = useState("");
  const [pOccasions, setPOccasions] = useState("");
  const [pFlavors, setPFlavors] = useState("");
  const [pSizes, setPSizes] = useState("");
  const [pSignature, setPSignature] = useState(false);
  const [pCustomizable, setPCustomizable] = useState(false);
  const [pImage, setPImage] = useState("");

  // Category addition & edit states
  const [selectedCategoryItem, setSelectedCategoryItem] = useState<any | null>(null);
  const [categoryFormOpen, setCategoryFormOpen] = useState(false);
  const [catName, setCatName] = useState("");
  const [catImage, setCatImage] = useState("");

  // Banner CRUD states
  const [selectedBannerItem, setSelectedBannerItem] = useState<any | null>(null);
  const [bannerFormOpen, setBannerFormOpen] = useState(false);
  const [bannerTitle, setBannerTitle] = useState("");
  const [bannerSubtitle, setBannerSubtitle] = useState("");
  const [bannerCtaText, setBannerCtaText] = useState("");
  const [bannerCtaLink, setBannerCtaLink] = useState("");
  const [bannerImage, setBannerImage] = useState("");

  // Coupon CRUD states
  const [selectedCouponItem, setSelectedCouponItem] = useState<any | null>(null);
  const [couponFormOpen, setCouponFormOpen] = useState(false);
  const [couponCodeText, setCouponCodeText] = useState("");
  const [couponDiscountPercent, setCouponDiscountPercent] = useState(10);

  // AI Knowledge rule addition
  const [aiKeyword, setAiKeyword] = useState("");
  const [aiResponse, setAiResponse] = useState("");

  // Order inspector details modal
  const [inspectingOrder, setInspectingOrder] = useState<any | null>(null);

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

      // Fetch orders
      const oRes = await fetch("/api/orders", { cache: "no-store" });
      const oData = await oRes.json();
      if (oRes.ok) setOrders(oData.orders || []);

      // Fetch categories
      const cRes = await fetch("/api/categories", { cache: "no-store" });
      const cData = await cRes.json();
      if (cRes.ok) setCategories(cData.categories || []);

      // Fetch banners
      const bRes = await fetch("/api/banners", { cache: "no-store" });
      const bData = await bRes.json();
      if (bRes.ok) setBanners(bData.banners || []);

      // Fetch coupons
      const cpRes = await fetch("/api/coupons", { cache: "no-store" });
      const cpData = await cpRes.json();
      if (cpRes.ok) setCoupons(cpData.coupons || []);

      // Fetch settings
      const stRes = await fetch("/api/settings", { cache: "no-store" });
      const stData = await stRes.json();
      if (stRes.ok) setSettings(stData.settings || DEFAULT_SETTINGS);

      // Fetch delivery zones
      const dzRes = await fetch("/api/delivery", { cache: "no-store" });
      const dzData = await dzRes.json();
      if (dzRes.ok) setDeliveryZones(dzData.zones || []);

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
      setPDescription(product.description);
      setPOccasions(product.occasions.join(", "));
      setPFlavors(product.flavors.join(", "));
      setPSizes(product.sizes.join(", "));
      setPSignature(product.isSignature);
      setPCustomizable(product.isCustomizable);
      setPImage(product.image);
    } else {
      setSelectedProduct(null);
      setPName("");
      setPPrice(1200);
      setPCategory("Chocolate Cakes");
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
      category: pCategory,
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
    if (!confirm("Are you sure you want to remove this confectionery design?")) return;
    try {
      const res = await fetch(`/api/products?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchAllData();
      }
    } catch (e) {}
  };

  // 2. ORDER VERIFICATION WORKSPACE ACTIONS
  const handleVerifyOrderPayment = async (orderId: string) => {
    try {
      const res = await fetch("/api/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          paymentStatus: "Verified",
          deliveryStatus: "Confirmed",
        }),
      });
      if (res.ok) {
        setInspectingOrder(null);
        fetchAllData();
      }
    } catch (e) {}
  };

  const handleUpdateDeliveryStep = async (orderId: string, step: string) => {
    try {
      const res = await fetch("/api/orders", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          deliveryStatus: step,
        }),
      });
      if (res.ok) {
        setInspectingOrder(null);
        fetchAllData();
      }
    } catch (e) {}
  };

  // 3. CATEGORIES CRUD ACTIONS
  const openCategoryForm = (item?: any) => {
    if (item) {
      setSelectedCategoryItem(item);
      setCatName(item.name);
      setCatImage(item.image);
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
      // Update existing
      updatedList = updatedList.map((c) =>
        c.name === selectedCategoryItem.name ? categoryPayload : c
      );
    } else {
      // Create new
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

  // 4. HERO BANNER CRUD ACTIONS
  const openBannerForm = (item?: any) => {
    if (item) {
      setSelectedBannerItem(item);
      setBannerTitle(item.title);
      setBannerSubtitle(item.subtitle);
      setBannerCtaText(item.ctaText);
      setBannerCtaLink(item.ctaLink);
      setBannerImage(item.image);
    } else {
      setSelectedBannerItem(null);
      setBannerTitle("");
      setBannerSubtitle("");
      setBannerCtaText("Order Now");
      setBannerCtaLink("/cakes");
      setBannerImage("https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=1600&q=80");
    }
    setBannerFormOpen(true);
  };

  const handleBannerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let updatedList = [...banners];
    const bannerPayload = {
      id: selectedBannerItem ? selectedBannerItem.id : Date.now(),
      title: bannerTitle,
      subtitle: bannerSubtitle,
      ctaText: bannerCtaText,
      ctaLink: bannerCtaLink,
      image: bannerImage
    };

    if (selectedBannerItem) {
      updatedList = updatedList.map((b) =>
        b.id === selectedBannerItem.id ? bannerPayload : b
      );
    } else {
      updatedList.push(bannerPayload);
    }

    try {
      const res = await fetch("/api/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedList)
      });
      if (res.ok) {
        setBannerFormOpen(false);
        fetchAllData();
      }
    } catch (e) {}
  };

  const handleDeleteBanner = async (idToDelete: number) => {
    if (!confirm("Are you sure you want to remove this banner slide?")) return;
    const updatedList = banners.filter((b) => b.id !== idToDelete);
    try {
      const res = await fetch("/api/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedList)
      });
      if (res.ok) fetchAllData();
    } catch (e) {}
  };

  // 5. COUPON CRUD ACTIONS
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

  // 6. OFFERS WIDGET SUBMISSION
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
        alert("Offers configured successfully!");
        fetchAllData();
      }
    } catch (e) {}
  };

  // 7. AI KNOWLEDGE BASE RULES
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
    if (!confirm("Remove this chatbot knowledge rule?")) return;
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

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-primary text-white p-4">
        <div className="w-full max-w-md bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <span className="text-[10px] font-bold tracking-widest text-accent uppercase">
              Bespoke Administration
            </span>
            <h1 className="font-serif text-3xl font-bold tracking-wider">
              WHISK ADMIN
            </h1>
            <p className="text-xs text-white/60">
              Please enter your administrator credentials to manage parameters.
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
          
          <nav className="flex flex-col gap-1 max-h-[70vh] overflow-y-auto pr-1">
            {adminMenu.map((menu) => (
              <button
                key={menu.name}
                onClick={() => setActiveTab(menu.name)}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-full text-xs font-semibold tracking-wide transition-all text-left cursor-pointer",
                  activeTab === menu.name
                    ? "bg-accent text-white shadow-md shadow-accent/20"
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
          <div className="flex items-center gap-2 text-xs font-bold text-white/50">
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
            <p className="text-xs text-primary/50 mt-1">Management dashboard for Whisk Fantasies parameters.</p>
          </div>
        </div>

        {/* 1. Dashboard Stats workspace */}
        {activeTab === "Dashboard" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white border border-primary/5 p-6 rounded-3xl shadow-sm">
                <span className="text-[10px] font-bold text-primary/45 uppercase tracking-wide">Gross Revenue</span>
                <h3 className="font-serif text-2xl font-bold mt-1 text-primary">₹{totalRevenue}</h3>
                <span className="text-[10px] text-emerald-600 font-semibold block mt-1">Verified payments only</span>
              </div>
              <div className="bg-white border border-primary/5 p-6 rounded-3xl shadow-sm">
                <span className="text-[10px] font-bold text-primary/45 uppercase tracking-wide">Total Order Volume</span>
                <h3 className="font-serif text-2xl font-bold mt-1 text-primary">{orders.length} orders</h3>
                <span className="text-[10px] text-accent font-semibold block mt-1">Active requests on file</span>
              </div>
              <div className="bg-white border border-primary/5 p-6 rounded-3xl shadow-sm">
                <span className="text-[10px] font-bold text-primary/45 uppercase tracking-wide">Confectionery Items sold</span>
                <h3 className="font-serif text-2xl font-bold mt-1 text-primary">{totalQuantityCakes} cakes</h3>
                <span className="text-[10px] text-primary/60 block mt-1">Freshly baked details</span>
              </div>
              <div className="bg-white border border-primary/5 p-6 rounded-3xl shadow-sm">
                <span className="text-[10px] font-bold text-primary/45 uppercase tracking-wide">Registered Users</span>
                <h3 className="font-serif text-2xl font-bold mt-1 text-primary">8 registered</h3>
                <span className="text-[10px] text-primary/60 block mt-1">Mock account pool</span>
              </div>
            </div>

            <div className="bg-white border border-primary/5 p-6 rounded-3xl shadow-sm space-y-4">
              <h3 className="font-serif text-lg font-bold text-primary">Recent Order Requests</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-primary/10 text-primary/45 uppercase font-bold">
                      <th className="pb-3">Order ID</th>
                      <th className="pb-3">Customer</th>
                      <th className="pb-3">Total</th>
                      <th className="pb-3">Payment status</th>
                      <th className="pb-3">Delivery status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 5).map((order) => (
                      <tr key={order.id} className="border-b border-primary/5 last:border-b-0 hover:bg-secondary/10">
                        <td className="py-4 font-mono font-bold text-accent">{order.id}</td>
                        <td className="py-4 font-semibold">{order.userName}</td>
                        <td className="py-4 font-semibold">₹{order.total}</td>
                        <td className="py-4">
                          <span className={cn(
                            "px-2.5 py-0.5 rounded-full font-bold uppercase text-[9px]",
                            order.paymentStatus === "Verified" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                          )}>
                            {order.paymentStatus}
                          </span>
                        </td>
                        <td className="py-4 font-semibold">{order.deliveryStatus}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 2. Products Manager workspace */}
        {activeTab === "Products" && (
          <div className="space-y-6">
            <div className="flex justify-end">
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
                    {selectedProduct ? "Edit Confectionery" : "Create Confectionery"}
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
                            {pImage ? "Image loaded (base64)" : "Select file..."}
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
                      <button type="button" onClick={() => setProductFormOpen(false)} className="rounded-full border border-primary/15 bg-transparent px-5 py-2.5 font-bold hover:bg-secondary">Cancel</button>
                      <button type="submit" className="rounded-full bg-primary text-white px-6 py-2.5 font-bold hover:bg-primary/95">Save Product</button>
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
                            className="p-2 text-primary/50 hover:text-accent transition-colors"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-2 text-primary/50 hover:text-destructive transition-colors"
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

        {/* 3. Categories manager workspace */}
        {activeTab === "Categories" && (
          <div className="space-y-6">
            <div className="flex justify-end">
              <button
                onClick={() => openCategoryForm()}
                className="rounded-full bg-primary px-5 py-2.5 text-xs font-bold text-white hover:bg-primary/95 flex items-center gap-1 shadow-md cursor-pointer"
              >
                <Plus size={16} /> Add Category
              </button>
            </div>

            {/* Category Form modal */}
            {categoryFormOpen && (
              <div className="fixed inset-0 z-50 bg-black/45 flex items-center justify-center p-4">
                <div className="bg-white border border-primary/5 rounded-3xl p-6 shadow-2xl w-full max-w-md space-y-6">
                  <h2 className="font-serif text-lg font-bold text-primary border-b border-primary/5 pb-3">
                    {selectedCategoryItem ? "Edit Category" : "Add Category"}
                  </h2>
                  <form onSubmit={handleCategorySubmit} className="space-y-4 text-xs">
                    <div className="space-y-1">
                      <label className="font-bold text-primary/60 uppercase">Category Title</label>
                      <input type="text" required value={catName} onChange={(e) => setCatName(e.target.value)} placeholder="E.g., Number Cakes" className="w-full rounded-full border border-primary/10 bg-background px-4 py-2.5 text-primary" />
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-primary/60 uppercase">Category Image File</label>
                      <div className="relative border border-primary/10 rounded-full bg-background px-4 py-2.5 flex items-center justify-between">
                        <span className="text-[10px] text-primary/50 truncate max-w-[250px]">
                          {catImage ? "Image loaded (base64)" : "Upload Cover Image..."}
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
                      <button type="button" onClick={() => setCategoryFormOpen(false)} className="rounded-full border border-primary/15 bg-transparent px-5 py-2 font-bold hover:bg-secondary">Cancel</button>
                      <button type="submit" className="rounded-full bg-primary text-white px-5 py-2 font-bold hover:bg-primary/95">Save Category</button>
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
                      <th className="pb-3">Cover Image</th>
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
                            className="p-1.5 text-primary/50 hover:text-accent transition-colors"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteCategory(c.name)}
                            className="p-1.5 text-primary/50 hover:text-destructive transition-colors"
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

        {/* 4. Offers Tab configuration */}
        {activeTab === "Offers Manager" && (
          <div className="bg-white border border-primary/5 rounded-3xl p-6 shadow-sm space-y-6">
            <h3 className="font-serif text-base font-bold text-primary pb-4 border-b border-primary/5">Limited-Time Flash Offer</h3>
            <form onSubmit={handleOfferToggleSubmit} className="space-y-4 text-xs max-w-md">
              <div className="space-y-1">
                <label className="font-bold text-primary/60 uppercase">Offer Text / Headline</label>
                <input
                  type="text"
                  required
                  value={settings.activeOffer.text}
                  onChange={(e) => setSettings({
                    ...settings,
                    activeOffer: { ...settings.activeOffer, text: e.target.value }
                  })}
                  className="w-full rounded-full border border-primary/10 bg-background px-4 py-2.5 text-primary font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-primary/60 uppercase">Discount Percentage (%)</label>
                  <input
                    type="number"
                    required
                    value={settings.activeOffer.discountPercentage}
                    onChange={(e) => setSettings({
                      ...settings,
                      activeOffer: { ...settings.activeOffer, discountPercentage: Number(e.target.value) }
                    })}
                    className="w-full rounded-full border border-primary/10 bg-background px-4 py-2.5 text-primary"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-primary/60 uppercase">Countdown Duration (Hours)</label>
                  <input
                    type="number"
                    required
                    value={settings.activeOffer.durationHours}
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
                    checked={settings.activeOffer.isActive}
                    onChange={(e) => setSettings({
                      ...settings,
                      activeOffer: { ...settings.activeOffer, isActive: e.target.checked }
                    })}
                    className="rounded accent-accent h-5 w-5"
                  />
                  Run Flash Offer Live
                </label>
              </div>

              <button
                type="submit"
                className="rounded-full bg-primary text-white px-8 py-3 font-bold hover:bg-primary/95"
              >
                Save & Update Offer
              </button>
            </form>
          </div>
        )}

        {/* 5. Hero Banner Manager */}
        {activeTab === "Hero Banners" && (
          <div className="space-y-6">
            <div className="flex justify-end">
              <button
                onClick={() => openBannerForm()}
                className="rounded-full bg-primary px-5 py-2.5 text-xs font-bold text-white hover:bg-primary/95 flex items-center gap-1 shadow-md cursor-pointer"
              >
                <Plus size={16} /> Add Banner
              </button>
            </div>

            {/* Banner form modal */}
            {bannerFormOpen && (
              <div className="fixed inset-0 z-50 bg-black/45 flex items-center justify-center p-4">
                <div className="bg-white border border-primary/5 rounded-3xl p-6 shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto space-y-5">
                  <h2 className="font-serif text-lg font-bold text-primary border-b border-primary/5 pb-3">
                    {selectedBannerItem ? "Edit Banner Slide" : "Add Banner Slide"}
                  </h2>
                  <form onSubmit={handleBannerSubmit} className="space-y-4 text-xs">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="font-bold text-primary/60 uppercase">Headline Title</label>
                        <input type="text" required value={bannerTitle} onChange={(e) => setBannerTitle(e.target.value)} className="w-full rounded-full border border-primary/10 bg-background px-4 py-2.5 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-primary/60 uppercase">CTA Label</label>
                        <input type="text" required value={bannerCtaText} onChange={(e) => setBannerCtaText(e.target.value)} className="w-full rounded-full border border-primary/10 bg-background px-4 py-2.5 text-primary" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="font-bold text-primary/60 uppercase">Subtitle Description</label>
                        <input type="text" required value={bannerSubtitle} onChange={(e) => setBannerSubtitle(e.target.value)} className="w-full rounded-full border border-primary/10 bg-background px-4 py-2.5 text-primary" />
                      </div>
                      <div className="space-y-1">
                        <label className="font-bold text-primary/60 uppercase">CTA Redirect Link</label>
                        <input type="text" required value={bannerCtaLink} onChange={(e) => setBannerCtaLink(e.target.value)} className="w-full rounded-full border border-primary/10 bg-background px-4 py-2.5 text-primary" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="font-bold text-primary/60 uppercase">Upload Banner Background</label>
                      <div className="relative border border-primary/10 rounded-full bg-background px-4 py-2.5 flex items-center justify-between">
                        <span className="text-[10px] text-primary/50 truncate max-w-[300px]">
                          {bannerImage ? "Image loaded (base64)" : "Select Slide Background..."}
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileChangeHelper(e, setBannerImage)}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                        <UploadCloud size={14} className="text-primary/50" />
                      </div>
                    </div>

                    {bannerImage && (
                      <div className="h-28 w-48 overflow-hidden rounded-xl border border-primary/5 bg-secondary/15">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={bannerImage} alt="Banner slide preview" className="h-full w-full object-cover" />
                      </div>
                    )}

                    <div className="flex justify-end gap-2 pt-2">
                      <button type="button" onClick={() => setBannerFormOpen(false)} className="rounded-full border border-primary/15 bg-transparent px-5 py-2 font-bold hover:bg-secondary">Cancel</button>
                      <button type="submit" className="rounded-full bg-primary text-white px-5 py-2 font-bold hover:bg-primary/95">Save Slide</button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            <div className="bg-white border border-primary/5 rounded-3xl p-6 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {banners.map((slide) => (
                  <div key={slide.id} className="border border-primary/5 rounded-2xl overflow-hidden bg-background relative flex flex-col justify-between">
                    <div className="aspect-[3/1] relative bg-secondary overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={slide.image} alt={slide.title} className="h-full w-full object-cover" />
                    </div>
                    <div className="p-4 space-y-2">
                      <h4 className="font-serif font-bold text-sm text-primary">{slide.title}</h4>
                      <p className="text-[10px] text-primary/60 leading-relaxed">{slide.subtitle}</p>
                      <div className="flex justify-between items-center pt-2 border-t border-primary/5 text-[10px]">
                        <span>Link: <span className="font-mono text-accent">{slide.ctaLink}</span></span>
                        <div className="space-x-1">
                          <button
                            onClick={() => openBannerForm(slide)}
                            className="bg-primary/5 hover:bg-accent hover:text-white transition-all rounded-full p-2 text-primary/50"
                          >
                            <Edit size={12} />
                          </button>
                          <button
                            onClick={() => handleDeleteBanner(slide.id)}
                            className="bg-primary/5 hover:bg-destructive hover:text-white transition-all rounded-full p-2 text-primary/50"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 6. Orders Inspection & Payment verification workspace — split Ongoing / Past */}
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
                          <div>Name: <span className="font-semibold">{inspectingOrder.billingInfo.name}</span></div>
                          <div>Phone: <span className="font-semibold">{inspectingOrder.billingInfo.phone}</span></div>
                          <div>Address: <span className="font-semibold">{inspectingOrder.billingInfo.address}, {inspectingOrder.billingInfo.zip}</span></div>
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

        {/* 7. Customers database list */}
        {activeTab === "Customers base" && (
          <div className="bg-white border border-primary/5 rounded-3xl p-6 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-primary/10 text-primary/45 uppercase font-bold">
                    <th className="pb-3">Name</th>
                    <th className="pb-3">Email</th>
                    <th className="pb-3">Phone</th>
                    <th className="pb-3">Address</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.reduce((acc: any[], order) => {
                    if (!acc.some((c) => c.email === order.userEmail)) {
                      acc.push({ name: order.userName, email: order.userEmail, phone: order.billingInfo.phone, address: order.billingInfo.address });
                    }
                    return acc;
                  }, []).map((cust: any, idx: number) => (
                    <tr key={idx} className="border-b border-primary/5 last:border-b-0 hover:bg-secondary/10">
                      <td className="py-4 font-semibold text-primary">{cust.name}</td>
                      <td className="py-4 text-primary/60">{cust.email}</td>
                      <td className="py-4 font-mono">{cust.phone}</td>
                      <td className="py-4 text-primary/60">{cust.address}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 8. Reviews dashboard tab */}
        {activeTab === "Reviews base" && (
          <AdminReviewsTab fetchAllData={fetchAllData} />
        )}

        {/* 9. Coupons workspace list */}
        {activeTab === "Coupons list" && (
          <div className="space-y-6">
            <div className="flex justify-end">
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
                      <button type="button" onClick={() => setCouponFormOpen(false)} className="rounded-full border border-primary/15 bg-transparent px-5 py-2 font-bold hover:bg-secondary">Cancel</button>
                      <button type="submit" className="rounded-full bg-primary text-white px-5 py-2 font-bold hover:bg-primary/95">Save Coupon</button>
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
                      <th className="pb-3">Discount Percentage</th>
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
                            className="p-1.5 text-primary/50 hover:text-accent transition-colors"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteCoupon(c.code)}
                            className="p-1.5 text-primary/50 hover:text-destructive transition-colors"
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
                      <p className="text-[10px] text-primary/40">Separate each pincode with a comma</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="font-bold text-primary/60 uppercase">Delivery Fee (₹)</label>
                        <input type="number" min={0} required value={zoneFee} onChange={(e) => setZoneFee(Number(e.target.value))}
                          className="w-full rounded-full border border-primary/10 bg-background px-4 py-2.5 text-primary" />
                        <p className="text-[10px] text-primary/40">Use 0 for free delivery</p>
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
                <p className="text-xs text-primary/40 py-8 text-center">No delivery zones configured yet. Add your first zone above.</p>
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


        {/* 11. Payment Settings tab */}
        {activeTab === "Payment Settings" && (
          <div className="bg-white border border-primary/5 rounded-3xl p-6 shadow-sm space-y-6">
            <h3 className="font-serif text-base font-bold text-primary pb-4 border-b border-primary/5">UPI Merchant Bank details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs max-w-2xl">
              <div className="space-y-1">
                <label className="font-bold text-primary/60 uppercase">Bank Name</label>
                <input
                  type="text"
                  value={settings.bankName}
                  onChange={(e) => setSettings({ ...settings, bankName: e.target.value })}
                  className="w-full rounded-full border border-primary/10 bg-background px-4 py-2.5 text-primary"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-primary/60 uppercase">Account Name</label>
                <input
                  type="text"
                  value={settings.accountName}
                  onChange={(e) => setSettings({ ...settings, accountName: e.target.value })}
                  className="w-full rounded-full border border-primary/10 bg-background px-4 py-2.5 text-primary"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-primary/60 uppercase">Account Number</label>
                <input
                  type="text"
                  value={settings.accountNumber}
                  onChange={(e) => setSettings({ ...settings, accountNumber: e.target.value })}
                  className="w-full rounded-full border border-primary/10 bg-background px-4 py-2.5 text-primary"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-primary/60 uppercase">IFSC Routing Code</label>
                <input
                  type="text"
                  value={settings.routingNumber}
                  onChange={(e) => setSettings({ ...settings, routingNumber: e.target.value })}
                  className="w-full rounded-full border border-primary/10 bg-background px-4 py-2.5 text-primary"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <label className="font-bold text-primary/60 uppercase">Upload Merchant UPI QR Code Image</label>
                <div className="relative border border-primary/10 rounded-full bg-background px-4 py-2.5 flex items-center justify-between">
                  <span className="text-[10px] text-primary/50 truncate max-w-[400px]">
                    {settings.qrImageUrl ? "QR image loaded (base64)" : "Select merchant QR file..."}
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
                if (res.ok) alert("Payment settings saved persistently!");
              }}
              className="rounded-full bg-primary text-white px-6 py-2.5 font-bold hover:bg-primary/95 text-xs block"
            >
              Save Bank details
            </button>
          </div>
        )}

        {/* 12. WhatsApp Settings */}
        {activeTab === "WhatsApp Rules" && (
          <div className="bg-white border border-primary/5 rounded-3xl p-6 shadow-sm space-y-6">
            <h3 className="font-serif text-base font-bold text-primary pb-4 border-b border-primary/5">WhatsApp Hook configuration</h3>
            <div className="text-xs space-y-4 max-w-md">
              <div className="space-y-1">
                <label className="font-bold text-primary/60 uppercase">WhatsApp Support Number</label>
                <input
                  type="text"
                  value={settings.whatsappNumber}
                  onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                  className="w-full rounded-full border border-primary/10 bg-background px-4 py-2.5 text-primary"
                />
              </div>
              <div className="space-y-1">
                <label className="font-bold text-primary/60 uppercase">Pre-filled Message text</label>
                <input
                  type="text"
                  value={settings.whatsappDefaultMessage}
                  onChange={(e) => setSettings({ ...settings, whatsappDefaultMessage: e.target.value })}
                  className="w-full rounded-full border border-primary/10 bg-background px-4 py-2.5 text-primary"
                />
              </div>
              <button
                onClick={async () => {
                  const res = await fetch("/api/settings", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(settings)
                  });
                  if (res.ok) alert("WhatsApp configurations saved persistently!");
                }}
                className="rounded-full bg-primary text-white px-6 py-2.5 font-bold hover:bg-primary/95"
              >
                Save WhatsApp Details
              </button>
            </div>
          </div>
        )}

        {/* 13. Website config settings */}
        {activeTab === "Website config" && (
          <div className="bg-white border border-primary/5 rounded-3xl p-6 shadow-sm space-y-6">
            <h3 className="font-serif text-base font-bold text-primary pb-4 border-b border-primary/5">Metadata settings</h3>
            <div className="text-xs space-y-4 max-w-md">
              <div className="space-y-1">
                <label className="font-bold text-primary/60 uppercase">Brand/Store Name</label>
                <input
                  type="text"
                  value={settings.websiteName}
                  onChange={(e) => setSettings({ ...settings, websiteName: e.target.value })}
                  className="w-full rounded-full border border-primary/10 bg-background px-4 py-2.5 text-primary"
                />
              </div>
              <button
                onClick={async () => {
                  const res = await fetch("/api/settings", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(settings)
                  });
                  if (res.ok) alert("Website name updated persistently!");
                }}
                className="rounded-full bg-primary text-white px-6 py-2.5 font-bold hover:bg-primary/95"
              >
                Save Configs
              </button>
            </div>
          </div>
        )}

        {/* 14. AI Chatbot knowledge rule settings */}
        {activeTab === "AI Chatbot rules" && (
          <div className="space-y-8">
            {/* Groq Credentials & Context Textarea */}
            <div className="bg-white border border-primary/5 rounded-3xl p-6 shadow-sm space-y-6">
              <h3 className="font-serif text-lg font-bold text-primary pb-3 border-b border-primary/5">
                Groq LLM Chatbot settings
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
                  <label className="font-bold text-primary/60 uppercase">Shop Context Description (for AI Analysis)</label>
                  <textarea
                    rows={6}
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
                    if (res.ok) alert("Groq API parameters updated persistently!");
                  }}
                  className="rounded-full bg-primary text-white px-6 py-2.5 font-bold hover:bg-primary/95 transition-all cursor-pointer"
                >
                  Save Groq Config
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-1 bg-white border border-primary/5 rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="font-serif text-base font-bold text-primary">Add Local Answer Rule (Fallback)</h3>
                <form onSubmit={handleAddAiRule} className="space-y-4 text-xs">
                  <div className="space-y-1">
                    <label className="font-bold text-primary/60 uppercase">Triggers / Keywords (csv)</label>
                    <input type="text" required value={aiKeyword} onChange={(e) => setAiKeyword(e.target.value)} placeholder="E.g., eggless, vegan" className="w-full rounded-full border border-primary/10 bg-background px-4 py-2.5 text-primary" />
                  </div>
                  <div className="space-y-1">
                    <label className="font-bold text-primary/60 uppercase">Automated Answer Response</label>
                    <textarea required rows={4} value={aiResponse} onChange={(e) => setAiResponse(e.target.value)} placeholder="E.g., Yes! We support vegan cakes..." className="w-full rounded-2xl border border-primary/10 bg-background px-4 py-3 text-primary" />
                  </div>
                  <button type="submit" className="w-full rounded-full bg-primary text-white py-2.5 font-bold hover:bg-primary/95">Save Rule</button>
                </form>
              </div>

              <div className="lg:col-span-2 bg-white border border-primary/5 rounded-3xl p-6 shadow-sm space-y-4">
                <h3 className="font-serif text-base font-bold text-primary">Current Local Fallback Rules</h3>
                <div className="space-y-3">
                  {(settings.aiRules || []).map((rule: any, idx: number) => (
                    <div key={idx} className="bg-secondary/15 border border-primary/5 p-4 rounded-2xl text-xs space-y-2 relative">
                      <button
                        onClick={() => handleDeleteAiRule(idx)}
                        className="absolute right-3 top-3 text-primary/35 hover:text-destructive transition-colors"
                        title="Delete rule"
                      >
                        <Trash2 size={14} />
                      </button>
                      <div>
                        <span className="font-bold text-primary/45 uppercase text-[9px] block">Keywords triggers</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {rule.keywords.map((k: string) => (
                            <span key={k} className="bg-white border border-primary/5 px-2 py-0.5 rounded-md font-mono text-[9px] text-accent font-bold">{k}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="font-bold text-primary/45 uppercase text-[9px] block">Answer response</span>
                        <p className="text-primary/80 mt-1 leading-relaxed">{rule.response}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 15. Analytics dashboard graphs */}
        {activeTab === "Analytics view" && (
          <div className="bg-white border border-primary/5 rounded-3xl p-6 shadow-sm space-y-6">
            <h3 className="font-serif text-base font-bold text-primary pb-4 border-b border-primary/5">Order Velocity Chart</h3>
            <div className="aspect-[2/1] w-full max-w-2xl bg-secondary/15 rounded-3xl border border-primary/5 flex flex-col justify-end p-6 relative">
              <div className="absolute inset-0 flex items-center justify-center text-primary/30 text-xs font-bold gap-1">
                <TrendingUp size={16} /> Sales & Order volumes have risen by 15% this week
              </div>
              <div className="w-full flex justify-between items-end h-40 gap-4 relative z-10 pt-10">
                <div className="w-full bg-accent rounded-t-lg h-[20%]" />
                <div className="w-full bg-accent rounded-t-lg h-[45%]" />
                <div className="w-full bg-accent rounded-t-lg h-[30%]" />
                <div className="w-full bg-accent rounded-t-lg h-[75%]" />
                <div className="w-full bg-primary rounded-t-lg h-[95%]" />
              </div>
              <div className="flex justify-between text-[10px] font-bold text-primary/45 mt-4">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function AdminReviewsTab({ fetchAllData }: { fetchAllData: () => void }) {
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
                    <div className="flex text-amber-400">
                      {Array.from({ length: rv.rating }).map((_: any, i: number) => (
                        <Star key={i} size={11} className="fill-current" />
                      ))}
                    </div>
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

