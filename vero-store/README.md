# VÉRO Store

Editorial e-commerce storefront for **VÉRO** — weaves, couch bags, colognes, and plain t-shirts.

## Develop

```bash
cd vero-store
npm install
npm run dev
```

## Build

```bash
cd vero-store
npm run build
npm run preview
```

## Product photos

1. Add images under `public/products/` (e.g. `silk-noir.jpg`).
2. Set the matching product's `image` field in `src/data/products.ts`:

```ts
image: "/products/silk-noir.jpg",
```

Until photos are uploaded, the shop shows branded gradient placeholders.
