Write-Host "🚀 Deploying Prometheus and Grafana for K8s Monitoring..." -ForegroundColor Green

# Create namespace if not exists
kubectl create namespace resident-management --dry-run=client -o yaml | kubectl apply -f -

# Deploy kube-state-metrics
Write-Host "📊 Deploying kube-state-metrics..." -ForegroundColor Yellow
kubectl apply -f k8s/kube-state-metrics.yaml

# Deploy Prometheus
Write-Host "📈 Deploying Prometheus..." -ForegroundColor Yellow
kubectl apply -f k8s/prometheus-rbac.yaml
kubectl apply -f k8s/prometheus-config.yaml
kubectl apply -f k8s/prometheus.yaml

# Deploy Grafana
Write-Host "📊 Deploying Grafana..." -ForegroundColor Yellow
kubectl apply -f k8s/grafana-config.yaml
kubectl apply -f k8s/grafana-dashboards.yaml
kubectl apply -f k8s/grafana.yaml

# Wait for deployments
Write-Host "⏳ Waiting for deployments to be ready..." -ForegroundColor Cyan
kubectl wait --for=condition=available --timeout=300s deployment/prometheus -n resident-management
kubectl wait --for=condition=available --timeout=300s deployment/grafana -n resident-management
kubectl wait --for=condition=available --timeout=300s deployment/kube-state-metrics -n resident-management

# Get services
Write-Host "🌐 Services:" -ForegroundColor Green
kubectl get services -n resident-management

# Get pods
Write-Host "📦 Pods:" -ForegroundColor Green
kubectl get pods -n resident-management

Write-Host "✅ Monitoring stack deployed successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "🔗 Access URLs:" -ForegroundColor Cyan
Write-Host "  Prometheus: http://prometheus.local" -ForegroundColor White
Write-Host "  Grafana: http://grafana.local" -ForegroundColor White
Write-Host ""
Write-Host "🔑 Grafana credentials:" -ForegroundColor Cyan
Write-Host "  Username: admin" -ForegroundColor White
Write-Host "  Password: admin123" -ForegroundColor White
Write-Host ""
Write-Host "📝 To access locally, add to C:\Windows\System32\drivers\etc\hosts:" -ForegroundColor Yellow
Write-Host "  127.0.0.1 prometheus.local" -ForegroundColor White
Write-Host "  127.0.0.1 grafana.local" -ForegroundColor White
Write-Host ""
Write-Host "🚀 To port-forward for local access:" -ForegroundColor Cyan
Write-Host "  kubectl port-forward -n resident-management svc/prometheus 9090:9090" -ForegroundColor White
Write-Host "  kubectl port-forward -n resident-management svc/grafana 3000:3000" -ForegroundColor White
