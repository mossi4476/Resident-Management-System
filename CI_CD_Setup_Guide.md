# CI/CD Setup Guide với GitHub Actions

Hướng dẫn thiết lập CI/CD pipeline hoàn chỉnh cho Resident Management System sử dụng GitHub Actions và ArgoCD.

## Tổng quan CI/CD Pipeline

Pipeline của chúng ta bao gồm:

1. **CI (Continuous Integration)**: Test, build, và scan code
2. **CD (Continuous Deployment)**: Deploy tự động qua ArgoCD
3. **Security**: Scan vulnerabilities và dependencies
4. **Monitoring**: Health checks và notifications

## Cấu trúc Workflows

```
.github/workflows/
├── ci-cd.yml              # Main CI/CD pipeline
├── pr.yml                 # Pull request checks
├── security.yml           # Security scanning
├── e2e-tests.yml          # End-to-end tests
├── manual-deploy.yml      # Manual deployment
└── rollback.yml           # Rollback procedures
```

## Workflow Chi tiết

### 1. CI/CD Pipeline (`ci-cd.yml`)

**Triggers:**
- Push to `main` hoặc `develop` branch
- Pull requests to `main`

**Jobs:**
- `backend-ci`: Lint, test, build backend
- `frontend-ci`: Lint, build frontend
- `build-and-push`: Build và push Docker images to ECR
- `deploy`: Deploy lên Kubernetes
- `security-scan`: Scan Docker images
- `notify`: Gửi notifications

### 2. Pull Request Checks (`pr.yml`)

**Triggers:**
- Pull requests to `main` hoặc `develop`

**Jobs:**
- `code-quality`: Lint và test code
- `k8s-validation`: Validate Kubernetes manifests
- `security`: Security scans
- `docker-build-test`: Test Docker builds
- `pr-comment`: Comment kết quả lên PR

### 3. Security Scanning (`security.yml`)

**Triggers:**
- Schedule (daily at 2 AM)
- Push to `main`
- Pull requests

**Jobs:**
- `dependency-scan`: Scan npm dependencies
- `codeql-analysis`: CodeQL security analysis
- `container-scan`: Scan Docker images
- `k8s-security`: Scan Kubernetes manifests
- `security-report`: Generate security report

### 4. End-to-End Tests (`e2e-tests.yml`)

**Triggers:**
- Push to `main` hoặc `develop`
- Pull requests

**Jobs:**
- `setup-environment`: Build applications
- `start-services`: Start test services (Postgres, Redis, Kafka)
- `api-tests`: Test API endpoints
- `frontend-e2e`: Frontend tests với Playwright
- `performance-tests`: Load testing với k6

### 5. Manual Deployment (`manual-deploy.yml`)

**Triggers:**
- Manual workflow dispatch

**Inputs:**
- Environment (staging/production)
- Services to deploy
- Version to deploy

**Jobs:**
- `prepare`: Validate inputs và detect versions
- `deploy-infrastructure`: Deploy Redis, Kafka
- `deploy-backend`: Deploy backend service
- `deploy-frontend`: Deploy frontend service
- `health-check`: Verify deployment

### 6. Rollback (`rollback.yml`)

**Triggers:**
- Manual workflow dispatch

**Jobs:**
- `detect-version`: Detect previous version
- `rollback-backend`: Rollback backend
- `rollback-frontend`: Rollback frontend
- `verify-rollback`: Verify rollback success

## Setup Instructions

### Bước 1: Cấu hình GitHub Secrets

Thêm các secrets sau vào GitHub repository:

```bash
# AWS Credentials
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...

# EKS Configuration
EKS_CLUSTER_NAME=your-cluster-name

# Database
DATABASE_URL=postgresql://...
JWT_SECRET=your-jwt-secret

# Frontend
NEXT_PUBLIC_API_URL=https://your-api-url.com

# Notifications (Optional)
SLACK_WEBHOOK=https://hooks.slack.com/...
```

### Bước 2: Cấu hình AWS IAM

Tạo IAM user hoặc role với permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "ecr:*",
        "eks:DescribeCluster",
        "eks:ListClusters"
      ],
      "Resource": "*"
    }
  ]
}
```

### Bước 3: Cập nhật Repository URLs

Trong các file ArgoCD application manifests, cập nhật repository URL:

```bash
sed -i 's|https://github.com/your-username/your-repo.git|https://github.com/YOUR_USERNAME/YOUR_REPO.git|g' k8s/argocd-app-*.yaml
```

### Bước 4: Deploy ArgoCD

```bash
# Deploy ArgoCD
./scripts/deploy-argocd.sh

