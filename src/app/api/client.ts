const BASE_URL = 'https://api.cbmgroupco.com/api/v1';
const AUTH_URL = 'https://api.cbmgroupco.com/api/token/';

class ApiClient {
  private getToken() {
    return localStorage.getItem('access_token');
  }

  async request(endpoint: string, options: RequestInit = {}) {
    const token = this.getToken();
    
    // Default headers
    const headers: Record<string, string> = {
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(options.headers as Record<string, string>),
    };

    // If body is NOT FormData and Content-Type isn't already set, default to JSON
    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }

    let response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      // Attempt token refresh
      const refresh = localStorage.getItem('refresh_token');
      if (refresh) {
        try {
          const refreshRes = await fetch('https://api.cbmgroupco.com/api/token/refresh/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh }),
          });
          
          if (refreshRes.ok) {
            const { access } = await refreshRes.json();
            localStorage.setItem('access_token', access);
            
            // Retry original request
            headers['Authorization'] = `Bearer ${access}`;
            response = await fetch(`${BASE_URL}${endpoint}`, {
              ...options,
              headers,
            });
            
            if (response.ok) {
              return response.status === 204 ? null : response.json();
            }
          }
        } catch (e) {
          console.error("Token refresh failed", e);
        }
      }
      
      // If no refresh token or refresh failed, force logout
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      window.location.href = '/login';
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'API Request failed');
    }

    // Attempt to parse JSON response. Delete requests might return 204 No Content.
    if (response.status === 204) {
      return null;
    }
    return response.json();
  }

  get(endpoint: string) {
    return this.request(endpoint, { method: 'GET' });
  }

  post(endpoint: string, data: any) {
    const isFormData = data instanceof FormData;
    return this.request(endpoint, {
      method: 'POST',
      body: isFormData ? data : JSON.stringify(data),
    });
  }

  put(endpoint: string, data: any) {
    const isFormData = data instanceof FormData;
    return this.request(endpoint, {
      method: 'PUT',
      body: isFormData ? data : JSON.stringify(data),
    });
  }

  patch(endpoint: string, data: any) {
    const isFormData = data instanceof FormData;
    return this.request(endpoint, {
      method: 'PATCH',
      body: isFormData ? data : JSON.stringify(data),
    });
  }

  delete(endpoint: string) {
    return this.request(endpoint, { method: 'DELETE' });
  }

  async login(username: string, password: string) {
    const response = await fetch(AUTH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error('Invalid credentials');
    }

    const { access, refresh } = await response.json();
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
    return { access, refresh };
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/login';
  }
}

export const api = new ApiClient();
