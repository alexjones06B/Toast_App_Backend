# Toast App API Documentation

## Overview
Toast App API is a Cloudflare Workers-based backend for managing users and toasts. The API uses Hono framework with D1 database for data persistence.

## Base URL
- **Local Development**: `http://localhost:8787`
- **Production**: TBD

## API Endpoints

### Root
- **GET /** - API documentation and available endpoints

### User Management

#### Get All Users
```
GET /users
```
Returns a list of all users in the system.

#### Register New User
```
POST /users/register
Body: { "userID": "uuid", "name": "User Name" }
```

#### Get User Profile
```
POST /users/profile  
Body: { "userID": "uuid" }
```

#### Update User Profile
```
PUT /users/profile
Body: { "userID": "uuid", "name": "New Name" }
```

### Toast Management

#### Get All Toasts
```
GET /toasts
```
Returns a list of all toasts with user details.

#### Send a Toast
```
POST /toasts/send
Body: { 
  "toastID": "uuid", 
  "toasterID": "sender-uuid", 
  "toastieID": "recipient-uuid" 
}
```

#### Get My Toasts
```
POST /toasts/my-toasts
Body: { "userID": "uuid" }
```
Returns toasts sent and received by the specified user.

#### Find Users
```
POST /toasts/find-users
Body: { "searchTerm": "partial name" }
```
Search for users by name (partial matching).

### Health Check
```
GET /health
```
Returns API health status and database connection status.

## Local Development

### Database Management

#### Apply Migrations
```bash
npm run db:migrate
```

#### Seed Database
```bash
npm run db:seed
```

#### Clear Database
```bash
npm run db:clear
```

#### Database Studio
```bash
npm run db:studio
```

### Running the API
```bash
npm run dev           # Local development
npm run dev:remote    # Remote development (if auth works)
```

## Response Format

All endpoints return JSON responses with consistent structure:

**Success Response:**
```json
{
  "success": true,
  "data": {...},
  "count": 5  // for list endpoints
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message",
  "details": "Detailed error information"
}
```
POST /api/toasts/find-users
Body: { 
  "searchTerm": "Alice", 
  "currentUserID": "uuid" 
}
```

### Admin (Development Only)

#### Seed Database
## Example Usage

### Register a user:
```bash
curl -X POST http://localhost:8787/users/register \
  -H "Content-Type: application/json" \
  -d '{"userID":"test-123","name":"Test User"}'
```

### Get all users:
```bash
curl http://localhost:8787/users
```

### Send a toast:
```bash
curl -X POST http://localhost:8787/toasts/send \
  -H "Content-Type: application/json" \
  -d '{"toastID":"toast-123","toasterID":"test-123","toastieID":"550e8400-e29b-41d4-a716-446655440001"}'
```

### Get all toasts:
```bash
curl http://localhost:8787/toasts
```

### Get my toasts:
```bash
curl -X POST http://localhost:8787/toasts/my-toasts \
  -H "Content-Type: application/json" \
  -d '{"userID":"test-123"}'
```