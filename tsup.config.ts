import { defineConfig } from "tsup";

export default defineConfig({
  entry: [
    "src/index.ts",
    "src/address.ts",
    "src/postal-code.ts",
    "src/subdivisions.ts",
    "src/phone.ts",
    "src/currency.ts",
    "src/locale.ts",
    "src/coverage.ts",
    "src/cli.ts",
  ],
  format: ["esm", "cjs"],
  dts: true,
  splitting: true,
  sourcemap: true,
  clean: true,
  minify: false,
  target: "es2022",
  outDir: "dist",
  shims: true,
  treeshake: true,
});
