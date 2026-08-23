export interface Product {
  id: string;
  name: string;
  price: number;
  rating: number;
  reviewsCount: number;
  image: string;
  category: string;
  description: string;
  occasions: string[];
  flavors: string[];
  sizes: string[];
  isSignature: boolean;
  isCustomizable: boolean;
}

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "ferrero-rocher",
    name: "Ferrero Rocher Premium Cake",
    price: 1499,
    rating: 4.9,
    reviewsCount: 210,
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80",
    category: "Chocolate Cakes",
    description: "Rich hazelnut chocolate sponge layered with creamy Nutella filling, crushed Ferrero Rocher chocolates, and crispy wafer flakes.",
    occasions: ["Birthday", "Anniversary"],
    flavors: ["Hazelnut Nutella", "Classic Chocolate"],
    sizes: ["0.5 kg", "1 kg", "2 kg"],
    isSignature: true,
    isCustomizable: true
  },
  {
    id: "german-chocolate",
    name: "German Chocolate Gateau",
    price: 1299,
    rating: 4.8,
    reviewsCount: 115,
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80",
    category: "Chocolate Cakes",
    description: "Indulgent moist chocolate cake layered with a caramel-custard filling loaded with toasted coconuts and premium pecans.",
    occasions: ["Birthday", "Anniversary", "Corporate Cakes"],
    flavors: ["Belgian Dark Chocolate", "German Caramel Pecan"],
    sizes: ["0.5 kg", "1 kg"],
    isSignature: true,
    isCustomizable: false
  },
  {
    id: "lotus-biscoff-signature",
    name: "Lotus Biscoff Speculoos Cake",
    price: 1699,
    rating: 4.9,
    reviewsCount: 185,
    image: "https://images.unsplash.com/photo-1518047601542-79f18c655718?auto=format&fit=crop&w=800&q=80",
    category: "Signature Cakes",
    description: "Caramelized speculoos sponge layered with biscoff cookie butter, frosted with light white chocolate mousse, and topped with whole Lotus biscuits.",
    occasions: ["Birthday", "Anniversary"],
    flavors: ["Lotus Biscoff Cookie Butter", "Biscoff Vanilla"],
    sizes: ["0.5 kg", "1 kg", "2 kg"],
    isSignature: true,
    isCustomizable: true
  },
  {
    id: "red-velvet-classic",
    name: "Classic Red Velvet Drip",
    price: 1199,
    rating: 4.7,
    reviewsCount: 140,
    image: "https://images.unsplash.com/photo-1586985289688-ca9cf4991941?auto=format&fit=crop&w=800&q=80",
    category: "Birthday Cakes",
    description: "Vibrant crimson red velvet layers with hints of organic cocoa, filled and frosted with our signature luxury cream cheese frosting.",
    occasions: ["Birthday", "Anniversary", "Wedding"],
    flavors: ["Traditional Cream Cheese Red Velvet", "Red Velvet Oreo"],
    sizes: ["0.5 kg", "1 kg", "2 kg"],
    isSignature: true,
    isCustomizable: true
  },
  {
    id: "ny-baked-cheesecake",
    name: "New York Baked Cheesecake",
    price: 1899,
    rating: 4.9,
    reviewsCount: 195,
    image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=800&q=80",
    category: "Cheesecakes",
    description: "Rich, dense, and incredibly smooth baked cream cheese on a crisp graham cracker crust. Note: Please place cheesecake orders at least 24 hours in advance.",
    occasions: ["Birthday", "Anniversary", "Corporate Cakes"],
    flavors: ["Classic New York Berry", "Plain Vanilla Bean"],
    sizes: ["0.5 kg", "1 kg"],
    isSignature: true,
    isCustomizable: false
  },
  {
    id: "nutella-hazelnut-jar",
    name: "Nutella Hazelnut Cake in a Jar",
    price: 249,
    rating: 4.8,
    reviewsCount: 320,
    image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=800&q=80",
    category: "Cake Jars",
    description: "Layers of rich chocolate sponge, nutella fudge, and toasted hazelnut bits packed into an elegant glass jar.",
    occasions: ["Birthday"],
    flavors: ["Nutella Hazelnut Double Chocolate"],
    sizes: ["Single Jar"],
    isSignature: true,
    isCustomizable: false
  },
  {
    id: "biscoff-brownie",
    name: "Lotus Biscoff Fudge Brownie",
    price: 399,
    rating: 4.8,
    reviewsCount: 160,
    image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80",
    category: "Brownies",
    description: "Super fudgy chocolate brownie block marbled with thick cookie butter swirls and topped with crunchy Biscoff pieces.",
    occasions: ["Birthday", "Corporate Cakes"],
    flavors: ["Fudge Biscoff"],
    sizes: ["Pack of 4"],
    isSignature: true,
    isCustomizable: false
  },
  {
    id: "chocolate-berries-premium",
    name: "Chocolate Berries Drip Cake",
    price: 1799,
    rating: 4.9,
    reviewsCount: 98,
    image: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=800&q=80",
    category: "Chocolate Cakes",
    description: "Belgian dark chocolate cake topped with a rich dark ganache drip, fresh strawberries, raspberries, blueberries, and edible gold dust.",
    occasions: ["Birthday", "Anniversary"],
    flavors: ["Dark Chocolate Berry Fusion"],
    sizes: ["0.5 kg", "1 kg", "2 kg"],
    isSignature: true,
    isCustomizable: true
  }
];

