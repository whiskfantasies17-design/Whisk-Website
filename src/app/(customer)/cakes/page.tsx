"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, SlidersHorizontal, ArrowUpDown, RefreshCw } from "lucide-react";
import { ProductCard } from "@/components/customer/ProductCard";
import { Product } from "@/mock-data/products";

function CakesContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Local state for filters derived from URL or updated locally
  const [searchVal, setSearchVal] = useState(searchParams.get("search") || "");
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get("category") || "");
  const [selectedOccasion, setSelectedOccasion] = useState(searchParams.get("occasion") || "");
  const [customizableOnly, setCustomizableOnly] = useState(searchParams.get("customizable") === "true");
  const [sortBy, setSortBy] = useState("default");

  // Keep searchVal updated if URL search changes
  useEffect(() => {
    setSearchVal(searchParams.get("search") || "");
    setSelectedCategory(searchParams.get("category") || "");
    setSelectedOccasion(searchParams.get("occasion") || "");
    setCustomizableOnly(searchParams.get("customizable") === "true");
  }, [searchParams]);

  // Fetch products based on filters
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (searchVal) q.set("search", searchVal);
      if (selectedCategory) q.set("category", selectedCategory);
      if (selectedOccasion) q.set("occasion", selectedOccasion);
      if (customizableOnly) q.set("customizable", "true");

      const res = await fetch(`/api/products?${q.toString()}`);
      const data = await res.json();
      if (res.ok) {
        let list = data.products as Product[];
        
        // Client-side sorting
        if (sortBy === "price-low") {
          list = [...list].sort((a, b) => a.price - b.price);
        } else if (sortBy === "price-high") {
          list = [...list].sort((a, b) => b.price - a.price);
        } else if (sortBy === "rating") {
          list = [...list].sort((a, b) => b.rating - a.rating);
        }

        setProducts(list);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [searchVal, selectedCategory, selectedOccasion, customizableOnly, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrl("search", searchVal);
  };

  const updateUrl = (key: string, value: string | boolean) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, String(value));
    } else {
      params.delete(key);
    }
    router.push(`/cakes?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearchVal("");
    setSelectedCategory("");
    setSelectedOccasion("");
    setCustomizableOnly(false);
    setSortBy("default");
    router.push("/cakes");
  };

  const [dynamicCategories, setDynamicCategories] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.categories && data.categories.length > 0) {
          setDynamicCategories(data.categories.map((c: any) => c.name));
        }
      })
      .catch(() => {});
  }, []);

  const categories = dynamicCategories.length > 0 ? dynamicCategories : [
    "Birthday Cakes",
    "Anniversary Cakes",
    "Wedding Cakes",
    "Chocolate Cakes",
    "Cheesecakes",
    "Healthy Cakes",
    "Brownies",
    "Cupcakes",
    "Tea Cakes",
    "Custom Cakes"
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header and summary */}
      <div className="border-b border-primary/5 pb-6">
        <h1 className="font-serif text-3xl font-bold tracking-tight text-primary">
          Our Boutique Collection
        </h1>
        <p className="text-sm text-primary/60 mt-1">
          Explore and customize our premium luxury confectionery catalog.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left Sidebar Filters */}
        <aside className="w-full lg:w-64 space-y-6 flex-shrink-0">
          <div className="rounded-2xl border border-primary/5 bg-white p-5 space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-primary flex items-center gap-1.5">
                <SlidersHorizontal size={16} /> Filters
              </span>
              <button
                onClick={clearFilters}
                className="text-[10px] font-bold text-accent uppercase hover:underline"
              >
                Clear All
              </button>
            </div>

            {/* Category Filter */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-primary/45">
                Category
              </h4>
              <div className="flex flex-col gap-2">
                {categories.map((cat) => (
                  <label key={cat} className="flex items-center gap-2 text-sm text-primary/75 cursor-pointer hover:text-accent">
                    <input
                      type="radio"
                      name="category"
                      checked={selectedCategory === cat}
                      onChange={() => updateUrl("category", cat)}
                      className="accent-accent"
                    />
                    {cat}
                  </label>
                ))}
              </div>
            </div>

            {/* Customizability */}
            <div className="space-y-2 border-t border-primary/5 pt-4">
              <label className="flex items-center gap-2 text-sm font-semibold text-primary cursor-pointer">
                <input
                  type="checkbox"
                  checked={customizableOnly}
                  onChange={(e) => updateUrl("customizable", e.target.checked)}
                  className="rounded accent-accent h-4 w-4"
                />
                Customizable Only
              </label>
            </div>
          </div>
        </aside>

        {/* Main Grid Content */}
        <div className="flex-1 space-y-6">
          {/* Toolbar Search / Sort */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Search Input */}
            <form onSubmit={handleSearchSubmit} className="relative w-full sm:max-w-xs">
              <input
                type="text"
                placeholder="Search..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="w-full rounded-full border border-primary/10 bg-white px-4 py-2 pl-9 text-sm text-primary focus:outline-none focus:border-accent"
              />
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-primary/30" />
            </form>

            {/* Sorting */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <ArrowUpDown size={14} className="text-primary/45" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-full border border-primary/10 bg-white px-4 py-2 text-xs font-semibold text-primary focus:outline-none focus:border-accent"
              >
                <option value="default">Default Sorting</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>

          {/* Grid Render */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[4/5] w-full rounded-2xl bg-secondary/20 animate-pulse border border-primary/5" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-20 bg-white rounded-2xl border border-primary/5 space-y-4">
              <div className="rounded-full bg-secondary/50 p-6 text-primary/20">
                <RefreshCw size={40} className="animate-spin" />
              </div>
              <h3 className="font-serif text-lg font-bold text-primary">No Cakes Match</h3>
              <p className="text-sm text-primary/50 max-w-[280px]">
                We couldn&rsquo;t find anything matching your specific filters. Try loosening your criteria.
              </p>
              <button
                onClick={clearFilters}
                className="rounded-full bg-primary px-6 py-2.5 text-xs font-semibold text-white hover:bg-primary/90"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CakesPage() {
  return (
    <Suspense fallback={
      <div className="mx-auto max-w-7xl px-4 py-20 text-center text-sm font-semibold text-primary">
        Loading boutique catalog...
      </div>
    }>
      <CakesContent />
    </Suspense>
  );
}
