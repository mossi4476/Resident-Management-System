# ABC Apartment Resident Management System (MVP)

A modern, full-stack resident management system designed to solve the pain points of managing apartment residents and complaints through a centralized, digital platform.

## Deployed Links
- **Frontend**: http://a1f10070e69ed4d7782b93a7c480fab6-660662555.us-east-1.elb.amazonaws.com
- **Backend (API)**: http://aefaaf54067434c7f94efa1f4d9c480d-912660252.us-east-1.elb.amazonaws.com:3001
- **API Docs (Swagger)**: http://aefaaf54067434c7f94efa1f4d9c480d-912660252.us-east-1.elb.amazonaws.com:3001/api/docs

### Deployment Info
- **K8s Namespace**: `mvp`
- **Frontend Image**: `024190746294.dkr.ecr.us-east-1.amazonaws.com/resident-frontend:v5`
- **Backend Image**: `024190746294.dkr.ecr.us-east-1.amazonaws.com/resident-backend:v4`

### Frontend API Base URL
- Defined in `frontend/lib/api.ts`: `http://aefaaf54067434c7f94efa1f4d9c480d-912660252.us-east-1.elb.amazonaws.com:3001`
- Can be overridden via `NEXT_PUBLIC_API_URL` during build/deploy.

## 🏗️ Deployment Infrastructure Solution

- **☁️ Cloud**: AWS (EKS, ELB, ECR, RDS)
- **🧩 Orchestration**: Kubernetes (EKS) — namespace `mvp`, Deployments + Services (LoadBalancer)
- **🐳 Images**: Docker images stored in Amazon ECR
  - Frontend: `024190746294.dkr.ecr.us-east-1.amazonaws.com/resident-frontend:v5`
  - Backend: `024190746294.dkr.ecr.us-east-1.amazonaws.com/resident-backend:v4`
- **🗄️ Database**: AWS RDS MySQL [[memory:8439563]]
- **🔐 Secrets**: Kubernetes Secrets (`k8s/backend-secret.yaml`) for `DATABASE_URL`, `JWT_SECRET`
- **🌐 Ingress/Networking**: Service type `LoadBalancer` exposes public ELB for frontend and backend
- **📦 Artifacts**: Multi-stage Docker builds for small runtime images
- **🚀 Release**: `kubectl set image` + rolling updates; `kubectl rollout status` for health
- **📈 Observability**: ELB health checks; app logs via `kubectl logs`

### 📜 Kubernetes Resources
- `k8s/frontend.yaml`
  - Deployment: `resident-frontend` container on port 3000
  - Service: `LoadBalancer` → public URL for the app
- `k8s/backend.yaml`
  - Deployment: `resident-backend` container on port 3001
  - Env: `FRONTEND_URL` (CORS), `DATABASE_URL`, `JWT_SECRET`
  - Service: `LoadBalancer` → public API and Swagger

### 🔄 Deployment Flow
1. 🐳 Build and push images to ECR
   - Frontend: `docker build -t resident-frontend ./frontend`
   - `docker tag resident-frontend:latest <ECR>/resident-frontend:v5`
   - `docker push <ECR>/resident-frontend:v5`
2. 🚢 Update deployment images
   - `kubectl -n mvp set image deploy/frontend frontend=<ECR>/resident-frontend:v5`
   - `kubectl -n mvp set image deploy/backend backend=<ECR>/resident-backend:v4`
3. 🔁 Rollout and verify
   - `kubectl -n mvp rollout status deploy/frontend`
   - `kubectl -n mvp rollout status deploy/backend`
4. 🌍 Get public endpoints
   - `kubectl -n mvp get svc frontend -o wide`
   - `kubectl -n mvp get svc backend -o wide`

### ⚙️ Runtime Configuration
- **CORS/Origins**: Backend `FRONTEND_URL` must match the frontend ELB URL
- **Frontend API Base**: `frontend/lib/api.ts` points to backend ELB on port 3001
- **Env Override**: `NEXT_PUBLIC_API_URL` can override API base at build-time

