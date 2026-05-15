# Advanced Authentication Module - Complete Documentation

## Overview

This module implements three advanced authentication features:
1. **OAuth Integration** (Google & GitHub)
2. **Audit Logging** (Track all auth events)
3. **Session Limits** (Max concurrent sessions per user)

---

## 1. OAuth Integration

### Setup

#### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials (Web application)
5. Add authorized redirect URIs:
   - `http://localhost:8000/api/oauth/google/callback` (development)
   - `https://yourdomain.com/api/oauth/google/callback` (production)
6. Copy Client ID and Secret to `.env`

```env
GOOGLE_CLIENT_ID=your_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_CALLBACK_URL=http://localhost:8000/api/oauth/google/callback
```

#### GitHub OAuth

1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Click "New OAuth App"
3. Set:
   - Authorization callback URL: `http://localhost:8000/api/oauth/github/callback`
4. Copy Client ID and Secret to `.env`

```env
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:8000/api/oauth/github/callback
```

### OAuth API Endpoints

#### Initiate Google Login
```bash
GET /api/oauth/google
?redirect=http://localhost:5173/dashboard

# User is redirected to Google login
# After login, redirected to callback endpoint
```

#### Google Callback (Automatic)
```bash
GET /api/oauth/google/callback?code=...&state=...

# Returns:
{
  "success": true,
  "data": {
    "accessToken": "...",
    "refreshToken": "...",
    "sessionId": "...",
    "expiresIn": 900,
    "user": {...}
  }
}
```

#### Initiate GitHub Login
```bash
GET /api/oauth/github
?redirect=http://localhost:5173/dashboard
```

#### GitHub Callback (Automatic)
```bash
GET /api/oauth/github/callback?code=...&state=...

# Same response as Google
```

#### Connect OAuth to Existing Account
```bash
POST /api/oauth/connect/google
Authorization: Bearer {accessToken}

# Redirects to Google login, then connects account
```

#### Get Connected OAuth Accounts
```bash
GET /api/oauth/accounts
Authorization: Bearer {accessToken}

Response:
{
  "success": true,
  "data": {
    "accounts": [
      {
        "_id": "...",
        "provider": "google",
        "email": "user@gmail.com",
        "displayName": "John Doe",
        "isVerified": true,
        "lastUsedAt": "2026-05-04T10:30:00Z"
      }
    ],
    "total": 1
  }
}
```

#### Get Specific OAuth Account
```bash
GET /api/oauth/accounts/google
Authorization: Bearer {accessToken}

Response: OAuth account details
```

#### Disconnect OAuth Account
```bash
DELETE /api/oauth/disconnect/google
Authorization: Bearer {accessToken}

Response:
{
  "success": true,
  "message": "google account disconnected successfully"
}
```

### OAuth Models

**OAuthAccount Model** (`oauth-account.model.js`):
```
- userId (reference to User)
- provider (enum: 'google', 'github')
- providerUserId (OAuth provider's user ID)
- email
- displayName
- profileUrl
- profilePicture
- accessToken
- refreshToken
- tokenExpiry
- scope
- isVerified
- lastUsedAt
- timestamps
```

---

## 2. Audit Logging

### Features

- **Login/Logout Tracking**: All authentication events logged
- **Device Information**: Browser, OS, device type
- **Location Tracking**: Geolocation from IP address
- **Failed Attempts**: Track failed login attempts
- **Suspicious Activity Detection**: Flag unusual patterns
- **Compliance Export**: CSV export for audits

### Audit Log Fields

```
- userId
- action (LOGIN, LOGOUT, LOGIN_FAILED, etc.)
- status (SUCCESS, FAILED, ATTEMPTED)
- email, username
- ipAddress
- userAgent
- deviceInfo (browser, OS, device, version)
- location (country, region, city, coordinates)
- sessionId
- provider (local, google, github)
- reason (for failures)
- details (additional metadata)
- severity (LOW, MEDIUM, HIGH, CRITICAL)
- flagged (auto-flagged suspicious activity)
- timestamps
```

### Audit API Endpoints

#### Get User Audit Logs
```bash
GET /api/audit/logs?limit=50&skip=0&action=LOGIN
Authorization: Bearer {accessToken}

Response:
{
  "success": true,
  "data": {
    "logs": [...],
    "limit": 50,
    "skip": 0
  }
}
```

#### Get Recent Activity
```bash
GET /api/audit/activity/recent?hours=24
Authorization: Bearer {accessToken}

# Returns activity from last 24 hours
```

#### Get Audit Summary
```bash
GET /api/audit/summary?daysBack=30
Authorization: Bearer {accessToken}

Response:
{
  "success": true,
  "data": {
    "summary": {
      "totalLogins": 45,
      "failedLogins": 2,
      "uniqueDevices": 3,
      "newIPAddresses": 1,
      "suspiciousLogs": 0,
      "securityScore": 98
    },
    "daysBack": 30
  }
}
```

