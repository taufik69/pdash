import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

const sharedProxy = {
  "/api/qc": {
    target: "https://fraudchecker.link",
    changeOrigin: true,
    rewrite: () => "/api/v1/qc/",
  },
  "/api/v1": {
    target: "https://totalbazar.bd",
    changeOrigin: true,
  },
};

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './',
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: sharedProxy,
  },
  preview: {
    proxy: sharedProxy,
  },
});
