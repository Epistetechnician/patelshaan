# `patelshaan`

Personal portfolio site for Shaan Patel, built with React, TypeScript, and Vite.

The site combines a narrative portfolio, social links, writing modules, and install instructions for the `spatel-cv` terminal resume project.

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
- `nixpacks.toml` pins Railway builds to Node 22

Railway deploy note:

- keep the writing source files inside `src/content/writings`
- do not rely on parent-directory content imports for deploy-critical assets, because Railway may build the app from the `site` directory only

Repository target:

- GitHub: `https://github.com/Epistetechnician/patelshaan`
- Terminal CV: `https://github.com/Epistetechnician/spatel-cv`
