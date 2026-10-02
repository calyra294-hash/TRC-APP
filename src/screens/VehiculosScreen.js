import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, FlatList, 
  ScrollView, ActivityIndicator, Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import VehicleCard from '../components/VehicleCard';
import DetalleVehiculoScreen from './DetalleVehiculoScreen'; // 1. Importas tu vista por aparte
import { useVehiculos, useCategorias } from '../hooks';
import { styles } from './VehiculosScreen.styles.js';

const e = React.createElement;

export default function VehiculosScreen({ navigation }) {
  const { 
    vehiculos, 
    loading, 
    error, 
    categoriaActiva, 
    setCategoriaActiva, 
    refrescar 
  } = useVehiculos();

  const { categorias, loadingCategorias } = useCategorias();
  const [vehiculoSeleccionado, setVehiculoSeleccionado] = useState(null);

  const handleSeleccionarVehiculo = (vehiculo) => {
    setVehiculoSeleccionado(vehiculo);
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="car-outline" size={64} color="#D1D5DB" />
      <Text style={styles.emptyTitle}>
        {error ? 'Error de conexión' : 'No hay vehículos disponibles'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {error ? error : 'Intenta cambiando los filtros o vuelve más tarde.'}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Encabezado fijo */}
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Vehículos</Text>

          {/* Búsqueda y Filtros */}
          <View style={styles.searchRow}>
            <View style={styles.searchBar}>
              <Ionicons name="search-outline" size={20} color="#9CA3AF" />
              <TextInput
                placeholder="Buscar vehículo..."
                placeholderTextColor="#9CA3AF"
                style={styles.searchInput}
              />
            </View>
            <TouchableOpacity style={styles.filterButton}>
              <Ionicons name="options-outline" size={18} color="#E53935" />
              <Text style={styles.filterButtonText}>Filtros</Text>
            </TouchableOpacity>
          </View>

          {/* Chips de Categorías dinámicos */}
          {loadingCategorias ? (
            <ActivityIndicator size="small" color="#E53935" style={{ paddingVertical: 12 }} />
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesScroll}
            >
              {categorias.map((cat) => {
                const isSelected = categoriaActiva === cat;
                return (
                  <TouchableOpacity
                    key={cat}
                    onPress={() => setCategoriaActiva(cat)}
                    style={[styles.chip, isSelected && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, isSelected && styles.chipTextActive]}>
                      {cat}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}
        </View>

        {/* Lista de Vehículos */}
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#E53935" />
          </View>
        ) : (
          <FlatList
            data={vehiculos}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item }) => (
              <VehicleCard 
                vehiculo={item} 
                onSelect={handleSeleccionarVehiculo} 
              />
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderEmptyState}
            onRefresh={refrescar}
            refreshing={loading}
          />
        )}

        {/* 4. El Modal superpuesto que carga tu vista por aparte */}
        <Modal
          visible={vehiculoSeleccionado !== null}
          animationType="slide"
          transparent={false}
          onRequestClose={() => setVehiculoSeleccionado(null)}
        >
          <DetalleVehiculoScreen
            route={{ params: { vehiculo: vehiculoSeleccionado } }}
            navigation={{
              goBack: () => setVehiculoSeleccionado(null)
            }}
          />
        </Modal>

      </View>
    </SafeAreaView>
  );
}