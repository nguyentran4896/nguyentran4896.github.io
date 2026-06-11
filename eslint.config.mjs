import coreWebVitals from "eslint-config-next/core-web-vitals"

const config = [
  ...coreWebVitals,
  {
    ignores: [
      ".next/**",
      "out/**",
      "node_modules/**",
      "public/**",
      "components/footprint-map-data.ts",
    ],
  },
  {
    rules: {
      // React-compiler advisory rules: the codebase intentionally uses
      // one-shot mount effects (media-query / capability detection) that
      // these flag. Keep them visible as warnings, not build-blocking.
      "react-hooks/set-state-in-effect": "warn",
      "react-hooks/refs": "warn",
      "react-hooks/purity": "warn",
    },
  },
]

export default config
