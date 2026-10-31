
import { auth } from "../config/firebase";

const API_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/api";

// OBTENER TOKEN DEL USUARIO AUTENTICADO
const obtenerToken = async () => {
  const usuario = auth.currentUser;

  if (!usuario) {
    throw new Error(
      "No hay una sesión activa. Inicia sesión nuevamente."
    );
  }

  return await usuario.getIdToken();
};

// PROCESAR RESPUESTAS DEL BACKEND
const procesarRespuesta = async (response) => {
  const json = await response.json().catch(() => ({}));

  if (!response.ok || json.success === false) {
    throw new Error(
      json.error ||
      json.mensaje ||
      `Error en la petición: ${response.status}`
    );
  }

  return json;
};

// OBTENER ALQUILERES
export const getAlquileres = async () => {
  try {
    const token = await obtenerToken();

    const response = await fetch(`${API_URL}/alquiler`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const json = await procesarRespuesta(response);

    const alquileres = Array.isArray(json)
      ? json
      : json.data || [];

    return alquileres.map((item) => ({
      id: String(item.id || item.id_alquiler || ""),
      id_alquiler: item.id_alquiler || item.id,
      id_reserva: String(item.id_reserva || "").trim(),
      id_usuario: item.id_usuario || item.uid_usuario || null,
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
          item.vehiculo?.foto_principal ||
          item.vehiculo?.url_imagen ||
          null,
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

// OBTENER DISPONIBILIDAD DE TODOS LOS VEHÍCULOS
export const getDisponibilidadVehiculos = async () => {
  try {
    const token = await obtenerToken();

    const response = await fetch(
      `${API_URL}/reserva/disponibilidad`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const json = await procesarRespuesta(response);

    return Array.isArray(json.data) ? json.data : [];
  } catch (error) {
    console.error("Error al obtener disponibilidad:", error);
    throw error;
  }
};

// REGISTRAR ENTREGA DEL VEHÍCULO
export const registrarEntregaAlquiler = async (id) => {
  try {
    const token = await obtenerToken();

    const response = await fetch(
      `${API_URL}/alquiler/${encodeURIComponent(id)}/entrega`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return await procesarRespuesta(response);
  } catch (error) {
    console.error("Error al registrar entrega:", error);
    throw error;
  }
};

// REGISTRAR DEVOLUCIÓN DEL VEHÍCULO
export const registrarDevolucionAlquiler = async (
  id,
  especificaciones = {}
) => {
  try {
    const token = await obtenerToken();

    const response = await fetch(
      `${API_URL}/alquiler/${encodeURIComponent(id)}/devolucion`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(especificaciones),
      }
    );

    return await procesarRespuesta(response);
  } catch (error) {
    console.error("Error al registrar devolución:", error);
    throw error;
  }
};

// VALIDAR QR ESCANEADO
export const validarQRAlquiler = async (qrToken) => {
  try {
    if (!qrToken) {
      throw new Error("El código QR no contiene información.");
    }

    const token = await obtenerToken();

    const response = await fetch(`${API_URL}/alquiler/qr/validar`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ token: qrToken }),
    });

    const json = await procesarRespuesta(response);

    return json.data;
  } catch (error) {
    console.error("Error al validar QR:", error);
    throw error;
  }
};

// CONFIRMAR ENTREGA O DEVOLUCIÓN MEDIANTE EL MISMO QR
export const confirmarEntregaQR = async (
  qrToken,
  especificaciones = {}
) => {
  try {
    if (!qrToken) {
      throw new Error("No se encontró el código QR.");
    }

    const token = await obtenerToken();

    const response = await fetch(
      `${API_URL}/alquiler/qr/confirmar-entrega`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: qrToken,
          especificaciones,
        }),
      }
    );

    return await procesarRespuesta(response);
  } catch (error) {
    console.error(
      "Error al confirmar entrega o devolución mediante QR:",
      error
    );
    throw error;
  }
};
