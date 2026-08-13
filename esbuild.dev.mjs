import * as esbuild from "esbuild";

const ctx = await esbuild.context({
  entryPoints: ["src/index.js"],
  bundle: true,
  format: "esm",
  outdir: "dist",
  resolveExtensions: ['.jsx', '.js', '.css', '.json'],
  external: ["react", "slate", "@emotion/css"], // Keep peer dependencies external
  sourcemap: true,
}).catch(() => process.exit(1));

await ctx.watch()
console.log('watching...')
