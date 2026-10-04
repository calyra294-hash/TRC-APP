import { useState, useEffect, useCallback } from 'react';
import { getReservas } from '../services/reservas.service';

export function useReservas() {
    const [reservas, setReservas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const cargarReservas = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const data = await getReservas();

            setReservas(data);
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