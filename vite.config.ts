import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

export default defineConfig({
  envDir: "..",
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "prompt",
      // The app registers the worker in main.tsx so it can explicitly bypass
      // HTTP caches during update checks.
      injectRegister: false,
      manifest: {
        name: "openXYOS · 开源人机组织操作系统",
        short_name: "openXYOS",
        description: "面向人机共融共治组织的开源操作系统",
        theme_color: "#10B981",
        background_color: "#050a08",
        display: "standalone",
        icons: [
          { src: "/logo.png", sizes: "192x192", type: "image/png" },
          { src: "/logo.png", sizes: "512x512", type: "image/png" },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        // Existing public clients predate the in-app update prompt. Activate
        // this bridge worker so they can leave the legacy navigation cache;
        // PwaUpdatePrompt deliberately never reloads an active page by itself.
        skipWaiting: true,
        clientsClaim: true,
        // Nginx is the authoritative SPA fallback. Keeping an old index.html
        // in Workbox navigation fallback made clients appear one release behind.
        navigateFallback: null,
      },
    }),
  ],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./frontend/src") },
  },
  server: {
    host: "0.0.0.0",
    port: 5174,
    proxy: {
      "/api": "http://localhost:3000",
      "/ws": {
        target: "http://localhost:3000",
        ws: true,
      },
    },
  },
  root: "frontend",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    target: ["es2015", "chrome63", "safari12", "edge18"],
    cssTarget: ["chrome63", "safari12"],
    rollupOptions: {
      output: {
        manualChunks: {
          "router-vendor": ["react-router-dom"],
          "html2canvas": ["html2canvas"],
        },
      },
    },
  },
});
