const API_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

const ID_USUARIO_TEMPORAL = 1;

export const getAlquileres = async (
  idUsuario = ID_USUARIO_TEMPORAL
) => {
  try {
    const response = await fetch(
      idUsuario
        ? `${API_URL}/alquiler?id_usuario=${idUsuario}`
        : `${API_URL}/alquiler`
    );

    if (!response.ok) {
      throw new Error(`Error en la petición: ${response.status}`);
    }

    const json = await response.json();

    const alquileres = Array.isArray(json)
      ? json
      : json.data || [];

    return alquileres.map((item) => ({
      id: String(
        item.id ||
        item.id_alquiler ||
        ''
      ),

      id_alquiler:
        item.id_alquiler ||
        item.id,

      id_reserva: String(
        item.id_reserva || ''
      ).trim(),

      id_usuario:
        item.id_usuario ||
        null,

      id_coche:
        item.id_coche ||
        item.vehiculo?.id_coche ||
        null,

      estado_alquiler:
        item.estado_alquiler ||
        item.estado ||
        'Sin estado',

      fecha_inicio:
        item.fecha_inicio ||
        null,

      fecha_fin:
        item.fecha_fin ||
        null,

      fecha_entrega:
        item.fecha_entrega ||
        null,

      fecha_devolucion:
        item.fecha_devolucion ||
        null,

      monto_final:
        Number(item.monto_final) || 0,

      cantidad_dias:
        Number(item.cantidad_dias) || 0,

      vehiculo: {
        id_coche:
          item.vehiculo?.id_coche ||
          item.id_coche ||
          null,

        marca:
          item.vehiculo?.marca ||
          'Vehículo',

        modelo:
          item.vehiculo?.modelo ||
          '',

        placa:
          item.vehiculo?.placa ||
          '',

        valor_dia:
          Number(
            item.vehiculo?.valor_dia
          ) || 0,

        foto_principal:
          item.vehiculo?.foto_principal ||
          null,
      },

      especificaciones: {
        estado_general:
          item.especificaciones
            ?.estado_general ||
          'No especificado',

        kilometraje_devolucion:
          item.especificaciones
            ?.kilometraje_devolucion ??
          'No aplica',

        nivel_combustible:
          item.especificaciones
            ?.nivel_combustible ||
          'No aplica',
      },
    }));
  } catch (error) {
    console.error(
      'Error al consumir /alquiler:',
      error
    );

    throw error;
  }
};