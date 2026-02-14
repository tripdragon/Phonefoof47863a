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
