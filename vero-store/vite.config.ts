import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Served under /vero/ on the HPC Netlify site without touching the root HPC pages.
export default defineConfig({
  plugins: [react()],
  base: "/vero/",
  preview: {
    allowedHosts: true,
  },
  server: {
    allowedHosts: true,
  },
});
