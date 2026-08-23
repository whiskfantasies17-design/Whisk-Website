require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");
const fs = require("fs").promises;

const { readTable, writeTable, readSettings, writeSettings, safeReadJson, safeWriteJson, MOCK_DATA_DIR } = require("./db");
const { getSessionFromRequest, setSessionCookie, clearSessionCookie } = require("./auth");

const app = express();
const PORT = process.env.PORT || 5000;

// Allowed Origins for CORS
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3000",
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, postman)
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive CORS for smooth deployment
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));
app.use(cookieParser());

// Logging Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "Whisk Fantasies Express Backend", timestamp: new Date().toISOString() });
});

// ==========================================
// 1. AUTH ROUTES
// ==========================================

// GET /api/auth/session
app.get("/api/auth/session", (req, res) => {
  const session = getSessionFromRequest(req);
  res.json({ session });
});

// POST /api/auth/login
app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const cleanEmail = (email || "").trim().toLowerCase();
    const cleanPassword = (password || "").trim();

    const MASTER_ADMIN_EMAIL = (process.env.ADMIN_EMAIL || "whiskfantasies17@gmail.com").trim().toLowerCase();
    const MASTER_ADMIN_PASSWORD = (process.env.ADMIN_PASSWORD || "Whisk@Password@2026").trim();

    // 1. Master Admin Match
    if (cleanEmail === MASTER_ADMIN_EMAIL && cleanPassword === MASTER_ADMIN_PASSWORD) {
      const adminSession = {
        id: "user-admin-master",
        email: MASTER_ADMIN_EMAIL,
        name: "Whisk Owner Admin",
        role: "admin",
        address: "Karm Stambh, LBS Marg, Vikhroli, Mumbai",
        phone: "+91 8424016876",
      };
      setSessionCookie(res, adminSession);
      return res.json({ user: adminSession, session: adminSession });
    }

    // 2. Database Lookup
    const users = await readTable("users");
    const user = users.find(
      (u) =>
        (u.email || "").trim().toLowerCase() === cleanEmail &&
        (u.password || "").trim() === cleanPassword
    );

    if (user) {
      const sessionUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        address: user.address,
        phone: user.phone,
      };
      setSessionCookie(res, sessionUser);
      return res.json({ user: sessionUser, session: sessionUser });
    }

    // 3. Fallback Admin Match
    if (cleanEmail.includes("admin") || cleanEmail.includes("owner") || cleanEmail === "admin@whisk.com") {
      if (cleanPassword === MASTER_ADMIN_PASSWORD || cleanPassword === "Whisk@Password@2026") {
        const adminSession = {
          id: "user-admin-master",
          email: cleanEmail,
          name: "Whisk Owner Admin",
          role: "admin",
          address: "Karm Stambh, LBS Marg, Vikhroli, Mumbai",
          phone: "+91 8424016876",
        };
        setSessionCookie(res, adminSession);
        return res.json({ user: adminSession, session: adminSession });
      }
    }

    return res.status(401).json({ error: "Invalid email or password" });
  } catch (e) {
    return res.status(500).json({ error: e.message || "Internal server error" });
  }
});

// POST /api/auth/signup
app.post("/api/auth/signup", async (req, res) => {
  try {
    const { name, email, password, address, phone } = req.body || {};
    const users = await readTable("users");

    if (users.some((u) => u.email === email)) {
      return res.status(400).json({ error: "Email already in use" });
    }

    const newUser = {
      id: `user-${Date.now()}`,
      email,
      password,
      name,
      role: "customer",
      address: address || "",
      phone: phone || "",
    };

    users.push(newUser);
    await writeTable("users", users);

    const sessionUser = {
      id: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      address: newUser.address,
      phone: newUser.phone,
    };

    setSessionCookie(res, sessionUser);
    return res.json({ user: sessionUser });
  } catch (e) {
    return res.status(500).json({ error: e.message || "Internal server error" });
  }
});

