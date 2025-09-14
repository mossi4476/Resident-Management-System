# 📊 K8s Monitoring with Prometheus & Grafana

This directory contains the configuration files for monitoring the Resident Management System on Kubernetes using Prometheus and Grafana.

## 🚀 Quick Start

### Deploy Monitoring Stack

```bash
# Using PowerShell (Windows)
.\scripts\deploy-monitoring.ps1

# Using Bash (Linux/Mac)
./scripts/deploy-monitoring.sh
```

### Manual Deployment

```bash
# 1. Deploy kube-state-metrics
kubectl apply -f k8s/kube-state-metrics.yaml

# 2. Deploy Prometheus
kubectl apply -f k8s/prometheus-rbac.yaml
kubectl apply -f k8s/prometheus-config.yaml
kubectl apply -f k8s/prometheus.yaml

# 3. Deploy Grafana
kubectl apply -f k8s/grafana-config.yaml
kubectl apply -f k8s/grafana-dashboards.yaml
kubectl apply -f k8s/grafana.yaml
```

## 🔗 Access URLs

- **Prometheus**: http://prometheus.local:9090
- **Grafana**: http://grafana.local:3000

### Local Access (Port Forward)

```bash
# Prometheus
kubectl port-forward -n resident-management svc/prometheus 9090:9090

# Grafana
kubectl port-forward -n resident-management svc/grafana 3000:3000
```

Then access:
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3000

## 🔑 Default Credentials

- **Grafana Username**: `admin`
- **Grafana Password**: `admin123`

## 📊 Available Dashboards

### 1. Kubernetes Cluster Monitoring
- Cluster overview
- Pod status
- CPU/Memory usage
- Node metrics

### 2. Resident Management App
- HTTP request metrics
- Response time
- Error rates
- Application performance

## 🔧 Configuration

### Prometheus Configuration
- **Scrape Interval**: 15s
- **Retention**: 200h
- **Targets**: K8s API, nodes, pods, services

### Grafana Configuration
- **Admin User**: admin
- **Anonymous Access**: Enabled
- **Dashboards**: Pre-configured for K8s and app monitoring

## 📈 Metrics Collected

### Kubernetes Metrics
- Node status and resources
- Pod lifecycle and resource usage
- Service endpoints
- Deployment status

### Application Metrics
- HTTP request rates
- Response times
- Error rates
- Custom business metrics

## 🚨 Alerting Rules

Pre-configured alerts for:
- High error rates (>10%)
- High memory usage (>80%)
- Pod crash looping
- Service unavailability

## 🛠️ Troubleshooting

### Check Pod Status
```bash
kubectl get pods -n resident-management
```

### Check Logs
```bash
# Prometheus logs
kubectl logs -n resident-management deployment/prometheus

# Grafana logs
kubectl logs -n resident-management deployment/grafana
```

### Check Services
```bash
kubectl get services -n resident-management
```

### Verify Metrics
```bash
# Check if metrics are being scraped
kubectl port-forward -n resident-management svc/prometheus 9090:9090
# Open http://localhost:9090/targets
```

## 🔄 Updates

To update the monitoring stack:

1. Modify the YAML files
2. Apply changes: `kubectl apply -f k8s/`
3. Restart deployments if needed: `kubectl rollout restart deployment/prometheus -n resident-management`

## 📚 Additional Resources

- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)
- [Kubernetes Monitoring Best Practices](https://kubernetes.io/docs/tasks/debug-application-cluster/resource-usage-monitoring/)
