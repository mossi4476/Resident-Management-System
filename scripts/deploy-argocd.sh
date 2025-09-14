#!/bin/bash

# Deploy ArgoCD to Kubernetes
echo "🚀 Deploying ArgoCD to Kubernetes..."

# Create ArgoCD namespace
echo "📦 Creating ArgoCD namespace..."
kubectl apply -f k8s/argocd-namespace.yaml

# Install ArgoCD
echo "⚙️ Installing ArgoCD..."
kubectl apply -f k8s/argocd-install.yaml

# Wait for ArgoCD to be ready
echo "⏳ Waiting for ArgoCD to be ready..."
kubectl wait --for=condition=available --timeout=300s deployment/argocd-server -n argocd

# Get ArgoCD admin password
echo "🔑 Getting ArgoCD admin password..."
ARGOCD_PASSWORD=$(kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d 2>/dev/null)

if [ -z "$ARGOCD_PASSWORD" ]; then
    echo "⚠️ Using default password from secrets..."
    ARGOCD_PASSWORD="admin123"  # Default password from our secrets
fi

# Get ArgoCD server URL
echo "🌐 Getting ArgoCD server URL..."
ARGOCD_SERVER=$(kubectl get svc argocd-server -n argocd -o jsonpath='{.status.loadBalancer.ingress[0].ip}' 2>/dev/null)

if [ -z "$ARGOCD_SERVER" ]; then
    ARGOCD_SERVER=$(kubectl get svc argocd-server -n argocd -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null)
fi

if [ -z "$ARGOCD_SERVER" ]; then
    echo "🔧 Using port-forward for ArgoCD access..."
    ARGOCD_SERVER="localhost:8080"
    kubectl port-forward svc/argocd-server -n argocd 8080:443 &
    echo "ArgoCD is accessible at: http://localhost:8080"
else
    echo "ArgoCD is accessible at: https://$ARGOCD_SERVER"
fi

echo ""
echo "✅ ArgoCD deployment completed!"
echo "📋 Login credentials:"
echo "   Username: admin"
echo "   Password: $ARGOCD_PASSWORD"
echo ""
echo "🌐 ArgoCD UI: https://$ARGOCD_SERVER"
echo ""
echo "📝 Next steps:"
echo "   1. Login to ArgoCD UI"
echo "   2. Update repository URLs in application manifests"
echo "   3. Apply ArgoCD applications:"
echo "      kubectl apply -f k8s/argocd-app-*.yaml"
