# Test API endpoints
Write-Host "🧪 Testing ABC Apartment API" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

# Test basic endpoint
Write-Host "`n1. Testing basic endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001" -Method GET -TimeoutSec 5
    Write-Host "✅ Basic endpoint working" -ForegroundColor Green
    Write-Host "Status Code: $($response.StatusCode)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Basic endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test API docs
Write-Host "`n2. Testing API documentation..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/api/docs" -Method GET -TimeoutSec 5
    Write-Host "✅ API docs accessible" -ForegroundColor Green
    Write-Host "Status Code: $($response.StatusCode)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ API docs failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test auth endpoint
Write-Host "`n3. Testing authentication endpoint..." -ForegroundColor Yellow
try {
    $body = @{
        email = "admin@abc-apartment.com"
        password = "admin123"
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "http://localhost:3001/auth/login" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 5
    Write-Host "✅ Login endpoint working" -ForegroundColor Green
    Write-Host "Status Code: $($response.StatusCode)" -ForegroundColor Cyan
    Write-Host "Response: $($response.Content)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Login endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎉 API testing completed!" -ForegroundColor Green
