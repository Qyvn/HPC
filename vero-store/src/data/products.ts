export type CategoryId = "weaves" | "couch-bags" | "colognes" | "tees";

export type Product = {
  id: string;
  name: string;
  category: CategoryId;
  price: number;
  description: string;
  sizes?: string[];
  /** Set when you upload product photos into /public/products/ */
  image?: string;
  featured?: boolean;
  newArrival?: boolean;
};

export const CATEGORIES: {
  id: CategoryId;
  label: string;
  blurb: string;
  tone: string;
}[] = [
  {
    id: "weaves",
    label: "Weaves",
    blurb: "Silken lengths. Soft volume. Ready for the night.",
    tone: "linear-gradient(145deg, #2a221c 0%, #6d5642 48%, #b8955a 100%)",
  },
  {
    id: "couch-bags",
    label: "Couch Bags",
    blurb: "Compact carry. Structured ease for every seat.",
    tone: "linear-gradient(145deg, #1a1a1a 0%, #3f3a34 50%, #8a7b66 100%)",
  },
  {
    id: "colognes",
    label: "Colognes",
    blurb: "Clean notes. Quiet presence that lingers.",
    tone: "linear-gradient(145deg, #141414 0%, #2c3430 45%, #7f8a7a 100%)",
  },
  {
    id: "tees",
    label: "Plain T-Shirts",
    blurb: "Essential cotton. Your everyday signature.",
    tone: "linear-gradient(145deg, #d9d4cb 0%, #b7b0a4 55%, #8d867a 100%)",
  },
];

export const products: Product[] = [
  {
    id: "weave-silk-noir",
    name: "Silk Noir Weave",
    category: "weaves",
    price: 189,
    description:
      "A deep, luminous weave with soft movement and a refined finish. Placeholder listing — swap in your product photo when ready.",
    featured: true,
    newArrival: true,
  },
  {
    id: "weave-champagne",
    name: "Champagne Soft Wave",
    category: "weaves",
    price: 165,
    description:
      "Warm champagne tones with a gentle wave pattern. Upload your weave shot to replace this placeholder.",
    newArrival: true,
  },
  {
    id: "weave-jet-straight",
    name: "Jet Straight Length",
    category: "weaves",
    price: 149,
    description:
      "Sleek, straight length for a sharp editorial line. Photo slot ready for your upload.",
  },
  {
    id: "bag-city-couch",
    name: "City Couch Bag",
    category: "couch-bags",
    price: 128,
    description:
      "Compact structured bag for day-to-night carry. Replace this placeholder with your bag photography.",
    featured: true,
    newArrival: true,
    sizes: ["One Size"],
  },
  {
    id: "bag-soft-clutch",
    name: "Soft Fold Clutch",
    category: "couch-bags",
    price: 98,
    description:
      "Soft fold silhouette with clean hardware. Await your product image.",
    sizes: ["One Size"],
  },
  {
    id: "bag-evening-mini",
    name: "Evening Mini",
    category: "couch-bags",
    price: 112,
    description:
      "Petite evening bag with a quiet gold accent. Photo placeholder until upload.",
    sizes: ["One Size"],
  },
  {
    id: "cologne-vero-noir",
    name: "VÉRO Noir",
    category: "colognes",
    price: 86,
    description:
      "Dark woods and soft musk. A signature scent — drop in your bottle shot when ready.",
    featured: true,
    newArrival: true,
    sizes: ["50ml", "100ml"],
  },
  {
    id: "cologne-air-blanc",
    name: "Air Blanc",
    category: "colognes",
    price: 78,
    description:
      "Crisp citrus opening with a clean dry-down. Placeholder until your cologne photo arrives.",
    sizes: ["50ml", "100ml"],
  },
  {
    id: "cologne-ember",
    name: "Ember Vetiver",
    category: "colognes",
    price: 92,
    description:
      "Smoked vetiver and warm spice. Ready for your product imagery.",
    sizes: ["50ml", "100ml"],
  },
  {
    id: "tee-core-black",
    name: "Core Tee — Black",
    category: "tees",
    price: 38,
    description:
      "Heavyweight plain tee in black. Clean neckline, easy drape. Upload your tee flat-lay or model shot.",
    featured: true,
    newArrival: true,
    sizes: ["XS", "S", "M", "L", "XL"],
  },
  {
    id: "tee-core-white",
    name: "Core Tee — White",
    category: "tees",
    price: 38,
    description:
      "Essential white tee with a refined fit. Placeholder until your photos land.",
    sizes: ["XS", "S", "M", "L", "XL"],
  },
  {
    id: "tee-core-stone",
    name: "Core Tee — Stone",
    category: "tees",
    price: 38,
    description:
      "Soft stone wash plain tee. Swap this placeholder for your product image anytime.",
    newArrival: true,
    sizes: ["XS", "S", "M", "L", "XL"],
  },
];

export function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

export function getCategory(id: CategoryId) {
  return CATEGORIES.find((c) => c.id === id);
}

export function getProduct(id: string) {
  return products.find((p) => p.id === id);
}

export function productsByCategory(id?: CategoryId | "all") {
  if (!id || id === "all") return products;
  return products.filter((p) => p.category === id);
}
