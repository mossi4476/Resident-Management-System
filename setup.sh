#!/bin/bash

echo "🏠 Setting up ABC Apartment Resident Management System"
echo "=================================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if MySQL is running
if ! command -v mysql &> /dev/null; then
    echo "❌ MySQL is not installed. Please install MySQL 8.0+ first."
    exit 1
fi

echo "✅ Prerequisites check passed"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd ../frontend
npm install

# Go back to root
cd ..

# Generate Prisma client
echo "🔧 Generating Prisma client..."
cd backend
npx prisma generate

echo "✅ Setup completed!"
echo ""
echo "🚀 Next steps:"
echo "1. Set up your database and update backend/.env"
echo "2. Run: npm run db:push (to create database schema)"
echo "3. Run: npm run db:seed (to add sample data)"
echo "4. Run: npm run dev (to start both servers)"
echo ""
echo "📚 API Documentation: http://localhost:3001/api/docs"
echo "🌐 Frontend: http://localhost:3000"
echo ""
echo "Demo accounts:"
echo "- Admin: admin@abc-apartment.com / admin123"
echo "- Manager: manager@abc-apartment.com / manager123"
echo "- Resident: resident@example.com / resident123"
