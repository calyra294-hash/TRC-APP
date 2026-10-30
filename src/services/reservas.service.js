
import { auth } from "../config/firebase";

const API_URL =
    process.env.EXPO_PUBLIC_API_URL || "http://localhost:3000/api";

// OBTENER TODAS LAS RESERVAS
export const getReservas = async () => {
    const usuario = auth.currentUser;

    if (!usuario) {
        throw new Error("Debes iniciar sesión nuevamente.");
    }

    const token = await usuario.getIdToken();

    const response = await fetch(`${API_URL}/reserva`, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });

    const json = await response.json();

    if (!response.ok) {
        throw new Error(
            json.mensaje || `Error al obtener reservas: ${response.status}`
        );
    }

    return json.data || [];
};

// OBTENER UNA RESERVA POR ID
export const getReservaPorId = async (id) => {
    const usuario = auth.currentUser;

    if (!usuario) {
        throw new Error("Debes iniciar sesión nuevamente.");
    }

    const token = await usuario.getIdToken();

    const response = await fetch(
        `${API_URL}/reserva/${encodeURIComponent(id)}`,
        {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    const json = await response.json();

    if (!response.ok) {
        throw new Error(
            json.mensaje || `Error al obtener reserva: ${response.status}`
        );
    }

    return json.data;
};

// CREAR RESERVA
export const crearReserva = async (datos) => {
    const usuario = auth.currentUser;

    if (!usuario) {
        throw new Error("Debes iniciar sesión nuevamente.");
    }

    const token = await usuario.getIdToken();

    const response = await fetch(`${API_URL}/reserva`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(datos),
    });

    const json = await response.json();

    if (!response.ok) {
        throw new Error(
            json.mensaje ||
            json.error ||
            `Error al crear reserva: ${response.status}`
        );
    }

    return json.data;
};

// ACTUALIZAR ESTADO DE RESERVA
export const actualizarEstadoReserva = async (id, estado) => {
    const usuario = auth.currentUser;

    if (!usuario) {
        throw new Error("Debes iniciar sesión nuevamente.");
    }

    const token = await usuario.getIdToken();

    const response = await fetch(
        `${API_URL}/reserva/${encodeURIComponent(id)}/estado`,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ estado }),
        }
    );

    const json = await response.json();

    if (!response.ok) {
        throw new Error(
            json.mensaje ||
            `Error al actualizar estado: ${response.status}`
        );
    }

    return json.data;
};

// ELIMINAR RESERVA
export const eliminarReserva = async (id) => {
    const usuario = auth.currentUser;

    if (!usuario) {
        throw new Error("Debes iniciar sesión nuevamente.");
    }

    const token = await usuario.getIdToken();

    const response = await fetch(
        `${API_URL}/reserva/${encodeURIComponent(id)}`,
        {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    const json = await response.json();

    if (!response.ok) {
        throw new Error(
            json.mensaje ||
            `Error al eliminar reserva: ${response.status}`
        );
    }

    return true;
};

// OBTENER TOKEN QR DEL ALQUILER
export const getQRAlquiler = async (idAlquiler) => {
    const usuario = auth.currentUser;

    if (!usuario) {
        throw new Error("Debes iniciar sesión nuevamente.");
    }

    if (!idAlquiler) {
        throw new Error("No se encontró el alquiler de esta reserva.");
    }

    const token = await usuario.getIdToken();

    const response = await fetch(
        `${API_URL}/alquiler/${encodeURIComponent(idAlquiler)}/qr`,
        {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        }
    );

    const json = await response.json();

    if (!response.ok) {
        throw new Error(
            json.mensaje ||
            `Error al generar el código QR: ${response.status}`
        );
    }

    return json.data;
};
