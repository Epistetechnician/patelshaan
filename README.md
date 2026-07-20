# `patelshaan`

Personal portfolio site for Shaan Patel, built with React, TypeScript, and Vite.

The site combines a narrative portfolio, social links, writing modules, install instructions for the `spatel-cv` terminal resume project, and an evidence-bounded current-systems-work ledger.

## Current systems work

The `Current systems work` section presents Statebook, Composed ZK Benchmark OS, Orbital Mesh, Recoverable Ghost States, and ECDSA.fail research. It exposes the updated 72-page Statebook paper and Recoverable Ghost States PDFs from `public/publications/`, adds a compact Statebook architecture preview, and links each project to its requested public surface. The Statebook essay uses original source-term, completeness, finality, capital/legal, architecture, and phase-boundary figures from the paper. Its short evidence-boundary note for each project is intentional: local validation, architecture work, and research candidates must not be presented as external proof, benchmark results, production readiness, or leaderboard standing.

## Development

```sh
npm install
npm run dev
```

## Production build

```sh
npm run build
npm run start
```

The production start command serves the built `dist/` output with `serve` on `0.0.0.0:$PORT`, which is a better fit for Railway than `vite preview`.

## Deploy

This project includes `railway.json` so Railway can:

- build with `npm run build`
- serve with `npm run start`

Node runtime note:

- the app requires Node `22.12+`
- `package.json` declares the engine version
- if Railway still picks the wrong version, set `NIXPACKS_NODE_VERSION=22` in the project variables

Railway deploy note:

- keep the writing source files inside `src/content/writings`
- do not rely on parent-directory content imports for deploy-critical assets, because Railway may build the app from the `site` directory only

Repository target:

- GitHub: `https://github.com/Epistetechnician/patelshaan`
- Terminal CV: `https://github.com/Epistetechnician/spatel-cv`
