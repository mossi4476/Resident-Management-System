# ArgoCD Setup Guide

Hướng dẫn thiết lập ArgoCD cho GitOps deployment trong Resident Management System.

## Tổng quan

ArgoCD là một công cụ GitOps cho Kubernetes, giúp tự động đồng bộ hóa ứng dụng từ Git repository đến Kubernetes cluster. Với ArgoCD, bạn có thể:

- Tự động deploy khi có thay đổi trong Git
- Quản lý nhiều môi trường (dev, staging, production)
- Rollback dễ dàng khi có lỗi
- Theo dõi trạng thái deployment trực quan

## Cấu trúc ArgoCD

```
k8s/
├── argocd-namespace.yaml          # Namespace cho ArgoCD
├── argocd-install.yaml           # Cài đặt ArgoCD server
├── argocd-app-backend.yaml       # Application cho backend
├── argocd-app-frontend.yaml      # Application cho frontend
├── argocd-app-monitoring.yaml    # Application cho monitoring
└── argocd-app-infrastructure.yaml # Application cho Redis/Kafka
```

## Bước 1: Cài đặt ArgoCD

### Trên Linux/macOS:
```bash
chmod +x scripts/deploy-argocd.sh
./scripts/deploy-argocd.sh
```

### Trên Windows:
```powershell
.\scripts\setup-argocd.ps1
```

### Hoặc cài đặt thủ công:
```bash
# Tạo namespace
kubectl apply -f k8s/argocd-namespace.yaml

# Cài đặt ArgoCD
kubectl apply -f k8s/argocd-install.yaml

# Chờ ArgoCD sẵn sàng
kubectl wait --for=condition=available --timeout=300s deployment/argocd-server -n argocd
```

## Bước 2: Truy cập ArgoCD UI

1. Lấy thông tin đăng nhập:
```bash
# Lấy password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d

# Hoặc sử dụng password mặc định: admin123
```

2. Truy cập ArgoCD UI:
   - Nếu có LoadBalancer: `https://<external-ip>`
   - Nếu không có LoadBalancer: `kubectl port-forward svc/argocd-server -n argocd 8080:443`
   - Sau đó truy cập: `https://localhost:8080`

3. Đăng nhập:
   - Username: `admin`
   - Password: `admin123` (hoặc password từ secret)

## Bước 3: Cấu hình Repository

Trước khi deploy applications, bạn cần cập nhật repository URL trong các file application manifests:

```bash
# Cập nhật URL repository trong tất cả các file argocd-app-*.yaml
sed -i 's|https://github.com/your-username/your-repo.git|https://github.com/YOUR_USERNAME/YOUR_REPO.git|g' k8s/argocd-app-*.yaml
```

## Bước 4: Deploy Applications

### Sử dụng script:
```bash
export REPO_URL=https://github.com/YOUR_USERNAME/YOUR_REPO.git
chmod +x scripts/deploy-argocd-apps.sh
./scripts/deploy-argocd-apps.sh
```

### Hoặc deploy thủ công:
```bash
# Deploy infrastructure (Redis, Kafka)
kubectl apply -f k8s/argocd-app-infrastructure.yaml

# Deploy backend
kubectl apply -f k8s/argocd-app-backend.yaml

# Deploy frontend
kubectl apply -f k8s/argocd-app-frontend.yaml

# Deploy monitoring (optional)
kubectl apply -f k8s/argocd-app-monitoring.yaml
```

## Bước 5: Theo dõi Deployment

1. Truy cập ArgoCD UI
2. Kiểm tra trạng thái các applications:
   - `infrastructure`: Redis và Kafka
   - `resident-backend`: Backend service
   - `resident-frontend`: Frontend service
   - `monitoring-stack`: Prometheus và Grafana

3. Các trạng thái có thể có:
   - 🟢 **Synced**: Đồng bộ thành công
   - 🟡 **OutOfSync**: Có thay đổi cần sync
   - 🔴 **Degraded**: Có lỗi
   - ⚪ **Unknown**: Không xác định được trạng thái

## GitOps Workflow

1. **Thay đổi code**: Commit và push code lên Git repository
2. **Build image**: CI/CD pipeline build Docker image mới
3. **Update manifests**: Cập nhật image tag trong Kubernetes manifests
4. **ArgoCD sync**: ArgoCD tự động phát hiện và deploy thay đổi
5. **Health check**: ArgoCD kiểm tra health của application

## Quản lý Applications

### Sync thủ công:
```bash
# Sync một application cụ thể
kubectl patch application resident-backend -n argocd --type merge --patch '{"spec":{"syncPolicy":{"automated":null}}}'

# Hoặc sync qua ArgoCD CLI
argocd app sync resident-backend
```

### Rollback:
```bash
# Rollback về version trước
argocd app rollback resident-backend
```

### Xóa application:
```bash
kubectl delete application resident-backend -n argocd
```

## Cấu hình Sync Policy

Các tùy chọn sync policy có sẵn:

```yaml
syncPolicy:
  automated:           # Tự động sync
    prune: true        # Xóa resources không còn trong Git
    selfHeal: true     # Tự động sửa lỗi drift
  syncOptions:
  - CreateNamespace=true  # Tự động tạo namespace
  retry:               # Retry khi sync thất bại
    limit: 5
    backoff:
      duration: 5s
      factor: 2
      maxDuration: 3m
```

## Troubleshooting

### ArgoCD không start:
```bash
kubectl logs -n argocd deployment/argocd-server
kubectl describe pod -n argocd -l app.kubernetes.io/name=argocd-server
```

### Application không sync:
```bash
kubectl describe application resident-backend -n argocd
kubectl logs -n argocd -l app.kubernetes.io/name=argocd-server
```

### Repository access issues:
- Kiểm tra URL repository
- Đảm bảo repository là public hoặc có credentials phù hợp
- Kiểm tra network connectivity từ cluster đến Git repository

## Best Practices

1. **Repository Structure**: Tổ chức manifests theo thư mục rõ ràng
2. **Environment Separation**: Sử dụng namespace khác nhau cho các môi trường
3. **Resource Naming**: Đặt tên resources theo convention
4. **Monitoring**: Thiết lập alerting cho ArgoCD
5. **Backup**: Backup ArgoCD configuration và applications

## Cleanup

Để gỡ bỏ ArgoCD:

```bash
# Xóa applications
kubectl delete application --all -n argocd

# Xóa ArgoCD
kubectl delete -f k8s/argocd-install.yaml

# Xóa namespace
kubectl delete -f k8s/argocd-namespace.yaml
```

## Tài liệu tham khảo

- [ArgoCD Documentation](https://argo-cd.readthedocs.io/)
- [ArgoCD Best Practices](https://argo-cd.readthedocs.io/en/stable/operator-manual/)
- [GitOps Principles](https://www.gitops.tech/)
