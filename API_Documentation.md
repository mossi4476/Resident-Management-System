# Resident Management System API Documentation

## Overview
This API provides endpoints for managing residents and complaints in ABC Apartment. The system supports user authentication, resident management, complaint tracking, and notification system.

## Base URL
- **Development**: `http://localhost:3001`
- **Production**: `http://aefaaf54067434c7f94efa1f4d9c480d-912660252.us-east-1.elb.amazonaws.com:3001`
- **Frontend**: `http://a1f10070e69ed4d7782b93a7c480fab6-660662555.us-east-1.elb.amazonaws.com`
- **Swagger Docs**: `http://aefaaf54067434c7f94efa1f4d9c480d-912660252.us-east-1.elb.amazonaws.com:3001/api/docs`

## Authentication
The API uses JWT (JSON Web Token) for authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Postman Collection
Import the following files into Postman:
1. `Resident_Management_System_API.postman_collection.json` - Main API collection
2. `Resident_Management_System_Environment.postman_environment.json` - Environment variables

## API Endpoints

### Authentication

#### POST /auth/login
User login endpoint.

**Request Body:**
```json
{
  "email": "resident@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user-id",
    "email": "resident@example.com",
    "role": "RESIDENT"
  }
}
```

#### POST /auth/register
User registration endpoint.

**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "role": "RESIDENT"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "userId": "new-user-id"
}
```

### Residents

#### POST /residents
Create a new resident profile.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+84901234567",
  "apartment": "A101",
  "floor": 1,
  "building": "Building A",
  "moveInDate": "2023-01-01T00:00:00.000Z",
  "isOwner": true
}
```

#### GET /residents
Get all residents.

**Headers:** `Authorization: Bearer <token>`

#### GET /residents/:id
Get a specific resident by ID.

**Headers:** `Authorization: Bearer <token>`

#### PATCH /residents/:id
Update a resident profile.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "firstName": "John Updated",
  "phone": "+84901234568"
}
```

#### DELETE /residents/:id
Delete a resident profile.

**Headers:** `Authorization: Bearer <token>`

#### GET /residents/stats
Get resident statistics.

**Headers:** `Authorization: Bearer <token>`

### Complaints

#### POST /complaints
Create a new complaint.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "title": "Water leak in bathroom",
  "description": "There is a water leak in the bathroom that needs immediate attention.",
  "category": "MAINTENANCE",
  "priority": "MEDIUM",
  "apartment": "A101",
  "building": "A"
}
```

**Categories:** `MAINTENANCE`, `SECURITY`, `CLEANING`, `NOISE`, `OTHER`
**Priorities:** `LOW`, `MEDIUM`, `HIGH`, `URGENT`

#### GET /complaints
Get all complaints with optional filters.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `status`: `PENDING`, `IN_PROGRESS`, `RESOLVED`, `CLOSED`
- `priority`: `LOW`, `MEDIUM`, `HIGH`, `URGENT`
- `category`: `MAINTENANCE`, `SECURITY`, `CLEANING`, `NOISE`, `OTHER`
- `building`: Building identifier

**Example:** `/complaints?status=PENDING&priority=HIGH&category=MAINTENANCE&building=A`

#### GET /complaints/my-complaints
Get current user's complaints.

**Headers:** `Authorization: Bearer <token>`

#### GET /complaints/:id
Get a specific complaint by ID.

**Headers:** `Authorization: Bearer <token>`

#### PATCH /complaints/:id
Update a complaint.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "status": "IN_PROGRESS",
  "priority": "HIGH",
  "assigneeId": "manager-id-here"
}
```

#### POST /complaints/:id/comments
Add a comment to a complaint.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "content": "This is a comment on the complaint"
}
```

#### DELETE /complaints/:id
Delete a complaint.

**Headers:** `Authorization: Bearer <token>`

#### GET /complaints/stats
Get complaint statistics.

**Headers:** `Authorization: Bearer <token>`

### Notifications

#### POST /notifications
Create a new notification.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "userId": "user-id-here",
  "title": "New Complaint Created",
  "message": "A new complaint has been created and requires your attention.",
  "type": "COMPLAINT"
}
```

#### GET /notifications
Get user notifications.

**Headers:** `Authorization: Bearer <token>`

#### GET /notifications/unread
Get unread notifications.

**Headers:** `Authorization: Bearer <token>`

#### GET /notifications/unread-count
Get unread notifications count.

**Headers:** `Authorization: Bearer <token>`

#### PATCH /notifications/:id/read
Mark a notification as read.

**Headers:** `Authorization: Bearer <token>`

#### PATCH /notifications/mark-all-read
Mark all notifications as read.

**Headers:** `Authorization: Bearer <token>`

#### DELETE /notifications/:id
Delete a notification.

**Headers:** `Authorization: Bearer <token>`

### Users

#### POST /users
Create a new user.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "role": "RESIDENT",
  "isActive": true
}
```

**Roles:** `ADMIN`, `MANAGER`, `RESIDENT`

#### GET /users
Get all users.

**Headers:** `Authorization: Bearer <token>`

#### GET /users/:id
Get a specific user by ID.

**Headers:** `Authorization: Bearer <token>`

#### PATCH /users/:id
Update a user.

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "email": "updated@example.com",
  "role": "MANAGER",
  "isActive": true
}
```

#### DELETE /users/:id
Delete a user.

**Headers:** `Authorization: Bearer <token>`

## Error Responses

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request"
}
```

### 401 Unauthorized
```json
{
  "statusCode": 401,
  "message": "Unauthorized"
}
```

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "statusCode": 500,
  "message": "Internal server error"
}
```

## Rate Limiting
The API implements rate limiting:
- **Limit**: 10 requests per minute per IP
- **Window**: 60 seconds

## Security Features
- JWT authentication
- Password validation (minimum 6 characters)
- CORS enabled for frontend domain
- Helmet security middleware
- Input validation and sanitization

## Getting Started with Postman

1. **Import Collection**: Import `Resident_Management_System_API.postman_collection.json`
2. **Import Environment**: Import `Resident_Management_System_Environment.postman_environment.json`
3. **Set Environment**: Select the imported environment in Postman
4. **Login First**: Use the Login endpoint to get an authentication token
5. **Auto-token**: The collection is configured to automatically set the auth token from login responses

## Environment Variables

- `baseUrl`: API base URL (default: http://localhost:3001)
- `authToken`: JWT authentication token (auto-populated from login)
- `userId`: Current user ID
- `residentId`: Resident ID for testing
- `complaintId`: Complaint ID for testing
- `notificationId`: Notification ID for testing

## Testing Workflow

1. **Register/Login**: Start with user registration or login
2. **Create Resident**: Create a resident profile
3. **Create Complaint**: Create a complaint
4. **Test Notifications**: Test notification endpoints
5. **Update/Delete**: Test update and delete operations

## Notes

- All endpoints except `/auth/login` and `/auth/register` require authentication
- The API uses Prisma ORM with PostgreSQL database
- Swagger documentation is available at `/api/docs` in development
- The system supports role-based access control (ADMIN, MANAGER, RESIDENT)
