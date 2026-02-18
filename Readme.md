https://tripdragon.github.io/Phonefoof47863a/
# Phonefoof App

This project now uses Vite for local development and production builds.

## Run locally with Vite

```bash
npm install
npm run dev
```

Then open the URL shown in your terminal (typically <http://localhost:5173>).  
The demo pages are available at:
- <http://localhost:5173/example-2.html>
- <http://localhost:5173/threejs-demo.html>
- <http://localhost:5173/threejs-dice-ball-demo.html>

## Build

```bash
npm run build
```

The production output is generated in the `dist/` directory.

The build now runs a prebuild step that automatically increments the patch version in `package.json` before every build, ensuring deploy builds always advance the app version.

## Run with Docker Compose

```bash
docker compose up --build
```

Then open: <http://localhost:8080>

## Run with Docker only

```bash
docker build -t phonefoof-app .
docker run --rm -p 8080:80 phonefoof-app
```

## Deploy with GitHub Pages

This repository includes a GitHub Actions workflow at `.github/workflows/deploy-pages.yml` that builds with Vite and deploys the `dist/` output to GitHub Pages whenever changes are pushed to `main`.

### One-time repository setup

1. In GitHub, go to **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.
3. Ensure your default branch is `main` (or update the workflow trigger branch).

After setup, each push to `main` publishes the current repository content as the Pages site.
