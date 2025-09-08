# ABC Apartment Resident Management System Setup Script
Write-Host "🏠 Setting up ABC Apartment Resident Management System" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js 18+ first." -ForegroundColor Red
    exit 1
}

# Check if MySQL is available
try {
    mysql --version | Out-Null
    Write-Host "✅ MySQL is available" -ForegroundColor Green
} catch {
    Write-Host "⚠️  MySQL command not found. Please ensure MySQL 8.0+ is installed and running." -ForegroundColor Yellow
}

Write-Host "📦 Installing root dependencies..." -ForegroundColor Blue
npm install

Write-Host "📦 Installing backend dependencies..." -ForegroundColor Blue
Set-Location backend
npm install

Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Blue
Set-Location ../frontend
npm install

Write-Host "🔧 Generating Prisma client..." -ForegroundColor Blue
Set-Location ../backend
npx prisma generate

Set-Location ..

Write-Host "✅ Setup completed!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Next steps:" -ForegroundColor Yellow
Write-Host "1. Set up your database and update backend/.env" -ForegroundColor White
Write-Host "2. Run: npm run db:push (to create database schema)" -ForegroundColor White
Write-Host "3. Run: npm run db:seed (to add sample data)" -ForegroundColor White
Write-Host "4. Run: npm run dev (to start both servers)" -ForegroundColor White
Write-Host ""
Write-Host "📚 API Documentation: http://localhost:3001/api/docs" -ForegroundColor Cyan
Write-Host "🌐 Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "Demo accounts:" -ForegroundColor Yellow
Write-Host "- Admin: admin@abc-apartment.com / admin123" -ForegroundColor White
Write-Host "- Manager: manager@abc-apartment.com / manager123" -ForegroundColor White
Write-Host "- Resident: resident@example.com / resident123" -ForegroundColor White
