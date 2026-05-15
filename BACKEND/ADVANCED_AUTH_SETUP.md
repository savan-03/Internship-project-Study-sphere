# Advanced Authentication - Quick Setup Guide

## Installation

```bash
# Install dependencies
npm install

# Required packages added:
# - passport, passport-google-oauth20, passport-github2
# - geoip-lite, ua-parser-js, uuid
```

## Configuration

### 1. Update .env

```bash
cp .env.example .env
```

Edit `.env` with:

```env
# Google OAuth
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx
GOOGLE_CALLBACK_URL=http://localhost:8000/api/oauth/google/callback

# GitHub OAuth
GITHUB_CLIENT_ID=xxx
GITHUB_CLIENT_SECRET=xxx
GITHUB_CALLBACK_URL=http://localhost:8000/api/oauth/github/callback

# Session limits
MAX_CONCURRENT_SESSIONS=5
SESSION_TTL=604800
```

### 2. Initialize Passport

File: `src/config/passport.config.js` - Already created with:
- Google OAuth Strategy
- GitHub OAuth Strategy
- Local Strategy (email/password)
- JWT Strategy

### 3. Update Database

Ensure these models are initialized (already created):
- `OAuthAccount` - OAuth credentials storage
- `AuditLog` - Authentication audit trail

## File Structure

```
src/
├── models/
│   ├── oauth-account.model.js        ← OAuth storage
│   └── audit-log.model.js            ← Audit trail
├── services/
│   └── audit.service.js              ← Audit functions
├── utils/
│   ├── session.util.js               ← Session management
│   └── errors.util.js                ← (existing)
├── middlewares/
│   └── sessionLimit.middleware.js     ← Session validation
├── controllers/
│   ├── auth.controller.js            ← (updated with audit)
│   └── oauth.controller.js           ← OAuth login handler
├── routes/
│   ├── auth.routes.js                ← (updated)
│   ├── oauth.routes.js               ← OAuth endpoints
│   └── audit.routes.js               ← Audit endpoints
├── config/
│   └── passport.config.js            ← Passport strategies
└── app.js                            ← (updated with routes)
```

## API Endpoints

### OAuth Login
```bash
# Google
GET http://localhost:8000/api/oauth/google

# GitHub
GET http://localhost:8000/api/oauth/github
```

### OAuth Management
```bash
# Get connected accounts
GET /api/oauth/accounts
Authorization: Bearer {token}

# Connect account
POST /api/oauth/connect/google
Authorization: Bearer {token}

# Disconnect
DELETE /api/oauth/disconnect/google
Authorization: Bearer {token}
```

### Audit & Sessions
```bash
# View audit logs
GET /api/audit/logs

# View active sessions
GET /api/audit/sessions

# View security summary
GET /api/audit/summary

# Export logs
POST /api/audit/export
```

## Testing

### Local Testing
```bash
# 1. Start server
npm run dev

# 2. Test OAuth callback (Google)
curl http://localhost:8000/api/oauth/google/callback?code=test&state=test

# 3. View audit logs
curl http://localhost:8000/api/audit/logs \
  -H "Authorization: Bearer YOUR_TOKEN"

# 4. View sessions
curl http://localhost:8000/api/audit/sessions \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Frontend Testing

```html
<!-- OAuth Login Button -->
<a href="http://localhost:8000/api/oauth/google">
  Login with Google
</a>

<!-- After redirect, should get token in cookies -->
<script>
  // Check if logged in
  const token = document.cookie
    .split('; ')
    .find(row => row.startsWith('accessToken='))
    ?.split('=')[1];
  
  if (token) {
    console.log('Logged in successfully');
  }
</script>
```

## Key Features

### OAuth
- ✅ Google login
- ✅ GitHub login
- ✅ Account linking
- ✅ Account unlinking
- ✅ Provider profile syncing

### Audit Logging
- ✅ All login/logout events
- ✅ Failed attempt tracking
- ✅ Device fingerprinting
- ✅ Geolocation tracking
- ✅ Suspicious activity detection
- ✅ Compliance export

### Session Management
- ✅ Concurrent session limits
- ✅ Device-based control
- ✅ Inactivity timeout
- ✅ Unusual activity detection
- ✅ Session termination

## Common Tasks

### Get User's Audit Logs

```javascript
const auditService = require('../services/audit.service');

