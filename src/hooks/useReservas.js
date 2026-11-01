
import { useState, useEffect, useCallback } from 'react';
import { getReservas } from '../services/reservas.service';

const obtenerTiempo = (fecha) => {
    if (!fecha) return 0;

    if (fecha._seconds) {
        return fecha._seconds * 1000;
    }

    if (fecha.seconds) {
        return fecha.seconds * 1000;
    }

    const tiempo = new Date(fecha).getTime();

    return Number.isNaN(tiempo) ? 0 : tiempo;
};

export function useReservas() {
    const [reservas, setReservas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const cargarReservas = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const data = await getReservas();

            const lista = Array.isArray(data) ? data : [];

            const ordenadas = [...lista].sort((a, b) => {
                const fechaA = obtenerTiempo(
                    a.fecha_creacion || a.fecha_actualizacion
                );

                const fechaB = obtenerTiempo(
                    b.fecha_creacion || b.fecha_actualizacion
                );

                return fechaB - fechaA;
            });

            setReservas(ordenadas);
        } catch (err) {
            setError(err.message || 'Error al conectar con el servidor');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        cargarReservas();
    }, [cargarReservas]);

    return {
        reservas,
        loading,
        error,
        refrescar: cargarReservas,
    };
}
