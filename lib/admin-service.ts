/**
 * Admin Service
 * Handles admin-specific functionality including user account switching
 */

import { API_ENDPOINTS, getAuthHeaders } from './api-config';
import { authService } from './auth-service';

interface UserPasswordResponse {
  password: string;
}

interface AdminSwitchUserResponse {
  success: boolean;
  data?: {
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
    };
    token: string;
  };
  error?: {
    code: string;
    message: string;
  };
}

class AdminService {
  /**
   * Get user password for admin account switching
   */
  async getUserPassword(email: string): Promise<{ success: boolean; password?: string; error?: string }> {
    console.log('🔍 [ADMIN SERVICE] getUserPassword called with email:', email);

    try {
      const token = authService.getAuthToken();
      console.log('🔑 [ADMIN SERVICE] Auth token exists:', !!token);
      console.log('🔑 [ADMIN SERVICE] Auth token preview:', token ? `${token.substring(0, 20)}...` : 'null');

      if (!token) {
        console.error('❌ [ADMIN SERVICE] No authentication token found');
        return {
          success: false,
          error: 'No authentication token found'
        };
      }

      const url = `/api/admin/get-user-password?email=${encodeURIComponent(email)}`;
      console.log('🌐 [ADMIN SERVICE] Making request to:', url);

      const headers = getAuthHeaders(token);
      console.log('📋 [ADMIN SERVICE] Request headers:', headers);

      const response = await fetch(url, {
        method: 'GET',
        headers: headers,
      });

      console.log('📡 [ADMIN SERVICE] Response status:', response.status);
      console.log('📡 [ADMIN SERVICE] Response ok:', response.ok);
      console.log('📡 [ADMIN SERVICE] Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        console.error('❌ [ADMIN SERVICE] Response not ok, status:', response.status);

        let errorData;
        try {
          errorData = await response.json();
          console.log('❌ [ADMIN SERVICE] Error response data:', errorData);
        } catch (parseError) {
          console.error('❌ [ADMIN SERVICE] Failed to parse error response:', parseError);
          errorData = {};
        }

        const errorMessage = errorData.message || `Failed to get user password: ${response.status}`;
        console.error('❌ [ADMIN SERVICE] Final error message:', errorMessage);

        return {
          success: false,
          error: errorMessage
        };
      }

      console.log('✅ [ADMIN SERVICE] Response ok, parsing data...');
      const data: UserPasswordResponse[] = await response.json();
      console.log('📊 [ADMIN SERVICE] Response data:', data);
      console.log('📊 [ADMIN SERVICE] Data type:', typeof data);
      console.log('📊 [ADMIN SERVICE] Is array:', Array.isArray(data));
      console.log('📊 [ADMIN SERVICE] Data length:', Array.isArray(data) ? data.length : 'N/A');

      if (Array.isArray(data) && data.length > 0) {
        console.log('📊 [ADMIN SERVICE] First item:', data[0]);
        console.log('📊 [ADMIN SERVICE] Has password field:', 'password' in data[0]);
        console.log('📊 [ADMIN SERVICE] Password value:', data[0].password);

        if (data[0].password) {
          console.log('✅ [ADMIN SERVICE] Password found successfully');
          return {
            success: true,
            password: data[0].password
          };
        }
      }

      console.error('❌ [ADMIN SERVICE] No password found in response data');
      return {
        success: false,
        error: 'No password found for user'
      };
    } catch (error: any) {
      console.error('💥 [ADMIN SERVICE] Network error:', error);
      console.error('💥 [ADMIN SERVICE] Error message:', error.message);
      console.error('💥 [ADMIN SERVICE] Error stack:', error.stack);

      return {
        success: false,
        error: `Network error: ${error.message}`
      };
    }
  }

  /**
   * Switch to user account by logging in with their credentials
   */
  async switchToUserAccount(email: string, password: string): Promise<AdminSwitchUserResponse> {
    console.log('🔄 [ADMIN SERVICE] switchToUserAccount called with email:', email);
    console.log('🔑 [ADMIN SERVICE] Password provided:', !!password);
    console.log('🔑 [ADMIN SERVICE] Password length:', password ? password.length : 0);

    try {
      console.log('🔐 [ADMIN SERVICE] Calling authService.signIn...');
      // Use the existing auth service to sign in as the user
      const result = await authService.signIn({ email, password });

      console.log('🔐 [ADMIN SERVICE] Auth service result:', result);
      console.log('🔐 [ADMIN SERVICE] Result success:', result.success);
      console.log('🔐 [ADMIN SERVICE] Result data:', result.data);
      console.log('🔐 [ADMIN SERVICE] Result error:', result.error);

      if (result.success && result.data) {
        console.log('✅ [ADMIN SERVICE] Switch successful, returning success response');
        return {
          success: true,
          data: {
            user: result.data.user,
            token: result.data.token
          }
        };
      }

      console.error('❌ [ADMIN SERVICE] Switch failed, returning error response');
      return {
        success: false,
        error: {
          code: 'SWITCH_FAILED',
          message: result.error?.message || 'Failed to switch to user account'
        }
      };
    } catch (error: any) {
      console.error('💥 [ADMIN SERVICE] Switch error:', error);
      console.error('💥 [ADMIN SERVICE] Error message:', error.message);
      console.error('💥 [ADMIN SERVICE] Error stack:', error.stack);

      return {
        success: false,
        error: {
          code: 'NETWORK_ERROR',
          message: `Failed to switch account: ${error.message}`
        }
      };
    }
  }

