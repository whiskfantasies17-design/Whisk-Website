import { NextResponse } from "next/server";
import { readTable, writeTable } from "@/services/db";
import { getSession } from "@/services/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get("productId");
    
    let reviews = await readTable<any>("reviews");
    if (productId) {
      reviews = reviews.filter((r) => r.productId === productId);
    }
    return NextResponse.json({ reviews });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // Admin overwrite — used for single review deletion from admin panel
    if (body._overwrite !== undefined && Array.isArray(body._overwrite)) {
      if (session.role !== "admin" && session.role !== "super-admin") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
      await writeTable("reviews", body._overwrite);
      return NextResponse.json({ success: true });
    }

    const reviews = await readTable<any>("reviews");
    const { productId, rating, review, orderId } = body;

    // Prevent duplicate reviews per order
    const alreadyReviewed = reviews.some((r: any) => r.orderId && r.orderId === orderId);
    if (orderId && alreadyReviewed) {
      return NextResponse.json({ error: "You have already reviewed this order." }, { status: 400 });
    }

    const newReview = {
      id: `review-${Date.now()}`,
      orderId: orderId || null,
      productId,
      userName: session.name,
      userId: session.id,
      rating: Number(rating),
      review,
      date: new Date().toISOString()
    };

    reviews.unshift(newReview);
    await writeTable("reviews", reviews);

    // Update product rating dynamically
    const products = await readTable<any>("products");
    const pIndex = products.findIndex((p: any) => p.id === productId);
    if (pIndex > -1) {
      const pReviews = reviews.filter((r: any) => r.productId === productId);
      const totalRating = pReviews.reduce((sum: number, r: any) => sum + r.rating, 0);
      products[pIndex].rating = Number((totalRating / pReviews.length).toFixed(1));
      products[pIndex].reviewsCount = pReviews.length;
      await writeTable("products", products);
    }

    return NextResponse.json({ success: true, review: newReview });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// DELETE — admin only: clear ALL reviews at once
export async function DELETE() {
  try {
    const session = await getSession();
    if (!session || (session.role !== "admin" && session.role !== "super-admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    await writeTable("reviews", []);
    // Reset all product review counts
    const products = await readTable<any>("products");
    const updated = products.map((p: any) => ({ ...p, rating: 5.0, reviewsCount: 0 }));
    await writeTable("products", updated);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
