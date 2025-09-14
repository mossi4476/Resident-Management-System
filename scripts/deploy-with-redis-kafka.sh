#!/bin/bash

# Deploy Resident Management System with Redis and Kafka
# This script deploys the complete system including Redis and Kafka

set -e

echo "🚀 Deploying Resident Management System with Redis and Kafka"
echo "=============================================================="

# Check if kubectl is available
if ! command -v kubectl &> /dev/null; then
    echo "❌ kubectl is not installed or not in PATH"
    exit 1
fi

# Check if we're connected to a cluster
if ! kubectl cluster-info &> /dev/null; then
    echo "❌ Not connected to a Kubernetes cluster"
    exit 1
fi

echo "✅ Connected to Kubernetes cluster"

# Create namespace if it doesn't exist
echo "📦 Creating namespace..."
kubectl create namespace resident-management --dry-run=client -o yaml | kubectl apply -f -

# Deploy Redis
echo "🔴 Deploying Redis..."
kubectl apply -f k8s/redis.yaml

# Deploy Kafka (Zookeeper first, then Kafka)
echo "🟡 Deploying Zookeeper..."
kubectl apply -f k8s/kafka.yaml

# Wait for Zookeeper to be ready
echo "⏳ Waiting for Zookeeper to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment/zookeeper -n resident-management

# Wait for Kafka to be ready
echo "⏳ Waiting for Kafka to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment/kafka -n resident-management

# Deploy backend with Redis and Kafka dependencies
echo "🔵 Deploying Backend..."
kubectl apply -f k8s/backend.yaml

# Deploy frontend
echo "🟢 Deploying Frontend..."
kubectl apply -f k8s/frontend.yaml

# Wait for backend to be ready
echo "⏳ Waiting for Backend to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment/backend -n mvp

# Wait for frontend to be ready
echo "⏳ Waiting for Frontend to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment/frontend -n mvp

echo ""
echo "🎉 Deployment completed successfully!"
echo "=============================================================="

# Get service URLs
echo "📋 Service URLs:"
echo ""

# Backend URL
BACKEND_URL=$(kubectl get service backend -n mvp -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
if [ -z "$BACKEND_URL" ]; then
    BACKEND_URL=$(kubectl get service backend -n mvp -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
fi
echo "🔵 Backend API: http://${BACKEND_URL}:3001"

# Frontend URL
FRONTEND_URL=$(kubectl get service frontend -n mvp -o jsonpath='{.status.loadBalancer.ingress[0].hostname}')
if [ -z "$FRONTEND_URL" ]; then
    FRONTEND_URL=$(kubectl get service frontend -n mvp -o jsonpath='{.status.loadBalancer.ingress[0].ip}')
fi
echo "🟢 Frontend: http://${FRONTEND_URL}:3000"

# Redis URL
echo "🔴 Redis: redis://redis-service.resident-management.svc.cluster.local:6379"

# Kafka URL
echo "🟡 Kafka: kafka-service.resident-management.svc.cluster.local:9092"

echo ""
echo "📚 API Documentation: http://${BACKEND_URL}:3001/api/docs"
echo "📊 Swagger UI: http://${BACKEND_URL}:3001/api/docs"

echo ""
echo "🔧 Useful Commands:"
echo "  View all pods: kubectl get pods -A"
echo "  View backend logs: kubectl logs -f deployment/backend -n mvp"
echo "  View Redis logs: kubectl logs -f deployment/redis -n resident-management"
echo "  View Kafka logs: kubectl logs -f deployment/kafka -n resident-management"
echo "  Scale backend: kubectl scale deployment backend --replicas=3 -n mvp"

echo ""
echo "🎯 Next Steps:"
echo "  1. Test the API endpoints using Postman collection"
echo "  2. Monitor Redis cache performance"
echo "  3. Check Kafka message flow"
echo "  4. Set up monitoring and alerting"
