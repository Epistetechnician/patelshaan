# `patelshaan`

Personal portfolio site for Shaan Patel, built with React, TypeScript, and Vite.

The site combines a narrative portfolio, social links, writing modules, install instructions for the `spatel-cv` terminal resume project, and an evidence-bounded current-systems-work ledger.

## Current systems work

The `Current systems work` section presents Statebook, Composed ZK Benchmark OS, Orbital Mesh, Recoverable Ghost States, and ECDSA.fail research. It exposes the updated 72-page Statebook paper and Recoverable Ghost States PDFs from `public/publications/`, and places the Statebook architecture link directly beneath the whitepaper resource. The Statebook essay uses original source-term, completeness, finality, capital/legal, architecture, and phase-boundary figures from the paper. Its short evidence-boundary note for each project is intentional: local validation, architecture work, and research candidates must not be presented as external proof, benchmark results, production readiness, or leaderboard standing.

## Development

```sh
pnpm install
pnpm run dev
```

## Production build

```sh
pnpm run build
pnpm run preview
```

## Deploy

Pushes to `main` deploy the static `dist/` build to GitHub Pages through `.github/workflows/deploy-pages.yml`.

- Pages source: GitHub Actions
- Canonical domain: `shaan4d.xyz`
- `www.shaan4d.xyz` should redirect to the canonical apex after DNS is configured

The required DNS records are:

- apex `A` records: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, and `185.199.111.153`
- `www` `CNAME`: `Epistetechnician.github.io`

Verify the domain in the GitHub account Pages settings before switching DNS. Retain GitHub's verification TXT record, and enable `Enforce HTTPS` after GitHub provisions the certificate.

The app is client-only. GitHub Pages cannot run server processes or backend APIs.

Repository target:

- GitHub: `https://github.com/Epistetechnician/patelshaan`
- Terminal CV: `https://github.com/Epistetechnician/spatel-cv`
