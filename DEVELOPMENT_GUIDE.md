# 🚀 Frontend Development Guide

## Independent Development Setup

This guide helps you develop the frontend without constantly waiting for your backend developer.

## 🔧 Environment Configuration

Create a `.env.local` file in your project root:

```env
# ===================
# DEVELOPMENT MODE
# ===================

# Set to 'true' for independent development with mock APIs
# Set to 'false' when backend webhooks are ready
NEXT_PUBLIC_USE_MOCK_API=true

# API Configuration
NEXT_PUBLIC_API_BASE_URL=/api

# ===================
# BACKEND WEBHOOKS
# ===================
# Your backend developer will provide these URLs

# Authentication webhooks
NEXT_PUBLIC_SIGNIN_WEBHOOK=https://your-n8n-instance/webhook/signin
NEXT_PUBLIC_SIGNUP_WEBHOOK=https://your-n8n-instance/webhook/signup
NEXT_PUBLIC_VERIFY_WEBHOOK=https://your-n8n-instance/webhook/verify

# ===================
# PRODUCTION CONFIG
# ===================
# n8n Configuration (for server-side)
N8N_BASE_URL=http://localhost:5678
```

## 🎯 Development Workflow

### Phase 1: Independent Development (Current)
```env
NEXT_PUBLIC_USE_MOCK_API=true
```
- Use mock APIs for all authentication
- Test user flows and UI
- No backend dependency

### Phase 2: Backend Integration
```env
NEXT_PUBLIC_USE_MOCK_API=false
NEXT_PUBLIC_SIGNIN_WEBHOOK=https://your-backend-webhook-url
```
- Switch to real backend APIs
- Update webhook URLs as provided
- Test real integration

## 🔑 Authentication Flow

### Expected Backend Contract

**Sign In Request:**
```json
{
  "email": "user@example.com",
  "password": "userpassword"
}
```

**Sign In Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com", 
      "name": "John Doe",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "optional_refresh_token"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "Invalid email or password"
  }
}
```

## 🧪 Testing Credentials (Mock Mode)

Use these credentials to test the mock authentication:

- **Email:** `test@example.com`
- **Password:** `password123`

## 🔄 Switching Between Mock and Real APIs

1. **Development Mode:**
   ```env
   NEXT_PUBLIC_USE_MOCK_API=true
   ```

2. **Backend Integration:**
   ```env
   NEXT_PUBLIC_USE_MOCK_API=false
   NEXT_PUBLIC_SIGNIN_WEBHOOK=https://your-actual-webhook
   ```

## 💡 Benefits

✅ **Independent Development** - Work without backend delays  
✅ **Consistent Interface** - Same code works with mock and real APIs  
✅ **Easy Testing** - Built-in test credentials and flows  
✅ **JWT Handling** - Automatic token management  
✅ **Environment Switching** - Easy toggle between modes  

## 🔧 Adding New API Endpoints

When your backend developer provides new webhooks:

1. Add to environment variables:
   ```env
   NEXT_PUBLIC_NEW_FEATURE_WEBHOOK=https://webhook-url
   ```

2. Add to auth service:
   ```typescript
   async newFeature(data: any) {
     if (this.useMockApi) {
       return this.mockNewFeature(data);
     }
     
     const webhookUrl = process.env.NEXT_PUBLIC_NEW_FEATURE_WEBHOOK;
     // ... implementation
   }
   ```

3. Add mock implementation for development

## 🤝 Communication with Backend Developer

Share this contract with your backend developer:

**Required Webhook Response Format:**
```typescript
interface ApiResponse {
  success: boolean;
  data?: any;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}
```

**JWT Token Requirements:**
- Include user data in payload
- Set proper expiration time
- Use standard claims (sub, email, name, role)

