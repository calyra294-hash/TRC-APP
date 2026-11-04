import { auth } from "../config/firebase";

const API_URL = (
    process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/api"
).replace(/\/$/, "");

// Caché temporal de reseñas por vehículo
const cacheResenas = new Map();
const peticionesEnCurso = new Map();

const TIEMPO_CACHE = 5 * 60 * 1000;

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

        const resultado = await procesarRespuesta(response);

        cacheResenas.clear();
        peticionesEnCurso.clear();

        return resultado;
    } catch (error) {
        console.error("Error al registrar reseña:", error);
        throw error;
    }
};

// Obtener reseñas de un vehículo
export const getResenasVehiculo = async (idVehiculo) => {
    const id = String(idVehiculo || "").trim();

    if (!id) {
        return {
            promedio: 0,
            total: 0,
            resenas: [],
        };
    }

    const almacenado = cacheResenas.get(id);

    if (
        almacenado &&
        Date.now() - almacenado.fecha < TIEMPO_CACHE
    ) {
        return almacenado.datos;
    }

    if (peticionesEnCurso.has(id)) {
        return peticionesEnCurso.get(id);
    }

    const peticion = (async () => {
        try {
            const token = await obtenerToken();

            const response = await fetch(
                `${API_URL}/resena/vehiculo/${encodeURIComponent(id)}`,
                {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            const json = await procesarRespuesta(response);

            const datos = json.data || {
                promedio: 0,
                total: 0,
                resenas: [],
            };

            cacheResenas.set(id, {
                datos,
                fecha: Date.now(),
            });

            return datos;
        } finally {
            peticionesEnCurso.delete(id);
        }
    })();

    peticionesEnCurso.set(id, peticion);

    return peticion;
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