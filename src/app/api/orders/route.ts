import { NextResponse } from "next/server";
import { readTable, writeTable } from "@/services/db";
import { getSession } from "@/services/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orders = await readTable<any>("orders");

    // Admins see all orders. Customers see their own orders.
    if (session.role === "admin" || session.role === "super-admin") {
      return NextResponse.json({ orders });
    } else {
      const userOrders = orders.filter((o) => o.userId === session.id);
      return NextResponse.json({ orders: userOrders });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { cartItems, billingInfo, couponApplied, paymentScreenshot } = body;

    // 1. Validation checks
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return NextResponse.json({ error: "Cart cannot be empty" }, { status: 400 });
    }

    if (!billingInfo || !billingInfo.name || !billingInfo.phone || !billingInfo.address || !billingInfo.zip) {
      return NextResponse.json({ error: "Missing required delivery information" }, { status: 400 });
    }

    // 2. Fetch database records for server-side revalidation
    const dbProducts = await readTable<any>("products");
    const dbCoupons = await readTable<any>("coupons");
    const dbDeliveryZones = await readTable<any>("delivery");

    // 3. Server-side price calculation
    let serverSubtotal = 0;
    const validatedCartItems = [];

    for (const item of cartItems) {
      const product = dbProducts.find((p) => p.id === item.id);
      if (!product) {
        return NextResponse.json({ error: `Product "${item.name || item.id}" is no longer available` }, { status: 400 });
      }

      const unitPrice = Number(product.price);
      const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1));
      const itemSubtotal = unitPrice * quantity;
      serverSubtotal += itemSubtotal;

      validatedCartItems.push({
        ...item,
        price: unitPrice,
        quantity,
      });
    }

    // 4. Server-side coupon discount calculation
    let discountPercentage = 0;
    let validCouponCode: string | null = null;

    if (couponApplied) {
      const normalizedCode = (couponApplied || "").trim().toUpperCase();
      // Check database coupons
      const matchedCoupon = dbCoupons.find((c) => (c.code || "").trim().toUpperCase() === normalizedCode);
      if (matchedCoupon) {
        discountPercentage = Number(matchedCoupon.discountPercentage || matchedCoupon.discount || 0);
        validCouponCode = matchedCoupon.code;
      } else {
        // Check built-in fallbacks
        const fallbacks: Record<string, number> = { LUXURY10: 10, WELCOME15: 15, WHISK20: 20 };
        if (fallbacks[normalizedCode]) {
          discountPercentage = fallbacks[normalizedCode];
          validCouponCode = normalizedCode;
        }
      }
    }

    const serverDiscount = Math.round((serverSubtotal * discountPercentage) / 100);

    // 5. Server-side shipping fee calculation
    let serverShippingFee = 150; // Default flat fee
    const customerZip = (billingInfo.zip || "").trim();

    const matchedZone = dbDeliveryZones.find((zone) =>
      (zone.pincodes || []).some((pin: string) => pin.trim() === customerZip)
    );

    if (matchedZone) {
      serverShippingFee = Number(matchedZone.fee);
    } else if (serverSubtotal > 1000) {
      serverShippingFee = 0; // Free delivery over ₹1000
    }

    const serverTotal = Math.max(0, serverSubtotal - serverDiscount + serverShippingFee);

    // Try to get session — allow guest orders too
    const session = await getSession();

    // Determine user identity from session OR billing info (guest)
    const userId = session?.id || `guest-${Date.now()}`;
    const userName = session?.name || billingInfo.name || "Guest Customer";
    const userEmail = session?.email || billingInfo.email || "";

    const existingOrders = await readTable<any>("orders");

    // 6. Duplicate order prevention (check if same user submitted an identical order in the last 10 seconds)
    const tenSecondsAgo = Date.now() - 10000;
    const isDuplicate = existingOrders.some((o) => {
      const orderTime = new Date(o.date).getTime();
      return (
        o.userId === userId &&
        orderTime > tenSecondsAgo &&
        o.total === serverTotal
      );
    });

    if (isDuplicate) {
      return NextResponse.json({ error: "Duplicate order submission detected. Please wait a moment." }, { status: 429 });
    }

    const newOrder = {
      id: `order-${Date.now()}`,
      userId,
      userName,
      userEmail,
      date: new Date().toISOString(),
      cartItems: validatedCartItems,
      billingInfo,
      couponApplied: validCouponCode,
      subtotal: serverSubtotal,
      discount: serverDiscount,
      shippingFee: serverShippingFee,
      total: serverTotal,
      paymentScreenshot: paymentScreenshot || "",
      paymentStatus: "Pending Verification",
      deliveryStatus: "Placed",
      statusHistory: [
        { status: "Placed", time: new Date().toISOString() }
      ]
    };

    existingOrders.unshift(newOrder); // Add new order to top
    await writeTable("orders", existingOrders);

    return NextResponse.json({ success: true, orderId: newOrder.id, total: serverTotal });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Failed to place order" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();
    if (!session || (session.role !== "admin" && session.role !== "super-admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await request.json();
    const orders = await readTable<any>("orders");

    const { orderId, paymentStatus, deliveryStatus } = body;

    const existingIndex = orders.findIndex((o) => o.id === orderId);
    if (existingIndex === -1) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const order = orders[existingIndex];

    if (paymentStatus) {
      order.paymentStatus = paymentStatus;
    }

    if (deliveryStatus && deliveryStatus !== order.deliveryStatus) {
      order.deliveryStatus = deliveryStatus;
      order.statusHistory = order.statusHistory || [];
      order.statusHistory.push({
        status: deliveryStatus,
        time: new Date().toISOString()
      });
    }

    orders[existingIndex] = order;
    await writeTable("orders", orders);

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
