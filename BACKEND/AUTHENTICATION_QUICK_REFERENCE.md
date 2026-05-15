# Authentication Quick Reference

## Token Strategy

```
┌─────────────────────────────────────────────────┐
│           USER LOGIN/REGISTER                   │
└──────────────┬──────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────┐
│  Generate Token Pair (JWT)                      │
│  • Access Token: 15 minutes                      │
│  • Refresh Token: 7 days                         │
└──────────────┬──────────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────────┐
│  Store in HTTP-only Cookies + Redis             │
│  • Redis: Session + Refresh Token Tracking     │
│  • Cookies: Automatic with every request       │
└──────────────┬──────────────────────────────────┘
               │
               ▼
         User Authenticated
```

## File Structure

```
BACKEND/src/
├── utils/
│   ├── jwt.util.js          ← JWT generation & verification
│   ├── redis.util.js        ← Redis session management
│   └── errors.util.js       ← Custom error classes
├── middlewares/
│   ├── auth.middleware.js   ← Authentication & authorization
│   └── errorHandler.middleware.js  ← Global error handling
├── controllers/
│   └── auth.controller.js   ← Updated with new utilities
├── routes/
│   └── auth.routes.js       ← Added refresh endpoint
└── app.js                   ← Updated with error handlers
```

## Key Functions

### JWT Utilities (`utils/jwt.util.js`)

```javascript
// Generate access token
const token = jwtUtil.generateAccessToken({ id: userId, role });

// Generate token pair
const { accessToken, refreshToken, expiresIn } = 
  jwtUtil.generateTokenPair({ id: userId, role });

// Verify token
const decoded = jwtUtil.verifyAccessToken(token);

// Extract from request
const token = jwtUtil.extractTokenFromRequest(req);
const refreshToken = jwtUtil.extractRefreshTokenFromRequest(req);
```

### Redis Utilities (`utils/redis.util.js`)

```javascript
// Session management
await redisUtil.storeSession(userId, sessionData, ttl);
const session = await redisUtil.getSession(userId);
await redisUtil.deleteSession(userId);

// Refresh token tracking
await redisUtil.storeRefreshToken(userId, token, ttl);
const exists = await redisUtil.verifyRefreshTokenExists(userId, token);
await redisUtil.revokeRefreshToken(userId);

// User caching
await redisUtil.cacheUserData(userId, userData, ttl);
const user = await redisUtil.getCachedUserData(userId);
await redisUtil.invalidateUserCache(userId);
```

### Error Classes (`utils/errors.util.js`)

```javascript
// Throw custom errors
throw new ValidationError('Invalid email', { email: 'Must be valid' });
throw new AuthenticationError('Invalid credentials');
throw new AuthorizationError('Insufficient permissions');
throw new NotFoundError('User');
throw new ConflictError('Email already exists');
throw new TokenExpiredError('Token has expired');

// Handle errors
const { statusCode, body } = formatErrorResponse(error);
res.status(statusCode).json(body);
```

### Middleware (`middlewares/auth.middleware.js`)

```javascript
// Protect routes
router.get('/profile', authenticate, getProfile);

// Optional auth
router.get('/posts', optionalAuthenticate, getPosts);

// Role-based
router.delete('/admin', authorize('admin'), deleteUser);
router.patch('/mod', moderatorOrAdmin, updateContent);

// Refresh token
router.post('/refresh', refreshTokenMiddleware, refreshToken);
```

## Common Patterns

### Protected Route

```javascript
const { authenticate, authorize } = require('../middlewares/auth.middleware');

router.get('/dashboard', authenticate, authorize('user', 'moderator', 'admin'), (req, res) => {
  // req.user contains: { id, role, username, fullName, email, avatar }
  res.json({ userId: req.user.id });
});
```

### Admin-Only Route

```javascript
const { adminOnly } = require('../middlewares/auth.middleware');

router.delete('/users/:id', adminOnly, deleteUser);
```

### Optional Authentication

```javascript
const { optionalAuthenticate } = require('../middlewares/auth.middleware');

router.get('/posts', optionalAuthenticate, (req, res) => {
  if (req.user) {
    // User is authenticated
  } else {
    // User is not authenticated, but continue
  }
});
```

### Error Handling

```javascript
const { formatErrorResponse, logError } = require('../utils/errors.util');
const { AuthenticationError } = require('../utils/errors.util');

try {
  if (!user) {
    throw new AuthenticationError('User not found');
  }
} catch (err) {
  logError(err, { controller: 'getUser' });
  const { statusCode, body } = formatErrorResponse(err);
  return res.status(statusCode).json(body);
}
```

## Environment Variables

```bash
# JWT
JWT_ACCESS_SECRET=generate-with-crypto.randomBytes(32).toString('hex')
JWT_REFRESH_SECRET=generate-with-crypto.randomBytes(32).toString('hex')
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# Server
NODE_ENV=development
PORT=8000
CLIENT_URL=http://localhost:5173
```

## Response Formats

### Success Response
```json
{
  "success": true,
  "data": {
    "accessToken": "...",
    "refreshToken": "...",
    "expiresIn": 900,
    "user": {...}
  }
}
```

### Error Response
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

## HTTP Status Codes

| Code | Meaning | Use Case |
|------|---------|----------|
| 200 | OK | Successful GET/PATCH |
| 201 | Created | Successful POST (new resource) |
| 400 | Bad Request | Validation error |
| 401 | Unauthorized | Invalid/expired token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource already exists |
| 429 | Too Many Requests | Rate limited |
| 500 | Internal Error | Server error |

## Debugging

### Check Redis Connection
```bash
redis-cli ping
# Should return: PONG

redis-cli keys "*"
# List all keys

redis-cli get session:USER_ID
# View session data
```

### Check JWT Token
```bash
node -e "
const jwt = require('jsonwebtoken');
const token = 'YOUR_TOKEN_HERE';
const decoded = jwt.decode(token);
console.log(decoded);
"
```

### Enable Debug Logging
```bash
DEBUG=* npm run dev
```

## Migration from Old Auth

If updating from old authentication:

1. **Clear Redis**: `redis-cli FLUSHALL`
2. **Update DB**: No breaking changes to User schema
3. **Test**: Run all auth endpoints
4. **Update Frontend**: Change token extraction method

## Performance Tips

1. **Cache frequently accessed users** (1-hour TTL)
2. **Use connection pooling** for Redis
3. **Implement rate limiting** to prevent brute force
4. **Clear old sessions** periodically
5. **Monitor Redis memory** usage

## Security Checklist

- ✅ HTTP-only cookies for tokens
- ✅ HTTPS in production (`secure: true`)
- ✅ CSRF protection (`sameSite: 'strict'`)
- ✅ Password hashing with bcryptjs
- ✅ Token expiration and rotation
- ✅ Session invalidation on logout
- ✅ Error messages don't leak info
- ✅ Rate limiting implemented
- ✅ CORS configured correctly
- ✅ Strong JWT secrets (32+ bytes)
