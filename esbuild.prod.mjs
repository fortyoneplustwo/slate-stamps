import * as esbuild from "esbuild";

await esbuild.build({
  entryPoints: ["src/index.js"],
  bundle: true,
  format: "esm",
  outfile: "dist/index.js",
  external: ["react", "slate", "@emotion/css"], // Keep peer dependencies external
  sourcemap: true,
}).catch(() => process.exit(1));
