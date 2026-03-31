# 🔒 SECURITY FIX TODO LIST

**Project:** Yadika Cup Basketball Championship  
**Created:** March 31, 2026  
**Priority:** CRITICAL - Do Before Production Deploy

---

## 📋 TABLE OF CONTENTS

- [Priority 1 - CRITICAL (24 Hours)](#priority-1---critical-24-hours)
- [Priority 2 - HIGH (1 Week)](#priority-2---high-1-week)
- [Priority 3 - MEDIUM (2 Weeks)](#priority-3---medium-2-weeks)
- [Testing Checklist](#testing-checklist)
- [Deployment Checklist](#deployment-checklist)

---

## 🔴 PRIORITY 1 - CRITICAL (24 Hours)

**DO NOT DEPLOY UNTIL THESE ARE COMPLETE!**

### ✅ Task 1.1: Remove Hardcoded Credentials

**File:** `api/auth/index.js`  
**Lines:** 40-49  
**Time:** 30 minutes  
**Risk:** CRITICAL

**Steps:**

- [ ] 1.1.1 Open `api/auth/index.js`
- [ ] 1.1.2 Delete lines 40-41 (validCredentials array)
- [ ] 1.1.3 Delete lines 43-49 (hardcoded user check logic)
- [ ] 1.1.4 Update error message to be more helpful
- [ ] 1.1.5 Test login with database user only
- [ ] 1.1.6 Commit changes

**Before:**

```javascript
// Lines 40-49 - DELETE THIS!
const validCredentials = [
	{ username: 'admin', password: 'yadika2025', role: 'admin', full_name: 'System Administrator' },
	{
		username: 'panitia',
		password: 'tournament2025',
		role: 'organizer',
		full_name: 'Tournament Organizer'
	}
];

const hardcodedUser = validCredentials.find(
	(cred) => cred.username === username && cred.password === password
);

if (!hardcodedUser) {
	return res.status(401).json({
		success: false,
		message: 'Invalid username or password'
	});
}
```

**After:**

```javascript
// Just check database
const { data: user, error } = await supabase
	.from('users')
	.select('*')
	.eq('username', username)
	.eq('is_active', true)
	.single();

if (error || !user) {
	return res.status(401).json({
		success: false,
		message: 'Invalid username or password'
	});
}
```

---

### ✅ Task 1.2: Generate Strong JWT Secret

**Files:** Multiple  
**Time:** 30 minutes  
**Risk:** CRITICAL

**Steps:**

- [ ] 1.2.1 Generate new secret (see command below)
- [ ] 1.2.2 Add to `.env` file (DO NOT COMMIT!)
- [ ] 1.2.3 Add `.env` to `.gitignore`
- [ ] 1.2.4 Update `hooks.server.js` - remove fallback
- [ ] 1.2.5 Update `api/auth/index.js` - remove fallback
- [ ] 1.2.6 Update `api/_lib/auth.js` - remove fallback
- [ ] 1.2.7 Add validation to throw error if missing
- [ ] 1.2.8 Test authentication still works

**Commands:**

```bash
# Generate secure secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Example output: 5f3e8a9b2c1d4e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f
```

**Update `.env`:**

```env
# .env (DO NOT COMMIT THIS FILE!)
JWT_SECRET=5f3e8a9b2c1d4e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f
```

**Update Code:**

```javascript
// BEFORE (❌ WRONG)
const JWT_SECRET = process.env.JWT_SECRET || 'yadika-cup-secret-key-2025';

// AFTER (✅ CORRECT)
if (!process.env.JWT_SECRET) {
	throw new Error('JWT_SECRET environment variable is required for production');
}
const JWT_SECRET = process.env.JWT_SECRET;
```

**Files to Update:**

- [ ] `src/hooks.server.js` (line 12)
- [ ] `api/auth/index.js` (lines 62, 95, 193)
- [ ] `api/_lib/auth.js` (line 20)

---

### ✅ Task 1.3: Add Input Validation & Sanitization

**Files:** All API endpoints  
**Time:** 4 hours  
**Risk:** HIGH

**Steps:**

- [ ] 1.3.1 Install Zod validation library
- [ ] 1.3.2 Create validation schemas file
- [ ] 1.3.3 Add validation to `/api/auth` (login/register)
- [ ] 1.3.4 Add validation to `/api/registrations`
- [ ] 1.3.5 Add validation to `/api/schedule` (score input)
- [ ] 1.3.6 Add validation to `/api/draw`
- [ ] 1.3.7 Test all endpoints with invalid data
- [ ] 1.3.8 Verify error messages are helpful

**Install:**

```bash
npm install zod
```

**Create Schema File:**

```javascript
// src/lib/validators/schemas.js
import { z } from 'zod';

export const loginSchema = z.object({
	username: z.string().min(3).max(50),
	password: z.string().min(1)
});

export const registerUserSchema = z.object({
	username: z
		.string()
		.min(3)
		.max(50)
		.regex(/^[a-zA-Z0-9_]+$/),
	password: z
		.string()
		.min(10)
		.regex(/[A-Z]/, 'Must contain uppercase')
		.regex(/[a-z]/, 'Must contain lowercase')
		.regex(/[0-9]/, 'Must contain number'),
	fullName: z.string().min(3).max(100),
	email: z.string().email()
});

export const registrationSchema = z.object({
	schoolName: z.string().min(3).max(100),
	schoolAddress: z.string().min(10).max(255),
	whatsapp: z.string().regex(/^\+?[0-9]{10,15}$/),
	level: z.enum(['SMA', 'SMP']),
	gender: z.enum(['Putra', 'Putri']),
	players: z
		.array(
			z.object({
				name: z.string().min(3).max(100),
				card_url: z.string().url().optional().nullable()
			})
		)
		.min(5)
		.max(10),
	officials: z.array(z.string()).min(2)
});

export const scoreSchema = z.object({
	matchKey: z.string().regex(/^\d+-(M\d{2}|QF\d|SF\d|F1)-[a-z]+-[a-z]+$/),
	score1: z.number().min(0).max(999),
	score2: z.number().min(0).max(999)
});
```

**Add to API Endpoints:**

```javascript
// api/auth/index.js
import { loginSchema, registerUserSchema } from '$lib/validators/schemas';

// In login handler:
try {
	const validatedData = loginSchema.parse(req.body);
	// Use validatedData instead of req.body
} catch (error) {
	return res.status(400).json({
		success: false,
		message: 'Validation error',
		errors: error.errors
	});
}
```

---

## 🟠 PRIORITY 2 - HIGH (1 Week)

### ✅ Task 2.1: Implement Rate Limiting

**Files:** Backend API  
**Time:** 2 hours  
**Risk:** HIGH

**Steps:**

- [ ] 2.1.1 Install rate limiting package
- [ ] 2.1.2 Create rate limit configurations
- [ ] 2.1.3 Add to `/api/auth` (strict - 5 attempts/15min)
- [ ] 2.1.4 Add to `/api/registrations` (moderate - 20/hour)
- [ ] 2.1.5 Add to all API endpoints (general - 100/15min)
- [ ] 2.1.6 Add rate limit headers to responses
- [ ] 2.1.7 Test rate limiting works
- [ ] 2.1.8 Add documentation for users

**Install:**

```bash
npm install express-rate-limit
```

**Create Config:**

```javascript
// api/_lib/rateLimit.js
import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 5, // 5 attempts
	message: 'Too many login attempts, please try again in 15 minutes',
	standardHeaders: true,
	legacyHeaders: false
});

export const registrationLimiter = rateLimit({
	windowMs: 60 * 60 * 1000, // 1 hour
	max: 20, // 20 registrations per hour
	message: 'Too many registration attempts'
});

export const generalLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100, // 100 requests
	message: 'Too many requests'
});
```

**Apply to Endpoints:**

```javascript
// api/auth/index.js
import { authLimiter } from '../_lib/rateLimit';

export default async function handler(req, res) {
	authLimiter(req, res, async () => {
		// Existing handler code
	});
}
```

---

### ✅ Task 2.2: Fix CORS Configuration

**File:** `api/_lib/cors.js`  
**Time:** 1 hour  
**Risk:** HIGH

**Steps:**

- [ ] 2.2.1 Define allowed origins
- [ ] 2.2.2 Update CORS function to validate origin
- [ ] 2.2.3 Remove wildcard `*` for production
- [ ] 2.2.4 Keep wildcard for development only
- [ ] 2.2.5 Test CORS still works in development
- [ ] 2.2.6 Test CORS works in production

**Update:**

```javascript
// api/_lib/cors.js

const ALLOWED_ORIGINS = {
	production: ['https://yadika-cup.vercel.app', 'https://yadika-cup-basketball.vercel.app'],
	development: ['http://localhost:5173', 'http://localhost:3000']
};

export function cors(req, res) {
	const isDev = process.env.NODE_ENV !== 'production';
	const allowedOrigins = isDev ? ALLOWED_ORIGINS.development : ALLOWED_ORIGINS.production;

	const origin = req.headers.origin;

	if (allowedOrigins.includes(origin)) {
		res.setHeader('Access-Control-Allow-Origin', origin);
	}

	// Rest of CORS headers...
}
```

---

### ✅ Task 2.3: Strengthen Password Policy

**Files:** `api/auth/index.js`, registration forms  
**Time:** 1 hour  
**Risk:** MEDIUM

**Steps:**

- [ ] 2.3.1 Update minimum password length (10 characters)
- [ ] 2.3.2 Add complexity requirements
- [ ] 2.3.3 Add password strength meter in frontend
- [ ] 2.3.4 Update error messages
- [ ] 2.3.5 Test password validation
- [ ] 2.3.6 Update documentation

**Requirements:**

- Minimum 10 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character

**Frontend Validation:**

```javascript
// src/lib/utils/passwordValidator.js
export function validatePassword(password) {
	const errors = [];

	if (password.length < 10) {
		errors.push('Password must be at least 10 characters');
	}
	if (!/[A-Z]/.test(password)) {
		errors.push('Must contain uppercase letter');
	}
	if (!/[a-z]/.test(password)) {
		errors.push('Must contain lowercase letter');
	}
	if (!/[0-9]/.test(password)) {
		errors.push('Must contain number');
	}
	if (!/[!@#$%^&*]/.test(password)) {
		errors.push('Must contain special character');
	}

	return {
		valid: errors.length === 0,
		errors
	};
}
```

---

### ✅ Task 2.4: Add Account Lockout

**Files:** `api/auth/index.js`, database  
**Time:** 3 hours  
**Risk:** MEDIUM

**Steps:**

- [ ] 2.4.1 Add failed_attempts column to users table
- [ ] 2.4.2 Add locked_until column to users table
- [ ] 2.4.3 Create migration SQL file
- [ ] 2.4.4 Update login logic to track failures
- [ ] 2.4.5 Implement lockout after 5 failed attempts
- [ ] 2.4.6 Add 30-minute lockout duration
- [ ] 2.4.7 Add unlock mechanism (admin or time-based)
- [ ] 2.4.8 Test lockout works

**Database Migration:**

```sql
-- Add failed login tracking
ALTER TABLE users
  ADD COLUMN failed_attempts INTEGER DEFAULT 0,
  ADD COLUMN locked_until TIMESTAMP WITH TIME ZONE;

-- Reset failed attempts on successful login
CREATE OR REPLACE FUNCTION reset_failed_attempts(user_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE users
  SET failed_attempts = 0, locked_until = NULL
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql;
```

---

### ✅ Task 2.5: Add Security Headers

**File:** `src/hooks.server.js`  
**Time:** 1 hour  
**Risk:** MEDIUM

**Steps:**

- [ ] 2.5.1 Add Content-Security-Policy header
- [ ] 2.5.2 Add Strict-Transport-Security header
- [ ] 2.5.3 Add Referrer-Policy header
- [ ] 2.5.4 Add Permissions-Policy header
- [ ] 2.5.5 Add X-XSS-Protection header
- [ ] 2.5.6 Test headers with security scanner
- [ ] 2.5.7 Verify no functionality broken

**Add Headers:**

```javascript
// src/hooks.server.js

export async function handle({ event, resolve }) {
	const response = await resolve(event);

	// Existing headers...
	response.headers.set('X-Frame-Options', 'DENY');
	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate');

	// NEW Security Headers:
	response.headers.set(
		'Content-Security-Policy',
		"default-src 'self'; " +
			"script-src 'self' 'unsafe-inline' https://vercel.live; " +
			"style-src 'self' 'unsafe-inline'; " +
			"img-src 'self' data: https:; " +
			"font-src 'self' data:;"
	);

	response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

	response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

	response.headers.set(
		'Permissions-Policy',
		'camera=(), microphone=(), geolocation=(), payment=()'
	);

	response.headers.set('X-XSS-Protection', '1; mode=block');

	return response;
}
```

---

## 🟡 PRIORITY 3 - MEDIUM (2 Weeks)

### ✅ Task 3.1: Migrate to HttpOnly Cookies

**Files:** Frontend auth store, backend auth API  
**Time:** 4 hours  
**Risk:** MEDIUM

**Steps:**

- [ ] 3.1.1 Update backend to set HttpOnly cookies
- [ ] 3.1.2 Remove localStorage from frontend
- [ ] 3.1.3 Update auth store to use cookies
- [ ] 3.1.4 Add CSRF protection
- [ ] 3.1.5 Test authentication flow
- [ ] 3.1.6 Update documentation

---

### ✅ Task 3.2: Add File Upload Validation

**File:** `api/registrations/index.js`  
**Time:** 3 hours  
**Risk:** MEDIUM

**Steps:**

- [ ] 3.2.1 Add file type validation (magic numbers)
- [ ] 3.2.2 Add file size validation (server-side)
- [ ] 3.2.3 Add filename sanitization
- [ ] 3.2.4 Add malware scanning (optional)
- [ ] 3.2.5 Add upload rate limiting
- [ ] 3.2.6 Test with various file types

---

### ✅ Task 3.3: Add Audit Logging

**Files:** Database, API endpoints  
**Time:** 4 hours  
**Risk:** LOW

**Steps:**

- [ ] 3.3.1 Create audit_logs table
- [ ] 3.3.2 Add logging for login attempts
- [ ] 3.3.3 Add logging for data changes
- [ ] 3.3.4 Add logging for admin actions
- [ ] 3.3.5 Create admin view for logs
- [ ] 3.3.6 Add log retention policy

---

### ✅ Task 3.4: Add Monitoring & Alerts

**Time:** 3 hours  
**Risk:** LOW

**Steps:**

- [ ] 3.4.1 Set up error tracking (Sentry)
- [ ] 3.4.2 Add logging for security events
- [ ] 3.4.3 Configure alerts for suspicious activity
- [ ] 3.4.4 Set up uptime monitoring
- [ ] 3.4.5 Create incident response plan

---

## 🧪 TESTING CHECKLIST

After completing fixes, test:

### Authentication

- [ ] Login with valid credentials works
- [ ] Login with invalid credentials fails
- [ ] Account locks after 5 failed attempts
- [ ] JWT tokens are valid
- [ ] JWT tokens expire correctly
- [ ] Logout invalidates token
- [ ] Hardcoded credentials removed (test with old passwords)

### Input Validation

- [ ] XSS attempts are blocked
- [ ] SQL injection attempts fail
- [ ] Invalid email format rejected
- [ ] Invalid phone format rejected
- [ ] File upload validation works
- [ ] Rate limiting triggers correctly

### Security Headers

- [ ] All headers present (use securityheaders.com)
- [ ] CSP doesn't break functionality
- [ ] HSTS enabled
- [ ] CORS only allows specified origins

### Performance

- [ ] Rate limiting doesn't slow legitimate users
- [ ] Validation doesn't add significant latency
- [ ] System handles expected load

---

## 🚀 DEPLOYMENT CHECKLIST

Before deploying to production:

- [ ] All Priority 1 tasks complete
- [ ] All Priority 2 tasks complete
- [ ] Testing checklist complete
- [ ] `.env` file NOT committed to git
- [ ] JWT_SECRET is unique and secure
- [ ] Hardcoded credentials removed
- [ ] Database backup created
- [ ] Rollback plan ready
- [ ] Team notified of deployment
- [ ] Monitoring enabled
- [ ] Error tracking enabled

---

## 📝 PROGRESS TRACKING

### Completed Tasks

| Task                             | Completed | Date       | Verified By  |
| -------------------------------- | --------- | ---------- | ------------ |
| 1.1 Remove hardcoded credentials | ✅        | 2026-03-31 | AI Assistant |
| 1.2 Generate JWT secret          | ⬜        |            |              |
| 1.3 Add input validation         | ⬜        |            |              |
| 2.1 Rate limiting                | ⬜        |            |              |
| 2.2 Fix CORS                     | ⬜        |            |              |
| 2.3 Password policy              | ⬜        |            |              |
| 2.4 Account lockout              | ⬜        |            |              |
| 2.5 Security headers             | ⬜        |            |              |

### Notes

```
Date: ___________
Task: ___________
Notes: _______________________________________________
_______________________________________________________

Date: ___________
Task: ___________
Notes: _______________________________________________
_______________________________________________________
```

---

## 📞 EMERGENCY PROCEDURES

If security breach detected:

1. **IMMEDIATE (0-1 hour):**
   - [ ] Change all admin passwords
   - [ ] Rotate JWT_SECRET
   - [ ] Revoke all active sessions
   - [ ] Enable maintenance mode

2. **SHORT-TERM (1-24 hours):**
   - [ ] Investigate breach source
   - [ ] Document findings
   - [ ] Patch vulnerability
   - [ ] Test fix thoroughly

3. **LONG-TERM (1-7 days):**
   - [ ] Notify affected users
   - [ ] File incident report
   - [ ] Review all security measures
   - [ ] Implement additional safeguards

---

**Last Updated:** March 31, 2026  
**Next Review:** After each deployment  
**Responsible:** Development Team
