
import { auth } from "../config/firebase";

const API_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/api";

export const getAlquileres = async () => {
  try {
    const usuario = auth.currentUser;

    if (!usuario) {
      throw new Error(
        "No hay una sesión activa. Cierra sesión e inicia sesión nuevamente."
      );
    }

    const token = await usuario.getIdToken();

    const response = await fetch(`${API_URL}/alquiler`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const mensaje = await response.text();
      throw new Error(
        `Error en la petición: ${response.status}. ${mensaje}`
      );
    }

    const json = await response.json();

    const alquileres = Array.isArray(json)
      ? json
      : json.data || [];

    return alquileres.map((item) => ({
      id: String(item.id || item.id_alquiler || ""),
      id_alquiler: item.id_alquiler || item.id,
      id_reserva: String(item.id_reserva || "").trim(),
      id_usuario: item.id_usuario || null,
      id_coche:
        item.id_coche || item.vehiculo?.id_coche || null,
      estado_alquiler:
        item.estado_alquiler || item.estado || "Sin estado",
      fecha_inicio: item.fecha_inicio || null,
      fecha_fin: item.fecha_fin || null,
      fecha_entrega: item.fecha_entrega || null,
      fecha_devolucion: item.fecha_devolucion || null,
      monto_final: Number(item.monto_final) || 0,
      cantidad_dias: Number(item.cantidad_dias) || 0,

      vehiculo: {
        id_coche:
          item.vehiculo?.id_coche || item.id_coche || null,
        marca: item.vehiculo?.marca || "Vehículo",
        modelo: item.vehiculo?.modelo || "",
        placa: item.vehiculo?.placa || "",
        valor_dia: Number(item.vehiculo?.valor_dia) || 0,
        foto_principal:
          item.vehiculo?.foto_principal || null,
      },

      especificaciones: {
        estado_general:
          item.especificaciones?.estado_general ||
          "No especificado",
        kilometraje_devolucion:
          item.especificaciones?.kilometraje_devolucion ??
          "No aplica",
        nivel_combustible:
          item.especificaciones?.nivel_combustible ||
          "No aplica",
      },
    }));
  } catch (error) {
    console.error("Error al consumir /alquiler:", error);
    throw error;
  }
};
