# Authentication Implementation Guide

## Overview

The authentication system has been upgraded with the following features:

1. **JWT Token Pair Strategy**: Access tokens (15m) + Refresh tokens (7d)
2. **Redis Session Management**: User sessions and token revocation tracking
3. **Comprehensive Error Handling**: Structured error responses with proper HTTP status codes
4. **Protected Routes**: Role-based authorization middleware
5. **HTTP-only Cookies**: Secure token storage
6. **Token Refresh Endpoint**: Automatic token rotation

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

This installs all required packages including:
- `redis` - Redis client
- `jsonwebtoken` - JWT operations
- `bcryptjs` - Password hashing
- `cookie-parser` - Cookie parsing
- And others...

### 2. Redis Setup

**Option A: Local Redis (Recommended for development)**

```bash
# Windows - Install Redis from https://github.com/microsoftarchive/redis/releases
# Or use WSL: wsl
# sudo apt-get install redis-server

# Start Redis server
redis-server

# Verify Redis is running
redis-cli ping
# Should return: PONG
```

**Option B: Docker Redis**

```bash
docker run -d -p 6379:6379 --name redis redis:latest
```

**Option C: Redis Cloud**

```bash
# Sign up at https://redis.com/try-free/
# Get connection details and update .env
```

### 3. Environment Configuration

Copy and update the `.env` file:

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
# Server
NODE_ENV=development
PORT=8000
CLIENT_URL=http://localhost:5173

# Database
MONGODB_URI=mongodb://localhost:27017/studysphere

# JWT - Generate strong secrets
JWT_ACCESS_SECRET=your-strong-access-secret-here
JWT_REFRESH_SECRET=your-strong-refresh-secret-here
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

**Generating Strong Secrets:**

```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -base64 32
```

### 4. Database Setup

Ensure MongoDB is running:

```bash
# Local MongoDB
mongod

# Or Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### 5. Start the Server

```bash
npm run dev
```

Expected output:
```
[Database] Connected
[Redis] Initialized
[Server] Running on http://localhost:8000
```

## API Endpoints

### Authentication Routes

#### Register
```bash
POST /api/auth/register
Content-Type: application/json

{
  "fullName": "John Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "role": "user"
}

Response (201):
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "expiresIn": 900,
    "user": {...}
  }
}
```

#### Login
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}

Response (200):
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "expiresIn": 900,
    "user": {...}
  }
}
```

#### Refresh Token
```bash
POST /api/auth/refresh
Content-Type: application/json
Cookie: refreshToken=eyJhbGc...

Response (200):
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "expiresIn": 900
  }
}
```

#### Logout
```bash
POST /api/auth/logout
Authorization: Bearer {accessToken}

Response (200):
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### Get Current User
```bash
GET /api/auth/me
Authorization: Bearer {accessToken}

Response (200):
{
  "success": true,
  "data": {
    "user": {...}
  }
}
```

#### Update Profile
```bash
PATCH /api/auth/profile
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "fullName": "John Updated",
  "bio": "Learning developer",
  "skills": ["JavaScript", "React"],
  ...
}

Response (200):
{
  "success": true,
  "data": {
    "user": {...}
  }
}
```

## Error Handling

All errors follow a consistent format:

```json
{
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "statusCode": 400,
    "timestamp": "2026-05-04T10:30:00.000Z",
    "details": {...}
  }
}
```

### Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid input data |
| `AUTHENTICATION_ERROR` | 401 | Authentication failed |
| `TOKEN_EXPIRED` | 401 | Token has expired |
| `AUTHORIZATION_ERROR` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource already exists |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

## Middleware Usage

### Protected Routes (Authentication Required)

```javascript
const { authenticate } = require('../middlewares/auth.middleware');

router.get('/profile', authenticate, getProfile);
```

### Role-Based Authorization

```javascript
const { authorize, adminOnly, moderatorOrAdmin } = require('../middlewares/auth.middleware');