  /**
   * Complete flow: Get user password and switch to their account
   */
  async switchToUser(email: string): Promise<AdminSwitchUserResponse> {
    console.log('🚀 [ADMIN SERVICE] switchToUser called with email:', email);
    console.log('🚀 [ADMIN SERVICE] Starting complete user switch flow...');

    try {
      // Step 1: Get user password
      console.log('📋 [ADMIN SERVICE] Step 1: Getting user password...');
      const passwordResult = await this.getUserPassword(email);
      console.log('📋 [ADMIN SERVICE] Password result:', passwordResult);

      if (!passwordResult.success || !passwordResult.password) {
        console.error('❌ [ADMIN SERVICE] Password retrieval failed:', passwordResult.error);
        return {
          success: false,
          error: {
            code: 'PASSWORD_RETRIEVAL_FAILED',
            message: passwordResult.error || 'Failed to retrieve user password'
          }
        };
      }

      console.log('✅ [ADMIN SERVICE] Password retrieved successfully');

      // Step 2: Switch to user account
      console.log('📋 [ADMIN SERVICE] Step 2: Switching to user account...');
      const switchResult = await this.switchToUserAccount(email, passwordResult.password);
      console.log('📋 [ADMIN SERVICE] Switch result:', switchResult);

      console.log('🏁 [ADMIN SERVICE] Complete switch flow finished');
      return switchResult;
    } catch (error: any) {
      console.error('💥 [ADMIN SERVICE] Switch flow error:', error);
      console.error('💥 [ADMIN SERVICE] Error message:', error.message);
      console.error('💥 [ADMIN SERVICE] Error stack:', error.stack);

      return {
        success: false,
        error: {
          code: 'SWITCH_FLOW_FAILED',
          message: `Failed to complete user switch: ${error.message}`
        }
      };
    }
  }

  /**
   * Store admin context before switching to user
   * IMPORTANT: Also stores the admin's current auth token so we can restore it later
   */
  storeAdminContext(adminUser: any): void {
    if (typeof window !== 'undefined') {
      // Get the current admin token BEFORE switching
      const adminToken = authService.getAuthToken();

      sessionStorage.setItem('admin_context', JSON.stringify({
        user: adminUser,
        adminToken: adminToken, // Store the admin's token
        timestamp: Date.now()
      }));
    }
  }

  /**
   * Get stored admin context
   */
  getAdminContext(): any | null {
    if (typeof window !== 'undefined') {
      const context = sessionStorage.getItem('admin_context');
      if (context) {
        try {
          return JSON.parse(context);
        } catch {
          return null;
        }
      }
    }
    return null;
  }

  /**
   * Clear admin context
   */
  clearAdminContext(): void {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('admin_context');
    }
  }

  /**
   * Check if current session is from admin switch
   */
  isAdminSwitchSession(): boolean {
    return this.getAdminContext() !== null;
  }

  /**
   * Return to admin account
   */
  async returnToAdminAccount(): Promise<boolean> {
    try {
      console.log('🔄 [RETURN TO ADMIN] Starting...');
      const adminContext = this.getAdminContext();
      // console.log('🔄 [RETURN TO ADMIN] Admin context:', adminContext);

      if (!adminContext) {
        console.error('❌ [RETURN TO ADMIN] No admin context found');
        return false;
      }

      // Get the admin token that was stored when they switched to user
      const adminToken = adminContext.adminToken;
      console.log('🔑 [RETURN TO ADMIN] Admin token exists:', !!adminToken);

      if (!adminToken) {
        console.error('❌ [RETURN TO ADMIN] No admin token found');
        if (typeof window !== 'undefined') {
          window.location.href = '/admin';
        }
        return false;
      }

      authService.clearTokens();
      authService.storeAuthToken(adminToken);
      this.clearAdminContext();

      console.log('🚀 [RETURN TO ADMIN] Redirecting to /admin...');
      if (typeof window !== 'undefined') {
        window.location.href = '/admin';
      }

      return true;
    } catch (error) {
      console.error('💥 [RETURN TO ADMIN] Error:', error);
      return false;
    }
  }
}

// Export singleton instance
export const adminService = new AdminService();
export type { UserPasswordResponse, AdminSwitchUserResponse };
