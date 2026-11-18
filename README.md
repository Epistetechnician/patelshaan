# `patelshaan` (`shaan4d.xyz`)

Personal portfolio and research monograph for Shaan Patel, built with React, TypeScript, and Vite.

## Architecture & content surfaces

1. **Breakthroughs & Approaching Frontiers (`#frontiers`, `src/frontiers.ts`, `src/FrontiersSection.tsx`)**:
   Interactive six-pillar matrix juxtaposing verified breakthroughs (positive mechanisms, formal kernels, and falsification/equivalence controls) against the exact next gates across:
   - Security, Certified Authority & Post-Quantum Readiness (`formasec`, `security-alignment-os`, `ECDSA.fail`, `devkit`)
   - Scalability, Holdout Pricing & Self-Improving Loops (`holdout-ledger`, `playbox` F3, `caduceus`, `hsi-lab`, `cl7b`)
   - Computer Science & ML Research (`mech-interp-unified` R6 & F2, `jspace-pilot`, `temporal-grid-safety`, `theseus-lab`, `aligned-holistic-continual-learning`)
   - Decentralization, Multi-Owner Rooms & Verifiable Markets (`playbox`, `HyperIntel`, `composed-zk-benchmark-os`, `Halo Labs`)
   - Socio-Economic Architecture (`Statebook` 72-page whitepaper, Cash-Flow Unsecured Credit, Sacred Economics, DAO Capital Flows, Climate MRV)
   - Socio-Cultural Inquiry & Computational Humanities (`kailas-corpus` 15-language passage test + 195-episode pilgrimage `kime` coding + blinded Tibetan/Sanskrit scholar handoff)
2. **Research Monograph (`#/research` and `#/research/<slug>`, lazy-loaded via `src/ResearchPage.tsx`)**:
   Twelve full repository studies plus the Mount Kailas field study, with copyable reproduction commands, SVG architecture diagrams (`src/arch.ts`), interactive browser simulations (`src/Demos.tsx`), real captured test replays (`src/Replay.tsx`), and a 7-thread humanistic commonplace book (`src/humanities.ts`, `src/lineage.ts`).
3. **Systems & Publications (`#systems`)**:
   Flagship essays (`approaching-breakthroughs-across-systems`, `evidence-bounded-intelligence`), `ECDSA.fail` (`arXiv:2609.09582` v2) interactive Pareto chart, `Statebook` 72-page whitepaper and architecture SVGs, `Recoverable Ghost States`, and evidence-bounded project ledger.
4. **Writings (`#writings`) & Terminal Companion (`#install`, `#model`)**:
   17 essays across AI assurance and socio-economic design, plus install and local-model Q&A flows for `spatel` (`Epistetechnician/spatel-cv`).

## Development & verification

```sh
pnpm install
pnpm run dev
pnpm run verify:full   # eslint + tsc -b + vite build
```

## Deploy

Pushes to `main` deploy the static `dist/` build to GitHub Pages (`https://shaan4d.xyz`) through `.github/workflows/deploy-pages.yml`.
