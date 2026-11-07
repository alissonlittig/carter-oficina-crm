import { defineConfig } from "vitest/config";
import solid from "vite-plugin-solid";

export default defineConfig({
  base: "./",
  plugins: [solid()],
  build: { target: "es2022", sourcemap: false },
  test: { environment: "node", include: ["src/**/*.test.ts"] },
});
