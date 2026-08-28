# Student Portal - Full Stack Serverless Application

A full-stack, serverless student management portal featuring an Angular frontend, AWS SAM (Python 3.12) microservices backend, Amazon Cognito authentication, DynamoDB single-table design, and CloudFront distribution.

---

## 1. Architecture Overview

- **Frontend:** Angular SPA hosted on Amazon S3 and distributed globally via Amazon CloudFront.
- **API Layer:** Amazon API Gateway (HTTP API v2) with built-in CORS and Cognito JWT Authorizer.
- **Compute:** AWS Lambda (Python 3.12) microservices sharing common utilities via a Lambda Layer (`CommonLayer`).
- **Identity & Access:** Amazon Cognito User Pools with user groups (`Admin`, `Student`).
- **Database:** Amazon DynamoDB using single-table design for users, courses, and enrollments.
- **CI/CD:** GitHub Actions pipeline deploying across multi-stage environments via AWS SAM and OIDC authentication.

---

## 2. Prerequisites

- **Node.js:** v18+ & Angular CLI (`npm install -g @angular/cli`)
- **Python:** 3.12
- **AWS CLI & SAM CLI:** Configured with active AWS credentials
- **Docker Desktop:** Required for local Lambda execution and builds

---

## 3. Local Development Setup

### A. Docker Setup & Compatibility

SAM CLI requires Docker to emulate Lambda locally.

1. Install and launch **Docker Desktop**.
2. Go to **Settings (Gear Icon) → Advanced**:
   - Check **Allow the default Docker socket to be used**.
   - Set CLI tools to **System** (`/usr/local/bin`).
3. Go to **Settings → Docker Engine** and add the minimum API version parameter, then click Apply & restart:

```json
{
  "min-api-version": "1.35"
}
```

### B. Configure Backend Environment

Create `backend/env.json` for local Lambda executions with the following structure:

```json
{
  "Parameters": {
    "ENV": "dev",
    "TABLE_NAME": "student-portal-backend-dev-DatabaseStack-TableName",
    "USER_POOL_ID": "us-east-1_xxxxxxxxx",
    "USER_POOL_CLIENT_ID": "xxxxxxxxxxxxxxxxxxxxxxxxxx"
  }
}
```

### C. Build and Run Local API Gateway

From the `backend/` directory:

```bash
# Clean cached builds
rm -rf .aws-sam

# Build application
sam build

# Run local API on port 3000
sam local start-api --env-vars env.json --port 3000
```

### D. Configure and Run Frontend

Update `frontend/src/environments/environment.development.ts` (or the appropriate environment file) to point the Angular app at the local API:

```typescript
export const environment = {
  production: false,
  apiUrl: "http://127.0.0.1:3000",
};
```

Start the Angular dev server:

```bash
cd frontend
npm install
ng serve --port 4200
```

Open http://localhost:4200 in your browser.

---

## 4. Manual Deployment Commands

Deploy directly from your machine using configured `samconfig.toml` targets. From the `backend/` directory:

```bash
# Build artifacts
sam build

# Deploy to Dev
sam deploy --config-env dev

# Deploy to Stage
sam deploy --config-env stage

# Deploy to Production
sam deploy --config-env prod
```

---

## 5. Branch Strategy & CI/CD Workflow

Deployment triggers are automated using GitHub Actions (`.github/workflows/deploy.yml`). Typical branch strategy:

| Branch  | Target Environment | Pipeline Actions                                                                                      |
| ------- | ------------------ | ----------------------------------------------------------------------------------------------------- |
| `dev`   | Development        | Builds SAM backend & Angular dev build; deploys to dev AWS stack & S3 bucket.                         |
| `stage` | Staging            | Automated integration tests; deploys to staging infrastructure.                                       |
| `main`  | Production         | Production optimized build; manual approval gate; zero-downtime deployment + CloudFront invalidation. |

---

## 6. Troubleshooting & Common Fixes

- **Docker socket not found / unreachable**

  Link the Docker socket and export `DOCKER_HOST`:

  ```bash
  sudo ln -s -f ~/.docker/run/docker.sock /var/run/docker.sock
  chmod 666 ~/.docker/run/docker.sock
  export DOCKER_HOST="unix:///Users/$USER/.docker/run/docker.sock"
  ```

- **Lambda Layer Import Errors (No module named 'core')**

  Verify directory structure: `backend/layers/common_layer/python/core/auth_helper.py`.
  Ensure `__init__.py` exists inside `core/`:

  ```bash
  touch backend/layers/common_layer/python/core/__init__.py
  ```

- **Purge SAM build cache before rebuilding**

  ```bash
  rm -rf .aws-sam && sam build
  ```

- **Git Rejecting Pushes (Large File / HTTP 400 Errors)**

  Ensure build artifacts are untracked and present in `.gitignore`:

  ```bash
  git rm -r --cached .aws-sam 2>/dev/null || true
  git rm -r --cached .angular 2>/dev/null || true
  git rm -r --cached **/node_modules 2>/dev/null || true
  git commit -m "chore: clean build cache"
  git push origin <branch-name>
  ```

- **Tail Live Lambda Logs**

  ```bash
  sam logs -n PublicAuthFunction --tail
  ```
