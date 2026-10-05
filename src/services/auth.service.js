const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

export const authService = {
  async login(email, password) {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: email.trim(), password }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || result.message || 'Error al iniciar sesión');
    }

    // result.data contiene: { session, user: { ...authData.user, ...userData } }
    return result.data;
  },

  async logout() {
    try {
      await fetch(`${API_URL}/api/auth/logout`, { method: 'POST' });
    } catch (error) {
      console.warn('Error silenciado al notificar logout al backend:', error);
    }
  },
};