#### Get Login Sessions
```bash
GET /api/audit/sessions
Authorization: Bearer {accessToken}

# Returns all login sessions with device/location info
```

#### Get Failed Login Attempts
```bash
GET /api/audit/failed-logins?minutes=60
Authorization: Bearer {accessToken}

# Returns failed attempts from last 60 minutes
```

#### Detect Suspicious Activity
```bash
GET /api/audit/suspicious
Authorization: Bearer {accessToken}

Response:
{
  "success": true,
  "data": {
    "failedLoginCount": 2,
    "successfulLoginCount": 1,
    "isSuspicious": false
  }
}
```

#### Export Audit Logs
```bash
POST /api/audit/export
Authorization: Bearer {accessToken}
Content-Type: application/json

{
  "startDate": "2026-04-01T00:00:00Z",
  "endDate": "2026-05-04T23:59:59Z"
}

# Returns CSV file for compliance
```

### Audit Service Functions

```javascript
// Log authentication event
await auditService.logAuthEvent(req, 'LOGIN', {
  userId: user._id,
  email: user.email,
  status: 'SUCCESS',
  sessionId: sessionId,
  provider: 'google'
});

// Get user logs
const logs = await auditService.getUserAuditLogs(userId, {
  limit: 50,
  action: 'LOGIN'
});

// Detect suspicious activity
const suspicious = await auditService.detectSuspiciousActivity(userId);

// Get failed attempts
const attempts = await auditService.getFailedLoginAttempts(userId, 60);

// Check if IP is new
const isNew = await auditService.isNewIP(userId, ipAddress);

// Calculate security score
const score = auditService.calculateSecurityScore(logins, failures, suspicious);
```

---

## 3. Session Limits

### Features

- **Concurrent Session Control**: Limit max sessions per user
- **Session Tracking**: Redis-backed session storage
- **Activity Monitoring**: Track session activity
- **Session Termination**: End sessions on logout
- **Unusual Activity Detection**: Flag risky patterns
- **Device-based Control**: Terminate by device

### Configuration

```env
# Maximum concurrent sessions per user
MAX_CONCURRENT_SESSIONS=5

# Session TTL in seconds (7 days default)
SESSION_TTL=604800
```

### Session API Endpoints

#### Get Active Sessions (via Audit)
```bash
GET /api/audit/sessions
Authorization: Bearer {accessToken}

Response:
{
  "success": true,
  "data": {
    "sessions": [
      {
        "id": "session_id",
        "provider": "google",
        "ipAddress": "192.168.1.1",
        "location": {
          "city": "New York",
          "country": "US"
        },
        "deviceInfo": {
          "browser": "Chrome",
          "os": "Windows"
        },
        "createdAt": "2026-05-04T10:00:00Z"
      }
    ],
    "total": 3
  }
}
```

### Session Utilities

```javascript
const sessionUtil = require('../utils/session.util');

// Create session
const { sessionId } = await sessionUtil.createSession(userId, {
  provider: 'google',
  ipAddress: '192.168.1.1',
  location: 'New York'
});

// Get all user sessions
const sessions = await sessionUtil.getUserSessions(userId);

// Update activity
await sessionUtil.updateSessionActivity(sessionId);

// Enforce limits (auto-remove oldest if over limit)
const result = await sessionUtil.enforceSessionLimit(userId);

// Terminate specific session
await sessionUtil.terminateSession(sessionId);

// Terminate all sessions
await sessionUtil.terminateAllSessions(userId);

// Get session statistics
const stats = await sessionUtil.getSessionStats(userId);

// Detect unusual activity
const unusual = await sessionUtil.detectUnusualActivity(userId);
```

### Session Limit Middleware

```javascript
// Check session validity and enforce limits
app.use(checkSessionLimit);

// Validate session on protected routes
app.use('/api/protected', validateSession, handler);
```

---

## Audit Log Actions

| Action | When | Severity |
|--------|------|----------|
| REGISTER | New account created | LOW |
| LOGIN | Successful login | LOW |
| LOGOUT | User logout | LOW |
| LOGIN_FAILED | Failed login attempt | MEDIUM |
| TOKEN_REFRESH | Token refreshed | LOW |
| PASSWORD_CHANGE | Password updated | MEDIUM |
| PROFILE_UPDATE | Profile modified | LOW |
| OAUTH_CONNECT | OAuth account linked | MEDIUM |
| OAUTH_DISCONNECT | OAuth account unlinked | MEDIUM |
| SESSION_CREATE | Session created | LOW |
| SESSION_TERMINATE | Session ended | LOW |
| SESSION_LIMIT_REACHED | Session limit enforced | MEDIUM |
| 2FA_ENABLE | 2FA enabled | HIGH |
| 2FA_DISABLE | 2FA disabled | HIGH |
| ACCOUNT_LOCKED | Account locked | CRITICAL |
| ACCOUNT_UNLOCKED | Account unlocked | HIGH |
| ROLE_CHANGE | User role changed | HIGH |
| EMAIL_CHANGE | Email updated | MEDIUM |
| DEVICE_ADDED | New device registered | LOW |
| DEVICE_REMOVED | Device unregistered | LOW |

