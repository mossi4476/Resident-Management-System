#!/bin/bash

# Build Docker images for Resident Management System

echo "🐳 Building Docker images..."

# Build Backend Image
echo "Building backend image..."
docker build -t resident-backend:latest ./backend

# Build Frontend Image
echo "Building frontend image..."
docker build -t resident-frontend:latest ./frontend

echo "✅ All images built successfully!"
echo ""
echo "Images created:"
echo "- resident-backend:latest"
echo "- resident-frontend:latest"
echo ""
echo "To run with docker-compose:"
echo "docker-compose up -d"
echo ""
echo "To push to registry:"
echo "docker tag resident-backend:latest your-registry/resident-backend:latest"
echo "docker tag resident-frontend:latest your-registry/resident-frontend:latest"
echo "docker push your-registry/resident-backend:latest"
echo "docker push your-registry/resident-frontend:latest"
