import * as esbuild from "esbuild";

const ctx = await esbuild.context({
  entryPoints: ["src/main.jsx"],
  bundle: true,
  format: "esm",
  outfile: "public/bundle.js",
  sourcemap: true,
  jsx: "automatic",
}).catch(() => process.exit(1));

let { hosts, port } = await ctx.serve({
  servedir: 'public',
})

console.log({ hosts, port })
