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

    return result.data;
  },

  // Método ultraliviano para consultar el perfil fresco usando el ID
  async obtenerPerfil(id_usuario) {
    const response = await fetch(`${API_URL}/usuarios/${id_usuario}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || 'Error al obtener el perfil fresco');
    }

    return result.data; // Retorna el objeto del usuario actualizado con su estado_aprobacion
  },

  async logout() {
    try {
      await fetch(`${API_URL}/auth/logout`, { method: 'POST' });
    } catch (error) {
      console.warn('Error silenciado al notificar logout al backend:', error);
    }
  },
};