# AdCopy API Setup Guide

This guide explains how to set up and use the AdCopy API with the mock server implementation.

## Overview

The AdCopy application uses a mock API server built with Next.js API routes that can be easily swapped for real n8n workflows. This allows for rapid frontend development while the backend is being built.

## File Structure

```
app/api/mock/
├── auth/
│   ├── login/route.ts
│   ├── oauth/route.ts
│   └── refresh/route.ts
├── user/
│   ├── profile/route.ts
│   └── changePwd/route.ts
├── agents/
│   └── list/route.ts
├── agent/
│   └── run/route.ts
├── prompt/
│   └── update/route.ts
├── kb/
│   ├── ingest/route.ts
│   ├── list/route.ts
│   ├── delete/route.ts
│   ├── linkAdd/route.ts
│   └── ytIngest/route.ts
├── conversation/
│   ├── list/route.ts
│   ├── get/route.ts
│   ├── rename/route.ts
│   └── route.ts (DELETE)
├── media/
│   ├── list/route.ts
│   └── upload/route.ts
├── org/
│   ├── brand/route.ts
│   └── limits/route.ts
└── usage/
    └── orgMonth/route.ts
```

## Configuration

### Environment Variables

Create a `.env.local` file in your project root:

```bash
# For mock API (development)
NEXT_PUBLIC_API_BASE_URL=/api/mock

# For real API (production)
# NEXT_PUBLIC_API_BASE_URL=https://api.adcopy.com

# For local n8n instance
# NEXT_PUBLIC_API_BASE_URL=http://localhost:5678/webhook
```

### API Configuration

The `lib/api-config.ts` file manages API configuration and provides helper functions:

```typescript
import { API_CONFIG, getApiUrl, isMockApi } from '@/lib/api-config'

// Check if using mock API
if (isMockApi()) {
  console.log('Using mock API server')
}

// Get full API URL
const url = getApiUrl('/auth/login')
```

## Using the Mock API

### Making API Calls

All mock endpoints follow the same pattern as defined in `API.md`. Here's an example:

```typescript
import { getApiUrl, getAuthHeaders } from '@/lib/api-config'

// Login example
async function login(email: string, password: string) {
  const response = await fetch(getApiUrl('/auth/login'), {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ email, password })
  })
  
  return response.json()
}

// Agent run example
async function runAgent(userId: string, agentId: string, message: string) {
  const response = await fetch(getApiUrl('/agent/run'), {
    method: 'POST',
    headers: getAuthHeaders(token),
    body: JSON.stringify({
      user_id: userId,
      agent_id: agentId,
      message: message
    })
  })
  
  return response.json()
}
```

### Sample Data

The mock endpoints use sample data from `lib/sample-data.ts`:

- **Agents**: 5 pre-configured agents (CopyMaster Pro, Social Media Specialist, etc.)
- **Conversations**: 5 sample conversations with detailed chat messages
- **Media Items**: 15 sample media files with metadata

### Response Format

All endpoints return responses in this format:

```typescript
// Success response
{
  success: true,
  data: { /* response data */ }
}

// Error response
{
  success: false,
  error: {
    code: "ERROR_CODE",
    message: "Error description",
    details?: { /* additional error details */ }
  }
}
```

## Switching to Real API

When your n8n workflows are ready:

1. **Update environment variable**:
   ```bash
   NEXT_PUBLIC_API_BASE_URL=https://api.adcopy.com
   ```

2. **Deploy n8n workflows** that match the API contract in `API.md`

3. **Test endpoints** to ensure they return the same response format

4. **Remove mock routes** (optional) once real API is stable

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/oauth` - OAuth authentication
- `POST /api/auth/refresh` - Token refresh

### User Management
- `GET /api/user/profile` - Get user profile
- `POST /api/user/profile` - Update user profile
- `POST /api/user/changePwd` - Change password

### Agent Management
- `GET /api/agents/list` - List available agents
- `POST /api/agent/run` - Run agent conversation
- `POST /api/prompt/update` - Update agent prompt (admin)

### Knowledge Base
- `POST /api/kb/ingest` - Ingest file into KB
- `GET /api/kb/list` - List KB items
- `DELETE /api/kb/delete` - Delete KB item
- `POST /api/kb/linkAdd` - Add web link to KB
- `POST /api/kb/ytIngest` - Ingest YouTube transcript

### Conversations
- `GET /api/conversation/list` - List conversations
- `GET /api/conversation/get` - Get conversation details
- `POST /api/conversation/rename` - Rename conversation
- `DELETE /api/conversation` - Archive conversation

### Media Library
- `GET /api/media/list` - List media items
- `POST /api/media/upload` - Upload media file

### Organization
- `GET /api/org/brand` - Get brand settings
- `POST /api/org/brand` - Update brand settings
- `POST /api/org/limits` - Update organization limits

### Usage
- `GET /api/usage/orgMonth` - Get monthly usage metrics

## Error Handling

The mock API includes comprehensive error handling:

- **400 Bad Request**: Invalid parameters
- **401 Unauthorized**: Missing or invalid token
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **422 Unprocessable Entity**: Missing required fields
- **500 Internal Server Error**: Unexpected errors

## Development Workflow

1. **Start with mock API**: Use `/api/mock` for frontend development
2. **Define API contract**: Update `API.md` as needed
3. **Build n8n workflows**: Implement real endpoints
4. **Test with real API**: Switch to production URL
5. **Deploy**: Remove mock routes when ready

## Testing

You can test the mock API using tools like:

- **Postman**: Import the endpoints from `API.md`
- **curl**: Use the sample requests from `API.md`
- **Frontend**: The mock API works seamlessly with your React components

## Next Steps

1. **Implement real n8n workflows** that match the API contract
2. **Add authentication middleware** to protect endpoints
3. **Implement rate limiting** and error monitoring
4. **Add comprehensive logging** for debugging
5. **Set up CI/CD** for automated testing

## Support

For questions about the API implementation:

1. Check the `API.md` documentation
2. Review the mock endpoint implementations
3. Test with the sample data provided
4. Refer to the PRD for business requirements 