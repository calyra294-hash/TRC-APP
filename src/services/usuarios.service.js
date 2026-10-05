const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000/api';

/**
 * Registra un nuevo usuario consumiendo el backend Express.
 * @param {Object} usuarioData Datos del formulario de registro
 * @returns {Promise<Object>} Datos del usuario creado
 */
export const registrarUsuario = async (usuarioData) => {
  try {
    const response = await fetch(`${API_URL}/usuarios`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(usuarioData),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.error || result.message || 'Error al registrar el usuario.');
    }

    return result.data || result;
  } catch (error) {
    console.error('Error en registrarUsuario (Service Client):', error);
    throw error;
  }
};