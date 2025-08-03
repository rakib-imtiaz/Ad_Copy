# AdCopy API Documentation

This document defines the API contract for the AdCopy web application. All endpoints follow RESTful conventions and return JSON responses.

## Base URL
- Development: `http://localhost:3000/api`
- Production: `https://api.adcopy.com`

## Authentication
All endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

---

## Authentication Endpoints

### POST /api/auth/login
**Request**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user",
      "org_id": "org_456"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "refresh_token_here"
  }
}
```

### POST /api/auth/oauth
**Request**
```json
{
  "provider": "google",
  "code": "oauth_code_here"
}
```

**Response**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user",
      "org_id": "org_456"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "refresh_token_here"
  }
}
```

### POST /api/auth/refresh
**Request**
```json
{
  "refresh_token": "refresh_token_here"
}
```

**Response**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "new_refresh_token_here"
  }
}
```

---

## User Management

### GET /api/user/profile
**Response**
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "name": "John Doe",
    "email": "user@example.com",
    "role": "user",
    "org_id": "org_456",
    "avatar_url": "https://example.com/avatar.jpg",
    "created_at": "2024-01-01T00:00:00Z",
    "settings": {
      "theme": "dark",
      "notifications": {
        "email": true,
        "push": true,
        "copyUpdates": true,
        "systemAlerts": true
      },
      "defaultOutputPreset": "custom",
      "autoSave": true
    }
  }
}
```

### POST /api/user/profile
**Request**
```json
{
  "name": "John Doe",
  "avatar_url": "https://example.com/new-avatar.jpg"
}
```

**Response**
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "name": "John Doe",
    "email": "user@example.com",
    "avatar_url": "https://example.com/new-avatar.jpg",
    "updated_at": "2024-01-15T10:30:00Z"
  }
}
```

### POST /api/user/changePwd
**Request**
```json
{
  "current_password": "oldpassword123",
  "new_password": "newpassword123"
}
```

**Response**
```json
{
  "success": true,
  "message": "Password updated successfully"
}
```

---

## Agent Management

### GET /api/agents/list
**Response**
```json
{
  "success": true,
  "data": [
    {
      "id": "agent_1",
      "name": "CopyMaster Pro",
      "description": "Expert in creating high-converting ad copy for all platforms",
      "prompt": "You are a professional copywriter specializing in creating compelling ad copy that drives conversions.",
      "is_global": true,
      "version": 1,
      "is_active": true,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-15T00:00:00Z",
      "created_by": "admin_1"
    },
    {
      "id": "agent_2",
      "name": "Google Ads Specialist",
      "description": "Optimized Google Ads copy for maximum ROI",
      "prompt": "You create Google Ads copy that maximizes click-through rates and conversions.",
      "is_global": true,
      "version": 1,
      "is_active": true,
      "created_at": "2024-01-02T00:00:00Z",
      "updated_at": "2024-01-16T00:00:00Z",
      "created_by": "admin_1"
    }
  ]
}
```

### POST /api/agent/run
**Request**
```json
{
  "user_id": "user_123",
  "agent_id": "agent_1",
  "conversation_id": "conv_456",
  "message": "I need help creating Facebook ads for our SaaS product",
  "inputs": {
    "product_type": "SaaS",
    "target_audience": "small business owners",
    "platform": "facebook"
  }
}
```

**Response**
```json
{
  "success": true,
  "data": {
    "conversation_id": "conv_456",
    "messages": [
      {
        "id": "msg_789",
        "conversation_id": "conv_456",
        "content": "Perfect! I'll help you create compelling Facebook ads for your SaaS product. Let me start by understanding your key value propositions and then craft some high-converting ad copy.",
        "type": "ai",
        "timestamp": "2024-01-20T10:01:00Z",
        "metadata": {
          "generated_copy": {
            "id": "copy_123",
            "content": "Stop Losing Money on Missed Deadlines - Streamline your projects with our intuitive SaaS platform.",
            "preset": "facebook",
            "template_variables": {
              "product": "SaaS",
              "audience": "small business owners"
            },
            "created_at": "2024-01-20T10:01:00Z",
            "conversation_id": "conv_456",
            "is_saved": false
          }
        }
      }
    ]
  }
}
```

### POST /api/prompt/update
**Request**
```json
{
  "agent_id": "agent_1",
  "prompt": "Updated prompt content here...",
  "version": 2
}
```

**Response**
```json
{
  "success": true,
  "data": {
    "agent_id": "agent_1",
    "version": 2,
    "updated_at": "2024-01-20T10:30:00Z"
  }
}
```

---

## Knowledge Base Management

### POST /api/kb/ingest
**Request**
```json
{
  "user_id": "user_123",
  "file_path": "/uploads/brand-guidelines.pdf",
  "file_type": "pdf",
  "file_size": 2048576,
  "metadata": {
    "title": "Brand Guidelines 2024",
    "tags": ["brand", "guidelines", "2024"]
  }
}
```

**Response**
```json
{
  "success": true,
  "data": {
    "kb_item_id": "kb_123",
    "status": "processing",
    "chunks_created": 15,
    "estimated_completion": "2024-01-20T10:35:00Z"
  }
}
```

### GET /api/kb/list
**Query Parameters**
- `user_id`: string (required)
- `type`: string (optional) - Filter by file type
- `page`: number (optional) - Default: 1
- `limit`: number (optional) - Default: 20

**Response**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "kb_123",
        "user_id": "user_123",
        "filename": "Brand Guidelines 2024.pdf",
        "type": "pdf",
        "size": 2048576,
        "uploaded_at": "2024-01-10T00:00:00Z",
        "content": "Comprehensive brand guidelines including voice, tone, and visual elements",
        "tags": ["brand", "guidelines", "2024", "marketing"],
        "metadata": {
          "pages": 45,
          "category": "branding",
          "status": "indexed"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 15,
      "total_pages": 1
    }
  }
}
```

