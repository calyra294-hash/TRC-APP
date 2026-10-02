const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';

export const getVehiculos = async () => {
  try {
    const response = await fetch(`${API_URL}/vehiculos`);
    
    if (!response.ok) {
      throw new Error(`Error en la petición: ${response.status}`);
    }

    const json = await response.json();
    const dataCruda = json.data || json;

    const vehiculosMapeados = dataCruda.map((item) => {
      let specs = {};
      if (item.detalles_tecnicos) {
        if (typeof item.detalles_tecnicos === 'string') {
          try {
            specs = JSON.parse(item.detalles_tecnicos);
          } catch (e) {
            specs = {};
          }
        } else {
          specs = item.detalles_tecnicos;
        }
      }

      // Separamos marca y modelo de forma segura si vienen unidos o separados
      const marca = item.marca || (item.nombre ? item.nombre.split(' ')[0] : 'Vehículo');
      const modelo = item.modelo || (item.nombre ? item.nombre.split(' ').slice(1).join(' ') : '');

      return {
        // IDs y metadatos generales
        id: String(item.id_coche || item.id),
        id_coche: item.id_coche || item.id,
        marca: marca,
        modelo: modelo,
        nombre: item.nombre || `${marca} ${modelo}`.trim(),
        anio: item.anio || 2023,
        placa: item.placa || 'S/N',
        color: item.color || 'No especificado',
        categoria: item.categoria || item.categorias?.nombre_categoria || '4x4',
        categoria_nombre: item.categoria || item.categorias?.nombre_categoria || '4x4',
        
        // Precios e imágenes (mantenemos ambas nomenclaturas para compatibilidad total)
        precio: parseFloat(item.valor_dia || item.precio) || 0,
        valor_dia: parseFloat(item.valor_dia || item.precio) || 0,
        imagen: item.url_imagen || item.imagen,
        url_imagen: item.url_imagen || item.imagen,
        
        estado: item.estado || 'Disponible',
        descripcion: item.descripcion || `Vehículo ${marca} ${modelo} disponible para alquiler con máxima comodidad y rendimiento.`,
        
        // Especificaciones técnicas normalizadas
        detalles_tecnicos: specs,
        pasajeros: specs.pasajeros ?? item.pasajeros ?? 5,
        transmision: specs.transmision || item.transmision || 'Manual',
        combustible: specs.combustible || item.combustible || 'Gasolina',
        maletero: specs.maletero || specs.capacidad_maletero || '850L',
        equipamiento: Array.isArray(specs.equipamiento) ? specs.equipamiento : []
      };
    });

    return vehiculosMapeados;
  } catch (error) {
    console.error('Error al consumir /vehiculos:', error);
    throw error;
  }
};