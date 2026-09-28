import { useState, useEffect, useCallback } from 'react';
import { getVehiculos } from '../services/vehiculos.service';

export function useVehiculos() {
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categoriaActiva, setCategoriaActiva] = useState('Todos');

  const cargarVehiculos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getVehiculos();
      setVehiculos(data);
    } catch (err) {
      setError(err.message || 'Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    cargarVehiculos();
  }, [cargarVehiculos]);

  // Filtrado reactivo en memoria
  const vehiculosFiltrados = vehiculos.filter((item) => {
    if (categoriaActiva === 'Todos') return true;
    return item.categoria.toLowerCase() === categoriaActiva.toLowerCase();
  });

  return {
    vehiculos: vehiculosFiltrados,
    loading,
    error,
    categoriaActiva,
    setCategoriaActiva,
    refrescar: cargarVehiculos,
  };
}