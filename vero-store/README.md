# VÉRO (source)

Editorial storefront served at **`/vero/`** on the HPC Netlify site.

The production build is committed to `/vero` (static). Rebuild after source changes:

```bash
cd vero-store
npm install
npm run build
rm -rf ../vero && cp -a dist ../vero && cp ../vero/index.html ../vero/404.html
```

Local preview of the app alone:

```bash
npm run dev
```

Note: `vite.config.ts` uses `base: "/vero/"` for production path compatibility.
