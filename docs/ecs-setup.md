# ECS Deployment Setup Guide (GitHub Actions + ECR + ECS Fargate)

This guide explains **everything to configure in AWS and GitHub** so this repo can deploy to ECS from GitHub Actions.

---

## Architecture used by this repo

1. GitHub Actions builds a Docker image from this repo.
2. The workflow pushes the image to Amazon ECR.
3. The workflow renders `ecs-task-definition.json` with that image tag.
4. The workflow updates your ECS service in an ECS cluster (Fargate launch type).

---

## 1) Create the ECR repository

Create an ECR repository matching your workflow variable (`ECR_REPOSITORY`), e.g. `phonefoof-app`.

Example CLI:

```bash
aws ecr create-repository --repository-name phonefoof-app --region us-east-1
```

---

## 2) Prepare ECS runtime IAM role (task execution role)

Your task definition references `executionRoleArn`. This role is used by ECS tasks to pull images and send logs.

### Trust policy for `ecs-tasks.amazonaws.com`

Create role `ecsTaskExecutionRole` with trust:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": { "Service": "ecs-tasks.amazonaws.com" },
      "Action": "sts:AssumeRole"
    }
  ]
}
```

### Attach policy

Attach managed policy:

- `arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy`

This grants ECR pull + CloudWatch Logs write permissions commonly required by ECS tasks.

---

## 3) Create networking prerequisites for Fargate

- A VPC
- At least 2 subnets (recommended across AZs)
- Security group for service tasks (allow inbound to container port from your load balancer or allowed sources)
- Internet access path for tasks:
  - Public subnets with public IPs, **or**
  - Private subnets + NAT

---

## 4) Create ECS cluster, task definition, and service

1. Create ECS cluster (Fargate-capable).
2. Update `ecs-task-definition.json` values:
   - `executionRoleArn`
   - log options (`awslogs-group`, region)
3. Create CloudWatch Log Group (if not auto-created), e.g. `/ecs/phonefoof-app`.
4. Register task definition.
5. Create ECS service using that task definition and networking config.

The GitHub workflow later updates this service by registering a new revision automatically.

---

## 5) Configure IAM for GitHub Actions deployment (recommended: OIDC)

Use OpenID Connect so you **do not store long-lived AWS keys** in GitHub.

### 5.1 Create IAM OIDC provider for GitHub

Provider URL: `https://token.actions.githubusercontent.com`

Audience: `sts.amazonaws.com`

---

### 5.2 Create deploy role assumed by GitHub Actions

Create role (example: `GitHubActionsEcsDeployRole`) with trust policy scoped to your repo/branch.

Replace:

- `YOUR_GITHUB_ORG`
- `YOUR_REPO`
- optionally adjust branch restriction

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::<ACCOUNT_ID>:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:YOUR_GITHUB_ORG/YOUR_REPO:ref:refs/heads/main"
        }
      }
    }
  ]
}
```

> You can broaden to tags/environments if needed, but least privilege is recommended.

---

### 5.3 Attach permissions policy to deploy role

Minimum permissions needed by this workflow:

- ECR push/pull for your repo
- ECS service update + task definition registration
- `iam:PassRole` for task execution role

Example starter policy (scope to your account/resources where possible):

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "EcrAuth",
      "Effect": "Allow",
      "Action": ["ecr:GetAuthorizationToken"],
      "Resource": "*"
    },
    {
      "Sid": "EcrPushPull",
      "Effect": "Allow",
      "Action": [
        "ecr:BatchCheckLayerAvailability",
        "ecr:BatchGetImage",
        "ecr:CompleteLayerUpload",
        "ecr:GetDownloadUrlForLayer",
        "ecr:InitiateLayerUpload",
        "ecr:PutImage",
        "ecr:UploadLayerPart"
      ],
      "Resource": "arn:aws:ecr:us-east-1:<ACCOUNT_ID>:repository/phonefoof-app"
    },
    {
      "Sid": "EcsDeploy",
      "Effect": "Allow",
      "Action": [
        "ecs:DescribeServices",
        "ecs:DescribeTaskDefinition",
        "ecs:RegisterTaskDefinition",
        "ecs:UpdateService"
      ],
      "Resource": "*"
    },
    {
      "Sid": "PassExecutionRole",
      "Effect": "Allow",
      "Action": ["iam:PassRole"],
      "Resource": "arn:aws:iam::<ACCOUNT_ID>:role/ecsTaskExecutionRole"
    }
  ]
}
```

If you use a **task role** in your task definition, include that role in `iam:PassRole` too.

---

## 6) Configure GitHub repository settings

### GitHub Secret

- `AWS_ROLE_TO_ASSUME` = full ARN of `GitHubActionsEcsDeployRole`

### GitHub Variables (Repository variables)

- `AWS_REGION` (example: `us-east-1`)
- `ECR_REPOSITORY` (example: `phonefoof-app`)
- `ECS_CLUSTER` (example: `phonefoof-cluster`)
- `ECS_SERVICE` (example: `phonefoof-service`)

---

## 7) Verify the task definition file in this repo

Update `ecs-task-definition.json`:

- `family`
- `executionRoleArn`
- `containerDefinitions[0].name` (must match workflow `CONTAINER_NAME`)
- container port mappings
- logs configuration

---

## 8) Deploy

- Push to `main`, or
- Run **Actions → Deploy to Amazon ECS → Run workflow** manually.

Watch the workflow logs for:

1. OIDC assume role success
2. ECR push success
3. ECS task definition registration
4. ECS service stabilization

---

## Troubleshooting

- **AccessDenied on AssumeRoleWithWebIdentity**:
  - Check OIDC provider exists.
  - Check trust policy `sub` exactly matches `repo:<org>/<repo>:ref:refs/heads/main`.
- **iam:PassRole denied**:
  - Add execution role (and task role, if used) to deploy role policy.
- **ECS service does not stabilize**:
  - Check service events, target group health checks, security groups, subnet routing.
- **Cannot pull image**:
  - Confirm task execution role policy and ECR repository/region match.

