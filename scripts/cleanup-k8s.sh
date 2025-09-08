#!/bin/bash

# Cleanup Resident Management System from Kubernetes

echo "🧹 Cleaning up Kubernetes resources..."

# Delete Ingress
echo "Deleting Ingress..."
kubectl delete -f k8s/ingress.yaml --ignore-not-found=true

# Delete Frontend
echo "Deleting Frontend..."
kubectl delete -f k8s/frontend-deployment.yaml --ignore-not-found=true

# Delete Backend
echo "Deleting Backend..."
kubectl delete -f k8s/backend-deployment.yaml --ignore-not-found=true

# Delete MySQL
echo "Deleting MySQL..."
kubectl delete -f k8s/mysql-deployment.yaml --ignore-not-found=true

# Delete ConfigMap
echo "Deleting ConfigMap..."
kubectl delete -f k8s/configmap.yaml --ignore-not-found=true

# Delete Secrets
echo "Deleting Secrets..."
kubectl delete -f k8s/secret.yaml --ignore-not-found=true

# Delete Namespace
echo "Deleting Namespace..."
kubectl delete -f k8s/namespace.yaml --ignore-not-found=true

echo "✅ Cleanup completed!"
echo ""
echo "To verify cleanup:"
echo "kubectl get all -n resident-management"
