import { defineConfig } from "vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: "src",
  publicDir: "../public",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        index: path.resolve(__dirname, "src/index.html"),
        designB: path.resolve(__dirname, "src/design-b.html"),
        designC: path.resolve(__dirname, "src/design-c.html"),
        designD: path.resolve(__dirname, "src/design-d.html")
      }
    }
  },
  test: {
    environment: "jsdom",
    include: ["../tests/**/*.test.js"]
  }
});
