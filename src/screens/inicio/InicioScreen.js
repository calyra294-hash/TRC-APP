import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  StatusBar,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getVehiculos } from '../../services/vehiculos.service.js';
import VehicleCard from '../../components/VehicleCard.js';
import DetalleVehiculoScreen from '../DetalleVehiculoScreen.js';
import { styles } from './InicioScreen.styles';

export default function InicioScreen({ navigation }) {
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Estado para controlar el modal del vehículo seleccionado (mismo patrón que VehiculosScreen)
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState(null);

  const fetchVehiculosData = useCallback(async () => {
    try {
      const data = await getVehiculos();
      setVehiculos(data);
    } catch (error) {
      console.error('Error cargando vehículos en InicioScreen:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchVehiculosData();
  }, [fetchVehiculosData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchVehiculosData();
  };

  // Redirige al Tab de Vehículos al presionar "Buscar Autos" o "Ver todos"
  const handleBuscarAutos = () => {
    navigation.navigate('Vehículos');
  };

  // Abre el modal flotante con el vehículo seleccionado desde el carrusel
  const handleSelectVehiculo = (vehiculo) => {
    setVehiculoSeleccionado(vehiculo);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#E53935" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8F9FA" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#E53935']} />
        }
      >
        {/* Top Header / App Bar */}
        <View style={styles.headerBar}>
          <View style={styles.logoContainer}>
            <Image 
              source={require('../../../assets/logo_titos.png')} 
              style={styles.logoImage} 
              resizeMode="contain" 
            />
          </View>
        </View>

        {/* Hero Card / Formulario de Búsqueda y Reserva */}
        <View style={styles.heroCard}>
          <Text style={styles.heroSubtitle}>TITO'S RENT A CAR</Text>
          <Text style={styles.heroTitle}>Reserva Tu{'\n'}Auto Ideal</Text>
          <Text style={styles.heroDescription}>
            Encuentra el vehículo perfecto para tu viaje
          </Text>

          {/* Selector de Ubicación */}
          <TouchableOpacity style={styles.locationInputContainer} activeOpacity={0.8}>
            <Ionicons name="location-outline" size={20} color="#E53935" />
            <Text style={styles.locationInputValue}>Juigalpa, Chontales</Text>
          </TouchableOpacity>

          {/* Botón Principal -> Redirige a Vehículos */}
          <TouchableOpacity
            style={styles.searchButton}
            activeOpacity={0.9}
            onPress={handleBuscarAutos}
          >
            <Text style={styles.searchButtonText}>BUSCAR AUTOS</Text>
          </TouchableOpacity>
        </View>

        {/* Sección: Vehículos Destacados */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Vehículos destacados</Text>
          <TouchableOpacity onPress={handleBuscarAutos} activeOpacity={0.6}>
            <Text style={styles.seeAllText}>Ver todos</Text>
          </TouchableOpacity>
        </View>

        {/* Carrusel Horizontal de Tarjetas de Vehículos */}
        {vehiculos.length > 0 ? (
          <FlatList
            horizontal
            data={vehiculos}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carouselContainer}
            snapToInterval={280 + 16} // Ancho de tarjeta (estimado) + margen
            decelerationRate="fast"
            renderItem={({ item }) => (
              <View style={styles.cardWrapper}>
                <VehicleCard
                  vehiculo={item}
                  onSelect={handleSelectVehiculo}
                />
              </View>
            )}
          />
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No hay vehículos disponibles en este momento.</Text>
          </View>
        )}
      </ScrollView>

      {/* Modal Superpuesto para el Detalle del Vehículo */}
      <Modal
        visible={vehiculoSeleccionado !== null}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setVehiculoSeleccionado(null)}
      >
        <DetalleVehiculoScreen
          route={{ params: { vehiculo: vehiculoSeleccionado } }}
          navigation={{
            goBack: () => setVehiculoSeleccionado(null),
          }}
        />
      </Modal>
    </SafeAreaView>
  );
}