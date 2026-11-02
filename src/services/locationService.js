import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import * as Location from 'expo-location';
import { db } from '../config/firebase.js';

let locationSubscription = null;

/**
 * Inicia el rastreo GPS en tiempo real y actualiza el documento en Firestore.
 * @param {string} idAlquiler - ID del alquiler actual (actúa como ID del documento).
 * @param {function} [onLocationUpdate] - Callback opcional por si la UI local quiere enterarse de los cambios.
 */
export const startLocationTracking = async (idAlquiler, onLocationUpdate) => {
  try {
    // 1. Solicitar permisos de ubicación en primer plano (y opcionalmente fondo)
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.warn('Permiso de ubicación denegado por el usuario.');
      return false;
    }

    // Si ya había una suscripción activa previa, la limpiamos para evitar fugas de memoria
    if (locationSubscription) {
      locationSubscription.remove();
    }

    // 2. Configurar el watcher de posición de Expo
    // Optimizamos para que no dispare por cualquier micro-movimiento, 
    // sino cada vez que se mueva al menos 15 metros o pasen 10 segundos.
    locationSubscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        distanceInterval: 15, // metros mínimos de cambio
        timeInterval: 10000,  // milisegundos mínimos (10s)
      },
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        const payload = {
          id_alquiler: idAlquiler,
          id_usuario: idUsuario || '',
          latitud: latitude.toString(),
          longitud: longitude.toString(),
          direccion_texto: '', // Opcional: podrías llenarlo con geocodificación inversa si lo requieres
          ultima_actualizacion: serverTimestamp(),
          instrucciones_entrega: instruccionesEntrega || ''
        };

        try {
          // 3. Escritura directa en Firestore usando el id_alquiler como ID del documento
          // Usamos setDoc con { merge: true } para sobrescribir la posición eficientemente
          const docRef = doc(db, 'ubicaciones_tiempo_real', idAlquiler);
          await setDoc(docRef, payload, { merge: true });

          // Si el componente local requiere la posición para centrar el mapa, ejecutamos el callback
          if (onLocationUpdate) {
            onLocationUpdate({ latitude, longitude });
          }
        } catch (firestoreError) {
          console.error('Error al sincronizar la ubicación con Firestore:', firestoreError);
        }
      }
    );

    console.log(`Rastreo de ubicación iniciado para el alquiler: ${idAlquiler}`);
    return true;
  } catch (error) {
    console.error('Error al iniciar el rastreo de ubicación:', error);
    return false;
  }
};

/**
 * Detiene el rastreo GPS (ideal para cuando se devuelve el vehículo mediante QR).
 */
export const stopLocationTracking = () => {
  if (locationSubscription) {
    locationSubscription.remove();
    locationSubscription = null;
    console.log('Rastreo de ubicación detenido correctamente.');
  }
};
