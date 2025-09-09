/**
 * Authentication Service
 * Handles both mock and real authentication
 * Switch between modes using environment variables
 */

interface LoginCredentials {
  email: string;
  password: string;
}

interface SignupData {
  email: string;
  password: string;
}

interface AuthResponse {
  success: boolean;
  data?: {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
    };
    token: string;
    refreshToken?: string;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

interface VerificationResponse {
  success: boolean;
  verification_code?: string;
  data?: any;
  error?: {
    code: string;
    message: string;
  };
}

class AuthService {
  private baseUrl: string;
  private apiEndpoints: {
    registration: string;
    login: string;
    verifyCode: string;
    refreshToken: string;
    chat: string;
  };

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';
    
    // Define API endpoints to use
    // Use proxied API endpoints instead of directly accessing n8n webhooks
    // This approach allows for better error handling and security
    this.apiEndpoints = {
      registration: `${this.baseUrl}/auth/register`,
      login: `${this.baseUrl}/auth/signin`,
      verifyCode: `${this.baseUrl}/auth/verify`,
      refreshToken: `${this.baseUrl}/auth/refresh`,
      chat: `${this.baseUrl}/chat`
    };
  }

  /**
   * Sign Up User
   */
  async signUp(userData: SignupData): Promise<AuthResponse> {

    try {
      // Use our API endpoint which forwards to n8n webhook
      const response = await fetch(this.apiEndpoints.registration, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
        }),
      });

      const data = await response.json();
      
      // Check if registration failed due to user already existing
      if (!response.ok) {
        if (response.status === 409) {
          if (data.error?.code === 'USER_EXISTS' || data.error?.code === 'USER_ALREADY_VERIFIED') {
            return {
              success: false,
              error: {
                code: data.error.code,
                message: data.error.message || 'A user with this email already exists.'
              }
            };
          }
        }
        
        return {
          success: false,
          error: {
            code: data.error?.code || 'REGISTRATION_FAILED',
            message: data.error?.message || 'Registration failed'
          }
        };
      }

      return {
        success: true,
        data: {
          user: {
            id: `temp_${Date.now()}`,
            email: userData.email,
            name: 'User', // Placeholder, will be updated after verification
            role: 'user'
          },
          token: '', // Token will be provided after verification
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Failed to connect to authentication service',
          details: error.message
        }
      };
    }
  }

  /**
   * Sign In User
   * Backend expects: { email, password } in body
   * Backend returns: JWT token to be stored
   */
  async signIn(credentials: LoginCredentials): Promise<AuthResponse> {

    try {
      // Use our API endpoint which forwards to n8n webhook
      const response = await fetch(this.apiEndpoints.login, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password
        }),
        credentials: 'include', // Important for cookies
      });

      // Check for user not found (404 status)
      if (response.status === 404) {
        return {
          success: false,
          error: {
            code: 'USER_NOT_FOUND',
            message: 'User not found. Please check your email or register.'
          }
        };
      }

      // Check for account frozen (423 status)
      if (response.status === 423) {
        const data = await response.json();
        return {
          success: false,
          error: {
            code: data.error?.code || 'ACCOUNT_FROZEN',
            message: data.error?.message || 'Your account has been temporarily frozen.'
          }
        };
      }

      // Check for authentication failure (401 status)
      if (response.status === 401) {
        const data = await response.json();
        return {
          success: false,
          error: {
            code: data.error?.code || 'INVALID_CREDENTIALS',
            message: data.error?.message || 'Invalid email or password. Please try again.'
          }
        };
      }

      const data = await response.json();
      
      // Store JWT token if successful
      if (data.success && data.data?.accessToken) {
        console.log('🔐 Storing access token from successful login')
        this.storeAuthToken(data.data.accessToken);
        
        // The refresh token is in the cookies, handled by the browser
        // We don't need to manually extract it
      } else if (data.success && data.data?.token) {
        console.log('🔐 Storing token from successful login')
        this.storeAuthToken(data.data.token);
      } else {
        console.log('🔐 No token found in successful login response')
      }

      return {
        success: true,
        data: {
          user: data.data.user,
          token: data.data.accessToken || data.data.token
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Failed to connect to authentication service',
          details: error.message
        }
      };
    }
  }

  /**
   * Verify Email
   */
  async verifyEmail(email: string): Promise<VerificationResponse> {

    try {
      // We're not actually sending the code in this case, just checking existence
      // The actual verification will be handled by the next method
      return {
        success: true,
        verification_code: 'sent' // The actual code is generated and sent by n8n
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Failed to verify email'
        }
      };
    }
  }
  
  /**
   * Refresh Access Token
   */
  async refreshToken(refreshToken: string): Promise<AuthResponse> {


    try {
      // Get current access token to send with refresh request
      const currentAccessToken = this.getAuthToken();
      
      const response = await fetch(this.apiEndpoints.refreshToken, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(currentAccessToken && { 'Authorization': `Bearer ${currentAccessToken}` })
        },
        body: JSON.stringify({ 
          refreshToken,
          accessToken: currentAccessToken // Send access token to n8n
        }),
        credentials: 'include', // Important for cookies
      });

      if (!response.ok) {
        if (response.status === 401) {
          return {
            success: false,
            error: {
              code: 'INVALID_REFRESH_TOKEN',
              message: 'Invalid or expired refresh token'
            }
          };
        }
        
        return {
          success: false,
          error: {
            code: 'REFRESH_FAILED',
            message: 'Failed to refresh token'
          }
        };
      }

      const data = await response.json();
      
      if (data.success && data.data?.accessToken) {
        this.storeAuthToken(data.data.accessToken);
      }

      return {
        success: true,
        data: {
          user: data.data?.user,
          token: data.data?.accessToken
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Failed to refresh token',
          details: error.message
        }
      };
    }
  }

  /**
   * Send chat message to n8n
   */
  async sendChatMessage(chatData: {
    email: string;
    sessionId: number;
    agentId: string;
    userPrompt: string;
  }): Promise<any> {

    try {
      const accessToken = this.getAuthToken();
      
      if (!accessToken) {
        return {
          success: false,
          error: {
            code: 'NO_TOKEN',
            message: 'No access token available. Please login again.'
          }
        };
      }

      const response = await fetch(this.apiEndpoints.chat, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          email: chatData.email,
          sessionId: chatData.sessionId,
          agentId: chatData.agentId,
          userPrompt: chatData.userPrompt
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token might be expired, try to refresh
          const refreshToken = this.getRefreshToken();
          if (refreshToken) {
            const refreshResult = await this.refreshToken(refreshToken);
            if (refreshResult.success) {
              // Retry the chat request with new token
              return this.sendChatMessage(chatData);
            }
          }
          
          return {
            success: false,
            error: {
              code: 'INVALID_TOKEN',
              message: 'Invalid or expired access token'
            }
          };
        }
        
        return {
          success: false,
          error: {
            code: 'CHAT_FAILED',
            message: 'Failed to send chat message'
          }
        };
      }

      const data = await response.json();
      return data;
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Failed to connect to chat service',
          details: error.message
        }
      };
    }
  }

  /**
   * Verify the code sent to user's email
   */
  async verifyCode(email: string, code: string): Promise<AuthResponse> {
    console.log('=== AUTH SERVICE VERIFY CODE START ===');
    console.log('Email:', email);
    console.log('Code:', code);

    try {
      console.log('Calling verification API endpoint:', this.apiEndpoints.verifyCode);
      const response = await fetch(this.apiEndpoints.verifyCode, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email,
          verification_code: code
        }),
      });

      console.log('=== AUTH SERVICE RESPONSE ===');
      console.log('Response Status:', response.status);
      console.log('Response OK:', response.ok);
      console.log('Response Headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        console.log('Response not OK, handling error...');
        // Try to get the specific error from the response
        try {
          const errorData = await response.json();
          console.log('Error Data:', JSON.stringify(errorData, null, 2));
          console.log('Error Code:', errorData.error?.code);
          console.log('Error Message:', errorData.error?.message);
          
          const result = {
            success: false,
            error: {
              code: errorData.error?.code || 'VERIFICATION_FAILED',
              message: errorData.error?.message || 'Failed to verify code. Please try again.'
            }
          };
          console.log('Returning error result:', JSON.stringify(result, null, 2));
          return result;
        } catch (e) {
          console.log('Failed to parse error response:', e);
          // If we can't parse the error response, return a generic error
          const result = {
            success: false,
            error: {
              code: 'VERIFICATION_FAILED',
              message: 'Failed to verify code. Please try again.'
            }
          };
          console.log('Returning generic error result:', JSON.stringify(result, null, 2));
          return result;
        }
      }

      console.log('Response OK, parsing success data...');
      const data = await response.json();
      console.log('Success Data:', JSON.stringify(data, null, 2));
      
      // If verification is successful, data should contain user info and tokens
      if (data.success) {
        console.log('Verification successful, storing token...');
        if (data.token) {
          this.storeAuthToken(data.token);
          console.log('Token stored successfully');
        }
        
        const result = {
          success: true,
          data: {
            user: data.user || {
              id: `user_${Date.now()}`,
              email: email,
              name: 'User', // Placeholder, will be updated after verification
              role: 'user'
            },
            token: data.token || ''
          }
        };
        console.log('Returning success result:', JSON.stringify(result, null, 2));
        return result;
      }
      
      console.log('Verification failed - invalid code');
      const result = {
        success: false,
        error: {
          code: 'INVALID_CODE',
          message: data.message || 'Invalid verification code'
        }
      };
      console.log('Returning invalid code result:', JSON.stringify(result, null, 2));
      return result;
    } catch (error: any) {
      console.error('=== AUTH SERVICE CATCH ERROR ===');
      console.error('Error:', error);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      const result = {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Failed to connect to verification service',
          details: error.message
        }
      };
      console.log('Returning network error result:', JSON.stringify(result, null, 2));
      return result;
    }
  }

  /**
   * JWT Token Management
   */
  storeAuthToken(token: string): void {
    if (typeof window !== 'undefined') {
      // For production, consider using in-memory storage or HTTP-only cookies
      // For development, localStorage is fine
      localStorage.setItem('auth_token', token);
    }
  }

  storeRefreshToken(refreshToken: string): void {
    if (typeof window !== 'undefined') {
      // For production, this should be stored in HTTP-only cookies
      // For development, localStorage is fine
      localStorage.setItem('refresh_token', refreshToken);
    }
  }

  getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('auth_token');
    }
    return null;
  }

  getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('refresh_token');
    }
    return null;
  }

  clearTokens(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('refresh_token');
    }
  }

  // Alternative secure storage methods for production
  private storeTokenSecurely(token: string, tokenType: 'access' | 'refresh'): void {
    if (typeof window !== 'undefined') {
      // Option 1: In-memory storage (cleared on page refresh)
      if (tokenType === 'access') {
        // Store in a closure variable or React state
        this._accessToken = token;
      }
      
      // Option 2: HTTP-only cookies (requires server-side implementation)
      // This would be set by the server in the response headers
      
      // Option 3: sessionStorage (cleared when tab closes)
      sessionStorage.setItem(`${tokenType}_token`, token);
    }
  }

  private _accessToken: string | null = null; // In-memory storage for access token

  /**
   * Check if user is authenticated with client-side validation
   * Note: Full security also requires server-side validation via the AuthContext
   */
  isAuthenticated(): boolean {
    const token = this.getAuthToken();
    console.log('🔍 isAuthenticated check - token exists:', !!token);
    if (!token) return false;

    // Basic JWT validation check
    try {
      // Check for valid JWT format (three parts separated by dots)
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        console.log('🔍 Invalid token format - not a valid JWT');
        this.clearTokens();
        return false;
      }
      
      // Decode payload
      const payload = JSON.parse(atob(tokenParts[1]));
      console.log('🔍 isAuthenticated check - JWT payload:', payload);
      
      // Required fields validation
      if (!payload.email || !payload.role) {
        console.log('🔍 Token missing required fields (email/role)');
        this.clearTokens();
        return false;
      }
      
      // Check if token has expiration time (optional)
      if (payload.exp) {
        const currentTime = Date.now() / 1000;
        console.log('🔍 isAuthenticated check - exp:', payload.exp, 'current:', currentTime);
        
        // Validate expiration with buffer period (30 seconds) to avoid edge cases
        if (payload.exp <= (currentTime + 30)) {
          console.log('🔍 Token expired or about to expire, clearing tokens');
          this.clearTokens();
          return false;
        }
      } else {
        // No expiration time - acceptable for some JWT implementations
        console.log('🔍 Token has no expiration field - allowing for compatibility');
      }
      
      // Check explicit login flag for additional validation (but don't block if missing)
      const explicitLogin = typeof window !== 'undefined' ? 
        sessionStorage.getItem('explicit_login') : null;
        
      if (!explicitLogin && typeof window !== 'undefined' && window.location.pathname.includes('/auth/signin')) {
        // Only clear tokens on signin page specifically, not all auth pages
        console.log('🔍 No explicit login detected on signin page - clearing tokens');
        this.clearTokens();
        return false;
      }
      
      // Token passed basic validation
      console.log('🔍 Token is valid');
      return true;
    } catch (error) {
      console.error('Error parsing JWT token:', error);
      // Clear invalid token
      this.clearTokens();
      return false;
    }
  }

  /**
   * Get current user from token
   */
  getCurrentUser(): any {
    const token = this.getAuthToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        id: payload.user_id || payload.sub,
        email: payload.email,
        name: payload.name,
        role: payload.role
      };
    } catch {
      return null;
    }
  }

  /**
   * Sign Out
   */
  signOut(): void {
    this.clearTokens();
    // Redirect to sign in page
    if (typeof window !== 'undefined') {
      window.location.href = '/auth/signin';
    }
  }


}

// Export singleton instance
export const authService = new AuthService();
export type { LoginCredentials, SignupData, AuthResponse, VerificationResponse };