const logs = await auditService.getUserAuditLogs(userId, {
  limit: 50,
  action: 'LOGIN'
});
```

### Check Suspicious Activity

```javascript
const suspicious = await auditService.detectSuspiciousActivity(userId);

if (suspicious.isSuspicious) {
  // Take action - send alert, require 2FA, etc.
}
```

### Enforce Session Limits

```javascript
const sessionUtil = require('../utils/session.util');

const result = await sessionUtil.enforceSessionLimit(userId);

if (result.enforced) {
  console.log(`Removed ${result.removedSessionIds.length} old sessions`);
}
```

### Get Session Statistics

```javascript
const stats = await sessionUtil.getSessionStats(userId);

console.log('Active Sessions:', stats.totalActiveSessions);
console.log('Unique Devices:', Object.keys(stats.deviceBreakdown).length);
console.log('Avg Duration:', stats.averageSessionDuration, 'seconds');
```

## Environment Variables Checklist

- [ ] `GOOGLE_CLIENT_ID` - from Google Cloud Console
- [ ] `GOOGLE_CLIENT_SECRET` - from Google Cloud Console
- [ ] `GOOGLE_CALLBACK_URL` - must match console settings
- [ ] `GITHUB_CLIENT_ID` - from GitHub OAuth app
- [ ] `GITHUB_CLIENT_SECRET` - from GitHub OAuth app
- [ ] `GITHUB_CALLBACK_URL` - must match GitHub app settings
- [ ] `MAX_CONCURRENT_SESSIONS` - set to your preferred limit
- [ ] `SESSION_TTL` - session validity period in seconds

## Deployment Checklist

- [ ] Use HTTPS for all OAuth callbacks
- [ ] Set `NODE_ENV=production`
- [ ] Use strong, random JWT secrets
- [ ] Configure production OAuth callback URLs
- [ ] Set up MongoDB backups
- [ ] Set up Redis persistence
- [ ] Monitor audit logs for suspicious activity
- [ ] Set up email alerts for failed logins
- [ ] Test OAuth flows end-to-end
- [ ] Set up log rotation/archival

## Troubleshooting

**OAuth redirect loop**
```bash
# Ensure CALLBACK_URL in .env matches OAuth app settings
# Check CORS is properly configured
# Verify cookies are enabled
```

**Sessions not being tracked**
```bash
# Check Redis is running: redis-cli ping
# Verify sessionId is in cookies
# Check MAX_CONCURRENT_SESSIONS is set
```

**Audit logs empty**
```bash
# Verify MongoDB connection
# Check auditService is being called in login
# Review server logs for errors
```

## Next Steps

1. ✅ Install dependencies: `npm install`
2. ✅ Configure `.env` with OAuth credentials
3. ✅ Start server: `npm run dev`
4. ✅ Test OAuth flows
5. ✅ View audit logs via API
6. ✅ Monitor active sessions
7. ✅ Implement frontend OAuth buttons
8. ✅ Set up alerts for suspicious activity

## Support

For issues or questions:
1. Check error logs: `npm run dev` output
2. Review audit logs: `GET /api/audit/logs`
3. Check database connection: MongoDB shell
4. Verify Redis: `redis-cli`
5. Test OAuth credentials in console

## Files Modified

```
package.json                           (added dependencies)
.env.example                           (added OAuth config)
src/app.js                            (added OAuth/audit routes)
src/controllers/auth.controller.js    (added audit logging)
src/models/                           (added 2 new models)
src/routes/                           (added 2 new routes)
src/services/                         (added audit service)
src/utils/                            (added session util)
src/middlewares/                      (added session middleware)
src/config/                           (added passport config)
```

## Version Info

- Node.js: 14+
- MongoDB: 4.2+
- Redis: 6.0+
- Passport: 0.7.0
- OAuth Strategies: Latest

---

**Module Status: ✅ COMPLETE**

Ready for development and testing!
