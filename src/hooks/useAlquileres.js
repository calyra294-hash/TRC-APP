
import { useState, useEffect, useCallback } from 'react';

import { getAlquileres } from '../services/alquileres.service';
import { getMisResenas } from '../services/resenas.service';

export function useAlquileres() {
    const [alquileres, setAlquileres] = useState([]);
    const [resenas, setResenas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const cargarAlquileres = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const resultadoAlquileres = await getAlquileres();

            setAlquileres(resultadoAlquileres);

            try {
                const resultadoResenas = await getMisResenas();
                setResenas(resultadoResenas);
            } catch (errorResenas) {
                console.error(
                    'No se pudieron cargar las reseñas:',
                    errorResenas
                );

                setResenas([]);
            }

        } catch (err) {
            setError(
                err.message || 'Error al conectar con el servidor'
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        cargarAlquileres();
    }, [cargarAlquileres]);

    return {
        alquileres,
        resenas,
        loading,
        error,
        refrescar: cargarAlquileres,
    };
}
