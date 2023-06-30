module.exports = {
  env: {
    node: true,
    browser: true,
    es2021: true,
  },

  extends: [
    "eslint:recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "plugin:vue/base",
    "plugin:vue/vue3-recommended",
    "plugin:@typescript-eslint/recommended",
    "prettier", // https://prettier.io/docs/en/integrating-with-linters.html
  ],

  plugins: ["@typescript-eslint", "import"],

  rules: {
    "no-console":
      process.env.NODE_ENV === "production"
        ? ["warn", { allow: ["warn", "error", "debug"] }]
        : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
    "vue/no-v-html": "off",
    "vue/require-default-prop": "off",
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": "error",
    semi: ["warn", "never"],
    "sort-imports": [
      "error",
      {
        ignoreCase: false,
        ignoreDeclarationSort: true, // don"t want to sort import lines, use eslint-plugin-import instead
        ignoreMemberSort: false,
        memberSyntaxSortOrder: ["none", "all", "multiple", "single"],
        allowSeparatedGroups: true,
      },
    ],
  },

  root: true,

  // https://www.npmjs.com/package/vue-eslint-parser
  parser: "vue-eslint-parser",
  parserOptions: {
    parser: "@typescript-eslint/parser",
    // project: "tsconfig.json",
    sourceType: "module",
    ecmaVersion: 2020,
    ecmaFeatures: {
      globalReturn: false,
      impliedStrict: false,
      jsx: false,
    },
  },

  settings: {
    "import/resolver": {
      //# You will also need to install and configure the TypeScript resolver
      //# See also https://github.com/import-js/eslint-import-resolver-typescript#configuration
      typescript: true,
      node: true,
    },
  },
}
