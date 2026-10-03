const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

export const getAlquileres = async () => {
  try {
    const response = await fetch(`${API_URL}/alquiler`);

    if (!response.ok) {
      throw new Error(`Error en la petición: ${response.status}`);
    }

    const json = await response.json();

    const alquileres = Array.isArray(json) ? json : (json.data || []);

    const alquileresMapeados = alquileres.map((item) => {
      return {
        id: String(item.id || ''),
        id_reserva: String(item.id_reserva || '').trim(),
        estado_alquiler: item.estado_alquiler || 'Sin estado',
        monto_final: Number(item.monto_final) || 0,
        fecha_entrega: item.fecha_entrega || null,
        fecha_devolucion: item.fecha_devolucion || null,

        vehiculo: {
          marca: item.Vehiculo_resumen?.marca || 'Vehículo',
          modelo: item.Vehiculo_resumen?.modelo || '',
          foto_principal: item.Vehiculo_resumen?.foto_principal || null,
        },

        especificaciones: {
          estado_general:
            item.especificaciones?.estado_general || 'No especificado',
          kilometraje_devolucion:
            item.especificaciones?.kilometraje_devolucion || 'No aplica',
          nivel_combustible:
            item.especificaciones?.nivel_combustible || 'No aplica',
        },
      };
    });

    return alquileresMapeados;
  } catch (error) {
    console.error('Error al consumir /alquiler:', error);
    throw error;
  }
};