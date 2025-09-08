# 🐳 Docker & Kubernetes Deployment Guide

## 📋 Overview

This guide covers Docker containerization and Kubernetes deployment for the Resident Management System.

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   MySQL         │
│   (Next.js)     │◄──►│   (Nest.js)     │◄──►│   (Database)    │
│   Port: 3000    │    │   Port: 3001    │    │   Port: 3306    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🐳 Docker Commands

### Build Images
```bash
# Build all images
./scripts/build-images.sh

# Or build individually
docker build -t resident-backend:latest ./backend
docker build -t resident-frontend:latest ./frontend
```

### Run with Docker Compose

#### Production
```bash
docker-compose up -d
```

#### Development
```bash
docker-compose -f docker-compose.dev.yml up -d
```

### Stop Services
```bash
docker-compose down
```

## ☸️ Kubernetes Deployment

### Prerequisites
- Kubernetes cluster (minikube, kind, or cloud provider)
- kubectl configured
- Docker images built and pushed to registry

### Deploy to Kubernetes
```bash
# Deploy all resources
./scripts/deploy-k8s.sh

# Or deploy step by step
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/mysql-deployment.yaml
kubectl apply -f k8s/backend-deployment.yaml
kubectl apply -f k8s/frontend-deployment.yaml
kubectl apply -f k8s/ingress.yaml
```

### Check Status
```bash
# Check pods
kubectl get pods -n resident-management

# Check services
kubectl get services -n resident-management

# Check ingress
kubectl get ingress -n resident-management
```

### Access Application
```bash
# Port forward to access locally
kubectl port-forward service/frontend-service 3000:3000 -n resident-management

# Then open http://localhost:3000
```

### Cleanup
```bash
# Remove all resources
./scripts/cleanup-k8s.sh
```

## 🔧 Configuration

### Environment Variables

#### Backend
- `NODE_ENV`: production/development
- `PORT`: 3001
- `DATABASE_URL`: MySQL connection string
- `JWT_SECRET`: JWT signing secret
- `JWT_EXPIRES_IN`: Token expiration time

#### Frontend
- `NODE_ENV`: production
- `NEXT_PUBLIC_API_URL`: Backend API URL

### Secrets Management

Update `k8s/secret.yaml` with base64 encoded values:
```bash
# Encode secrets
echo -n "your-secret-value" | base64
```

## 📊 Resource Requirements

### Backend
- CPU: 250m (request) / 500m (limit)
- Memory: 256Mi (request) / 512Mi (limit)

### Frontend
- CPU: 100m (request) / 200m (limit)
- Memory: 128Mi (request) / 256Mi (limit)

### MySQL
- CPU: 250m (request) / 500m (limit)
- Memory: 256Mi (request) / 512Mi (limit)
- Storage: 10Gi

## 🔍 Troubleshooting

### Check Logs
```bash
# Backend logs
kubectl logs -f deployment/backend-deployment -n resident-management

# Frontend logs
kubectl logs -f deployment/frontend-deployment -n resident-management

# MySQL logs
kubectl logs -f deployment/mysql-deployment -n resident-management
```

### Debug Pods
```bash
# Get pod status
kubectl describe pod <pod-name> -n resident-management

# Execute into pod
kubectl exec -it <pod-name> -n resident-management -- /bin/sh
```

### Health Checks
```bash
# Check backend health
kubectl port-forward service/backend-service 3001:3001 -n resident-management
curl http://localhost:3001/health

# Check frontend health
kubectl port-forward service/frontend-service 3000:3000 -n resident-management
curl http://localhost:3000/api/health
```

## 🚀 Production Considerations

1. **Image Registry**: Push images to container registry
2. **Secrets**: Use proper secret management (Vault, AWS Secrets Manager)
3. **Monitoring**: Add Prometheus/Grafana for monitoring
4. **Logging**: Implement centralized logging (ELK stack)
5. **SSL/TLS**: Configure HTTPS with proper certificates
6. **Scaling**: Configure HPA (Horizontal Pod Autoscaler)
7. **Backup**: Implement database backup strategy
8. **Security**: Use Network Policies and Pod Security Standards
