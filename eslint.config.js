// Migration https://eslint.org/docs/latest/use/configure/migration-guide#eslintrc-examples

import process from "process"
import eslint from "@eslint/js"
import typescriptEslint from "@typescript-eslint/eslint-plugin"
import tsParser from "@typescript-eslint/parser"
import eslintConfigPrettier from "eslint-config-prettier"
import unusedImports from "eslint-plugin-unused-imports"
import pluginVue from "eslint-plugin-vue"
import { defineConfig, globalIgnores } from "eslint/config"
import globals from "globals"
import tseslint from "typescript-eslint"
import vueParser from "vue-eslint-parser"

export default defineConfig(
  globalIgnores([
    "src/components/ui/**/*.ts",
    "src/components/ui/**/*.vue",
    "public/count.v5.js",
  ]),
  // https://typescript-eslint.io/getting-started/#step-2-configuration
  eslint.configs.recommended,
  ...tseslint.configs.recommended,

  //https://eslint.vuejs.org/user-guide/#configuration-eslint-config-js
  ...pluginVue.configs["flat/recommended"],

  // Global ignores
  {
    ignores: ["dist/", ".storybook/", "tailwind.config.js", "vite.config.js"],
  },

  // https://www.npmjs.com/package/vue-eslint-parser
  // https://typescript-eslint.io/troubleshooting/#i-am-running-into-errors-when-parsing-typescript-in-my-vue-files
  {
    files: ["src/**/*.vue", "src/**/*.ts", "src/**/*.js"],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsParser, // tseslint.parser,
        project: "tsconfig.json",
        sourceType: "module",
        extraFileExtensions: [".vue"],
        ecmaVersion: 2020,
        ecmaFeatures: {
          globalReturn: false,
          impliedStrict: false,
          jsx: false,
        },
      },
    },
  },

  {
    plugins: {
      "unused-imports": unusedImports,
    },
    rules: {
      "no-unused-vars": "off",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
        },
      ],
    },
  },

  // My rules
  {
    plugins: { typescriptEslint },
    rules: {
      semi: ["warn", "never"],
      "no-console": "off", // process.env.NODE_ENV === "production" ? "warn" : "off",
      "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",

      //"no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { varsIgnorePattern: "_*" },
      ],

      "vue/no-v-html": "off",
      "vue/require-default-prop": "off",
      "vue/multi-word-component-names": ["error"],
      "vue/attributes-order": [
        "error",
        {
          alphabetical: false,
        },
      ],
      // "sort-imports": [
      //   "error",
      //   {
      //     ignoreCase: false,
      //     ignoreDeclarationSort: false,
      //     ignoreMemberSort: false,
      //     memberSyntaxSortOrder: ["none", "all", "multiple", "single"],
      //     allowSeparatedGroups: false,
      //   },
      // ],
    },
  },

  {
    // exclude shadcn
    files: ["src/components/ui/**/*.ts", "src/components/ui/**/*.vue"],
    rules: {
      quotes: ["error", "single"],
      "vue/attributes-order": "off",
      "vue/multi-word-component-names": "off",
      "sort-imports": "off",
      "unused-imports/no-unused-vars": "off",
    },
  },

  {
    files: ["src/**/*.js", "src/**/*.ts", "src/**/*.vue"],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.browser,
        //myCustomGlobal: "readonly",
        VITE_TIMESTAMP: "readonly",
      },
    },
  },

  // Special config for shadcn
  {
    files: ["src/components/ui/**/*.ts", "src/components/ui/**/*.vue"],
    rules: {
      quotes: ["error", "single"],
      "vue/attributes-order": "off",
      "vue/component-definition-name-casing": "off",
    },
  },

  // https://github.com/prettier/eslint-config-prettier?tab=readme-ov-file#installation
  // Turns off all rules that are unnecessary or might conflict with Prettier.
  eslintConfigPrettier
)
