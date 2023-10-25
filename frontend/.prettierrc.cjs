/** @type {import("prettier").Config} */
const config = {
  trailingComma: "all",
  tabWidth: 2,
  singleQuote: false,
  bracketSameLine: false,
  semi: true,
  plugins: ["prettier-plugin-organize-imports", "prettier-plugin-tailwindcss"],
};

module.exports = config;

// {
//   "trailingComma": "all",
//   "tabWidth": 2,
//   "singleQuote": false,
//   "bracketSameLine": false,
//   "semi": true,
//   "plugins": ["prettier-plugin-organize-imports", "prettier-plugin-tailwindcss"]
// }
