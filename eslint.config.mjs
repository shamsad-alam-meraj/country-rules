import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import { fileURLToPath } from "node:url";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: ["dist/**", "coverage/**", "node_modules/**"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.ts"],
    languageOptions: {
      parserOptions: {
        project: ["./tsconfig.json"],
        tsconfigRootDir: fileURLToPath(new URL(".", import.meta.url)),
      },
    },
  },
  eslintConfigPrettier,
];
