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
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const orders = await readTable<any>("orders");

    const { cartItems, billingInfo, couponApplied, subtotal, shippingFee, total, paymentScreenshot } = body;

    const newOrder = {
      id: `order-${Date.now()}`,
      userId: session.id,
      userName: session.name,
      userEmail: session.email,
      date: new Date().toISOString(),
      cartItems,
      billingInfo,
      couponApplied,
      subtotal,
      shippingFee,
      total,
      paymentScreenshot: paymentScreenshot || "", // Base64 dummy screenshot or mock URL
      paymentStatus: "Pending Verification",
      deliveryStatus: "Placed",
      statusHistory: [
        { status: "Placed", time: new Date().toISOString() }
      ]
    };

    orders.unshift(newOrder); // Add new order to top
    await writeTable("orders", orders);

    return NextResponse.json({ success: true, orderId: newOrder.id });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
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
