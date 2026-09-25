import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const isGitHubPages = process.env.GITHUB_PAGES === "true";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: isGitHubPages ? "/HPC/" : "/",
});
