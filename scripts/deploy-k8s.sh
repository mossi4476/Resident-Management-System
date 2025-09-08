#!/bin/bash

# Deploy Resident Management System to Kubernetes

echo "☸️ Deploying to Kubernetes..."

# Create namespace
echo "Creating namespace..."
kubectl apply -f k8s/namespace.yaml

# Apply secrets
echo "Applying secrets..."
kubectl apply -f k8s/secret.yaml

# Apply configmap
echo "Applying configmap..."
kubectl apply -f k8s/configmap.yaml

# Deploy MySQL
echo "Deploying MySQL..."
kubectl apply -f k8s/mysql-deployment.yaml

# Wait for MySQL to be ready
echo "Waiting for MySQL to be ready..."
kubectl wait --for=condition=ready pod -l app=mysql -n resident-management --timeout=300s

# Deploy Backend
echo "Deploying Backend..."
kubectl apply -f k8s/backend-deployment.yaml

# Wait for Backend to be ready
echo "Waiting for Backend to be ready..."
kubectl wait --for=condition=ready pod -l app=backend -n resident-management --timeout=300s

# Deploy Frontend
echo "Deploying Frontend..."
kubectl apply -f k8s/frontend-deployment.yaml

# Wait for Frontend to be ready
echo "Waiting for Frontend to be ready..."
kubectl wait --for=condition=ready pod -l app=frontend -n resident-management --timeout=300s

# Apply Ingress
echo "Applying Ingress..."
kubectl apply -f k8s/ingress.yaml

echo "✅ Deployment completed!"
echo ""
echo "To check status:"
echo "kubectl get pods -n resident-management"
echo "kubectl get services -n resident-management"
echo "kubectl get ingress -n resident-management"
echo ""
echo "To access the application:"
echo "kubectl port-forward service/frontend-service 3000:3000 -n resident-management"
echo "Then open http://localhost:3000"
