"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Heart, Star, ShoppingCart, MessageSquare, ArrowLeft, Loader2, Sparkles, Check } from "lucide-react";
import { Product } from "@/mock-data/products";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { cn } from "@/utils/cn";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  // Selected parameters state
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedFlavor, setSelectedFlavor] = useState("");
  const [customMessage, setCustomMessage] = useState("");
  const [quantity, setQuantity] = useState(1);

  // Reviews list & submission states
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [userRating, setUserRating] = useState(5);
  const [userReview, setUserReview] = useState("");
  const [reviewSubmitLoading, setReviewSubmitLoading] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const isWishlisted = product ? isInWishlist(product.id) : false;

  const fetchProductAndReviews = async () => {
    setLoading(true);
    try {
      // Fetch products to find by ID
      const pRes = await fetch("/api/products", { cache: "no-store" });
      const pData = await pRes.json();
      if (pRes.ok) {
        const item = (pData.products as Product[]).find((p) => p.id === id);
        if (item) {
          setProduct(item);
          setSelectedSize(item.sizes[0] || "1 kg");
          setSelectedFlavor(item.flavors[0] || "Madagascar Vanilla");
        } else {
          router.push("/404");
        }
      }

      // Fetch reviews
      const rRes = await fetch(`/api/reviews?productId=${id}`, { cache: "no-store" });
      const rData = await rRes.json();
      if (rRes.ok) {
        setReviews(rData.reviews);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchProductAndReviews();
    }
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      flavor: selectedFlavor,
      size: selectedSize,
      quantity,
      customMessage: customMessage.trim() || undefined,
    });
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !userReview.trim()) return;

    setReviewSubmitLoading(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          rating: userRating,
          review: userReview,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setReviewSuccess(true);
        setUserReview("");
        setUserRating(5);
        
        // Refresh product parameters and reviews list
        fetchProductAndReviews();
        setTimeout(() => setReviewSuccess(false), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setReviewSubmitLoading(false);
    }
  };

  if (loading || !product) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 size={40} className="animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      {/* Back button */}
      <div>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-xs font-bold text-primary/60 hover:text-primary transition-colors uppercase tracking-wider"
        >
          <ArrowLeft size={14} /> Back to boutique
        </button>
      </div>

      {/* Main product configuration layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 xl:gap-16">
        {/* Left Column: Image view */}
        <div className="relative aspect-square w-full overflow-hidden rounded-3xl border border-primary/5 bg-secondary/20 shadow-md">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover"
          />
          {/* Signature badge */}
          {product.isSignature && (
            <span className="absolute left-6 top-6 rounded-full bg-primary/95 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-white">
              Signature Bestseller
            </span>
          )}
        </div>

        {/* Right Column: Customizer configuration */}
        <div className="space-y-6">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-accent">
              {product.category}
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-primary leading-tight">
              {product.name}
            </h1>
            
            {/* Rating stars */}
            <div className="flex items-center gap-1">
              <div className="flex text-amber-400">
                <Star size={16} className="fill-current" />
              </div>
              <span className="text-sm font-bold text-primary">{product.rating}</span>
              <span className="text-xs text-primary/45">({product.reviewsCount} reviews)</span>
            </div>
          </div>

          {/* Pricing */}
          <div className="border-y border-primary/10 py-4">
            <span className="font-serif text-3xl font-bold text-primary">
              ₹{product.price}
            </span>
            <span className="text-xs text-primary/45 ml-2 font-semibold">Free Delivery Eligibility</span>
          </div>

          <p className="text-sm text-primary/70 leading-relaxed">
            {product.description}
          </p>

          {/* Config form */}
          <div className="space-y-5 pt-2">
            {/* Flavor chips */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-primary/60">
                Select Flavor
              </h3>
              <div className="flex flex-wrap gap-2">
                {product.flavors.map((flavor) => (
                  <button
                    key={flavor}
                    onClick={() => setSelectedFlavor(flavor)}
                    className={cn(
                      "rounded-full px-4 py-2 text-xs font-semibold border transition-all cursor-pointer",
                      selectedFlavor === flavor
                        ? "bg-primary border-primary text-white shadow-sm"
                        : "border-primary/10 text-primary hover:border-accent"
                    )}
                  >
                    {flavor}
                  </button>
                ))}
              </div>
            </div>

            {/* Size selector */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-primary/60">
                Select Size
              </h3>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={cn(
                      "rounded-full px-4 py-2 text-xs font-semibold border transition-all cursor-pointer",
                      selectedSize === size
                        ? "bg-primary border-primary text-white shadow-sm"
                        : "border-primary/10 text-primary hover:border-accent"
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom message text box */}
            <div className="space-y-2">
              <div className="flex justify-between items-baseline">
                <h3 className="text-xs font-bold uppercase tracking-wider text-primary/60">
                  Custom message on cake
                </h3>
                <span className="text-[10px] text-primary/45">Optional &bull; Max 40 chars</span>
              </div>
              <input
                type="text"
                maxLength={40}
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="E.g., Happy 30th Birthday Sarah!"
                className="w-full rounded-full border border-primary/10 bg-background px-5 py-3 text-sm text-primary focus:outline-none focus:border-accent placeholder:text-primary/30"
              />
            </div>

            {/* Quantity selection & actions */}
            <div className="flex items-center gap-4 pt-4">
              <div className="flex items-center border border-primary/10 rounded-full bg-background h-12">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3 py-2 text-primary/60 hover:text-accent"
                >
                  -
                </button>
                <span className="px-3 text-sm font-bold text-primary min-w-[20px] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-2 text-primary/60 hover:text-accent"
                >
                  +
                </button>
              </div>

              {/* Wishlist toggle */}
              <button
                onClick={() => toggleWishlist(product)}
                className={cn(
                  "flex h-12 w-12 items-center justify-center rounded-full border shadow-sm transition-all",
                  isWishlisted
                    ? "bg-accent border-accent text-white"
                    : "border-primary/10 hover:border-accent text-primary/80 hover:text-accent"
                )}
                aria-label="Add to favorites"
              >
                <Heart size={20} className={isWishlisted ? "fill-current" : ""} />
              </button>

              {/* Add to Cart button */}
              <button
                onClick={handleAddToCart}
                className="flex-1 rounded-full bg-primary text-white font-bold text-xs sm:text-sm h-12 hover:bg-primary/95 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <ShoppingCart size={16} />
                Add to Cart Selection
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews and Ratings Block */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 border-t border-primary/10 pt-16">
        {/* Write a review column */}
        <div className="space-y-4">
          <h2 className="font-serif text-xl font-bold text-primary">
            Submit a Review
          </h2>
          <p className="text-xs text-primary/60 leading-relaxed">
            Did you order this design? Let us know your gourmet rating and celebration feedback.
          </p>

          <form onSubmit={handleReviewSubmit} className="space-y-4 bg-white p-5 rounded-2xl border border-primary/5">
            {reviewSuccess && (
              <div className="bg-emerald-50 text-emerald-600 text-xs font-semibold p-3.5 rounded-xl border border-emerald-100 flex items-center gap-1.5">
                <Check size={14} /> Review submitted successfully!
              </div>
            )}

            {/* Stars selection */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-primary/50">
                Star Rating
              </label>
              <div className="flex gap-1.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setUserRating(i + 1)}
                    className="text-amber-400 hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Star size={24} className={userRating >= i + 1 ? "fill-current" : ""} />
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-primary/50">
                Your Review
              </label>
              <textarea
                required
                rows={4}
                value={userReview}
                onChange={(e) => setUserReview(e.target.value)}
                placeholder="Share your taste buds experience..."
                className="w-full rounded-2xl border border-primary/10 bg-background px-4 py-3 text-sm text-primary focus:outline-none focus:border-accent"
              />
            </div>

            <button
              type="submit"
              disabled={reviewSubmitLoading}
              className="w-full flex items-center justify-center gap-1.5 rounded-full bg-accent text-white font-bold text-xs py-3 shadow-md disabled:opacity-60 transition-all cursor-pointer"
            >
              {reviewSubmitLoading ? (
                <Loader2 size={12} className="animate-spin" />
              ) : (
                <>
                  <Sparkles size={12} />
                  Submit Rating
                </>
              )}
            </button>
          </form>
        </div>

        {/* Existing Reviews List */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="font-serif text-xl font-bold text-primary flex items-center gap-2">
            <MessageSquare size={18} />
            Customer Reviews
            <span className="text-sm font-sans font-medium text-accent">
              ({reviews.length})
            </span>
          </h2>

          {reviewsLoading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-20 bg-secondary/10 rounded-2xl" />
              <div className="h-20 bg-secondary/10 rounded-2xl" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-10 bg-secondary/5 rounded-2xl border border-primary/5">
              <p className="text-sm text-primary/50 font-medium">Be the first to review this design!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((r) => (
                <div key={r.id} className="bg-white border border-primary/5 p-5 rounded-2xl shadow-sm space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-primary">{r.userName}</span>
                    <span className="text-[10px] text-primary/45">{new Date(r.date).toLocaleDateString()}</span>
                  </div>
                  {/* Rating */}
                  <div className="flex text-amber-400">
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Star key={i} size={12} className="fill-current" />
                    ))}
                  </div>
                  <p className="text-sm text-primary/75 leading-relaxed italic font-serif">
                    &ldquo;{r.review}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