### DELETE /api/kb/delete
**Request**
```json
{
  "kb_item_id": "kb_123"
}
```

**Response**
```json
{
  "success": true,
  "message": "Knowledge base item deleted successfully"
}
```

### POST /api/kb/linkAdd
**Request**
```json
{
  "user_id": "user_123",
  "url": "https://example.com/blog/industry-trends-2024",
  "title": "Industry Trends 2024",
  "tags": ["blog", "trends", "industry"]
}
```

**Response**
```json
{
  "success": true,
  "data": {
    "kb_item_id": "kb_456",
    "status": "indexed",
    "content": "Latest industry trends and insights for 2024...",
    "metadata": {
      "word_count": 2500,
      "category": "content"
    }
  }
}
```

### POST /api/kb/ytIngest
**Request**
```json
{
  "user_id": "user_123",
  "youtube_url": "https://www.youtube.com/watch?v=example",
  "title": "Product Demo Video",
  "tags": ["demo", "product", "video"]
}
```

**Response**
```json
{
  "success": true,
  "data": {
    "kb_item_id": "kb_789",
    "transcript_id": "transcript_123",
    "status": "indexed",
    "duration": "8:45",
    "segments": 45
  }
}
```

---

## Conversation Management

### GET /api/conversation/list
**Query Parameters**
- `user_id`: string (required)
- `agent_id`: string (optional)
- `page`: number (optional) - Default: 1
- `limit`: number (optional) - Default: 20

**Response**
```json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "id": "conv_123",
        "user_id": "user_123",
        "agent_id": "agent_1",
        "title": "Facebook Ad Campaign for SaaS Product",
        "message_count": 8,
        "created_at": "2024-01-20T10:00:00Z",
        "updated_at": "2024-01-20T10:06:00Z",
        "agent_name": "CopyMaster Pro"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 25,
      "total_pages": 2
    }
  }
}
```

### GET /api/conversation/get
**Query Parameters**
- `id`: string (required)

**Response**
```json
{
  "success": true,
  "data": {
    "id": "conv_123",
    "user_id": "user_123",
    "agent_id": "agent_1",
    "title": "Facebook Ad Campaign for SaaS Product",
    "messages": [
      {
        "id": "msg_1",
        "conversation_id": "conv_123",
        "content": "I need help creating Facebook ads for our SaaS product.",
        "type": "user",
        "timestamp": "2024-01-20T10:00:00Z"
      },
      {
        "id": "msg_2",
        "conversation_id": "conv_123",
        "content": "Perfect! I'll help you create compelling Facebook ads...",
        "type": "ai",
        "timestamp": "2024-01-20T10:01:00Z",
        "metadata": {
          "generated_copy": {
            "id": "copy_123",
            "content": "Stop Losing Money on Missed Deadlines...",
            "preset": "facebook",
            "template_variables": {
              "product": "SaaS",
              "audience": "small business owners"
            },
            "created_at": "2024-01-20T10:01:00Z",
            "conversation_id": "conv_123",
            "is_saved": false
          }
        }
      }
    ],
    "pinned_messages": ["msg_2"],
    "knowledge_base_snapshot": {
      "id": "kb_123",
      "user_id": "user_123",
      "company_name": "ProjectFlow SaaS",
      "service": "Project Management Software",
      "industry": "SaaS",
      "niche": "Small Business Project Management"
    },
    "attached_media": ["media_1", "media_3"],
    "created_at": "2024-01-20T10:00:00Z",
    "updated_at": "2024-01-20T10:06:00Z"
  }
}
```

### POST /api/conversation/rename
**Request**
```json
{
  "conversation_id": "conv_123",
  "title": "Updated Conversation Title"
}
```

**Response**
```json
{
  "success": true,
  "data": {
    "conversation_id": "conv_123",
    "title": "Updated Conversation Title",
    "updated_at": "2024-01-20T11:00:00Z"
  }
}
```

### DELETE /api/conversation
**Request**
```json
{
  "conversation_id": "conv_123"
}
```

**Response**
```json
{
  "success": true,
  "message": "Conversation archived successfully"
}
```

---

## Media Library

### GET /api/media/list
**Query Parameters**
- `user_id`: string (required)
- `type`: string (optional) - Filter by media type
- `page`: number (optional) - Default: 1
- `limit`: number (optional) - Default: 20

