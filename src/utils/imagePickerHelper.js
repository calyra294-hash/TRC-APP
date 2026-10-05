import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';

/**
 * Permite seleccionar una imagen desde la galería o cámara y la comprime
 * para optimizar el consumo de ancho de banda.
 * @param {'camera' | 'library'} source - Fuente de la imagen
 * @returns {Promise<string | null>} URI local de la imagen optimizada
 */
export const seleccionarYComprimirImagen = async (source = 'library') => {
  try {
    // 1. Solicitar permisos
    if (source === 'camera') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Se requiere permiso para acceder a la cámara.');
      }
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Se requiere permiso para acceder a la galería.');
      }
    }

    // 2. Abrir Selector / Cámara
    const result = source === 'camera'
      ? await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 1,
        })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [4, 3],
          quality: 1,
        });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const asset = result.assets[0];

    // 3. Compresión y reescalado inteligente (Max 1024px de ancho)
    const manipulatedImage = await ImageManipulator.manipulateAsync(
      asset.uri,
      [{ resize: { width: 1024 } }], 
      { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG } 
    );

    // 💡 Retornamos la URI del archivo temporal comprimido (ej: file:///.../cache/ImageManipulator/xyz.jpg)
    return manipulatedImage.uri;
  } catch (error) {
    console.error('Error en seleccionarYComprimirImagen:', error);
    throw error;
  }
};