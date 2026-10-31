
import React, { useMemo, useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import VehicleCard from '../../../components/VehicleCard.js';
import DetalleVehiculoScreen from './DetalleVehiculoScreen.js';
import { useVehiculos, useCategorias } from '../../../hooks/index.js';
import { getDisponibilidadVehiculos } from '../../../services/alquileres.service.js';
import { styles } from './VehiculosScreen.styles.js';

export default function VehiculosScreen({ navigation }) {
  const {
    vehiculos,
    loading,
    error,
    categoriaActiva,
    setCategoriaActiva,
    refrescar,
  } = useVehiculos();

  const { categorias, loadingCategorias } = useCategorias();

  const [busqueda, setBusqueda] = useState('');
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState(null);
  const [disponibilidades, setDisponibilidades] = useState([]);
  const [loadingDisponibilidad, setLoadingDisponibilidad] = useState(true);

  const cargarDisponibilidad = useCallback(async () => {
    try {
      setLoadingDisponibilidad(true);

      const datos = await getDisponibilidadVehiculos();

      setDisponibilidades(Array.isArray(datos) ? datos : []);
    } catch (error) {
      console.error('Error cargando disponibilidad:', error);
      setDisponibilidades([]);
    } finally {
      setLoadingDisponibilidad(false);
    }
  }, []);

  useEffect(() => {
    cargarDisponibilidad();
  }, [cargarDisponibilidad]);

  const disponibilidadesPorVehiculo = useMemo(() => {
    const mapa = {};

    disponibilidades.forEach((item) => {
      mapa[String(item.id_coche)] = item;
    });

    return mapa;
  }, [disponibilidades]);

  const vehiculosFiltrados = useMemo(() => {
    if (!vehiculos) return [];

    const query = busqueda.toLowerCase().trim();

    if (!query) return vehiculos;

    return vehiculos.filter((item) => {
      const campos = [
        item.marca,
        item.modelo,
        item.nombre,
        item.categoria,
        item.categoria_nombre,
        item.color,
        item.transmision,
        item.combustible,
      ];

      return campos.some((campo) =>
        String(campo || '').toLowerCase().includes(query)
      );
    });
  }, [vehiculos, busqueda]);

  const handleSeleccionarVehiculo = (vehiculo) => {
    setVehiculoSeleccionado(vehiculo);
  };

  const handleActualizar = async () => {
    await Promise.all([
      Promise.resolve(refrescar()),
      cargarDisponibilidad(),
    ]);
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="car-outline" size={64} color="#D1D5DB" />

      <Text style={styles.emptyTitle}>
        {error ? 'Error de conexión' : 'No hay vehículos disponibles'}
      </Text>

      <Text style={styles.emptySubtitle}>
        {error || 'Intenta cambiando los filtros o vuelve más tarde.'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          <View style={styles.headerIntro}>
            <Text style={styles.eyebrow}>TITO'S RENT A CAR</Text>

            <Text style={styles.title}>Encuentra tu vehículo</Text>

            <Text style={styles.subtitle}>
              Elegí el vehículo ideal para tu próximo viaje.
            </Text>
          </View>

          <View style={styles.searchRow}>
            <View style={styles.searchBar}>
              <Ionicons name="search-outline" size={20} color="#9CA3AF" />

              <TextInput
                placeholder="Buscar vehículo..."
                placeholderTextColor="#9CA3AF"
                style={styles.searchInput}
                value={busqueda}
                onChangeText={setBusqueda}
                clearButtonMode="while-editing"
              />
            </View>

            <TouchableOpacity
              style={styles.filterButton}
              activeOpacity={0.8}
            >
              <Ionicons name="options-outline" size={18} color="#D31A24" />
              <Text style={styles.filterButtonText}>Filtros</Text>
            </TouchableOpacity>
          </View>

          

          {loadingCategorias ? (
            <ActivityIndicator
              size="small"
              color="#D31A24"
              style={{ paddingVertical: 12 }}
            />
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesScroll}
            >
              {(categorias || []).map((cat) => {
                const isSelected = categoriaActiva === cat;

                return (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setCategoriaActiva(cat)}
                    activeOpacity={0.8}
                    style={[
                      styles.chip,
                      isSelected && styles.chipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        isSelected && styles.chipTextActive,
                      ]}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}

          
        </View>

        {loading || loadingDisponibilidad ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#D31A24" />

            <Text style={styles.loadingText}>
              Cargando vehículos y disponibilidad...
            </Text>
          </View>
        ) : (
          <FlatList
            data={vehiculosFiltrados}
            keyExtractor={(item, index) =>
              String(item.id_coche || item.id || index)
            }
            renderItem={({ item }) => {
              const idCoche = String(
                item.id_coche || item.id || ''
              );

              return (
                <VehicleCard
                  vehiculo={item}
                  disponibilidad={
                    disponibilidadesPorVehiculo[idCoche] || null
                  }
                  onSelect={handleSeleccionarVehiculo}
                />
              );
            }}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderEmptyState}
            onRefresh={handleActualizar}
            refreshing={loading || loadingDisponibilidad}
          />
        )}

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
      </View>
    </SafeAreaView>
  );
}
