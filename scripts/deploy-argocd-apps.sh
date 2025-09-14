#!/bin/bash

# Deploy ArgoCD Applications
echo "🚀 Deploying ArgoCD Applications..."

# Check if repository URL is set
if [ -z "$REPO_URL" ]; then
    echo "⚠️ Please set REPO_URL environment variable with your Git repository URL"
    echo "Example: export REPO_URL=https://github.com/your-username/your-repo.git"
    exit 1
fi

echo "📦 Repository URL: $REPO_URL"

# Update repository URLs in application manifests
echo "🔄 Updating repository URLs in application manifests..."
sed -i.bak "s|https://github.com/your-username/your-repo.git|$REPO_URL|g" k8s/argocd-app-*.yaml

# Apply ArgoCD applications
echo "📋 Applying ArgoCD applications..."

# Apply infrastructure first (Redis, Kafka)
echo "🏗️ Deploying infrastructure (Redis, Kafka)..."
kubectl apply -f k8s/argocd-app-infrastructure.yaml

# Wait a bit for infrastructure to be ready
sleep 10

# Apply backend
echo "🔧 Deploying backend application..."
kubectl apply -f k8s/argocd-app-backend.yaml

# Apply frontend
echo "🎨 Deploying frontend application..."
kubectl apply -f k8s/argocd-app-frontend.yaml

# Apply monitoring (optional)
echo "📊 Deploying monitoring stack..."
kubectl apply -f k8s/argocd-app-monitoring.yaml

# Get ArgoCD server URL
ARGOCD_SERVER=$(kubectl get svc argocd-server -n argocd -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null)
if [ -z "$ARGOCD_SERVER" ]; then
    ARGOCD_SERVER=$(kubectl get svc argocd-server -n argocd -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null)
fi
if [ -z "$ARGOCD_SERVER" ]; then
    ARGOCD_SERVER="localhost:8080"
fi

echo ""
echo "✅ ArgoCD applications deployed successfully!"
echo ""
echo "🌐 ArgoCD UI: https://$ARGOCD_SERVER"
echo "📋 Applications deployed:"
echo "   - infrastructure (Redis, Kafka)"
echo "   - resident-backend"
echo "   - resident-frontend"
echo "   - monitoring-stack"
echo ""
echo "📝 You can monitor the deployment progress in the ArgoCD UI"
echo "🔄 Applications will automatically sync with your Git repository"