# Deploy ArgoCD applications
export REPO_URL=https://github.com/YOUR_USERNAME/YOUR_REPO.git
./scripts/deploy-argocd-apps.sh
```

## Workflow Execution

### Automatic Deployment

1. **Push to main**: Tự động build, test, và deploy
2. **Push to develop**: Deploy to staging environment
3. **Pull Request**: Chạy tests và validation

### Manual Deployment

1. Vào GitHub Actions tab
2. Chọn "Manual Deployment" workflow
3. Click "Run workflow"
4. Chọn environment và services
5. Click "Run workflow"

### Rollback

1. Vào GitHub Actions tab
2. Chọn "Rollback Deployment" workflow
3. Click "Run workflow"
4. Chọn environment và services
5. Click "Run workflow"

## Monitoring và Troubleshooting

### GitHub Actions Dashboard

Monitor workflow executions:
- **Actions** tab trong GitHub repository
- Click vào workflow run để xem logs
- Check failed jobs và error messages

### ArgoCD Dashboard

Monitor deployments:
- Access ArgoCD UI
- Check application sync status
- View deployment history

### Logs và Debugging

#### GitHub Actions Logs
```bash
# Download workflow logs
gh run download <run-id>
```

#### Kubernetes Logs
```bash
# Backend logs
kubectl logs -f deployment/backend -n mvp

# Frontend logs
kubectl logs -f deployment/frontend -n mvp
```

#### ArgoCD Logs
```bash
# ArgoCD server logs
kubectl logs -f deployment/argocd-server -n argocd

# ArgoCD application controller logs
kubectl logs -f deployment/argocd-application-controller -n argocd
```

## Best Practices

### 1. Branch Strategy
- `main`: Production releases
- `develop`: Development/staging
- Feature branches: Feature development

### 2. Testing Strategy
- Unit tests: Mỗi commit
- Integration tests: Pull requests
- E2E tests: Pre-deployment
- Security scans: Daily

### 3. Deployment Strategy
- Blue-Green: Zero downtime deployments
- Canary: Gradual rollout
- Rollback: Quick recovery

### 4. Security
- Secrets management: GitHub Secrets
- Image scanning: Trivy
- Code scanning: CodeQL
- Dependency scanning: npm audit

## Troubleshooting Common Issues

### Build Failures
```bash
# Check build logs
kubectl logs -f deployment/backend -n mvp

# Check Docker build
docker build -t test ./backend
```

### Deployment Issues
```bash
# Check ArgoCD sync status
argocd app get resident-backend

# Force sync
argocd app sync resident-backend --force

# Check Kubernetes resources
kubectl get all -n mvp
```

### Database Issues
```bash
# Check database connection
kubectl exec -it deployment/backend -n mvp -- npx prisma db push

# Run migrations
kubectl run migration --image=backend-image --command -- npx prisma migrate deploy
```

### Network Issues
```bash
# Check services
kubectl get svc -n mvp

# Check ingress
kubectl get ingress -n mvp

# Test connectivity
kubectl run test-pod --image=busybox --rm -it -- nslookup backend.mvp.svc.cluster.local
```

## Performance Optimization

### 1. Build Optimization
- Multi-stage Docker builds
- Layer caching
- Parallel builds

### 2. Test Optimization
- Parallel test execution
- Test result caching
- Selective testing

### 3. Deployment Optimization
- Resource limits
- Health checks
- Readiness probes

## Security Considerations

### 1. Secrets Management
- Rotate secrets regularly
- Use least privilege access
- Monitor secret usage

### 2. Image Security
- Scan images for vulnerabilities
- Use minimal base images
- Regular updates

### 3. Network Security
- Network policies
- Service mesh
- TLS encryption

## Scaling và Maintenance

### 1. Horizontal Scaling
- Auto-scaling configurations
- Load balancing
- Resource monitoring

### 2. Maintenance
- Regular updates
- Backup procedures
- Disaster recovery

### 3. Monitoring
- Application metrics
- Infrastructure metrics
- Alerting rules

## Tài liệu tham khảo

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [ArgoCD Documentation](https://argo-cd.readthedocs.io/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [AWS EKS Documentation](https://docs.aws.amazon.com/eks/)
