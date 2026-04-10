/** @type {import("lint-staged").Configuration} */
const config = {
  "*.{js,jsx,ts,tsx,mjs,cjs,json,md,css,yml,yaml}": "prettier --write",
  "*.{js,jsx,ts,tsx,mjs,cjs}": "eslint --fix",
};

export default config;
