import { useState, useEffect, useCallback } from 'react';
import { getCategorias } from '../services';

export function useCategorias() {
  const [categorias, setCategorias] = useState(['Todos']);
  const [loadingCategorias, setLoadingCategorias] = useState(true);
  const [errorCategorias, setErrorCategorias] = useState(null);

  const cargarCategorias = useCallback(async () => {
    try {
      setLoadingCategorias(true);
      setErrorCategorias(null);
      const data = await getCategorias();

      // Mapeamos los nombres devueltos por el backend y agregamos 'Todos' al inicio
      const listaNombres = ['Todos', ...data.map((cat) => cat.nombre_categoria)];
      setCategorias(listaNombres);
    } catch (err) {
      setErrorCategorias(err.message || 'Error al cargar categorías');
    } finally {
      setLoadingCategorias(false);
    }
  }, []);

  useEffect(() => {
    cargarCategorias();
  }, [cargarCategorias]);

  return {
    categorias,
    loadingCategorias,
    errorCategorias,
    recargarCategorias: cargarCategorias,
  };
}