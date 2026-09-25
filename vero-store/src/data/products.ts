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
  /* ——— Weaves ——— */
  {
    id: "weave-body-wave",
    name: "Body Wave",
    category: "weaves",
    version: "Wave",
    description:
      "Soft S-wave with natural bounce and shine. Lengths that move — your night signature.",
    featured: true,
    newArrival: true,
    sizes: ["14\"", "18\"", "22\"", "26\""],
    colors: [
      { id: "noir", name: "Noir", hex: "#1a1410" },
      { id: "champagne", name: "Champagne", hex: "#c4a574" },
      { id: "honey", name: "Honey", hex: "#b8864a" },
      { id: "mocha", name: "Mocha", hex: "#4a3428" },
    ],
  },
  {
    id: "weave-silk-straight",
    name: "Silk Straight",
    category: "weaves",
    version: "Straight",
    description:
      "Sleek, bone-straight finish with a liquid sheen. Clean editorial line from root to tip.",
    featured: true,
    newArrival: true,
    sizes: ["14\"", "18\"", "22\"", "26\""],
    colors: [
      { id: "jet", name: "Jet", hex: "#0d0d0d" },
      { id: "noir", name: "Noir", hex: "#1a1410" },
      { id: "auburn", name: "Auburn", hex: "#6b3a2a" },
      { id: "champagne", name: "Champagne", hex: "#c4a574" },
    ],
  },
  {
    id: "weave-deep-wave",
    name: "Deep Wave",
    category: "weaves",
    version: "Deep Wave",
    description:
      "Defined deep waves with soft volume. Full, romantic texture for evening wear.",
    newArrival: true,
    sizes: ["14\"", "18\"", "22\"", "26\""],
    colors: [
      { id: "noir", name: "Noir", hex: "#1a1410" },
      { id: "mocha", name: "Mocha", hex: "#4a3428" },
      { id: "honey", name: "Honey", hex: "#b8864a" },
      { id: "jet", name: "Jet", hex: "#0d0d0d" },
    ],
  },
  {
    id: "weave-soft-curl",
    name: "Soft Curl",
    category: "weaves",
    version: "Curl",
    description:
      "Loose curl pattern with airy movement. Easy glam, low fuss.",
    sizes: ["14\"", "18\"", "22\""],
    colors: [
      { id: "champagne", name: "Champagne", hex: "#c4a574" },
      { id: "honey", name: "Honey", hex: "#b8864a" },
      { id: "auburn", name: "Auburn", hex: "#6b3a2a" },
      { id: "noir", name: "Noir", hex: "#1a1410" },
    ],
  },
  {
    id: "weave-kinky-blowout",
    name: "Kinky Blowout",
    category: "weaves",
    version: "Texture",
    description:
      "Natural-looking blowout texture with soft density. Seamless blend energy.",
    sizes: ["14\"", "18\"", "22\""],
    colors: [
      { id: "noir", name: "Noir", hex: "#1a1410" },
      { id: "mocha", name: "Mocha", hex: "#4a3428" },
      { id: "jet", name: "Jet", hex: "#0d0d0d" },
    ],
  },

  /* ——— Couch bags ——— */
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

  /* ——— Colognes ——— */
  {
    id: "cologne-vero-noir",
    name: "VÉRO Noir",
    category: "colognes",
    version: "Signature",
    description:
      "Dark woods and soft musk. A quiet trail that stays close — your signature scent.",
    featured: true,
    newArrival: true,
    sizes: ["30ml", "50ml", "100ml"],
    colors: [
      { id: "noir", name: "Noir bottle", hex: "#111111" },
      { id: "clear", name: "Clear bottle", hex: "#d8d4cc" },
    ],
  },
  {
    id: "cologne-air-blanc",
    name: "Air Blanc",
    category: "colognes",
    version: "Fresh",
    description:
      "Crisp citrus opening with a clean linen dry-down. Light, bright, everyday.",
    newArrival: true,
    sizes: ["30ml", "50ml", "100ml"],
    colors: [
      { id: "clear", name: "Clear bottle", hex: "#e8e4dc" },
      { id: "frost", name: "Frosted", hex: "#cfc9be" },
    ],
  },
  {
    id: "cologne-ember",
    name: "Ember Vetiver",
    category: "colognes",
    version: "Warm",
    description:
      "Smoked vetiver, warm spice, and soft amber. Evening heat in a bottle.",
    featured: true,
    sizes: ["50ml", "100ml"],
    colors: [
      { id: "amber", name: "Amber bottle", hex: "#6b4226" },
      { id: "noir", name: "Noir bottle", hex: "#1a1a1a" },
    ],
  },
  {
    id: "cologne-salt-cedar",
    name: "Salt & Cedar",
    category: "colognes",
    version: "Coastal",
    description:
      "Sea salt, cedarwood, and pale musk. Clean air after rain.",
    newArrival: true,
    sizes: ["50ml", "100ml"],
    colors: [
      { id: "sea", name: "Sea glass", hex: "#7a8b84" },
      { id: "clear", name: "Clear bottle", hex: "#d8d4cc" },
    ],
  },
  {
    id: "cologne-oro",
    name: "Oro",
    category: "colognes",
    version: "Golden",
    description:
      "Saffron, soft leather, and warm gold florals. Luxe without the shout.",
    sizes: ["50ml", "100ml"],
    colors: [
      { id: "gold", name: "Gold bottle", hex: "#b8955a" },
      { id: "noir", name: "Noir bottle", hex: "#111111" },
    ],
  },

  /* ——— Tees ——— */
  {
    id: "tee-core",
    name: "Core Tee",
    category: "tees",
    version: "Classic",
    description:
      "Heavyweight plain tee. Clean neckline, easy drape — the everyday essential.",
    featured: true,
    newArrival: true,
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      { id: "black", name: "Black", hex: "#111111" },
      { id: "white", name: "White", hex: "#f5f3ee" },
      { id: "stone", name: "Stone", hex: "#b5aea3" },
      { id: "ink", name: "Ink", hex: "#2c3340" },
      { id: "sand", name: "Sand", hex: "#d6c8b0" },
    ],
  },
  {
    id: "tee-oversized",
    name: "Oversized Tee",
    category: "tees",
    version: "Oversized",
    description:
      "Relaxed drop shoulder and longer hem. Soft cotton with an easy street cut.",
    newArrival: true,
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { id: "black", name: "Black", hex: "#111111" },
      { id: "white", name: "White", hex: "#f5f3ee" },
      { id: "stone", name: "Stone", hex: "#b5aea3" },
      { id: "olive", name: "Olive", hex: "#5c6048" },
    ],
  },
  {
    id: "tee-slim",
    name: "Slim Tee",
    category: "tees",
    version: "Slim",
    description:
      "Closer fit through the body. Minimal seams, sharp silhouette.",
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: [
      { id: "black", name: "Black", hex: "#111111" },
      { id: "white", name: "White", hex: "#f5f3ee" },
      { id: "ink", name: "Ink", hex: "#2c3340" },
      { id: "espresso", name: "Espresso", hex: "#3b2a22" },
    ],
  },
  {
    id: "tee-longsleeve",
    name: "Long Sleeve Tee",
    category: "tees",
    version: "Long Sleeve",
    description:
      "Same plain essential, extended. Soft cuff, clean crew neck.",
    newArrival: true,
    sizes: ["S", "M", "L", "XL"],
    colors: [
      { id: "black", name: "Black", hex: "#111111" },
      { id: "white", name: "White", hex: "#f5f3ee" },
      { id: "stone", name: "Stone", hex: "#b5aea3" },
      { id: "sand", name: "Sand", hex: "#d6c8b0" },
    ],
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

export function relatedVersions(product: Product) {
  return products.filter(
    (p) => p.category === product.category && p.id !== product.id && p.version,
  );
}
