# PowerShell script to deploy ArgoCD
Write-Host "🚀 Deploying ArgoCD to Kubernetes..." -ForegroundColor Green

# Create ArgoCD namespace
Write-Host "📦 Creating ArgoCD namespace..." -ForegroundColor Yellow
kubectl apply -f k8s/argocd-namespace.yaml

# Install ArgoCD
Write-Host "⚙️ Installing ArgoCD..." -ForegroundColor Yellow
kubectl apply -f k8s/argocd-install.yaml

# Wait for ArgoCD to be ready
Write-Host "⏳ Waiting for ArgoCD to be ready..." -ForegroundColor Yellow
kubectl wait --for=condition=available --timeout=300s deployment/argocd-server -n argocd

# Get ArgoCD admin password
Write-Host "🔑 Getting ArgoCD admin password..." -ForegroundColor Yellow
$ARGOCD_PASSWORD = kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | ForEach-Object { [System.Text.Encoding]::UTF8.GetString([System.Convert]::FromBase64String($_)) }

if ([string]::IsNullOrEmpty($ARGOCD_PASSWORD)) {
    Write-Host "⚠️ Using default password from secrets..." -ForegroundColor Yellow
    $ARGOCD_PASSWORD = "admin123"  # Default password from our secrets
}

# Get ArgoCD server URL
Write-Host "🌐 Getting ArgoCD server URL..." -ForegroundColor Yellow
$ARGOCD_SERVER = kubectl get svc argocd-server -n argocd -o jsonpath='{.status.loadBalancer.ingress[0].ip}'

if ([string]::IsNullOrEmpty($ARGOCD_SERVER)) {
    $ARGOCD_SERVER = kubectl get svc argocd-server -n argocd -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'
}

if ([string]::IsNullOrEmpty($ARGOCD_SERVER)) {
    Write-Host "🔧 Using port-forward for ArgoCD access..." -ForegroundColor Yellow
    $ARGOCD_SERVER = "localhost:8080"
    Start-Process -NoNewWindow kubectl -ArgumentList "port-forward", "svc/argocd-server", "-n", "argocd", "8080:443"
    Write-Host "ArgoCD is accessible at: http://localhost:8080" -ForegroundColor Cyan
} else {
    Write-Host "ArgoCD is accessible at: https://$ARGOCD_SERVER" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "✅ ArgoCD deployment completed!" -ForegroundColor Green
Write-Host "📋 Login credentials:" -ForegroundColor Cyan
Write-Host "   Username: admin" -ForegroundColor White
Write-Host "   Password: $ARGOCD_PASSWORD" -ForegroundColor White
Write-Host ""
Write-Host "🌐 ArgoCD UI: https://$ARGOCD_SERVER" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Yellow
Write-Host "   1. Login to ArgoCD UI" -ForegroundColor White
Write-Host "   2. Update repository URLs in application manifests" -ForegroundColor White
Write-Host "   3. Apply ArgoCD applications:" -ForegroundColor White
Write-Host "      kubectl apply -f k8s/argocd-app-*.yaml" -ForegroundColor White
