import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import VehicleCard from '../components/VehicleCard';

// MOCK DATA (Pruébalo vaciando este arreglo [] para testear el estado sin datos)
const VEHICULOS_DATA = [
  {
    id: '1',
    nombre: 'Toyota Hilux 4x4',
    categoria: '4x4',
    rating: 4.8,
    resenas: 124,
    precio: 85,
    pasajeros: 5,
    transmision: 'Manual',
    combustible: 'Diésel',
    imagen: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=800',
  },
  {
    id: '2',
    nombre: 'Suzuki Alto',
    categoria: 'Económico',
    rating: 4.5,
    resenas: 89,
    precio: 25,
    pasajeros: 4,
    transmision: 'Manual',
    combustible: 'Gasolina',
    imagen: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=800',
  },
];

const CATEGORIAS = ['Todos', 'Económico', 'Sedán', 'SUV', '4x4'];

export default function VehiculosScreen() {
  const [categoriaActiva, setCategoriaActiva] = useState('Todos');
  const [vehiculos, setVehiculos] = useState(VEHICULOS_DATA);

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="car-outline" size={64} color="#D1D5DB" />
      <Text style={styles.emptyTitle}>No hay vehículos disponibles</Text>
      <Text style={styles.emptySubtitle}>Intenta cambiando los filtros o vuelve más tarde.</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        
        {/* Encabezado fijo de la lista */}
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Vehículos</Text>

          {/* Barra de Búsqueda y Filtros */}
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

          {/* Chips de Categorías (Scroll Horizontal) */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
          >
            {CATEGORIAS.map((cat) => {
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
        </View>

        {/* Lista Rendimiento Óptimo */}
        <FlatList
          data={vehiculos}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <VehicleCard vehiculo={item} onSelect={(v) => console.log('Seleccionado:', v.nombre)} />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
        />

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  searchRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#E53935',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    gap: 6,
  },
  filterButtonText: {
    color: '#E53935',
    fontWeight: 'bold',
    fontSize: 14,
  },
  categoriesScroll: {
    gap: 8,
    paddingBottom: 16,
  },
  chip: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
  },
  chipActive: {
    backgroundColor: '#E53935',
  },
  chipText: {
    color: '#4B5563',
    fontWeight: '600',
    fontSize: 13,
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#374151',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
});