// Specific roles
router.delete('/resource', authorize('admin', 'moderator'), deleteResource);

// Admin only
router.get('/admin/dashboard', adminOnly, getAdminDashboard);

// Admin or Moderator
router.post('/moderation', moderatorOrAdmin, moderateContent);
```

### Optional Authentication

```javascript
const { optionalAuthenticate } = require('../middlewares/auth.middleware');

router.get('/posts', optionalAuthenticate, getPosts);
// User object will be attached if authenticated, otherwise continues
```

## Security Best Practices

### 1. Token Storage

✅ **Recommended**: HTTP-only cookies (server-set)
```javascript
res.cookie('accessToken', token, {
  httpOnly: true,        // Not accessible via JavaScript
  secure: true,          // HTTPS only in production
  sameSite: 'strict',   // CSRF protection
  maxAge: 15 * 60 * 1000 // 15 minutes
});
```

❌ **Avoid**: localStorage/sessionStorage (XSS vulnerable)

### 2. Token Rotation

- Access tokens expire every 15 minutes
- Refresh tokens expire every 7 days
- Use the refresh endpoint to get new tokens
- Old refresh tokens are revoked when new ones are issued

### 3. Password Security

- Minimum 8 characters
- Hashed with bcryptjs (salt rounds: 10)
- Never logged or exposed in responses

### 4. CORS Configuration

Only allow requests from trusted origins:

```javascript
cors({
  origin: process.env.CLIENT_URL,
  credentials: true // Allow cookies
})
```

### 5. Rate Limiting (Future Enhancement)

Implement rate limiting to prevent brute force attacks:

```bash
npm install express-rate-limit
```

## Testing

### Using cURL

```bash
# Register
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Test User",
    "username": "testuser",
    "email": "test@example.com",
    "password": "TestPass123"
  }'

# Login
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "TestPass123"
  }'

# Get current user (use token from login response)
curl -X GET http://localhost:8000/api/auth/me \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Using Postman

1. Create a new collection
2. Set variable `{{base_url}}` = `http://localhost:8000`
3. Create requests for each endpoint
4. Use `Tests` tab to extract tokens:

```javascript
pm.environment.set("accessToken", pm.response.json().data.accessToken);
pm.environment.set("refreshToken", pm.response.json().data.refreshToken);
```

## Troubleshooting

### Redis Connection Error

```
Error: connect ECONNREFUSED 127.0.0.1:6379
```

**Solution**: Start Redis server
```bash
redis-server
# or with Docker
docker run -d -p 6379:6379 redis:latest
```

### JWT Secret Not Set

```
Error: Failed to generate access token
```

**Solution**: Set JWT secrets in `.env`:
```bash
JWT_ACCESS_SECRET=your-secret-here
JWT_REFRESH_SECRET=your-secret-here
```

### Token Expired Error

```
{
  "error": {
    "code": "TOKEN_EXPIRED",
    "message": "Access token expired"
  }
}
```

**Solution**: Use refresh endpoint to get new token:
```bash
curl -X POST http://localhost:8000/api/auth/refresh
```

### CORS Error in Browser

```
Access to XMLHttpRequest has been blocked by CORS policy
```

**Solution**: Update `CLIENT_URL` in `.env`:
```bash
CLIENT_URL=http://localhost:5173
```

## Next Steps

1. **Frontend Integration**: Update frontend to use new token pair strategy
2. **2FA Implementation**: Add two-factor authentication
3. **Session Management**: Implement session timeout and concurrent session limits
4. **Rate Limiting**: Add brute force protection
5. **Audit Logging**: Track authentication events
6. **OAuth Integration**: Add social login options

## References

- [JWT Best Practices](https://tools.ietf.org/html/rfc8949)
- [OWASP Authentication Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [Redis Documentation](https://redis.io/docs/)
- [Express.js Security](https://expressjs.com/en/advanced/best-practice-security.html)