### 🔒 Security Notes
- Store secrets only in `Secrets` (never commit to git)
- Use unique `JWT_SECRET` per environment
- Restrict RDS access to EKS nodes’ security group

## 🎯 Problem Statement

The management board of ABC Apartment currently manages resident information and complaints via Zalo and Excel files, leading to:
- **Data Inconsistency**: Information scattered across multiple platforms
- **Inefficient Complaint Resolution**: No centralized tracking system
- **Manual Processes**: Time-consuming data entry and management
- **No Real-time Updates**: Delayed communication between residents and management
- **Limited Reporting**: No analytics or insights into resident issues

## 🚀 Solution Overview

This MVP provides a comprehensive digital solution with:
- **Centralized Database**: Single source of truth for all resident data
- **Digital Complaint System**: Structured complaint tracking with status updates
- **Real-time Notifications**: Instant updates for both residents and management
- **Role-based Access Control**: Secure access for different user types
- **Dashboard Analytics**: Visual insights into resident satisfaction and issue trends

## 🏗️ System Architecture

### Tech Stack
- **Backend**: NestJS (Node.js framework)
- **Frontend**: Next.js 14 (React framework)
- **Database**: MySQL with Prisma ORM
- **Authentication**: JWT tokens
- **Styling**: Tailwind CSS
- **Validation**: Zod + React Hook Form

### Key Features
- **User Authentication & Authorization**
- **Resident Management (CRUD)**
- **Complaint Management System**
- **Real-time Notifications**
- **Role-based Dashboard**
- **Responsive Design**

## 📊 Database Schema

### Core Entities
- **Users**: Authentication and role management
- **Residents**: Resident profiles and apartment details
- **Family Members**: Additional household members
- **Complaints**: Issue tracking and resolution
- **Complaint Comments**: Communication thread
- **Complaint Attachments**: File support
- **Notifications**: Real-time updates

### User Roles
- **ADMIN**: Full system access, user management
- **MANAGER**: Resident management, complaint resolution
- **RESIDENT**: View own data, create complaints

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- MySQL 8.0+
- npm or yarn

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd resident-management-system
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up environment variables**
```bash
# Backend
cd backend
cp env.example .env
# Edit .env with your database credentials
```

4. **Set up the database**
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Seed with sample data
npm run db:seed
```

5. **Start the development servers**
```bash
# Start both backend and frontend
npm run dev

# Or start individually
npm run dev:backend  # Backend on http://localhost:3001
npm run dev:frontend # Frontend on http://localhost:3000
```

### Demo Accounts
- **Admin**: admin@abc-apartment.com / admin123
- **Manager**: manager@abc-apartment.com / manager123
- **Resident**: resident@example.com / resident123

## 📱 Features Walkthrough

### 1. Authentication System
- Secure JWT-based authentication
- Role-based access control
- Protected routes and API endpoints

### 2. Resident Management
- **For Admins/Managers**:
  - View all residents
  - Add new residents
  - Update resident information
  - Delete residents
  - View resident statistics

### 3. Complaint Management
- **For Residents**:
  - Create new complaints
  - View own complaints
  - Add comments to complaints
  - Track complaint status

- **For Managers/Admins**:
  - View all complaints
  - Update complaint status
  - Assign complaints
  - Add resolution comments

### 4. Dashboard Analytics
- Real-time statistics
- Complaint status overview
- Resident count and trends

### 5. Notification System
- Real-time notifications
- Mark as read functionality
- Notification history

## 🔧 API Documentation

The API is fully documented with Swagger UI available at:
`http://localhost:3001/api/docs`

### Key Endpoints

#### Authentication
- `POST /auth/login` - User login
- `POST /auth/register` - User registration

#### Residents
- `GET /residents` - Get all residents
- `POST /residents` - Create resident
- `GET /residents/:id` - Get resident by ID
- `PATCH /residents/:id` - Update resident
- `DELETE /residents/:id` - Delete resident