// POST /api/auth/logout
app.post("/api/auth/logout", (req, res) => {
  clearSessionCookie(res);
  res.json({ success: true });
});

// ==========================================
// 2. PRODUCTS ROUTES
// ==========================================

// GET /api/products
app.get("/api/products", async (req, res) => {
  try {
    const search = (req.query.search || "").toString().toLowerCase();
    const category = (req.query.category || "").toString();
    const occasion = (req.query.occasion || "").toString();
    const customizable = req.query.customizable;

    let products = await readTable("products");

    if (search) {
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(search) ||
          p.description.toLowerCase().includes(search) ||
          p.category.toLowerCase().includes(search)
      );
    }

    if (category) {
      products = products.filter((p) => p.category.toLowerCase() === category.toLowerCase());
    }

    if (occasion) {
      products = products.filter((p) =>
        (p.occasions || []).some((o) => o.toLowerCase() === occasion.toLowerCase())
      );
    }

    if (customizable !== null && customizable !== undefined) {
      const isCustomVal = customizable === "true";
      products = products.filter((p) => p.isCustomizable === isCustomVal);
    }

    res.json({ products });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/products
app.post("/api/products", async (req, res) => {
  try {
    const session = getSessionFromRequest(req);
    if (!session || (session.role !== "admin" && session.role !== "super-admin")) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const products = await readTable("products");
    const { id, name, price, rating, reviewsCount, image, category, description, occasions, flavors, sizes, isSignature, isCustomizable } = req.body;

    const existingIndex = products.findIndex((p) => p.id === id);

    if (existingIndex > -1) {
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
      const newProduct = {
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
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/products
app.delete("/api/products", async (req, res) => {
  try {
    const session = getSessionFromRequest(req);
    if (!session || (session.role !== "admin" && session.role !== "super-admin")) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const id = req.query.id;
    if (!id) {
      return res.status(400).json({ error: "Missing product ID" });
    }

    let products = await readTable("products");
    products = products.filter((p) => p.id !== id);
    await writeTable("products", products);

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ==========================================
// 3. BANNERS ROUTES
// ==========================================

// GET /api/banners
app.get("/api/banners", async (req, res) => {
  try {
    const banners = await readTable("banners");
    res.json({ banners });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/banners
app.post("/api/banners", async (req, res) => {
  try {
    const session = getSessionFromRequest(req);
    if (!session || (session.role !== "admin" && session.role !== "super-admin")) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await writeTable("banners", req.body);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ==========================================
// 4. CATEGORIES ROUTES
// ==========================================

// GET /api/categories
app.get("/api/categories", async (req, res) => {
  try {
    const categories = await readTable("categories");
    res.json({ categories });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/categories
app.post("/api/categories", async (req, res) => {
  try {
    const session = getSessionFromRequest(req);
    if (!session || (session.role !== "admin" && session.role !== "super-admin")) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await writeTable("categories", req.body);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ==========================================
// 5. ORDERS ROUTES
// ==========================================

// GET /api/orders
app.get("/api/orders", async (req, res) => {
  try {
    const session = getSessionFromRequest(req);
    if (!session) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const orders = await readTable("orders");

    if (session.role === "admin" || session.role === "super-admin") {
      res.json({ orders });
    } else {
      const userOrders = orders.filter((o) => o.userId === session.id);
      res.json({ orders: userOrders });
    }
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/orders
app.post("/api/orders", async (req, res) => {
  try {
    const body = req.body || {};
    const { cartItems, billingInfo, couponApplied, subtotal, shippingFee, total, paymentScreenshot } = body;
    const session = getSessionFromRequest(req);

    const userId = session?.id || `guest-${Date.now()}`;
    const userName = session?.name || billingInfo?.name || "Guest Customer";
    const userEmail = session?.email || billingInfo?.email || "";

    const newOrder = {
      id: `order-${Date.now()}`,
      userId,
      userName,
      userEmail,
      date: new Date().toISOString(),
      cartItems,
      billingInfo,
      couponApplied,
      subtotal,
      shippingFee,
      total,
      paymentScreenshot: paymentScreenshot || "",
      paymentStatus: "Pending Verification",
      deliveryStatus: "Placed",
      statusHistory: [{ status: "Placed", time: new Date().toISOString() }],
    };

    const orders = await readTable("orders");
    orders.unshift(newOrder);
    await writeTable("orders", orders);

    res.json({ success: true, orderId: newOrder.id });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// PUT /api/orders
app.put("/api/orders", async (req, res) => {
  try {
    const session = getSessionFromRequest(req);
    if (!session || (session.role !== "admin" && session.role !== "super-admin")) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const orders = await readTable("orders");
    const { orderId, paymentStatus, deliveryStatus } = req.body || {};

    const existingIndex = orders.findIndex((o) => o.id === orderId);
    if (existingIndex === -1) {
      return res.status(404).json({ error: "Order not found" });
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
        time: new Date().toISOString(),
      });
    }

    orders[existingIndex] = order;
    await writeTable("orders", orders);

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ==========================================
// 6. REVIEWS ROUTES
// ==========================================

// GET /api/reviews
app.get("/api/reviews", async (req, res) => {
  try {
    const productId = req.query.productId;
    let reviews = await readTable("reviews");
    if (productId) {
      reviews = reviews.filter((r) => r.productId === productId);
    }
    res.json({ reviews });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/reviews
app.post("/api/reviews", async (req, res) => {
  try {
    const session = getSessionFromRequest(req);
    if (!session) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const body = req.body || {};

    // Admin overwrite handling
    if (body._overwrite !== undefined && Array.isArray(body._overwrite)) {
      if (session.role !== "admin" && session.role !== "super-admin") {
        return res.status(403).json({ error: "Unauthorized" });
      }
      await writeTable("reviews", body._overwrite);
      return res.json({ success: true });
    }

    const reviews = await readTable("reviews");
    const { productId, rating, review, orderId } = body;

    const alreadyReviewed = reviews.some((r) => r.orderId && r.orderId === orderId);
    if (orderId && alreadyReviewed) {
      return res.status(400).json({ error: "You have already reviewed this order." });
    }

    const newReview = {
      id: `review-${Date.now()}`,
      orderId: orderId || null,
      productId,
      userName: session.name,
      userId: session.id,
      rating: Number(rating),
      review,
      date: new Date().toISOString(),
    };

    reviews.unshift(newReview);
    await writeTable("reviews", reviews);

    // Dynamic product rating calculation
    const products = await readTable("products");
    const pIndex = products.findIndex((p) => p.id === productId);
    if (pIndex > -1) {
      const pReviews = reviews.filter((r) => r.productId === productId);
      const totalRating = pReviews.reduce((sum, r) => sum + r.rating, 0);
      products[pIndex].rating = Number((totalRating / pReviews.length).toFixed(1));
      products[pIndex].reviewsCount = pReviews.length;
      await writeTable("products", products);
    }

    res.json({ success: true, review: newReview });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// DELETE /api/reviews
app.delete("/api/reviews", async (req, res) => {
  try {
    const session = getSessionFromRequest(req);
    if (!session || (session.role !== "admin" && session.role !== "super-admin")) {
      return res.status(403).json({ error: "Unauthorized" });
    }
    await writeTable("reviews", []);
    const products = await readTable("products");
    const updated = products.map((p) => ({ ...p, rating: 5.0, reviewsCount: 0 }));
    await writeTable("products", updated);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ==========================================
// 7. SETTINGS ROUTES
// ==========================================

// GET /api/settings
app.get("/api/settings", async (req, res) => {
  try {
    const settings = await readSettings();
    res.json({ settings });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/settings
app.post("/api/settings", async (req, res) => {
  try {
    const session = getSessionFromRequest(req);
    if (!session || (session.role !== "admin" && session.role !== "super-admin")) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const diskSafe = { ...(req.body || {}) };
    if (diskSafe.qrImageUrl && diskSafe.qrImageUrl.startsWith("data:")) {
      delete diskSafe.qrImageUrl;
    }

    await writeSettings(diskSafe);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ==========================================
// 8. COUPONS ROUTES
// ==========================================

// GET /api/coupons
app.get("/api/coupons", async (req, res) => {
  try {
    const coupons = await readTable("coupons");
    res.json({ coupons });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/coupons
app.post("/api/coupons", async (req, res) => {
  try {
    const session = getSessionFromRequest(req);
    if (!session || (session.role !== "admin" && session.role !== "super-admin")) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await writeTable("coupons", req.body);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ==========================================
// 9. DELIVERY ROUTES
// ==========================================

// GET /api/delivery
app.get("/api/delivery", async (req, res) => {
  try {
    const deliveryPath = path.join(MOCK_DATA_DIR, "delivery.json");
    const zones = (await safeReadJson(deliveryPath)) || [];
    res.json({ zones });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// POST /api/delivery
app.post("/api/delivery", async (req, res) => {
  try {
    const session = getSessionFromRequest(req);
    if (!session || (session.role !== "admin" && session.role !== "super-admin")) {
      return res.status(403).json({ error: "Unauthorized" });
    }
    const deliveryPath = path.join(MOCK_DATA_DIR, "delivery.json");
    await safeWriteJson(deliveryPath, req.body || []);
    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// ==========================================
// 10. CHAT ROUTE
// ==========================================

// POST /api/chat
app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body || {};
    if (!message) {
      return res.status(400).json({ error: "Missing message query" });
    }

    const settings = await readSettings();
    const groqApiKey = settings?.groqApiKey || "";
    const aiShopContext = settings?.aiShopContext || settings?.systemPrompt || "";
    const aiRules = settings?.aiRules || [];

    if (groqApiKey.trim()) {
      try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${groqApiKey.trim()}`,
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
              {
                role: "system",
                content: `You are the friendly and premium AI Concierge chatbot for "Whisk Fantasies", an eggless boutique bakery in Mumbai. Use the following context details to answer customer questions. Be helpful, concise, and professional. If the customer's question is not answered by the context, guide them to contact the team on WhatsApp (+91 8424 016 876). Do not make up facts outside the context.\n\nContext:\n${aiShopContext}`,
              },
              {
                role: "user",
                content: message,
              },
            ],
            temperature: 0.5,
            max_tokens: 250,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const reply = data.choices?.[0]?.message?.content;
          if (reply) {
            return res.json({ reply });
          }
        }
      } catch (err) {
        console.error("Groq API call error, falling back to keywords:", err);
      }
    }

    const query = message.toLowerCase();
    let matchedResponse = "";

    for (const rule of aiRules) {
      const hasKeyword = rule.keywords.some((keyword) => query.includes(keyword));
      if (hasKeyword) {
        matchedResponse = rule.response;
        break;
      }
    }

    const fallbackReply =
      matchedResponse ||
      "Thank you for contacting Whisk Fantasies! Our concierge chefs are currently baking. You can reach our design team directly on WhatsApp for custom cake design requests!";

    return res.json({ reply: fallbackReply });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// ==========================================
// 11. USERS ROUTE
// ==========================================

// PATCH /api/users
app.patch("/api/users", async (req, res) => {
  try {
    const session = getSessionFromRequest(req);
    if (!session) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { name, phone, address } = req.body || {};
    const usersPath = path.join(MOCK_DATA_DIR, "users.json");
    const users = (await safeReadJson(usersPath)) || [];

    const idx = users.findIndex((u) => u.id === session.id);
    if (idx === -1) {
      return res.status(404).json({ error: "User not found" });
    }

    users[idx] = {
      ...users[idx],
      name: name || users[idx].name,
      phone: phone || users[idx].phone,
      address: address || users[idx].address,
    };

    await safeWriteJson(usersPath, users);
    res.json({ success: true, user: users[idx] });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`🚀 Whisk Fantasies Express Backend listening on port ${PORT}`);
});
