{ pkgs ? import <nixpkgs> {} }:

pkgs.mkShell {
  name = "slate-stamps-dev";

  buildInputs = with pkgs; [
    nodejs_22
    pnpm
    git
  ];

  shellHook = ''
    export PATH="$PWD/node_modules/.bin:$PATH"
    echo "slate-stamps dev shell"
    echo "node: $(node --version)"
    echo "pnpm: $(pnpm --version)"
    echo
    echo "First time setup:"
    echo "  1. pnpm install && pnpm build   (from repo root)"
    echo "  2. cd example && pnpm install && pnpm run dev"
  '';
}