---

## Security Considerations

### OAuth Security
- ✅ State parameter validation (built-in to Passport)
- ✅ PKCE flow support (for mobile)
- ✅ Secure token storage (HTTP-only cookies)
- ✅ Token refresh handling
- ✅ Account linking protection (can't link to another user's account)

### Audit Security
- ✅ Immutable audit logs (cannot be modified)
- ✅ Automatic TTL (90 days default)
- ✅ IP geolocation tracking
- ✅ Device fingerprinting
- ✅ Suspicious activity flagging

### Session Security
- ✅ UUID-based session IDs
- ✅ Concurrent session limits
- ✅ Inactivity timeout (15 minutes)
- ✅ Device tracking
- ✅ Location-based detection

---

## Integration Examples

### Frontend - Google Login

```javascript
// React component
const GoogleLoginButton = () => {
  const handleLogin = () => {
    window.location.href = 'http://localhost:8000/api/oauth/google';
  };

  return <button onClick={handleLogin}>Login with Google</button>;
};
```

### Frontend - GitHub Login

```javascript
const GitHubLoginButton = () => {
  const handleLogin = () => {
    window.location.href = 'http://localhost:8000/api/oauth/github';
  };

  return <button onClick={handleLogin}>Login with GitHub</button>;
};
```

### Frontend - Connect Account

```javascript
const ConnectOAuth = ({ provider }) => {
  const handleConnect = () => {
    window.location.href = `http://localhost:8000/api/oauth/connect/${provider}`;
  };

  return <button onClick={handleConnect}>Connect {provider}</button>;
};
```

### Frontend - View Sessions

```javascript
const ActiveSessions = () => {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    fetch('/api/audit/sessions', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(r => r.json())
    .then(data => setSessions(data.data.sessions));
  }, []);

  return sessions.map(s => (
    <div key={s.id}>
      <p>{s.deviceInfo.browser} on {s.location.city}</p>
    </div>
  ));
};
```

---

## Database Models

### OAuthAccount
- Stores OAuth provider credentials
- Links OAuth profiles to users
- Tracks token expiry and refresh

### AuditLog
- Immutable audit trail
- Indexed by userId, action, timestamp
- Auto-expires after 90 days
- TTL index for automatic cleanup

---

## Best Practices

1. **Always use HTTPS** in production for OAuth
2. **Rotate OAuth tokens** regularly using refresh tokens
3. **Monitor audit logs** for suspicious patterns
4. **Set appropriate session limits** (5-10 is typical)
5. **Enable 2FA** for additional security
6. **Review failed login attempts** regularly
7. **Check for new IP addresses** in audit logs
8. **Export audit logs** regularly for compliance
9. **Test OAuth** in development first
10. **Keep secrets secure** in environment variables

---

## Troubleshooting

### OAuth redirect loop
- Check `GOOGLE_CALLBACK_URL` matches console settings
- Ensure cookies are enabled
- Check CORS configuration

### Session not created
- Verify Redis is running
- Check `MAX_CONCURRENT_SESSIONS` setting
- Review server logs

### Audit logs not appearing
- Verify MongoDB connection
- Check user ID is correct
- Ensure `auditService.logAuthEvent()` is called

### Security score too low
- Reduce failed login attempts
- Check for unusual device/location combos
- Review and resolve flagged logs

---

## Performance Tips

1. **Index audit logs** by userId and createdAt
2. **Cache session data** in Redis with TTL
3. **Use pagination** when fetching audit logs
4. **Archive old logs** monthly for compliance
5. **Monitor Redis memory** usage
6. **Clean up expired sessions** periodically

---

## Compliance & Regulations

- **GDPR**: Audit logs retained for 90 days
- **SOC 2**: All authentication events logged
- **PCI DSS**: Sensitive data encrypted
- **HIPAA**: Secure session management
- **ISO 27001**: Access controls implemented

---

## Next Steps

1. Configure OAuth credentials
2. Test OAuth flows in development
3. Set up audit log monitoring
4. Adjust session limits for your app
5. Implement 2FA using audit logs
6. Set up compliance exports
7. Monitor and respond to alerts
