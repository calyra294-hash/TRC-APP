
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

const FILTROS_INICIALES = {
  transmision: 'Todas',
  combustible: 'Todos',
  pasajeros: 'Todos',
  precioMin: '',
  precioMax: '',
};

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

  const [modalFiltrosVisible, setModalFiltrosVisible] = useState(false);
  const [filtrosAplicados, setFiltrosAplicados] = useState(FILTROS_INICIALES);
  const [filtrosTemporales, setFiltrosTemporales] = useState(FILTROS_INICIALES);

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

      const coincideBusqueda =
        !query ||
        campos.some((campo) =>
          String(campo || '').toLowerCase().includes(query)
        );

      const transmision = String(item.transmision || 'Manual')
        .trim()
        .toLowerCase();

      const combustible = String(item.combustible || 'Gasolina')
        .trim()
        .toLowerCase();

      const pasajeros = Number(item.pasajeros || 5);
      const precio = Number(item.precio ?? item.valor_dia ?? 0);

      const coincideTransmision =
        filtrosAplicados.transmision === 'Todas' ||
        transmision.includes(filtrosAplicados.transmision.toLowerCase());

      const coincideCombustible =
        filtrosAplicados.combustible === 'Todos' ||
        combustible.includes(filtrosAplicados.combustible.toLowerCase());

      const coincidePasajeros =
        filtrosAplicados.pasajeros === 'Todos' ||
        pasajeros === Number(filtrosAplicados.pasajeros);

      const precioMin = filtrosAplicados.precioMin.trim() === ''
        ? null
        : Number(filtrosAplicados.precioMin);

      const precioMax = filtrosAplicados.precioMax.trim() === ''
        ? null
        : Number(filtrosAplicados.precioMax);

      const coincidePrecioMin =
        precioMin === null || precio >= precioMin;

      const coincidePrecioMax =
        precioMax === null || precio <= precioMax;

      return (
        coincideBusqueda &&
        coincideTransmision &&
        coincideCombustible &&
        coincidePasajeros &&
        coincidePrecioMin &&
        coincidePrecioMax
      );
    });
  }, [vehiculos, busqueda, filtrosAplicados]);

  const actualizarFiltro = (campo, valor) => {
    setFiltrosTemporales((actuales) => ({
      ...actuales,
      [campo]: valor,
    }));
  };

  const abrirFiltros = () => {
    setFiltrosTemporales({ ...filtrosAplicados });
    setModalFiltrosVisible(true);
  };

  const aplicarFiltros = () => {
    setFiltrosAplicados({ ...filtrosTemporales });
    setModalFiltrosVisible(false);
  };

  const limpiarFiltros = () => {
    setFiltrosTemporales({ ...FILTROS_INICIALES });
    setFiltrosAplicados({ ...FILTROS_INICIALES });
  };

  const filtrosActivos =
    filtrosAplicados.transmision !== 'Todas' ||
    filtrosAplicados.combustible !== 'Todos' ||
    filtrosAplicados.pasajeros !== 'Todos' ||
    filtrosAplicados.precioMin !== '' ||
    filtrosAplicados.precioMax !== '';

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
        {error ? 'Error de conexión' : 'No se encontraron vehículos'}
      </Text>

      <Text style={styles.emptySubtitle}>
        {error || 'Prueba cambiando la búsqueda o los filtros.'}
      </Text>

      {filtrosActivos && (
        <TouchableOpacity
          style={styles.clearEmptyButton}
          onPress={limpiarFiltros}
        >
          <Text style={styles.clearEmptyButtonText}>
            Limpiar filtros
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderOption = (campo, opciones, valorActual) => (
    <View style={styles.optionsContainer}>
      {opciones.map((opcion) => {
        const seleccionado = valorActual === opcion;

        return (
          <TouchableOpacity
            key={opcion}
            activeOpacity={0.8}
            onPress={() => actualizarFiltro(campo, opcion)}
            style={[
              styles.optionChip,
              seleccionado && styles.optionChipActive,
            ]}
          >
            <Text
              style={[
                styles.optionChipText,
                seleccionado && styles.optionChipTextActive,
              ]}
            >
              {opcion}
            </Text>
          </TouchableOpacity>
        );
      })}
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
              style={[
                styles.filterButton,
                filtrosActivos && styles.filterButtonActive,
              ]}
              activeOpacity={0.8}
              onPress={abrirFiltros}
            >
              <Ionicons
                name="options-outline"
                size={18}
                color="#D31A24"
              />

              <Text style={styles.filterButtonText}>Filtros</Text>

              {filtrosActivos && (
                <View style={styles.filterIndicator} />
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.categoryHeader}>
            <Text style={styles.categoryTitle}>Categorías</Text>
            <Text style={styles.categorySubtitle}>
              Explora nuestra selección
            </Text>
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
              const idCoche = String(item.id_coche || item.id || '');

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
          visible={modalFiltrosVisible}
          animationType="slide"
          transparent
          onRequestClose={() => setModalFiltrosVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.filterModal}>
              <View style={styles.modalHandle} />

              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>Filtrar vehículos</Text>
                  <Text style={styles.modalSubtitle}>
                    Encuentra lo que necesitas
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setModalFiltrosVisible(false)}
                >
                  <Ionicons name="close" size={22} color="#333333" />
                </TouchableOpacity>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.modalContent}
                keyboardShouldPersistTaps="handled"
              >
                <View style={styles.filterSection}>
                  <View style={styles.filterSectionTitleRow}>
                    <Ionicons name="settings-outline" size={18} color="#D31A24" />
                    <Text style={styles.filterSectionTitle}>
                      Transmisión
                    </Text>
                  </View>

                  {renderOption(
                    'transmision',
                    ['Todas', 'Automática', 'Manual'],
                    filtrosTemporales.transmision
                  )}
                </View>

                <View style={styles.filterSection}>
                  <View style={styles.filterSectionTitleRow}>
                    <Ionicons name="speedometer-outline" size={18} color="#D31A24" />
                    <Text style={styles.filterSectionTitle}>
                      Combustible
                    </Text>
                  </View>

                  {renderOption(
                    'combustible',
                    ['Todos', 'Gasolina', 'Diésel'],
                    filtrosTemporales.combustible
                  )}
                </View>

                <View style={styles.filterSection}>
                  <View style={styles.filterSectionTitleRow}>
                    <Ionicons name="people-outline" size={18} color="#D31A24" />
                    <Text style={styles.filterSectionTitle}>
                      Capacidad de pasajeros
                    </Text>
                  </View>

                  {renderOption(
                    'pasajeros',
                    ['Todos', '2', '5', '7'],
                    filtrosTemporales.pasajeros
                  )}
                </View>

                <View style={styles.filterSection}>
                  <View style={styles.filterSectionTitleRow}>
                    <Ionicons name="cash-outline" size={18} color="#D31A24" />
                    <Text style={styles.filterSectionTitle}>
                      Precio por día
                    </Text>
                  </View>

                  <View style={styles.priceInputsRow}>
                    <View style={styles.priceInputContainer}>
                      <Text style={styles.priceInputLabel}>Mínimo</Text>
                      <TextInput
                        style={styles.priceInput}
                        placeholder="C$ 0"
                        placeholderTextColor="#A0A0A0"
                        keyboardType="numeric"
                        value={filtrosTemporales.precioMin}
                        onChangeText={(value) =>
                          actualizarFiltro('precioMin', value.replace(/[^0-9]/g, ''))
                        }
                      />
                    </View>

                    <View style={styles.priceInputContainer}>
                      <Text style={styles.priceInputLabel}>Máximo</Text>
                      <TextInput
                        style={styles.priceInput}
                        placeholder="Sin límite"
                        placeholderTextColor="#A0A0A0"
                        keyboardType="numeric"
                        value={filtrosTemporales.precioMax}
                        onChangeText={(value) =>
                          actualizarFiltro('precioMax', value.replace(/[^0-9]/g, ''))
                        }
                      />
                    </View>
                  </View>
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.clearButton}
                  onPress={limpiarFiltros}
                  activeOpacity={0.8}
                >
                  <Text style={styles.clearButtonText}>Limpiar</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.applyButton}
                  onPress={aplicarFiltros}
                  activeOpacity={0.8}
                >
                  <Text style={styles.applyButtonText}>
                    Aplicar filtros
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

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
