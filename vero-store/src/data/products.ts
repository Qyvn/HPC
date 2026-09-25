export type CategoryId = "weaves" | "couch-bags" | "colognes" | "tees";

export type ProductColor = {
  id: string;
  name: string;
  /** Swatch hex for the colour picker */
  hex: string;
  image?: string;
};

export type Product = {
  id: string;
  name: string;
  category: CategoryId;
  /** Omit until pricing is ready */
  price?: number;
  description: string;
  sizes?: string[];
  /** Colourways — image optional per colour */
  colors?: ProductColor[];
  /** Style version label shown in UI, e.g. Classic / Quilted */
  version?: string;
  /** Fallback image when no colour image is set */
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
    blurb: "Signature carry — versions and colourways to choose from.",
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
    id: "bag-tabby-shoulder",
    name: "Tabby Shoulder",
    category: "couch-bags",
    version: "Classic",
    description:
      "Structured flap shoulder bag in pebbled leather with signature gold hardware. Soft strap, clean silhouette — your everyday signature carry.",
    featured: true,
    newArrival: true,
    colors: [
      {
        id: "taupe",
        name: "Taupe",
        hex: "#8a7768",
        image: "/products/bags/tabby-taupe.jpg",
      },
      { id: "black", name: "Black", hex: "#1a1a1a" },
      { id: "chalk", name: "Chalk", hex: "#e8e2d8" },
      { id: "stone", name: "Stone", hex: "#b5aea3" },
      { id: "espresso", name: "Espresso", hex: "#3b2a22" },
    ],
  },
  {
    id: "bag-quilted-chain",
    name: "Quilted Chain",
    category: "couch-bags",
    version: "Quilted",
    description:
      "Puffy quilted leather with chain-and-leather strap and brushed gold C clasp. Wear short on the shoulder or long as a crossbody.",
    featured: true,
    newArrival: true,
    colors: [
      {
        id: "black",
        name: "Black",
        hex: "#111111",
        image: "/products/bags/quilted-black.jpg",
      },
      { id: "ivory", name: "Ivory", hex: "#f2ebe3" },
      { id: "taupe", name: "Taupe", hex: "#8a7768" },
      { id: "olive", name: "Olive", hex: "#5c6048" },
      { id: "wine", name: "Wine", hex: "#5a2a32" },
    ],
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

export function getProductImage(
  product: Product,
  colorId?: string,
): string | undefined {
  if (colorId && product.colors?.length) {
    const match = product.colors.find((c) => c.id === colorId);
    if (match?.image) return match.image;
  }
  const firstWithImage = product.colors?.find((c) => c.image);
  return firstWithImage?.image ?? product.image;
}

export function getProductColor(product: Product, colorId?: string) {
  if (!product.colors?.length) return undefined;
  return (
    product.colors.find((c) => c.id === colorId) ?? product.colors[0]
  );
}
