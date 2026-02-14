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

## Deploy to Amazon ECS with GitHub Actions

This repository includes:

- `ecs-task-definition.json` for an ECS Fargate task definition template.
- `.github/workflows/deploy-ecs.yml` to build/push the image to ECR and deploy to ECS.

### Required GitHub repository secrets

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

### Values to customize

Before running deployments, update these values to match your AWS environment:

- In `ecs-task-definition.json`:
  - `executionRoleArn`
  - initial `image` URI (workflow replaces this at deploy time)
  - awslogs values if needed
- In `.github/workflows/deploy-ecs.yml`:
  - `AWS_REGION`
  - `ECR_REPOSITORY`
  - `ECS_CLUSTER`
  - `ECS_SERVICE`
