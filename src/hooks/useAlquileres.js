import { useState, useEffect, useCallback } from 'react';
import { getAlquileres } from '../services/alquileres.service';

export function useAlquileres() {
    const [alquileres, setAlquileres] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const cargarAlquileres = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const data = await getAlquileres();

            setAlquileres(data);
        } catch (err) {
            setError(err.message || 'Error al conectar con el servidor');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        cargarAlquileres();
    }, [cargarAlquileres]);

    return {
        alquileres,
        loading,
        error,
        refrescar: cargarAlquileres,
    };
}