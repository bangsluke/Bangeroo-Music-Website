import { defineConfig } from "vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: "src",
  publicDir: "../public",
  server: {
    host: "127.0.0.1",
    port: 5173,
  },
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: path.resolve(__dirname, "src/index.html")
      }
    }
  },
  test: {
    environment: "jsdom",
    include: ["../tests/**/*.test.js"]
  }
});
