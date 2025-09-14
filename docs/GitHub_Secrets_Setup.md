# GitHub Secrets Setup Guide

Hướng dẫn thiết lập GitHub Secrets cho CI/CD pipeline của Resident Management System.

## Required Secrets

Để GitHub Actions workflows hoạt động, bạn cần cấu hình các secrets sau trong GitHub repository:

### AWS Credentials
```
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
```

### EKS Configuration
```
EKS_CLUSTER_NAME
```

### Database Configuration
```
DATABASE_URL
JWT_SECRET
```

### Frontend Configuration
```
NEXT_PUBLIC_API_URL
```

### Notification (Optional)
```
SLACK_WEBHOOK
```

## Cách thêm Secrets vào GitHub

### Bước 1: Truy cập Repository Settings
1. Vào GitHub repository của bạn
2. Click vào tab **Settings**
3. Trong menu bên trái, click vào **Secrets and variables**
4. Click vào **Actions**

### Bước 2: Thêm từng Secret
Click vào **New repository secret** và thêm các secrets sau:

#### AWS_ACCESS_KEY_ID
```
Description: AWS Access Key ID for ECR and EKS access
Value: AKIA...
```

#### AWS_SECRET_ACCESS_KEY
```
Description: AWS Secret Access Key for ECR and EKS access
Value: your-secret-access-key
```

#### EKS_CLUSTER_NAME
```
Description: Name of your EKS cluster
Value: your-cluster-name
```

#### DATABASE_URL
```
Description: PostgreSQL database connection string
Value: postgresql://username:password@host:port/database
```

#### JWT_SECRET
```
Description: Secret key for JWT token signing
Value: your-jwt-secret-key
```

#### NEXT_PUBLIC_API_URL
```
Description: Public API URL for frontend
Value: https://your-backend-url.com
```

#### SLACK_WEBHOOK (Optional)
```
Description: Slack webhook URL for notifications
Value: https://hooks.slack.com/services/...
```

## Environment-specific Secrets

Nếu bạn có nhiều môi trường (staging, production), có thể tạo secrets riêng cho từng môi trường:

### Staging Environment
```
DATABASE_URL_STAGING
JWT_SECRET_STAGING
NEXT_PUBLIC_API_URL_STAGING
```

### Production Environment
```
DATABASE_URL_PRODUCTION
JWT_SECRET_PRODUCTION
NEXT_PUBLIC_API_URL_PRODUCTION
```

## Security Best Practices

### 1. Sử dụng IAM Roles
Thay vì dùng Access Keys, nên sử dụng IAM roles với OIDC:

```yaml
- name: Configure AWS credentials
  uses: aws-actions/configure-aws-credentials@v4
  with:
    role-to-assume: arn:aws:iam::123456789012:role/GitHubActions
    aws-region: us-east-1
```

### 2. Rotate Secrets định kỳ
- Thay đổi JWT secrets định kỳ
- Rotate AWS access keys mỗi 90 ngày
- Update database passwords thường xuyên

### 3. Sử dụng External Secrets Operator
Để quản lý secrets tốt hơn, có thể sử dụng External Secrets Operator:

```yaml
apiVersion: external-secrets.io/v1beta1
kind: SecretStore
metadata:
  name: github-secrets
spec:
  provider:
    github:
      tokenSecretRef:
        name: github-token
        key: token
```

## Troubleshooting

### Secret không được nhận diện
- Kiểm tra tên secret có đúng chính tả
- Đảm bảo secret được thêm vào repository level
- Kiểm tra permissions của workflow

### AWS credentials không hoạt động
- Verify AWS credentials có đúng permissions
- Kiểm tra IAM policies cho ECR và EKS
- Đảm bảo region được cấu hình đúng

### Database connection failed
- Kiểm tra DATABASE_URL format
- Verify database server accessible từ GitHub Actions
- Kiểm tra firewall rules

## Example Workflow với Secrets

```yaml
name: Example with Secrets

on: [push]

jobs:
  example:
    runs-on: ubuntu-latest
    steps:
    - name: Use AWS credentials
      run: |
        echo "AWS Region: ${{ env.AWS_REGION }}"
        echo "Database URL: ${{ secrets.DATABASE_URL }}"
      
    - name: Configure AWS
      uses: aws-actions/configure-aws-credentials@v4
      with:
        aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
        aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
        aws-region: us-east-1
```

## Monitoring Secrets Usage

### GitHub Actions Audit Log
1. Vào repository Settings
2. Security → Audit log
3. Filter by "secrets"

### AWS CloudTrail
Monitor AWS API calls để track secret usage:
```bash
aws logs filter-log-events \
  --log-group-name CloudTrail \
  --filter-pattern "AssumeRole"
```

## Backup Secrets

### Export Secrets (Chỉ dành cho admin)
```bash
# Backup repository secrets (cần GitHub CLI)
gh secret list --repo owner/repo > secrets-backup.txt
```

### Document Secret Locations
Tạo file `SECRETS.md` để document nơi lưu trữ secrets:
```markdown
# Secrets Documentation

## AWS Credentials
- Location: AWS IAM
- Purpose: ECR push, EKS access
- Rotation: Every 90 days

## Database
- Location: AWS RDS
- Purpose: Application database
- Rotation: Every 6 months
```

## Emergency Procedures

### Nếu Secret bị compromise
1. **Immediately rotate** compromised secret
2. **Revoke** old secret
3. **Update** all environments
4. **Audit** access logs
5. **Notify** team members

### Recovery Process
1. Generate new secrets
2. Update GitHub repository secrets
3. Redeploy applications
4. Verify functionality
5. Update documentation
