import { NextResponse } from "next/server";
import { readTable, writeTable } from "@/services/db";
import { getSession } from "@/services/auth";
import { Product } from "@/mock-data/products";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.toLowerCase() || "";
    const category = searchParams.get("category") || "";
    const occasion = searchParams.get("occasion") || "";
    const customizable = searchParams.get("customizable");

    let products = await readTable<Product>("products");

    // Apply Search filter
    if (search) {
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.description.toLowerCase().includes(search) ||
          p.category.toLowerCase().includes(search)
      );
    }

    // Apply Category filter
    if (category) {
      products = products.filter(
        (p) => p.category.toLowerCase() === category.toLowerCase()
      );
    }

    // Apply Occasion filter
    if (occasion) {
      products = products.filter((p) =>
        p.occasions.some((o) => o.toLowerCase() === occasion.toLowerCase())
      );
    }

    // Apply Customizability filter
    if (customizable !== null && customizable !== undefined) {
      const isCustomVal = customizable === "true";
      products = products.filter((p) => p.isCustomizable === isCustomVal);
    }

    return NextResponse.json({ products });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "admin" && session.role !== "super-admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const products = await readTable<Product>("products");

    const { id, name, price, rating, reviewsCount, image, category, description, occasions, flavors, sizes, isSignature, isCustomizable } = body;

    const existingIndex = products.findIndex((p) => p.id === id);

    if (existingIndex > -1) {
      // Update existing product
      products[existingIndex] = {
        ...products[existingIndex],
        name,
        price: Number(price),
        image,
        category,
        description,
        occasions,
        flavors,
        sizes,
        isSignature: !!isSignature,
        isCustomizable: !!isCustomizable,
      };
    } else {
      // Add new product
      const newProduct: Product = {
        id: id || `cake-${Date.now()}`,
        name,
        price: Number(price),
        rating: rating || 5.0,
        reviewsCount: reviewsCount || 1,
        image: image || "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80",
        category,
        description,
        occasions: occasions || [],
        flavors: flavors || ["Signature Vanilla"],
        sizes: sizes || ["1 kg"],
        isSignature: !!isSignature,
        isCustomizable: !!isCustomizable,
      };
      products.push(newProduct);
    }

    await writeTable("products", products);
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "admin" && session.role !== "super-admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "Missing product ID" }, { status: 400 });
    }

    let products = await readTable<Product>("products");
    products = products.filter((p) => p.id !== id);
    await writeTable("products", products);

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