**Response**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "media_1",
        "user_id": "user_123",
        "filename": "Brand Guidelines 2024.pdf",
        "type": "pdf",
        "size": 2048576,
        "uploaded_at": "2024-01-10T00:00:00Z",
        "content": "Comprehensive brand guidelines including voice, tone, and visual elements",
        "tags": ["brand", "guidelines", "2024", "marketing"],
        "metadata": {
          "pages": 45,
          "category": "branding"
        }
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 15,
      "total_pages": 1
    }
  }
}
```

### POST /api/media/upload
**Request** (multipart/form-data)
```
file: [binary file data]
user_id: "user_123"
tags: "brand,guidelines,2024"
```

**Response**
```json
{
  "success": true,
  "data": {
    "media_id": "media_123",
    "filename": "Brand Guidelines 2024.pdf",
    "size": 2048576,
    "uploaded_at": "2024-01-20T12:00:00Z",
    "status": "uploaded"
  }
}
```

---

## Organization & Brand Settings

### GET /api/org/brand
**Response**
```json
{
  "success": true,
  "data": {
    "id": "brand_123",
    "org_id": "org_456",
    "colors": {
      "primary": "#3B82F6",
      "secondary": "#1F2937",
      "accent": "#F59E0B",
      "background": "#FFFFFF",
      "text": "#111827"
    },
    "logo": "https://example.com/logo.png",
    "wordmark": "https://example.com/wordmark.png",
    "voice_tone": {
      "style": "professional yet approachable",
      "guidelines": [
        "Use active voice",
        "Keep sentences concise",
        "Focus on benefits over features"
      ]
    },
    "created_at": "2024-01-01T00:00:00Z",
    "updated_at": "2024-01-15T00:00:00Z"
  }
}
```

### POST /api/org/brandUpd
**Request**
```json
{
  "colors": {
    "primary": "#3B82F6",
    "secondary": "#1F2937",
    "accent": "#F59E0B"
  },
  "voice_tone": {
    "style": "professional yet approachable",
    "guidelines": [
      "Use active voice",
      "Keep sentences concise",
      "Focus on benefits over features"
    ]
  }
}
```

**Response**
```json
{
  "success": true,
  "data": {
    "brand_settings_id": "brand_123",
    "updated_at": "2024-01-20T12:30:00Z"
  }
}
```

### GET /api/usage/orgMonth
**Query Parameters**
- `org_id`: string (required)
- `month`: string (optional) - Format: YYYY-MM

**Response**
```json
{
  "success": true,
  "data": {
    "org_id": "org_456",
    "month": "2024-01",
    "metrics": {
      "total_conversations": 150,
      "total_messages": 1200,
      "total_copies_generated": 450,
      "kb_items_uploaded": 25,
      "media_items_uploaded": 15
    },
    "limits": {
      "max_conversations_per_month": 1000,
      "max_kb_storage_mb": 500,
      "max_media_storage_mb": 1000
    },
    "usage_percentage": {
      "conversations": 15,
      "kb_storage": 5,
      "media_storage": 1.5
    }
  }
}
```

### POST /api/org/limits
**Request**
```json
{
  "org_id": "org_456",
  "limits": {
    "max_conversations_per_month": 1000,
    "max_kb_storage_mb": 500,
    "max_media_storage_mb": 1000
  }
}
```

**Response**
```json
{
  "success": true,
  "data": {
    "org_id": "org_456",
    "limits": {
      "max_conversations_per_month": 1000,
      "max_kb_storage_mb": 500,
      "max_media_storage_mb": 1000
    },
    "updated_at": "2024-01-20T13:00:00Z"
  }
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": {
      "field": "email",
      "issue": "Email format is invalid"
    }
  }
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired token"
  }
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Insufficient permissions"
  }
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found"
  }
}
```

### 422 Unprocessable Entity
```json
{
  "success": false,
  "error": {
    "code": "MISSING_FIELDS",
    "message": "Required fields missing for agent execution",
    "details": {
      "missing_fields": ["product_type", "target_audience"]
    }
  }
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred"
  }
}
```

---

## Rate Limiting

- Authentication endpoints: 10 requests per minute
- Agent execution: 30 requests per minute
- File uploads: 5 requests per minute
- All other endpoints: 100 requests per minute

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642680000
```

---

## Webhook Endpoints (for n8n Integration)

### POST /api/webhook/kb-processing-complete
**Request**
```json
{
  "kb_item_id": "kb_123",
  "status": "completed",
  "chunks_created": 15,
  "processing_time": 45.2
}
```

### POST /api/webhook/conversation-updated
**Request**
```json
{
  "conversation_id": "conv_123",
  "message_count": 8,
  "last_message_at": "2024-01-20T10:06:00Z"
}
```

---

## Version History

- **v1.0.0** (2024-01-20): Initial API specification
- **v1.1.0** (2024-01-25): Added webhook endpoints for n8n integration
- **v1.2.0** (2024-02-01): Added usage tracking and limits endpoints 