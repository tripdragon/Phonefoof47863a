# Phonefoof App

This project is dockerized and runs as a static web app served by NGINX.

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

This repository includes a GitHub Actions workflow at `.github/workflows/deploy-pages.yml` that deploys the static site to GitHub Pages whenever changes are pushed to `main`.

### One-time repository setup

1. In GitHub, go to **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.
3. Ensure your default branch is `main` (or update the workflow trigger branch).

After setup, each push to `main` publishes the current repository content as the Pages site.
