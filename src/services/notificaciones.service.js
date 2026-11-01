import { auth } from "../config/firebase.js";

const API_URL =
    process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/api";

const obtenerToken = async () => {
    const usuario = auth.currentUser;

    console.log(
        "Usuario Firebase:",
        usuario ? usuario.uid : "NO HAY USUARIO"
    );

    if (!usuario) {
        throw new Error("No hay una sesión activa de Firebase.");
    }

    const token = await usuario.getIdToken(true);

    console.log("Token Firebase obtenido:", !!token);

    return token;
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

export const obtenerNotificaciones = async () => {
    const token = await obtenerToken();

    const response = await fetch(`${API_URL}/notificaciones`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    });

    const resultado = await procesarRespuesta(response);
    return resultado.data;
};

export const marcarNotificacionLeida = async (id) => {
    const token = await obtenerToken();

    const response = await fetch(
        `${API_URL}/notificaciones/${encodeURIComponent(id)}/leer`,
        {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
        }
    );

    return await procesarRespuesta(response);
};

export const marcarTodasLeidas = async () => {
    const token = await obtenerToken();

    const response = await fetch(`${API_URL}/notificaciones/leer-todas`, {
        method: "PATCH",
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
    });

    return await procesarRespuesta(response);
};
