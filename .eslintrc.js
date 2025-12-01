module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true, // Add this to recognize process object
  },
  extends: [
    "eslint:recommended",
    "@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
  ],
  globals: {
    process: "readonly", // Add this as global variable
  },
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 12,
    sourceType: "module",
  },
  plugins: ["react", "@typescript-eslint"],
  rules: {
    // Your custom rules here
  },
  settings: {
    react: {
      version: "detect",
    },
  },
};
