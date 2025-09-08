# Test API endpoints
Write-Host "🧪 Testing ABC Apartment API" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

# Test basic endpoint
Write-Host "`n1. Testing basic endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001" -Method GET
    Write-Host "✅ Basic endpoint working" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Basic endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test health endpoint
Write-Host "`n2. Testing health endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/health" -Method GET
    Write-Host "✅ Health endpoint working" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Health endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test API docs
Write-Host "`n3. Testing API documentation..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/docs" -Method GET
    Write-Host "✅ API docs accessible" -ForegroundColor Green
} catch {
    Write-Host "❌ API docs failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎉 API testing completed!" -ForegroundColor Green
