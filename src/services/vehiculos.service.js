const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

export const getVehiculos = async () => {
  try {
    const response = await fetch(`${API_URL}/vehiculos`);
    
    if (!response.ok) {
      throw new Error(`Error en la petición: ${response.status}`);
    }

    const json = await response.json();
    return json.data; 
  } catch (error) {
    console.error('Error al consumir /vehiculos:', error);
    throw error;
  }
};