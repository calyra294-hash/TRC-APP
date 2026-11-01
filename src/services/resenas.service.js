import { auth } from "../config/firebase";

const API_URL =
    process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/api";

const obtenerToken = async () => {
    const usuario = auth.currentUser;

    if (!usuario) {
        throw new Error("No hay una sesión activa. Inicia sesión nuevamente.");
    }

    return await usuario.getIdToken();
};

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

// Obtener las reseñas del cliente autenticado
export const getMisResenas = async () => {
    try {
        const token = await obtenerToken();

        const response = await fetch(
            `${API_URL}/resena/mis-resenas`,
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
        console.error("Error al obtener mis reseñas:", error);
        throw error;
    }
};

// Registrar una reseña
export const crearResena = async ({
    id_alquiler,
    calificacion,
    comentario,
}) => {
    try {
        const token = await obtenerToken();

        const response = await fetch(`${API_URL}/resena`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                id_alquiler,
                calificacion,
                comentario,
            }),
        });

        return await procesarRespuesta(response);
    } catch (error) {
        console.error("Error al registrar reseña:", error);
        throw error;
    }
};

// Obtener reseñas de un vehículo
export const getResenasVehiculo = async (idVehiculo) => {
    try {
        const token = await obtenerToken();

        const response = await fetch(
            `${API_URL}/resena/vehiculo/${encodeURIComponent(idVehiculo)}`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );

        const json = await procesarRespuesta(response);

        return json.data || {
            promedio: 0,
            total: 0,
            resenas: [],
        };
    } catch (error) {
        console.error("Error al obtener reseñas del vehículo:", error);
        throw error;
    }
};

// Obtener todas las reseñas para el administrador
export const getTodasResenasAdmin = async () => {
    try {
        const token = await obtenerToken();

        const response = await fetch(
            `${API_URL}/resena/admin/todas`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            }
        );

        const json = await procesarRespuesta(response);

        return json.data || {
            total: 0,
            promedio: 0,
            distribucion: {
                1: 0,
                2: 0,
                3: 0,
                4: 0,
                5: 0,
            },
            resenas: [],
        };
    } catch (error) {
        console.error("Error al obtener todas las reseñas:", error);
        throw error;
    }
};