export const MOCK_CATEGORIES = [
  { name: "Chocolate Cakes", slug: "chocolate-cakes", image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=500&q=80" },
  { name: "Cheesecakes", slug: "cheesecakes", image: "https://images.unsplash.com/photo-1565958011703-44f9829ba187?auto=format&fit=crop&w=500&q=80" },
  { name: "Healthy Cakes", slug: "healthy-cakes", image: "https://images.unsplash.com/photo-1518047601542-79f18c655718?auto=format&fit=crop&w=500&q=80" },
  { name: "Brownies", slug: "brownies", image: "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=500&q=80" },
  { name: "Cupcakes", slug: "cupcakes", image: "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=500&q=80" },
  { name: "Cake Jars", slug: "cake-jars", image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=500&q=80" },
  { name: "Cookies", slug: "cookies", image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=500&q=80" },
  { name: "Custom Cakes", slug: "custom-cakes", image: "https://images.unsplash.com/photo-1586985289688-ca9cf4991941?auto=format&fit=crop&w=500&q=80" }
];

export const MOCK_TESTIMONIALS = [
  {
    name: "Karan Johar",
    role: "Mumbai Client",
    review: "The Lotus Biscoff Cake was the highlight of our party! Extremely delicious, 100% vegetarian, and delivered on time to Vikhroli.",
    rating: 5
  },
  {
    name: "Pooja Hegde",
    role: "Local Foodie",
    review: "The Whole Wheat Chocolate Orange cake is my absolute healthy favorite. Love that they use organic jaggery instead of sugar!",
    rating: 5
  },
  {
    name: "Rishi Kapoor",
    role: "Corporate Lead",
    review: "Order delivery was flawless in Mumbai. The Biscoff fudge brownie is highly recommended for office catering.",
    rating: 5
  }
];

export const MOCK_INSTAGRAM = [
  "https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=400&h=400&q=80",
  "https://images.unsplash.com/photo-1535141192574-5d4897c13636?auto=format&fit=crop&w=400&h=400&q=80",
  "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?auto=format&fit=crop&w=400&h=400&q=80",
  "https://images.unsplash.com/photo-1518047601542-79f18c655718?auto=format&fit=crop&w=400&h=400&q=80",
  "https://images.unsplash.com/photo-1586985289688-ca9cf4991941?auto=format&fit=crop&w=400&h=400&q=80",
  "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=400&h=400&q=80"
];
