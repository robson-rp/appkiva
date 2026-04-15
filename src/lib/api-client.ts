/**
 * KIVARA API Client
 * Centralized HTTP client for Laravel REST API
 * Features:
 * - Automatic JWT token injection
 * - Automatic X-Tenant-ID header injection
 * - Automatic token refresh on 401
 * - Typed request/response methods
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export class ApiError extends Error {
  constructor(
    public message: string,
    public status: number,
    public errors: Record<string, string[]> | null = null
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface RefreshResponse {
  token: string;
  refresh_token: string;
}

class ApiClient {
  private isRefreshing = false;
  private refreshPromise: Promise<string> | null = null;

  private getToken(): string | null {
    return localStorage.getItem('kivara_token');
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem('kivara_refresh_token');
  }

  private getTenantId(): string | null {
    return localStorage.getItem('kivara_tenant_id');
  }

  private setTokens(token: string, refreshToken?: string): void {
    localStorage.setItem('kivara_token', token);
    if (refreshToken) {
      localStorage.setItem('kivara_refresh_token', refreshToken);
    }
  }

  private clearAuth(): void {
    localStorage.removeItem('kivara_token');
    localStorage.removeItem('kivara_refresh_token');
    localStorage.removeItem('kivara_tenant_id');
    window.location.href = '/login';
  }

  private async refreshToken(): Promise<string> {
    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = (async () => {
      try {
        const refreshToken = this.getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });

        if (!response.ok) {
          throw new Error('Refresh failed');
        }

        const data: RefreshResponse = await response.json();
        this.setTokens(data.token, data.refresh_token);
        return data.token;
      } catch (error) {
        this.clearAuth();
        throw error;
      } finally {
        this.isRefreshing = false;
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${path}`;
    const token = this.getToken();
    const tenantId = this.getTenantId();

    const headers: Record<string, string> = {
      ...options.headers as Record<string, string>,
    };

    // Don't set Content-Type for FormData — browser sets it with boundary
    if (!(options.body instanceof FormData)) {
      headers['Content-Type'] = headers['Content-Type'] ?? 'application/json';
    }

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    if (tenantId) {
      headers['X-Tenant-ID'] = tenantId;
    }

    let response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle 401 - try to refresh token
    if (response.status === 401 && token) {
      try {
        const newToken = await this.refreshToken();
        
        // Retry original request with new token
        headers['Authorization'] = `Bearer ${newToken}`;
        response = await fetch(url, {
          ...options,
          headers,
        });
      } catch (error) {
        // Refresh failed, clearAuth already called
        throw new ApiError('Session expired', 401);
      }
    }

    // Handle error responses
    if (!response.ok) {
      let errorMessage = 'An error occurred';
      let errors: Record<string, string[]> | null = null;

      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
        errors = errorData.errors || null;
      } catch {
        // Response is not JSON, use default message
      }

      throw new ApiError(errorMessage, response.status, errors);
    }

    // Handle empty responses (204 No Content, etc.)
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return {} as T;
    }

    return response.json();
  }

  async get<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: 'GET' });
  }

  async post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, {
      method: 'POST',
      body: body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined),
    });
  }

  async patch<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, {
      method: 'PATCH',
      body: body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined),
    });
  }

  async put<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, {
      method: 'PUT',
      body: body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined),
    });
  }

  async delete<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: 'DELETE' });
  }
}

export const api = new ApiClient();
