import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import babelParser from "@babel/eslint-parser"; // Add this import

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  {
    files: ["**/*.js", "**/*.jsx", "**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: babelParser, // Use the imported parser
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          presets: ["next/babel"],
        },
      },
    },
    ...compat.extends("next/core-web-vitals"),
  },
];