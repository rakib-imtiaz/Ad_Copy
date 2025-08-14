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
  fullName: string;
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
  private useMockApi: boolean;
  private apiEndpoints: {
    registration: string;
    login: string;
    verifyCode: string;
  };

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';
    this.useMockApi = process.env.NEXT_PUBLIC_USE_MOCK_API === 'true';
    
    // Define API endpoints to use
    // Use proxied API endpoints instead of directly accessing n8n webhooks
    // This approach allows for better error handling and security
    this.apiEndpoints = {
      registration: `${this.baseUrl}/auth/register`,
      login: `${this.baseUrl}/auth/signin`,
      verifyCode: `${this.baseUrl}/auth/verify`
    };
  }

  /**
   * Sign Up User
   */
  async signUp(userData: SignupData): Promise<AuthResponse> {
    if (this.useMockApi) {
      return this.mockSignUp(userData);
    }

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
          fullName: userData.fullName
        }),
      });

      // Check headers for user existence
      const userExistHeader = response.headers.get('user-existance');
      if (userExistHeader === 'true') {
        return {
          success: false,
          error: {
            code: 'USER_EXISTS',
            message: 'A user with this email already exists.'
          }
        };
      }

      return {
        success: true,
        data: {
          user: {
            id: `temp_${Date.now()}`,
            email: userData.email,
            name: userData.fullName,
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
    if (this.useMockApi) {
      return this.mockSignIn(credentials);
    }

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

      // Check for authentication failure (401 status)
      if (response.status === 401) {
        return {
          success: false,
          error: {
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password. Please try again.'
          }
        };
      }

      const data = await response.json();
      
      // Store JWT token if successful
      if (data.success && data.data?.accessToken) {
        this.storeAuthToken(data.data.accessToken);
        
        // The refresh token is in the cookies, handled by the browser
        // We don't need to manually extract it
      }

      return {
        success: true,
        data: {
          user: data.data.user,
          token: data.data.accessToken
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
    if (this.useMockApi) {
      return this.mockVerifyEmail(email);
    }

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
   * Verify the code sent to user's email
   */
  async verifyCode(email: string, code: string): Promise<AuthResponse> {
    if (this.useMockApi) {
      // Use the mock verification for testing
      const mockVerification = await this.mockVerifyEmail(email);
      
      if (mockVerification.verification_code === code) {
        return this.mockSignIn({ email, password: 'verified' });
      }
      
      return {
        success: false,
        error: {
          code: 'INVALID_CODE',
          message: 'Invalid verification code'
        }
      };
    }

    try {
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

      if (!response.ok) {
        return {
          success: false,
          error: {
            code: 'VERIFICATION_FAILED',
            message: 'Failed to verify code. Please try again.'
          }
        };
      }

      const data = await response.json();
      
      // If verification is successful, data should contain user info and tokens
      if (data.success) {
        if (data.token) {
          this.storeAuthToken(data.token);
        }
        
        return {
          success: true,
          data: {
            user: data.user || {
              id: `user_${Date.now()}`,
              email: email,
              name: 'User',
              role: 'user'
            },
            token: data.token || ''
          }
        };
      }
      
      return {
        success: false,
        error: {
          code: 'INVALID_CODE',
          message: data.message || 'Invalid verification code'
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: 'Failed to connect to verification service',
          details: error.message
        }
      };
    }
  }

  /**
   * JWT Token Management
   */
  storeAuthToken(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    }
  }

  storeRefreshToken(refreshToken: string): void {
    if (typeof window !== 'undefined') {
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

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = this.getAuthToken();
    if (!token) return false;

    // Basic JWT expiration check (you can enhance this)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp > currentTime;
    } catch {
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

  // ===================
  // MOCK API METHODS
  // ===================

  private async mockSignUp(userData: SignupData): Promise<AuthResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Basic validation
    if (!userData.email || !userData.password || !userData.fullName) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'All fields are required'
        }
      };
    }

    return {
      success: true,
      data: {
        user: {
          id: `user_${Date.now()}`,
          email: userData.email,
          name: userData.fullName,
          role: 'user'
        },
        token: this.generateMockJWT(userData.email, userData.fullName)
      }
    };
  }

  private async mockSignIn(credentials: LoginCredentials): Promise<AuthResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Mock validation
    if (credentials.email === 'test@example.com' && credentials.password === 'password123') {
      const token = this.generateMockJWT(credentials.email, 'Test User');
      this.storeAuthToken(token);
      
      return {
        success: true,
        data: {
          user: {
            id: 'user_mock_123',
            email: credentials.email,
            name: 'Test User',
            role: 'user'
          },
          token
        }
      };
    }

    return {
      success: false,
      error: {
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password'
      }
    };
  }

  private async mockVerifyEmail(email: string): Promise<VerificationResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // Generate consistent verification code based on email
    const emailHash = email.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    const verificationCode = Math.abs(emailHash % 900000) + 100000;

    return {
      success: true,
      verification_code: verificationCode.toString()
    };
  }

  private generateMockJWT(email: string, name: string): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
      user_id: `user_${Date.now()}`,
      email,
      name,
      role: 'user',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 hours
    }));
    const signature = btoa('mock_signature');
    
    return `${header}.${payload}.${signature}`;
  }
}

// Export singleton instance
export const authService = new AuthService();
export type { LoginCredentials, SignupData, AuthResponse, VerificationResponse };