#### Complaints
- `GET /complaints` - Get all complaints
- `POST /complaints` - Create complaint
- `GET /complaints/:id` - Get complaint by ID
- `PATCH /complaints/:id` - Update complaint
- `POST /complaints/:id/comments` - Add comment

## 🎨 UI/UX Features

### Design Principles
- **Clean & Modern**: Minimalist design with clear visual hierarchy
- **Responsive**: Works seamlessly on desktop, tablet, and mobile
- **Accessible**: WCAG 2.1 compliant design patterns
- **Intuitive**: User-friendly interface with clear navigation

### Key Components
- **Dashboard**: Overview with statistics and quick actions
- **Sidebar Navigation**: Role-based menu items
- **Data Tables**: Sortable and filterable lists
- **Forms**: Validated input with real-time feedback
- **Modals**: Confirmation dialogs and detailed views
- **Notifications**: Toast messages and notification panel

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Authorization**: Granular permission system
- **Input Validation**: Server-side and client-side validation
- **SQL Injection Protection**: Prisma ORM with parameterized queries
- **XSS Protection**: Helmet.js security headers
- **CORS Configuration**: Controlled cross-origin requests

## 📈 Performance Optimizations

- **Database Indexing**: Optimized queries with proper indexes
- **Lazy Loading**: Component-based code splitting
- **Caching**: API response caching strategies
- **Image Optimization**: Next.js automatic image optimization
- **Bundle Optimization**: Tree shaking and code splitting

## 🚀 Deployment Strategy

### Development
- Local development with hot reload
- Environment-based configuration
- Database migrations

### Production
- Docker containerization
- Environment variable management
- Database connection pooling
- Load balancing ready

### Recommended Infrastructure
- **Backend**: Node.js hosting (Vercel, Railway, or AWS)
- **Database**: MySQL hosting (PlanetScale, AWS RDS)
- **Frontend**: Vercel or Netlify
- **CDN**: CloudFlare for static assets

## 🔮 Future Extensions

### Phase 2 Features
- **File Upload**: Support for complaint attachments
- **Email Notifications**: Automated email alerts
- **SMS Integration**: Text message notifications
- **Mobile App**: React Native mobile application
- **Advanced Analytics**: Detailed reporting dashboard
- **Payment Integration**: Maintenance fee tracking
- **Visitor Management**: Guest registration system
- **Maintenance Scheduling**: Automated maintenance requests

### Technical Improvements
- **Real-time Updates**: WebSocket integration
- **Advanced Search**: Full-text search capabilities
- **API Rate Limiting**: Enhanced security measures
- **Monitoring**: Application performance monitoring
- **Testing**: Comprehensive test suite
- **CI/CD**: Automated deployment pipeline

## 🛠️ Development Guidelines

### Code Structure
```
├── backend/
│   ├── src/
│   │   ├── auth/          # Authentication module
│   │   ├── residents/     # Resident management
│   │   ├── complaints/    # Complaint system
│   │   ├── notifications/ # Notification system
│   │   └── prisma/        # Database service
│   └── prisma/
│       └── schema.prisma  # Database schema
├── frontend/
│   ├── app/               # Next.js app directory
│   ├── components/        # React components
│   ├── contexts/          # React contexts
│   └── lib/               # Utility functions
└── README.md
```

### Coding Standards
- **TypeScript**: Strict type checking
- **ESLint**: Code quality enforcement
- **Prettier**: Code formatting
- **Conventional Commits**: Standardized commit messages
- **Clean Code**: SOLID principles and best practices

## 📝 License

This project is created as part of a technical assessment for a Fullstack Developer position.

## 👥 Contributing

This is a technical assessment project. For production use, please ensure:
1. Security audit and penetration testing
2. Performance optimization and load testing
3. Comprehensive test coverage
4. Documentation updates
5. Code review process

## 📞 Support

For technical questions or issues, please refer to the API documentation or create an issue in the repository.

---

**Built with ❤️ using NestJS, Next.js, Prisma, and MySQL**
