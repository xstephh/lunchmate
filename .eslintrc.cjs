module.exports = {
  root: true,
  extends: ["next/core-web-vitals"],
  parserOptions: { ecmaVersion: "latest", sourceType: "module" },
  rules: {
    "no-console": ["warn", { allow: ["warn", "error"] }]
  }
};