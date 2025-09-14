#!/bin/bash

echo "🚀 Deploying Prometheus and Grafana for K8s Monitoring..."

# Create namespace if not exists
kubectl create namespace resident-management --dry-run=client -o yaml | kubectl apply -f -

# Deploy kube-state-metrics
echo "📊 Deploying kube-state-metrics..."
kubectl apply -f k8s/kube-state-metrics.yaml

# Deploy Prometheus
echo "📈 Deploying Prometheus..."
kubectl apply -f k8s/prometheus-rbac.yaml
kubectl apply -f k8s/prometheus-config.yaml
kubectl apply -f k8s/prometheus.yaml

# Deploy Grafana
echo "📊 Deploying Grafana..."
kubectl apply -f k8s/grafana-config.yaml
kubectl apply -f k8s/grafana-dashboards.yaml
kubectl apply -f k8s/grafana.yaml

# Wait for deployments
echo "⏳ Waiting for deployments to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment/prometheus -n resident-management
kubectl wait --for=condition=available --timeout=300s deployment/grafana -n resident-management
kubectl wait --for=condition=available --timeout=300s deployment/kube-state-metrics -n resident-management

# Get services
echo "🌐 Services:"
kubectl get services -n resident-management

# Get pods
echo "📦 Pods:"
kubectl get pods -n resident-management

echo "✅ Monitoring stack deployed successfully!"
echo ""
echo "🔗 Access URLs:"
echo "  Prometheus: http://prometheus.local"
echo "  Grafana: http://grafana.local"
echo ""
echo "🔑 Grafana credentials:"
echo "  Username: admin"
echo "  Password: admin123"
echo ""
echo "📝 To access locally, add to /etc/hosts:"
echo "  127.0.0.1 prometheus.local"
echo "  127.0.0.1 grafana.local"
echo ""
echo "🚀 To port-forward for local access:"
echo "  kubectl port-forward -n resident-management svc/prometheus 9090:9090"
echo "  kubectl port-forward -n resident-management svc/grafana 3000:3000"
