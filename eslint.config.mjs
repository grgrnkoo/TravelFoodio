import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  {
    files: ["**/*.js", "**/*.jsx", "**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: require("@babel/eslint-parser"), // Or "@typescript-eslint/parser" if using TS
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          presets: ["next/babel"], // Matches Next.js Babel setup
        },
      },
    },
    ...compat.extends("next/core-web-vitals"),
  },
];