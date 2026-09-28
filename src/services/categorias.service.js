const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

export const getCategorias = async () => {
  try {
    const response = await fetch(`${API_URL}/categorias`);

    if (!response.ok) {
      throw new Error(`Error HTTP: ${response.status}`);
    }

    const json = await response.json();
    return json.data; // Devuelve el array de categorías desde el backend
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    throw error;
  }
};