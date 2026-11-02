import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../path-to-your-firebase-config'; // Ajusta la ruta a tu config de Firebase

export default function LiveTrackingMap({ idAlquiler = 'Lmya915bJYdGXZL5w6a' }) {
  const [locationData, setLocationData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!idAlquiler) return;

    // Conexión en tiempo real con Firestore
    const docRef = doc(db, 'ubicaciones_tiempo_real', idAlquiler);
    
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setLocationData(docSnap.data());
      }
      setLoading(false);
    }, (error) => {
      console.error('Error al escuchar la ubicación:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [idAlquiler]);

  if (loading) {
    return (
      <View style={styles.cardContainer}>
        <ActivityIndicator size="small" color="#333" />
        <Text style={styles.loadingText}>Cargando mapa en tiempo real...</Text>
      </View>
    );
  }

  // Coordenadas seguras por defecto si el documento viene vacío
  const latitude = locationData?.latitud ? parseFloat(locationData.latitud) : 12.1364;
  const longitude = locationData?.longitud ? parseFloat(locationData.longitud) : -86.2514;

  return (
    <View style={styles.cardContainer}>
      <Text style={styles.cardTitle}>Ubicación Actual del Vehículo</Text>
      
      <View style={styles.mapWrapper}>
        <MapView
          style={styles.map}
          region={{
            latitude,
            longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
        >
          {locationData?.latitud && locationData?.longitud && (
            <Marker
              coordinate={{ latitude, longitude }}
              title="Vehículo en alquiler"
              description={locationData?.direccion_texto || 'En ruta'}
            />
          )}
        </MapView>
      </View>

      <Text style={styles.cardFooter}>
        {locationData?.direccion_texto || 'Sincronizando coordenadas GPS...'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 12,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  mapWrapper: {
    height: 220, // Cuadro limpio con altura controlada
    borderRadius: 10,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  cardFooter: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
  },
  loadingText: {
    marginTop: 6,
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});
