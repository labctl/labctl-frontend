module.exports = {
  env: {
    node: true,
    browser: true,
    es2021: true,
  },

  extends: [
    // add more generic rulesets here, such as:
    "eslint:recommended",
    "plugin:vue/vue3-recommended",
    // 'plugin:vue/recommended' // Use this if you are using Vue.js 2.x.
    // "plugin:vue/vue3-essential",
    //"plugin:@typescript-eslint/eslint-recommended",
    //"plugin:@typescript-eslint/recommended",
    "prettier",
    "plugin:prettier/recommended", // Enables eslint-plugin-prettier and eslint-config-prettier. This will display prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
  ],

  plugins: ["@typescript-eslint", "prettier"],

  rules: {
    "no-console":
      process.env.NODE_ENV === "production"
        ? ["warn", { allow: ["warn", "error", "debug"] }]
        : "off",
    "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
    "prettier/prettier": ["error"],
    "vue/no-v-html": "off",
    "vue/require-default-prop": "off",
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": "error",
    semi: ["warn", "never"],
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
}
