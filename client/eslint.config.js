import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import importPlugin from "eslint-plugin-import";

export default [
  {
    ignores: ["dist", "node_modules"],
  },

  {
    files: ["**/*.{js,jsx}"],

    extends: [
      js.configs.recommended,
      "plugin:react/recommended",
      "plugin:import/recommended",
    ],

    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },

    settings: {
      react: { version: "detect" },

      "import/resolver": {
        alias: {
          map: [
            ["@", "./src"],
            ["@components", "./src/components"],
            ["@hooks", "./src/hooks"],
            ["@pages", "./src/pages"],
            ["@utils", "./src/utils"],
            ["@services", "./src/services"],
            ["@contexts", "./src/contexts"],
          ],
          extensions: [".js", ".jsx"],
        },
      },
    },

    plugins: {
      react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      import: importPlugin,
    },

    rules: {
      ...reactHooks.configs.recommended.rules,

      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],

      "react/prop-types": "off",
      "react/react-in-jsx-scope": "off",

      "import/order": [
        "warn",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
          ],
          "newlines-between": "always",
        },
      ],

      "no-unused-vars": "warn",
      "no-console": "off",
    },
  },
];
