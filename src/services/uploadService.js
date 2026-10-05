import { supabase } from '../config/supabase';

/**
 * Sube una imagen directamente al Bucket de Supabase Storage usando APIs nativas.
 * @param {string} uri - URI local de la imagen obtenida con expo-image-picker.
 * @param {string} folder - Carpeta o prefijo dentro del bucket (ej: 'cedulas').
 * @returns {Promise<string>} La URL pública de la imagen almacenada.
 */
export const subirImagenASupabase = async (uri, folder = 'perfiles') => {
  try {
    if (!uri) return null;

    // Si ya es una URL web, significa que no es local y no se sube de nuevo
    if (uri.startsWith('http://') || uri.startsWith('https://')) {
      return uri;
    }

    // 1. Extraer la extensión del archivo
    const uriParts = uri.split('.');
    const fileExtension = uriParts[uriParts.length - 1] || 'jpg';
    
    // 2. Generar un nombre único aleatorio
    const randomString = Math.random().toString(36).substring(2, 7);
    const fileName = `${folder}/${Date.now()}_${randomString}.${fileExtension}`;

    // 3. Convertir la URI local a Blob usando fetch (Nativo en RN)
    const response = await fetch(uri);
    const blob = await response.blob();

    // 4. Subir directamente el Blob a Supabase Storage sin necesidad de buffers intermedios
    const { data, error } = await supabase.storage
      .from('documentos_usuarios')
      .upload(fileName, blob, {
        contentType: `image/${fileExtension === 'png' ? 'png' : 'jpeg'}`,
        upsert: false,
      });

    if (error) {
      throw new Error(`Error en Supabase Storage: ${error.message}`);
    }

    // 5. Obtener la URL pública del archivo recién subido
    const { data: publicURLData } = supabase.storage
      .from('documentos_usuarios')
      .getPublicUrl(data.path);

    return publicURLData.publicUrl;
  } catch (error) {
    console.error('Error al subir imagen a Supabase Storage:', error);
    throw new Error('No se pudo completar la subida de la imagen.');
  }
};