
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

import { getVehiculos } from '../../../services/vehiculos.service.js';
import {
  obtenerNotificaciones,
} from '../../../services/notificaciones.service.js';

import VehicleCard from '../../../components/VehicleCard.js';
import DetalleVehiculoScreen from '../vehiculo/DetalleVehiculoScreen.js';
import { styles } from './InicioScreen.styles.js';

export default function InicioScreen({ navigation }) {
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState(null);
  const [notificacionesNoLeidas, setNotificacionesNoLeidas] = useState(0);

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

  const cargarContadorNotificaciones = useCallback(async () => {
    try {
      const resultado = await obtenerNotificaciones();

      const cantidad = Array.isArray(resultado?.notificaciones)
        ? resultado.notificaciones.filter(
          (item) => item.leido === false
        ).length
        : 0;

      setNotificacionesNoLeidas(cantidad);
    } catch (error) {
      console.error(
        'Error cargando contador de notificaciones:',
        error.message
      );
    }
  }, []);

  useEffect(() => {
    fetchVehiculosData();
  }, [fetchVehiculosData]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      cargarContadorNotificaciones();
    });

    return unsubscribe;
  }, [navigation, cargarContadorNotificaciones]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchVehiculosData();
    cargarContadorNotificaciones();
  };

  const handleBuscarAutos = () => {
    navigation.navigate('Vehículos');
  };

  const handleSelectVehiculo = (vehiculo) => {
    setVehiculoSeleccionado(vehiculo);
  };

  const handleNotificaciones = () => {
    navigation.navigate('Notificaciones');
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
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#E53935']}
          />
        }
      >
        {/* Encabezado */}
        <View style={styles.headerBar}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../../../assets/logo_titos.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          <TouchableOpacity
            style={styles.botonNotificaciones}
            onPress={handleNotificaciones}
            activeOpacity={0.7}
          >
            <Ionicons
              name="notifications-outline"
              size={27}
              color="#121212"
            />

            {notificacionesNoLeidas > 0 && (
              <View style={styles.contadorNotificaciones}>
                <Text style={styles.textoContador}>
                  {notificacionesNoLeidas > 99
                    ? '99+'
                    : notificacionesNoLeidas}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Tarjeta principal */}
        <View style={styles.heroCard}>
          <Text style={styles.heroSubtitle}>
            TITO'S RENT A CAR
          </Text>

          <Text style={styles.heroTitle}>
            Reserva Tu{'\n'}Auto Ideal
          </Text>

          <Text style={styles.heroDescription}>
            Encuentra el vehículo perfecto para tu viaje
          </Text>

          <TouchableOpacity
            style={styles.locationInputContainer}
            activeOpacity={0.8}
          >
            <Ionicons
              name="location-outline"
              size={20}
              color="#E53935"
            />
            <Text style={styles.locationInputValue}>
              Juigalpa, Chontales
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.searchButton}
            activeOpacity={0.9}
            onPress={handleBuscarAutos}
          >
            <Text style={styles.searchButtonText}>
              BUSCAR AUTOS
            </Text>
          </TouchableOpacity>
        </View>

        {/* Vehículos destacados */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            Vehículos destacados
          </Text>

          <TouchableOpacity
            onPress={handleBuscarAutos}
            activeOpacity={0.6}
          >
            <Text style={styles.seeAllText}>
              Ver todos
            </Text>
          </TouchableOpacity>
        </View>

        {/* Carrusel de vehículos */}
        {vehiculos.length > 0 ? (
          <FlatList
            horizontal
            data={vehiculos}
            keyExtractor={(item) => item.id}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carouselContainer}
            snapToInterval={280 + 16}
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
            <Text style={styles.emptyText}>
              No hay vehículos disponibles en este momento.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Modal del detalle del vehículo */}
      <Modal
        visible={vehiculoSeleccionado !== null}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setVehiculoSeleccionado(null)}
      >
        <DetalleVehiculoScreen
          route={{
            params: {
              vehiculo: vehiculoSeleccionado,
            },
          }}
          navigation={{
            goBack: () => setVehiculoSeleccionado(null),
          }}
        />
      </Modal>
    </SafeAreaView>
  );
}
